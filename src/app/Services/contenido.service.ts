
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';
import { Contenido } from '../Interfaces/contenido';



@Injectable({
  providedIn: 'root'
})
export class ContenidoService {

  private urlApi: string = environment.endpoint + "Contenido/"


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


  private getHeaders2(): HttpHeaders {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error('No se encontró un token JWT en el almacenamiento local.');
      throw new Error('No se encontró un token JWT en el almacenamiento local.');
    }
    return new HttpHeaders({

      "Authorization": `Bearer ${token}`
    });
  }


  lista():Observable<ReponseApi>{
    //  const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}Lista`).pipe(
      catchError(this.handleError)
    );

  }
  guardar(request: Contenido): Observable<ReponseApi> {
    const headers = this.getHeaders();
    console.log('Datos enviados al servidor:', request);
    return this.http.post<ReponseApi>(`${this.urlApi}Guardar`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  // ProductoService
  actualizarImagenProducto(idContenido: number, nuevaImagen: File): Observable<ReponseApi> {
    console.log('ID de la empresa en actualizarImagen:', idContenido);

    const formData = new FormData();
    formData.append('imagen', nuevaImagen);

    const headers = this.getHeaders2();

    return this.http.post<ReponseApi>(`${this.urlApi}ActualizarImagen/${idContenido}`, formData, { headers });
  }




  decodeBase64ToImageUrl(base64String: string): string {
    const bytes = atob(base64String);
    const arrayBuffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      arrayBuffer[i] = bytes.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: 'image/png' });
    return URL.createObjectURL(blob);
  }

  editar(request: Contenido): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}Editar`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );

  }

  eliminar(id: number): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.delete<ReponseApi>(`${this.urlApi}Eliminar/${id}`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    return throwError('Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
  }


  // lista(): Observable<ReponseApi> {

  //   return this.http.get<ReponseApi>(`${this.urlApi}Lista`)
  // }
  // guardar(request: Empresa): Observable<ReponseApi> {

  //   return this.http.post<ReponseApi>(`${this.urlApi}Guardar`, request)

  // }
  // // ProductoService
  // actualizarImagenProducto(idEmpresa: number, nuevaImagen: File): Observable<ReponseApi> {
  //   console.log('ID de la empresa en actualizarImagen:', idEmpresa);

  //   const formData = new FormData();
  //   formData.append('imagen', nuevaImagen);

  //   return this.http.post<ReponseApi>(`${this.urlApi}ActualizarImagen/${idEmpresa}`, formData);
  // }

  // verificarNombreExistente(nombre: string): Observable<boolean> {
  //   const url = `${this.urlApi}verificar-nombre/${nombre}`;
  //   return this.http.get<boolean>(url);
  // }



  // decodeBase64ToImageUrl(base64String: string): string {
  //   const bytes = atob(base64String);
  //   const arrayBuffer = new Uint8Array(bytes.length);
  //   for (let i = 0; i < bytes.length; i++) {
  //     arrayBuffer[i] = bytes.charCodeAt(i);
  //   }
  //   const blob = new Blob([arrayBuffer], { type: 'image/png' });
  //   return URL.createObjectURL(blob);
  // }

  // editar(request: Empresa): Observable<ReponseApi> {

  //   return this.http.put<ReponseApi>(`${this.urlApi}Editar`, request)

  // }

  // eliminar(id: number): Observable<ReponseApi> {

  //   return this.http.delete<ReponseApi>(`${this.urlApi}Eliminar/${id}`)

  // }

}
