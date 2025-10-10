import { CajaService } from './../../../../Services/caja.service';
import { Caja } from './../../../../Interfaces/caja';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { Usuario } from '../../../../Interfaces/usuario';
import { UsuariosService } from '../../../../Services/usuarios.service';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';
import { VerImagenProductoModalComponent } from '../ver-imagen-producto-modal/ver-imagen-producto-modal.component';

@Component({
  selector: 'app-modal-abrir-caja',
  templateUrl: './modal-abrir-caja.component.html',
  styleUrl: './modal-abrir-caja.component.css'
})
export class ModalAbrirCajaComponent implements OnInit {
  nombreUsuario: string = '';
  rolUsuario: string = '';
  formularioCaja: FormGroup;
  numeroFormateado: string = '';
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  listaCaja: Caja[] = [];
  listaUsuario: Usuario[] = [];
  listaUsuarioFiltrada: Usuario[] = [];
  modoEdicion: boolean = true;
  usuarioFiltrado: string = '';
  imagenSeleccionada: string | null = null;
  usuarioSeleccionado!: Usuario | null;
  metodoBusqueda: string | null = 'Chica';

  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  constructor(private modalActual: MatDialogRef<ModalAbrirCajaComponent>,
    @Inject(MAT_DIALOG_DATA) public datosCaja: Caja, private fb: FormBuilder,
    private _CajaServicio: CajaService,
    private _usuarioServicio: UsuariosService,
    private _utilidadServicio: UtilidadService,
    private dialog: MatDialog,

  ) {


    this.formularioCaja = this.fb.group({

      saldoInicialTexto: ['', [Validators.required, Validators.maxLength(10)]],
      Transferencia: ['', [Validators.required, Validators.maxLength(10)]],
      usuario: [''],
      // clienteId: [''],
      tipoCaja: ['', Validators.required],
      idUsuario: ['', Validators.required],
      nombreCompleto: ['']

    });
    if (datosCaja != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
      this.modoEdicion = false;
    }

    this.formularioCaja.get('usuario')?.valueChanges.subscribe(value => {
      this.listaUsuarioFiltrada = this.filtrarUsuario(value);
    });

    // this._CajaServicio.lista().subscribe({

    //   next: (data) => {
    //     console.log('Response from API:', data);
    //     if (data && data.status) {
    //       this.listaCaja = data.value;
    //     }
    //   },
    //   error: (e) => {
    //     let idUsuario: number = 0;


    //     // Obtener el idUsuario del localStorage
    //     const usuarioString = localStorage.getItem('usuario');
    //     const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    //     const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    //     if (datosDesencriptados !== null) {
    //       const usuario = JSON.parse(datosDesencriptados);
    //       idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

    //       this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
    //         (usuario: any) => {

    //           console.log('Usuario obtenido:', usuario);
    //           let refreshToken = usuario.refreshToken

    //           // Manejar la renovación del token
    //           this._usuarioServicio.renovarToken(refreshToken).subscribe(
    //             (response: any) => {
    //               console.log('Token actualizado:', response.token);
    //               // Guardar el nuevo token de acceso en el almacenamiento local
    //               localStorage.setItem('authToken', response.token);
    //               this.listaCajas();
    //             },
    //             (error: any) => {
    //               console.error('Error al actualizar el token:', error);
    //             }
    //           );



    //         },
    //         (error: any) => {
    //           console.error('Error al obtener el usuario:', error);
    //         }
    //       );
    //     }

    //   }

    // })

    this._CajaServicio.lista().subscribe({
      next: (data) => {
        console.log('Response from API:', data);  // Verifica la respuesta recibida
        if (data && data.status) {
          this.listaCaja = data.value;  // Asignación correcta de datos
        } else {
          console.error('Error: No se recibieron datos válidos');
        }
      },
      error: (error) => {
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
                  this.listaCajas();
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


    this.lista();


  }

  onChangeTipoBusqueda17(event: any) {
    this.metodoBusqueda = event.value; // Actualiza el valor de tipoBusqueda

    if (this.metodoBusqueda === 'Chica') {
      this.formularioCaja.get('Transferencia')!.setValue('0'); // Establece el valor de intereses a vacío

    } else {



    }
  }

  filtrarUsuario(nombre: any): Usuario[] {
    // Verificar si nombre es una cadena antes de llamar a trim()

    const valorBuscado = typeof nombre === "string" ? nombre.toLocaleLowerCase() : nombre.nombreCompleto.toLocaleLowerCase();
    const usuarioFiltrados = this.listaUsuario.filter(item => item.nombreCompleto!.toLocaleLowerCase().includes(valorBuscado));
    console.log('Clientes filtrados:', usuarioFiltrados);
    return usuarioFiltrados;
  }
  mostrarListaUsuario(): void {
    this.listaUsuarioFiltrada = this.listaUsuario;
  }
  mostrarUsuario(usuario: Usuario): string {

    return usuario.nombreCompleto!;

  }
  lastItem(item: any, list: any[]): boolean {
    return item === list[list.length - 1];
  }
  filtrarEntrada(event: any): void {


    const inputCliente = event.target.value;


    if (/^\d+$/.test(inputCliente)) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `No se puede digitar numero.`,
      });
      // Aquí, se puede mostrar una alerta o desactivar el botón de agregar.
      // this._utilidadServicio.mostrarAlerta('No se puede digitar numero.', 'ERROR!');
      // this.clienteSeleccionado = null!;
      this.formularioCaja.patchValue({
        usuario: null,
        idUsuario: null,
      });
      this.nombreUsuario = ""
      this.rolUsuario = ""
      // Limpiar el texto del cliente seleccionado
      this.formularioCaja.get('usuario')?.setValue('');
    }

    const soloLetras = inputCliente.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');

    // Almacena el valor filtrado en la variable clienteFiltrado
    this.usuarioFiltrado = soloLetras;
    // this.usuarioFiltrado = inputCliente;
    // Establece el valor en el control del formulario
    this.formularioCaja.get('usuario')?.setValue(this.usuarioFiltrado);
  }

