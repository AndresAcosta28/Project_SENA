from flask import Flask, jsonify
from flask_cors import CORS
import os
import pymysql

def create_app():
    app = Flask(__name__)
    CORS(app)  # ← Habilita CORS para todos los orígenes

    @app.route("/")
    def home():
        return jsonify({"message": "Backend funcionando desde Elastic Beanstalk"})

    return app
