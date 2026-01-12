from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from database import big_expenses_collection

big_expenses_bp = Blueprint('big_expenses', __name__)

@big_expenses_bp.route('', methods=['POST'])
@jwt_required()
def add_big_expense():
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
            'status': data.get('status', 'planned'), # planned, paid
            'created_at': datetime.utcnow()
        }
        
        result = big_expenses_collection.insert_one(expense)
        expense['_id'] = str(result.inserted_id)
        expense['date'] = expense['date'].isoformat()
        expense['created_at'] = expense['created_at'].isoformat()
        
        return jsonify({'message': 'Big expense added', 'expense': expense}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@big_expenses_bp.route('', methods=['GET'])
@jwt_required()
def get_big_expenses():
    try:
        user_id = get_jwt_identity()
        query = {'user_id': user_id}
        
        expenses = list(big_expenses_collection.find(query).sort('date', -1))
        
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
            expense['date'] = expense['date'].isoformat()
            expense['created_at'] = expense['created_at'].isoformat()
        
        return jsonify({'expenses': expenses}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@big_expenses_bp.route('/<expense_id>', methods=['DELETE'])
@jwt_required()
def delete_big_expense(expense_id):
    try:
        user_id = get_jwt_identity()
        
        result = big_expenses_collection.delete_one({
            '_id': ObjectId(expense_id),
            'user_id': user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Expense not found'}), 404
        
        return jsonify({'message': 'Expense deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@big_expenses_bp.route('/<expense_id>', methods=['PATCH'])
@jwt_required()
def update_big_expense(expense_id):
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        updates = {}
        if 'title' in data: updates['title'] = data['title']
        if 'amount' in data: updates['amount'] = float(data['amount'])
        if 'category' in data: updates['category'] = data['category']
        if 'status' in data: updates['status'] = data['status']
        
        if not updates:
            return jsonify({'message': 'No updates provided'}), 400
            
        result = big_expenses_collection.update_one(
            {'_id': ObjectId(expense_id), 'user_id': user_id},
            {'$set': updates}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Expense not found'}), 404
            
        return jsonify({'message': 'Expense updated'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
