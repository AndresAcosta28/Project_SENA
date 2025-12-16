const API_URL = "https://restaurante-backend-s93j.onrender.com";

const form = document.getElementById("form-reserva");
const msg = document.getElementById("msg");
const mesaSelect = document.getElementById("mesa");
const horaSelect = document.getElementById("hora");

// Horarios disponibles
const HORARIOS = [
  "12:00", "13:00", "14:00",
  "18:00", "19:00", "20:00", "21:00"
];

// =========================
// Cargar mesas desde backend
// =========================
async function cargarMesas() {
  try {
    console.log("🔍 Intentando cargar mesas desde:", `${API_URL}/api/mesas`);
    
    const res = await fetch(`${API_URL}/api/mesas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("📡 Respuesta recibida:", res.status, res.statusText);

    // Verificar si la respuesta es exitosa
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("✅ Mesas recibidas:", data);

    // Verificar que data sea un array
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No hay mesas disponibles");
    }

    // Limpiar y llenar el select
    mesaSelect.innerHTML = '<option value="">Seleccione una mesa</option>';
    
    let mesasDisponibles = 0;
    data.forEach(mesa => {
      if (mesa.disponible) {
        mesasDisponibles++;
        const option = document.createElement("option");
        option.value = mesa.id;
        option.textContent = `Mesa ${mesa.numero} (${mesa.capacidad} personas)`;
        mesaSelect.appendChild(option);
      }
    });

    if (mesasDisponibles === 0) {
      mesaSelect.innerHTML = '<option value="">No hay mesas disponibles</option>';
    }

    console.log(`✅ ${mesasDisponibles} mesas disponibles cargadas`);

  } catch (err) {
    console.error("❌ Error cargando mesas:", err);
    mesaSelect.innerHTML = '<option value="">Error cargando mesas</option>';
    
    // Mostrar mensaje de error más detallado
    msg.innerHTML = `⚠️ Error al cargar mesas: ${err.message}`;
    msg.style.color = "orange";
    msg.style.display = "block";
  }
}

// Llamar la función al cargar la página
cargarMesas();

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

  const mesaId = document.getElementById("mesa").value;
  
  // Validar que se haya seleccionado una mesa
  if (!mesaId) {
    msg.innerHTML = "⚠️ Por favor selecciona una mesa";
    msg.style.color = "orange";
    msg.style.display = "block";
    return;
  }

  const data = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    telefono: document.getElementById("telefono").value,
    mesa_id: parseInt(mesaId),
    fecha_hora: `${document.getElementById("fecha").value}T${horaSelect.value}:00`,
    num_personas: parseInt(document.getElementById("personas").value),
    notas: ""
  };

  console.log("📤 Enviando reserva:", data);

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
      throw new Error(result.error || result.message || "Error al crear reserva");
    }

    msg.innerHTML = "✅ Reserva creada correctamente";
    msg.style.color = "green";
    msg.style.display = "block";
    form.reset();

    // Recargar mesas disponibles
    setTimeout(() => {
      cargarMesas();
    }, 1000);

  } catch (error) {
    console.error("❌ Error al crear reserva:", error);
    msg.innerHTML = "❌ Error: " + error.message;
    msg.style.color = "red";
    msg.style.display = "block";
  }
});