import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmacion-anulacion',
  templateUrl: './confirmacion-anulacion.component.html',
  styleUrls: ['./confirmacion-anulacion.component.css']
})
export class ConfirmacionAnulacionComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmacionAnulacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmarAnulacion(): void {
    this.dialogRef.close(true);
  }

  cancelarAnulacion(): void {
    this.dialogRef.close(false);
  }
}
