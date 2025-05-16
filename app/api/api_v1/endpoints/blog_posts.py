from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.models import BlogPost, User
from app.api.deps import get_db, get_current_user
from app.models.models import User
from typing import List
from app.services.ai_service import AIService
from fastapi import status

router = APIRouter()
ai_service = AIService()

class BlogPostCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    published_date: Optional[datetime] = None

class BlogPostResponse(BlogPostCreate):
    id: int
    author_id: int
    created_date: datetime

    class Config:
        orm_mode = True

@router.post("/create", response_model=BlogPostResponse)
def create_post(
    post_data: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_blog_post(db, post_data, current_user.id)

@router.get("/", response_model=List[BlogPostResponse])
def get_posts(db: Session = Depends(get_db)):
    return get_blog_posts(db)

def create_blog_post(db: Session, blog_data: BlogPostCreate, author_id: int):
    blog = BlogPost(**blog_data.dict(), author_id=author_id)
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog

def get_blog_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(BlogPost).offset(skip).limit(limit).all()


@router.post("/generate", response_model=str)
async def generate_blog_ai(title: str):
    try:
         bio = await ai_service.generate_blog_content(
            title=title
        )
        #  bio = await ai_service.generate_candidate_bio(
        #     experience={},
        #     education={},
        #     skills={}
        # )
         return bio
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
    
    
@router.get("/{blog_id}", response_model=BlogPostResponse)
def get_blog_by_id(
    blog_id: int,
    db: Session = Depends(get_db)
):
    blog = db.query(BlogPost).filter(BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog_post(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    blog = db.query(BlogPost).filter(BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    if blog.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this blog")

    db.delete(blog)
    db.commit()
    return None
@router.put("/update/{blog_id}", response_model=BlogPostResponse)
def update_blog_post(
    blog_id: int,
    post_data: BlogPostCreate,  # or BlogPostUpdate if you prefer partial updates
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    blog = db.query(BlogPost).filter(BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    if blog.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this blog")

    blog.title = post_data.title
    blog.content = post_data.content
    blog.image_url = post_data.image_url
    blog.published_date = post_data.published_date or blog.published_date

    db.commit()
    db.refresh(blog)
    return blog
