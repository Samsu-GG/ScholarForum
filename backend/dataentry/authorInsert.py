import pandas as pd
import ast
from sqlalchemy.orm import sessionmaker

from database import engine
from models import Author

# create session
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

df = pd.read_csv("Author_data.csv")

count = 0

for _, row in df.iterrows():
    # safely convert string list -> python list
    authors_list = ast.literal_eval(row["authors"])

    for author_name in authors_list:
        print(author_name)  # optional debug

        author = Author(
            auth_name=author_name,
            affiliation=row["first_author"]  # or change if needed
        )

        session.add(author)
        count += 1

session.commit()
session.close()

print(f"Authors inserted successfully! Total inserted: {count}")