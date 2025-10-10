import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalificacionService } from '../../../../Services/calificaciones.service';

@Component({
  selector: 'app-comentarios-pasador-modal',
  templateUrl: './comentarios-pasador-modal.component.html',
  styleUrls: ['./comentarios-pasador-modal.component.css']
})
export class ComentariosPasadorModalComponent implements OnInit {

  comentarios: any[] = [];
  paginaActual = 1;
  totalPaginas = 1;
  total = 0;
  idPasador: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ComentariosPasadorModalComponent>,
    private calificacionService: CalificacionService
  ) {
    this.idPasador = data.idPasador;
    console.log(data);
  }

  ngOnInit(): void {
    this.cargarComentarios();
  }

  cargarComentarios() {
    
    this.calificacionService.obtenerPromedio(this.idPasador, this.paginaActual, 5).subscribe({
      next: (res) => {
        if (res.status) {
          this.comentarios = res.value.comentarios;
          this.total = res.value.total;
          this.paginaActual = res.value.paginaActual;
          this.totalPaginas = res.value.totalPaginas;
        }
      },
      error: (err) => console.error('Error al cargar comentarios', err)
    });
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarComentarios();
    }
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
