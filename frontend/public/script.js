document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("check-backend");
    const salida = document.getElementById("backend-response");

    boton.addEventListener("click", async () => {
        salida.textContent = "⌛ Conectando al backend...";

        try {
            const response = await fetch("http://backend-env-6e3f16d0.eba-prjwqm57.us-east-1.elasticbeanstalk.com/");
            const data = await response.json();

            salida.textContent = "Respuesta: " + data.message;

        } catch (error) {
            salida.textContent = "Error al conectar ❌ " + error;
        }
    });
});
