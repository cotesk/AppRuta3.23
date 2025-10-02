import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import{Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';
import { Menu } from '../Interfaces/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private urlApi:string =environment.endpoint + "Menu/"


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

  lista(idUsuario:number):Observable<ReponseApi>{
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}Lista?idUsuario=${idUsuario}`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  obtenerMenusPorUsuario(idUsuario: number): Observable<Menu[]> {
    const headers = this.getHeaders();
    return this.http.get<ReponseApi>(`${this.urlApi}Lista?idUsuario=${idUsuario}`, { headers }).pipe(
      catchError(this.handleError),
      map(response => response.value || [])
    );
  }

  listaMenu():Observable<ReponseApi>{
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}ListaMenu`, { headers: headers }).pipe(
      catchError(this.handleError)
    );

  }
  agregarPermiso(idRol: number, idMenu: number): Observable<boolean> {
    const headers = this.getHeaders();
    console.log('Enviando solicitud para agregar permiso con los siguientes datos:');
    console.log('idRol:', idRol);
    console.log('idMenu:', idMenu);

    return this.http.post<boolean>(`${this.urlApi}AgregarPermiso`, { idRol, idMenu }, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  eliminarPermiso(idRol: number, idMenu: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.post<boolean>(`${this.urlApi}EliminarPermiso`, { idRol, idMenu }, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  obtenerMenuRolesPorRol(idRol: number): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.get<ReponseApi>(`${this.urlApi}ObtenerMenuRolesPorRol?idRol=${idRol}`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    return throwError('Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
  }
  // modificarPermiso(idRol: number, idMenu: number, agregar: boolean): Observable<boolean> {
  //   const endpoint = agregar ? 'AgregarPermiso' : 'EliminarPermiso';
  //   return this.http.post<boolean>(`${this.urlApi}${endpoint}`, { idRol, idMenu });
  // }



  // actualizarPermisos(idRol: number, menus: Menu[]): Observable<boolean> {
  //   const menuIds = menus.map(menu => menu.idMenu);
  //   return this.http.post<boolean>(`${this.urlApi}ActualizarPermisos`, { idRol, menuIds });
  // }


  //aqui

  // lista(idUsuario:number):Observable<ReponseApi>{

  //   return this.http.get<ReponseApi>(`${this.urlApi}Lista?idUsuario=${idUsuario}`)
  // }
  // listaMenu():Observable<ReponseApi>{

  //   return this.http.get<ReponseApi>(`${this.urlApi}ListaMenu`)
  // }
  // agregarPermiso(idRol: number, idMenu: number): Observable<boolean> {
  //   console.log('Enviando solicitud para agregar permiso con los siguientes datos:');
  //   console.log('idRol:', idRol);
  //   console.log('idMenu:', idMenu);

  //   return this.http.post<boolean>(`${this.urlApi}AgregarPermiso`, { idRol, idMenu });
  // }

  // eliminarPermiso(idRol: number, idMenu: number): Observable<boolean> {
  //   return this.http.post<boolean>(`${this.urlApi}EliminarPermiso`, { idRol, idMenu });
  // }
}
