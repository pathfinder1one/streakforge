import sqlite3
import sys

def main():
    try:
        conn = sqlite3.connect('streakforge.db')
        conn.execute('ALTER TABLE targets ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0')
        conn.commit()
        conn.close()
        print("Column added successfully.")
    except Exception as e:
        print(f"Error: {e}")
        if "duplicate column name" in str(e).lower():
            print("Column already exists.")
        else:
            sys.exit(1)

if __name__ == "__main__":
    main()
