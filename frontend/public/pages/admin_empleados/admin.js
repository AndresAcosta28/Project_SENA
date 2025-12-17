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
    const tbody = document.getElementById("tabla-empleados");
    
    try {
        // Mostrar estado de carga
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">⏳ Cargando empleados...</td></tr>';
        
        const res = await fetch(`${API_URL}/api/empleados`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // ✅ VERIFICAR SI LA RESPUESTA ES EXITOSA
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status} - ${res.statusText}`);
        }
        
        const empleados = await res.json();
        
        console.log("✅ Empleados cargados:", empleados);
        
        if (empleados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">📋 No hay empleados registrados</td></tr>';
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
        
        console.log(`✅ ${empleados.length} empleados mostrados en la tabla`);
        
    } catch (error) {
        console.error("❌ Error cargando empleados:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: red; padding: 20px;">
                    ❌ Error al cargar empleados: ${error.message}<br>
                    <small>Verifica que el backend esté funcionando correctamente.</small><br>
                    <button onclick="cargarEmpleados()" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">
                        🔄 Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

function mostrarFormulario() {
    document.getElementById("modal-empleado").style.display = "flex";
    document.getElementById("form-empleado").reset();
    document.getElementById("empleado-id").value = "";
    document.getElementById("titulo-modal").textContent = "Nuevo Empleado";
    document.getElementById("password").required = true;
    document.getElementById("mensaje-form").style.display = "none";
}

function cerrarFormulario() {
    document.getElementById("modal-empleado").style.display = "none";
    document.getElementById("mensaje-form").style.display = "none";
}

async function editarEmpleado(id) {
    try {
        // Buscar el empleado en la tabla actual
        const res = await fetch(`${API_URL}/api/empleados`);
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        const empleados = await res.json();
        const empleado = empleados.find(e => e.id === id);
        
        if (!empleado) {
            alert("❌ Empleado no encontrado");
            return;
        }
        
        // Llenar el formulario
        document.getElementById("empleado-id").value = empleado.id;
        document.getElementById("nombre").value = empleado.nombre;
        document.getElementById("email").value = empleado.email;
        document.getElementById("cargo").value = empleado.cargo || "";
        document.getElementById("password").value = "";
        document.getElementById("password").required = false;
        document.getElementById("password").placeholder = "Dejar vacío para mantener actual";
        
        document.getElementById("titulo-modal").textContent = "Editar Empleado";
        document.getElementById("modal-empleado").style.display = "flex";
        document.getElementById("mensaje-form").style.display = "none";
        
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Error al cargar empleado: " + error.message);
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
            throw new Error(data.error || "Error al eliminar");
        }
        
        alert("✅ " + data.mensaje);
        cargarEmpleados();
        
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ " + error.message);
    }
}

// Submit del formulario
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
            throw new Error(result.error || "Error al guardar");
        }
        
        mensaje.textContent = "✅ " + result.mensaje;
        mensaje.className = "mensaje exito";
        mensaje.style.display = "block";
        
        setTimeout(() => {
            cerrarFormulario();
            cargarEmpleados();
        }, 1500);
        
    } catch (error) {
        console.error("❌ Error:", error);
        mensaje.textContent = "❌ " + error.message;
        mensaje.className = "mensaje error";
        mensaje.style.display = "block";
    }
});

// Cargar asistencias de todos los empleados
async function cargarAsistencias() {
    const tbody = document.getElementById("tabla-asistencias");
    
    try {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">⏳ Cargando asistencias...</td></tr>';
        
        const res = await fetch(`${API_URL}/api/asistencia/todas`);
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        const asistencias = await res.json();
        
        if (asistencias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">📋 No hay registros de asistencia</td></tr>';
            return;
        }
        
        tbody.innerHTML = asistencias.map(a => {
            const fecha = new Date(a.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const estado = a.hora_salida ? 'Completo' : (a.hora_entrada ? 'En turno' : 'Pendiente');
            const badgeClass = a.hora_salida ? 'badge-activo' : 'badge-inactivo';
            
            return `
                <tr>
                    <td>${a.empleado.nombre}</td>
                    <td>${fechaFormateada}</td>
                    <td>${a.hora_entrada || '-'}</td>
                    <td>${a.hora_salida || '-'}</td>
                    <td>
                        <span class="badge ${badgeClass}">
                            ${estado}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log(`✅ ${asistencias.length} asistencias cargadas`);
        
    } catch (error) {
        console.error("❌ Error cargando asistencias:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: red; padding: 20px;">
                    ❌ Error al cargar asistencias: ${error.message}
                </td>
            </tr>
        `;
    }
}

function cerrarSesion() {
    if (confirm("¿Estás seguro de cerrar sesión?")) {
        localStorage.removeItem("usuario");
        window.location.href = "/login.html";
    }
}

// ===== CAMBIAR TABS =====
function cambiarTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.target.classList.add('active');
    
    // Si es tab de asistencias, cargar datos
    if (tabName === 'asistencias') {
        cargarAsistencias();
    }
}

// ===== INICIALIZACIÓN =====
// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
});