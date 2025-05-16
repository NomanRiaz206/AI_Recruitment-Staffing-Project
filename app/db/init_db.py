from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import Base
from app.db.session import engine

def init_db() -> None:
    Base.metadata.create_all(bind=engine)

def main() -> None:
    init_db()

if __name__ == "__main__":
    main() 