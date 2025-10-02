import { EmpresaService } from './../../../../Services/empresa.service';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { ImageUpdatedService } from '../../../../Services/image-updated.service';
import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-cambiar-imagen-empresa',
  templateUrl: './cambiar-imagen-empresa.component.html',
  styleUrl: './cambiar-imagen-empresa.component.css',
  styles: [`
  .dialog-content {
    width: 450px; /* Ajusta el ancho según tus necesidades */
    height: 350px; /* Ajusta la altura según tus necesidades */
  }
`]
})
export class CambiarImagenEmpresaComponent {
  nuevoArchivo: File | null = null; // Variable para almacenar el nuevo archivo de imagen
  tituloAccion: string = "Guardar";
  botonGuardar: string = "Guardar";
  botonCancelar: string = "Cancelar";
  fileName: string = '';
  formularioProducto: FormGroup;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  public previsualizacion: SafeUrl | null = null;
  constructor(
    public dialogRef: MatDialogRef<CambiarImagenEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _empresaServicio: EmpresaService,
    private _utilidadServicio: UtilidadService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private imageUpdatedService: ImageUpdatedService,
    private _usuarioServicio: UsuariosService,
  ) {
    console.log('Data en CambiarImagenComponent:', this.data);
    this.previsualizacion = null;
    this.formularioProducto = this.fb.group({

      imageData: ['']
    });
  }

  // Método para manejar la carga de la imagen
  // handleImageUpload(event: any) {
  //   const file = event.target.files[0];

  //   if (file) {
  //     this.nuevoArchivo = file;
  //     this.fileName = file.name;

  //     // Convierte la imagen a una URL segura
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  //   // Actualiza la referencia directamente desde el evento de cambio
  //   if (event.target) {
  //     event.target.value = '';
  //   }
  // }
  handleImageUpload(event: any) {
    const file = event.target.files[0];

    if (file) {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        console.log('Ancho:', width, 'Alto:', height);

        // Verifica las dimensiones de la imagen
        if (width < 375 || height < 600 || width > 2400 || height > 2400) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'La imagen debe tener una resolución mínima de 375 x 600 y una resolución máxima de 2400 x 2400',
          });
          // Limpia la selección de archivo
          event.target.value = '';
        } else {
          // Verifica la longitud del nombre del archivo
          if (file.name.length > 120) {
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: 'El nombre del archivo no puede superar los 120 caracteres.',
            });
            // Limita el nombre del archivo a 120 caracteres
            this.fileName = file.name.substring(0, 120);
          } else {
            this.fileName = file.name;
          }

          // La imagen cumple con los requisitos de resolución
          this.nuevoArchivo = file;

          // Convierte la imagen a una URL segura
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      img.src = URL.createObjectURL(file);
    }
  }


  guardarNuevaImagen() {

    if (this.nuevoArchivo && this.data && this.data.empresa) {
      console.log('ID del producto en guardarNuevaImagen:', this.data.empresa.idEmpresa);

      // Asegúrate de que la información del producto sea correcta
      console.log('Producto en guardarNuevaImagen:', this.data.empresa);

      const idEmpresa = this.data.empresa.idEmpresa;
      this._empresaServicio.actualizarImagenProducto(idEmpresa, this.nuevoArchivo)
        .subscribe(
          response => {
            console.log('Respuesta del servicio:', response);

            if (response.status) {
              this.dialogRef.close(true); // Cierra el diálogo indicando éxito
              Swal.fire({
                icon: 'success',
                title: 'Imagen Cambiada',
                text: 'Se cambio la nueva imagen',
              });
              this.imageUpdatedService.updateImage();
              window.location.reload();
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
                      this.guardarNuevaImagen();
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
