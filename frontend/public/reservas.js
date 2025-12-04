document.addEventListener("DOMContentLoaded", () => {

    const selectHora = document.getElementById("hora");
    const fechaInput = document.getElementById("fecha");

    // Generar lista de horas (12:00 pm - 10:00 pm cada 30 minutos)
    function generarHoras() {
        const horas = [];
        let inicio = 12; // 12 PM
        let fin = 22; // 10 PM (formato 24 horas)

        for (let h = inicio; h <= fin; h++) {
            for (let m = 0; m < 60; m += 30) {
                let hora = h.toString().padStart(2, '0');
                let minutos = m.toString().padStart(2, '0');
                horas.push(`${hora}:${minutos}`);
            }
        }
        return horas;
    }

    // Rellenar el select
    function cargarHoras() {
        const horas = generarHoras();
        selectHora.innerHTML = ""; // limpiar

        horas.forEach(h => {
            const option = document.createElement("option");
            option.value = h;
            option.textContent = h;
            selectHora.appendChild(option);
        });
    }

    // Generar horas al cargar la página
    cargarHoras();

});
