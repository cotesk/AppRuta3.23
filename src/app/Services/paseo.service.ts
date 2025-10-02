import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';
import { Paseo } from '../Interfaces/paseo';

@Injectable({
providedIn: 'root'
})
export class PaseoService {

private urlApi: string = environment.endpoint + "Paseos/";

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

// Listar todos los paseos
lista(): Observable<ReponseApi> {
return this.http.get<ReponseApi>(`${this.urlApi}Lista`).pipe(
catchError(this.handleError)
);
}

// Obtener paseo por id
obtenerPorId(id: number): Observable<Paseo> {
return this.http.get<Paseo>(`${this.urlApi}${id}`).pipe(
catchError(this.handleError)
);
}

// Guardar nuevo paseo con lista de perros
guardar(paseo: Paseo, idsPerros: number[]): Observable<ReponseApi> {
const headers = this.getHeaders();
return this.http.post<ReponseApi>(
`${this.urlApi}Guardar?${idsPerros.map(id => `idsPerros=${id}`).join('&')}`,
paseo,
{ headers }
).pipe(
catchError(this.handleError)
);
}

guardarSemana(paseo: Paseo, idsPerros: number[]): Observable<ReponseApi> {
const headers = this.getHeaders();
return this.http.post<ReponseApi>(
`${this.urlApi}GuardarSemana?${idsPerros.map(id => `idsPerros=${id}`).join('&')}`,
paseo,
{ headers }
).pipe(
catchError(this.handleError)
);
}

// Editar paseo con lista de perros
editar(paseo: Paseo, idsPerros: number[]): Observable<ReponseApi> {
const headers = this.getHeaders();
return this.http.put<ReponseApi>(
`${this.urlApi}Editar?${idsPerros.map(id => `idsPerros=${id}`).join('&')}`,
paseo,
{ headers }
).pipe(
catchError(this.handleError)
);
}

// Cambiar estado a entregado
entregar(id: number): Observable<ReponseApi> {
const headers = this.getHeaders();
return this.http.put<ReponseApi>(`${this.urlApi}Entregar/${id}`, {}, { headers }).pipe(
catchError(this.handleError)
);
}

// Cambiar estado a finalizado
finalizar(id: number): Observable<ReponseApi> {
const headers = this.getHeaders();
return this.http.put<ReponseApi>(`${this.urlApi}Finalizar/${id}`, {}, { headers }).pipe(
catchError(this.handleError)
);
}

// Cambiar estado a cancelado
cancelar(id: number): Observable<ReponseApi> {
const headers = this.getHeaders();
return this.http.put<ReponseApi>(`${this.urlApi}Cancelado/${id}`, {}, { headers }).pipe(
catchError(this.handleError)
);
}

// Eliminar paseo
eliminar(id: number): Observable<ReponseApi> {
const headers = this.getHeaders();
return this.http.delete<ReponseApi>(`${this.urlApi}Eliminar/${id}`, { headers }).pipe(
catchError(this.handleError)
);
}

// Obtener paseos de un cliente
obtenerPorCliente(idCliente: number): Observable<ReponseApi> {
return this.http.get<ReponseApi>(`${this.urlApi}Cliente/${idCliente}`).pipe(
catchError(this.handleError)
);
}

private handleError(error: any) {
console.error('Error en la solicitud:', error);
return throwError(() => 'Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
}
}
