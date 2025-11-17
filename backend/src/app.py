from flask import Flask, jsonify
import os
import pymysql

def create_app():
    app = Flask(__name__)

    @app.route("/")
    def home():
        return jsonify({"message": "Backend funcionando desde Elastic Beanstalk"})

    return app
