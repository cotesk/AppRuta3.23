import { Usuario } from "./usuario";

export interface Sesion extends Usuario{

  idUsuario:number,
  nombreCompleto:string,
  correo:string,
  rolDescripcion:string
  imageData:string ;
  clave:string;
  token:string;
  imagenUrl?: string | null;
  nombreImagen?: string | null;
}
