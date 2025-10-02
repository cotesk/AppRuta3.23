import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
// import { Producto } from '../../../../Interfaces/producto';
// import { VerImagenProductoModalComponent } from '../ver-imagen-producto-modal/ver-imagen-producto-modal.component';
// import { ModalCaracteristicasProductoComponent } from '../modal-caracteristicas-producto/modal-caracteristicas-producto.component';
// import { ProductoService } from '../../../../Services/producto.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-notificaciones-dialog',
  templateUrl: './notificaciones-dialog.component.html',
  styleUrls: ['./notificaciones-dialog.component.css']
})
export class NotificacionesDialogComponent {
  // productos: Producto[];
  paginaActual = 0;
  productosPorPagina = 3;

  // constructor(
  //   public dialogRef: MatDialogRef<NotificacionesDialogComponent>,
  //   private dialog: MatDialog,
  //   // private productoService: ProductoService,

  //   @Inject(MAT_DIALOG_DATA) public data: { productos: Producto[] }
  // ) {
  //   this.productos = data.productos;
  //   console.log('Tamaño de productos con stock bajo:', this.productos);
  // }

 

}
