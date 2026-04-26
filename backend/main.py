from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, get_db, engine
from sqlalchemy.orm import Session
from models import Base, Papers, Author, Users, Comment, Writes, Reads, Cites
from dotenv import load_dotenv
from api import auth
import os

load_dotenv()

app = FastAPI(title="ScholarForum Backend")

origins = ["http://localhost:5173"]

frontend_url = os.environ.get("FRONTEND_URL")

# Only add the URL to the list if it actually exists
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # <--- Now this is guaranteed to be a LIST
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


try:
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully")
except Exception as e:
    print("ERROR:")
    print(e)
finally:
    print("=== Process finished ===")

app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "ScholarForum Backend is running with PostgreSQL "}

@app.get("/tables")
def list_tables(db: Session = Depends(get_db)):
    """Simple test to show all tables exist"""
    tables = [Papers, Author, Users, Comment, Writes, Reads, Cites]
    return {"tables_created": [t.__tablename__ for t in tables]}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Check if database is connected"""
    try:
        db.execute("SELECT 1")
        return {"status": "Database connected successfully"}
    except Exception as e:
        return {"status": "Database error", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