  listaCajas() {
    this._CajaServicio.lista().subscribe({
      next: (data) => {
        console.log('Response from API:', data);  // Verifica la respuesta recibida
        if (data && data.status) {
          this.listaCaja = data.value;  // Asignación correcta de datos
        } else {
          console.error('Error: No se recibieron datos válidos');
        }
      },
      error: (error) => {
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
                  this.listaCajas();
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
  // getUsuarioImageData(idUsuario: any): string {
  //   const usuario = this.listaUsuario.find(u => u.idUsuario === idUsuario);
  //   if (usuario && usuario.imageData) {
  //     return 'data:image/jpeg;base64,' + usuario.imageData;
  //   }
  //   return ''; // Otra opción si no se encuentra el usuario
  // }
  private cargarImagenProducto(idUsuario: number) {
    this._usuarioServicio.obtenerImagenUsuario(idUsuario).subscribe(
      (response: any) => {
        if (response && response.imagenUrl) {
          this.imagenSeleccionada = `${response.imagenUrl}`;
        } else {
          console.error('Imagen no disponible');
          this.imagenSeleccionada = 'ruta/de/imagen/predeterminada.png'; // O deja nulo
        }
      },
      (error: any) => {
        console.error('Error al cargar la imagen:', error);
        this.imagenSeleccionada = 'ruta/de/imagen/predeterminada.png'; // Imagen predeterminada si falla
      }
    );
  }
  verImagen(imagenUrl: string) {
    console.log(imagenUrl);
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: [imagenUrl]
      }
    });
  }

  lista() {
    this._usuarioServicio.listaUsuario().subscribe({
      next: (data) => {
        if (data.status) {
          // Filtrar y ordenar la lista de usuarios
          this.listaUsuario = (data.value as Usuario[])
            .filter(p => p.esActivo == 1 && p.rolDescripcion !== "Clientes")
            .sort((a: Usuario, b: Usuario) => {
              // Verificar si nombreCompleto está definido
              if (a.nombreCompleto && b.nombreCompleto) {
                return a.nombreCompleto.localeCompare(b.nombreCompleto);
              }
              // En caso de que nombreCompleto sea undefined en alguno de los usuarios,
              // maneja esta situación aquí (por ejemplo, devolviendo 0 para mantener el orden)
              return 0;
            });
        }
      },
      error: (e) => {
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
                  this.lista();
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


  inicializar() {

    this.formularioCaja = this.fb.group({

      saldoInicialTexto: ['', [Validators.required, Validators.maxLength(10)]],
      Transferencia: ['', [Validators.required, Validators.maxLength(10)]],
      usuario: [''],
      // clienteId: [''],
      tipoCaja: ['', Validators.required],
      idUsuario: ['', Validators.required],
      nombreCompleto: ['']

    });





  }
  ngOnInit(): void {

    this.listaCajas();
    this.inicializar();
    // if (this.datosCaja != null) {
    //   this.formularioCaja.patchValue({
    //     idCaja: this.datosCaja.idCaja,
    //     fechaApertura: this.datosCaja.fechaApertura,
    //     fechaCierre: this.datosCaja.fechaCierre,
    //     saldoInicialTexto: this.datosCaja.saldoInicialTexto,
    //     saldoFinalTexto: this.datosCaja.saldoFinalTexto,
    //     ingresosTexto: this.datosCaja.ingresosTexto,
    //     devolucionesTexto: this.datosCaja.devolucionesTexto,
    //     prestamosTexto: this.datosCaja.prestamosTexto,
    //     gastosTexto: this.datosCaja.gastosTexto,
    //     estado: this.datosCaja.estado,
    //     comentarios: this.datosCaja.comentarios,
    //     fechaRegistro: this.datosCaja.fechaRegistro,
    //     ultimaActualizacion: this.datosCaja.ultimaActualizacion,
    //     metodoPago: this.datosCaja.metodoPago,
    //     idUsuario: this.datosCaja.idUsuario,
    //     nombreUsuario: this.datosCaja.nombreUsuario,
    //     comentariosDevoluciones: this.datosCaja.comentariosDevoluciones,
    //     comentariosGastos: this.datosCaja.comentariosGastos,
    //     transaccionesTexto: this.datosCaja.transaccionesTexto,
    //   });
    // }

    this._usuarioServicio.lista().subscribe({
      next: (data) => {
        if (data.status) {
          // Filtrar y ordenar la lista de usuarios
          this.listaUsuario = (data.value as Usuario[])
            .filter(p => p.esActivo == 1 && p.rolDescripcion == "Administrador")
            .sort((a: Usuario, b: Usuario) => {
              // Verificar si nombreCompleto está definido
              if (a.nombreCompleto && b.nombreCompleto) {
                return a.nombreCompleto.localeCompare(b.nombreCompleto);
              }
              // En caso de que nombreCompleto sea undefined en alguno de los usuarios,
              // maneja esta situación aquí (por ejemplo, devolviendo 0 para mantener el orden)
              return 0;
            });
        }
      },
      error: (e) => {
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
                  this.lista();
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

    this.formularioCaja.get('usuario')?.valueChanges.subscribe(value => {
      this.listaUsuarioFiltrada = this.filtrarUsuario(value);
    });

  }
  formatearNumero(event: any, campo: string): void {
    let valorInput = event.target.value.replace(/\./g, ''); // Elimina los puntos existentes

    // Verifica si el valor es un número válido antes de formatear
    if (valorInput !== '' && !isNaN(parseFloat(valorInput))) {
      valorInput = parseFloat(valorInput).toLocaleString('es-CO', { maximumFractionDigits: 2 });
      this.numeroFormateado = valorInput;

      // Actualiza el valor formateado en el formulario
      this.formularioCaja.get(campo)?.setValue(valorInput);
    } else {
      // Si el valor no es un número válido o está vacío, establece el valor en blanco en el formulario
      this.numeroFormateado = '';
      this.formularioCaja.get(campo)?.setValue('');
    }
  }

  letrasSinNumerosValidator() {
    return (control: FormControl) => {
      const nombre = control.value;
      const contieneNumeros = /\d/.test(nombre); // Verifica si hay al menos un dígito
      return contieneNumeros ? { letrasSinNumerosValidator: true } : null;
    };
  }


  guardarEditar_Caja() {


    // Obtener el ID de usuario de la caja actual
    const idUsuario = this.formularioCaja.value.idUsuario;
    const precio = this.formularioCaja.value.saldoInicialTexto;
    const transferencia = this.formularioCaja.value.Transferencia;

    const tipoCajaSeleccionada = this.formularioCaja.value.tipoCaja;

    const cajaAbiertaUsuario = this.listaCaja.find(caja =>
      caja.idUsuario === idUsuario && caja.estado === 'Abierto' && caja.tipoCaja === 'Chica'
    );

    const cajaAbiertaGeneral = this.listaCaja.find(caja =>
      caja.estado === 'Abierto' && caja.tipoCaja === 'General'
    );

    console.log(cajaAbiertaGeneral);

    if (precio <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El precio debe ser mayor a cero.',
      });
      return;
    }

    if (tipoCajaSeleccionada === 'General') {
      if (transferencia <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El precio de transferencia debe ser mayor a cero.',
        });

        return;
      }

    }

    if (tipoCajaSeleccionada === 'Chica' && !cajaAbiertaGeneral) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Primero debes abrir una caja General antes de abrir una caja Chica.',
      });
      return;
    }

    if (tipoCajaSeleccionada === 'General' && cajaAbiertaGeneral) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ya hay una caja General abierta. No puedes abrir otra.',
      });
      return;
    }

    if (tipoCajaSeleccionada === 'Chica' && cajaAbiertaUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ya tienes una caja Chica abierta. Debes cerrarla antes de abrir otra.',
      });
      return;
    }
    let nombre: any
    if (tipoCajaSeleccionada === 'General') {
      nombre = "Caja General"
    } else {
      nombre = this.formularioCaja.value.nombreCompleto
    }

    const saldoInicialTexto = this.formularioCaja.value.saldoInicialTexto.toString().replace(/[,.]/g, '');

    const _Caja: Caja = {
      idCaja: this.datosCaja == null ? 0 : this.datosCaja.idCaja,
      fechaApertura: null,
      fechaCierre: null,
      tipoCaja: tipoCajaSeleccionada,
      saldoInicialTexto: saldoInicialTexto,
      saldoFinalTexto: "0",
      ingresosTexto: "0",
      devolucionesTexto: "0",
      prestamosTexto: "0",
      gastosTexto: "0",
      estado: "",
      comentarios: "",
      fechaRegistro: null,
      ultimaActualizacion: null,
      metodoPago: "",
      idUsuario: this.formularioCaja.value.idUsuario,
      nombreUsuario: nombre,
      comentariosGastos: "",
      comentariosDevoluciones: "",
      transaccionesTexto: transferencia,
    };




    if (this.datosCaja == null) {

      this._CajaServicio.guardar(_Caja).subscribe({

        next: (data) => {
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Caja Registrada',
              text: `La Caja fue registrado`,
            });
            // this._utilidadServicio.mostrarAlerta("la Caja fue registrado","Exito");
            this.modalActual.close("true");
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `No se pudo registrar la Caja `,
            });
            return
            // this._utilidadServicio.mostrarAlerta("Ya existe una Caja con ese nombre ","Error");
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
                    this.guardarEditar_Caja();
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

      })
    } else {

      this._CajaServicio.editar(_Caja).subscribe({

        next: (data) => {
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Caja Editada',
              text: `La Caja fue editado`,
            });
            // this._utilidadServicio.mostrarAlerta("La Caja fue editado","Exito");
            this.modalActual.close("true");
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `No se pudo editar la Caja  `,
            });
            // this._utilidadServicio.mostrarAlerta("No se pudo editar la Caja ","Error");
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
                    this.guardarEditar_Caja();
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

      })

    }


  }

  onUsuarioSeleccionado(event: any) {


    if (event && event.option.value && event.option.value.nombreCompleto) {
      this.nombreUsuario = event.option.value.nombreCompleto;
      this.rolUsuario = event.option.value.rolDescripcion;
      const selectedProduct = event.option.value.idUsuario;
      this.cargarImagenProducto(selectedProduct!);
      // También puedes establecer el valor seleccionado en tu formulario si lo necesitas
      this.formularioCaja.patchValue({
        idUsuario: event.option.value.idUsuario,
        nombreCompleto: event.option.value.nombreCompleto
      });
       this.formularioCaja.get('usuario')?.setValue('');
    } else {
      this.nombreUsuario = ''; // Reiniciar el nombre de usuario si no se selecciona ningún valor
      this.rolUsuario = '';
    }
  }
}
