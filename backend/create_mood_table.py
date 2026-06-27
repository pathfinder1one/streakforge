from app.core.database import engine, Base
import app.models.user

# Create table if it doesn't exist
Base.metadata.create_all(bind=engine, tables=[app.models.user.MoodLog.__table__])
print("MoodLog table created.")
