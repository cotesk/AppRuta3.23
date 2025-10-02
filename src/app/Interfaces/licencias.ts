export interface Licencias {


  id?: number;
  serial?: string; // Guid generado por el backend
  fechaInicio: string;  // formato ISO (yyyy-MM-dd)
  fechaFin: string;     // formato ISO (yyyy-MM-dd)
  estadoPago?: boolean;
  activa?: boolean;
  fechaRegistro?: string;


}
