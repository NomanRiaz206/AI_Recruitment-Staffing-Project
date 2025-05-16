from openai import AsyncOpenAI  
import openai

async def generate_contract(db, application):
    job = application.job
    candidate = application.candidate
    employer = application.employer

    prompt = f"""
    Write a professional employment contract between:
    - Employer: {employer.company_name}, Email: {employer.email}
    - Candidate: {candidate.full_name}, Email: {candidate.email}
    For the job role: {job.title}, Description: {job.description}, Salary: {job.salary}
    Include standard terms, responsibilities, termination, and duration.
    """

    ai_content = call_gpt(prompt)  # returns contract text

    new_contract = Contract(
        job_id=job.id,
        application_id=application.id,
        employer_id=employer.id,
        candidate_id=candidate.id,
        content=ai_content,
    )
    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)
    return new_contract
