from flask import request, jsonify, session
from .config import app, db
from sqlalchemy import desc
from .models import User, Email
from .helpers import login_required
from werkzeug.security import generate_password_hash, check_password_hash
import joblib

# Modeli uygulama başlatıldığında yükle
model = joblib.load('model/model.pkl')

@app.route('/')
def index():
    return jsonify({"message": "Welcome to the IsMailSpam app!"})

@app.route('/check_auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'authenticated': True,
                'user': user.to_json()
            }), 200
    return jsonify({'authenticated': False}), 200

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
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

        return jsonify({"message": "User registered successfully", "user": new_user.to_json()}), 200
    else:
        return jsonify({"message": "Please register"}), 200

@app.route('/login', methods=['POST', 'GET'])
def login():
    print("Request method:", request.method)
    print("Headers:", request.headers)
    print("JSON Body:", request.get_data())

    if request.method == 'POST':
        data = request.get_json(force=True, silent=True)
        print("Parsed JSON:", data)

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Missing required fields"}), 400

        user = User.query.filter_by(username=username).first()

        if not user or not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid username or password"}), 401
        
        # Session'a kullanıcı ID'sini kaydet
        session['user_id'] = user.id
        session['username'] = user.username
        
        response = jsonify({"message": "Login successful", "user": user.to_json()})
        
        return response, 200

    else:
        return jsonify({"message": "Please log in"}), 200

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/change-password', methods=['POST', 'GET'])
@login_required
def change_password():
    if request.method == 'POST':
        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        # Session'dan kullanıcı ID'sini al
        user_id = session.get('user_id')

        if not old_password or not new_password:
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
            db.session.rollback()
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
    
    # Kullanıcıya ait e-posta verilerini almak
    emails = Email.query.filter_by(recipient_id=user_id, is_spam=False, is_archived=False).order_by(desc(Email.created_at)).all()

    # Eğer hiç e-posta yoksa
    if not emails:
        return jsonify({"emails": []}), 200  # 404 yerine boş liste dön

    # E-postaların JSON formatında döndürülmesi
    return jsonify({
        "emails": [email.to_json() for email in emails]
    })

@app.route('/emails/sent', methods=['GET'])
@login_required
def get_sent_emails():
    user_id = session.get('user_id')
    
    sent_emails = Email.query.filter_by(sender_id=user_id, is_archived=False).order_by(desc(Email.created_at)).all()
    sent_emails_json = [email.to_json() for email in sent_emails]
    
    return jsonify({"sent_emails": sent_emails_json}), 200

@app.route('/emails/read', methods=['GET'])
@login_required
def get_read_emails():
    user_id = session.get('user_id')
    
    read_emails = Email.query.filter_by(recipient_id=user_id, is_read=True, is_spam=False).order_by(desc(Email.created_at)).all()
    read_emails_json = [email.to_json() for email in read_emails]
    
    return jsonify({"read_emails": read_emails_json}), 200

@app.route('/emails/received', methods=['GET'])
@login_required
def get_received_emails():
    user_id = session.get('user_id')
    
    received_emails = Email.query.filter_by(recipient_id=user_id, is_spam=False, is_archived=False).order_by(desc(Email.created_at)).all()
    received_emails_json = [email.to_json() for email in received_emails]
    
    return jsonify({"received_emails": received_emails_json}), 200

@app.route('/emails/spam', methods=['GET'])
@login_required
def get_spam_emails():
    user_id = session.get('user_id')
    
    spam_emails = Email.query.filter_by(recipient_id=user_id, is_spam=True).order_by(desc(Email.created_at)).all()
    spam_emails_json = [email.to_json() for email in spam_emails]
    
    return jsonify({"spam_emails": spam_emails_json}), 200

@app.route('/emails/archived', methods=['GET'])
@login_required
def get_archived_emails():
    user_id = session.get('user_id')
    
    archived_emails = Email.query.filter_by(recipient_id=user_id, is_archived=True).order_by(desc(Email.created_at)).all()
    archived_emails_json = [email.to_json() for email in archived_emails]
    
    return jsonify({"archived_emails": archived_emails_json}), 200

@app.route('/emails/<int:email_id>', methods=['GET'])
@login_required
def get_email_details(email_id):
    user_id = session.get('user_id')
    
    email = Email.query.filter_by(id=email_id).first()
    if not email:
        return jsonify({"error": "Email not found"}), 404
    
    # Kullanıcı bu emailin alıcısı veya göndericisi mi kontrol et
    if email.recipient_id != user_id and email.sender_id != user_id:
        return jsonify({"error": "Unauthorized access"}), 403
    
    return jsonify(email.to_json()), 200

@app.route('/send_email', methods=['POST', 'GET'])
@login_required
def send_email():
    if request.method == 'POST':
        user_id = session.get('user_id')
        
        data = request.get_json()
        recipient_id = data.get('recipient_id')
        subject = data.get('subject')
        body = data.get('body')

        if not subject or not body:
            return jsonify({"error": "Missing required fields"}), 400

        if not recipient_id or not subject or not body:
            return jsonify({"error": "Missing required fields"}), 400

        # Kullanıcılar mevcut mu kontrol et
        recipient = User.query.get(recipient_id)

        if not recipient:
            return jsonify({"error": "Invalid recipient"}), 404

        # Modeli kullanarak spam olup olmadığını tahmin et
        is_spam = False
        try:
            is_spam = bool(model.predict([body])[0]) or bool(model.predict([subject])[0])
        except Exception as e:
            # Model hatası olursa, spam olmadığını varsay ve devam et
            print(f"Spam detection error: {str(e)}")

        new_email = Email(
            sender_id=user_id,
            recipient_id=recipient_id,
            subject=subject,
            body=body,
            is_spam=is_spam
        )

        db.session.add(new_email)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

        return jsonify({"message": "Email sent successfully", "email": new_email.to_json()}), 200
    else:
        return jsonify({"message": "Please send an email"}), 200

@app.route('/email/<int:email_id>/action', methods=['POST'])
@login_required
def email_action(email_id):
    user_id = session.get('user_id')
    data = request.get_json()
    action = data.get('action')

    email = Email.query.filter_by(id=email_id).first()
    if not email:
        return jsonify({"error": "Email not found"}), 404

    # E-postayı arşivleyecek veya silecek kişinin alıcı olması gerekir
    if action in ['archive', 'unarchive', 'delete'] and email.recipient_id != user_id:
        return jsonify({"error": "Unauthorized action"}), 403
    
    # Göndericinin sadece kendi kopyasını işaretlemesine izin verelim
    if action in ['read', 'unread'] and email.recipient_id != user_id and email.sender_id != user_id:
        return jsonify({"error": "Unauthorized access"}), 403

    if action == 'archive':
        email.is_archived = True
    elif action == 'unarchive':
        email.is_archived = False
    elif action == 'read':
        email.is_read = True
    elif action == 'unread':
        email.is_read = False
    elif action == 'delete':
        db.session.delete(email)
    else:
        return jsonify({"error": "Invalid action"}), 400

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": f"Email {action}d successfully"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
