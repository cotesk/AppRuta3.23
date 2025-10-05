import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Licencias } from '../Interfaces/licencias';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LicenciaService {
    
  private urlApi:string =environment.endpoint + "Licencias/"


  constructor(private http:HttpClient) { }

  // Crear licencia
  crearLicencia(licencia: Licencias): Observable<any> {
    return this.http.post<any>(`${this.urlApi}crear`, licencia);
  }

  // Obtener todas
  getLicencias(): Observable<Licencias[]> {
    return this.http.get<Licencias[]>(`${this.urlApi}todas`);
  }


  getLicenciasPaginadas(page: number = 1, pageSize: number = 5, searchTerm: string = ''): Observable<any> {
    return this.http.get<any>(`${this.urlApi}ListaPaginadaLicencia`, {
      params: {
        page: page.toString(),
        pageSize: pageSize.toString(),
        searchTerm: searchTerm
      }
    });
  }

  // Consultar licencia por serial
  consultarLicencia(serial: string): Observable<any> {
    return this.http.get<any>(`${this.urlApi}consultar/${serial}`);
  }

  consultar(): Observable<any> {
    return this.http.get<any>(`${this.urlApi}consultar`);
  }


  // Validar (pagar) licencia
  validarLicencia(serial: string): Observable<any> {
    return this.http.put<any>(`${this.urlApi}validar/${serial}`, {});
  }

  // Desactivar licencia por id
  desactivarLicencia(id: number): Observable<any> {
    return this.http.put<any>(`${this.urlApi}desactivar/${id}`, {});
  }
}
