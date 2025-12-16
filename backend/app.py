from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)

# Configuración de la base de datos PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL', 
    'postgresql://postgres:contraseña@localhost:5432/restaurante_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelos de la base de datos

class Mesa(db.Model):
    __tablename__ = 'mesas'
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.Integer, unique=True, nullable=False)
    capacidad = db.Column(db.Integer, nullable=False)
    disponible = db.Column(db.Boolean, default=True)
    reservas = db.relationship('Reserva', backref='mesa', lazy=True)

class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    reservas = db.relationship('Reserva', backref='cliente', lazy=True)

class Reserva(db.Model):
    __tablename__ = 'reservas'
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    mesa_id = db.Column(db.Integer, db.ForeignKey('mesas.id'), nullable=False)
    fecha_hora = db.Column(db.DateTime, nullable=False)
    num_personas = db.Column(db.Integer, nullable=False)
    estado = db.Column(db.String(20), default='pendiente')  # pendiente, confirmada, cancelada
    notas = db.Column(db.Text)
    creada_en = db.Column(db.DateTime, default=datetime.utcnow)

class Categoria(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)
    platos = db.relationship('Plato', backref='categoria', lazy=True)

class Plato(db.Model):
    __tablename__ = 'platos'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Float, nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=False)
    disponible = db.Column(db.Boolean, default=True)
    imagen_url = db.Column(db.String(200))

# Rutas de la API

# ===== RESERVAS =====

@app.route('/health')
def health_check():
    try:
        # Intentar una consulta simple
        db.session.execute('SELECT 1')
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

@app.route('/')
def index():
    return jsonify({"mensaje": "API corriendo"}), 200

@app.route('/api/reservas', methods=['GET'])
def obtener_reservas():
    reservas = Reserva.query.all()
    return jsonify([{
        'id': r.id,
        'cliente': {'id': r.cliente.id, 'nombre': r.cliente.nombre, 'email': r.cliente.email},
        'mesa': {'id': r.mesa.id, 'numero': r.mesa.numero},
        'fecha_hora': r.fecha_hora.isoformat(),
        'num_personas': r.num_personas,
        'estado': r.estado,
        'notas': r.notas
    } for r in reservas])

@app.route('/api/reservas/<int:id>', methods=['GET'])
def obtener_reserva(id):
    reserva = Reserva.query.get_or_404(id)
    return jsonify({
        'id': reserva.id,
        'cliente': {'id': reserva.cliente.id, 'nombre': reserva.cliente.nombre},
        'mesa': {'id': reserva.mesa.id, 'numero': reserva.mesa.numero},
        'fecha_hora': reserva.fecha_hora.isoformat(),
        'num_personas': reserva.num_personas,
        'estado': reserva.estado,
        'notas': reserva.notas
    })

@app.route('/api/reservas', methods=['POST'])
def crear_reserva():
    data = request.json
    
    # Validar cliente
    cliente = Cliente.query.filter_by(email=data['email']).first()
    if not cliente:
        cliente = Cliente(
            nombre=data['nombre'],
            email=data['email'],
            telefono=data['telefono']
        )
        db.session.add(cliente)
        db.session.flush()
    
    # Crear reserva
    nueva_reserva = Reserva(
        cliente_id=cliente.id,
        mesa_id=data['mesa_id'],
        fecha_hora=datetime.fromisoformat(data['fecha_hora']),
        num_personas=data['num_personas'],
        notas=data.get('notas', '')
    )
    
    db.session.add(nueva_reserva)
    db.session.commit()
    
    return jsonify({'mensaje': 'Reserva creada exitosamente', 'id': nueva_reserva.id}), 201

