// Interface que define la estructura de una Falla
// Incluye campos obligatorios y opcionales según el contexto de uso
export interface Falla {
  id?: number; // Auto-incremental, opcional al crear
  eco: string; // No. ECO *
  placas: string; // Placas *
  marca: string; // Marca
  ano: number; // Año
  km: number; // KM
  fecha: Date | string; // Fecha (YYYY-MM-DD), este es el formato que se recibe en la base de datos
  conductor: string; // Conductor
  fallo: string; // Descripción del Fallo
  trabajo: string; // Trabajo Realizado
  quien_reporta: string; // Autorizado por *
  quien_revisa?: string; // Revisado por (opcional)
}
