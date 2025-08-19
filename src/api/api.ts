//Se emplea la librería axios para poder establecer conexión con la API que se encuentra en el servidor
import axios from 'axios';
// Se crea una instancia de axios con la URL base de la API y un tiempo de espera de 5 segundos
// Esto permite realizar solicitudes HTTP a la API de manera más sencilla y organizada
const api = axios.create({
    baseURL: 'http://3.144.202.241:3000/api',
    timeout: 5000,
});

export default api;
