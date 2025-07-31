/*import api from '../api/api';
import { Material } from '../types/Material';

export const obtenerMateriales = async (): Promise<Material[]> => {
    const response = await api.get<Material[]>('/materiales');
    return response.data;
};*/
import axios from 'axios';
import { Material } from '../types/Material';

const API_URL = 'http://18.216.41.155:3000/api/materiales';

export async function obtenerMateriales(): Promise<Material[]> {
    const res = await axios.get(API_URL);
    return res.data;
}

