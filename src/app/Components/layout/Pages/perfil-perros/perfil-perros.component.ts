
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ModalPerroComponent } from '../../Modales/modal-perro/modal-perro.component';
import { Perro } from '../../../../Interfaces/perro';
import { PerroService } from '../../../../Services/perro.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ReponseApi } from './../../../../Interfaces/reponse-api';
import { CambiarImagenComponent } from '../../Modales/cambiar-imagen/cambiar-imagen.component';
import { MatTable } from '@angular/material/table';
import { VerImagenProductoModalComponent } from '../../Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EmpresaService } from '../../../../Services/empresa.service';
import { Empresa } from '../../../../Interfaces/empresa';

import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-perfil-perros',
  templateUrl: './perfil-perros.component.html',
  styleUrl: './perfil-perros.component.css'
})
export class PerfilPerrosComponent implements OnInit, AfterViewInit {

  urlApi: string = environment.endpoint;
  // Variable para almacenar la suma total de los valores de los Perros
  sumaTotal: number = 0;
  sumaTotalCompra: number = 0;
  Ganancia: number = 0;
  usuario: any; // Define una variable para almacenar la información del usuario
  Perros: Perro[] = [];
  proveedores: any[] = []; // Variable para almacenar la lista de proveedores
  categorias: any[] = [];
  proveedorSeleccionado: number | null = null; // Variable para almacenar el ID del proveedor seleccionado

  categoriaSeleccionada: number | null = null; // Variable para almacenar el ID de la categoría seleccionada
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  metodoBusqueda: string | null = '';


  columnasTabla: string[] = [
    'imagen',
    'nombre',
    'raza',
    'edad',
    'tamano',
    'dueno',
    'estado',
    'acciones'
  ];
  dataInicio: Perro[] = [];
  dataListaPerros = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;
  @ViewChild(MatTable) tabla!: MatTable<Perro>;


  page = 1;
  pageSize = 5;
  totalPerros = 0;
  totalPages = 0;
  searchTerm = '';
  selectedFile: File | null = null;

  constructor(
    private dialog: MatDialog,
    private _PerroServicio: PerroService,
    private _utilidadServicio: UtilidadService, private http: HttpClient,
    private snackBar: MatSnackBar,

    private empresaService: EmpresaService,
    private _usuarioServicio: UsuariosService,
  ) {

    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    if (datosDesencriptados !== null) {
      this.usuario = JSON.parse(datosDesencriptados);
    } else {
      // Manejar el caso en el que no se encuentra ningún usuario en el Local Storage
      // Por ejemplo, podrías asignar un valor por defecto o mostrar un mensaje de error
    }
  }

