from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import TSVECTOR
from database import SessionLocal, get_db
from models import Papers
from schemas import SearchRequest, SearchResponse

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/", response_model=list[SearchResponse])
def search_items(
    q: SearchRequest,
    db: Session = Depends(get_db)
):

    query = (
        db.query(Papers.paper_id, Papers.title,Papers.abstract)
        .filter(Papers.search_vector.op('@@')(func.plainto_tsquery(q)))
        .order_by(func.ts_rank(Papers.search_vector, func.plainto_tsquery(q)).desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    return [{"id": r.paper_id, "title": r.title, "abstract": r.abstract} for r in query]

