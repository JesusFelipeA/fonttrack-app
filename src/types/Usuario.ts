// Interface que define la estructura de un Usuario
// Incluye campos obligatorios y opcionales según el contexto de uso
export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  password: string;
  tipo_usuario: number;
  foto_usuario: string;
  id_lugar: number;
}
