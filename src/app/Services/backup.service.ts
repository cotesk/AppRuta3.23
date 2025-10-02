import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  // private apiUrl = 'https://localhost:5001/api/backup'; // Ajusta la URL según tu configuración
  private urlApi:string =environment.endpoint + "backup"
  constructor(private http: HttpClient) { }



 generateSqlScript(): Observable<string> {
    return this.http.get<string>(this.urlApi + '/generatesql' , { responseType: 'text' as 'json' });
  }


  restoreDatabase(scriptData: FormData | { script: string }): Observable<string> {
    if (scriptData instanceof FormData) {
      // Si scriptData es un objeto FormData, enviarlo directamente
      return this.http.post<string>(`${this.urlApi}/restoredatabase`, scriptData, { responseType: 'text' as 'json' });
    } else {
      // Si scriptData es un objeto con una propiedad script, extraer el script y enviarlo
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.http.post<string>(`${this.urlApi}/restoredatabase`, { script: scriptData.script }, { headers: headers, responseType: 'text' as 'json' });
    }
  }


}