  ngAfterViewInit(): void {
    this.dataListaPerros.paginator = this.paginacionTabla;
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.obtenerPerro();
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

    this.obtenerPerro();
  }
  firstPage() {
    this.page = 1;
    this.obtenerPerro();
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.obtenerPerro();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.obtenerPerro();
    }
  }

  lastPage() {
    this.page = this.totalPages;
    this.obtenerPerro();
  }
  pageSizeChange() {
    this.page = 1;
    this.obtenerPerro();
  }
  onChangeTipoBusqueda2(event: any) {
    this.metodoBusqueda = event.value; // Actualiza el valor de tipoBusqueda
    // if (this.metodoBusqueda === 'Pagado') {
    //   this.formularioPerroVenta.get('intereses')!.setValue('0'); // Establece el valor de intereses a vacío
    // } else {
    //   this.formularioPerroVenta.get('precioPagadoTexto')!.setValue('0');
    // }
  }

  obtenerPerro() {

    let idUsuario: number = 0;
    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(datosDesencriptados);
    const usuario = JSON.parse(datosDesencriptados);
    idUsuario = usuario.idUsuario; 

    this._PerroServicio.obtenerPerrosPorUsuario(idUsuario).subscribe({
      next: (data) => {
        if (data.status) {



          this.dataListaPerros = new MatTableDataSource<Perro>(data.value);
           console.log(this.dataListaPerros);
          this.dataListaPerros.paginator = this.paginacionTabla;

        } else {
          this.totalPerros = 0; // Reinicia el total de categorías si no hay datos
          this.totalPages = 0; // Reinicia el total de páginas si no hay datos
          this.dataListaPerros = new MatTableDataSource<Perro>([]);
          // Swal.fire({
          //   icon: 'warning',
          //   title: 'Advertencia',
          //   text: 'No se encontraron datos',
          // });

        }
      },
      error: (e) => {
        this.totalPerros = 0; // Reinicia el total de categorías en caso de error
        this.totalPages = 0; // Reinicia el total de páginas en caso de error
        this.dataListaPerros = new MatTableDataSource<Perro>([]);
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
                  this.obtenerPerro();
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

  // formatNumber(price: any): string {
  //   // Asegúrate de que `price` sea un número antes de formatearlo
  //   const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  //   if (isNaN(numericPrice)) {
  //     return '0';
  //   }

  //   // Formatea el número usando toLocaleString
  //   let formattedPrice = numericPrice.toLocaleString('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2
  //   });

  //   // Quita los decimales si el precio es un número entero
  //   formattedPrice = formattedPrice.replace(/\.00$/, '');

  //   return formattedPrice;
  // }



  ngOnInit(): void {
    this.obtenerPerro();



  }



  // Método para generar el PDF con los datos proporcionados
  generarPDF2(header: string[], data: any[][], nombreProveedor: string) {

    this.empresaService.lista().subscribe({
      next: (response) => {
        if (response.status) {
          const empresas = response.value as Empresa[];
          // if (empresas.length > 0) {
          const empresa = empresas[0];

          // Extraer los datos de la empresa
          const nombreEmpresa = empresa ? empresa.nombreEmpresa : 'No disponible';
          const direccion2 = empresa ? empresa.direccion : 'No disponible';
          const telefono2 = empresa ? empresa.telefono : 'No disponible';
          const correo = empresa ? empresa.correo : 'No disponible';
          const rut = empresa ? empresa.rut : 'No disponible';
          const logoBase64 = empresa ? empresa.logo : '';
          // Agregar prefijo al logo base64
          const logoBase64WithPrefix = 'data:image/png;base64,' + logoBase64;



          // Recuperar el nombre de usuario del localStorage
          const usuarioString = localStorage.getItem('usuario');
          const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
          const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
          // Verificar si usuarioString es nulo antes de parsearlo
          const usuario = datosDesencriptados ? JSON.parse(datosDesencriptados) : null;

          // Obtener el nombre completo del usuario si existe
          const nombreUsuario = usuario ? usuario.nombreCompleto : 'Desconocido';

          const doc = new jsPDF();


          // Agregar información adicional antes de agregar cualquier página
          const additionalInfoX = doc.internal.pageSize.width - 130;
          const additionalInfoY = 7;
          const additionalInfoFontSize = 10;

          const additionalInfoX2 = doc.internal.pageSize.width - 130;
          const additionalInfoY2 = 12;
          const additionalInfoFontSize2 = 10;

          const additionalInfoX4 = doc.internal.pageSize.width - 130;
          const additionalInfoY4 = 17;
          const additionalInfoFontSize4 = 10;

          const additionalInfoX3 = doc.internal.pageSize.width - 130;
          const additionalInfoY3 = 22;
          const additionalInfoFontSize3 = 10;

          const additionalInfoX5 = doc.internal.pageSize.width - 130;
          const additionalInfoY5 = 27;
          const additionalInfoFontSize5 = 10;

          doc.setFontSize(additionalInfoFontSize);
          // doc.text('Número de contacto: 3012091145\nCorreo electrónico: carloscotes48@gmail.com', additionalInfoX, additionalInfoY);
          doc.text('Nombre de la Empresa : ' + nombreEmpresa, additionalInfoX, additionalInfoY);
          doc.setFontSize(additionalInfoFontSize4);
          doc.text('Rut : ' + rut, additionalInfoX2, additionalInfoY2);
          doc.setFontSize(additionalInfoFontSize2);
          doc.text('Direccion : ' + direccion2, additionalInfoX4, additionalInfoY4);
          doc.setFontSize(additionalInfoFontSize3);
          doc.text('Telefono : ' + telefono2, additionalInfoX3, additionalInfoY3);

          doc.setFontSize(additionalInfoFontSize5);
          doc.text('Correo : ' + correo, additionalInfoX5, additionalInfoY5);

          if (logoBase64WithPrefix && logoBase64WithPrefix.trim() !== 'data:image/png;base64,') {
            // Si hay un logo, agregarlo al array de información de la tienda
            const logo = logoBase64WithPrefix;
            const logoWidth = 30; // Adjust as needed
            const logoHeight = 35; // Adjust as needed
            doc.addImage(logo, 'PNG', 165, 10, logoWidth, logoHeight);
          }
          // Add logo to the PDF


          // Add title to the PDF
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(28);  // Increase the font size for the title
          doc.text('Listado de Perros', 60, 40);  // Adjust the position of the title

          // Add date to the PDF
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(12);
          // doc.text(`Fecha de creación de la factura: ${moment().format('YYYY-MM-DD hh:mm:ss A')}`, 20, 50);  // Adjust the position of the date
          doc.text(`Fecha de creación del reporte: ${moment().format('DD/MM/YYYY hh:mm A')}`, 20, 50);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(12);
          doc.text('Proveedor selecionado : ' + nombreProveedor, 20, 55);
          // Add a line separator after the header
          doc.setLineWidth(1);
          doc.line(20, 60, 190, 60);  // Adjust the line position


          // Add date to the PDF
          // doc.setFont('Helvetica', 'normal');
          // doc.setFontSize(12);
          // doc.text(`Fecha de creación de este reporte : ${moment().format('YYYY-MM-DD hh:mm:ss A')}`, 20, 10);

          // doc.setFont('Helvetica', 'normal');
          // doc.setFontSize(20);
          // doc.text('Listado de Perros', 80, 30);



          // const doc = new jsPDF();

          let sumaTotal = 0;

          // Obtener la suma total formateada
          const sumaTotalFormateada = this.formatoNumero(this.sumaTotal.toString());
          const sumaTotalCompraFormateada = this.formatoNumero(this.sumaTotalCompra.toString());
          const Ganancia = this.formatoNumero(this.Ganancia.toString());

          const dataFormateada = data.map(fila => {
            // Si el Perro no está activo (esActivo = 0), ignorarlo en la suma total
            if (fila[7] !== 'No Activo') {
              const precio = typeof fila[5] === 'string' ? parseFloat(fila[5].replace(',', '')) : fila[5];
              const stock = typeof fila[3] === 'string' ? parseFloat(fila[3].replace(',', '')) : fila[3];

            }

            // Si el Perro no está activo (esActivo = 0), cambiar el color de los campos a rojo
            const color = fila[7] === 'No Activo' ? [255, 0, 0] : [0, 0, 0]; // Rojo si es "No Activo", negro si es "Activo"
            return fila.map(campo => ({ content: campo.toString(), styles: { textColor: color } }));
          });





          // Agregar encabezado y cuerpo de la tabla al PDF
          (doc as any).autoTable({
            headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
            head: [header],
            // body: data, // Aquí pasamos los datos del cuerpo de la tabla
            body: dataFormateada,
            startY: 70,
            didDrawPage: (dataArg: any) => {
              // Añadir número de página al pie de página
              const pageCount = doc.getNumberOfPages(); // Obtenemos el número total de páginas
              const pageNumber = dataArg.pageNumber; // Obtenemos el número de página actual
              doc.text(`Página ${pageNumber} de ${pageCount}`, 170, 290);
            },
            styles: { halign: 'center' },
          });

          // // Obtener las dimensiones del PDF
          // const { height } = doc.internal.pageSize;

          // // Agregar fila con la suma total al final del PDF
          // doc.text(`Suma total Venta: ${sumaTotalFormateada}`, 20, height - 30);
          // doc.text(`Suma total Compra : ${sumaTotalCompraFormateada}`, 20, height - 20);
          // doc.text(`Ganancia : ${Ganancia}`, 20, height - 10);


          const tableHeight = (doc as any).autoTable.previous.finalY;
          // Calcula la posición Y para la información adicional
          let infoY = tableHeight + 20; // Ajusta según sea necesario

          // Verifica si la información adicional se ajustará en la página actual
          if (infoY + 30 > 290) {
            doc.addPage();
            infoY = 20;
          }



          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(12);
          doc.text(`Suma total Venta:        ${sumaTotalFormateada}  $`, 130, infoY + 7);
          doc.text(`Suma total Compra :    ${sumaTotalCompraFormateada} $`, 130, infoY + 14);
          doc.setLineWidth(0.5);
          doc.line(130, infoY + 23, 195, infoY + 23);
          doc.text(`Ganancia :                   ${Ganancia} $`, 130, infoY + 30);

          const uniqueIdentifier = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
          const currentDate = moment().format('YYYYMMDD-HHmmss'); // Fecha y hora actual en formato específico
          const fileName = `Perros_${uniqueIdentifier}_${currentDate}.pdf`;

          // doc.save(fileName);
          const pdfData = doc.output('datauristring');

          // Abrir el PDF en una nueva ventana del navegador
          const win = window.open();
          if (win) {
            win.document.write('<iframe width="100%" height="100%" src="' + pdfData + '"></iframe>');
          } else {
            console.error('No se pudo abrir la ventana del navegador.');
          }

        } else {
          console.error('La respuesta de la API indica un error:', response.msg);
        }
      },
      error: (error) => {
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
                  this.generarPDF2(header, data, nombreProveedor);
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


  cambiarImagen(Perro: Perro) {
    this.dialog.open(CambiarImagenComponent, {
      disableClose: true,
      data: { perro: Perro } // Asegúrate de pasar correctamente el Perro en la propiedad "data"
    }).afterClosed().subscribe(resultado => {
      if (resultado === true) {
        this.obtenerPerro();
      }
    });
  }




  nuevoPerro() {

    this.dialog.open(ModalPerroComponent, {
      disableClose: true

    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerPerro();

    });
  }
  editarPerro(Perro: Perro) {

    this.dialog.open(ModalPerroComponent, {
      disableClose: true,
      data: Perro
    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerPerro();

    });
  }
  // exportarPerros() {

  //   Swal.fire({
  //     icon: 'question',
  //     title: 'Descargar Excel',
  //     text: '¿Estás seguro de que deseas descargar el archivo Excel?',
  //     showCancelButton: true,
  //     confirmButtonColor: '#1337E8',
  //     confirmButtonText: 'Sí',
  //     cancelButtonColor: '#d33',
  //     cancelButtonText: 'Cancelar',
  //   }).then((result) => {
  //     if (result.isConfirmed) {



  //       this._PerroServicio.exportarPerros().subscribe(blob => {
  //         const url = window.URL.createObjectURL(blob);
  //         const a = document.createElement('a');

  //         // Generar 4 números aleatorios
  //         const randomNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  //         // Obtener la fecha y hora actual
  //         const now = new Date();
  //         const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  //         const formattedTime = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

  //         // Crear el nombre del archivo
  //         a.download = `Perros_${randomNumbers}_${formattedDate}_${formattedTime}.xlsx`;

  //         // Crear el enlace de descarga
  //         document.body.appendChild(a);
  //         a.href = url;
  //         a.click();
  //         document.body.removeChild(a);
  //       }, error => {
  //         console.error('Error al obtener los datos de la empresa:', error);
  //         let idUsuario: number = 0;


  //         // Obtener el idUsuario del localStorage
  //         const usuarioString = localStorage.getItem('usuario');
  //         const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
  //         const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
  //         if (datosDesencriptados !== null) {
  //           const usuario = JSON.parse(datosDesencriptados);
  //           idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

  //           this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
  //             (usuario: any) => {

  //               console.log('Usuario obtenido:', usuario);
  //               let refreshToken = usuario.refreshToken

  //               // Manejar la renovación del token
  //               this._usuarioServicio.renovarToken(refreshToken).subscribe(
  //                 (response: any) => {
  //                   console.log('Token actualizado:', response.token);
  //                   // Guardar el nuevo token de acceso en el almacenamiento local
  //                   localStorage.setItem('authToken', response.token);
  //                   this.exportarPerros();
  //                 },
  //                 (error: any) => {
  //                   console.error('Error al actualizar el token:', error);
  //                 }
  //               );



  //             },
  //             (error: any) => {
  //               console.error('Error al obtener el usuario:', error);
  //             }
  //           );
  //         }


  //       });

  //     }
  //   });


  // }


  // importarPerros(): void {
  //   Swal.fire({
  //     title: 'Selecciona el archivo de Perros',
  //     input: 'file',  // Tipo de input para archivo
  //     inputAttributes: {
  //       accept: '.xlsx,.xls',  // Aceptar solo archivos de Excel
  //       'aria-label': 'Sube tu archivo de Perros'
  //     },
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Importar',
  //     cancelButtonText: 'Cancelar',
  //     preConfirm: (file) => {
  //       if (!file) {
  //         Swal.showValidationMessage('Debes seleccionar un archivo');
  //       }
  //       return file;  // Retornar el archivo seleccionado
  //     }
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.selectedFile = result.value;  // Obtener el archivo seleccionado
  //       if (this.selectedFile) {
  //         this._PerroServicio.importarPerros(this.selectedFile).subscribe(
  //           (response) => {
  //             console.log('Perros importados correctamente:', response);
  //             Swal.fire('Éxito', 'Perros importados correctamente', 'success');
  //             this.obtenerPerro();
  //           },
  //           (error) => {
  //             // console.error('Error al importar Perros:', error); // Imprime el error completo
  //             // Swal.fire('Error', 'Hubo un error al importar los Perros: ' + error.message, 'error');
  //             console.log('Error al importar Perros:', error);
  //             let idUsuario: number = 0;


  //             // Obtener el idUsuario del localStorage
  //             const usuarioString = localStorage.getItem('usuario');
  //             const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
  //             const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
  //             if (datosDesencriptados !== null) {
  //               const usuario = JSON.parse(datosDesencriptados);
  //               idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

  //               this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
  //                 (usuario: any) => {

  //                   console.log('Usuario obtenido:', usuario);
  //                   let refreshToken = usuario.refreshToken

  //                   // Manejar la renovación del token
  //                   this._usuarioServicio.renovarToken(refreshToken).subscribe(
  //                     (response: any) => {
  //                       console.log('Token actualizado:', response.token);
  //                       // Guardar el nuevo token de acceso en el almacenamiento local
  //                       localStorage.setItem('authToken', response.token);
  //                       this.import2(this.selectedFile);
  //                     },
  //                     (error: any) => {
  //                       console.error('Error al actualizar el token:', error);
  //                     }
  //                   );



  //                 },
  //                 (error: any) => {
  //                   console.error('Error al obtener el usuario:', error);
  //                 }
  //               );
  //             }

  //           }
  //         );
  //       } else {
  //         console.log('Por favor seleccione un archivo.');
  //       }

  //     }
  //   });
  // }
  // import2(selectedFile: any) {

  //   this._PerroServicio.importarPerros(selectedFile).subscribe(
  //     (response) => {
  //       console.log('Perros importados correctamente:', response);
  //       Swal.fire('Éxito', 'Perros importados correctamente', 'success');
  //       this.obtenerPerro();
  //     },
  //     (error) => {
  //       // console.error('Error al importar Perros:', error); // Imprime el error completo
  //       // Swal.fire('Error', 'Hubo un error al importar los Perros: ' + error.message, 'error');
  //       console.log('Error al importar Perros:', error);
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
  //                 this.import2(selectedFile);
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
  //   );

  // }

  eliminarPerro(Perro: Perro) {
    Swal.fire({
      title: "¿Desea eliminar el Perro?",
      text: Perro.nombre,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: "Sí, eliminar",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        // this.eliminarPerroLocal(Perro);
        this.eliminarPerroServidor(Perro);
      }
    });
  }

  eliminarPerroLocal(Perro: Perro) {
    // Verificar que dataListaPerros.data sea un array válido
    if (Array.isArray(this.dataListaPerros?.data)) {
      const index = this.dataListaPerros.data.indexOf(Perro);
      if (index !== -1) {
        this.dataListaPerros.data.splice(index, 1);
        // Actualizar la fuente de datos de la tabla después de eliminar el Perro
        this.dataListaPerros.data = [...this.dataListaPerros.data];
      }
    }
  }

  eliminarPerroServidor(Perro: Perro) {
    this._PerroServicio.eliminar(Perro.idPerro!).subscribe({
      next: (data) => {
        if (data.status) {
          Swal.fire({
            icon: 'success',
            title: 'Perro Eliminado',
            text: `El Perro fue eliminado`,
          });
          this.obtenerPerro();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `No se pudo eliminar el Perro`,
          });
        }
      },
      error: (e) => {
        this.manejarErrorEliminacion(Perro);
      }
    });
  }

  manejarErrorEliminacion(Perro: Perro) {
    let idUsuario: number = 0;

    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const bytes = CryptoJS.AES.decrypt(usuarioString, this.CLAVE_SECRETA);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
      if (datosDesencriptados) {
        const usuario = JSON.parse(datosDesencriptados);
        idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

        this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
          (usuario: any) => {
            console.log('Usuario obtenido:', usuario);
            let refreshToken = usuario.refreshToken;

            // Manejar la renovación del token
            this._usuarioServicio.renovarToken(refreshToken).subscribe(
              (response: any) => {
                console.log('Token actualizado:', response.token);
                // Guardar el nuevo token de acceso en el almacenamiento local
                localStorage.setItem('authToken', response.token);
                // Volver a intentar eliminar el Perro
                this.eliminarPerroServidor(Perro);
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
  }




  verImagen(Perro: Perro): void {
    // console.log(Perro);
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: Perro.imagenUrl
      }
    });
  }




  formatoNumero(numero: string): string {
    if (numero !== null) {
      const valorNumerico = parseFloat(numero.replace(',', '.'));
      if (!isNaN(valorNumerico)) {
        const opciones = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
        return valorNumerico.toLocaleString('es-CO', opciones);
      } else {
        return numero;
      }
    } else {
      return ''; // O devuelve un valor predeterminado, dependiendo de tus necesidades
    }
  }




}
