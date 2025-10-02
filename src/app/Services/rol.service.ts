import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import{Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';



@Injectable({
  providedIn: 'root'
})
export class RolService {

  private urlApi:string =environment.endpoint + "Rol/"


  constructor(private http:HttpClient) { }

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

  lista():Observable<ReponseApi>{
    // const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}Lista`).pipe(
      catchError(this.handleError)
    );
  }
  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    return throwError('Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
  }

  // lista():Observable<ReponseApi>{

  //   return this.http.get<ReponseApi>(`${this.urlApi}Lista`)
  // }


}
