
export interface Empresa {

  idEmpresa:number;
  nombreEmpresa:string;
  direccion:string;
  telefono:string;
  propietario:string;
  logo:string | null;
  correo:string;
  rut:string;
  facebook:string;
  instagram:string;
  tiktok:string;
  logoNombre:string;
  imagenUrl?: string; // Agregado para manejar la URL de la imagen
}
