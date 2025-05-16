from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_active_user, get_current_employer
from app.services.ai_service import AIService
from app.models.models import Contract, Application, JobPosting, Candidate, User
from pydantic import BaseModel

router = APIRouter()
ai_service = AIService()

class ContractResponse(BaseModel):
    id: int
    application_id: int
    content: str
    status: str

    class Config:
        from_attributes = True

@router.post("/generate/{application_id}", response_model=ContractResponse)
async def generate_contract(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Generate a new contract for an accepted application"""
    # Get application
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status != "accepted":
        raise HTTPException(status_code=400, detail="Can only generate contracts for accepted applications")
    
    # Check if contract already exists
    existing_contract = db.query(Contract).filter(Contract.application_id == application_id).first()
    if existing_contract:
        raise HTTPException(status_code=400, detail="Contract already exists for this application")
    
    # Get job and candidate details
    job = db.query(JobPosting).filter(JobPosting.id == application.job_id).first()
    candidate = db.query(Candidate).filter(Candidate.id == application.candidate_id).first()
    
    # Verify employer owns the job posting
    if job.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Generate contract using AI
    contract_content = await ai_service.generate_contract(
        job_data={
            "title": job.title,
            "description": job.description,
            "requirements": job.requirements,
            "salary_range": job.salary_range,
            "location": job.location
        },
        candidate_data={
            "name": User.full_name,
            "bio": candidate.bio,
            "experience": candidate.experience,
            "education": candidate.education
        }
    )
    
    # Create contract
    contract = Contract(
        application_id=application_id,
        content=contract_content,
        status="draft"
    )
    
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract

@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get contract details"""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Verify access rights
    application = db.query(Application).filter(Application.id == contract.application_id).first()
    job = db.query(JobPosting).filter(JobPosting.id == application.job_id).first()
    candidate = db.query(Candidate).filter(Candidate.id == application.candidate_id).first()
    
    if not (current_user.id == job.employer_id or current_user.id == candidate.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return contract

@router.put("/{contract_id}/status")
async def update_contract_status(
    contract_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update contract status"""
    if status not in ["draft", "sent", "signed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Verify access rights
    application = db.query(Application).filter(Application.id == contract.application_id).first()
    job = db.query(JobPosting).filter(JobPosting.id == application.job_id).first()
    candidate = db.query(Candidate).filter(Candidate.id == application.candidate_id).first()
    
    if not (current_user.id == job.employer_id or current_user.id == candidate.user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Only employer can send contract
    if status == "sent" and not current_user.is_employer:
        raise HTTPException(status_code=403, detail="Only employers can send contracts")
    
    # Only candidate can sign contract
    if status == "signed" and current_user.id != candidate.user_id:
        raise HTTPException(status_code=403, detail="Only candidates can sign contracts")
    
    contract.status = status
    db.commit()
    db.refresh(contract)
    return {"message": "Contract status updated successfully"} 

@router.put("/{contract_id}/approve")
async def approve_contract_by_employer(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Employer approves/signs the contract"""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    application = db.query(Application).filter(Application.id == contract.application_id).first()
    job = db.query(JobPosting).filter(JobPosting.id == application.job_id).first()

    if job.employer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    contract.signed_by_employer = True
    if contract.signed_by_candidate:
        contract.status = "signed"

    db.commit()
    db.refresh(contract)
    return {"message": "Contract approved by employer"}

@router.put("/{contract_id}/sign")
async def sign_contract_by_candidate(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Candidate signs the contract"""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    application = db.query(Application).filter(Application.id == contract.application_id).first()
    candidate = db.query(Candidate).filter(Candidate.id == application.candidate_id).first()

    if current_user.id != candidate.user_id:
        raise HTTPException(status_code=403, detail="Only the assigned candidate can sign this contract")

    contract.signed_by_candidate = True
    if contract.signed_by_employer:
        contract.status = "signed"

    db.commit()
    db.refresh(contract)
    return {"message": "Contract signed by candidate"}
