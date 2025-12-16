const API_URL = "https://restaurante-backend-s93j.onrender.com";

const form = document.getElementById("form-reserva");
const msg = document.getElementById("msg");
const mesaSelect = document.getElementById("mesa");
const horaSelect = document.getElementById("hora");

// Horarios disponibles (puedes ajustar)
const HORARIOS = [
  "12:00", "13:00", "14:00",
  "18:00", "19:00", "20:00", "21:00"
];

// =========================
// Cargar mesas desde backend
// =========================
fetch(`${API_URL}/api/mesas`)
  .then(res => res.json())
  .then(data => {
    mesaSelect.innerHTML = '<option value="">Seleccione una mesa</option>';
    data.forEach(mesa => {
      if (mesa.disponible) {
        const option = document.createElement("option");
        option.value = mesa.id;
        option.textContent = `Mesa ${mesa.numero} (${mesa.capacidad} personas)`;
        mesaSelect.appendChild(option);
      }
    });
  })
  .catch(err => {
    console.error(err);
    mesaSelect.innerHTML = '<option>Error cargando mesas</option>';
  });

// =========================
// Cargar horarios
// =========================
HORARIOS.forEach(hora => {
  const option = document.createElement("option");
  option.value = hora;
  option.textContent = hora;
  horaSelect.appendChild(option);
});

// =========================
// Enviar reserva
// =========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    telefono: document.getElementById("telefono").value,
    mesa_id: parseInt(document.getElementById("mesa").value),
    fecha_hora: `${document.getElementById("fecha").value}T${horaSelect.value}:00`,
    num_personas: parseInt(document.getElementById("personas").value),
    notas: ""
  };

  try {
    const res = await fetch(`${API_URL}/api/reservas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Error al crear reserva");
    }

    msg.innerHTML = "✅ Reserva creada correctamente";
    msg.style.color = "green";
    form.reset();

  } catch (error) {
    msg.innerHTML = "❌ Error: " + error.message;
    msg.style.color = "red";
  }
});