@app.route('/api/reservas/<int:id>', methods=['PUT'])
def actualizar_reserva(id):
    reserva = Reserva.query.get_or_404(id)
    data = request.json
    
    if 'mesa_id' in data:
        reserva.mesa_id = data['mesa_id']
    if 'fecha_hora' in data:
        reserva.fecha_hora = datetime.fromisoformat(data['fecha_hora'])
    if 'num_personas' in data:
        reserva.num_personas = data['num_personas']
    if 'estado' in data:
        reserva.estado = data['estado']
    if 'notas' in data:
        reserva.notas = data['notas']
    
    db.session.commit()
    return jsonify({'mensaje': 'Reserva actualizada exitosamente'})

@app.route('/api/reservas/<int:id>', methods=['DELETE'])
def eliminar_reserva(id):
    reserva = Reserva.query.get_or_404(id)
    db.session.delete(reserva)
    db.session.commit()
    return jsonify({'mensaje': 'Reserva eliminada exitosamente'})

# ===== MESAS =====

@app.route('/api/mesas', methods=['GET'])
def obtener_mesas():
    mesas = Mesa.query.all()
    return jsonify([{
        'id': m.id,
        'numero': m.numero,
        'capacidad': m.capacidad,
        'disponible': m.disponible
    } for m in mesas])

@app.route('/api/mesas', methods=['POST'])
def crear_mesa():
    data = request.json
    nueva_mesa = Mesa(
        numero=data['numero'],
        capacidad=data['capacidad']
    )
    db.session.add(nueva_mesa)
    db.session.commit()
    return jsonify({'mensaje': 'Mesa creada exitosamente', 'id': nueva_mesa.id}), 201

@app.route('/api/mesas/<int:id>', methods=['PUT'])
def actualizar_mesa(id):
    mesa = Mesa.query.get_or_404(id)
    data = request.json
    
    if 'numero' in data:
        mesa.numero = data['numero']
    if 'capacidad' in data:
        mesa.capacidad = data['capacidad']
    if 'disponible' in data:
        mesa.disponible = data['disponible']
    
    db.session.commit()
    return jsonify({'mensaje': 'Mesa actualizada exitosamente'})

# ===== PLATOS =====

@app.route('/api/platos', methods=['GET'])
def obtener_platos():
    platos = Plato.query.all()
    return jsonify([{
        'id': p.id,
        'nombre': p.nombre,
        'descripcion': p.descripcion,
        'precio': p.precio,
        'categoria': {'id': p.categoria.id, 'nombre': p.categoria.nombre},
        'disponible': p.disponible,
        'imagen_url': p.imagen_url
    } for p in platos])

@app.route('/api/platos/<int:id>', methods=['GET'])
def obtener_plato(id):
    plato = Plato.query.get_or_404(id)
    return jsonify({
        'id': plato.id,
        'nombre': plato.nombre,
        'descripcion': plato.descripcion,
        'precio': plato.precio,
        'categoria': {'id': plato.categoria.id, 'nombre': plato.categoria.nombre},
        'disponible': plato.disponible,
        'imagen_url': plato.imagen_url
    })

@app.route('/api/platos', methods=['POST'])
def crear_plato():
    data = request.json
    nuevo_plato = Plato(
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        precio=data['precio'],
        categoria_id=data['categoria_id'],
        imagen_url=data.get('imagen_url', '')
    )
    db.session.add(nuevo_plato)
    db.session.commit()
    return jsonify({'mensaje': 'Plato creado exitosamente', 'id': nuevo_plato.id}), 201

@app.route('/api/platos/<int:id>', methods=['PUT'])
def actualizar_plato(id):
    plato = Plato.query.get_or_404(id)
    data = request.json
    
    if 'nombre' in data:
        plato.nombre = data['nombre']
    if 'descripcion' in data:
        plato.descripcion = data['descripcion']
    if 'precio' in data:
        plato.precio = data['precio']
    if 'categoria_id' in data:
        plato.categoria_id = data['categoria_id']
    if 'disponible' in data:
        plato.disponible = data['disponible']
    if 'imagen_url' in data:
        plato.imagen_url = data['imagen_url']
    
    db.session.commit()
    return jsonify({'mensaje': 'Plato actualizado exitosamente'})

