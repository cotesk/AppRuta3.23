import { ContenidoService } from './../../../../Services/contenido.service';
import { Contenido } from './../../../../Interfaces/contenido';

import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { environment } from '../../../../environments/environment.development';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { async } from 'rxjs';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
import { ReponseApi } from '../../../../Interfaces/reponse-api';
import { VerImagenProductoModalComponent } from '../ver-imagen-producto-modal/ver-imagen-producto-modal.component';

@Component({
  selector: 'app-modal-contenido',
  templateUrl: './modal-contenido.component.html',
  styleUrl: './modal-contenido.component.css'
})
export class ModalContenidoComponent implements OnInit {

  formularioProducto: FormGroup;

  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  modoEdicion: boolean = false;
  public previsualizacion: SafeUrl | null = null;
  imagenBase64: string | null = null;
  nuevoArchivo: File | null = null;
  public imagenes: string | null = null;
  inputFileRef: ElementRef | undefined;
  tipoContenido: string | null = '';
  nombreImagen: string = '';

  constructor(
    private modalActual: MatDialogRef<ModalContenidoComponent>,
    @Inject(MAT_DIALOG_DATA) public datosContenido: Contenido, private fb: FormBuilder,
    private _contenidoServicio: ContenidoService,
    private _utilidadServicio: UtilidadService, private sanitizer: DomSanitizer,
    private servicioContenido: ContenidoService,
    private _usuarioServicio: UsuariosService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.previsualizacion = null;
    this.formularioProducto = this.fb.group({


      comentarios: ['', [Validators.maxLength(269)]],
      tipoComentarios: [''],
      tipoContenido: [''],
      Urlimagen: [''],
      imagenes: [''],

    });

    if (datosContenido != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
      this.modoEdicion = true;
    }



  }

  ngOnInit(): void {
    // this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(this.imagenPorDefecto);
    // this.imagenBase64 = this.imagenPorDefecto;
    // this.imageData = this.imagenPorDefecto;
    // this.formularioProducto.setValidators(this.imagenRequeridaValidator());
    // this.formularioProducto.updateValueAndValidity();
    const imagenBase64 = this.imagenBase64;
    const producto = this.data.producto;
    this.previsualizacion = this.data.imageUrl;



    if (this.datosContenido != null) {

      this.formularioProducto.patchValue({
        comentarios: this.datosContenido.comentarios,
        tipoComentarios: this.datosContenido.tipoComentarios,
        tipoContenido: new FormControl(''),
        imagenes: [''],

      })

    }



  }

