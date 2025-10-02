export interface Perro {
  idPerro?: number;
  idUsuario?: number;
  nombreDueno?: string;

  nombre?: string;
  raza?: string;
  edad?: number;
  sexo?: string;
  tamano?: string;
  peso?: number;
  temperamento?: string;
  esTranquilo?: boolean;
  sociablePerros?: boolean;
  sociablePersonas?: boolean;
  entrenadoCorrea?: boolean;
  entrenadoBasicos?: boolean;
  vacunasAlDia?: boolean;
  esterilizado?: boolean;
  alergias?: string;
  medicacion?: string;
  observaciones?: string;

  imageData: string[] | null;
  imagenUrl: string[] | null
  nombreImagen: string[] | null;

   imagenes: {
    nombreImagen: string;
    imageData: string | null;
    imagenUrl: string | null;
  }[];

  
}