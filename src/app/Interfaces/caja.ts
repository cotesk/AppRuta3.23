

export interface Caja {
  idCaja: number;
  fechaApertura?: Date  | null;
  fechaCierre?: Date  | null;
  saldoInicialTexto?: string;
  saldoFinalTexto?: string;
  ingresosTexto?: string;
  tipoCaja ?: string;
  devolucionesTexto?: string;
  prestamosTexto?: string;
  gastosTexto?: string;
  transaccionesTexto?: string;
  estado: string;
  comentarios?: string;
  comentariosGastos?: string;
  comentariosDevoluciones?: string;
  comentariosTrabajadores ?: string;
  comentarioVariados ?: string;
  comentarioPrestamosCajaGeneral ?: string;
  fechaRegistro?: Date  | null;
  ultimaActualizacion?: Date  | null;
  metodoPago?: string;
  idUsuario: number,
  nombreUsuario: string,


  numeroDocumento?: string;
  numeroDocumentoCompra?: string;
  transacciones?: string;
  saldoInicial?: string;
  saldoFinal?: string;
  ingresos?: string;
  devoluciones?: string;
  prestamos?: string;
  gastos?: string;
}
