import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ModalPerroComponent } from '../../Modales/modal-perro/modal-perro.component';
import { PasadorDias } from '../../../../Interfaces/pasadorDias';
import { PaseadorDiaService } from '../../../../Services/paseadorDia.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ReponseApi } from './../../../../Interfaces/reponse-api';
import { MatTable } from '@angular/material/table';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EmpresaService } from '../../../../Services/empresa.service';
import { Empresa } from '../../../../Interfaces/empresa';

import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
import { ModalAsignarDiaPaseadorComponent } from '../../Modales/modal-asignar-dia-paseador/modal-asignar-dia-paseador.component';



@Component({
  selector: 'app-asignar-dia-paseador',
  templateUrl: './asignar-dia-paseador.component.html',
  styleUrl: './asignar-dia-paseador.component.css'
})
export class AsignarDiaPaseadorComponent implements OnInit {

  columnasDias: string[] = ['nombreUsuario', 'diaSemana', 'trabaja', 'acciones'];
  dataListaDias = new MatTableDataSource<PasadorDias>([]);
  pageTarifa = 1;
  totalPagesTarifa = 1;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';


  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;
  selectedFile: File | null = null;
  constructor(
    private dialog: MatDialog,
    private _diasServicio: PaseadorDiaService,
    private _utilidadServicio: UtilidadService,
    private _usuarioServicio: UsuariosService,

  ) {


  }


  obtenerDiaPaseador() {



    let idUsuario: number = 0;
    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(datosDesencriptados);
    const usuario = JSON.parse(datosDesencriptados);
    idUsuario = usuario.idUsuario;

    if (usuario.rolDescripcion === 'Administrador') {
      this._diasServicio.lista2().subscribe({

        next: (data) => {
          // console.log(data);
          if (data.status) {
            // data.value.sort((a: Tarifa, b: Tarifa) => a.nombre.localeCompare(b.nombre));
            this.dataListaDias.data = data.value;
          }

          else
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `no se encontraron datos 2`,
            });
          // this._utilidadServicio.mostrarAlerta("no se encontraron datos", "Oops!");
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
                    this.obtenerDiaPaseador();
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

      this._diasServicio.obtenerDiasPorUsuario(idUsuario).subscribe({
        next: (data) => {
          if (data.status) {



            this.dataListaDias = new MatTableDataSource<PasadorDias>(data.value);
            console.log(this.dataListaDias);
            this.dataListaDias.paginator = this.paginacionTabla;

          } else {

            this.dataListaDias = new MatTableDataSource<PasadorDias>([]);
            // Swal.fire({
            //   icon: 'warning',
            //   title: 'Advertencia',
            //   text: 'No se encontraron datos',
            // });

          }
        },
        error: (e) => {

          this.dataListaDias = new MatTableDataSource<PasadorDias>([]);
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
                    this.obtenerDiaPaseador();
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

  }


  ngOnInit(): void {
    this.obtenerDiaPaseador();
    
  }

  ngAfterViewInit(): void {
    this.dataListaDias.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filtroValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    let searchTerm: string;

    if (filtroValue === 'trabaja') {
      searchTerm = 'true';
    } else if (filtroValue === 'no trabaja') {
      searchTerm = 'false';
    } else {
      searchTerm = filtroValue;
    }

    this.dataListaDias.filter = searchTerm;
  }

  formatearNumero(numero: string): string {
    // Convierte la cadena a número
    const valorNumerico = parseFloat(numero.replace(',', '.'));

    // Verifica si es un número válido
    if (!isNaN(valorNumerico)) {
      // Formatea el número con comas como separadores de miles y dos dígitos decimales
      return valorNumerico.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else {
      // Devuelve la cadena original si no se puede convertir a número
      return numero;
    }
  }






  nuevoPasadorDia() {

    this.dialog.open(ModalAsignarDiaPaseadorComponent, {
      disableClose: true

    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerDiaPaseador();

    });
  }

  editarPasadorDia(dias: PasadorDias) {

    this.dialog.open(ModalAsignarDiaPaseadorComponent, {
      disableClose: true,
      data: dias
    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerDiaPaseador();

    });
  }

  eliminarPasadorDia(dias: PasadorDias) {

    Swal.fire({

      title: "¿Desea eliminar el día?",
      text: dias.diaSemana,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'

    }).then((resultado) => {


      if (resultado.isConfirmed) {

        this._diasServicio.eliminar(dias.idPasadorDia!).subscribe({
          next: (data) => {

            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Dia Asignado Eliminado',
                text: `El dia asignado fue eliminado`,
              });
              // this._utilidadServicio.mostrarAlerta("El proveedor fue eliminado", "listo!");
              this.obtenerDiaPaseador();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo eliminar el dia asigando`,
              });
              // this._utilidadServicio.mostrarAlerta("No se pudo eliminar el proveedor", "Error");

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
                      this.eliminar(dias);
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


    })

  }
  eliminar(dias: PasadorDias) {
    this._diasServicio.eliminar(dias.idPasadorDia!).subscribe({
      next: (data) => {

        if (data.status) {
          Swal.fire({
            icon: 'success',
            title: 'Dia Asignado Eliminado',
            text: `El dia asignado fue eliminado`,
          });
          // this._utilidadServicio.mostrarAlerta("El proveedor fue eliminado", "listo!");
          this.obtenerDiaPaseador();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `No se pudo eliminar el dia asigando`,
          });
          // this._utilidadServicio.mostrarAlerta("No se pudo eliminar el proveedor", "Error");

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
                  this.eliminar(dias);
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




}
