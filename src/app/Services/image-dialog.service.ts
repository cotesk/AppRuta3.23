import { ImageDialogComponent } from './../Components/layout/Modales/image-dialog/image-dialog.component';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
  providedIn: 'root',
})
export class ImageDialogService {
  constructor(private dialog: MatDialog) {}

  openImageDialog(imagenUrl: string): void {
    this.dialog.open(ImageDialogComponent, {
      data: imagenUrl,
      maxWidth: '90vw',
      maxHeight: '90vh',
    });
  }
}
