import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private UrlApi= 'https://api-colombia.com/api/v1/Department'

  constructor(private http: HttpClient) { }

public getData():Observable<any>{

return this.http.get<any>(this.UrlApi);


}

getCiudadesByDepartamentoId(departamentoId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.UrlApi}/${departamentoId}/cities`).pipe(
    tap(ciudades => console.log('Ciudades recibidas:', ciudades))
  );
}




  public getDataMunicipio():Observable<any>{

    return this.http.get<any>(this.UrlApi);


    }






}
