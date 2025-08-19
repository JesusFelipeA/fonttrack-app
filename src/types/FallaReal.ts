export interface FallaReal {
    id_falla?: number;
    eco: string;
    placas: string;
    descripcion: string;  // 👈 Cambiado de "fallo" a "descripcion"
    observaciones: string; // 👈 Cambiado de "trabajo" a "observaciones"
    quien_reporta: string;
    quien_revisa?: string; // Opcional
}

// Para el formulario (todos como string)
export interface FallaFormulario {
    eco: string;
    placas: string;
    marca: string;
    ano: string;
    km: string;
    fecha: string;
    conductor: string;
    descripcion: string;
    observaciones: string;
    quien_reporta: string;
    quien_revisa: string;
    materiales: string;
}

// Para respuesta del servidor
export interface FallaResponse {
    message: string;
    id_falla: number;
    data: FallaReal;
}