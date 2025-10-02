import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-prestamos',
  templateUrl: './modal-prestamos.component.html',
  styleUrls: ['./modal-prestamos.component.css']
})
export class ModalPrestamosComponent {
  comentariosSeparados: string[] = [];
  comentariosPaginados: string[] = [];

  page: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    const comentarios: string = data.comentarios || '';
    this.comentariosSeparados = comentarios.split('\n').map(c => c.trim()).filter(c => c.length > 0);
    this.totalPages = Math.ceil(this.comentariosSeparados.length / this.pageSize);
    this.cargarPagina();
  }

  formatComentario(comentario: string): string {
    return comentario;
  }

  cargarPagina(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.comentariosPaginados = this.comentariosSeparados.slice(start, end);
  }

  siguientePagina(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.cargarPagina();
    }
  }

  paginaAnterior(): void {
    if (this.page > 1) {
      this.page--;
      this.cargarPagina();
    }
  }
}
