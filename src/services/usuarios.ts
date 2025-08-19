// Servicio para manejar las operaciones relacionadas con los usuarios
// Importa la instancia de API y los tipos necesarios
import api from '../api/api';
import { Usuario } from '../types/Usuario';
// Función para obtener la lista de usuarios desde el servicio
// Realiza una solicitud GET al endpoint y devuelve los datos obtenidos.
export const obtenerUsuarios = async (): Promise<Usuario[]> => {
    const response = await api.get<Usuario[]>('/usuarios');
    return response.data;
};
