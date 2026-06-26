from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
from database import Base

class Notification(Base):
    __tablename__ = "notifications"
    notification_id = Column(String(10), primary_key=True)
    user_id = Column(String)
    title = Column(String(200))
    message = Column(String(500))
    notif_type = Column(String(50))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    link = Column(String(200), nullable=True)
