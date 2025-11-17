document.getElementById("check-backend").addEventListener("click", async () => {
    const url = "http://backend-env-6e3f16d0.eba-prjwqm57.us-east-1.elasticbeanstalk.com";

    try {
        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("backend-response").innerText =
            "Respuesta del backend: " + data.message;
    } catch (error) {
        document.getElementById("backend-response").innerText =
            "Error al contactar el backend ❌ " + error;
    }
});
