from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # ✅ IMPORTAR CORS
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
import os


app = Flask(__name__)

# ✅ CONFIGURAR CORS - PERMITIR PETICIONES DESDE VERCEL
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # En producción, cambia * por tu dominio de Vercel
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Configuración de la base de datos PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
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

# ===== HEALTH CHECK =====

@app.route('/health')
def health_check():
    try:
        # Intentar una consulta simple
        db.session.execute(text('SELECT 1'))
        return jsonify({"status": "ok", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

@app.route('/')
def index():
    return jsonify({
        "mensaje": "API del Restaurante corriendo",
        "endpoints": {
            "mesas": "/api/mesas",
            "reservas": "/api/reservas",
            "platos": "/api/platos",
            "categorias": "/api/categorias",
            "clientes": "/api/clientes"
        }
    }), 200

# ===== RESERVAS =====

@app.route('/api/reservas', methods=['GET'])
def obtener_reservas():
    try:
        reservas = Reserva.query.all()
        return jsonify([{
            'id': r.id,
            'cliente': {'id': r.cliente.id, 'nombre': r.cliente.nombre, 'email': r.cliente.email},
            'mesa': {'id': r.mesa.id, 'numero': r.mesa.numero},
            'fecha_hora': r.fecha_hora.isoformat(),
            'num_personas': r.num_personas,
            'estado': r.estado,
            'notas': r.notas
        } for r in reservas]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    try:
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
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/reservas/<int:id>', methods=['PUT'])
def actualizar_reserva(id):
    try:
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
        return jsonify({'mensaje': 'Reserva actualizada exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/reservas/<int:id>', methods=['DELETE'])
def eliminar_reserva(id):
    try:
        reserva = Reserva.query.get_or_404(id)
        db.session.delete(reserva)
        db.session.commit()
        return jsonify({'mensaje': 'Reserva eliminada exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ===== MESAS =====

@app.route('/api/mesas', methods=['GET'])
def obtener_mesas():
    try:
        mesas = Mesa.query.all()
        resultado = [{
            'id': m.id,
            'numero': m.numero,
            'capacidad': m.capacidad,
            'disponible': m.disponible
        } for m in mesas]
        print(f"✅ Enviando {len(resultado)} mesas")  # Log para debug
        return jsonify(resultado), 200
    except Exception as e:
        print(f"❌ Error obteniendo mesas: {str(e)}")  # Log para debug
        return jsonify({"error": str(e)}), 500

@app.route('/api/mesas', methods=['POST'])
def crear_mesa():
    try:
        data = request.json
        nueva_mesa = Mesa(
            numero=data['numero'],
            capacidad=data['capacidad']
        )
        db.session.add(nueva_mesa)
        db.session.commit()
        return jsonify({'mensaje': 'Mesa creada exitosamente', 'id': nueva_mesa.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/mesas/<int:id>', methods=['PUT'])
def actualizar_mesa(id):
    try:
        mesa = Mesa.query.get_or_404(id)
        data = request.json
        
        if 'numero' in data:
            mesa.numero = data['numero']
        if 'capacidad' in data:
            mesa.capacidad = data['capacidad']
        if 'disponible' in data:
            mesa.disponible = data['disponible']
        
        db.session.commit()
        return jsonify({'mensaje': 'Mesa actualizada exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ===== PLATOS =====

@app.route('/api/platos', methods=['GET'])
def obtener_platos():
    try:
        platos = Plato.query.all()
        return jsonify([{
            'id': p.id,
            'nombre': p.nombre,
            'descripcion': p.descripcion,
            'precio': p.precio,
            'categoria': {'id': p.categoria.id, 'nombre': p.categoria.nombre},
            'disponible': p.disponible,
            'imagen_url': p.imagen_url
        } for p in platos]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    try:
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
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/platos/<int:id>', methods=['PUT'])
def actualizar_plato(id):
    try:
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
        return jsonify({'mensaje': 'Plato actualizado exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/platos/<int:id>', methods=['DELETE'])
def eliminar_plato(id):
    try:
        plato = Plato.query.get_or_404(id)
        db.session.delete(plato)
        db.session.commit()
        return jsonify({'mensaje': 'Plato eliminado exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ===== CATEGORÍAS =====

@app.route('/api/categorias', methods=['GET'])
def obtener_categorias():
    try:
        categorias = Categoria.query.all()
        return jsonify([{
            'id': c.id,
            'nombre': c.nombre
        } for c in categorias]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categorias', methods=['POST'])
def crear_categoria():
    try:
        data = request.json
        nueva_categoria = Categoria(nombre=data['nombre'])
        db.session.add(nueva_categoria)
        db.session.commit()
        return jsonify({'mensaje': 'Categoría creada exitosamente', 'id': nueva_categoria.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ===== CLIENTES =====

@app.route('/api/clientes', methods=['GET'])
def obtener_clientes():
    try:
        clientes = Cliente.query.all()
        return jsonify([{
            'id': c.id,
            'nombre': c.nombre,
            'email': c.email,
            'telefono': c.telefono
        } for c in clientes]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
            print("✅ Base de datos inicializada automáticamente en Render")
            
            # Verificar si ya hay mesas
            mesas_count = Mesa.query.count()
            if mesas_count == 0:
                print("⚠️ No hay mesas en la base de datos. Cargando datos de ejemplo...")
                seed_db()
            else:
                print(f"✅ Base de datos tiene {mesas_count} mesas")
                
        except Exception as e:
            print(f"❌ Error al inicializar base de datos: {e}")

# Esto se ejecuta al iniciar la app
if __name__ == '__main__':
    # Inicializar DB en cualquier entorno
    init_render_db()
    
    # Detecta si estamos en producción (Render)
    if os.getenv("FLASK_ENV") == "production":
        # No habilitamos debug en producción
        app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
    else:
        # Local
        app.run(debug=True, host='0.0.0.0', port=5000)