export interface Paseo {
  idPaseo?: number;
  idUsuarioPasador?: number;
  idUsuarioCliente?: number;
  idTarifa?: number;
  fecha?: Date;
  turno?: string ;
  costoTotal?: number | null;
  estado?: string | null;
  fechaRegistro?: Date | null;
  fechaEntrega?: Date | null;

  nombrePasador?: string | null;
  nombreCliente?: string | null;
  nombreTarifa?: string | null;

}