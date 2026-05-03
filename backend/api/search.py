from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import TSVECTOR
from database import SessionLocal, get_db
from models import Papers
from schemas import SearchResponse
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/", response_model=list[SearchResponse])
def search_items(
    q: str = Query(...),
    year_from: int | None = Query(None),
    year_to: int | None = Query(None),
    author: str | None = Query(None),
    recent_only: bool = Query(False),
    sort_by: str = Query(""),
    limit: int = Query(10),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):

    query = (
        db.query(Papers.paper_id, Papers.title,Papers.abstract)
        .filter(Papers.search_vector.op('@@')(func.plainto_tsquery(q)))
        

    )
    if year_from and year_to:
        start_date = date(year_from, 1, 1)
        end_date = date(year_to, 12, 31)
        query = query.filter(Papers.publish_date >= start_date, Papers.publish_date <= end_date)

    if author:
        query = (
        query.join(Writes, Writes.paper_id == Papers.paper_id)\
        .join(Author, Author.auth_id == Writes.auth_id)\
        .filter(Author.auth_name == author)
        )

    if recent_only:
        filter_end_date = datetime.now().date()
        filter_start_date = filter_end_date - relativedelta(months=1)
        query = query.filter(Papers.publish_date >= filter_start_date, Papers.publish_date <= filter_end_date)

    if sort_by:
        if sort_by == "most_cited":
            query = (
                query.outerjoin(Cites, Papers.paper_id == Cites.cited_paper)\
                 .group_by(Papers.paper_id, Papers.title, Papers.abstract)\
                 .order_by(func.count(Cites.cited_paper).desc())
            )
        elif sort_by == "newest":
            query = query.order_by(Papers.publish_date.desc())
        elif sort_by == "oldest":
            query = query.order_by(Papers.publish_date)
    else:
        query = query.order_by(func.ts_rank(Papers.search_vector, func.plainto_tsquery(q)).desc())

    query = query.limit(limit).offset(offset).all()

    return [{"id": r.paper_id, "title": r.title, "abstract": r.abstract} for r in query]

