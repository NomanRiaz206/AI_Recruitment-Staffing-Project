from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ai_service import AIService
from app.models.models import Candidate, User
from app.api.deps import get_current_active_user
from pydantic import BaseModel
import logging

router = APIRouter()
ai_service = AIService()
logger = logging.getLogger(__name__)

class EducationBase(BaseModel):
    institution: str
    degree: str
    field: str
    year: int

class ExperienceBase(BaseModel):
    company: str
    position: str
    duration: str
    description: str

class CandidateCreate(BaseModel):
    user_id: int
    experience: List[ExperienceBase]
    education: List[EducationBase]
    skills: List[str]
    bio: str

class CandidateResponse(BaseModel):
    id: int
    user_id: int
    bio: str
    skills: List[str]
    experience: List[dict]
    education: List[dict]

    class Config:
        from_attributes = True

@router.post("/", response_model=CandidateResponse)
async def create_candidate(
    candidate: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create or update a candidate profile"""
    # Verify user is creating their own profile
    if candidate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create profile for another user")
    
    # Check if profile already exists
    existing_profile = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    
    if existing_profile:
        # Update existing profile
        existing_profile.bio = candidate.bio
        existing_profile.skills = candidate.skills
        existing_profile.experience = [exp.dict() for exp in candidate.experience]
        existing_profile.education = [edu.dict() for edu in candidate.education]
        db.commit()
        db.refresh(existing_profile)
        return existing_profile
    
    # Create new profile
    db_candidate = Candidate(
        user_id=current_user.id,
        bio=candidate.bio,
        skills=candidate.skills,
        experience=[exp.dict() for exp in candidate.experience],
        education=[edu.dict() for edu in candidate.education]
    )
    
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.get("/me", response_model=CandidateResponse)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's candidate profile"""
    profile = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/generate-bio")
async def generate_candidate_bio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a bio for the candidate using AI"""
    # Check if user is a candidate (not an employer)
    if current_user.is_employer:
        raise HTTPException(
            status_code=403,
            detail="Only candidates can generate bios"
        )
    
    # Get candidate profile
    profile = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Please create your profile before generating a bio"
        )
    
    # Validate required profile data
    if not profile.skills or len(profile.skills) == 0:
        raise HTTPException(
            status_code=400,
            detail="Please add at least one skill to your profile"
        )
    
    if not profile.experience or len(profile.experience) == 0:
        raise HTTPException(
            status_code=400,
            detail="Please add at least one work experience entry"
        )
    
    if not profile.education or len(profile.education) == 0:
        raise HTTPException(
            status_code=400,
            detail="Please add at least one education entry"
        )
    
    try:
        bio = await ai_service.generate_candidate_bio(
            experience=profile.experience,
            education=profile.education,
            skills=profile.skills
        )
        return {"bio": bio}
    except Exception as e:
        logger.error(f"Error generating bio: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate bio. Please try again later."
        )

@router.get("/{candidate_id}/match/{job_id}")
async def get_job_match(
    candidate_id: int,
    job_id: int,
    db: Session = Depends(get_db)
):
    """Get AI-powered match score between candidate and job"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # You would implement proper job fetching here
    job_data = {"id": job_id, "title": "Sample Job"}
    
    match_result = await ai_service.match_candidate_with_job(
        candidate_data={
            "bio": candidate.bio,
            "skills": candidate.skills,
            "experience": candidate.experience,
            "education": candidate.education
        },
        job_data=job_data
    )
    
    return match_result 