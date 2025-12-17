const API_URL = "https://restaurante-backend-s93j.onrender.com";
let usuario = null;

// Verificar si está logueado como admin
function verificarSesion() {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) {
        window.location.href = "/login.html";
        return;
    }
    
    usuario = JSON.parse(usuarioStr);
    
    if (usuario.rol !== "admin") {
        window.location.href = "/empleado.html";
        return;
    }
    
    // Cargar empleados
    cargarEmpleados();
}

async function cargarEmpleados() {
    try {
        const res = await fetch(`${API_URL}/api/empleados`);
        const empleados = await res.json();
        
        const tbody = document.getElementById("tabla-empleados");
        
        if (empleados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay empleados registrados</td></tr>';
            return;
        }
        
        tbody.innerHTML = empleados.map(emp => `
            <tr>
                <td>${emp.nombre}</td>
                <td>${emp.email}</td>
                <td>${emp.cargo || '-'}</td>
                <td>
                    <span class="badge ${emp.activo ? 'badge-activo' : 'badge-inactivo'}">
                        ${emp.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn-editar" onclick="editarEmpleado(${emp.id})">✏️ Editar</button>
                    <button class="btn-eliminar" onclick="eliminarEmpleado(${emp.id})">🗑️ Eliminar</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error("Error cargando empleados:", error);
    }
}

function mostrarFormulario() {
    document.getElementById("modal-empleado").style.display = "flex";
    document.getElementById("form-empleado").reset();
    document.getElementById("empleado-id").value = "";
    document.getElementById("titulo-modal").textContent = "Nuevo Empleado";
    document.getElementById("password").required = true;
}

function cerrarFormulario() {
    document.getElementById("modal-empleado").style.display = "none";
}

async function editarEmpleado(id) {
    try {
        // Buscar el empleado en la tabla actual
        const res = await fetch(`${API_URL}/api/empleados`);
        const empleados = await res.json();
        const empleado = empleados.find(e => e.id === id);
        
        if (!empleado) {
            alert("Empleado no encontrado");
            return;
        }
        
        // Llenar el formulario
        document.getElementById("empleado-id").value = empleado.id;
        document.getElementById("nombre").value = empleado.nombre;
        document.getElementById("email").value = empleado.email;
        document.getElementById("cargo").value = empleado.cargo || "";
        document.getElementById("password").value = "";
        document.getElementById("password").required = false;
        
        document.getElementById("titulo-modal").textContent = "Editar Empleado";
        document.getElementById("modal-empleado").style.display = "flex";
        
    } catch (error) {
        alert("Error al cargar empleado: " + error.message);
    }
}

async function eliminarEmpleado(id) {
    if (!confirm("¿Estás seguro de eliminar este empleado?")) {
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/api/empleados/${id}`, {
            method: "DELETE"
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error);
        }
        
        alert("✅ " + data.mensaje);
        cargarEmpleados();
        
    } catch (error) {
        alert("❌ Error: " + error.message);
    }
}

document.getElementById("form-empleado").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const mensaje = document.getElementById("mensaje-form");
    const empleadoId = document.getElementById("empleado-id").value;
    
    const data = {
        nombre: document.getElementById("nombre").value,
        email: document.getElementById("email").value,
        cargo: document.getElementById("cargo").value,
        password: document.getElementById("password").value
    };
    
    try {
        let res;
        
        if (empleadoId) {
            // Actualizar
            res = await fetch(`${API_URL}/api/empleados/${empleadoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
        } else {
            // Crear nuevo
            res = await fetch(`${API_URL}/api/empleados`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await res.json();
        
        if (!res.ok) {
            throw new Error(result.error);
        }
        
        mensaje.textContent = "✅ " + result.mensaje;
        mensaje.className = "mensaje exito";
        mensaje.style.display = "block";
        
        setTimeout(() => {
            cerrarFormulario();
            cargarEmpleados();
            mensaje.style.display = "none";
        }, 2000);
        
    } catch (error) {
        mensaje.textContent = "❌ " + error.message;
        mensaje.className = "mensaje error";
        mensaje.style.display = "block";
    }
});

// Cargar asistencias de todos los empleados
async function cargarAsistencias() {
    try {
        const res = await fetch(`${API_URL}/api/asistencia/todas`);
        const asistencias = await res.json();
        
        const tbody = document.getElementById("tabla-asistencias");
        
        if (asistencias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay registros de asistencia</td></tr>';
            return;
        }
        
        tbody.innerHTML = asistencias.map(a => {
            const fecha = new Date(a.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            return `
                <tr>
                    <td>${a.empleado.nombre}</td>
                    <td>${fechaFormateada}</td>
                    <td>${a.hora_entrada || '-'}</td>
                    <td>${a.hora_salida || '-'}</td>
                    <td>
                        <span class="badge ${a.hora_salida ? 'badge-activo' : 'badge-inactivo'}">
                            ${a.hora_salida ? 'Completo' : 'Pendiente'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error("Error cargando asistencias:", error);
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

// Si existe la tabla de asistencias, cargarlas
if (document.getElementById("tabla-asistencias")) {
    cargarAsistencias();
}