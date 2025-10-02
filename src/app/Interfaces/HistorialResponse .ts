import { Venta } from "./venta";

export interface HistorialResponse {
  ventas: Venta[];
  totalRegistros: number;
  totalPaginas: number;
}
