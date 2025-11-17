from flask import Flask
from src.app import create_app

# Elastic Beanstalk necesita esta variable exacta
application = create_app()

# Para correr localmente
if __name__ == "__main__":
    application.run(host="0.0.0.0", port=5000)