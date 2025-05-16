from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.models import ContractTemplate, User
from app.api.deps import get_db, get_current_user
from app.services.ai_service import AIService
from pydantic import BaseModel

router = APIRouter()
ai_service = AIService()

# =============================
#         SCHEMAS
# =============================
class ContractTemplateCreate(BaseModel):
    name: str
    contract_title: str
    description: str

class ContractTemplateResponse(ContractTemplateCreate):
    id: int
    created_date: datetime
    author_id: int

    class Config:
        orm_mode = True

class GeneratePrompt(BaseModel):
    contract_title: str

# =============================
#        CRUD ROUTES
# =============================

@router.post("/create", response_model=ContractTemplateResponse, tags=["Contract Templates"])
def create_contract_template(

 #   post_data: ContractTemplateCreate,
  #  db: Session = Depends(get_db),
   # current_user: User = Depends(get_current_user)
        
):
    print("Inside /create route: ")
    return "tttttt"
    # contract = ContractTemplate(**data.dict(), author_id=current_user.id)
    # db.add(contract)
    # db.commit()
    # db.refresh(contract)
    # return contract

@router.get("/", response_model=List[ContractTemplateResponse])
def get_all_contracts(db: Session = Depends(get_db)):
    return db.query(ContractTemplate).order_by(ContractTemplate.id.desc()).all()

@router.get("/{template_id}", response_model=ContractTemplateResponse)
def get_contract_by_id(template_id: int, db: Session = Depends(get_db)):
    contract = db.query(ContractTemplate).filter(ContractTemplate.id == template_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract template not found")
    return contract

@router.put("/update/{template_id}", response_model=ContractTemplateResponse)
def update_contract_template(
    template_id: int,
    data: ContractTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(ContractTemplate).filter(ContractTemplate.id == template_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract template not found")
    if contract.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    contract.name = data.name
    contract.contract_title = data.contract_title
    contract.description = data.description
    db.commit()
    db.refresh(contract)
    return contract

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contract_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(ContractTemplate).filter(ContractTemplate.id == template_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract template not found")
    if contract.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(contract)
    db.commit()
    return None

# =============================
#     AI DESCRIPTION ROUTE
# =============================

@router.post("/generate_description")
async def generate_contract_description(prompt: GeneratePrompt):
    try:
        description = await ai_service.generate_contract_description(prompt.contract_title)
        return {"description": description}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
