import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';
import { Perro } from '../Interfaces/perro';

@Injectable({
  providedIn: 'root'
})
export class PerroService {

  private urlApi: string = environment.endpoint + "Perros/";

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

  lista(): Observable<ReponseApi> {
    return this.http.get<ReponseApi>(`${this.urlApi}Lista`).pipe(
      catchError(this.handleError)
    );
  }

  listaPaginada(page: number = 1, pageSize: number = 5, searchTerm: string = ''): Observable<any> {
    return this.http.get<any>(`${this.urlApi}ListaPaginada?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}`).pipe(
      catchError(this.handleError)
    );
  }

  guardar(request: Perro): Observable<ReponseApi> {
    const headers = this.getHeaders();
    console.log('Datos enviados al servidor:', request);
    return this.http.post<ReponseApi>(`${this.urlApi}Guardar`, request, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  editar(request: Perro): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}Editar`, request, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.delete<ReponseApi>(`${this.urlApi}Eliminar/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  actualizarImagen(idPerro: number, nuevaImagen: File, imagenAReemplazar?: string): Observable<ReponseApi> {
    const formData = new FormData();
    formData.append('imagen', nuevaImagen);
    if (imagenAReemplazar) {
      formData.append('imagenAReemplazar', imagenAReemplazar);
    }
    const headers = this.getHeaders2();
    return this.http.post<ReponseApi>(`${this.urlApi}ActualizarImagen/${idPerro}`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  agregarNuevaImagen(idPerro: number, nuevaImagen: File): Observable<ReponseApi> {
    const formData = new FormData();
    formData.append('imagen', nuevaImagen);
    const headers = this.getHeaders2();
    return this.http.post<ReponseApi>(`${this.urlApi}AgregarNuevaImagen/${idPerro}`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

 eliminarImagen(id: number, imagenAReemplazar: string): Observable<any> {
    const headers = this.getHeaders2(); // sin Content-Type

    const formData = new FormData();
    formData.append('imagenAReemplazar', imagenAReemplazar);

    return this.http.post<any>(
      `${this.urlApi}EliminarImagen/${id}`,
      formData,
      { headers: headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  obtenerImagenesPerro(idPerro: number): Observable<string[]> {
    const headers = this.getHeaders(); // Usa tu método con JWT

    return this.http.get<string[]>(`${this.urlApi}ObtenerImagenes/${idPerro}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  obtenerImagenPerro(idPerro: number): Observable<any> {
    const url = `${this.urlApi}imagen/${idPerro}`;
    return this.http.get<any>(url);
  }

  obtenerImagenNombrePerro(nombre: string): Observable<any> {
    const url = `${this.urlApi}imagen/nombre/${nombre}`;
    return this.http.get<any>(url);
  }


  buscarPorNombre(nombre: string): Observable<ReponseApi> {
    const headers = this.getHeaders();
    const url = `${this.urlApi}BuscarPorNombre?nombre=${nombre}`;

    return this.http.get<ReponseApi>(url, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerPerrosPorUsuario(idUsuario: number): Observable<ReponseApi> {
  const headers = this.getHeaders(); // con JWT
  return this.http.get<ReponseApi>(`${this.urlApi}Usuario/${idUsuario}`, { headers }).pipe(
    catchError(this.handleError)
  );
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

  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    return throwError('Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
  }

}
