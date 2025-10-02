import { Caja } from './../Interfaces/caja';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { throwError } from 'rxjs';

import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';
@Injectable({
  providedIn: 'root'
})
export class CajaService {

  private urlApi: string = environment.endpoint + "Caja/"



  constructor(private http: HttpClient) { }



  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error('No se encontró un token JWT en el almacenamiento local.');
      throw new Error('No se encontró un token JWT en el almacenamiento local.');
    }
    return new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
  }


  lista(): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}Lista`, { headers: headers }).pipe(
      catchError(this.handleError)
    );

  }
  listaSoloHoy(): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}ListaSoloHoy`, { headers: headers }).pipe(
      catchError(this.handleError)
    );

  }
  listaSoloGeneralCard(): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}ListaSoloGeneralCard`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  listaSoloGeneral(): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}ListaSoloGeneral`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }



  listaPaginada(page: number = 1, pageSize: number = 5, searchTerm: string = ''): Observable<any> {
    const url = `${this.urlApi}ListaPaginada?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
  guardar(request: Caja): Observable<ReponseApi> {
    const headers = this.getHeaders();
    console.log('Datos enviados al servidor:', request);
    return this.http.post<ReponseApi>(`${this.urlApi}Guardar`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );

  }
  editar(request: Caja): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}Editar`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );

  }

  editarPagosCombinados(request: Caja): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}EditarPagosCombinados`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }


  editarIngreso(request: Caja): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}EditarIngreso`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );

  }
  editarCombinado(request: Caja): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}EditarIngreso`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );

  }
  
  editarGastos(request: Caja): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}EditarGastos`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  editarDevoluiones(request: Caja): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}EditarDevoluciones`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  editarDevoluionesGasto(request: Caja): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}EditarDevolucionesGasto`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.delete<ReponseApi>(`${this.urlApi}Eliminar/${id}`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  cambiarEstado(id: number): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}CambiarEstado/${id}`, {}, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  // cambiarEstado(id: number): Observable<ReponseApi> {

  //   return this.http.put<ReponseApi>(`${this.urlApi}CambiarEstado/${id}`, null);
  // }


  obtenerCajaPorUsuario(idUsuario: number): Observable<Caja | null> {
    const headers = this.getHeaders();
    const url = `${this.urlApi}usuario/${idUsuario}`;
    return this.http.get<Caja>(url, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerCajaGeneralPorUsuario(idUsuario: number): Observable<Caja | null> {
    const headers = this.getHeaders();
    const url = `${this.urlApi}usuarioCajaGeneral/${idUsuario}`;
    return this.http.get<Caja>(url, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }


  obtenerCajaPoridCaja(idCaja: number): Observable<Caja | null> {
    const headers = this.getHeaders();
    const url = `${this.urlApi}${idCaja}`;
    return this.http.get<Caja>(url, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  // actualizarCaja(caja: Caja): Observable<Caja> {
  //   const url = `${this.urlApi}${caja.idCaja}`; // Reemplaza '${caja.idCaja}' con la ruta adecuada para actualizar la caja
  //   return this.http.put<Caja>(url, caja); // Realiza una solicitud HTTP PUT para actualizar la caja
  // }

  // guardarPrestamo(valor: number, comentario: string): Observable<any> {
  //   const prestamo = { valor: valor, comentario: comentario }; // Objeto que contiene el valor y el comentario del préstamo
  //   return this.http.post<any>(`${this.urlApi}GuardarPrestamo`, prestamo);
  //   // La ruta `GuardarPrestamo` debe ser definida en tu API para manejar la solicitud de guardar préstamo
  // }

  realizarPrestamo(idCaja: number, prestamosTexto: number, comentarios: string, estado: string, tipo: string): Observable<any> {
    const headers = this.getHeaders();
    const requestBody = {
      idCaja: idCaja,
      prestamosTexto: prestamosTexto,
      comentarios: comentarios,
      estado: estado,
      tipo: tipo // ¡IMPORTANTE!
    };

    console.log('Prestamo:', requestBody);
    return this.http.post<any>(`${this.urlApi}prestamo`, requestBody, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  pagarPrestamo(idCaja: number, prestamosTexto: number, comentarios: string, estado: string, tipo: string): Observable<any> {
    const headers = this.getHeaders();
    const requestBody = {
      idCaja: idCaja,
      prestamosTexto: prestamosTexto,
      comentarios: comentarios,
      estado: estado,
      tipo: tipo
    };

    console.log('Prestamo pagado:', requestBody);
    return this.http.post<any>(`${this.urlApi}PagoPrestamo`, requestBody, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  //Caja General

  pedirPrestamo(idCaja: number, prestamosTexto: number, comentario: string, estado: string, tipo: string): Observable<any> {
    const headers = this.getHeaders();
    const requestBody = {
      idCaja,
      prestamosTexto,
      comentarioPrestamosCajaGeneral: comentario,
      estado,
      tipo
    };
    return this.http.post<any>(`${this.urlApi}PedirPrestamo`, requestBody, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  PagarPrestamo(idCaja: number, prestamosTexto: number, comentario: string, estado: string, tipo: string): Observable<any> {
    const headers = this.getHeaders();
    const requestBody = {
      idCaja,
      prestamosTexto,
      comentarioPrestamosCajaGeneral: comentario,
      estado,
      tipo
    };
    return this.http.post<any>(`${this.urlApi}PagarPrestamo`, requestBody, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  //

  pagoTrabajadores(idCaja: number, prestamosTexto: number, comentarios: string, estado: string, nombre: string, tipo: string): Observable<any> {
    const headers = this.getHeaders();
    const requestBody = {
      idCaja,
      prestamosTexto,
      comentariosTrabajadores: comentarios,
      estado,
      nombre,
      tipo
    };
    return this.http.post<any>(`${this.urlApi}PagoTrabajadores`, requestBody, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  pagosVariados(idCaja: number, prestamosTexto: number, comentarioVariados: string, estado: string, tipo: string): Observable<any> {
    const headers = this.getHeaders();
    const requestBody = {
      idCaja: idCaja,
      prestamosTexto: prestamosTexto,
      comentarioVariados: comentarioVariados,
      estado: estado,
      tipo: tipo
    };

    console.log('Pagos Variados:', requestBody);
    return this.http.post<any>(`${this.urlApi}Variado`, requestBody, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }



  devoluciones(idCaja: number, numeroDocumento: string, comentariosDevoluciones: string, estado: string): Observable<any> {
    const headers = this.getHeaders();
    const requestBody = {
      idCaja: idCaja,
      numeroDocumento: numeroDocumento,
      comentariosDevoluciones: comentariosDevoluciones,
      estado: estado

    };
    console.log('devoluciones:', requestBody);
    // Realiza una solicitud HTTP POST a tu API para realizar el préstamo

    return this.http.post<any>(`${this.urlApi}devoluciones`, requestBody, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  devolucionesCotizaciones(idCaja: number, numeroDocumento: string, comentariosDevoluciones: string, estado: string): Observable<any> {
    const headers = this.getHeaders();
    const requestBody = {
      idCaja: idCaja,
      numeroDocumento: numeroDocumento,
      comentariosDevoluciones: comentariosDevoluciones,
      estado: estado
    };
    console.log('devoluciones:', requestBody);
    // Realiza una solicitud HTTP POST a tu API para realizar el préstamo

    return this.http.post<any>(`${this.urlApi}devolucionesCotizacion`, requestBody, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  Gastos(idCaja: number, numeroDocumentoCompra: string, comentariosGastos: string): Observable<any> {
    const headers = this.getHeaders();
    const requestBody = {
      idCaja: idCaja,
      numeroDocumentoCompra: numeroDocumentoCompra,
      comentariosGastos: comentariosGastos
    };
    console.log('gasto:', requestBody);
    return this.http.post<any>(`${this.urlApi}gasto`, requestBody, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerComentarios(idCaja: number): Observable<string> {
    const headers = this.getHeaders();
    return this.http.get<string>(`${this.urlApi}comentarios/${idCaja}`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError('Error al realizar la solicitud. Por favor, inténtalo de nuevo más tarde.');
  }

  // lista():Observable<ReponseApi>{

  //   return this.http.get<ReponseApi>(`${this.urlApi}Lista`)
  // }

  // guardar(request:Caja):Observable<ReponseApi>{
  //   console.log('Datos enviados en la solicitud:', request);
  //   return this.http.post<ReponseApi>(`${this.urlApi}Guardar`,request)

  // }

  // editar(request:Caja):Observable<ReponseApi>{

  //   return this.http.put<ReponseApi>(`${this.urlApi}Editar`,request)

  // }

  // editarIngreso(request:Caja):Observable<ReponseApi>{
  //   console.log('Datos enviados de caja:', request);
  //   return this.http.put<ReponseApi>(`${this.urlApi}EditarIngreso`,request)

  // }

  // editarGastos(request:Caja):Observable<ReponseApi>{
  //   console.log('Datos enviados de caja:', request);
  //   return this.http.put<ReponseApi>(`${this.urlApi}EditarGastos`,request)

  // }

  // editarDevoluiones(request:Caja):Observable<ReponseApi>{
  //   console.log('Datos enviados de caja:', request);
  //   return this.http.put<ReponseApi>(`${this.urlApi}EditarDevoluciones`,request)

  // }

  // editarDevoluionesGasto(request:Caja):Observable<ReponseApi>{
  //   console.log('Datos enviados de caja:', request);
  //   return this.http.put<ReponseApi>(`${this.urlApi}EditarDevolucionesGasto`,request)

  // }

  // eliminar(id:number):Observable<ReponseApi>{

  //   return this.http.delete<ReponseApi>(`${this.urlApi}Eliminar/${id}`)

  // }

  // cambiarEstado(id: number): Observable<ReponseApi> {

  //   return this.http.put<ReponseApi>(`${this.urlApi}CambiarEstado/${id}`, null);
  // }


  // obtenerCajaPorUsuario(idUsuario: number): Observable<Caja | null> {
  //   const url = `${this.urlApi}usuario/${idUsuario}`; // Reemplaza '/usuario/' con la ruta adecuada para obtener la caja por usuario
  //   return this.http.get<Caja>(url); // Realiza una solicitud HTTP GET para obtener la caja por usuario
  // }

  // obtenerCajaPoridCaja(idCaja: number): Observable<Caja | null> {
  //   const url = `${this.urlApi}${idCaja}`; // Reemplaza '/usuario/' con la ruta adecuada para obtener la caja por usuario
  //   return this.http.get<Caja>(url); // Realiza una solicitud HTTP GET para obtener la caja por usuario
  // }

  // realizarPrestamo(idCaja: number, prestamosTexto: number, comentarios: string): Observable<any> {
  //   const requestBody = {
  //     idCaja: idCaja,
  //     prestamosTexto: prestamosTexto,
  //     comentarios: comentarios
  //   };
  //   console.log('Prestamo:', requestBody);
  //   // Realiza una solicitud HTTP POST a tu API para realizar el préstamo
  //   return this.http.post<any>(`${this.urlApi}prestamo`, requestBody);
  // }

  // devoluciones(idCaja: number, numeroDocumento: string, comentariosDevoluciones: string): Observable<any> {
  //   const requestBody = {
  //     idCaja: idCaja,
  //     numeroDocumento: numeroDocumento,
  //     comentariosDevoluciones: comentariosDevoluciones
  //   };
  //   console.log('Prestamo:', requestBody);
  //   // Realiza una solicitud HTTP POST a tu API para realizar el préstamo
  //   return this.http.post<any>(`${this.urlApi}devoluciones`, requestBody);
  // }

  // Gastos(idCaja: number, numeroDocumentoCompra: string, comentariosGastos: string): Observable<any> {
  //   const requestBody = {
  //     idCaja: idCaja,
  //     numeroDocumentoCompra: numeroDocumentoCompra,
  //     comentariosGastos: comentariosGastos
  //   };
  //   console.log('Prestamo:', requestBody);
  //   // Realiza una solicitud HTTP POST a tu API para realizar el préstamo
  //   return this.http.post<any>(`${this.urlApi}gasto`, requestBody);
  // }

  // obtenerComentarios(idCaja: number): Observable<string> {
  //   return this.http.get<string>(`${this.urlApi}comentarios/${idCaja}`);
  // }

}
