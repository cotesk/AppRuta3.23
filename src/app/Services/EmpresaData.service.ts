import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Empresa } from '../Interfaces/empresa';

@Injectable({
  providedIn: 'root'
})
export class EmpresaDataService {
  private empresaActualizadaSource = new Subject<Empresa>();
  empresaActualizada$ = this.empresaActualizadaSource.asObservable();

  constructor() { }

  actualizarEmpresa(empresa: Empresa) {
    this.empresaActualizadaSource.next(empresa);
  }
}
