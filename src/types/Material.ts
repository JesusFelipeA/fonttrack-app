// Interface que define la estructura de un Material
// Incluye campos obligatorios que representan un material en el sistema
export interface Material {
    id_material: number;
    clave_material: string;
    descripcion: string;
    generico: string;
    clasificacion: string;
    existencia: number;
    costo_promedio: number;
    id_lugar: number;
}

