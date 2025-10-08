import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';
import { Pago } from '../Interfaces/pago';

@Injectable({
    providedIn: 'root'
})
export class PagoService {

    private urlApi: string = environment.endpoint + "Pagos/";

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

    // Listar todos los pagos
    lista(): Observable<ReponseApi> {
        return this.http.get<ReponseApi>(`${this.urlApi}Lista`).pipe(
            catchError(this.handleError)
        );
    }

    // Obtener pago por id
    obtenerPorId(id: number): Observable<ReponseApi> {
        return this.http.get<ReponseApi>(`${this.urlApi}${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // Registrar un pago para un paseo específico
    registrarUno(pago: Pago, idPaseo: number): Observable<ReponseApi> {
        const headers = this.getHeaders();
        return this.http.post<ReponseApi>(
            `${this.urlApi}RegistrarUno?idPaseo=${idPaseo}`,
            pago,
            { headers }
        ).pipe(
            catchError(this.handleError)
        );
    }

    // Registrar un pago que cubra todos los paseos pendientes del usuario
    registrarTodos(pago: Pago): Observable<ReponseApi> {
        const headers = this.getHeaders();
        return this.http.post<ReponseApi>(`${this.urlApi}RegistrarTodos`, pago, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    //total por cliente
    totalPorCliente(id: number): Observable<ReponseApi> {
        return this.http.get<ReponseApi>(`${this.urlApi}TotalPorCliente/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    listaPaginada(page: number = 1, pageSize: number = 5, searchTerm: string = ''): Observable<ReponseApi> {
        const headers = this.getHeaders();

        let params = new HttpParams()
            .set('page', page)
            .set('pageSize', pageSize);

        if (searchTerm && searchTerm.trim() !== '') {
            params = params.set('searchTerm', searchTerm);
        }

        return this.http.get<ReponseApi>(`${this.urlApi}Lista`, { headers, params }).pipe(
            catchError(this.handleError)
        );
    }


    listaTodos(): Observable<ReponseApi> {
        const headers = this.getHeaders();
        return this.http.get<ReponseApi>(`${this.urlApi}ListaTodos`, { headers });
    }


    private handleError(error: any) {
        console.error('Error en la solicitud:', error);
        return throwError(() => 'Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
    }
}
