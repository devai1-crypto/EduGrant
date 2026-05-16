import httpx
from ..config import settings

async def send_application_confirmation(email: str, application_id: str):
    """
    Sends a confirmation email to the student using Brevo API.
    """
    if not settings.BREVO_API_KEY or settings.BREVO_API_KEY.startswith("xkeysib-..."):
        print(f"Skipping email to {email} - Brevo API key not configured.")
        return False

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    short_id = str(application_id)[:8].upper()
    
    payload = {
        "sender": {"name": "EduGrant AI", "email": "admissions@edugrant.ai"},
        "to": [{"email": email}],
        "subject": f"Application Received: {short_id}",
        "htmlContent": f"""
            <html>
                <body style="font-family: sans-serif; line-height: 1.6; color: #001F3F;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; rounded: 20px;">
                        <h1 style="color: #0066FF;">Excellence Received.</h1>
                        <p>Hello,</p>
                        <p>Your scholarship application has been successfully submitted to the EduGrant AI intelligence pipeline.</p>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 24px 0;">
                            <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px;">Your Application Reference</p>
                            <h2 style="margin: 8px 0; color: #001F3F; letter-spacing: 4px;">{short_id}</h2>
                        </div>
                        <p>Our AI agents are currently verifying your documents. You can track your real-time progress using the reference code above on our portal.</p>
                        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 30px 0;" />
                        <p style="font-size: 11px; color: #999;">This is an automated message from the EduGrant AI Admissions System.</p>
                    </div>
                </body>
            </html>
        """
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code < 300:
                print(f"Email sent successfully to {email}")
                return True
            else:
                print(f"Failed to send email: {response.text}")
                return False
        except Exception as e:
            print(f"Email error: {e}")
            return False
