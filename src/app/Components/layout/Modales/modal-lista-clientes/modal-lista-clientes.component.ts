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

@Component({
  selector: 'app-modal-lista-clientes',
  templateUrl: './modal-lista-clientes.component.html',
  styleUrl: './modal-lista-clientes.component.css'
})
export class ModalListaClientesComponent implements OnInit, AfterViewInit {

  columnasTabla: string[] = ['imagen', 'nombreCompleto', 'correo', 'rolDescripcion', 'estado', 'acciones'];
  dataInicio: Usuario[] = [];
  dataListaUsuarios = new MatTableDataSource(this.dataInicio);
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;
  page = 1;
  pageSize = 3;
  totalCategorias = 0;
  totalPages = 0;
  searchTerm = '';

  constructor(
    private dialog: MatDialog,
    private _usuarioServicio: UsuariosService,
    private _utilidadServicio: UtilidadService

  ) { }

  // obtenerUsuario() {

  //   this._usuarioServicio.lista().subscribe({

  //     next: (data) => {
  //       if (data.status) {
  //         const usuariosClientes = data.value.filter((usuario: Usuario) => usuario.rolDescripcion === 'Clientes');

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

  ngOnInit(): void {
    this.obtenerUsuario();
  }

  obtenerUsuario() {


    this._usuarioServicio.listaPaginadaCliente(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (data) => {
        if (data && data.data && data.data.length > 0) {
          const usuariosClientes = data.data.filter((usuario: Usuario) => usuario.rolDescripcion === 'Clientes');

          usuariosClientes.forEach((usuario: Usuario) => {
            if (usuario.imageData) {
              usuario.imageData = this._usuarioServicio.decodeBase64ToImageUrl(usuario.imageData);
            }
          });
          this.totalCategorias = data.total;
          this.totalPages = data.totalPages;
          // this.dataListaUsuarios.data = data.data;
          this.dataListaUsuarios.data = usuariosClientes;
        } else {
          this.totalCategorias = 0; // Reinicia el total de categorías si no hay datos
          this.totalPages = 0; // Reinicia el total de páginas si no hay datos
          this.dataListaUsuarios.data = []; // Limpia los datos existentes
          // Swal.fire({
          //   icon: 'warning',
          //   title: 'Advertencia',
          //   text: 'No se encontraron datos',
          // });
        }
      },
      error: (e) => {
        this.totalCategorias = 0; // Reinicia el total de categorías en caso de error
        this.totalPages = 0; // Reinicia el total de páginas en caso de error
        this.dataListaUsuarios.data = [];
        let idUsuario: number = 0;
        const usuarioString = localStorage.getItem('usuario');
        const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
        if (datosDesencriptados) {
          const usuario = JSON.parse(datosDesencriptados);
          idUsuario = usuario.idUsuario;

          this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
            (usuario: any) => {
              let refreshToken = usuario.refreshToken;
              this._usuarioServicio.renovarToken(refreshToken).subscribe(
                (response: any) => {
                  localStorage.setItem('authToken', response.token);
                  this.obtenerUsuario();
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
    if (filtroValue === 'activo') {
      this.searchTerm = '1';
    } else if (filtroValue === 'no activo') {
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
      disableClose: true

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
  verImagen(usuario: Usuario): void {
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        // imageData: usuario.imageData
        imagenUrl: usuario.imagenUrl
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
                      this.eliminar(usuario);
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
                  this.eliminar(usuario);
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



}
