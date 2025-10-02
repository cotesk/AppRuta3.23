// temporizador.service.ts

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, timer, Subscription } from 'rxjs';
import { take, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class TemporizadorService implements OnDestroy {
  private tiempoRestanteSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private subscription: Subscription | null = null;
  private tiempoRestante: number = 0;

  iniciarConteoRegresivo(segundos: number): void {
    this.tiempoRestanteSubject.next(segundos);

    this.subscription = timer(0, 1000).pipe(
      take(segundos),
      finalize(() => {
        this.tiempoRestanteSubject.next(0);
        this.cerrarModal(); // Llama al método para cerrar el modal cuando el tiempo llega a cero
      })
    ).subscribe((tiempoRestante) => {
      this.tiempoRestanteSubject.next(segundos - tiempoRestante - 1);
    });
  }

  getTiempoRestante$(): Observable<number> {
    return this.tiempoRestanteSubject.asObservable();
  }
  private cerrarModal(): void {
    // Agrega lógica para cerrar el modal aquí
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
