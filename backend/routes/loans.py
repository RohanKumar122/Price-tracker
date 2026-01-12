from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from database import loans_collection

loans_bp = Blueprint('loans', __name__)

@loans_bp.route('', methods=['POST'])
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

@loans_bp.route('', methods=['GET'])
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

@loans_bp.route('/<loan_id>/status', methods=['PATCH'])
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

@loans_bp.route('/<loan_id>', methods=['DELETE'])
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

@loans_bp.route('/reminders', methods=['GET'])
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
