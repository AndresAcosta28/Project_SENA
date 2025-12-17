const API_URL = "https://restaurante-backend-s93j.onrender.com";
let usuario = null;

// Verificar si está logueado
function verificarSesion() {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) {
        window.location.href = "/login.html";
        return;
    }
    
    usuario = JSON.parse(usuarioStr);
    
    if (usuario.rol !== "empleado") {
        window.location.href = "/admin.html";
        return;
    }
    
    // Mostrar info del empleado
    document.getElementById("nombre-empleado").textContent = usuario.nombre;
    document.getElementById("cargo-empleado").textContent = usuario.cargo || "Empleado";
    
    // Cargar registros
    cargarRegistros();
}

async function registrarEntrada() {
    const mensaje = document.getElementById("mensaje");
    const btnEntrada = document.querySelector('.btn-entrada');
    
    btnEntrada.disabled = true;
    btnEntrada.textContent = "⏳ Registrando...";
    
    try {
        const res = await fetch(`${API_URL}/api/asistencia/entrada`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario_id: usuario.id })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error);
        }
        
        mensaje.textContent = `✅ ${data.mensaje} - Hora: ${data.hora}`;
        mensaje.className = "mensaje exito";
        mensaje.style.display = "block";
        
        setTimeout(() => {
            mensaje.style.display = "none";
            cargarRegistros();
        }, 3000);
        
    } catch (error) {
        mensaje.textContent = `❌ ${error.message}`;
        mensaje.className = "mensaje error";
        mensaje.style.display = "block";
    } finally {
        btnEntrada.disabled = false;
        btnEntrada.textContent = "🕐 Registrar Entrada";
    }
}

async function registrarSalida() {
    const mensaje = document.getElementById("mensaje");
    const btnSalida = document.querySelector('.btn-salida');
    
    btnSalida.disabled = true;
    btnSalida.textContent = "⏳ Registrando...";
    
    try {
        const res = await fetch(`${API_URL}/api/asistencia/salida`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario_id: usuario.id })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error);
        }
        
        mensaje.textContent = `✅ ${data.mensaje} - Hora: ${data.hora}`;
        mensaje.className = "mensaje exito";
        mensaje.style.display = "block";
        
        setTimeout(() => {
            mensaje.style.display = "none";
            cargarRegistros();
        }, 3000);
        
    } catch (error) {
        mensaje.textContent = `❌ ${error.message}`;
        mensaje.className = "mensaje error";
        mensaje.style.display = "block";
    } finally {
        btnSalida.disabled = false;
        btnSalida.textContent = "🕐 Registrar Salida";
    }
}

async function cargarRegistros() {
    try {
        const res = await fetch(`${API_URL}/api/asistencia/mis-registros/${usuario.id}`);
        const registros = await res.json();
        
        const tbody = document.getElementById("tabla-registros");
        
        if (registros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay registros</td></tr>';
            return;
        }
        
        tbody.innerHTML = registros.map(r => {
            const fecha = new Date(r.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            return `
                <tr>
                    <td>${fechaFormateada}</td>
                    <td>${r.hora_entrada || '-'}</td>
                    <td>${r.hora_salida || '-'}</td>
                    <td class="${r.hora_salida ? 'estado-completo' : 'estado-pendiente'}">
                        ${r.hora_salida ? '✅ Completo' : '⏳ Pendiente'}
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error("Error cargando registros:", error);
        const tbody = document.getElementById("tabla-registros");
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error cargando registros</td></tr>';
    }
}

function cerrarSesion() {
    if (confirm("¿Estás seguro de cerrar sesión?")) {
        localStorage.removeItem("usuario");
        window.location.href = "/login.html";
    }
}

// Inicializar
verificarSesion();