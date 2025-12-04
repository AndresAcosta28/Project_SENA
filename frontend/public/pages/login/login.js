const rolSelect = document.getElementById("rol");
const formAdmin = document.getElementById("form-admin");
const formEmpleado = document.getElementById("form-empleado");

rolSelect.addEventListener("change", () => {
    const rol = rolSelect.value;

    formAdmin.classList.add("hidden");
    formEmpleado.classList.add("hidden");

    if (rol === "admin") {
        formAdmin.classList.remove("hidden");
    } else if (rol === "empleado") {
        formEmpleado.classList.remove("hidden");
    }
});

// Simulación de acceso admin
function loginAdmin() {
    const correo = document.getElementById("admin-email").value;
    const pass = document.getElementById("admin-pass").value;

    alert("Validando administrador...");
    // Aquí luego conectamos al backend / Supabase
}

// Simulación de acceso empleado
function loginEmpleado() {
    const id = document.getElementById("emp-id").value;
    const pin = document.getElementById("emp-pin").value;

    alert("Validando empleado...");
    // Aquí luego conectamos al backend / Supabase
}
