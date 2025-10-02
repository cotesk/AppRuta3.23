import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ModalUsuarioComponent } from '../../Modales/modal-usuario/modal-usuario.component';
import { Usuario } from '../../../../Interfaces/usuario';
import { UsuariosService } from '../../../../Services/usuarios.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import Swal from 'sweetalert2';
import { CambiarImagenUsuarioComponent } from '../../Modales/cambiar-imagen-usuario/cambiar-imagen-usuario.component';
import { VerImagenProductoModalComponent } from '../../Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import * as CryptoJS from 'crypto-js';
import { ModalListaClientesComponent } from '../../Modales/modal-lista-clientes/modal-lista-clientes.component';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../../../Services/auth.service';
import { ImageUpdatedService } from '../../../../Services/image-updated.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit, AfterViewInit {

  columnasTabla: string[] = ['imagen', 'nombreCompleto', 'correo', 'rolDescripcion', 'estado', 'acciones'];
  dataInicio: Usuario[] = [];
  dataListaUsuarios = new MatTableDataSource(this.dataInicio);
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  claveSecreta: string | null = null;
  error: string | null = null;
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  page = 1;
  pageSize = 5;
  totalUsuario = 0;
  totalPages = 0;
  searchTerm = '';

  selectedFile: File | null = null;

  constructor(
    private dialog: MatDialog,
    private _usuarioServicio: UsuariosService,
    private _utilidadServicio: UtilidadService,
    private authService: AuthService,
    private imageUpdatedService: ImageUpdatedService,
  ) { }

  // obtenerUsuario() {

  //   this._usuarioServicio.lista().subscribe({

  //     next: (data) => {
  //       if (data.status) {
  //         //funcional
  //         // data.value.forEach((producto: Usuario) => {
  //         //   if (producto.imageData) {

  //         //     producto.imageData = this._usuarioServicio.decodeBase64ToImageUrl(producto.imageData);
  //         //   }
  //         // });
  //         // data.value.sort((a: Usuario, b: Usuario) => a.nombreCompleto!.localeCompare(b.nombreCompleto!));
  //         // this.dataListaUsuarios.data = data.value;
  //         const usuariosClientes = data.value.filter((usuario: Usuario) => usuario.rolDescripcion !== 'Clientes');

  //         usuariosClientes.forEach((usuario: Usuario) => {
  //           if (usuario.imageData) {
  //             usuario.imageData = this._usuarioServicio.decodeBase64ToImageUrl(usuario.imageData);
  //           }
  //         });
  //         usuariosClientes.sort((a: Usuario, b: Usuario) => a.nombreCompleto!.localeCompare(b.nombreCompleto!));
  //         this.dataListaUsuarios.data = usuariosClientes;

  //       } else {
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'ERROR',
  //           text: `no se encontraron datos`,
  //         })
  //         // this._utilidadServicio.mostrarAlerta("no se encontraron datos", "Oops!");

  //       }

  //     },
  //     error: (e) => {
  //       let idUsuario: number = 0;


  //       // Obtener el idUsuario del localStorage
  //       const usuarioString = localStorage.getItem('usuario');
  //       const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
  //       const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
  //       if (datosDesencriptados !== null) {
  //         const usuario = JSON.parse(datosDesencriptados);
  //         idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

  //         this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
  //           (usuario: any) => {

  //             console.log('Usuario obtenido:', usuario);
  //             let refreshToken = usuario.refreshToken

  //             // Manejar la renovación del token
  //             this._usuarioServicio.renovarToken(refreshToken).subscribe(
  //               (response: any) => {
  //                 console.log('Token actualizado:', response.token);
  //                 // Guardar el nuevo token de acceso en el almacenamiento local
  //                 localStorage.setItem('authToken', response.token);
  //                 this.obtenerUsuario();
  //               },
  //               (error: any) => {
  //                 console.error('Error al actualizar el token:', error);
  //               }
  //             );



  //           },
  //           (error: any) => {
  //             console.error('Error al obtener el usuario:', error);
  //           }
  //         );
  //       }



  //     }

  //   })
  // }


  obtenerClaveSecreta(): void {
    this._usuarioServicio.getClaveSecreta().subscribe({
      next: (respuesta) => {
        this.claveSecreta = respuesta.claveSecreta;
      },
      error: (err) => {
        this.error = 'Error al obtener la clave secreta.';
        console.error(err);
      }
    });
  }

  ngOnInit(): void {
    // this.obtenerClaveSecreta();
    this.obtenerUsuario();

    this.authService.usuario$.subscribe(usuario => {
      this.obtenerUsuario();
      console.log('Usuario actualizado en tiempo real:', usuario);
    });

    this.imageUpdatedService.imageUpdated$.subscribe(() => {
        this.obtenerUsuario();
      // console.log('Aquiiii');
    });

  }


  // ngAfterViewInit(): void {
  //   this.dataListaUsuarios.paginator = this.paginacionTabla;
  // }

  // aplicarFiltroTabla(event: Event) {
  //   const filtreValue = (event.target as HTMLInputElement).value;
  //   this.dataListaUsuarios.filter = filtreValue.trim().toLocaleLowerCase();
  // }
  obtenerUsuario() {


    this._usuarioServicio.listaPaginada(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (data) => {
        if (data && data.data && data.data.length > 0) {
          const usuariosClientes = data.data.filter((usuario: Usuario) => usuario.rolDescripcion !== 'Clientes');

          usuariosClientes.forEach((usuario: Usuario) => {
            if (usuario.imageData) {
              usuario.imageData = this._usuarioServicio.decodeBase64ToImageUrl(usuario.imageData);
            }
          });
          this.totalUsuario = data.total;
          this.totalPages = data.totalPages;
          // this.dataListaUsuarios.data = data.data;
          this.dataListaUsuarios.data = usuariosClientes;
        } else {
          this.totalUsuario = 0; // Reinicia el total de categorías si no hay datos
          this.totalPages = 0; // Reinicia el total de páginas si no hay datos
          this.dataListaUsuarios.data = []; // Limpia los datos existentes
          // Swal.fire({
          //   icon: 'warning',
          //   title: 'Advertencia',
          //   text: 'No se encontraron datos',
          // });
        }
      },
      error: (error) => this.handleTokenError(() => this.obtenerUsuario())
    });
  }
  handleTokenError(retryCallback: () => void): void {
    this.totalUsuario = 0;
    this.totalPages = 0;
    this.dataListaUsuarios.data = [];
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const bytes = CryptoJS.AES.decrypt(usuarioString, this.CLAVE_SECRETA);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
      if (datosDesencriptados) {
        const usuario = JSON.parse(datosDesencriptados);
        this._usuarioServicio.obtenerUsuarioPorId(usuario.idUsuario).subscribe(
          (usuario: any) => {
            const refreshToken = usuario.refreshToken;
            this._usuarioServicio.renovarToken(refreshToken).subscribe(
              (response: any) => {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('refreshToken', response.refreshToken);
                retryCallback();
              },
              (error: any) => {
                // Manejar error de renovación de token
              }
            );
          },
          (error: any) => {
            // Manejar error al obtener usuario por ID
          }
        );
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataListaUsuarios.paginator = this.paginacionTabla;
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.obtenerUsuario();
  }

  aplicarFiltroTabla(event: Event) {
    const filtroValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (filtroValue === 'activo' || filtroValue === 'Activo') {
      this.searchTerm = '1';
    } else if (filtroValue === 'no activo' || filtroValue === 'No Activo') {
      this.searchTerm = '0';
    } else {
      this.searchTerm = filtroValue;
    }

    this.obtenerUsuario();
  }
  firstPage() {
    this.page = 1;
    this.obtenerUsuario();
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.obtenerUsuario();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.obtenerUsuario();
    }
  }

  lastPage() {
    this.page = this.totalPages;
    this.obtenerUsuario();
  }
  pageSizeChange() {
    this.page = 1;
    this.obtenerUsuario();
  }

  nuevoUsuario() {

    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true

    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerUsuario();

    });
  }
  ListaCliente() {

    this.dialog.open(ModalListaClientesComponent, {
      disableClose: false

    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerUsuario();

    });
  }

  editarUsuario(usuario: Usuario) {

    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true,
      data: usuario
    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerUsuario();

    });
  }
  verImagen(usuario: any): void {
    console.log(usuario);
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: [usuario.imagenUrl]
      }
    });
  }
  eliminarUsuario(usuario: Usuario) {

    Swal.fire({

      title: "¿Desea eliminar el usuario?",
      text: usuario.nombreCompleto,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'

    }).then((resultado) => {


      if (resultado.isConfirmed) {
        this._usuarioServicio.eliminar(usuario.idUsuario!).subscribe({
          next: (data) => {

            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Usuario Eliminado',
                text: `El usuario fue eliminado`,
              })
              // this._utilidadServicio.mostrarAlerta("El usuario fue eliminado", "listo!");
              this.obtenerUsuario();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo eliminar el usuario`,
              });
              // this._utilidadServicio.mostrarAlerta("No se pudo eliminar el usuario", "Error");
              this.obtenerUsuario();
            }

          },

          error: (error) => this.handleTokenError(() => this.eliminar(usuario))

        })

      }


    })

  }
  eliminar(usuario: Usuario) {
    this._usuarioServicio.eliminar(usuario.idUsuario!).subscribe({
      next: (data) => {

        if (data.status) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario Eliminado',
            text: `El usuario fue eliminado`,
          })
          // this._utilidadServicio.mostrarAlerta("El usuario fue eliminado", "listo!");
          this.obtenerUsuario();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `No se pudo eliminar el usuario`,
          });
          // this._utilidadServicio.mostrarAlerta("No se pudo eliminar el usuario", "Error");

        }

      },

      error: (error) => this.handleTokenError(() => this.eliminar(usuario))

    })


  }

  cambiarImagen(usuario: Usuario) {
    this.dialog.open(CambiarImagenUsuarioComponent, {
      disableClose: true,
      data: { usuario: usuario } // Asegúrate de pasar correctamente el producto en la propiedad "data"
    }).afterClosed().subscribe(resultado => {
      if (resultado === true) {
        this.obtenerUsuario();
      }
    });
  }


  exportarUsuarios() {
    this._usuarioServicio.exportarProductos().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      // Generar 4 números aleatorios
      const randomNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

      // Obtener la fecha y hora actual
      const now = new Date();
      const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
      const formattedTime = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

      // Crear el nombre del archivo
      a.download = `Usuarios_${randomNumbers}_${formattedDate}_${formattedTime}.xlsx`;

      // Crear el enlace de descarga
      document.body.appendChild(a);
      a.href = url;
      a.click();
      document.body.removeChild(a);
    }, error => {
      console.error('Error al obtener los datos de la empresa:', error);
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
                this.exportarUsuarios();
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


    });
  }


  importarUsuarios(): void {
    Swal.fire({
      title: 'Selecciona el archivo de usuarios',
      input: 'file',  // Tipo de input para archivo
      inputAttributes: {
        accept: '.xlsx,.xls',  // Aceptar solo archivos de Excel
        'aria-label': 'Sube tu archivo de usuarios'
      },
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Importar',
      cancelButtonText: 'Cancelar',
      preConfirm: (file) => {
        if (!file) {
          Swal.showValidationMessage('Debes seleccionar un archivo');
        }
        return file;  // Retornar el archivo seleccionado
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedFile = result.value;  // Obtener el archivo seleccionado
        if (this.selectedFile) {
          this._usuarioServicio.importarProductos(this.selectedFile).subscribe(
            (response) => {
              console.log('Usuarios importados correctamente:', response);
              Swal.fire('Éxito', 'Usuarios importados correctamente', 'success');
              this.obtenerUsuario();
            },
            (error) => {
              // console.error('Error al importar productos:', error); // Imprime el error completo
              // Swal.fire('Error', 'Hubo un error al importar los productos: ' + error.message, 'error');
              console.log('Error al importar Usuarios:', error);
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
                        this.import2(this.selectedFile);
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
          console.log('Por favor seleccione un archivo.');
        }

      }
    });
  }
  import2(selectedFile: any) {

    this._usuarioServicio.importarProductos(selectedFile).subscribe(
      (response) => {
        console.log('Usuarios importados correctamente:', response);
        Swal.fire('Éxito', 'Usuarios importados correctamente', 'success');
        this.obtenerUsuario();
      },
      (error) => {
        // console.error('Error al importar productos:', error); // Imprime el error completo
        // Swal.fire('Error', 'Hubo un error al importar los productos: ' + error.message, 'error');
        console.log('Error al importar Usuarios:', error);
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
                  this.import2(selectedFile);
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

  }


}
