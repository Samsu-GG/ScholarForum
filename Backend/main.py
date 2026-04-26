from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from models import SessionLocal, Base, Papers, Author, Users, Comment, Writes, Reads, Cites

app = FastAPI(title="ScholarForum Backend")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
