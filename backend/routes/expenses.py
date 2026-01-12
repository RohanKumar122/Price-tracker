from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from database import expenses_collection

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('', methods=['POST'])
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

@expenses_bp.route('', methods=['GET'])
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

@expenses_bp.route('/<expense_id>', methods=['DELETE'])
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

@expenses_bp.route('/stats', methods=['GET'])
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
