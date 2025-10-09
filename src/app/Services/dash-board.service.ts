import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import{Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';


@Injectable({
  providedIn: 'root'
})
export class DashBoardService {

  private urlApi:string =environment.endpoint + "DashBoard/"


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

  resumenPaseos(): Observable<ReponseApi> {
     const headers = this.getHeaders();
    return this.http.get<ReponseApi>(`${this.urlApi}ResumenPaseo`, { headers });
  }

  resumenPagos(): Observable<ReponseApi> {
     const headers = this.getHeaders();
    return this.http.get<ReponseApi>(`${this.urlApi}ResumenPagos`, { headers });
  }


}
