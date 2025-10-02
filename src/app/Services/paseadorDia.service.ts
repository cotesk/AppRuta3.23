import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';
import { PasadorDias } from '../Interfaces/pasadorDias';

@Injectable({
  providedIn: 'root'
})
export class PaseadorDiaService {

  private urlApi: string = environment.endpoint + "PasadorDias/";

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

  // Listar todos los días de pasadores
  lista(): Observable<ReponseApi> {
    return this.http.get<ReponseApi>(`${this.urlApi}Lista`).pipe(
      catchError(this.handleError)
    );
  }

  lista2(): Observable<ReponseApi> {
    return this.http.get<ReponseApi>(`${this.urlApi}Lista2`).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener un PasadorDias por id
  obtenerPorId(id: number): Observable<PasadorDias> {
    return this.http.get<PasadorDias>(`${this.urlApi}${id}`).pipe(
      catchError(this.handleError)
    );
  }

  obtenerDiasPorUsuario(idUsuario: number): Observable<ReponseApi> {
    const headers = this.getHeaders(); // con JWT
    return this.http.get<ReponseApi>(`${this.urlApi}Usuario/${idUsuario}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

    obtenerDiasPorUsuarioCompleto(idUsuario: number): Observable<ReponseApi> {
    const headers = this.getHeaders(); // con JWT
    return this.http.get<ReponseApi>(`${this.urlApi}UsuarioCompleto/${idUsuario}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Guardar nuevo PasadorDias
  guardar(request: PasadorDias): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.post<ReponseApi>(`${this.urlApi}Guardar`, request, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Editar PasadorDias existente
  editar(request: PasadorDias): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}Editar`, request, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar PasadorDias
  eliminar(id: number): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.delete<ReponseApi>(`${this.urlApi}Eliminar/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    return throwError(() => 'Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
  }
}
