from datetime import datetime, timezone

from sqlalchemy import Column, DateTime


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def timestamp_column() -> Column:
    """Columna datetime con zona horaria, obligatoria."""
    return Column(DateTime(timezone=True), nullable=False)
