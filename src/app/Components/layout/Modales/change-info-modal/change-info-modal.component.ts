import { Usuario } from './../../../../Interfaces/usuario';
// change-info-modal.component.ts
import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuariosService } from '../../../../Services/usuarios.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { AuthService } from '../../../../Services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importa los módulos necesarios
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-change-info-modal',
  templateUrl: './change-info-modal.component.html',
})
export class ChangeInfoModalComponent {
  // usuario: Usuario;
  // usuarioEditado: Usuario; // Nuevo objeto para almacenar los cambios en tiempo real
  formularioUsuario: FormGroup = new FormGroup({}); // Inicialización simple
  valoresFormulario: any; // Variable local para almacenar valores del formulario
  usuarioEditado: Usuario = {}; // Nuevo objeto para almacenar los cambios en tiempo real
  public previsualizacion: SafeUrl | null = null;
  fileName: string = '';
  nuevoArchivo: File | null = null;
  ocultarPassword: boolean = true;
  // En tu componente
  verMostrarClave: boolean = false;
  cargando: boolean = false;
  edicionHabilitada: boolean = true;
  isMobile: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 600;
  }

  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  constructor(
    public dialogRef: MatDialogRef<ChangeInfoModalComponent>,
    private _usuarioServicio: UsuariosService,
    private _utilidadServicio: UtilidadService,

    private formBuilder: FormBuilder,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public datosUsuario: any
  ) {

    this.previsualizacion = null;
    this.formularioUsuario = this.fb.group({

      imageData: ['']
    });
  }




  ngOnInit() {
    // Inicialización del formulario y sus controles
    this.formularioUsuario = this.formBuilder.group({
      nombreCompleto: [this.datosUsuario.nombreCompleto, Validators.required],
      correo: [this.datosUsuario.correo, [Validators.required, Validators.email]],
      clave: [this.datosUsuario.clave, Validators.required],

    });

    // Copia los valores actuales del formulario al inicio
    // this.valoresFormulario = { ...this.formularioUsuario.value };
    this.usuarioEditado = { ...this.datosUsuario };

    // Verifica si la contraseña está presente en el localStorage
    // const storedUserString = localStorage.getItem('usuario');
    // if (storedUserString) {
    //   const storedUser = JSON.parse(storedUserString);
    //   const storedPassword = storedUser?.clave;

    //   if (storedPassword) {
    //     // Si está presente, establece la contraseña en el formulario sin mostrarla
    //     this.formularioUsuario.patchValue({ clave: '********' });
    //   }
    // }

    // Verifica si hay una imagen almacenada en el localStorage
    const storedUserString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(storedUserString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    if (datosDesencriptados) {
      const storedUser = JSON.parse(datosDesencriptados);
      const imageData = storedUser?.imageData;

      if (imageData) {
        // Convierte la cadena de base64 en una URL segura
        this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(`data:image/*;base64,${imageData}`);
      }
    }


  }




  actualizarUsuario() {
    this.usuarioEditado = { ...this.usuarioEditado, ...this.formularioUsuario.value };

  }
  limpiarImagen(): void {
    this.formularioUsuario.patchValue({
      imageData: null,
    });
    this.previsualizacion = null;
    this.nuevoArchivo = null; // Agregar esta línea para asegurarte de que el nuevo archivo también se borre
    this.fileName = '';
  }
  handleImageUpload2(event: any) {
    this.nuevoArchivo = event.target.files[0];

    if (this.nuevoArchivo) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(this.nuevoArchivo);
    }
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];

    if (file) {
      // Si hay una nueva imagen cargada, realiza el procesamiento como lo haces actualmente
      this.nuevoArchivo = file;
      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      // Si no hay una nueva imagen, intenta cargar la imagen almacenada en el localStorage
      const storedImageData = localStorage.getItem('imagenUsuario');
      if (storedImageData) {
        this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(`data:image/*;base64,${storedImageData}`);
      }
    }
  }

  guardarCambios(): void {
    // Obtén los datos encriptados del usuario del localStorage
    const usuarioEncriptado = localStorage.getItem('usuario');

    if (!usuarioEncriptado) {
      console.error('No se encontraron datos de usuario en el localStorage.');
      return;
    }

    try {
      // Desencripta los datos del usuario
      const bytes = CryptoJS.AES.decrypt(usuarioEncriptado, this.CLAVE_SECRETA);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

      if (!datosDesencriptados) {
        console.error('Error al desencriptar los datos del usuario.');
        return;
      }

      // Parsea los datos desencriptados en un objeto Usuario
      const usuarioLocalStorage = JSON.parse(datosDesencriptados) as Usuario;

      // Ejemplo de operaciones con los datos del usuario desencriptado
      console.log('Usuario antes de guardar cambios:', usuarioLocalStorage);

      // Ejemplo de acceso a propiedades del usuario desencriptado
      const idUsuarioLocalStorage = usuarioLocalStorage ? usuarioLocalStorage.idUsuario : null;

      // Ejemplo de validación del formulario (puedes ajustar según tus necesidades)
      if (this.formularioUsuario.invalid) {
        console.error('El formulario es inválido.');
        return;
      }

      // Ejemplo de obtención de datos del formulario
      const nombreCompleto = this.formularioUsuario.get('nombreCompleto')?.value;
      const correo = this.formularioUsuario.get('correo')?.value;
      const clave = this.formularioUsuario.get('clave')?.value;

      // Creación de un objeto Usuario editado con los datos del formulario
      const usuarioEditado: Usuario = {
        idUsuario: usuarioLocalStorage.idUsuario,
        nombreCompleto,
        correo,
        clave
        // Otras propiedades del usuario
      };

      // Ejemplo de confirmación de cambios utilizando SweetAlert
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Se actualizará el usuario aplicar los cambios.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar y aplicar cambios'
      }).then((result) => {
        if (result.isConfirmed) {
          // Ejemplo de actualización del usuario a través de un servicio
          this.authService.actualizarUsuario(usuarioEditado).subscribe(
            (response) => {
              console.log('Usuario actualizado con éxito:', response);
              if (response.msg == "El nombre del correo ya existe.") {
                Swal.fire({
                  icon: 'error',
                  title: 'ERROR',
                  text: `El nombre del correo ya existe.`,
                });
                return

              } else if (response.msg == "El nombre del usuario ya existe.") {
                Swal.fire({
                  icon: 'error',
                  title: 'ERROR',
                  text: `El nombre del usuario ya existe.`,
                });
                return
              }

              else {
                // Ejemplo de actualización de datos en el localStorage
                if (idUsuarioLocalStorage !== this.datosUsuario?.idUsuario) {
                  // Manejo especial si los IDs son diferentes
                  Swal.fire({
                    icon: 'success',
                    title: 'El usuario fue editado',
                    text: `El usuario fue editado`
                  });

                } else {

                  Swal.fire({
                    icon: 'success',
                    title: 'El usuario fue editado',
                    text: `El usuario fue editado`,
                  });

                  // Actualizar el usuario en el localStorage
                  const storedUser = localStorage.getItem('usuario');
                  try {
                    const bytes = CryptoJS.AES.decrypt(storedUser!, this.CLAVE_SECRETA);
                    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
                    const usuarioLocalStorage = JSON.parse(datosDesencriptados) as Usuario;
                    if (usuarioLocalStorage) {
                      usuarioLocalStorage.nombreCompleto = usuarioEditado.nombreCompleto;
                      usuarioLocalStorage.correo = usuarioEditado.correo;
                      usuarioLocalStorage.clave = usuarioEditado.clave;
                      // Vuelve a encriptar y guarda los datos actualizados en localStorage
                      const updatedUserEncrypted = CryptoJS.AES.encrypt(JSON.stringify(usuarioLocalStorage), this.CLAVE_SECRETA).toString();
                      localStorage.setItem('usuario', updatedUserEncrypted);
                    }
                     console.log(usuarioLocalStorage);
                    // Actualizar en el servicio (esto también actualiza localStorage y notifica a otros componentes)
                    this.authService.actualizarUsuarioLocal(usuarioLocalStorage);

                    // Cerrar el modal y recargar la página
                    this.dialogRef.close("true");

                    // window.location.reload();
                  } catch (error) {

                  }


                }

              }

            },
            (error) => {

              if (error.status === 401) {

                console.error('Error al actualizar usuario:', error);
                // Puedes manejar el error aquí según tus necesidades

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
                          this.confirmar();
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



              } else {
                if (error.msg == "El nombre del correo ya existe.") {
                  Swal.fire({
                    icon: 'error',
                    title: 'ERROR',
                    text: `El nombre del correo ya existe.`,
                  });


                } else if (error.msg == "El nombre del usuario ya existe.") {
                  Swal.fire({
                    icon: 'error',
                    title: 'ERROR',
                    text: `El nombre del usuario ya existe.`,
                  });
                }

                else {
                  Swal.fire({
                    icon: 'error',
                    title: 'ERROR',
                    text: `No se pudo eliminar el usuario`,
                  });

                }
              }


            }
          );
        }
      });
    } catch (error) {
      console.error('Error al desencriptar los datos del usuario:', error);
    }
  }



  confirmar() {
    const storedUser = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(storedUser!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

    if (!datosDesencriptados) {
      console.error('Error al desencriptar los datos del usuario.');
      return;
    }

    // Parsea los datos desencriptados en un objeto Usuario
    const usuarioLocalStorage = JSON.parse(datosDesencriptados) as Usuario;

    const idUsuarioLocalStorage = usuarioLocalStorage ? usuarioLocalStorage.idUsuario : null;

    if (this.formularioUsuario.invalid) {
      // Manejar la validación del formulario
      return;
    }
    const nombreCompletoControl = this.formularioUsuario.get('nombreCompleto')!;
    const correoControl = this.formularioUsuario.get('correo')!;
    const claveControl = this.formularioUsuario.get('clave')!;

    const nombreCompleto = nombreCompletoControl.value;
    const correo = correoControl.value;
    const clave = claveControl.value;

    const usuarioEditado: Usuario = {
      idUsuario: this.usuarioEditado.idUsuario, // Asegúrate de incluir el ID del usuario
      nombreCompleto: nombreCompleto,
      correo: correo,
      clave: clave,

      // Otras propiedades del usuario...
    };

    // Aplicar cambios y cerrar sesión
    //  Swal.fire({
    //   icon: 'warning',
    //   title: 'Advertencia',
    //   text: 'Aplicando cambio dentro de 5 segundos....',
    // });
    // this._utilidadServicio.mostrarAlerta("Se cerrar la sesion en 5 segundos....", "Error");
    this.edicionHabilitada = false;



    this.authService.actualizarUsuario(usuarioEditado).subscribe(
      (response) => {
        console.log('Usuario actualizado con éxito:', response);
        if (response.msg == "El nombre del correo ya existe.") {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `El nombre del correo ya existe.`,
          });


        } else if (response.msg == "El nombre del usuario ya existe.") {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `El nombre del usuario ya existe.`,
          });
        }

        else {
          // Ejemplo de actualización de datos en el localStorage
          if (idUsuarioLocalStorage !== this.datosUsuario?.idUsuario) {
            // Manejo especial si los IDs son diferentes
            Swal.fire({
              icon: 'success',
              title: 'El usuario fue editado',
              text: `El usuario fue editado`
            });
          } else {

            Swal.fire({
              icon: 'success',
              title: 'El usuario fue editado',
              text: `El usuario fue editado`,
            });

            // Actualizar el usuario en el localStorage
            const storedUser = localStorage.getItem('usuario');
            try {
              const bytes = CryptoJS.AES.decrypt(storedUser!, this.CLAVE_SECRETA);
              const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
              const usuarioLocalStorage = JSON.parse(datosDesencriptados) as Usuario;
              if (usuarioLocalStorage) {
                usuarioLocalStorage.nombreCompleto = usuarioEditado.nombreCompleto;
                usuarioLocalStorage.correo = usuarioEditado.correo;
                usuarioLocalStorage.clave = usuarioEditado.clave;
                // Vuelve a encriptar y guarda los datos actualizados en localStorage
                const updatedUserEncrypted = CryptoJS.AES.encrypt(JSON.stringify(usuarioLocalStorage), this.CLAVE_SECRETA).toString();
                localStorage.setItem('usuario', updatedUserEncrypted);
              }
              // Cerrar el modal y recargar la página
              this.dialogRef.close();
              window.location.reload();
            } catch (error) {

            }


          }

        }

      },
      (error) => {

        if (error.status === 401) {

          console.error('Error al actualizar usuario:', error);
          // Puedes manejar el error aquí según tus necesidades

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
                    this.confirmar();
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



        } else {
          if (error.msg == "El nombre del correo ya existe.") {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `El nombre del correo ya existe.`,
            });


          } else if (error.msg == "El nombre del usuario ya existe.") {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `El nombre del usuario ya existe.`,
            });
          }

          else {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `No se pudo eliminar el usuario`,
            });

          }
        }


      }
    );



    if (this.nuevoArchivo) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Image = e.target.result.split(',')[1];
        localStorage.setItem('imagenUsuario', base64Image);
      };
      reader.readAsDataURL(this.nuevoArchivo);
    }

    console.log('Usuario después de guardar cambios:', this.usuarioEditado);

  }


  cerrarModal() {
    this.dialogRef.close();
  }
}
