from fastapi import APIRouter
from app.api.api_v1.endpoints import users, jobs, candidates, applications, contracts, auth, blog_posts, contract_template

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"]) 
api_router.include_router(blog_posts.router, prefix="/blog", tags=["blog"])
api_router.include_router(contract_template.router, prefix="/contractTemplate", tags=["contractTemplate"])