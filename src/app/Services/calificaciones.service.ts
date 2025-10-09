import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ReponseApi } from '../Interfaces/reponse-api';
import { UtilidadService } from '../Reutilizable/utilidad.service';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CalificacionService {

    private urlApi: string = environment.endpoint + "Calificaciones/";

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

    registrarCalificacion(request: any): Observable<ReponseApi> {
        const headers = this.getHeaders();
        return this.http.post<ReponseApi>(`${this.urlApi}Registrar`, request, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    obtenerPromedio(idPaseador: number, page: number = 1, pageSize: number = 5): Observable<ReponseApi> {
        const headers = this.getHeaders();
        const params = new HttpParams()
            .set('page', page)
            .set('pageSize', pageSize);

        return this.http.get<ReponseApi>(`${this.urlApi}Promedio/${idPaseador}`, { headers, params }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: any) {
        console.error('Error en la solicitud:', error);
        return throwError('Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
    }


}
