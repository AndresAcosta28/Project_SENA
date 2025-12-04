// Simular el nombre del empleado temporalmente (se recibirá del login)
document.getElementById("empleadoNombre").textContent = "Empleado: Juan Pérez";

// Actualizar hora en tiempo real
function actualizarHora() {
    const ahora = new Date().toLocaleTimeString();
    document.getElementById("horaActual").textContent = "Hora actual: " + ahora;
}
setInterval(actualizarHora, 1000);

// Manejo de botones
document.getElementById("btnEntrada").addEventListener("click", () => {
    registrar("Entrada");
});

document.getElementById("btnSalida").addEventListener("click", () => {
    registrar("Salida");
});

// Función para registrar acción
function registrar(tipo) {
    const hora = new Date().toLocaleTimeString();
    document.getElementById("ultimoRegistro").textContent = `Último registro: ${tipo} a las ${hora}`;

    // 👇 Aquí después conectaremos tu API o Supabase
    console.log("Enviando al backend:", tipo, hora);
}

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "login.html";
});
