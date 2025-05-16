# email_templates.py

def candidate_application_template(candidate_name, job_title, match_score):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Hi {candidate_name},</h2>
        <p>Thank you for applying for the position of <strong>{job_title}</strong>.</p>
        <p>Your application has been successfully submitted and is under review.</p>
        <p><strong>AI Match Score:</strong> {match_score}%</p>
        <p>We appreciate your interest and wish you the best of luck!</p>
        <br>
        <p>Best regards,<br><strong>AI Recruitment Team</strong></p>
      </body>
    </html>
    """

def employer_notification_template(employer_name, candidate_name, job_title, match_score):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2196F3;">Hello {employer_name},</h2>
        <p>A new candidate, <strong>{candidate_name}</strong>, has applied for your job posting: <strong>{job_title}</strong>.</p>
        <p><strong>AI Match Score:</strong> {match_score}%</p>
        <p>You can log in to your dashboard to review the application and take the next steps.</p>
        <br>
        <p>Regards,<br><strong>AI Recruitment Platform</strong></p>
      </body>
    </html>
    """
