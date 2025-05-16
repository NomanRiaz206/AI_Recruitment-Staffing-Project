from typing import Dict, List
import logging
from openai import AsyncOpenAI
from app.core.config import settings
import openai
import re
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        logger.info("AIService initialized with AsyncOpenAI client")
        if not settings.OPENAI_API_KEY:
            logger.error("OpenAI API key not configured!")
        openai.api_key = settings.OPENAI_API_KEY

    async def generate_job_description(self, title: str, requirements: List[str], company_info: str) -> str:
        logger.info(f"Generating job description for: {title}")
        try:
            prompt = f"""Please write a professional job description for the following position:

Job Title: {title}

Company Information:
{company_info}

Requirements:
{chr(10).join('- ' + req for req in requirements)}

Write a compelling job description that includes:
1. A brief overview of the role
2. Key responsibilities
3. Required qualifications
4. What the company offers

The tone should be professional but engaging."""
            logger.info("Sending request to OpenAI API")
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional recruiter writing compelling job descriptions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            logger.info("Successfully received response from OpenAI")
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error in generate_job_description: {str(e)}")
            raise Exception(f"Failed to generate job description: {str(e)}")

    async def generate_candidate_bio(
        self,
        experience: List[Dict],
        education: List[Dict],
        skills: List[str]
    ) -> str:
        """Generate a professional bio for a candidate based on their experience, education, and skills."""

        # Format experience and education into readable text
        experience_text = "\n".join([
            f"- {exp['position']} at {exp['company']} ({exp['duration']}): {exp['description']}"
            for exp in experience
        ])

        education_text = "\n".join([
            f"- {edu['degree']} in {edu['field']} from {edu['institution']} ({edu['year']})"
            for edu in education
        ])

        skills_text = ", ".join(skills)

        prompt = f"""Please write a professional bio for a candidate with the following background:

Experience:
{experience_text}

Education:
{education_text}

Skills: {skills_text}

Write a concise, professional bio that highlights their key achievements, expertise, and value proposition. 
The bio should be written in first person and be approximately 2-3 paragraphs long."""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional resume writer helping to craft compelling candidate bios."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error in generate_candidate_bio: {str(e)}")
            raise Exception(f"Failed to generate bio: {str(e)}")

    async def match_candidate_with_job(self, candidate_data: Dict, job_data: Dict) -> Dict:
        prompt = f"""Analyze the match between the candidate and job posting:

Candidate:
{candidate_data}

Job Posting:
{job_data}

Provide a matching score (0-100) and explanation."""

        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3
        )

        analysis = response.choices[0].message.content
        # score = 75  # Placeholder logic; replace with real parsing
        match = re.search(r"Score:\s*(\d+)", analysis)
        score = int(match.group(1)) if match else 0 

        return {
            "score": score,
            "analysis": analysis
        }

    async def generate_contract(self, job_data: Dict, candidate_data: Dict) -> str:
        prompt = f"""Generate a professional employment contract with the following details:

Job Information:
- Title: {job_data['title']}
- Location: {job_data['location']}
- Salary Range: {job_data['salary_range']['currency']} {job_data['salary_range']['min']} - {job_data['salary_range']['max']}

Candidate Information:
- Name: {candidate_data['user']['full_name']}
- Position: {job_data['title']}

Please create a formal employment contract that includes:
1. Parties involved
2. Employment terms and conditions
3. Compensation and benefits
4. Work schedule and location
5. Confidentiality and non-compete clauses
6. Termination conditions
7. Signatures section

Use formal legal language while maintaining clarity."""

        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.3
        )
        return response.choices[0].message.content

    async def filter_job_posting(self, job_posting: Dict) -> Dict:
        prompt = f"""Review and enhance this job posting:

Title: {job_posting['title']}
Description: {job_posting['description']}
Requirements: {', '.join(job_posting['requirements'])}
Location: {job_posting['location']}

Please:
1. Check for discriminatory language
2. Ensure requirements are clear and specific
3. Verify the description is comprehensive
4. Maintain professional tone
5. Suggest improvements
6. Flag any compliance issues

Provide structured feedback and suggestions."""

        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.3
        )

        feedback = response.choices[0].message.content
        is_compliant = "discriminatory" not in feedback.lower() and "illegal" not in feedback.lower()

        return {
            "feedback": feedback,
            "is_compliant": is_compliant,
            "original_posting": job_posting
        }

    async def generate_blog_content(self, title: str) -> str:
            
            prompt = f"Write a detailed, professional blog article about: '{title}'"
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                     {"role": "system", "content": "You are a professional content writer helping to craft compelling blog posts."},
                    {"role": "user", "content": prompt}
                    ],
                temperature=0.7,
                max_tokens=500
            )

            #return response.choices[0].message.content
            responseData =  response.choices[0].message.content.strip()
            return  responseData[7:]
            #return response.choices[0].message['content']
        
    async def generate_contract_description(self, contract_title: str) -> str:
        prompt = f"Write a professional description for a contract titled: '{contract_title}'"
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional content writer helping to craft compelling contract templates."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating contract description: {str(e)}")
            raise Exception(f"Failed to generate contract description: {str(e)}")
        
        
            
            

    # async def generate_contract_description(title: str) -> str:
    #         prompt = f"Write a professional description for a contract titled: '{title}'"
    #         response = await self.client.chat.completions.create(
    #             model="gpt-4",
    #             messages=[
    #                  {"role": "system", "content": "You are a professional content writer helping to craft compelling contract templates."},
    #                 {"role": "user", "content": prompt}
    #                 ],
    #             temperature=0.7,
    #             max_tokens=500
    #         )
            
    #         return response.choices[0].text.strip()
    # response = openai.Completion.create(
    #     model="text-davinci-003",
    #     prompt=prompt,
    #     max_tokens=150
    # )
    