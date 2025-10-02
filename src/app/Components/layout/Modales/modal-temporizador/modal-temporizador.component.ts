import { TemporizadorService } from './../../../../Services/temporizador.service';
// modal-temporizador.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-temporizador',
  templateUrl: './modal-temporizador.component.html',
  styleUrls: ['./modal-temporizador.component.css'],
})
export class ModalTemporizadorComponent implements OnInit, OnDestroy {
  tiempoRestante: number=0;

  constructor(
    private dialogRef: MatDialogRef<ModalTemporizadorComponent>,
    private temporizadorService: TemporizadorService
  ) {}

  ngOnInit(): void {
    // Suscríbete al servicio para actualizar el tiempo restante
    this.temporizadorService.getTiempoRestante$().subscribe((tiempo) => {
      this.tiempoRestante = tiempo;
    });
  }

  ngOnDestroy(): void {
    // Debe destruirse la suscripción cuando el componente/modal se destruye
    // De esta manera, evitarás pérdidas de memoria
    this.temporizadorService.ngOnDestroy();
  }
  getProgressBarWidth(): string {
    // Calcula el ancho de la barra de progreso en función del tiempo restante
    const ancho = (this.tiempoRestante / 30) * 100; // 30 es el tiempo total en segundos
    return ancho + '%';
  }
}
