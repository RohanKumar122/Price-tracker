from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=90)

CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# MongoDB Connection
client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
db = client['expense_tracker']
users_collection = db['users']
expenses_collection = db['expenses']
loans_collection = db['loans']

# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    if doc:
        doc['_id'] = str(doc['_id'])
    return doc

# ==================== AUTH ROUTES ====================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password or not name:
            return jsonify({'error': 'All fields are required'}), 400
        
        # Check if user exists
        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'Email already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Create user
        user = {
            'email': email,
            'password': hashed_password,
            'name': name,
            'created_at': datetime.utcnow()
        }
        
        result = users_collection.insert_one(user)
        user_id = str(result.inserted_id)
        
        # Create access token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': {
                'id': user_id,
                'email': email,
                'name': name
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = users_collection.find_one({'email': email})
        
        if not user or not bcrypt.check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(user['_id']))
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== EXPENSE ROUTES ====================

@app.route('/api/expenses', methods=['POST'])
@jwt_required()
def add_expense():
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        expense = {
            'user_id': user_id,
            'title': data.get('title'),
            'amount': float(data.get('amount')),
            'category': data.get('category'),
            'date': datetime.fromisoformat(data.get('date').replace('Z', '+00:00')),
            'description': data.get('description', ''),
            'created_at': datetime.utcnow()
        }
        
        result = expenses_collection.insert_one(expense)
        expense['_id'] = str(result.inserted_id)
        expense['date'] = expense['date'].isoformat()
        expense['created_at'] = expense['created_at'].isoformat()
        
        return jsonify({'message': 'Expense added', 'expense': expense}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    try:
        user_id = get_jwt_identity()
        month = request.args.get('month')
        year = request.args.get('year')
        
        query = {'user_id': user_id}
        
        if month and year:
            start_date = datetime(int(year), int(month), 1)
            if int(month) == 12:
                end_date = datetime(int(year) + 1, 1, 1)
            else:
                end_date = datetime(int(year), int(month) + 1, 1)
            
            query['date'] = {'$gte': start_date, '$lt': end_date}
        elif year:
            start_date = datetime(int(year), 1, 1)
            end_date = datetime(int(year) + 1, 1, 1)
            query['date'] = {'$gte': start_date, '$lt': end_date}
        
        expenses = list(expenses_collection.find(query).sort('date', -1))
        
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
            expense['date'] = expense['date'].isoformat()
            expense['created_at'] = expense['created_at'].isoformat()
        
        return jsonify({'expenses': expenses}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/<expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    try:
        user_id = get_jwt_identity()
        
        result = expenses_collection.delete_one({
            '_id': ObjectId(expense_id),
            'user_id': user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Expense not found'}), 404
        
        return jsonify({'message': 'Expense deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/stats', methods=['GET'])
@jwt_required()
def get_expense_stats():
    try:
        user_id = get_jwt_identity()
        month = request.args.get('month')
        year = request.args.get('year')
        
        query = {'user_id': user_id}
        
        if month and year:
            start_date = datetime(int(year), int(month), 1)
            if int(month) == 12:
                end_date = datetime(int(year) + 1, 1, 1)
            else:
                end_date = datetime(int(year), int(month) + 1, 1)
            query['date'] = {'$gte': start_date, '$lt': end_date}
        elif year:
            start_date = datetime(int(year), 1, 1)
            end_date = datetime(int(year) + 1, 1, 1)
            query['date'] = {'$gte': start_date, '$lt': end_date}
        
        # Calculate total and by category
        expenses = list(expenses_collection.find(query))
        total = sum(exp['amount'] for exp in expenses)
        
        by_category = {}
        for exp in expenses:
            cat = exp['category']
            by_category[cat] = by_category.get(cat, 0) + exp['amount']
        
        return jsonify({
            'total': total,
            'by_category': by_category,
            'count': len(expenses)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== LOAN ROUTES ====================

@app.route('/api/loans', methods=['POST'])
@jwt_required()
def add_loan():
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        loan = {
            'user_id': user_id,
            'person_name': data.get('person_name'),
            'amount': float(data.get('amount')),
            'date': datetime.fromisoformat(data.get('date').replace('Z', '+00:00')),
            'reminder_date': datetime.fromisoformat(data.get('reminder_date').replace('Z', '+00:00')) if data.get('reminder_date') else None,
            'description': data.get('description', ''),
            'status': 'pending',
            'created_at': datetime.utcnow()
        }
        
        result = loans_collection.insert_one(loan)
        loan['_id'] = str(result.inserted_id)
        loan['date'] = loan['date'].isoformat()
        if loan['reminder_date']:
            loan['reminder_date'] = loan['reminder_date'].isoformat()
        loan['created_at'] = loan['created_at'].isoformat()
        
        return jsonify({'message': 'Loan added', 'loan': loan}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/loans', methods=['GET'])
@jwt_required()
def get_loans():
    try:
        user_id = get_jwt_identity()
        status = request.args.get('status')
        
        query = {'user_id': user_id}
        if status:
            query['status'] = status
        
        loans = list(loans_collection.find(query).sort('date', -1))
        
        for loan in loans:
            loan['_id'] = str(loan['_id'])
            loan['date'] = loan['date'].isoformat()
            if loan.get('reminder_date'):
                loan['reminder_date'] = loan['reminder_date'].isoformat()
            loan['created_at'] = loan['created_at'].isoformat()
        
        return jsonify({'loans': loans}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/loans/<loan_id>/status', methods=['PATCH'])
@jwt_required()
def update_loan_status(loan_id):
    try:
        user_id = get_jwt_identity()
        data = request.json
        status = data.get('status')
        
        result = loans_collection.update_one(
            {'_id': ObjectId(loan_id), 'user_id': user_id},
            {'$set': {'status': status}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Loan not found'}), 404
        
        return jsonify({'message': 'Loan status updated'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/loans/<loan_id>', methods=['DELETE'])
@jwt_required()
def delete_loan(loan_id):
    try:
        user_id = get_jwt_identity()
        
        result = loans_collection.delete_one({
            '_id': ObjectId(loan_id),
            'user_id': user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Loan not found'}), 404
        
        return jsonify({'message': 'Loan deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/loans/reminders', methods=['GET'])
@jwt_required()
def get_loan_reminders():
    try:
        user_id = get_jwt_identity()
        today = datetime.utcnow()
        
        # Get loans with reminders due today or overdue
        loans = list(loans_collection.find({
            'user_id': user_id,
            'status': 'pending',
            'reminder_date': {'$lte': today}
        }).sort('reminder_date', 1))
        
        for loan in loans:
            loan['_id'] = str(loan['_id'])
            loan['date'] = loan['date'].isoformat()
            if loan.get('reminder_date'):
                loan['reminder_date'] = loan['reminder_date'].isoformat()
            loan['created_at'] = loan['created_at'].isoformat()
        
        return jsonify({'reminders': loans}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)