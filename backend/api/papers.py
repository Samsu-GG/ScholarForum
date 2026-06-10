from fastapi import APIRouter, Depends, HTTPException, Query, status
from models import Papers, Author, ViewPaperDetails, Comment, Users
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from schemas import ResultPageResponse, CommentResponse, CommentCreate
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.authenticate import verify_token

# Initialize the bearer token scheme
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency that extracts and verifies the JWT token from the Request headers.
    Returns the user dictionary payload if valid.
    """
    token = credentials.credentials
    user_payload = verify_token(token)
    
    if not user_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user_payload  # This returns {"user_id": ..., "role": ...}

router = APIRouter(prefix="/papers", tags=["papers"])

@router.get("/{id}", response_model=ResultPageResponse)
def result_page(
    id: int, 
    db: Session = Depends(get_db)
):
    # SQL: SELECT * FROM ViewPaperDetails WHERE paper_id = <id> LIMIT 1; 
    paper = db.query(ViewPaperDetails).filter(ViewPaperDetails.paper_id == id).first()
    
    # If the paper doesn't exist, throw a 404
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    # SQL: SELECT upper(view_paper_details.title) FROM view_paper_details;
    uppercase_title = db.query(func.upper(paper.title)).scalar()

    # SQL: SELECT * FROM Comment WHERE paper_id = <id> LIMIT 1; 
    db_comments = db.query(Comment).filter(Comment.paper_id == id).all()
    
    # Format database comments into the structure your React loop expects
    comments_list = [
        {
            "id": c.comment_id,
            "author_name": c.user.full_name if c.user else "Anonymous", # Adjust based on user relationship
            "date": c.created_at.strftime("%Y-%m-%d") if c.created_at else "",
            "text": c.content
        }
        for c in db_comments
    ]

    return {
        "title": uppercase_title,
        "publish_date": paper.publish_date.isoformat() if paper.publish_date else "",
        "abstract": paper.abstract,
        "pdf_link": paper.pdf_link,
        "authors": paper.authors, 
        "comments": comments_list
    }


@router.post("/{id}/comments", response_model=CommentResponse, status_code=201)
def post_comment(
    id: int, 
    comment_data: CommentCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 1. Verify the paper exists
    # SQL: SELECT * FROM Papers WHERE paper_id = <id> LIMIT 1; 
    paper = db.query(Papers).filter(Papers.paper_id == id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    # 2. Fetch the user row from the database using the token's user_id
    # SQL: SELECT * FROM Users WHERE user_id = <id> LIMIT 1; 
    db_user = db.query(Users).filter(Users.user_id == current_user["user_id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 3. Build and save the comment
    new_comment = Comment(
        content=comment_data.text,
        paper_id=id,
        user_id=current_user["user_id"]
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    # 4. Return the response with the user's real first name
    return {
        "id": new_comment.comment_id,
        "author_name": db_user.first_name if hasattr(db_user, 'first_name') else db_user.full_name,
        "date": new_comment.created_at.strftime("%Y-%m-%d"),
        "text": new_comment.content
    }