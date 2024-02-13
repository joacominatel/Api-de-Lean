from werkzeug.security import generate_password_hash
import mysql.connector, os
from dotenv import load_dotenv

load_dotenv('.env')

user = os.getenv('USER')
password = os.getenv('PASSWORD')

# Connect to the database
db = mysql.connector.connect(
    host=os.getenv('MYSQL_HOST'),
    user=os.getenv('MYSQL_USER'),
    password=os.getenv('MYSQL_PASSWORD'),
    database=os.getenv('MYSQL_DB')
)

# Create a cursor
cursor = db.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL
    )
""")

if user == None or password == None:
    print("Please set the USER and PASSWORD environment variables")
    exit()

hashed_password = generate_password_hash(password)

try:
    # check if user already exists
    cursor.execute("SELECT * FROM users WHERE username = %s", (user,))
    result = cursor.fetchone()
    if result:
        print(f"User {user} already exists")
    else:
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (user, hashed_password))
        db.commit()
        print(f"User {user} created successfully")
except Exception as e:
    print(f"Error creating user: {e}")
finally:
    cursor.close()
    db.close()
