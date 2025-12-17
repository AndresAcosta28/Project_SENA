from app import db, seed_db

# Crea todas las tablas
db.create_all()

# Carga los datos de ejemplo
seed_db()

print("Base de datos inicializada y datos de ejemplo cargados")

# Verificar si ya hay empleados
empleados_count = Usuario.query.count()
if empleados_count == 0:
    print("⚠️ No hay empleados. Creando empleados de prueba...")
    seed_empleados()