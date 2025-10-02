export interface Usuario {

    idUsuario?: number,
    nombreCompleto?: string,
    correo?: string,
    idRol?: number,
    rolDescripcion?: string,
    clave?: string,
    esActivo?: number
    imageData?: string | null;
    imagenUrl?: string | null;
    nombreImagen?: string | null;


    direccion?: string;
    barrio?: string;
    referencia?: string;
    capacidadManana?: number;
    capacidadTarde?: number;
    capacidadNoche?: number;


}
