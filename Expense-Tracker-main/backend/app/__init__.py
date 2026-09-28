import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy import func, extract

load_dotenv()

app = Flask(__name__)

# Database configuration
database_url = os.getenv('DATABASE_URL', 'sqlite:///expense_tracker.db')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

db = SQLAlchemy(app)
CORS(app)

# ==================== MODELS ====================
class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    color = db.Column(db.String(7), default='#3b82f6')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'created_at': self.created_at.isoformat()
        }

class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    type = db.Column(db.String(20), default='expense')
    tags = db.Column(db.String(500), default='')
    date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    category = db.relationship('Category', backref='expenses')
    
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'category_id': self.category_id,
            'type': self.type,
            'category': self.category.to_dict() if self.category else None,
            'tags': self.tags,
            'date': self.date.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class BudgetLimit(db.Model):
    __tablename__ = 'budget_limits'
    
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    category = db.relationship('Category')
    
    def to_dict(self):
        return {
            'id': self.id,
            'category_id': self.category_id,
            'amount': self.amount,
            'month': self.month,
            'year': self.year,
            'created_at': self.created_at.isoformat()
        }

# ==================== ROUTES ====================
@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'name': 'Expense Tracker API',
        'version': '1.0.0',
        'status': 'running'
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

# Categories
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([cat.to_dict() for cat in categories])

