import resend
from ..config import settings

def send_outreach_email(to_email: str, subject: str, body: str):
    """
    Sends an outreach email using Resend.
    """
    if settings.RESEND_API_KEY:
        resend.api_key = settings.RESEND_API_KEY
        try:
            r = resend.Emails.send({
                "from": settings.EMAIL_SENDER,
                "to": to_email,
                "subject": subject,
                "html": body
            })
            print(f"Email successfully sent to {to_email}: {r}")
            return True
        except Exception as e:
            print(f"Failed to send email via Resend: {e}")
            return False
    else:
        print(f"--- EMAIL SANDBOX MODE ---")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {body}")
        print(f"--------------------------")
        return True

