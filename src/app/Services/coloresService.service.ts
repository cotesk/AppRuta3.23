import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColoresService {
  // Usamos BehaviorSubject para emitir el color
  private colorSubject: BehaviorSubject<string>;


  private colorUpdatedSource = new Subject<void>();

  colorUpdated$ = this.colorUpdatedSource.asObservable();


  // Exposición del color como Observable
  color$;

  constructor() {
    // Intentamos obtener el color desde localStorage
    const colorGuardado = localStorage.getItem('colorSeleccionado');
    // Si hay un color guardado, usamos ese, de lo contrario, usamos 'blanco' como valor por defecto
    const colorInicial = colorGuardado ? colorGuardado : 'blanco';

    // Inicializamos colorSubject con el color recuperado o el color por defecto
    this.colorSubject = new BehaviorSubject<string>(colorInicial);
    // Ahora inicializamos el observable color$
    this.color$ = this.colorSubject.asObservable();
  }

  // Método para actualizar el color
  setColor(color: string): void {
    console.log('Color recibido en service:', color);
    this.colorSubject.next(color); // Emitir el nuevo color
    localStorage.setItem('colorSeleccionado', color); // Almacenar en localStorage
  }


  updateColor() {
    console.log('Notificando actualización de color');
    this.colorUpdatedSource.next();
  }



}
