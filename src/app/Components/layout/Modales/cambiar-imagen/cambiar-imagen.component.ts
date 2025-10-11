 import { PerroService } from './../../../../Services/perro.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-cambiar-imagen',
  templateUrl: './cambiar-imagen.component.html',
  styleUrls: ['./cambiar-imagen.component.css'],
  styles: [`
  .dialog-content {
    width: 450px; /* Ajusta el ancho según tus necesidades */
    height: 350px; /* Ajusta la altura según tus necesidades */
  }
`]
})
export class CambiarImagenComponent implements OnInit {
  nuevoArchivo: File | null = null; // Variable para almacenar el nuevo archivo de imagen
  tituloAccion: string = "Guardar";
  botonGuardar: string = "Guardar";
  botonCancelar: string = "Cancelar";
  fileName: string = '';
  formularioProducto: FormGroup;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  imagenesPerro: string[] = []; // URLs de imágenes actuales
  imagenSeleccionada: string = ''; // URL seleccionada a reemplazar
  accionSeleccionada: string = 'Agregar';

  public previsualizacion: SafeUrl | null = null;
  constructor(
    
    public dialogRef: MatDialogRef<CambiarImagenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _perroServicio: PerroService,
    private _utilidadServicio: UtilidadService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private _usuarioServicio: UsuariosService,
  ) {
    console.log('Data en CambiarImagenComponent:', this.data);
    this.previsualizacion = null;
    this.formularioProducto = this.fb.group({

      imageData: ['']
    });
  }


  ngOnInit(): void {
    // Extraer las imágenes del perro
    if (this.data?.perro?.imagenUrl) {
      this.imagenesPerro = this.data.perro.imagenUrl || [];
      
    }
  }

  ejecutarAccion() {
    const idPerro = this.data.perro.idPerro;

    switch (this.accionSeleccionada) {
      case 'Agregar':
        if (this.imagenesPerro.length >= 6) {
          Swal.fire('Máximo alcanzado', 'Solo puedes tener hasta 6 imágenes.', 'warning');
          return;
        }
        if (!this.nuevoArchivo) {
          Swal.fire('Imagen requerida', 'Selecciona una imagen para agregar.', 'warning');
          return;
        }

        this._perroServicio.agregarNuevaImagen(idPerro, this.nuevoArchivo).subscribe({
          next: () => {
            Swal.fire('Imagen agregada', 'La imagen fue agregada exitosamente.', 'success');
            this.recargarImagenes(); // Por si tienes una función para actualizar el listado
            this.dialogRef.close(true);
          },
          error: () => {
            Swal.fire('Error', 'No se pudo agregar la imagen.', 'error');
          }
        });
        break;

      case 'Cambiar':
        if (!this.imagenSeleccionada) {
          Swal.fire('Selecciona una imagen', 'Debes seleccionar una imagen a reemplazar.', 'warning');
          return;
        }
        if (!this.nuevoArchivo) {
          Swal.fire('Imagen nueva requerida', 'Selecciona la nueva imagen.', 'warning');
          return;
        }

        this.actualizarImagen();
        break;

      case 'Eliminar':
        if (this.imagenesPerro.length <= 1) {
          Swal.fire('No permitido', 'Debe quedar al menos una imagen.', 'warning');
          return;
        }
        if (!this.imagenSeleccionada) {
          Swal.fire('Selecciona una imagen', 'Debes seleccionar una imagen para eliminar.', 'warning');
          return;
        }
        this.eliminarFoto();
        break;
    }
  }



  seleccionarImagenParaReemplazar(imagen: string) {
    this.imagenSeleccionada = imagen;
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];