  selectFile(event: any): void {
    if (!this.modoEdicion) { // Solo si no estás en modo de edición
      const archivo = event.target.files[0];

      if (archivo) {
        this.nombreImagen = archivo.name;
        const lector = new FileReader();
        lector.onload = (e) => {
          this.imagenBase64 = e.target?.result as string;

          console.log('Imagen Base64:', this.imagenBase64);
          console.log('previsualizacion:', this.previsualizacion);

          if (typeof e.target?.result === 'string') {
            // Crea una URL segura para la imagen
            this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target?.result);
            this.imagenes = this.imagenBase64;
            this.nuevoArchivo = archivo;
          } else {
            console.error('El resultado no es una cadena.');
          }
        };
        lector.readAsDataURL(archivo);
      }
      // Actualiza la referencia directamente desde el evento de cambio
      if (event.target) {
        event.target.value = '';
      }
    }
  }


  limpiarImagen(): void {
    this.formularioProducto.patchValue({
      imageData: '',
    });
    this.previsualizacion = null;
    this.imagenBase64 = null;
  }

  obtenerUrlSeguraDeImagen(): SafeUrl | null {
    const safeUrl = this.imagenBase64 ? this.sanitizer.bypassSecurityTrustUrl(this.imagenBase64) : null;

    return safeUrl;
  }

  verImagen(): void {
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenUrl: [this.previsualizacion]
      }
    });
  }

  onChangeTipoBusqueda2(event: any) {
    this.tipoContenido = event.value; // Actualiza el valor de tipoBusqueda
    if (this.tipoContenido === 'Imagen') {
      this.limpiarImagen();
      this.formularioProducto.get('comentarios')!.setValue('');
      this.formularioProducto.get('tipoComentarios')!.setValue('');
      this.formularioProducto.controls['tipoComentarios'].disable();
    }else if(this.tipoContenido === 'Promociones'){
      this.limpiarImagen();
      this.formularioProducto.get('comentarios')!.setValue('');
      this.formularioProducto.get('tipoComentarios')!.setValue('');
      this.formularioProducto.controls['tipoComentarios'].disable();
    }
     else {
      this.formularioProducto.controls['tipoComentarios'].enable();
      this.limpiarImagen();
      // this.formularioProducto.get('Imagen')!.setValue('');
    }
  }


  async guardarEditar_Contenido() {


    this.servicioContenido.lista().subscribe(
      (response: ReponseApi) => {
        if (response && response.status && response.value && Array.isArray(response.value)) {
          const imagenesBase64 = response.value
          // Inicializar contadores
          let numImages = 0;
          let promociones = 0;
          let numTexto = 0;
          let numTextLogins = 0;
          let numTextBanners = 0;
          const valorSeleccionado2 = this.formularioProducto.get('tipoContenido')?.value;
          const valorSeleccionado = this.formularioProducto.get('tipoComentarios')?.value;
          // Filtrar y contar imágenes y textos login
          // Filtrar y contar imágenes y textos login
          response.value.forEach((contenido) => {
            if (valorSeleccionado === 'Texto Banner' && contenido.tipoComentarios === 'Texto Banner') {
              numTextBanners++;
            } else if (valorSeleccionado === 'Texto Login' && contenido.tipoComentarios === 'Texto Login') {
              numTextLogins++;
            } else if (valorSeleccionado2 === 'Imagen' && contenido.tipoContenido === 'Imagen') {
              numImages++;
            }
            else if (valorSeleccionado2 === 'Promociones' && contenido.tipoContenido === 'Promociones') {
              promociones++;
            }
          });

          if (this.modoEdicion == true) {

            if (valorSeleccionado === 'Texto Banner') {
              if(this.datosContenido.tipoComentarios==='Texto Banner'){
                let sumabanne = 1 - numTextBanners;
                numTextBanners = sumabanne
              }else{
                let sumabanne = 1 + numTextBanners;
                numTextBanners = sumabanne
              }


            }
            else if (valorSeleccionado === 'Texto Login') {
              if(this.datosContenido.tipoComentarios==='Texto Login'){
                let sumatextLogin = 1 - numTextLogins;
                numTextLogins = sumatextLogin
              }else{
                let sumatextLogin = 1 + numTextLogins;
                numTextLogins = sumatextLogin
              }

            }
            else {

            }


          } else {
            let sumabanne = 1 + numTextBanners;
            numTextBanners = sumabanne

            let sumatextLogin = 1 + numTextLogins;
            numTextLogins = sumatextLogin
          }
         if(valorSeleccionado2 == "Imagen"){

            if (valorSeleccionado2 == "Imagen") {
            if (numImages >= 6) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Hay más de 8 imágenes guardada para esta sesión.`,
              });
              return;
            } else {
              console.log("Estado del formulario:", this.formularioProducto.status);

              // Verificar si el formulario es inválido
              if (this.formularioProducto.invalid) {
                this._utilidadServicio.mostrarAlerta("Por favor, complete todos los campos correctamente", "Error");
                return;
              }



              // Obtener la cadena de base64 de la imagen seleccionada
              const imagenBase64 = this.imagenBase64;

              // Verificar si no se seleccionó ninguna imagen
              if (!this.modoEdicion && !imagenBase64 && this.tipoContenido == "Imagen") {
                // this._utilidadServicio.mostrarAlerta("Debe seleccionar una imagen", "Error");
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: `Debe seleccionar una imagen`,
                });
                return;
              }
              if (this.nuevoArchivo!.size > 3000000) {
                Swal.fire({
                  icon: 'warning',
                  title: 'Advertencia',
                  text: 'La imagen no debe superar los 3 MB de tamaño.',
                });
                return;
              }


              const _contenido: Contenido = {
                idContenido: this.datosContenido == null ? 0 : this.datosContenido.idContenido,
                comentarios: this.formularioProducto.value.comentarios,
                tipoComentarios: this.formularioProducto.value.tipoComentarios,

                tipoContenido: this.formularioProducto.value.tipoContenido,

                imagenes: this.imagenes ? this.imagenes.split(',')[1] : null,
                nombreImagen: this.nombreImagen || null,
                imagenUrl: "",
              };
              // if (_producto.stock <= 0) {

              //   this._utilidadServicio.mostrarAlerta("Digite un Stok mayor a Cero ", "ERROR!");
              // } else {


              if (this.datosContenido == null) {
                this._contenidoServicio.guardar(_contenido).subscribe({
                  next: (data) => {
                    if (data.status) {
                      Swal.fire({
                        icon: 'success',
                        title: 'Contenido Registrado',
                        text: `El contenido fue registrado`,
                      });
                      // this._utilidadServicio.mostrarAlerta("El producto fue registrado", "Exito");
                      this.modalActual.close("true");
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'ERROR"',
                        text: `No se pudo registrar el contenido `,
                      });

                      // this._utilidadServicio.mostrarAlerta("Ya existe un producto con ese mismo nombre", "Error");
                    }
                  },
                  error: (e) => {


                    // Swal.fire({
                    //   icon: 'error',
                    //   title: 'ERROR',
                    //   text: ` el cliente  editar`,
                    // });
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
                              this.guardarEditar_Contenido();
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


                });
              } else {
                this._contenidoServicio.editar(_contenido).subscribe({
                  next: (data) => {
                    if (data.status) {
                      // this._utilidadServicio.mostrarAlerta("El producto fue editado", "Exito");
                      Swal.fire({
                        icon: 'success',
                        title: 'Contenido Editado',
                        text: `El contenido fue editado`,
                      });
                      this.modalActual.close("true");
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'ERROR!',
                        text: `No se pudo editar el contenido`,
                      });
                      // this._utilidadServicio.mostrarAlerta("No se pudo editar el producto", "Error");
                    }
                  },
                  error: (e) => {


                    // Swal.fire({
                    //   icon: 'error',
                    //   title: 'ERROR',
                    //   text: ` el cliente  editar`,
                    // });
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
                              this.guardarEditar_Contenido();
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


                });
              }
              // }
            }
            } else {

            if (numTextLogins > 1) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Hay más de 1 Texto login guardada para esta sesión.`,
              });
              return;
            } else if (numTextBanners > 1) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Hay más de 1 Texto banner guardada para esta sesión.`,
              });
              return;

            }

            else {
              console.log("Estado del formulario:", this.formularioProducto.status);

              // Verificar si el formulario es inválido
              if (this.formularioProducto.invalid) {
                this._utilidadServicio.mostrarAlerta("Por favor, complete todos los campos correctamente", "Error");
                return;
              }



              // Obtener la cadena de base64 de la imagen seleccionada
              const imagenBase64 = this.imagenBase64;

              // Verificar si no se seleccionó ninguna imagen
              // if (!this.modoEdicion && this.tipoContenido == "Texto") {
              //   // this._utilidadServicio.mostrarAlerta("Debe seleccionar una imagen", "Error");
              //   // Swal.fire({
              //   //   icon: 'error',
              //   //   title: 'Error!',
              //   //   text: `Ya existe `,
              //   // });
              //   // return;
              // }
              // if (this.nuevoArchivo!.size > 3000000) {
              //   Swal.fire({
              //     icon: 'warning',
              //     title: 'Advertencia',
              //     text: 'La imagen no debe superar los 3 MB de tamaño.',
              //   });
              //   return;
              // }

              const _contenido: Contenido = {
                idContenido: this.datosContenido == null ? 0 : this.datosContenido.idContenido,
                comentarios: this.formularioProducto.value.comentarios,
                tipoComentarios: this.formularioProducto.value.tipoComentarios,

                tipoContenido: this.formularioProducto.value.tipoContenido,

                imagenes: this.imagenes ? this.imagenes.split(',')[1] : null,
                nombreImagen: this.nombreImagen || null,
                imagenUrl: "",
              };
              // if (_producto.stock <= 0) {

              //   this._utilidadServicio.mostrarAlerta("Digite un Stok mayor a Cero ", "ERROR!");
              // } else {

              if (this.datosContenido == null) {
                this._contenidoServicio.guardar(_contenido).subscribe({
                  next: (data) => {
                    if (data.status) {
                      Swal.fire({
                        icon: 'success',
                        title: 'Contenido Registrado',
                        text: `El contenido fue registrado`,
                      });
                      // this._utilidadServicio.mostrarAlerta("El producto fue registrado", "Exito");
                      this.modalActual.close("true");
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'ERROR"',
                        text: `No se pudo registrar el contenido `,
                      });

                      // this._utilidadServicio.mostrarAlerta("Ya existe un producto con ese mismo nombre", "Error");
                    }
                  },
                  error: (e) => {


                    // Swal.fire({
                    //   icon: 'error',
                    //   title: 'ERROR',
                    //   text: ` el cliente  editar`,
                    // });
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
                              this.guardarEditar_Contenido();
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


                });
              } else {
                this._contenidoServicio.editar(_contenido).subscribe({
                  next: (data) => {
                    if (data.status) {
                      // this._utilidadServicio.mostrarAlerta("El producto fue editado", "Exito");
                      Swal.fire({
                        icon: 'success',
                        title: 'Contenido Editado',
                        text: `El contenido fue editado`,
                      });
                      this.modalActual.close("true");
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'ERROR!',
                        text: `No se pudo editar el contenido`,
                      });
                      // this._utilidadServicio.mostrarAlerta("No se pudo editar el producto", "Error");
                    }
                  },
                  error: (e) => {


                    // Swal.fire({
                    //   icon: 'error',
                    //   title: 'ERROR',
                    //   text: ` el cliente  editar`,
                    // });
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
                              this.guardarEditar_Contenido();
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


                });
              }
              // }
            }
          }


         }else{

          if (valorSeleccionado2 == "Promociones") {
            if (promociones >= 3) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Hay más de 3 imágenes guardada para esta sesión.`,
              });
              return;
            } else {
              console.log("Estado del formulario:", this.formularioProducto.status);

              // Verificar si el formulario es inválido
              if (this.formularioProducto.invalid) {
                this._utilidadServicio.mostrarAlerta("Por favor, complete todos los campos correctamente", "Error");
                return;
              }



              // Obtener la cadena de base64 de la imagen seleccionada
              const imagenBase64 = this.imagenBase64;

              // Verificar si no se seleccionó ninguna imagen
              if (!this.modoEdicion && !imagenBase64 && this.tipoContenido == "Promociones") {
                // this._utilidadServicio.mostrarAlerta("Debe seleccionar una imagen", "Error");
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: `Debe seleccionar una imagen`,
                });
                return;
              }
              if (this.nuevoArchivo!.size > 3000000) {
                Swal.fire({
                  icon: 'warning',
                  title: 'Advertencia',
                  text: 'La imagen no debe superar los 3 MB de tamaño.',
                });
                return;
              }


              const _contenido: Contenido = {
                idContenido: this.datosContenido == null ? 0 : this.datosContenido.idContenido,
                comentarios: this.formularioProducto.value.comentarios,
                tipoComentarios: this.formularioProducto.value.tipoComentarios,

                tipoContenido: this.formularioProducto.value.tipoContenido,

                imagenes: this.imagenes ? this.imagenes.split(',')[1] : null,
                nombreImagen: this.nombreImagen || null,
                imagenUrl: "",
              };
              // if (_producto.stock <= 0) {

              //   this._utilidadServicio.mostrarAlerta("Digite un Stok mayor a Cero ", "ERROR!");
              // } else {


              if (this.datosContenido == null) {
                this._contenidoServicio.guardar(_contenido).subscribe({
                  next: (data) => {
                    if (data.status) {
                      Swal.fire({
                        icon: 'success',
                        title: 'Contenido Registrado',
                        text: `El contenido fue registrado`,
                      });
                      // this._utilidadServicio.mostrarAlerta("El producto fue registrado", "Exito");
                      this.modalActual.close("true");
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'ERROR"',
                        text: `No se pudo registrar el contenido `,
                      });

                      // this._utilidadServicio.mostrarAlerta("Ya existe un producto con ese mismo nombre", "Error");
                    }
                  },
                  error: (e) => {


                    // Swal.fire({
                    //   icon: 'error',
                    //   title: 'ERROR',
                    //   text: ` el cliente  editar`,
                    // });
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
                              this.guardarEditar_Contenido();
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


                });
              } else {
                this._contenidoServicio.editar(_contenido).subscribe({
                  next: (data) => {
                    if (data.status) {
                      // this._utilidadServicio.mostrarAlerta("El producto fue editado", "Exito");
                      Swal.fire({
                        icon: 'success',
                        title: 'Contenido Editado',
                        text: `El contenido fue editado`,
                      });
                      this.modalActual.close("true");
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'ERROR!',
                        text: `No se pudo editar el contenido`,
                      });
                      // this._utilidadServicio.mostrarAlerta("No se pudo editar el producto", "Error");
                    }
                  },
                  error: (e) => {


                    // Swal.fire({
                    //   icon: 'error',
                    //   title: 'ERROR',
                    //   text: ` el cliente  editar`,
                    // });
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
                              this.guardarEditar_Contenido();
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


                });
              }
              // }
            }
            } else {

            if (numTextLogins > 1) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Hay más de 1 Texto login guardada para esta sesión.`,
              });
              return;
            } else if (numTextBanners > 1) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Hay más de 1 Texto banner guardada para esta sesión.`,
              });
              return;

            }

            else {
              console.log("Estado del formulario:", this.formularioProducto.status);

              // Verificar si el formulario es inválido
              if (this.formularioProducto.invalid) {
                this._utilidadServicio.mostrarAlerta("Por favor, complete todos los campos correctamente", "Error");
                return;
              }



              // Obtener la cadena de base64 de la imagen seleccionada
              const imagenBase64 = this.imagenBase64;

              // Verificar si no se seleccionó ninguna imagen
              // if (!this.modoEdicion && this.tipoContenido == "Texto") {
              //   // this._utilidadServicio.mostrarAlerta("Debe seleccionar una imagen", "Error");
              //   // Swal.fire({
              //   //   icon: 'error',
              //   //   title: 'Error!',
              //   //   text: `Ya existe `,
              //   // });
              //   // return;
              // }
              // if (this.nuevoArchivo!.size > 3000000) {
              //   Swal.fire({
              //     icon: 'warning',
              //     title: 'Advertencia',
              //     text: 'La imagen no debe superar los 3 MB de tamaño.',
              //   });
              //   return;
              // }

              const _contenido: Contenido = {
                idContenido: this.datosContenido == null ? 0 : this.datosContenido.idContenido,
                comentarios: this.formularioProducto.value.comentarios,
                tipoComentarios: this.formularioProducto.value.tipoComentarios,

                tipoContenido: this.formularioProducto.value.tipoContenido,

                imagenes: this.imagenes ? this.imagenes.split(',')[1] : null,
                nombreImagen: this.nombreImagen || null,
                imagenUrl: "",
              };
              // if (_producto.stock <= 0) {

              //   this._utilidadServicio.mostrarAlerta("Digite un Stok mayor a Cero ", "ERROR!");
              // } else {

              if (this.datosContenido == null) {
                this._contenidoServicio.guardar(_contenido).subscribe({
                  next: (data) => {
                    if (data.status) {
                      Swal.fire({
                        icon: 'success',
                        title: 'Contenido Registrado',
                        text: `El contenido fue registrado`,
                      });
                      // this._utilidadServicio.mostrarAlerta("El producto fue registrado", "Exito");
                      this.modalActual.close("true");
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'ERROR"',
                        text: `No se pudo registrar el contenido `,
                      });

                      // this._utilidadServicio.mostrarAlerta("Ya existe un producto con ese mismo nombre", "Error");
                    }
                  },
                  error: (e) => {


                    // Swal.fire({
                    //   icon: 'error',
                    //   title: 'ERROR',
                    //   text: ` el cliente  editar`,
                    // });
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
                              this.guardarEditar_Contenido();
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


                });
              } else {
                this._contenidoServicio.editar(_contenido).subscribe({
                  next: (data) => {
                    if (data.status) {
                      // this._utilidadServicio.mostrarAlerta("El producto fue editado", "Exito");
                      Swal.fire({
                        icon: 'success',
                        title: 'Contenido Editado',
                        text: `El contenido fue editado`,
                      });
                      this.modalActual.close("true");
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'ERROR!',
                        text: `No se pudo editar el contenido`,
                      });
                      // this._utilidadServicio.mostrarAlerta("No se pudo editar el producto", "Error");
                    }
                  },
                  error: (e) => {


                    // Swal.fire({
                    //   icon: 'error',
                    //   title: 'ERROR',
                    //   text: ` el cliente  editar`,
                    // });
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
                              this.guardarEditar_Contenido();
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


                });
              }
              // }
            }
          }



         }






        } else {
          console.error('La respuesta API no contiene los datos esperados:', response);
        }
      },
      (error) => {
        console.error('Error al cargar contenidos de imágenes:', error);
      }
    );




  }

}
