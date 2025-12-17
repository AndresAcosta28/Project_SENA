const API_URL = "https://restaurante-backend-s93j.onrender.com";

// Variables globales
let fechaActual = new Date();
let fechaSeleccionada = null;
let horarioSeleccionado = null;
let todasReservas = [];

const HORARIOS = ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00"];
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
               "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// ========== INICIALIZACIÓN ==========

document.addEventListener('DOMContentLoaded', () => {
    cargarReservas();
    renderizarCalendario();
    
    document.getElementById('form-reserva').addEventListener('submit', crearReserva);
    document.getElementById('personas').addEventListener('change', actualizarMesas);
});

// ========== FUNCIONES DE CALENDARIO ==========

function renderizarCalendario() {
    const calendario = document.getElementById('calendario');
    const mesActual = document.getElementById('mes-actual');
    
    mesActual.textContent = `${MESES[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
    
    // Limpiar calendario
    calendario.innerHTML = '';
    
    // Headers de días
    DIAS_SEMANA.forEach(dia => {
        const header = document.createElement('div');
        header.className = 'dia-header';
        header.textContent = dia;
        calendario.appendChild(header);
    });
    
    // Obtener primer día del mes
    const primerDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
    
    // Espacios en blanco antes del primer día
    for (let i = 0; i < primerDia.getDay(); i++) {
        const espacio = document.createElement('div');
        calendario.appendChild(espacio);
    }
    
    // Días del mes
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
        const diaDiv = document.createElement('div');
        diaDiv.className = 'dia';
        
        // Deshabilitar días pasados
        if (fecha < hoy) {
            diaDiv.classList.add('disabled');
        } else {
            diaDiv.onclick = () => seleccionarFecha(fecha);
        }
        
        const numero = document.createElement('div');
        numero.className = 'dia-numero';
        numero.textContent = dia;
        diaDiv.appendChild(numero);
        
        // Mostrar cantidad de reservas
        const reservasEnFecha = contarReservasEnFecha(fecha);
        if (reservasEnFecha > 0) {
            diaDiv.classList.add('con-reservas');
            const badge = document.createElement('div');
            badge.className = 'dia-reservas';
            badge.textContent = `${reservasEnFecha} reserva${reservasEnFecha > 1 ? 's' : ''}`;
            diaDiv.appendChild(badge);
        }
        
        calendario.appendChild(diaDiv);
    }
}

function contarReservasEnFecha(fecha) {
    return todasReservas.filter(r => {
        const fechaReserva = new Date(r.fecha_hora);
        return fechaReserva.toDateString() === fecha.toDateString() && 
               r.estado !== 'cancelada';
    }).length;
}

function seleccionarFecha(fecha) {
    fechaSeleccionada = fecha;
    
    // Actualizar UI
    document.querySelectorAll('.dia').forEach(d => d.classList.remove('selected'));
    event.target.closest('.dia').classList.add('selected');
    
    document.getElementById('fecha-seleccionada').textContent = 
        fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    document.getElementById('form-container').style.display = 'block';
    
    // Renderizar horarios
    renderizarHorarios();
}

function renderizarHorarios() {
    const grid = document.getElementById('horarios-grid');
    grid.innerHTML = '';
    
    HORARIOS.forEach(hora => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'horario-btn';
        btn.textContent = hora;
        
        // Verificar disponibilidad
        const disponible = verificarDisponibilidadHorario(fechaSeleccionada, hora);
        btn.disabled = !disponible;
        
        if (disponible) {
            btn.onclick = () => seleccionarHorario(hora, btn);
        }
        
        grid.appendChild(btn);
    });
}

function verificarDisponibilidadHorario(fecha, hora) {
    const fechaHora = new Date(fecha);
    const [h, m] = hora.split(':');
    fechaHora.setHours(parseInt(h), parseInt(m), 0, 0);
    
    // Contar reservas en este horario
    const reservasEnHorario = todasReservas.filter(r => {
        const fechaReserva = new Date(r.fecha_hora);
        return fechaReserva.getTime() === fechaHora.getTime() && 
               r.estado !== 'cancelada';
    }).length;
    
    // Si hay 5 o más reservas, no hay disponibilidad (todas las mesas ocupadas)
    return reservasEnHorario < 5;
}

function seleccionarHorario(hora, btn) {
    horarioSeleccionado = hora;
    
    document.querySelectorAll('.horario-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    actualizarMesas();
}

async function actualizarMesas() {
    const mesaSelect = document.getElementById('mesa');
    const personas = parseInt(document.getElementById('personas').value);
    
    if (!horarioSeleccionado || !personas) {
        mesaSelect.innerHTML = '<option value="">Primero selecciona horario y personas</option>';
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/api/mesas`);
        const mesas = await res.json();
        
        // Obtener mesas ocupadas en este horario
        const fechaHora = new Date(fechaSeleccionada);
        const [h, m] = horarioSeleccionado.split(':');
        fechaHora.setHours(parseInt(h), parseInt(m), 0, 0);
        
        const mesasOcupadas = todasReservas
            .filter(r => {
                const fr = new Date(r.fecha_hora);
                return fr.getTime() === fechaHora.getTime() && r.estado !== 'cancelada';
            })
            .map(r => r.mesa.id);
        
        // Filtrar mesas disponibles
        const mesasDisponibles = mesas.filter(m => 
            m.capacidad >= personas && 
            !mesasOcupadas.includes(m.id)
        );
        
        mesaSelect.innerHTML = '<option value="">Seleccione una mesa</option>';
        
        if (mesasDisponibles.length === 0) {
            mesaSelect.innerHTML = '<option value="">No hay mesas disponibles para este horario</option>';
            return;
        }
        
        mesasDisponibles.forEach(mesa => {
            const option = document.createElement('option');
            option.value = mesa.id;
            option.textContent = `Mesa ${mesa.numero} (capacidad: ${mesa.capacidad} personas)`;
            mesaSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando mesas:', error);
        mesaSelect.innerHTML = '<option value="">Error al cargar mesas</option>';
    }
}

