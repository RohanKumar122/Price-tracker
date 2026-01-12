import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection
client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
db = client['expense_tracker']
users_collection = db['users']
expenses_collection = db['expenses']
loans_collection = db['loans']
big_expenses_collection = db['big_expenses']
