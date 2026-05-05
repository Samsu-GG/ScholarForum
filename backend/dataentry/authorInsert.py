import pandas as pd
import ast
from sqlalchemy.orm import sessionmaker

from database import engine
from models import Author

# session setup
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

df = pd.read_csv("Author_data.csv")

count = 0
existing = set()

# helper function to clean text
def clean_text(value):
    return str(value).strip().strip("'").strip('"')

for _, row in df.iterrows():

    # FIX: publication name is actually in "first_author"
    publication_name = clean_text(row["first_author"])

    # parse authors safely
    authors_list = ast.literal_eval(row["authors"])

    for author_name in authors_list:

        # clean values
        author_name = clean_text(author_name)
        affiliation = clean_text(row["first_author"])

        # unique check (author_name + affiliation)
        key = (author_name, affiliation)

        if key in existing:
            continue

        existing.add(key)

        author = Author(
            auth_name=author_name,
            affiliation=affiliation
        )

        session.add(author)
        count += 1

session.commit()
session.close()

print(f"Authors inserted successfully! Total inserted: {count}")