function showSection(id) {
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function cerrarSesion() {
    alert("Sesión cerrada");
    window.location.href = "login.html";
}

// Ejemplo: Cargar datos (luego se conecta a backend o Supabase)
document.getElementById("empleados-list").innerHTML = `
    <tr>
        <td>1</td>
        <td>Juan Pérez</td>
        <td>Mesero</td>
        <td>Activo</td>
        <td><button>Editar</button></td>
    </tr>
`;

document.getElementById("reservas-list").innerHTML = `
    <tr>
        <td>101</td>
        <td>Camila Torres</td>
        <td>2025-12-01</td>
        <td>7:30 PM</td>
        <td>4</td>
        <td>Confirmada</td>
    </tr>
`;

document.getElementById("pedidos-list").innerHTML = `
    <tr>
        <td>5502</td>
        <td>Andrés</td>
        <td>3</td>
        <td>$68.000</td>
        <td>En proceso</td>
    </tr>
`;
