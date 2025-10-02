import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ModalPerroComponent } from '../../Modales/modal-perro/modal-perro.component';
import { Tarifa } from '../../../../Interfaces/tarifa';
import { TarifaService } from '../../../../Services/tarifa.service';
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
import { ModalTarifaComponent } from '../../Modales/modal-tarifa/modal-tarifa.component';

@Component({
  selector: 'app-tarifa',
  templateUrl: './tarifa.component.html',
  styleUrl: './tarifa.component.css'
})
export class TarifaComponent implements OnInit {


  columnasTarifa: string[] = ['nombre', 'precioPorHora', 'duracionHoras', 'activo', 'acciones'];
  dataListaTarifas = new MatTableDataSource<Tarifa>([]);
  pageTarifa = 1;
  totalPagesTarifa = 1;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';


  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;
  selectedFile: File | null = null;
  constructor(
    private dialog: MatDialog,
    private _tarifaServicio: TarifaService,
    private _utilidadServicio: UtilidadService,
    private _usuarioServicio: UsuariosService,

  ) {


  }


  obtenerTarifas() {

    this._tarifaServicio.lista().subscribe({

      next: (data) => {
        if (data.status) {
          // data.value.sort((a: Tarifa, b: Tarifa) => a.nombre.localeCompare(b.nombre));
          this.dataListaTarifas.data = data.value;
        }

        else
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `no se encontraron datos`,
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
                  this.obtenerTarifas();
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
    this.obtenerTarifas();
  }

  ngAfterViewInit(): void {
    this.dataListaTarifas.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filtreValue = (event.target as HTMLInputElement).value;
    this.dataListaTarifas.filter = filtreValue.trim().toLocaleLowerCase();
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






  nuevoTarifa() {

    this.dialog.open(ModalTarifaComponent, {
      disableClose: true

    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerTarifas();

    });
  }

  editarTarifa(tarifa: Tarifa) {

    this.dialog.open(ModalTarifaComponent, {
      disableClose: true,
      data: tarifa
    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerTarifas();

    });
  }

  eliminarTarifa(tarifa: Tarifa) {

    Swal.fire({

      title: "¿Desea eliminar la tarifa?",
      text: tarifa.nombre,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'

    }).then((resultado) => {


      if (resultado.isConfirmed) {

        this._tarifaServicio.eliminar(tarifa.idTarifa!).subscribe({
          next: (data) => {

            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Preveedor Eliminado',
                text: `El proveedor fue eliminado`,
              });
              // this._utilidadServicio.mostrarAlerta("El proveedor fue eliminado", "listo!");
              this.obtenerTarifas();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo eliminar el proveedor`,
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
                      this.eliminar(tarifa);
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
  eliminar(tarifa: Tarifa) {
    this._tarifaServicio.eliminar(tarifa.idTarifa!).subscribe({
      next: (data) => {

        if (data.status) {
          Swal.fire({
            icon: 'success',
            title: 'Tarifa Eliminada',
            text: `La tarifa fue eliminada`,
          });
          // this._utilidadServicio.mostrarAlerta("El proveedor fue eliminado", "listo!");
          this.obtenerTarifas();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `No se pudo eliminar el proveedor`,
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
                  this.eliminar(tarifa);
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
