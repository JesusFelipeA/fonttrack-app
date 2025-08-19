// Servicio para manejar las operaciones relacionadas con los lugares
// Importa la instancia de API y los tipos necesarios
import api from '../api/api';
import { Lugar } from '../types/Lugar';

// Función para obtener la lista de lugares desde el servicio
// Realiza una solicitud GET al endpoint '/lugares' y devuelve los datos obtenidos.
export const obtenerLugares = async (): Promise<Lugar[]> => {
    const response = await api.get<Lugar[]>('/lugares');
    return response.data;
};
