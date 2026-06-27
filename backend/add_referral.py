import sqlite3
import sys

def main():
    try:
        conn = sqlite3.connect('streakforge.db')
        conn.execute('ALTER TABLE users ADD COLUMN referral_code VARCHAR')
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
