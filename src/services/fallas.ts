// Servicio para manejar las operaciones relacionadas con las fallas
// Importa la instancia de API y los tipos necesarios
import api from '../api/api';
import { Falla } from '../types/Falla';

// Interfaz para la respuesta del endpoint al crear
interface CrearFallaResponse {
    message: string;
    id_falla: number;
    data: Falla;
}

export const obtenerFallas = async (): Promise<Falla[]> => {
    const response = await api.get<Falla[]>('/fallas');
    return response.data;
};

// Servicio actualizado para manejar la respuesta correcta del endpoint
export const crearFalla = async (falla: Falla): Promise<Falla> => {
    const response = await api.post<CrearFallaResponse>('/fallas', falla);
    
    // El endpoint devuelve { message, id_falla, data }
    // Devolvemos el objeto falla con el ID asignado
    return {
        ...response.data.data,
        id: response.data.id_falla
    };
};

// Función adicional para obtener solo el mensaje de éxito
export const crearFallaCompleta = async (falla: Falla): Promise<CrearFallaResponse> => {
    const response = await api.post<CrearFallaResponse>('/fallas', falla);
    return response.data;
};