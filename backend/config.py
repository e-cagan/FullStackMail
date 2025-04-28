from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "https://full-stack-mail.vercel.app", "https://full-stack-mail-git-master-emin-cagan-apaydins-projects.vercel.app"])

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev_default_key")

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SECURE"] = True  # Development için False, production için True
app.config["SESSION_COOKIE_SAMESITE"] = "None"

db = SQLAlchemy(app)