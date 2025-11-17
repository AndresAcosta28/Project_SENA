async function llamarAPI() {
    const url = "http://backend-env-6e3f16d0.eba-prjwqm57.us-east-1.elasticbeanstalk.com";

    try {
        const response = await fetch(url);
        const data = await response.json();
        document.getElementById("respuesta").innerText =
            "Respuesta del backend: " + data.message;

    } catch (error) {
        document.getElementById("respuesta").innerText =
            "Error al contactar el backend ❌ " + error;
    }
}
