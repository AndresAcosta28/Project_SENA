from app import db, seed_db

# Crea todas las tablas
db.create_all()

# Carga los datos de ejemplo
seed_db()

print("Base de datos inicializada y datos de ejemplo cargados")
