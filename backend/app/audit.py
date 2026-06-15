from sqlalchemy.orm import Session

from app.models import AuditLog


def write_audit_log(db: Session, action: str, user_id: int | None = None, details: str | None = None) -> None:
    db.add(AuditLog(action=action, user_id=user_id, details=details))