@app.route('/api/platos/<int:id>', methods=['DELETE'])
def eliminar_plato(id):
    plato = Plato.query.get_or_404(id)
    db.session.delete(plato)
    db.session.commit()
    return jsonify({'mensaje': 'Plato eliminado exitosamente'})

# ===== CATEGORÍAS =====

@app.route('/api/categorias', methods=['GET'])
def obtener_categorias():
    categorias = Categoria.query.all()
    return jsonify([{
        'id': c.id,
        'nombre': c.nombre
    } for c in categorias])

@app.route('/api/categorias', methods=['POST'])
def crear_categoria():
    data = request.json
    nueva_categoria = Categoria(nombre=data['nombre'])
    db.session.add(nueva_categoria)
    db.session.commit()
    return jsonify({'mensaje': 'Categoría creada exitosamente', 'id': nueva_categoria.id}), 201

# ===== CLIENTES =====

@app.route('/api/clientes', methods=['GET'])
def obtener_clientes():
    clientes = Cliente.query.all()
    return jsonify([{
        'id': c.id,
        'nombre': c.nombre,
        'email': c.email,
        'telefono': c.telefono
    } for c in clientes])

# Inicialización de la base de datos
def init_db():
    """Inicializa la base de datos"""
    db.create_all()
    print("Base de datos inicializada")

@app.cli.command()
def seed_db():
    """Carga datos de ejemplo"""
    # Categorías
    categorias = [
        Categoria(nombre='Entradas'),
        Categoria(nombre='Platos Principales'),
        Categoria(nombre='Postres'),
        Categoria(nombre='Bebidas')
    ]
    db.session.add_all(categorias)
    db.session.commit()
    
    # Platos
    platos = [
        Plato(nombre='Ensalada César', descripcion='Lechuga romana con aderezo césar', precio=8.50, categoria_id=1, disponible=True),
        Plato(nombre='Sopa del día', descripcion='Consultar con el mesero', precio=6.00, categoria_id=1, disponible=True),
        Plato(nombre='Filete de res', descripcion='Con papas y vegetales', precio=25.00, categoria_id=2, disponible=True),
        Plato(nombre='Pasta carbonara', descripcion='Pasta fresca con salsa carbonara', precio=15.00, categoria_id=2, disponible=True),
        Plato(nombre='Tiramisú', descripcion='Postre italiano clásico', precio=7.00, categoria_id=3, disponible=True),
        Plato(nombre='Jugo natural', descripcion='Varios sabores disponibles', precio=4.00, categoria_id=4, disponible=True)
    ]
    db.session.add_all(platos)
    
    # Mesas
    mesas = [
        Mesa(numero=1, capacidad=2),
        Mesa(numero=2, capacidad=4),
        Mesa(numero=3, capacidad=4),
        Mesa(numero=4, capacidad=6),
        Mesa(numero=5, capacidad=8)
    ]
    db.session.add_all(mesas)
    db.session.commit()
    print("Datos de ejemplo cargados")

# Inicialización automática para Render
def init_render_db():
    """Inicializa la base de datos y opcionalmente carga datos de ejemplo en Render"""
    with app.app_context():
        try:
            db.create_all()
            print("Base de datos inicializada automáticamente en Render")
            # Descomenta la siguiente línea si quieres cargar datos de ejemplo
            # seed_db()
        except Exception as e:
            print("Base de datos ya estaba inicializada o hubo un error:", e)

# Esto se ejecuta al iniciar la app
if __name__ == '__main__':
    # Detecta si estamos en producción (Render)
    if os.getenv("FLASK_ENV") == "production":
        init_render_db()
        # No habilitamos debug en producción
        app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
    else:
        # Local
        app.run(debug=True, host='0.0.0.0', port=5000)