@app.route('/api/categories', methods=['POST'])
def create_category():
    data = request.get_json()
    try:
        cat = Category(name=data['name'], description=data.get('description'), color=data.get('color', '#3b82f6'))
        db.session.add(cat)
        db.session.commit()
        return jsonify(cat.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/categories/<int:cat_id>', methods=['PUT'])
def update_category(cat_id):
    cat = Category.query.get_or_404(cat_id)
    data = request.get_json()
    
    if 'name' in data:
        cat.name = data['name']
    if 'description' in data:
        cat.description = data['description']
    if 'color' in data:
        cat.color = data['color']
    
    db.session.commit()
    return jsonify(cat.to_dict())

@app.route('/api/categories/<int:cat_id>', methods=['DELETE'])
def delete_category(cat_id):
    try:
        cat = Category.query.get_or_404(cat_id)
        # Delete associated expenses and budget limits manually to avoid IntegrityError
        Expense.query.filter_by(category_id=cat_id).delete()
        BudgetLimit.query.filter_by(category_id=cat_id).delete()
        
        db.session.delete(cat)
        db.session.commit()
        return jsonify({'message': 'Category deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Expenses
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    skip = request.args.get('skip', 0, type=int)
    limit = request.args.get('limit', 50, type=int)
    category_id = request.args.get('category_id', type=int)
    search = request.args.get('search', '')
    
    query = Expense.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    if search:
        query = query.filter(Expense.description.ilike(f'%{search}%'))
    
    query = query.order_by(Expense.date.desc()).offset(skip).limit(limit)
    expenses = query.all()
    
    return jsonify([exp.to_dict() for exp in expenses])

@app.route('/api/expenses', methods=['POST'])
def create_expense():
    data = request.get_json()
    try:
        exp = Expense(
            description=data['description'],
            amount=data['amount'],
            category_id=data['category_id'],
            type=data.get('type', 'expense'),
            tags=data.get('tags', ''),
            date=datetime.fromisoformat(data['date']) if 'date' in data else datetime.utcnow()
        )
        db.session.add(exp)
        db.session.commit()
        return jsonify(exp.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/expenses/<int:exp_id>', methods=['PUT'])
def update_expense(exp_id):
    exp = Expense.query.get_or_404(exp_id)
    data = request.get_json()
    
    if 'description' in data:
        exp.description = data['description']
    if 'amount' in data:
        exp.amount = data['amount']
    if 'category_id' in data:
        exp.category_id = data['category_id']
    if 'type' in data:
        exp.type = data['type']
    if 'tags' in data:
        exp.tags = data['tags']
    if 'date' in data:
        exp.date = datetime.fromisoformat(data['date'])
    
    exp.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(exp.to_dict())

@app.route('/api/expenses/<int:exp_id>', methods=['DELETE'])
def delete_expense(exp_id):
    exp = Expense.query.get_or_404(exp_id)
    db.session.delete(exp)
    db.session.commit()
    return jsonify({'message': 'Expense deleted'})

# Statistics
@app.route('/api/stats', methods=['GET'])
def get_stats():
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    
    query = Expense.query
    
    if month and year:
        query = query.filter(
            extract('month', Expense.date) == month,
            extract('year', Expense.date) == year
        )
    elif year:
        query = query.filter(extract('year', Expense.date) == year)
    
    expenses = query.all()
    
    total_income = sum(e.amount for e in expenses if e.type == 'income')
    total_expenses = sum(e.amount for e in expenses if e.type == 'expense')
    current_balance = total_income - total_expenses
    
    category_breakdown = {}
    for exp in expenses:
        if exp.type == 'expense':
            cat_name = exp.category.name
            category_breakdown[cat_name] = category_breakdown.get(cat_name, 0) + exp.amount
    
    current_year = year or datetime.utcnow().year
    monthly_data = []
    for m in range(1, 13):
        month_income = db.session.query(func.sum(Expense.amount)).filter(
            extract('month', Expense.date) == m,
            extract('year', Expense.date) == current_year,
            Expense.type == 'income'
        ).scalar() or 0
        month_expense = db.session.query(func.sum(Expense.amount)).filter(
            extract('month', Expense.date) == m,
            extract('year', Expense.date) == current_year,
            Expense.type == 'expense'
        ).scalar() or 0
        monthly_data.append({
            'month': m, 
            'income': float(month_income),
            'expense': float(month_expense),
            'total': float(month_expense) # fallback for old charts
        })
    
    budget_alerts = []
    if month and year:
        limits = BudgetLimit.query.filter_by(month=month, year=year).all()
        for limit in limits:
            cat_total = sum(e.amount for e in expenses if e.category_id == limit.category_id and e.type == 'expense')
            if cat_total > limit.amount:
                budget_alerts.append({
                    'category': limit.category.name,
                    'limit': limit.amount,
                    'spent': cat_total,
                    'exceeded_by': cat_total - limit.amount
                })
    
    return jsonify({
        'total_income': total_income,
        'total_expenses': total_expenses,
        'current_balance': current_balance,
        'category_breakdown': category_breakdown,
        'monthly_data': monthly_data,
        'budget_alerts': budget_alerts
    })

# Budget Limits
@app.route('/api/budget-limits', methods=['POST'])
def create_budget_limit():
    data = request.get_json()
    try:
        budget = BudgetLimit(
            category_id=data['category_id'],
            amount=data['amount'],
            month=data['month'],
            year=data['year']
        )
        db.session.add(budget)
        db.session.commit()
        return jsonify(budget.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/budget-limits', methods=['GET'])
def get_budget_limits():
    budgets = BudgetLimit.query.all()
    return jsonify([b.to_dict() for b in budgets])

@app.route('/api/budget-limits/<int:budget_id>', methods=['DELETE'])
def delete_budget_limit(budget_id):
    budget = BudgetLimit.query.get_or_404(budget_id)
    db.session.delete(budget)
    db.session.commit()
    return jsonify({'message': 'Budget limit deleted'})

# Export
@app.route('/api/expenses/export/csv', methods=['GET'])
def export_csv():
    import csv
    from io import StringIO
    from flask import send_file
    
    expenses = Expense.query.order_by(Expense.date.desc()).all()
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Date', 'Type', 'Description', 'Amount', 'Category', 'Tags'])
    
    for exp in expenses:
        writer.writerow([
            exp.date.strftime('%Y-%m-%d'),
            exp.type.capitalize(),
            exp.description,
            f'${exp.amount:.2f}',
            exp.category.name,
            exp.tags
        ])
    
    output.seek(0)
    return send_file(
        StringIO(output.getvalue()),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'expenses-{datetime.now().strftime("%Y-%m-%d")}.csv'
    )

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database initialized")
    app.run(debug=True, host='0.0.0.0', port=8000)

