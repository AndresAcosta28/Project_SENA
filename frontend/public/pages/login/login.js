const API_URL = "https://restaurante-backend-s93j.onrender.com";

const form = document.getElementById("form-login");
const mensaje = document.getElementById("mensaje");

// Verificar si ya hay sesión activa
window.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
        const user = JSON.parse(usuario);
        if (user.rol === "admin") {
            window.location.href = "/admin.html";
        } else {
            window.location.href = "/empleado.html";
        }
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // Deshabilitar botón mientras procesa
    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Iniciando sesión...";
    
    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || "Error al iniciar sesión");
        }
        
        // Guardar usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        
        // Mostrar mensaje de éxito
        mensaje.textContent = "✅ Login exitoso. Redirigiendo...";
        mensaje.className = "mensaje exito";
        mensaje.style.display = "block";
        
        // Redirigir según el rol
        setTimeout(() => {
            if (data.usuario.rol === "admin") {
                window.location.href = "/admin.html";
            } else {
                window.location.href = "/empleado.html";
            }
        }, 1000);
        
    } catch (error) {
        mensaje.textContent = "❌ " + error.message;
        mensaje.className = "mensaje error";
        mensaje.style.display = "block";
        
        // Re-habilitar botón
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Iniciar Sesión";
    }
});