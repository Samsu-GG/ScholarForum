import pandas as pd
from datetime import datetime
from sqlalchemy.orm import sessionmaker
import ast

from database import engine
from models import Papers, Author, Writes

SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

df = pd.read_csv("dataentry/new_final_data.csv", dtype=str)

for _, row in df.iterrows():

    # -------------------------------
    # 1. Parse authors (CSV stores them as a string)
    # -------------------------------
    authors_raw = row["authors"]
    authors_list = [
    author.strip()
    for author in ast.literal_eval(authors_raw)
]

    # -------------------------------
    # 2. Skip duplicate DOIs
    # -------------------------------
    existing_paper = db.query(Papers).filter(Papers.doi == row["id"]).first()
    if existing_paper:
        print(f"Skipping duplicate paper: DOI {row['id']}")
        continue

    # -------------------------------
    # 3. Insert paper
    # -------------------------------
    publish_date = datetime.strptime(row["published_date"], "%m/%d/%Y").date()

    new_paper = Papers(
        title=row["title"],
        doi=row["id"],
        abstract=row["summary"],
        publish_date=publish_date,
        pdf_link=row["pdf_link"]
    )

    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)

    # -------------------------------
    # 4. Affiliation is same for all authors
    # -------------------------------
    affiliation_value = ast.literal_eval(row["first_author"])

    # -------------------------------
    # 5. Insert authors + writes
    # -------------------------------
    for author_name in authors_list:

        # Check if author exists
        existing_author = (
            db.query(Author)
            .filter(Author.auth_name == author_name)
            .first()
        )

        if existing_author:
            author = existing_author

            # Optionally update affiliation
            if author.affiliation != affiliation_value:
                author.affiliation = affiliation_value

        else:
            # Create new author
            author = Author(
                auth_name=author_name,
                affiliation=affiliation_value
            )
            db.add(author)
            db.commit()
            db.refresh(author)

        # Create writes relation (avoid duplicates)
        exists_writes = (
            db.query(Writes)
            .filter(Writes.auth_id == author.auth_id,
                    Writes.paper_id == new_paper.paper_id)
            .first()
        )

        if not exists_writes:
            db.add(Writes(auth_id=author.auth_id, paper_id=new_paper.paper_id))

    db.commit()

db.close()
print("Data insert completed.")