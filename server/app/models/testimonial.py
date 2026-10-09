from sqlalchemy import Boolean, Column, Integer, String, Text
from app.core.database import Base


class Testimonial(Base):
  __tablename__ = "testimonials"

  id = Column(Integer, primary_key=True, index=True)
  customer_name = Column(String, nullable=False)
  quote = Column(Text, nullable=False)
  rating = Column(Integer, default=5)
  vehicle_note = Column(String, nullable=True)
  image_url = Column(String, nullable=True)
  banner_image_url = Column(Text, nullable=True)
  image_alt = Column(String, nullable=True)
  is_active = Column(Boolean, default=True)
  sort_order = Column(Integer, default=0)