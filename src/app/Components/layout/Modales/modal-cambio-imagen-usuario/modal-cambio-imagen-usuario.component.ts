import { UsuariosService } from './../../../../Services/usuarios.service';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ImageUpdatedService } from '../../../../Services/image-updated.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../../../Services/auth.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-modal-cambio-imagen-usuario',
  templateUrl: './modal-cambio-imagen-usuario.component.html',
  styleUrl: './modal-cambio-imagen-usuario.component.css',

  styles: [`
  .dialog-content {
    width: 450px; /* Ajusta el ancho según tus necesidades */
    height: 350px; /* Ajusta la altura según tus necesidades */
  }
`]
})
export class ModalCambioImagenUsuarioComponent {
  nuevoArchivo: File | null = null; // Variable para almacenar el nuevo archivo de imagen
  tituloAccion: string = "Guardar";
  botonGuardar: string = "Guardar";
  botonCancelar: string = "Cancelar";
  fileName: string = '';
  formularioUsuario: FormGroup;
  cargando: boolean = false;
  edicionHabilitada: boolean = true;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';

  public previsualizacion: SafeUrl | null = null;
  constructor(
    public dialogRef: MatDialogRef<ModalCambioImagenUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _usuarioServicio: UsuariosService,
    private _utilidadServicio: UtilidadService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private imageUpdatedService: ImageUpdatedService,
    private router: Router,
    private authService: AuthService,
  ) {
    console.log('Data en CambiarImagenComponent:', this.data);
    this.previsualizacion = null;
    this.formularioUsuario = this.fb.group({

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

  guardarNuevaImagen() {
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    const usuarioEnLocalStorage = JSON.parse(datosDesencriptados);
    const idUsuarioLocalStorage = usuarioEnLocalStorage ? usuarioEnLocalStorage.idUsuario : null;

    if (this.formularioUsuario.invalid) {
      // Manejar la validación del formulario
      return;
    }



    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se actualizara la imagen del usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar  y aplicar cambios'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.nuevoArchivo && this.data && this.data.usuario) {
          // console.log('ID del producto en guardarNuevaImagen:', this.data.usuario.idUsuario);

          // Asegúrate de que la información del producto sea correcta
          // console.log('Producto en guardarNuevaImagen:', this.data.usuario);
          // const idUsuario = this.data.idUsuario;
          // Swal.fire({
          //   icon: 'success',
          //   title: 'Cambio de imagen',
          //   text: `Se cerrar la sesion en 5 segundos....`,
          // });
          // this._utilidadServicio.mostrarAlerta("Se cerrar la sesion en 5 segundos....", "Error");

          const idUsuario = this.data.usuario.idUsuario;
          // const formData = new FormData();
          // formData.append('imagen', this.nuevoArchivo);
          this._usuarioServicio.actualizarImagenProducto(idUsuario, this.nuevoArchivo)
            .subscribe(response => {
              // console.log('Respuesta del servicio:', response);

              if (response.status) {
                // this.dialogRef.close(true); // Cierra el diálogo indicando éxito
                // this._utilidadServicio.mostrarAlerta("Se cambio la nueva imagen", "OK!");

                // this.imageUpdatedService.updateImage();

                if (idUsuarioLocalStorage !== this.data.usuario.idUsuario) {
                  // Si los IDs son diferentes, mostrar un mensaje o tomar alguna acción necesaria
                  Swal.fire({
                    icon: 'success',
                    title: 'Imagen editada',
                    text: `La Imagen fue editada.`,
                  });
                  return

                } else {

                  Swal.fire({
                    icon: 'success',
                    title: 'Imagen editada',
                    text: `La Imagen fue editada.`,
                  });

                  const usuarioString = localStorage.getItem('usuario');
                  const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
                  const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
                  const usuarioEnLocalStorage = JSON.parse(datosDesencriptados);
                  // console.log(usuarioEnLocalStorage.imagenUrl);
                  usuarioEnLocalStorage.imagenUrl = response.value;
                  // const usuarioEnLocalStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
                  // usuarioEnLocalStorage.imagenUrl = base64Data; // Almacenar los datos base64 en el local storage
                  // localStorage.setItem('usuario', JSON.stringify(usuarioEnLocalStorage));
                  const updatedUserEncrypted = CryptoJS.AES.encrypt(JSON.stringify(usuarioEnLocalStorage), this.CLAVE_SECRETA).toString();
                  localStorage.setItem('usuario', updatedUserEncrypted);

                  // reader.onerror = (e) => {
                  //   console.error('Error al leer el archivo', e);
                  // };

                  // reader.onloadstart = () => {
                  //   console.log('Inicio de lectura del archivo');
                  // };

                  // reader.onloadend = () => {
                  //   console.log('Fin de lectura del archivo');
                  // };
                  // reader.readAsDataURL(this.nuevoArchivo!);

                  this.imageUpdatedService.updateImage();
                  this.dialogRef.close("true");
                  //  window.location.reload();

                }

                // window.location.reload();

                // this.cargando = false;
                // this.edicionHabilitada = false;



                // // Esperar un momento antes de cerrar la sesión y redirigir
                // setTimeout(() => {
                //   // Cierra el modal
                //   this.dialogRef.close();

                //   // Recarga la página para reflejar los cambios
                //   //  location.reload();
                //   this._utilidadServicio.eliminarSesionUsuario();
                //   this.authService.logout();
                //   this.router.navigate(['login']);
                // }, 5000);
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'ERROR',
                  text: `No se pudo editar la imagen`,
                });
                // this._utilidadServicio.mostrarAlerta("No se pudo registrar la imagen", "Error");
                console.error('Error al actualizar la imagen:', response.msg);
              }
            },
              error => {
                // Swal.fire({
                //   icon: 'error',
                //   title: 'ERROR',
                //   text: `Error al conectar con el servicio`,
                // });
                console.error('Error en la suscripción al servicio:', error);
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
                          this.cambiar();
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
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: `seleccione una imagen para poder realizar el cambio`,
          });
          console.error('Datos insuficientes para guardar la nueva imagen');
          // this._utilidadServicio.mostrarAlerta("seleccione una imagen para poder realizar el cambio", "Error");
        }


      } else {

        this.cargando = false;
      }
    });


    this.imageUpdatedService.updateImage();
  }
  cambiar() {
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    const usuarioEnLocalStorage = JSON.parse(datosDesencriptados);
    const idUsuarioLocalStorage = usuarioEnLocalStorage ? usuarioEnLocalStorage.idUsuario : null;

    if (this.formularioUsuario.invalid) {
      // Manejar la validación del formulario
      return;
    }


    if (this.nuevoArchivo && this.data && this.data.usuario) {
      console.log('ID del producto en guardarNuevaImagen:', this.data.usuario.idUsuario);

      // Asegúrate de que la información del producto sea correcta
      console.log('Producto en guardarNuevaImagen:', this.data.usuario);
      // const idUsuario = this.data.idUsuario;
      // Swal.fire({
      //   icon: 'success',
      //   title: 'Cambio de imagen',
      //   text: `Se cerrar la sesion en 5 segundos....`,
      // });
      // this._utilidadServicio.mostrarAlerta("Se cerrar la sesion en 5 segundos....", "Error");

      const idUsuario = this.data.usuario.idUsuario;
      const formData = new FormData();
      formData.append('imagen', this.nuevoArchivo);
      this._usuarioServicio.actualizarImagenProducto(idUsuario, this.nuevoArchivo)
        .subscribe(response => {
          console.log('Respuesta del servicio:', response);

          if (response.status) {
            // this.dialogRef.close(true); // Cierra el diálogo indicando éxito
            // this._utilidadServicio.mostrarAlerta("Se cambio la nueva imagen", "OK!");

            // this.imageUpdatedService.updateImage();

            if (idUsuarioLocalStorage !== this.data.usuario.idUsuario) {
              // Si los IDs son diferentes, mostrar un mensaje o tomar alguna acción necesaria
              Swal.fire({
                icon: 'success',
                title: 'El usuario fue editado ',
                text: `El usuario fue editado`,
              });


            } else {

              Swal.fire({
                icon: 'success',
                title: 'El usuario fue editado ',
                text: `El usuario fue editado`,
              });

              const reader = new FileReader();

              // Asegurarte de que el archivo es válido
              if (!this.nuevoArchivo) {
                console.error('Archivo no válido');
                return;
              }
              reader.onload = (e: any) => {
                // Obtén solo los datos base64 sin el prefijo 'data:image/jpeg;base64,'
                const base64Data = e.target.result.split(',')[1];

                const usuarioString = localStorage.getItem('usuario');
                const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
                const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
                const usuarioEnLocalStorage = JSON.parse(datosDesencriptados);

                // const usuarioEnLocalStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
                usuarioEnLocalStorage.imageData = base64Data; // Almacenar los datos base64 en el local storage
                // localStorage.setItem('usuario', JSON.stringify(usuarioEnLocalStorage));
                const updatedUserEncrypted = CryptoJS.AES.encrypt(JSON.stringify(usuarioEnLocalStorage), this.CLAVE_SECRETA).toString();
                localStorage.setItem('usuario', updatedUserEncrypted);
              };
              reader.onerror = (e) => {
                console.error('Error al leer el archivo', e);
              };

              reader.onloadstart = () => {
                console.log('Inicio de lectura del archivo');
              };

              reader.onloadend = () => {
                console.log('Fin de lectura del archivo');
              };

              console.log('Iniciando la lectura del archivo...');
              reader.readAsDataURL(this.nuevoArchivo!);

              this.imageUpdatedService.updateImage();

              window.location.reload();

            }

            // window.location.reload();

            // this.cargando = false;
            // this.edicionHabilitada = false;



            // // Esperar un momento antes de cerrar la sesión y redirigir
            // setTimeout(() => {
            //   // Cierra el modal
            //   this.dialogRef.close();

            //   // Recarga la página para reflejar los cambios
            //   //  location.reload();
            //   this._utilidadServicio.eliminarSesionUsuario();
            //   this.authService.logout();
            //   this.router.navigate(['login']);
            // }, 5000);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `No se pudo registrar la imagen`,
            });
            // this._utilidadServicio.mostrarAlerta("No se pudo registrar la imagen", "Error");
            console.error('Error al actualizar la imagen:', response.msg);
          }
        },
          error => {
            // Swal.fire({
            //   icon: 'error',
            //   title: 'ERROR',
            //   text: `Error al conectar con el servicio`,
            // });
            console.error('Error en la suscripción al servicio:', error);
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
                      this.cambiar();
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
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `seleccione una imagen para poder realizar el cambio`,
      });
      console.error('Datos insuficientes para guardar la nueva imagen');
      // this._utilidadServicio.mostrarAlerta("seleccione una imagen para poder realizar el cambio", "Error");
    }
  }


  limpiarImagen(): void {
    this.formularioUsuario.patchValue({
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
