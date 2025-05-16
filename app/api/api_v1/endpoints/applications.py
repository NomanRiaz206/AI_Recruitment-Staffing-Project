from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user
from app.services.ai_service import AIService
from app.models.models import Application, JobPosting, Candidate, User
from pydantic import BaseModel
from app.services.email_feature import send_email
from .email_template import candidate_application_template, employer_notification_template
from .contracts import generate_contract

router = APIRouter()
ai_service = AIService()

class ApplicationCreate(BaseModel):
    job_id: int

class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    requirements: List[str]
    employer_id: int

    class Config:
        from_attributes = True

class CandidateUserResponse(BaseModel):
    id: int
    email: str
    full_name: str

    class Config:
        from_attributes = True

class CandidateResponse(BaseModel):
    id: int
    user_id: int
    bio: str
    skills: List[str]
    experience: List[Dict]
    education: List[Dict]
    user: CandidateUserResponse

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: str
    ai_match_score: Optional[int]
    job: JobResponse
    candidate: CandidateResponse

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str
    
@router.post("/", response_model=ApplicationResponse)
async def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new job application"""
    # Check if job exists
    job = db.query(JobPosting).filter(JobPosting.id == application.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    # Get candidate profile
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    
    # Check if already applied
    existing_application = db.query(Application).filter(
        Application.job_id == application.job_id,
        Application.candidate_id == candidate.id
    ).first()
    if existing_application:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Calculate match score
    match_result = await ai_service.match_candidate_with_job(
        candidate_data={
            "bio": candidate.bio,
            "skills": candidate.skills,
            "experience": candidate.experience,
            "education": candidate.education
        },
        job_data={
            "title": job.title,
            "description": job.description,
            "requirements": job.requirements
        }
    )
    
    # Create application
    db_application = Application(
        job_id=application.job_id,
        candidate_id=candidate.id,
        status="pending",
        ai_match_score=match_result["score"]
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    #here email notification can be sent to the employer and candidate
    candidate_email_subject = "Your Job Application has been Successfully Submitted!"
    candidate_email_content = candidate_application_template(
    candidate_name=current_user.full_name,
    job_title=job.title,
    match_score=match_result["score"]
    )
    send_email(
        to_email=current_user.email,
        subject=candidate_email_subject,
        content=candidate_email_content
    )

    # Fetch employer details
    employer_user = db.query(User).filter(User.id == job.employer_id).first()

    # Send email to employer
    employer_email_subject = "New Candidate Applied for Your Job Posting"
    employer_email_content = employer_notification_template(
    employer_name=employer_user.full_name,
    candidate_name=current_user.full_name,
    job_title=job.title,
    match_score=match_result["score"]
    )
    send_email(
        to_email=employer_user.email,
        subject=employer_email_subject,
        content=employer_email_content
    )

    return db_application

@router.get("/candidate", response_model=List[ApplicationResponse])
async def get_candidate_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all applications for the current candidate"""
    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    
    applications = (
        db.query(Application)
        .join(JobPosting, Application.job_id == JobPosting.id)
        .join(Candidate, Application.candidate_id == Candidate.id)
        .join(User, Candidate.user_id == User.id)
        .filter(Application.candidate_id == candidate.id)
        .all()
    )
    return applications

@router.get("/employer/{job_id}", response_model=List[ApplicationResponse])
async def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all applications for a specific job posting"""
   # if not current_user.is_employer:
    #    raise HTTPException(status_code=403, detail="Not authorized")
    
    job = db.query(JobPosting).filter(
        JobPosting.id == job_id,
       # JobPosting.employer_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    applications = (
        db.query(Application)
        .join(JobPosting, Application.job_id == JobPosting.id)
        .join(Candidate, Application.candidate_id == Candidate.id)
        .join(User, Candidate.user_id == User.id)
        .filter(Application.job_id == job_id)
        .all()
    )
    return applications

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get application details"""
    # Get application with relationships
    application = (
        db.query(Application)
        .join(JobPosting, Application.job_id == JobPosting.id)
        .join(Candidate, Application.candidate_id == Candidate.id)
        .join(User, Candidate.user_id == User.id)
        .filter(Application.id == application_id)
        .first()
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Verify access rights (either the employer who owns the job or the candidate who applied)
    if not (
        (current_user.is_employer and current_user.id == application.job.employer_id) or
        (not current_user.is_employer and application.candidate.user_id == current_user.id)
    ):
        raise HTTPException(status_code=403, detail="Not authorized to view this application")
    
    return application

@router.put("/{application_id}/status")
async def update_application_status(
    application_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update application status (employer only)"""
    if not current_user.is_employer:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Verify employer owns the job posting
    job = db.query(JobPosting).filter(
        JobPosting.id == application.job_id,
        JobPosting.employer_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if status not in ["pending", "accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    application.status = status
    db.commit()
    db.refresh(application)
    return {"message": "Application status updated successfully"} 

@router.get("/employer", response_model=List[ApplicationResponse])
async def get_all_employer_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all applications for all job postings by current employer"""
    if not current_user.is_employer:
        raise HTTPException(status_code=403, detail="Not authorized")

    applications = (
        db.query(Application)
        .join(JobPosting, Application.job_id == JobPosting.id)
        .join(Candidate, Application.candidate_id == Candidate.id)
        .join(User, Candidate.user_id == User.id)
        .filter(JobPosting.employer_id == current_user.id)
        .all()
    )
    return applications

@router.post("/{application_id}/status")
async def accept_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = "accepted"
    db.commit()

    # Trigger contract generation
    contract = await generate_contract(db, application)

    # Send email to candidate
    await send_contract_email_to_candidate(contract)

    return {"message": "Application accepted and contract generated"}


