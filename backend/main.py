from flask import request, jsonify, session
from config import app, db
from models import User, Email
from helpers import login_required
from werkzeug.security import generate_password_hash, check_password_hash
import joblib

# Modeli uygulama başlatıldığında yükle
model = joblib.load('model/model.pkl')

@app.route('/')
def index():
    return jsonify({"message": "Welcome to the IsMailSpam app!"})


@app.route('/register', methods=['POST', 'GET'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

        if not username or not email or not password or not confirm_password:
            return jsonify({"error": "Missing required fields"}), 400

        if password != confirm_password:
            return jsonify({"error": "Passwords do not match"}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()  # Hata durumunda rollback yap
            return jsonify({"error": str(e)}), 500

        return jsonify({"message": "User registered successfully", "user": new_user.to_json()}), 200
    else:
        return jsonify({"message": "Please register"}), 200


@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Missing required fields"}), 400

        user = User.query.filter_by(username=username).first()

        if not user or not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid username or password"}), 401
        
        response = jsonify({"message": "Login successful", "user": user.to_json()})
        response.set_cookie('session_id', httponly=True, secure=False)
        
        return response, 200

    else:
        return jsonify({"message": "Please log in"}), 200
    

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200


@app.route('/change_password', methods=['POST', 'GET'])
@login_required
def change_password():
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not user_id or not old_password or not new_password:
            return jsonify({"error": "Missing required fields"}), 400
        
        if old_password == new_password:
            return jsonify({"error": "New password cannot be the same as old password"}), 400

        user = User.query.get(user_id)

        if not user or not check_password_hash(user.password, old_password):
            return jsonify({"error": "Old password is incorrect"}), 401

        user.password = generate_password_hash(new_password)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()  # Hata durumunda rollback yap
            return jsonify({"error": str(e)}), 500

        return jsonify({"message": "Password changed successfully"}), 200
    else:
        return jsonify({"message": "Please change your password"}), 200
    

@app.route('/users', methods=['GET'])
@login_required
def get_users():
    users = User.query.all()
    users_json = [user.to_json() for user in users]
    
    return jsonify({"users": users_json}), 200


@app.route('/emails', methods=['GET'])
@login_required
def get_emails():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401
    
    # Kullanıcıya ait e-posta verilerini almak
    emails = Email.query.filter_by(recipient_id=user_id).all()

    # Eğer hiç e-posta yoksa
    if not emails:
        return jsonify({"error": "No emails found"}), 404

    # E-postaların JSON formatında döndürülmesi
    return jsonify({
        "emails": [email.to_json() for email in emails]
    })


@app.route('/emails/sent', methods=['GET'])
@login_required
def get_sent_emails():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing required fields"}), 400
    
    sent_emails = Email.query.filter_by(sender_id=user_id).all()
    sent_emails_json = [email.to_json() for email in sent_emails]
    
    return jsonify({"sent_emails": sent_emails_json}), 200


@app.route('/emails/received', methods=['GET'])
@login_required
def get_received_emails():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing required fields"}), 400
    
    received_emails = Email.query.filter_by(recipient_id=user_id).all()
    received_emails_json = [email.to_json() for email in received_emails]
    
    return jsonify({"received_emails": received_emails_json}), 200


@app.route('/emails/spam', methods=['GET'])
@login_required
def get_spam_emails():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing required fields"}), 400
    
    spam_emails = Email.query.filter_by(recipient_id=user_id, is_spam=True).all()
    spam_emails_json = [email.to_json() for email in spam_emails]
    
    return jsonify({"spam_emails": spam_emails_json}), 200


@app.route('/emails/<int:email_id>', methods=['GET'])
@login_required
def get_email_details(email_id):
    email = Email.query.get(email_id)
    if not email:
        return jsonify({"error": "Email not found"}), 404
    
    return jsonify(email.to_json()), 200


@app.route('/send_email', methods=['POST', 'GET'])
@login_required
def send_email():
    if request.method == 'POST':
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "User not logged in"}), 401
        
        data = request.get_json()
        sender_id = data.get('sender_id')
        recipient_id = data.get('recipient_id')
        subject = data.get('subject')
        body = data.get('body')

        if user_id != sender_id:
            return jsonify({"error": "You can only send emails from your own account"}), 400

        if not sender_id or not recipient_id or not subject or not body:
            return jsonify({"error": "Missing required fields"}), 400

        # Kullanıcılar mevcut mu kontrol et
        sender = User.query.get(sender_id)
        recipient = User.query.get(recipient_id)

        if not sender or not recipient:
            return jsonify({"error": "Invalid sender or recipient"}), 404

        # Modeli kullanarak spam olup olmadığını tahmin et
        is_spam = bool(model.predict([body])[0])

        new_email = Email(
            sender_id=sender_id,
            recipient_id=recipient_id,
            subject=subject,
            body=body,
            is_spam=is_spam
        )

        db.session.add(new_email)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()  # Hata durumunda rollback yap
            return jsonify({"error": str(e)}), 500

        return jsonify({"message": "Email sent successfully", "email": new_email.to_json()}), 200
    else:
        return jsonify({"message": "Please send an email"}), 200
    

@app.route('/email/<int:email_id>', methods=['DELETE', 'POST', 'PUT'])
@login_required
def modify_email(email_id):
    action = request.args.get('action')
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    email = Email.query.filter_by(id=email_id, recipient_id=user_id).first()
    if not email:
        return jsonify({"error": "Email not found"}), 404

    if action == 'archive':
        email.archived = True  # Arşivle
    elif action == 'unarchive':
        email.archived = False  # Arşivden çıkar
    elif action == 'read':
        email.read = True  # Okundu olarak işaretle
    elif action == 'delete':
        db.session.delete(email)  # Sil
    else:
        return jsonify({"error": "Invalid action"}), 400

    db.session.commit()
    return jsonify({"message": f"Email {action}d successfully"}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
