import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalificacionService } from './../../../../Services/calificaciones.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calificar-paseador-modal',
  templateUrl: './calificar-paseador-modal.component.html',
  styleUrls: ['./calificar-paseador-modal.component.css']
})
export class CalificarPaseadorModalComponent {

  calificacionForm: FormGroup;
  estrellasSeleccionadas = 0;

  constructor(
    private fb: FormBuilder,
    private _calificacionService: CalificacionService,
    private dialogRef: MatDialogRef<CalificarPaseadorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idPaseo: number, idUsuarioPasador: number, idUsuarioCliente: number }
  ) {
    this.calificacionForm = this.fb.group({
      comentario: ['', [Validators.maxLength(300)]]
    });
  }

  seleccionarEstrella(valor: number): void {
    this.estrellasSeleccionadas = valor;
  }

  enviarCalificacion(): void {
    if (this.estrellasSeleccionadas === 0) {
      Swal.fire('Atención', 'Por favor selecciona una calificación.', 'warning');
      return;
    }
    console.log(this.data);
    const calificacion = {
      idPaseo: this.data.idPaseo,
      idPaseador: this.data.idUsuarioPasador,
      idCliente: this.data.idUsuarioCliente,
      estrellas: this.estrellasSeleccionadas,
      comentario: this.calificacionForm.value.comentario
    };
    console.log(calificacion);
    this._calificacionService.registrarCalificacion(calificacion).subscribe({
      next: (resp) => {
        console.log(resp);
        if (resp.status) {
          Swal.fire('¡Gracias!', resp.msg, 'success');
          this.dialogRef.close(true);
        } else {
          Swal.fire('Aviso', resp.msg, 'info');
        }
      },
      error: () => {
        Swal.fire('Error', 'No se pudo enviar la calificación.', 'error');
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
