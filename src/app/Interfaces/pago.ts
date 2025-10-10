export interface Pago {
  idPago?: number;
  idUsuario?: number;
  fechaPago?: Date;
  montoTexto?: string;
  tipoPago?: string;
  tipoTranferencia?: string;
  precioPagadoTexto?: string,
  precioEfectivoTexto?: string,
  precioTransferenciaTexto?: string,
  anulada: boolean,
  idCaja: number;
}