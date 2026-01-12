from flask import Flask
from flask_cors import CORS
from datetime import timedelta
import os
from dotenv import load_dotenv

from extensions import bcrypt, jwt
from routes.auth import auth_bp
from routes.expenses import expenses_bp
from routes.loans import loans_bp

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=90)

CORS(app, resources={r"/*": {"origins": "*"}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Initialize extensions
bcrypt.init_app(app)
jwt.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(expenses_bp, url_prefix='/api/expenses')
app.register_blueprint(loans_bp, url_prefix='/api/loans')

if __name__ == '__main__':
    app.run(debug=True, port=5000)