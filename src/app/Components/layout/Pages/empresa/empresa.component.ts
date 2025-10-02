import { EmpresaService } from './../../../../Services/empresa.service';
import { Empresa } from './../../../../Interfaces/empresa';

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
import { ModalEmpresaComponent } from '../../Modales/modal-empresa/modal-empresa.component';
import { CambiarImagenEmpresaComponent } from '../../Modales/cambiar-imagen-empresa/cambiar-imagen-empresa.component';
import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.css'
})
export class EmpresaComponent implements OnInit, AfterViewInit {
  empresas: Empresa[] = [];
  urlApi: string = environment.endpoint;
  cargaCompleta: boolean = false;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  columnasTabla: string[] = ['logo', 'nombre', 'rut', 'direccion', 'telefono', 'correo', 'propietario', 'facebook', 'instagram', 'tiktok', 'acciones'];
  dataInicio: Empresa[] = [];
  dataListaProductos = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;
  @ViewChild(MatTable) tabla!: MatTable<Empresa>;
  constructor(
    private dialog: MatDialog,
    private _empresaServicio: EmpresaService,
    private _utilidadServicio: UtilidadService, private http: HttpClient,
    private _usuarioServicio: UsuariosService,

  ) {

  }


  obtenerEmpresa() {
    this._empresaServicio.lista2().subscribe({
      next: (data) => {
        if (data.status) {
          // data.value.forEach((empresa: Empresa) => {
          //   // const empresas = data.value as Empresa[];
          //   // this.verificarRedesSociales(empresas);
          //   console.log('Empresa obtenida:', empresa);

          //   if (empresa.logo) {
          //     empresa.logo = this._empresaServicio.decodeBase64ToImageUrl(empresa.logo);
          //   }
          // });

          this.empresas = data.value;
          this.dataListaProductos.data = this.empresas;
          this.dataListaProductos.paginator = this.paginacionTabla;

          if (this.paginacionTabla) {
            this.paginacionTabla.firstPage();
          }
          this.cargaCompleta = true;
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: `No se encontraron datos`,
          });
          // this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Oops!");
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
                  this.obtenerEmpresa();
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


      },
    });
  }

  ngOnInit(): void {
    this.obtenerEmpresa();
  }
  // Dentro del método o función donde obtienes las empresas
  verificarRedesSociales(tipoRed: string, enlace: string): void {
    if (enlace === "") {
      this.mostrarErrorSinRedesSociales();
      return;
    }

    // Abre el enlace según el tipo de red social
    window.open(enlace, '_blank');

  }

  mostrarErrorSinRedesSociales(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se encontraron enlaces para esta red social.',
    });
    return;
  }

  get hayEmpresas(): boolean {
    return this.empresas.length > 0;
  }

  crearEmpresa(): void {
    this.dialog.open(ModalEmpresaComponent, {
      disableClose: true,
      data: null // Puedes enviar cualquier dato que necesites al modal de creación de empresa
    }).afterClosed().subscribe(resultado => {
      if (resultado === true) {
        // Si el resultado es verdadero, significa que se creó una nueva empresa
        this.obtenerEmpresa(); // Vuelve a cargar la lista de empresas
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataListaProductos.paginator = this.paginacionTabla;
  }
  verImagen(empresa: Empresa): void {
    // console.log(empresa);
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: [empresa.imagenUrl]
      }
    });
  }

  editarEmpresa(empresa: Empresa) {

    this.dialog.open(ModalEmpresaComponent, {
      disableClose: true,
      data: empresa
    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerEmpresa();

    });
  }


  eliminarEmpresa(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar empresa'
    }).then((result) => {
      if (result.isConfirmed) {
        this._empresaServicio.eliminar(id).subscribe({
          next: (data) => {
            if (data.status) {
              Swal.fire(
                'Eliminado',
                'La empresa ha sido eliminada correctamente',
                'success'
              );
              this.obtenerEmpresa(); // Actualizar la lista de empresas después de eliminar
              location.reload();
            } else {
              Swal.fire(
                'Error',
                'Hubo un problema al eliminar la empresa',
                'error'
              );
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
                      this.eliminar(id);
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
          },
        });
      }
    });
  }

  eliminar(id: number) {
    this._empresaServicio.eliminar(id).subscribe({
      next: (data) => {
        if (data.status) {
          Swal.fire(
            'Eliminado',
            'La empresa ha sido eliminada correctamente',
            'success'
          );
          this.obtenerEmpresa(); // Actualizar la lista de empresas después de eliminar
          location.reload();
        } else {
          Swal.fire(
            'Error',
            'Hubo un problema al eliminar la empresa',
            'error'
          );
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
                  this.eliminar(id);
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
      },
    });
  }
  cambiarImagen(empresa: Empresa) {
    this.dialog.open(CambiarImagenEmpresaComponent, {
      disableClose: true,
      data: { empresa: empresa } // Asegúrate de pasar correctamente el producto en la propiedad "data"
    }).afterClosed().subscribe(resultado => {
      if (resultado === true) {
        this.obtenerEmpresa();
      }
    });
  }




  generarPDF() {
    // Llamada al servicio para obtener la información de la empresa
    this._empresaServicio.lista().subscribe({
      next: (response) => {
        // Verificar si la respuesta tiene éxito (status = true)
        if (response.status) {
          // Datos de la empresa
          const empresas = response.value as Empresa[];

          const cliente = 'Camilo Andres';
          const idCedula = '10000000';
          const sexo = 'Masculino';
          const direccion = 'Calle 2b#5b-17';
          const telefono = '3012091145';
          const empresa = empresas[0];

          // Extraer los datos de la empresa
          const nombreEmpresa = empresa ? empresa.nombreEmpresa : 'No disponible';
          const direccion2 = empresa ? empresa.direccion : 'No disponible';
          const telefono2 = empresa ? empresa.telefono : 'No disponible';
          const correo = empresa ? empresa.correo : 'No disponible';
          const rut = empresa ? empresa.rut : 'No disponible';
          const logoBase64 = empresa ? empresa.logo : '';
          let logoBase64WithPrefix = 'data:image/png;base64,' + logoBase64;

          // Información adicional
          const fechaActual = new Date().toLocaleString('es-CO', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });

          // Definición del documento PDF
          const documentDefinition: TDocumentDefinitions = {

            // background: (currentPage, pageSize) => {
            //   return {
            //     text: 'Copia',
            //     color: 'gray',
            //     opacity: 0.3,
            //     bold: true,
            //     fontSize: 80,
            //     alignment: 'center',
            //     margin: [0, pageSize.height / 2 - 40], // Ajusta la posición vertical
            //   };
            // },
            background: (currentPage, pageSize) => {
              const text = 'Copia';
              const repeatedText = [];
              const gap = 200; // Distancia entre cada repetición de "Copia"

              for (let y = -pageSize.height; y < pageSize.height * 2; y += gap) {
                for (let x = -pageSize.width; x < pageSize.width * 2; x += gap) {
                  repeatedText.push({
                    text: text,
                    color: 'gray',
                    opacity: 0.3,
                    bold: true,
                    fontSize: 60,
                    angle: -45,
                    absolutePosition: { x: x, y: y }
                  });
                }
              }

              return repeatedText;
            },

            content: [
              {
                image: logoBase64WithPrefix,
                width: 150,
                alignment: 'center' as 'left' | 'center' | 'right' | 'justify', // Asegúrate de que sea uno de estos tipos
              },
              { text: `Nombre de la Empresa: ${nombreEmpresa}`, style: 'header' },
              { text: `Dirección: ${direccion2}`, style: 'subheader' },
              { text: `Teléfono: ${telefono2}`, style: 'subheader' },
              { text: `Correo: ${correo}`, style: 'subheader' },
              { text: `Nit: ${rut}`, style: 'subheader' },
              { text: '' }, // Espacio en blanco
              { text: `Fecha: ${fechaActual}`, style: 'subheader' },
              { text: `Cliente: ${cliente}`, style: 'subheader' },
              { text: `Cédula: ${idCedula}`, style: 'subheader' },
              { text: `Sexo: ${sexo}`, style: 'subheader' },
              { text: `Dirección: ${direccion}`, style: 'subheader' },
              { text: `Teléfono: ${telefono}`, style: 'subheader' },
            ],
            styles: {
              header: { fontSize: 18, bold: true, margin: [0, 20, 0, 10] },
              subheader: { fontSize: 14, margin: [0, 5, 0, 5] },
            },
          };


          // Generar el PDF
          // const pdfDoc = pdfMake.createPdf(documentDefinition);
          // pdfDoc.getBlob((blob) => {
          //   const url = URL.createObjectURL(blob);
          //   const iframe = document.getElementById('pdfPreview') as HTMLIFrameElement;
          //   iframe.src = url; // Establece la URL del blob como fuente del iframe
          //   iframe.style.display = 'block'; // Muestra el iframe
          // });

          pdfMake.vfs = pdfFonts.pdfMake.vfs;
          const pdfDoc = pdfMake.createPdf(documentDefinition);

          // Generar y abrir el PDF en una nueva ventana
          pdfDoc.getBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const newWindow = window.open(url); // Abre la URL en una nueva ventana
            if (newWindow) {
              newWindow.focus(); // Enfoca la nueva ventana
            } else {
              alert('Por favor, permite las ventanas emergentes para este sitio.');
            }
          });


        } else {
          console.error('La respuesta de la API indica un error:', response.msg);
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos de la empresa:', error);
        // Manejo de error aquí
      }
    });
  }


}