// ========== CREAR RESERVA ==========

async function crearReserva(e) {
    e.preventDefault();
    
    const mensaje = document.getElementById('mensaje');
    
    if (!fechaSeleccionada || !horarioSeleccionado) {
        mostrarMensaje('Por favor selecciona una fecha y horario', 'error');
        return;
    }
    
    const [h, m] = horarioSeleccionado.split(':');
    const fechaHora = new Date(fechaSeleccionada);
    fechaHora.setHours(parseInt(h), parseInt(m), 0, 0);
    
    const datos = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        mesa_id: parseInt(document.getElementById('mesa').value),
        fecha_hora: fechaHora.toISOString(),
        num_personas: parseInt(document.getElementById('personas').value),
        notas: document.getElementById('notas').value
    };
    
    try {
        const res = await fetch(`${API_URL}/api/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.error || 'Error al crear reserva');
        
        mostrarMensaje('✅ Reserva creada exitosamente', 'exito');
        document.getElementById('form-reserva').reset();
        
        // Recargar datos
        await cargarReservas();
        renderizarCalendario();
        
        setTimeout(() => {
            document.getElementById('form-container').style.display = 'none';
            fechaSeleccionada = null;
            horarioSeleccionado = null;
        }, 2000);
        
    } catch (error) {
        mostrarMensaje('❌ ' + error.message, 'error');
    }
}

// ========== LISTA DE RESERVAS ==========

async function cargarReservas() {
    try {
        const res = await fetch(`${API_URL}/api/reservas`);
        todasReservas = await res.json();
        
        renderizarTablaReservas();
    } catch (error) {
        console.error('Error cargando reservas:', error);
    }
}

function renderizarTablaReservas() {
    const tbody = document.getElementById('tabla-reservas-body');
    
    if (todasReservas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay reservas registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = todasReservas
        .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
        .map(r => {
            const fecha = new Date(r.fecha_hora);
            const estadoClass = `badge-${r.estado}`;
            
            return `
                <tr>
                    <td>
                        <strong>${r.cliente.nombre}</strong><br>
                        <small>${r.cliente.email}</small>
                    </td>
                    <td>${fecha.toLocaleString('es-ES')}</td>
                    <td>Mesa ${r.mesa.numero}</td>
                    <td>${r.num_personas}</td>
                    <td><span class="badge ${estadoClass}">${r.estado}</span></td>
                    <td>
                        ${r.estado !== 'cancelada' ? 
                            `<button class="btn-cancelar" onclick="cancelarReserva(${r.id})">Cancelar</button>` : 
                            '-'}
                    </td>
                </tr>
            `;
        }).join('');
}

async function cancelarReserva(id) {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    
    try {
        const res = await fetch(`${API_URL}/api/reservas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'cancelada' })
        });
        
        if (!res.ok) throw new Error('Error al cancelar');
        
        alert('✅ Reserva cancelada exitosamente');
        await cargarReservas();
        renderizarCalendario();
        
    } catch (error) {
        alert('❌ ' + error.message);
    }
}

// ========== UTILIDADES ==========

function cambiarTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    if (tab === 'lista') {
        renderizarTablaReservas();
    }
}

function mesAnterior() {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    renderizarCalendario();
}

function mesSiguiente() {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    renderizarCalendario();
}

function hoy() {
    fechaActual = new Date();
    renderizarCalendario();
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    mensaje.style.display = 'block';
    
    setTimeout(() => {
        mensaje.style.display = 'none';
    }, 5000);
}