    if (file) {
      if (file.size > 3 * 1024 * 1024) { // 3 MB en bytes
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El tamaño de la imagen no debe exceder los 3 MB.',
        });
        return; // No continuar si el tamaño del archivo es mayor a 3 MB
      }
      this.nuevoArchivo = file;
      this.fileName = file.name;

      // Convierte la imagen a una URL segura
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    // Actualiza la referencia directamente desde el evento de cambio
    if (event.target) {
      event.target.value = '';
    }
  }

  actualizarImagen() {

    if (this.nuevoArchivo!.size > 3000000) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'La imagen no debe superar los 3 MB de tamaño.',
      });
      return;
    }


    if (this.nuevoArchivo && this.data && this.data.perro) {
      console.log('ID del perro en guardarNuevaImagen:', this.data.perro.idPerro);

      // Asegúrate de que la información del perro sea correcta
      console.log('Perro en guardarNuevaImagen:', this.data.perro);

      const idPerro = this.data.perro.idPerro;
      this._perroServicio.actualizarImagen(idPerro, this.nuevoArchivo, this.imagenSeleccionada)
        .subscribe(
          response => {
            console.log('Respuesta del servicio:', response);

            if (response.status) {
              // this.dialogRef.close(true); // Cierra el diálogo indicando éxito
              Swal.fire({
                icon: 'success',
                title: 'Imagen Cambiada',
                text: 'Se cambio la nueva imagen',
              });
               this.recargarImagenes();
                this.dialogRef.close(true);
              // this._utilidadServicio.mostrarAlerta("Se cambio la nueva imagen", "OK!");
            } else {
              // this._utilidadServicio.mostrarAlerta("No se pudo registrar la imagen", "Error");
              console.error('Error al actualizar la imagen:', response.msg);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo registrar la imagen',
              });
            }
          },
          error => {
            console.error('Error en la suscripción al servicio:', error);
            // Swal.fire({
            //   icon: 'error',
            //   title: 'Error',
            //   text: 'Error al conectar con el servicio',
            // });
            // this._utilidadServicio.mostrarAlerta("Error al conectar con el servicio", "Error");
            let idUsuario: number = 0;


            // Obtener el idUsuario del localStorage
            const usuarioString = localStorage.getItem('usuario');
            const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
            const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
            if (datosDesencriptados !== null) {
              const usuario = JSON.parse(datosDesencriptados);
              idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

              this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
                (usuario: any) => {

                  console.log('Usuario obtenido:', usuario);
                  let refreshToken = usuario.refreshToken

                  // Manejar la renovación del token
                  this._usuarioServicio.renovarToken(refreshToken).subscribe(
                    (response: any) => {
                      console.log('Token actualizado:', response.token);
                      // Guardar el nuevo token de acceso en el almacenamiento local
                      localStorage.setItem('authToken', response.token);
                      this.actualizarImagen();
                    },
                    (error: any) => {
                      console.error('Error al actualizar el token:', error);
                    }
                  );



                },
                (error: any) => {
                  console.error('Error al obtener el usuario:', error);
                }
              );
            }
          }
        );
    } else {
      console.error('Datos insuficientes para guardar la nueva imagen');
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'seleccione una imagen para poder realizar el cambio',
      });
      // this._utilidadServicio.mostrarAlerta("seleccione una imagen para poder realizar el cambio", "Error");
    }


  }

  eliminarFoto() {

    const idPerro = this.data.perro.idPerro;
    this._perroServicio.eliminarImagen(idPerro, this.imagenSeleccionada).subscribe({
      next: () => {
        Swal.fire('Imagen eliminada', 'La imagen fue eliminada exitosamente.', 'success');
        this.recargarImagenes();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo eliminar la imagen.', 'error');
      }
    });
  }

  recargarImagenes(): void {
    const idPerro = this.data.perro.idPerro;

    this._perroServicio.obtenerImagenesPerro(idPerro).subscribe({
      next: (imagenes: string[]) => {
        this.imagenesPerro = imagenes;
         this.dialogRef.close(true);
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron recargar las imágenes del producto.', 'error');
      }
    });
  }


  limpiarImagen(): void {
    this.formularioProducto.patchValue({
      imageData: null,
    });
    this.previsualizacion = null;
    this.nuevoArchivo = null; // Agregar esta línea para asegurarte de que el nuevo archivo también se borre
    this.fileName = '';
  }


  // Método para cerrar el diálogo sin realizar cambios
  cancelar() {
    this.dialogRef.close(false);
  }
}
