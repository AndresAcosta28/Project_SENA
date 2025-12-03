const fechaInput = document.getElementById("fecha");
const fechaManual = document.getElementById("fecha-manual");
const horaSelect = document.getElementById("hora");

// Horarios ejemplo (luego vendrán desde la DB)
const horarios = [
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
];

// Sincronizar fecha manual → calendario
fechaManual.addEventListener("input", () => {
    fechaInput.value = fechaManual.value;
    cargarHorarios();
});

// Sincronizar calendario → fecha manual
fechaInput.addEventListener("change", () => {
    fechaManual.value = fechaInput.value;
    cargarHorarios();
});

// Cargar horarios disponibles
function cargarHorarios() {
    horaSelect.innerHTML = "";

    horarios.forEach(h => {
        const option = document.createElement("option");
        option.value = h;
        option.textContent = h;
        horaSelect.appendChild(option);
    });
}
