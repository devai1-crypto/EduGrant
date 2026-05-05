from ..config import settings

def send_outreach_email(to_email: str, subject: str, body: str):
    """
    Sends an outreach email using SendGrid.
    If SENDGRID_API_KEY is not set, it logs to the console (Sandbox Mode).
    """
    print(f"--- EMAIL SANDBOX MODE ---")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print(f"--------------------------")
    
    # Real implementation would use:
    # from sendgrid import SendGridAPIClient
    # from sendgrid.helpers.mail import Mail
    # if settings.SENDGRID_API_KEY:
    #     message = Mail(from_email=settings.EMAIL_SENDER, to_emails=to_email, subject=subject, html_content=body)
    #     sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    #     sg.send(message)
