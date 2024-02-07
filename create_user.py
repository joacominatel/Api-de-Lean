from werkzeug.security import generate_password_hash
import mysql.connector, os
from dotenv import load_dotenv

load_dotenv('.env')

user = os.getenv('USER')
password = os.getenv('PASSWORD')

hashed_password = generate_password_hash(password)

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

cursor.execute("""
    INSERT INTO users (username, password_hash) VALUES (%s, %s)
""", (user, hashed_password))

db.commit()

cursor.execute("""
    SELECT * FROM users
""")
users = cursor.fetchall()

# Close the connection
db.close()