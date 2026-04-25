from __future__ import annotations

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(*, to: str, subject: str, html_body: str) -> None:
    """
    Send a single HTML email via the configured SMTP server.
    Silently logs and returns if SMTP is not configured (no SMTP_USER set).
    This prevents startup failures in environments where email is optional.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(
            "SMTP not configured — skipping email to %s (subject: %s)", to, subject
        )
        return

    message = MIMEMultipart("alternative")
    message["From"] = settings.SMTP_FROM
    message["To"] = to
    message["Subject"] = subject
    message.attach(MIMEText(html_body, "html"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=settings.SMTP_TLS,
        )
        logger.info("Email sent to %s", to)
    except Exception:  # noqa: BLE001
        logger.exception("Failed to send email to %s", to)
        raise


async def send_password_reset_email(*, to: str, reset_url: str, full_name: str | None) -> None:
    """Send the password-reset link to the user."""
    name = full_name or "there"
    subject = "Reset your PanelX password"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #2563eb;">Reset your password</h2>
      <p>Hi {name},</p>
      <p>We received a request to reset the password for your PanelX account.</p>
      <p style="margin: 24px 0;">
        <a href="{reset_url}"
           style="background:#2563eb;color:#fff;padding:12px 24px;
                  border-radius:6px;text-decoration:none;font-weight:bold;">
          Reset Password
        </a>
      </p>
      <p>This link expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="color:#6b7280;font-size:12px;">PanelX · Do not reply to this email</p>
    </div>
    """
    await send_email(to=to, subject=subject, html_body=html_body)
