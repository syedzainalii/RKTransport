from sqlalchemy import Column, String, Text, Integer, Boolean, ARRAY
from app.core.database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    short_description = Column(Text, nullable=False)
    detailed_description = Column(Text, nullable=True)
    starting_price_note = Column(String, nullable=True)
    features = Column(ARRAY(String), default=[])
    image_url = Column(String, nullable=True)
    banner_image_url = Column(Text, nullable=True)  # <--- Make sure this is here
    image_alt = Column(String, nullable=True)
    icon = Column(String, default="Truck")
    category = Column(String, default="other")
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)