import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ColoresService } from '../../../../Services/coloresService.service';

@Component({
  selector: 'app-colores',
  templateUrl: './colores.component.html',
  styleUrls: ['./colores.component.css']
})
export class ColoresComponent {

  toolbarColorClass: string = 'toolbar-white';
  sidenavColorClass: string = 'sidenav-white';
  ngContainerColorClass: string = 'sidenav-white';

  selectedColor: string = '';

  constructor(private colorService: ColoresService) {}

  colors = [

    { value: 'morado', viewValue: 'Morado' },
    { value: 'rojo', viewValue: 'Rojo' },
    { value: 'verde', viewValue: 'Verde' },
    { value: 'azul', viewValue: 'Azul' },
    { value: 'black', viewValue: 'Negro' },
    { value: 'blanco', viewValue: 'Blanco' },

  ];

  // Definir el tipo de dato para colorIcons
  colorCircles: { [key: string]: string } = {
    blanco: '#ffffff',
    morado: '#7e3f88',
    rojo: '#940c0c',
    verde: '#064006',
    black: '#000000',
    azul: '#1f448f',
  };

  colorCircles2: { [key: string]: string } = {
    blanco: '#f4eeee',
    morado: '#522b41',
    rojo: '#c72c2c',
    verde: '#126b12',
    black: '#242222',
    azul: '#385897',
  };

  // aplicarCambios(): void {
  //   if (!this.selectedColor) {
  //     // Si no se ha seleccionado ningún color, mostrar un mensaje de error y salir de la función
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Error',
  //       text: 'Por favor selecciona un color antes de aplicar los cambios.',
  //       confirmButtonText: 'Aceptar'
  //     });
  //     return;
  //   }
  //   const icono = this.colorCircles[this.selectedColor];
  //   // Aplicar los cambios según el color seleccionado
  //   switch (this.selectedColor) {
  //     case 'morado':
  //       this.toolbarColorClass = 'toolbar-morado';
  //       this.sidenavColorClass = 'sidenav-morado';
  //       this.ngContainerColorClass = 'ng-container-morado';
  //       break;
  //     case 'rojo':
  //       this.toolbarColorClass = 'toolbar-red';
  //       this.sidenavColorClass = 'sidenav-red';
  //       this.ngContainerColorClass = 'ng-container-red';
  //       break;
  //     case 'verde':
  //       this.toolbarColorClass = 'toolbar-green';
  //       this.sidenavColorClass = 'sidenav-green';
  //       this.ngContainerColorClass = 'ng-container-green';
  //       break;
  //       case 'azul':
  //         this.toolbarColorClass = 'toolbar-azul';
  //         this.sidenavColorClass = 'sidenav-azul';
  //         this.ngContainerColorClass = 'ng-container-azul';
  //         break;
  //     case 'black':
  //       this.toolbarColorClass = 'toolbar-black';
  //       this.sidenavColorClass = 'sidenav-black';
  //       this.ngContainerColorClass = 'ng-container-black';
  //       break;

  //     case 'blanco':
  //       this.toolbarColorClass = 'toolbar-white';
  //       this.sidenavColorClass = 'sidenav-white';
  //       this.ngContainerColorClass = 'ng-container-white';
  //       break;
  //     default:
  //       console.error('Color no reconocido');
  //       break;
  //   }

  //   // Guardar el color seleccionado en el localStorage
  //   localStorage.setItem('colorSeleccionado', this.selectedColor);

  //   // Mostrar el mensaje de confirmación
  //   Swal.fire({
  //     icon: 'success',
  //     title: 'Color aplicado',
  //     text: `El color ${this.selectedColor} ha sido aplicado.`,
  //     confirmButtonText: 'Aceptar'
  //   }).then(() => {
  //     // Recargar la página después de cerrar el mensaje
  //     window.location.reload();
  //   });
  // }
  aplicarCambios(): void {
    if (!this.selectedColor) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor selecciona un color antes de aplicar los cambios.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
      // Actualiza el color en el servicio
      this.colorService.setColor(this.selectedColor);

    // Swal.fire({
    //   icon: 'success',
    //   title: 'Color aplicado',
    //   text: `El color ${this.selectedColor} ha sido aplicado.`,
    //   confirmButtonText: 'Aceptar'
    // });
  }

}
