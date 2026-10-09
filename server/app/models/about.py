from sqlalchemy import Column, Integer, String, Text, JSON
from app.core.database import Base

class About(Base):
    __tablename__ = "about"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    mission = Column(Text, nullable=True)
    vision = Column(Text, nullable=True)
    values = Column(JSON, nullable=True)
    images = Column(JSON, nullable=True)
    banner_image_url = Column(Text, nullable=True)
    stats = Column(JSON, default=list)
    story_image_side = Column(String, default="left")
    why_choose_us = Column(JSON, default=list)