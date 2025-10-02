import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';
import { Tarifa } from '../Interfaces/tarifa';

@Injectable({
providedIn: 'root'
})
export class TarifaService {

private urlApi: string = environment.endpoint + "Tarifas/";

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

// Listar todas las tarifas
lista(): Observable<ReponseApi> {
return this.http.get<ReponseApi>(`${this.urlApi}Lista`).pipe(
catchError(this.handleError)
);
}

// Obtener una tarifa por id
obtenerPorId(id: number): Observable<Tarifa> {
return this.http.get<Tarifa>(`${this.urlApi}${id}`).pipe(
catchError(this.handleError)
);
}

// Crear una nueva tarifa
guardar(request: Tarifa): Observable<ReponseApi> {
const headers = this.getHeaders();
return this.http.post<ReponseApi>(`${this.urlApi}Guardar`, request, { headers }).pipe(
catchError(this.handleError)
);
}

// Editar una tarifa existente
editar(request: Tarifa): Observable<ReponseApi> {
const headers = this.getHeaders();
return this.http.put<ReponseApi>(`${this.urlApi}Editar`, request, { headers }).pipe(
catchError(this.handleError)
);
}

// Eliminar una tarifa por id
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
