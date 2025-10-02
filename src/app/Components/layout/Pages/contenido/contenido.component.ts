import { CambiarImagenContenidoComponent } from './../../Modales/cambiar-imagen-contenido/cambiar-imagen-contenido.component';
import { ModalContenidoComponent } from './../../Modales/modal-contenido/modal-contenido.component';
import { Contenido } from './../../../../Interfaces/contenido';
import { ContenidoService } from './../../../../Services/contenido.service';

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
// import { ModalProductoComponent } from '../../Modales/modal-producto/modal-producto.component';

import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ReponseApi } from './../../../../Interfaces/reponse-api';

// import { ModalCaracteristicasProductoComponent } from '../../Modales/modal-caracteristicas-producto/modal-caracteristicas-producto.component';
import { MatTable } from '@angular/material/table';
import { VerImagenProductoModalComponent } from '../../Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';

import moment from 'moment';

import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
import { ModalPrestamosComponent } from '../../Modales/modal-prestamos/modal-prestamos.component';
// import { ModalPrestamosComponent } from '../../Modales/modal-prestamos/modal-prestamos.component';



@Component({
  selector: 'app-contenido',
  templateUrl: './contenido.component.html',
  styleUrl: './contenido.component.css'
})
export class ContenidoComponent implements OnInit, AfterViewInit{


  urlApi: string = environment.endpoint;
  cargaCompleta: boolean = false;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  columnasTabla: string[] = ['idContenido', 'comentarios', 'tipoComentarios', 'tipoContenido',  'acciones'];
  columnasTabla2: string[] = ['idContenido', 'tipoContenido', 'imagenes',  'acciones'];
  dataInicio: Contenido[] = [];
  dataListaContenido = new MatTableDataSource(this.dataInicio);
  dataListaContenidoPromo = new MatTableDataSource(this.dataInicio);
  dataListaContenido2 = new MatTableDataSource(this.dataInicio);
  dataListaContenido3 = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;
  @ViewChild('paginacionTabla2') paginacionTabla2!: MatPaginator;
  @ViewChild('paginacionTabla3') paginacionTabla3!: MatPaginator;
  constructor(
    private dialog: MatDialog,
    private _contenidoServicio: ContenidoService,
    private _utilidadServicio: UtilidadService,
    private http: HttpClient,
    private _usuarioServicio: UsuariosService,
  ) {


  }

  obtenerContenido() {

    this._contenidoServicio.lista().subscribe({
      next: (data: ReponseApi) => {
        console.log(data);
        if (data.status) {
          // data.value.forEach((contenido: Contenido) => {
          //   if (contenido.imagenes) {
          //     contenido.imagenes = this._contenidoServicio.decodeBase64ToImageUrl(contenido.imagenes);
          //   }
          // });
          const dataImagenes = data.value.filter((contenido: Contenido) => contenido.tipoContenido === 'Imagen');
          const dataPromociones = data.value.filter((contenido: Contenido) => contenido.tipoContenido === 'Promociones');

          const dataTextos = data.value.filter((contenido: Contenido) => contenido.tipoContenido === 'Texto');

          dataImagenes.sort((a: Contenido, b: Contenido) => a.idContenido - b.idContenido);
          dataPromociones.sort((a: Contenido, b: Contenido) => a.idContenido - b.idContenido);

          dataTextos.sort((a: Contenido, b: Contenido) => a.idContenido - b.idContenido);

          this.dataListaContenido.data = dataImagenes;
          this.dataListaContenido2.data = dataTextos;
          this.dataListaContenidoPromo.data = dataPromociones;
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: `no se encontraron datos`,
          });
        }
        // this._utilidadServicio.mostrarAlerta("no se encontraron datos", "Oops!");
      },
      error: (e) => {

        // Swal.fire({
        //   icon: 'warning',
        //   title: 'Advertencia',
        //   text: `no se encontraron datos`,
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
                  this.obtenerContenido();
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

  ngOnInit(): void {
    this.obtenerContenido();
  }


  ngAfterViewInit(): void {
    this.dataListaContenido.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filtreValue = (event.target as HTMLInputElement).value;
    this.dataListaContenido.filter = filtreValue.trim().toLocaleLowerCase();
  }

  nuevoContenido() {

    this.dialog.open(ModalContenidoComponent, {
      disableClose: true

    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerContenido();

    });
  }
  editarContenido(contenido: Contenido) {

    this.dialog.open(ModalContenidoComponent, {
      disableClose: true,
      data: contenido
    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerContenido();

    });
  }


  eliminarContenido(contenido: Contenido) {

    Swal.fire({

      title: "¿Desea eliminar el contenido?",
      text: contenido.tipoContenido,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'

    }).then((resultado) => {


      if (resultado.isConfirmed) {

        this._contenidoServicio.eliminar(contenido.idContenido).subscribe({
          next: (data) => {

            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Contenido Eliminado',
                text: `El contenido fue eliminado`,
              });
              // this._utilidadServicio.mostrarAlerta("El cliente fue eliminado","listo!");
              this.obtenerContenido();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo eliminar el contenido`,
              });
              // this._utilidadServicio.mostrarAlerta("No se pudo eliminar el cliente","Error!");

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
                      this.eliminar(contenido);
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
  eliminar(contenido: Contenido) {

    this._contenidoServicio.eliminar(contenido.idContenido).subscribe({
      next: (data) => {

        if (data.status) {
          Swal.fire({
            icon: 'success',
            title: 'Contenido Eliminado',
            text: `El contenido fue eliminado`,
          });
          // this._utilidadServicio.mostrarAlerta("El cliente fue eliminado","listo!");
          this.obtenerContenido();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `No se pudo eliminar el contenido`,
          });
          // this._utilidadServicio.mostrarAlerta("No se pudo eliminar el cliente","Error!");

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
                  this.eliminar(contenido);
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


  verImagen(contenido: Contenido): void {
    if(contenido.imagenUrl ==""){
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `No hay imagen para mostrar`,
      });
    }else{
      this.dialog.open(VerImagenProductoModalComponent, {
        data: {
          imagenes: [contenido.imagenUrl]
        }
      });
    }

  }
  cambiarImagen(contenido: Contenido) {
    this.dialog.open(CambiarImagenContenidoComponent, {
      disableClose: true,
      data: { contenido: contenido } // Asegúrate de pasar correctamente el producto en la propiedad "data"
    }).afterClosed().subscribe(resultado => {
      if (resultado === true) {
        this.obtenerContenido();
      }
    });
  }

  verContenido(contenido: Contenido): void {
    this.dialog.open(ModalPrestamosComponent, {
      data: {
        comentarios: contenido.comentarios || 'No hay contenido disponibles',

      }
    });
  }
}
