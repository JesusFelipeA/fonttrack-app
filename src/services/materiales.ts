// Servicio para manejar las operaciones relacionadas con los materiales
// Importa la instancia de API y los tipos necesarios
import axios from 'axios';
import { Material } from '../types/Material';
// Define la URL de la API para obtener los materiales
const API_URL = 'http://3.144.202.241:3000/api/materiales';
// Función para obtener la lista de materiales desde el servicio
// Realiza una solicitud GET al endpoint y devuelve los datos obtenidos.
export async function obtenerMateriales(): Promise<Material[]> {
    const res = await axios.get(API_URL);
    return res.data;
}

