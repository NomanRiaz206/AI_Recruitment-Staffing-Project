from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ai_service import AIService
from app.models.models import JobPosting, User
from pydantic import BaseModel

router = APIRouter()
ai_service = AIService()

class SalaryRange(BaseModel):
    min: float
    max: float
    currency: str = "USD"

class JobPostingCreate(BaseModel):
    employer_id: int
    title: str
    description: str | None = None  # Make description optional for AI generation
    requirements: List[str]
    location: str
    salary_range: SalaryRange
    company_info: str  # Add company information for better job descriptions

class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    location: Optional[str] = None
    salary_range: Optional[SalaryRange] = None
    is_active: Optional[bool] = None

class JobPostingResponse(BaseModel):
    id: int
    employer_id: int
    title: str
    description: str
    requirements: List[str]
    location: str
    salary_range: Dict
    is_active: bool

    class Config:
        from_attributes = True

class GenerateDescriptionRequest(BaseModel):
    title: str
    requirements: List[str]
    company_info: str

class GenerateDescriptionResponse(BaseModel):
    description: str

@router.post("/", response_model=JobPostingResponse)
async def create_job_posting(
    job: JobPostingCreate,
    db: Session = Depends(get_db)
):
    """Create a new job posting with AI-enhanced content"""
    try:
        # Generate job description if not provided
        if not job.description:
            job.description = await ai_service.generate_job_description(
                title=job.title,
                requirements=job.requirements,
                company_info=job.company_info
            )
        
        # Check job posting with AI
        job_data = job.dict()
        filter_result = await ai_service.filter_job_posting(job_data)
        
        # If not compliant but has feedback, use the AI-generated description
        if not filter_result["is_compliant"] and "feedback" in filter_result:
            # Extract the job description from the feedback
            feedback_lines = filter_result["feedback"].split("\n")
            description_start = next(i for i, line in enumerate(feedback_lines) if "Overview:" in line)
            description_end = next(i for i, line in enumerate(feedback_lines) if "Feedback and Suggestions:" in line)
            job.description = "\n".join(feedback_lines[description_start:description_end]).strip()
        
        # Create job posting
        db_job = JobPosting(
            employer_id=job.employer_id,
            title=job.title,
            description=job.description,
            requirements=job.requirements,
            location=job.location,
            salary_range=job.salary_range.dict()
        )
        
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        return db_job
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/all")
async def get_all_jobs(
    db: Session = Depends(get_db)
):
    """Get all job postings for an employer"""
    jobs = db.query(JobPosting).all()
    return jobs


@router.get("/{job_id}")
async def get_job_posting(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Get job posting details"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return job

@router.get("/employer/{employer_id}")
async def get_employer_jobs(
    employer_id: int,
    db: Session = Depends(get_db)
):
    """Get all job postings for an employer"""
    jobs = db.query(JobPosting).filter(JobPosting.employer_id == employer_id).all()
    return jobs



@router.put("/{job_id}/deactivate")
async def deactivate_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Deactivate a job posting"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    job.is_active = False
    db.commit()
    db.refresh(job)
    return {"message": "Job posting deactivated successfully"}

@router.post("/generate-description", response_model=GenerateDescriptionResponse)
async def generate_job_description(
    request: GenerateDescriptionRequest,
    db: Session = Depends(get_db)
):
    """Generate a job description using AI"""
    try:
        description = await ai_service.generate_job_description(
            title=request.title,
            requirements=request.requirements,
            company_info=request.company_info
        )
        return {"description": description}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate job description: {str(e)}"
        )

@router.get("/", response_model=List[JobPostingResponse])
async def get_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all active job postings"""
    jobs = db.query(JobPosting).filter(JobPosting.is_active == True).offset(skip).limit(limit).all()
    return jobs 

@router.delete("/{job_id}")
async def delete_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

@router.put("/update/{job_id}", response_model=JobPostingResponse)
async def update_job_posting(
    job_id: int,
    job_update: JobPostingUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing job posting"""
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    # Update fields if provided
    if job_update.title is not None:
        job.title = job_update.title
    if job_update.description is not None:
        job.description = job_update.description
    if job_update.requirements is not None:
        job.requirements = job_update.requirements
    if job_update.location is not None:
        job.location = job_update.location
    if job_update.salary_range is not None:
        job.salary_range = job_update.salary_range.dict()
    if job_update.is_active is not None:
        job.is_active = job_update.is_active

    db.commit()
    db.refresh(job)
    return job
