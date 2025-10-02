import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrl: './image-dialog.component.css'
})
export class ImageDialogComponent {

  @ViewChild('imageContainer') imageContainer!: ElementRef;

  zoomLevel = 1;
  offsetX = 0;
  offsetY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;

  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public imagenUrl: string
  ) {


  }

  // constructor(@Inject(MAT_DIALOG_DATA) public imageData: string) {}


  cerrarDialog() {
    this.dialogRef.close();
  }

  startPan(event: MouseEvent | TouchEvent): void {
    event.preventDefault(); // Evita comportamientos predeterminados
    this.isPanning = true;
    const pos = this.getEventPosition(event);
    this.startX = pos.x - this.offsetX;
    this.startY = pos.y - this.offsetY;
  }

  panImage(event: MouseEvent | TouchEvent): void {
    if (!this.isPanning) return;
    event.preventDefault(); // Evita comportamientos predeterminados
    const pos = this.getEventPosition(event);
    this.offsetX = pos.x - this.startX;
    this.offsetY = pos.y - this.startY;
  }


  endPan(): void {
    this.isPanning = false;
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 3); // Máximo 3x
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 1); // Mínimo 1x
  }

  resetZoom(): void {
    this.zoomLevel = 1;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  private getEventPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    } else {
      const touch = event.touches[0] || event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
  }
}
