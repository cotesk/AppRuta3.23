import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
// import { ModalProductoComponent } from '../../Modales/modal-producto/modal-producto.component';
import { Caja } from '../../../../Interfaces/caja';
import { CajaService } from '../../../../Services/caja.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import Swal from 'sweetalert2';
// import { ModalAbrirCajaComponent } from '../../Modales/modal-Caja/modal-Caja.component';
import { ModalAbrirCajaComponent } from '../../Modales/modal-abrir-caja/modal-abrir-caja.component';
// import { ModalCaracteristicasProductoComponent } from '../../Modales/modal-caracteristicas-producto/modal-caracteristicas-producto.component';
import { ModalPrestamosComponent } from '../../Modales/modal-prestamos/modal-prestamos.component';
import { EmpresaService } from '../../../../Services/empresa.service';
import { Empresa } from '../../../../Interfaces/empresa';
import { jsPDF } from 'jspdf';
import moment from 'moment';
import 'jspdf-autotable';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrl: './caja.component.css'
})
export class CajaComponent implements OnInit {

  columnasTabla: string[] = ['idCaja', 'idUsuario', 'tipoCaja',
    'fechaApertura', 'fechaCierre', 'pdf', 'estado', 'acciones'];

  columnasTabla2: string[] = ['idCaja', 'idUsuario', 'saldoInicial', 'ingresosTexto',
    'devolucionesTexto', 'total', 'saldoFinal'];

  columnasCajaGeneral: string[] = ['idCaja', 'idUsuario', 'tipoCaja', 'verDevoluciones', 'verGastos'
    , 'verPrestamos', 'verPagoTrabajadores', 'verPrestamoGeneral', 'verGastoVariado', 'pdf', 'estado'];

  columnasCajaGeneral2: string[] = ['idCaja', 'idUsuario', 'tipoCaja', 'saldoInicial',
    'ingresosTexto', 'gastosTexto', 'prestamosTexto', 'transaccionesTexto', 'total', 'acciones'];

  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  dataInicio: Caja[] = [];
  dataListaCaja = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;
  dataListaCajaGeneral = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTablaGeneral!: MatPaginator;
  page = 1;
  pageSize = 5;
  totalCategorias = 0;
  totalPages = 0;
  searchTerm = '';

  idUsuarioCajaGeneral: any

  constructor(
    private dialog: MatDialog,
    private _CajaServicio: CajaService,
    private _utilidadServicio: UtilidadService,
    private empresaService: EmpresaService,
    private _usuarioServicio: UsuariosService,
  ) { }
  //original
  // obtenerCaja() {
  //   this._CajaServicio.lista().subscribe({
  //     next: (data) => {
  //       if (data.status) {
  //         // Obtener los datos de la respuesta
  //         const newData: Caja[] = data.value;

  //         // Ordenar los datos por idCaja en orden descendente
  //         newData.sort((a: Caja, b: Caja) => b.idCaja - a.idCaja);

  //         // Asignar los datos ordenados a la fuente de datos de la tabla
  //         this.dataListaCaja.data = newData;

  //         // Resetear el paginator para mostrar los primeros elementos de la lista
  //         if (this.paginacionTabla) {
  //           this.paginacionTabla.firstPage();
  //         }
  //       } else {
  //         Swal.fire({
  //           icon: 'warning',
  //           title: 'Advertencia',
  //           text: `No se encontraron datos`,
  //         });
  //       }
  //     },
  //     error: (e) => {


  //       // Swal.fire({
  //       //   icon: 'error',
  //       //   title: 'ERROR',
  //       //   text: ` el cliente  editar`,
  //       // });
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
  //                 this.obtenerCaja();
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
  //   });
  // }

  // generarPDF(caja: Caja) {

  //   this.empresaService.lista().subscribe({
  //     next: (response) => {
  //       if (response.status) {
  //         const empresas = response.value as Empresa[];
  //         // if (empresas.length > 0) {
  //         const empresa = empresas[0];
  //         const nombreEmpresa = empresa ? empresa.nombreEmpresa : 'No disponible';
  //         const direccion2 = empresa ? empresa.direccion : 'No disponible';
  //         const telefono2 = empresa ? empresa.telefono : 'No disponible';
  //         const correo = empresa ? empresa.correo : 'No disponible';
  //         const logoBase64 = empresa ? empresa.logo : '';

  //         // Recuperar el nombre de usuario del localStorage
  //         const usuarioString = localStorage.getItem('usuario');
  //         // Verificar si usuarioString es nulo antes de parsearlo
  //         const usuario = usuarioString ? JSON.parse(usuarioString) : null;

  //         // Obtener el nombre completo del usuario si existe
  //         const nombreUsuario = usuario ? usuario.nombreCompleto : 'Desconocido';

  //         const doc = new jsPDF();

  //         const logoBase64WithPrefix = 'data:image/png;base64,' + logoBase64;
  //         const logoWidth = 70;
  //         const logoHeight = 75;
  //         const logoX = 460;
  //         const logoY = 35;



  //         // Add title to the PDF
  //         doc.setFont('Helvetica', 'bold');
  //         doc.setFontSize(28);  // Increase the font size for the title
  //         doc.text('Detalle de la caja', 70, 40);  // Adjust the position of the title

  //         // Add date to the PDF
  //         doc.setFont('Helvetica', 'normal');
  //         doc.setFontSize(12);
  //         // doc.text(`Fecha de creación de la factura: ${moment().format('YYYY-MM-DD hh:mm:ss A')}`, 20, 50);  // Adjust the position of the date
  //         doc.text(`Fecha de creación del reporte: ${moment().format('DD/MM/YYYY hh:mm A')}`, 20, 50);

  //         // const FechaRegistro = moment(this._abono.fechaAbono).format('DD/MM/YYYY hh:mm A');

  //         // doc.text(`Fecha de creación del abono: ${FechaRegistro} `, 20, 55);

  //         // Add a line separator after the header
  //         doc.setLineWidth(1);
  //         doc.line(20, 55, 190, 55);  // Adjust the line position




  //         // Add table to the PDF

  //         const uniqueIdentifier = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
  //         const currentDate = moment().format('YYYYMMDD-HHmmss'); // Fecha y hora actual en formato específico

  //         const fileName = `ReporteVentas_${uniqueIdentifier}_${currentDate}.pdf`;


  //         const informacionTienda: any[] = [


  //         ];
  //         if (logoBase64WithPrefix && logoBase64WithPrefix.trim() !== 'data:image/png;base64,') {
  //           // Si hay un logo, agregarlo al array de información de la tienda
  //           informacionTienda.unshift(
  //             // { image: logoBase64WithPrefix, alignment: 'center', fit: [20, 20], margin: [5, -3, -1, 3] },
  //             { image: logoBase64WithPrefix, width: logoWidth, height: logoHeight, absolutePosition: { x: logoX, y: logoY } },
  //           );
  //         }
  //         // Verificar si nombreEmpresa está vacío antes de agregarlo al array
  //         if (nombreEmpresa.trim() !== 'No disponible') {
  //           informacionTienda.push(
  //             { text: `Nombre de la Empresa: ${nombreEmpresa}`, style: 'subheader', alignment: 'center' }
  //           );
  //         }

  //         // Agregar el resto de la información de la tienda
  //         if (direccion2.trim() !== 'No disponible') {
  //           informacionTienda.push(
  //             { text: `Dirección: ${direccion2}`, style: 'subheader', alignment: 'center' }
  //           );
  //         }
  //         if (telefono2.trim() !== 'No disponible') {
  //           informacionTienda.push(
  //             { text: `Teléfono: ${telefono2}`, style: 'subheader', alignment: 'center' }
  //           );
  //         }
  //         if (correo.trim() !== 'No disponible') {
  //           informacionTienda.push(
  //             { text: `Correo: ${correo}`, style: 'subheader', alignment: 'center' }
  //           );
  //         }
  //         // Add logo to the PDF
  //         if (logoBase64WithPrefix && logoBase64WithPrefix.trim() !== 'data:image/png;base64,') {
  //           doc.addImage(logoBase64WithPrefix, 'PNG', logoX, logoY, logoWidth, logoHeight);
  //         }

  //         const columns = ['idCaja', 'Saldo inicial ', 'Ingreso', 'Devoluciones'];
  //         const saldoInicial = this.formatearNumero(caja.saldoInicialTexto!);
  //         const ingresos = this.formatearNumero(caja.ingresosTexto!);
  //         const devoluciones = this.formatearNumero(caja.devolucionesTexto!);
  //         // AutoTable options for a cleaner appearance
  //         const tableOptions = {

  //           margin: { horizontal: 20 },
  //           styles: { font: 'Helvetica', fontSize: 10 },
  //           headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
  //         };
  //         // Definir el estilo de la tabla para centrar el texto
  //         const tableStyles = {
  //           valign: 'middle', // Centra verticalmente el contenido de la celda
  //           halign: 'center' // Centra horizontalmente el contenido de la celda
  //         };

  //         const autoTableConfig = {

  //           startY: 60,
  //           head: [columns],
  //           body: [  // Aquí es donde debes proporcionar los datos de la caja
  //             [caja.idCaja, saldoInicial, ingresos, devoluciones] // Esto es un ejemplo, debes adaptarlo según la estructura de tu objeto de caja
  //           ],

  //           ...tableOptions,
  //           styles: {
  //             ...tableStyles, // Agregar los estilos de la tabla personalizados
  //             // También puedes agregar otros estilos aquí si lo deseas
  //           },
  //           informacionTienda: informacionTienda // Añade informacionTienda aquí
  //         };

  //         doc.setFontSize(12);
  //         for (let i = 0; i < informacionTienda.length; i++) {
  //           const item = informacionTienda[i];
  //           if (item.text) {
  //             doc.text(item.text, 70, 5 + (i * 5)); // Ajusta las coordenadas según tu diseño

  //           }
  //         }


  //         // Dibuja la tabla
  //         (doc as any).autoTable({
  //           ...autoTableConfig,
  //           informacionTienda
  //         });

  //         // Generar el PDF y abrirlo en una nueva ventana del navegador
  //         // pdfMake.vfs = pdfFonts.pdfMake.vfs;
  //         // const pdfDoc = pdfMake.createPdf(autoTableConfig);
  //         const blob = doc.output('blob');

  //         // Crear una URL para el blob
  //         const blobURL = URL.createObjectURL(blob);

  //         // Abrir el PDF en una nueva ventana del navegador
  //         window.open(blobURL, '_blank');


  //       } else {
  //         console.error('La respuesta de la API indica un error:', response.msg);
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error al obtener los datos de la empresa:', error);
  //     }
  //   });




  // }
  obtenerCaja() {


    this._CajaServicio.listaPaginada(this.page, this.pageSize, this.searchTerm).subscribe({
      next: (data) => {
        if (data && data.data && data.data.length > 0) {
          this.totalCategorias = data.total;
          this.totalPages = data.totalPages;
          // this.dataListaCaja.data = data.data;
          this.dataListaCaja.data = data.data.filter((caja: Caja) => caja.tipoCaja !== 'General');
          // console.log("Cajas",this.dataListaCaja.data);
        } else {
          this.totalCategorias = 0; // Reinicia el total de categorías si no hay datos
          this.totalPages = 0; // Reinicia el total de páginas si no hay datos
          this.dataListaCaja.data = []; // Limpia los datos existentes
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
        this.dataListaCaja.data = [];
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
                  this.obtenerCaja();
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

  obtenercajaGeneral() {
    this._CajaServicio.listaSoloGeneral().subscribe({
      next: (respuesta) => {
        if (respuesta) {
          this.dataListaCajaGeneral = respuesta.value;

          this.idUsuarioCajaGeneral = respuesta.value[0].idUsuario;
          console.log('ID del primer usuario:', this.idUsuarioCajaGeneral);
        }
      },
      error: (error) => {
        console.error('Error al obtener caja general:', error);
      }
    });


  }


  ngAfterViewInit(): void {
    this.dataListaCaja.paginator = this.paginacionTabla;
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.obtenerCaja();
  }

  aplicarFiltroTabla(event: Event) {
    const filtroValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchTerm = filtroValue;
    this.obtenerCaja();
  }
  firstPage() {
    this.page = 1;
    this.obtenerCaja();
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.obtenerCaja();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.obtenerCaja();
    }
  }

  lastPage() {
    this.page = this.totalPages;
    this.obtenerCaja();
  }
  pageSizeChange() {
    this.page = 1;
    this.obtenerCaja();
  }


  generarPDF(caja: Caja) {
    this.empresaService.lista().subscribe({
      next: (response) => {
        if (response.status) {
          const empresas = response.value as Empresa[];
          const empresa = empresas[0];
          const nombreEmpresa = empresa ? empresa.nombreEmpresa : 'No disponible';
          const direccion2 = empresa ? empresa.direccion : 'No disponible';
          const telefono2 = empresa ? empresa.telefono : 'No disponible';
          const correo = empresa ? empresa.correo : 'No disponible';
          const rut = empresa ? empresa.rut : 'No disponible';
          const logoBase64 = empresa ? empresa.logo : '';

          const doc = new jsPDF();

          const logoBase64WithPrefix = 'data:image/png;base64,' + logoBase64;
          const logoWidth = 70;
          const logoHeight = 75;
          const logoX = 460;
          const logoY = 35;

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(28);
          doc.text('Detalle de la caja', 70, 40);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(12);
          doc.text(`Fecha de creación del reporte: ${moment().format('DD/MM/YYYY hh:mm A')}`, 20, 50);
          doc.setLineWidth(1);
          doc.line(20, 55, 190, 55);

          const uniqueIdentifier = Math.floor(1000 + Math.random() * 9000);
          const currentDate = moment().format('YYYYMMDD-HHmmss');
          const fileName = `ReporteVentas_${uniqueIdentifier}_${currentDate}.pdf`;

          const informacionTienda: any[] = [];
          if (logoBase64WithPrefix && logoBase64WithPrefix.trim() !== 'data:image/png;base64,') {
            // Si hay un logo, agregarlo al array de información de la tienda
            informacionTienda.unshift(
              // { image: logoBase64WithPrefix, alignment: 'center', fit: [20, 20], margin: [5, -3, -1, 3] },
              { image: logoBase64WithPrefix, width: logoWidth, height: logoHeight, absolutePosition: { x: logoX, y: logoY } },
            );
          }
          if (nombreEmpresa.trim() !== 'No disponible') {
            informacionTienda.push(
              { text: `Nombre de la Empresa: ${nombreEmpresa}`, style: 'subheader', alignment: 'center' }
            );
          }
          if (rut.trim() !== 'No disponible') {
            informacionTienda.push(
              { text: `Nit: ${rut}`, style: 'subheader', alignment: 'center' }
            );
          }

          if (direccion2.trim() !== 'No disponible') {
            informacionTienda.push(
              { text: `Dirección: ${direccion2}`, style: 'subheader', alignment: 'center' }
            );
          }

          if (telefono2.trim() !== 'No disponible') {
            informacionTienda.push(
              { text: `Teléfono: ${telefono2}`, style: 'subheader', alignment: 'center' }
            );
          }

          if (correo.trim() !== 'No disponible') {
            informacionTienda.push(
              { text: `Correo: ${correo}`, style: 'subheader', alignment: 'center' }
            );
          }

          const columns = ['Id Caja', 'Id Usuario', 'Responsable de la Caja', 'Fecha Apertura', 'Fecha Cierre', 'Estado'];
          // const columns2 = ['Estado', 'Metodo De Pago'];
          const columns2 = ['Saldo Inicial', 'Ingresos', 'Gastos', 'Prestamos'];
          const columns3 = ['Devoluciones', 'Transacciones', 'Saldo Final'];
          const columns4 = ['Comentario Prestamos', 'Comentario Gastos', 'Comentario Devoluciones'];


          const saldoInicial = this.formatearNumero(caja.saldoInicialTexto!) + " $";
          const ingresos = this.formatearNumero(caja.ingresosTexto!) + " $";
          const devoluciones = this.formatearNumero(caja.devolucionesTexto!) + " $";
          const saldoFinal = this.formatearNumero(caja.saldoFinalTexto!) + " $";
          const prestamos = this.formatearNumero(caja.prestamosTexto!) + " $";
          const estado = (caja.estado!);
          const idUsuario = caja.idUsuario!;
          const nombreUsuario = caja.nombreUsuario!;
          const gastos = this.formatearNumero(caja.gastosTexto!) + " $";
          const transacciones = this.formatearNumero(caja.transaccionesTexto!) + " $";
          const metodoPago = caja.metodoPago!;
          const fechaApertura = moment(caja.fechaApertura).format('DD-MM-YYYY hh:mm A');
          const fechaCierre = caja.fechaCierre ? moment(caja.fechaCierre).format('DD-MM-YYYY hh:mm A') : 'Fecha no estipulada';
          // const ultimaActualizacion = moment(caja.ultimaActualizacion).format('YYYY-MM-DD HH:mm:ss');
          const comentarios = caja.comentarios!;
          const comentariosGastos = caja.comentariosGastos!;
          const comentariosDevoluciones = caja.comentariosDevoluciones!;
          const numeroDocumento = caja.numeroDocumento;
          const numeroDocumentoCompra = caja.numeroDocumentoCompra;


          const tableOptions = {
            margin: { horizontal: 10 },
            styles: { font: 'Helvetica', fontSize: 10, textColor: [0, 0, 0] },
            headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
          };

          const tableStyles = {
            valign: 'middle',
            halign: 'center'
          };

          const autoTableConfig = {
            startY: 60, // Ajustar la posición de inicio de la tabla para dejar espacio para la imagen
            head: [columns],
            body: [[caja.idCaja, idUsuario, nombreUsuario, fechaApertura, fechaCierre, estado]],
            ...tableOptions,
            styles: {
              ...tableStyles,
              font: 'Helvetica',
              fontSize: 10,
              halign: 'center',
              textColor: [0, 0, 0], // Establecer el color del texto como negro
            },
            informacionTienda: informacionTienda
          };


          let imageAdded = false;
          doc.setFontSize(12);
          for (let i = 0; i < informacionTienda.length; i++) {
            const item = informacionTienda[i];
            if (item.text) {
              doc.text(item.text, 70, 5 + (i * 5));
            } else if (item.image) {
              console.log('Agregando imagen:', item.image);
              const { image, absolutePosition, width, height } = item;
              if (image && image.startsWith('data:image')) {
                doc.addImage(
                  image,          // La imagen en base64
                  'PNG',          // Formato de la imagen
                  162,             // Coordenada X (horizontal) - ajusta según tu necesidad
                  10,             // Coordenada Y (vertical) - ajusta según tu necesidad
                  30,             // Ancho de la imagen - ajusta según tu necesidad
                  30             // Alto de la imagen - ajusta según tu necesidad
                );
                imageAdded = true; // Actualizar la bandera a true cuando se agrega una imagen
              } else {
                console.error('Formato de imagen no válido:', image);
              }
            }
          }


          // Agregar la primera tabla manualmente
          (doc as any).autoTable({
            ...autoTableConfig,
            startY: 60, // Posición de inicio de la primera tabla
          });
          // Agregar la segunda tabla automáticamente con sus propias configuraciones
          // (doc as any).autoTable({
          //   head: [columns2],
          //   body: [[estado, metodoPago]],
          //   startY: 80, // Posición de inicio de la segunda tabla debajo de la primera
          //   margin: { horizontal: 10 }, // Configuración de margen horizontal
          //   styles: { font: 'Helvetica', fontSize: 10, halign: 'center' }, // Estilos de fuente y tamaño
          //   headStyles: { fontStyle: 'bold', fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center' },

          // });
          // Agregar la segunda tabla automáticamente con sus propias configuraciones
          (doc as any).autoTable({
            head: [columns2],
            body: [[saldoInicial, ingresos, gastos, prestamos]],
            startY: 80, // Posición de inicio de la segunda tabla debajo de la primera
            margin: { horizontal: 10 }, // Configuración de margen horizontal
            styles: { font: 'Helvetica', fontSize: 10, halign: 'center', textColor: [0, 0, 0] }, // Estilos de fuente y tamaño
            headStyles: { fontStyle: 'bold', fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center' },

          });
          (doc as any).autoTable({
            head: [columns3],
            body: [[devoluciones, transacciones, saldoFinal,]],
            startY: 100, // Posición de inicio de la segunda tabla debajo de la primera
            margin: { horizontal: 10 }, // Configuración de margen horizontal
            styles: { font: 'Helvetica', fontSize: 10, halign: 'center', textColor: [0, 0, 0] }, // Estilos de fuente y tamaño
            headStyles: { fontStyle: 'bold', fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center' },

          });

          (doc as any).autoTable({
            head: [columns4],
            body: [[comentarios, comentariosGastos, comentariosDevoluciones,]],
            startY: 120, // Posición de inicio de la segunda tabla debajo de la primera
            margin: { horizontal: 10 }, // Configuración de margen horizontal
            styles: { font: 'Helvetica', fontSize: 10, halign: 'center', textColor: [0, 0, 0] }, // Estilos de fuente y tamaño
            headStyles: { fontStyle: 'bold', fillColor: [200, 200, 200], textColor: [0, 0, 0], halign: 'center' },

          });


          const blob = doc.output('blob');
          const blobURL = URL.createObjectURL(blob);
          window.open(blobURL, '_blank');

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
                  this.generarPDF(caja);
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


  //original
  // obtenerCaja() {

  //   this._CajaServicio.lista().subscribe({

  //     next: (data) => {
  //       if (data.status)
  //         this.dataListaCaja.data = data.value;
  //       else
  //         Swal.fire({
  //           icon: 'warning',
  //           title: 'Advertencia',
  //           text: `no se encontraron datos`,
  //         });
  //       // this._utilidadServicio.mostrarAlerta("no se encontraron datos", "Oops!");
  //     },
  //     error: (e) => { }

  //   })
  // }


  ngOnInit(): void {
    this.obtenerCaja();
    this.obtenercajaGeneral();
  }



  nuevaCaja() {

    this.dialog.open(ModalAbrirCajaComponent, {
      disableClose: true

    }).afterClosed().subscribe(resultado => {

      if (resultado === "true")
        this.obtenerCaja();
      this.obtenercajaGeneral();

    });
  }

  editarcaja(Caja: Caja) {

    this.dialog.open(ModalAbrirCajaComponent, {
      disableClose: true,
      data: Caja
    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerCaja();

    });
  }
  cambiarEstado(Caja: Caja) {
    Swal.fire({
      title: '¿Desea cerrar la caja?',
      text: `Caja atendido por : ${Caja.nombreUsuario}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar estado'
    }).then((result) => {
      if (result.isConfirmed) {
        this._CajaServicio.cambiarEstado(Caja.idCaja).subscribe({
          next: (data) => {
            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: `La caja a sido cerrada correctamente.`,
              });
              this.obtenerCaja();
              this.obtenercajaGeneral(); // Actualizar la lista después de cambiar el estado
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No se pudo cambiar el estado de la caja.`,
              });
            }
          },
          error: (error) => {
            // Swal.fire({
            //   icon: 'error',
            //   title: 'Error',
            //   text: `Ocurrió un error al cambiar el estado de la caja: ${error}`,
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
                      this.cambiarEstados(Caja);
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
    });
  }
  cambiarEstados(Caja: Caja) {
    this._CajaServicio.cambiarEstado(Caja.idCaja).subscribe({
      next: (data) => {
        if (data.status) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `La caja a sido cerrada correctamente.`,
          });
          this.obtenerCaja();
          this.obtenercajaGeneral();  // Actualizar la lista después de cambiar el estado
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se pudo cambiar el estado de la caja.`,
          });
        }
      },
      error: (error) => {
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Error',
        //   text: `Ocurrió un error al cambiar el estado de la caja: ${error}`,
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
                  this.cambiarEstados(Caja);
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

  formatearNumero2(numero: number): string {
    return numero.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  calcularTotalCaja(element: any): string {
    const saldoInicial = parseFloat(element.saldoInicialTexto || '0');
    const ingresos = parseFloat(element.ingresosTexto || '0');
    const gastos = parseFloat(element.gastosTexto || '0');
    const prestamos = parseFloat(element.prestamosTexto || '0');

    // console.log(saldoInicial);
    const total = saldoInicial + ingresos;
    const total2 = gastos + prestamos
    const suma = total - total2;
    // console.log(suma);
    return this.formatearNumero2(suma);
  }

  calcularTotalCaja2(element: any): string {
    const saldoInicial = parseFloat(element.saldoInicialTexto || '0');
    const ingresos = parseFloat(element.ingresosTexto || '0');
    const devoluciones = parseFloat(element.devolucionesTexto || '0');

    // console.log(saldoInicial);
    const total = saldoInicial + ingresos;
    const total2 = devoluciones;
    const suma = total - total2;
    return this.formatearNumero2(suma);
  }



  eliminarProducto(Caja: Caja) {

    Swal.fire({

      title: "¿Desea eliminar la Caja?",
      // text: Caja.nombre,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: "Si, eliminar",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'

    }).then((resultado) => {


      if (resultado.isConfirmed) {

        this._CajaServicio.eliminar(Caja.idCaja).subscribe({
          next: (data) => {

            if (data.status) {
              Swal.fire({
                icon: 'success',
                title: 'Caja Eliminada',
                text: `La Caja fue eliminado`,
              });
              // this._utilidadServicio.mostrarAlerta("La Caja fue eliminado","listo!");
              this.obtenerCaja();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo eliminar la Caja`,
              });
              // this._utilidadServicio.mostrarAlerta("No se pudo eliminar la Caja","Error");

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
                      this.eliminar(Caja);
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
  eliminar(Caja: Caja) {
    this._CajaServicio.eliminar(Caja.idCaja).subscribe({
      next: (data) => {

        if (data.status) {
          Swal.fire({
            icon: 'success',
            title: 'Caja Eliminada',
            text: `La Caja fue eliminado`,
          });
          // this._utilidadServicio.mostrarAlerta("La Caja fue eliminado","listo!");
          this.obtenerCaja();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `No se pudo eliminar la Caja`,
          });
          // this._utilidadServicio.mostrarAlerta("No se pudo eliminar la Caja","Error");

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
                  this.eliminar(Caja);
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

  abrirModalPrestamo(idCaja: number) {



    Swal.fire({
      title: '¿Metodo de prestamo?',
      input: 'radio',
      inputOptions: {
        realizar: 'Realizar Prestamo',
        pagar: 'Pagar Prestamo'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor selecciona una opción';
        }
        return undefined; // Devuelve undefined cuando no hay errores
      },
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === 'realizar') {


          // Inicializar las variables
          let idUsuario: number = 0;

          // Obtener el idUsuario del localStorage
          const usuarioString = localStorage.getItem('usuario');
          const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
          const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
          if (datosDesencriptados !== null) {
            const usuario = JSON.parse(datosDesencriptados);
            idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
          }

          console.log(this.idUsuarioCajaGeneral);
          // Verificar que se haya obtenido el idUsuario
          if (this.idUsuarioCajaGeneral !== 0) {
            this._CajaServicio.obtenerCajaGeneralPorUsuario(this.idUsuarioCajaGeneral).subscribe({
              next: (caja: Caja | null) => {
                const cajaActualizada: Caja = {
                  idCaja: idCaja,

                  estado: '',
                  nombreUsuario: '',
                  idUsuario: idUsuario
                };

                // Verificar si la idCaja obtenida del usuario coincide con la idCaja pasada como parámetro
                if (caja && caja.idCaja !== idCaja) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usted no puede realizar un préstamo en esta caja .'
                  });
                  return; // Detener la ejecución
                }

                // Obtener la información de la caja actual
                // const cajaActual = this.dataInicio.find(caja => caja.idCaja === idCaja);
                // Obtener la información de la caja actual
                const cajaActual2 = this.dataListaCaja.filteredData.find(caja => caja.idCaja === idCaja);

                // Verificar si la caja está cerrada
                if (cajaActual2 && cajaActual2.estado === 'Cerrada') {
                  // Mostrar un mensaje de advertencia si la caja está cerrada
                  Swal.fire({
                    icon: 'warning',
                    title: 'Caja Cerrada',
                    text: 'No se puede realizar un préstamo en una caja cerrada.'
                  });
                } else {
                  // Calcular el saldo disponible sumando el saldo inicial y los ingresos actuales
                  // const saldoDisponible = parseFloat(cajaActual2?.saldoInicialTexto || '0') +
                  //   parseFloat(cajaActual2?.ingresosTexto || '0');
                  // const resta = parseFloat(cajaActual2?.gastosTexto || '0') +
                  //   parseFloat(cajaActual2?.prestamosTexto || '0');
                  // const suma = saldoDisponible - resta;
                  const saldoDisponible = parseFloat(caja?.saldoInicial || '0') +
                    parseFloat(caja?.ingresos || '0');
                  const resta = parseFloat(caja?.gastos || '0') +
                    parseFloat(caja?.prestamos || '0');
                  const suma = saldoDisponible - resta;
                  console.log(suma);
                  const transferencia = parseFloat(caja?.transacciones || '0')

                  const saldoDisponible2 = suma;
                  // Mostrar el cuadro de diálogo para realizar el préstamo si el saldo disponible es suficiente
                  if (saldoDisponible2 >= 0) {
                    Swal.fire({
                      title: 'Realizar Préstamo',
                      html:
                        '<input id="prestamosTexto" class="swal2-input" placeholder="Valor del préstamo">' +
                        // '<input id="comentarios" class="swal2-input" placeholder="Comentario">',
                        '<textarea id="comentarios" class="swal2-textarea" placeholder="Comentario" style="height: 150px;"></textarea>' +
                        '<select id="tipo" class="swal2-select" style="margin-top: 10px; width: 55%;">' +
                        '<option value="" disabled selected>Selecciona el tipo de pago</option>' +
                        '<option value="Efectivo">Efectivo</option>' +
                        '<option value="Transferencia">Transferencia</option>' +
                        '</select>',
                      showCancelButton: true,
                      confirmButtonColor: '#1337E8',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Realizar Préstamo',
                      cancelButtonText: 'Cancelar',
                      preConfirm: () => {
                        const prestamosTexto = parseFloat((<HTMLInputElement>document.getElementById('prestamosTexto')).value);
                        const comentarios = (<HTMLInputElement>document.getElementById('comentarios')).value;
                        const tipo = (<HTMLSelectElement>document.getElementById('tipo')).value;

                        if (tipo == "Efectivo") {
                          // Verificar si el saldo disponible es mayor o igual al valor del préstamo
                          if (saldoDisponible2 >= prestamosTexto) {
                            // Realizar el préstamo
                            const estado = "prestamo"
                            this.realizarPrestamo(idCaja, prestamosTexto, comentarios, estado, tipo);
                          } else {
                            // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                            const saldoFormateado = saldoDisponible2.toLocaleString('es-CO');
                            Swal.fire({
                              icon: 'error',
                              title: 'Saldo Insuficiente',
                              text: `El saldo disponible $ ${saldoFormateado} no es suficiente para realizar el préstamo.`
                            });

                          }
                        } else {
                          // Verificar si el saldo disponible es mayor o igual al valor del préstamo
                          if (transferencia >= prestamosTexto) {
                            // Realizar el préstamo
                            const estado = "prestamo"
                            this.realizarPrestamo(idCaja, prestamosTexto, comentarios, estado, tipo);
                          } else {
                            // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                            const saldoFormateado = transferencia.toLocaleString('es-CO');
                            Swal.fire({
                              icon: 'error',
                              title: 'Saldo Insuficiente',
                              text: `El saldo disponible $ ${saldoFormateado} no es suficiente para realizar el préstamo.`
                            });

                          }
                        }

                      }
                    });
                  } else {
                    // Mostrar un mensaje de advertencia si no se puede calcular el saldo disponible
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'No se pudo calcular el saldo disponible.'
                    });
                  }
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
                          this.abrirModalPrestamo(idCaja);
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
              complete: () => {



              }
            });
          }


        } else if (result.value === 'pagar') {


          // Inicializar las variables
          let idUsuario: number = 0;

          // Obtener el idUsuario del localStorage
          const usuarioString = localStorage.getItem('usuario');
          const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
          const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
          if (datosDesencriptados !== null) {
            const usuario = JSON.parse(datosDesencriptados);
            idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
          }


          // Verificar que se haya obtenido el idUsuario
          if (this.idUsuarioCajaGeneral !== 0) {
            this._CajaServicio.obtenerCajaGeneralPorUsuario(this.idUsuarioCajaGeneral).subscribe({
              next: (caja: Caja | null) => {
                const cajaActualizada: Caja = {
                  idCaja: idCaja,

                  estado: '',
                  nombreUsuario: '',
                  idUsuario: idUsuario
                };

                // Verificar si la idCaja obtenida del usuario coincide con la idCaja pasada como parámetro
                if (caja && caja.idCaja !== idCaja) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usted no puede realizar un préstamo en esta caja .'
                  });
                  return; // Detener la ejecución
                }

                // Obtener la información de la caja actual
                // const cajaActual = this.dataInicio.find(caja => caja.idCaja === idCaja);
                // Obtener la información de la caja actual
                const cajaActual2 = this.dataListaCaja.filteredData.find(caja => caja.idCaja === idCaja);

                // Verificar si la caja está cerrada
                if (cajaActual2 && cajaActual2.estado === 'Cerrada') {
                  // Mostrar un mensaje de advertencia si la caja está cerrada
                  Swal.fire({
                    icon: 'warning',
                    title: 'Caja Cerrada',
                    text: 'No se puede realizar un préstamo en una caja cerrada.'
                  });
                } else {
                  // Calcular el saldo disponible sumando el saldo inicial y los ingresos actuales
                  const saldoDisponible = parseFloat(caja?.saldoInicial || '0') +
                    parseFloat(caja?.ingresos || '0');
                  const resta = parseFloat(caja?.gastos || '0') +
                    parseFloat(caja?.prestamos || '0');
                  const suma = saldoDisponible - resta;

                  const transferencia = parseFloat(caja?.transacciones || '0')

                  const saldoDisponible2 = suma;
                  // Mostrar el cuadro de diálogo para realizar el préstamo si el saldo disponible es suficiente
                  //  if (saldoDisponible2 >= 0) {
                  Swal.fire({
                    title: 'Realizar Pago',
                    html:
                      '<input id="prestamosTexto" class="swal2-input" placeholder="Valor del pago">' +
                      // '<input id="comentarios" class="swal2-input" placeholder="Comentario">',
                      '<textarea id="comentarios" class="swal2-textarea" placeholder="Comentario" style="height: 150px;"></textarea>' +
                      '<select id="tipo" class="swal2-select" style="margin-top: 10px; width: 57%;">' +
                      '<option value="" disabled selected>Selecciona el tipo de pago</option>' +
                      '<option value="Efectivo">Efectivo</option>' +
                      '<option value="Transferencia">Transferencia</option>' +
                      '</select>',
                    showCancelButton: true,
                    confirmButtonColor: '#1337E8',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Realizar Pago',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                      const prestamosTexto = parseFloat((<HTMLInputElement>document.getElementById('prestamosTexto')).value);
                      const comentarios = (<HTMLInputElement>document.getElementById('comentarios')).value;
                      const tipo = (<HTMLSelectElement>document.getElementById('tipo')).value;
                      // Verificar si el saldo disponible es mayor o igual al valor del préstamo
                      //  if (saldoDisponible2 >= prestamosTexto) {
                      // Realizar el préstamo
                      const estado = "pagar"
                      this.pagarPrestamo(idCaja, prestamosTexto, comentarios, estado, tipo);
                      //  } else {
                      //    // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                      //    const saldoFormateado = saldoDisponible2.toLocaleString('es-CO');
                      //    Swal.fire({
                      //      icon: 'error',
                      //      title: 'Saldo Insuficiente',
                      //      text: `El saldo disponible $ ${saldoFormateado} no es suficiente para realizar el préstamo.`
                      //    });

                      //  }
                    }
                  });
                  //  } else {
                  //    // Mostrar un mensaje de advertencia si no se puede calcular el saldo disponible
                  //    Swal.fire({
                  //      icon: 'error',
                  //      title: 'Error',
                  //      text: 'No se pudo calcular el saldo disponible.'
                  //    });
                  //  }
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
                          this.abrirModalPrestamo(idCaja);
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
              complete: () => {



              }
            });
          }



        }
      }
    });

  }


  abrirModalPrestamoCajaGeneral(idCaja: number) {



    Swal.fire({
      title: '¿Metodo de prestamo a la caja general?',
      input: 'radio',
      inputOptions: {
        realizar: 'Realizar Prestamo',
        pagar: 'Pagar Prestamo'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor selecciona una opción';
        }
        return undefined; // Devuelve undefined cuando no hay errores
      },
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === 'realizar') {


          // Inicializar las variables
          let idUsuario: number = 0;

          // Obtener el idUsuario del localStorage
          const usuarioString = localStorage.getItem('usuario');
          const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
          const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
          if (datosDesencriptados !== null) {
            const usuario = JSON.parse(datosDesencriptados);
            idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
          }


          // Verificar que se haya obtenido el idUsuario
          if (this.idUsuarioCajaGeneral !== 0) {
            this._CajaServicio.obtenerCajaGeneralPorUsuario(this.idUsuarioCajaGeneral).subscribe({
              next: (caja: Caja | null) => {
                const cajaActualizada: Caja = {
                  idCaja: idCaja,

                  estado: '',
                  nombreUsuario: '',
                  idUsuario: idUsuario
                };

                // Verificar si la idCaja obtenida del usuario coincide con la idCaja pasada como parámetro
                if (caja && caja.idCaja !== idCaja) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usted no puede realizar un préstamo en esta caja .'
                  });
                  return; // Detener la ejecución
                }

                // Obtener la información de la caja actual
                // const cajaActual = this.dataInicio.find(caja => caja.idCaja === idCaja);
                // Obtener la información de la caja actual
                // const cajaActual2 = this.dataListaCaja.filteredData.find(caja => caja.idCaja === idCaja);

                // Verificar si la caja está cerrada
                if (caja && caja.estado === 'Cerrada') {
                  // Mostrar un mensaje de advertencia si la caja está cerrada
                  Swal.fire({
                    icon: 'warning',
                    title: 'Caja Cerrada',
                    text: 'No se puede realizar un préstamo en una caja cerrada.'
                  });
                } else {
                  // Calcular el saldo disponible sumando el saldo inicial y los ingresos actuales
                  const saldoDisponible = parseFloat(caja?.saldoInicial || '0') +
                    parseFloat(caja?.ingresos || '0');
                  const resta = parseFloat(caja?.gastos || '0') +
                    parseFloat(caja?.prestamos || '0');
                  const suma = saldoDisponible - resta;

                  const transferencia = parseFloat(caja?.transacciones || '0')

                  const saldoDisponible2 = suma;
                  // Mostrar el cuadro de diálogo para realizar el préstamo si el saldo disponible es suficiente
                  // if (saldoDisponible2 >= 0) {
                  Swal.fire({
                    title: 'Realizar Préstamo',
                    html:
                      '<input id="prestamosTexto" class="swal2-input" placeholder="Valor del préstamo">' +
                      // '<input id="comentarios" class="swal2-input" placeholder="Comentario">',
                      '<select id="tipo" class="swal2-select" style="margin-top: 10px; width: 55%;">' +

                      '<option value="Efectivo">Efectivo</option>' +
                      '<option value="Transferencia">Transferencia</option>' +
                      '</select>' +
                      '<textarea id="comentarios" class="swal2-textarea" placeholder="Comentario" style="height: 150px;"></textarea>',
                    showCancelButton: true,
                    confirmButtonColor: '#1337E8',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Realizar Préstamo',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                      const prestamosTexto = parseFloat((<HTMLInputElement>document.getElementById('prestamosTexto')).value);
                      const comentarios = (<HTMLInputElement>document.getElementById('comentarios')).value;
                      const tipo = (<HTMLSelectElement>document.getElementById('tipo')).value;
                      // Verificar si el saldo disponible es mayor o igual al valor del préstamo




                      // if (saldoDisponible2 >= prestamosTexto) {
                      // Realizar el préstamo
                      const estado = "prestamo"
                      this.realizarPrestamoCajaGeneral(idCaja, prestamosTexto, comentarios, estado, tipo);
                      // } else {
                      //   // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                      //   const saldoFormateado = saldoDisponible2.toLocaleString('es-CO');
                      //   Swal.fire({
                      //     icon: 'error',
                      //     title: 'Saldo Insuficiente',
                      //     text: `El saldo disponible $ ${saldoFormateado} no es suficiente para realizar el préstamo.`
                      //   });

                      // }
                    }
                  });
                  // } else {
                  //   // Mostrar un mensaje de advertencia si no se puede calcular el saldo disponible
                  //   Swal.fire({
                  //     icon: 'error',
                  //     title: 'Error',
                  //     text: 'No se pudo calcular el saldo disponible.'
                  //   });
                  // }
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
                          this.abrirModalPrestamo(idCaja);
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
              complete: () => {



              }
            });
          }


        } else if (result.value === 'pagar') {


          // Inicializar las variables
          let idUsuario: number = 0;

          // Obtener el idUsuario del localStorage
          const usuarioString = localStorage.getItem('usuario');
          const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
          const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
          if (datosDesencriptados !== null) {
            const usuario = JSON.parse(datosDesencriptados);
            idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
          }

          this.idUsuarioCajaGeneral

          console.log('ID del primer elemento:', this.idUsuarioCajaGeneral);

          // Verificar que se haya obtenido el idUsuario
          if (this.idUsuarioCajaGeneral !== 0) {
            this._CajaServicio.obtenerCajaGeneralPorUsuario(this.idUsuarioCajaGeneral).subscribe({
              next: (caja: Caja | null) => {
                const cajaActualizada: Caja = {
                  idCaja: idCaja,

                  estado: '',
                  nombreUsuario: '',
                  idUsuario: idUsuario
                };

                // Verificar si la idCaja obtenida del usuario coincide con la idCaja pasada como parámetro
                if (caja && caja.idCaja !== idCaja) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usted no puede realizar un préstamo en esta caja .'
                  });
                  return; // Detener la ejecución
                }

                // Obtener la información de la caja actual
                // const cajaActual = this.dataInicio.find(caja => caja.idCaja === idCaja);
                // Obtener la información de la caja actual
                // const cajaActual2 = this.dataListaCajaGeneral.filteredData.find(caja => caja.idCaja === idCaja);

                // Verificar si la caja está cerrada
                if (caja && caja.estado === 'Cerrada') {
                  // Mostrar un mensaje de advertencia si la caja está cerrada
                  Swal.fire({
                    icon: 'warning',
                    title: 'Caja Cerrada',
                    text: 'No se puede realizar un préstamo en una caja cerrada.'
                  });
                } else {
                  // Calcular el saldo disponible sumando el saldo inicial y los ingresos actuales
                  // const saldoDisponible = parseFloat(cajaActual2?.saldoInicialTexto || '0') +
                  //   parseFloat(cajaActual2?.ingresosTexto || '0');
                  // const resta = parseFloat(cajaActual2?.gastosTexto || '0') +
                  //   parseFloat(cajaActual2?.prestamosTexto || '0');
                  // const suma = saldoDisponible - resta;

                  const saldoDisponible = parseFloat(caja?.saldoInicial || '0') +
                    parseFloat(caja?.ingresos || '0');
                  const resta = parseFloat(caja?.gastos || '0') +
                    parseFloat(caja?.prestamos || '0');
                  const suma = saldoDisponible - resta;

                  const transferencia = parseFloat(caja?.transacciones || '0')

                  const saldoDisponible2 = suma;
                  // Mostrar el cuadro de diálogo para realizar el préstamo si el saldo disponible es suficiente
                  //  if (saldoDisponible2 >= 0) {
                  Swal.fire({
                    title: 'Realizar Pago',
                    html:
                      '<input id="prestamosTexto" class="swal2-input" placeholder="Valor del pago">' +
                      // '<input id="comentarios" class="swal2-input" placeholder="Comentario">',
                      '<select id="tipo" class="swal2-select" style="margin-top: 10px; width: 55%;">' +

                      '<option value="Efectivo">Efectivo</option>' +
                      '<option value="Transferencia">Transferencia</option>' +
                      '</select>' +
                      '<textarea id="comentarios" class="swal2-textarea" placeholder="Comentario" style="height: 150px;"></textarea>',

                    showCancelButton: true,
                    confirmButtonColor: '#1337E8',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Realizar Pago',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                      const prestamosTexto = parseFloat((<HTMLInputElement>document.getElementById('prestamosTexto')).value);
                      const comentarios = (<HTMLInputElement>document.getElementById('comentarios')).value;
                      const tipo = (<HTMLSelectElement>document.getElementById('tipo')).value;
                      // Verificar si el saldo disponible es mayor o igual al valor del préstamo

                      if (tipo == "Efectivo") {

                        if (saldoDisponible2 >= prestamosTexto) {
                          // Realizar el préstamo
                          const estado = "pagar"
                          this.pagarPrestamoCajaGeneral(idCaja, prestamosTexto, comentarios, estado, tipo);

                        } else {
                          // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                          const saldoFormateado = saldoDisponible2.toLocaleString('es-CO');
                          Swal.fire({
                            icon: 'error',
                            title: 'Saldo Insuficiente para pagar por efectivo',
                            text: `El saldo disponible $ ${saldoFormateado} no es suficiente para pagar el prestamo de la caja.`
                          });

                        }
                      } else {
                        if (transferencia >= prestamosTexto) {
                          // Realizar el préstamo
                          const estado = "pagar"
                          this.pagarPrestamoCajaGeneral(idCaja, prestamosTexto, comentarios, estado, tipo);

                        } else {
                          // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                          const saldoFormateado = transferencia.toLocaleString('es-CO');
                          Swal.fire({
                            icon: 'error',
                            title: 'Saldo Insuficiente para pagar por transferencia',
                            text: `El saldo disponible $ ${saldoFormateado} no es suficiente para pagar el prestamo de la caja.`
                          });

                        }

                      }


                    }
                  });
                  //  } else {
                  //    // Mostrar un mensaje de advertencia si no se puede calcular el saldo disponible
                  //    Swal.fire({
                  //      icon: 'error',
                  //      title: 'Error',
                  //      text: 'No se pudo calcular el saldo disponible.'
                  //    });
                  //  }
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
                          this.abrirModalPrestamoCajaGeneral(idCaja);
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
              complete: () => {



              }
            });
          }



        }
      }
    });

  }



  abrirModalPagoTrabajadores(idCaja: number) {



    Swal.fire({
      title: '¿Metodo de pago?',
      input: 'radio',
      inputOptions: {
        pagar: 'Pagar Trabajadores'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor selecciona una opción';
        }
        return undefined; // Devuelve undefined cuando no hay errores
      },
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === 'pagar') {


          // Inicializar las variables
          let idUsuario: number = 0;

          // Obtener el idUsuario del localStorage
          const usuarioString = localStorage.getItem('usuario');
          const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
          const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
          if (datosDesencriptados !== null) {
            const usuario = JSON.parse(datosDesencriptados);
            idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
          }

          // console.log("AQUIIIIIII", datosDesencriptados);
          // Verificar que se haya obtenido el idUsuario
          if (this.idUsuarioCajaGeneral !== 0) {
            this._CajaServicio.obtenerCajaGeneralPorUsuario(this.idUsuarioCajaGeneral).subscribe({
              next: (caja: Caja | null) => {

                console.log(caja);

                const cajaActualizada: Caja = {
                  idCaja: idCaja,

                  estado: '',
                  nombreUsuario: '',
                  idUsuario: idUsuario
                };

                // Verificar si la idCaja obtenida del usuario coincide con la idCaja pasada como parámetro
                if (caja && caja.idCaja !== idCaja) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usted no puede realizar un préstamo en esta caja .'
                  });
                  return; // Detener la ejecución
                }

                // Obtener la información de la caja actual
                // const cajaActual = this.dataInicio.find(caja => caja.idCaja === idCaja);
                // Obtener la información de la caja actual
                // const cajaActual2 = this.dataListaCajaGeneral.filteredData.find(caja => caja.idCaja === idCaja);

                // Verificar si la caja está cerrada
                if (caja && caja.estado === 'Cerrada') {
                  // Mostrar un mensaje de advertencia si la caja está cerrada
                  Swal.fire({
                    icon: 'warning',
                    title: 'Caja Cerrada',
                    text: 'No se puede realizar un préstamo en una caja cerrada.'
                  });
                } else {
                  // Calcular el saldo disponible sumando el saldo inicial y los ingresos actuales
                  const saldoDisponible = parseFloat(caja?.saldoInicial || '0') +
                    parseFloat(caja?.ingresos || '0');
                  const resta = parseFloat(caja?.gastos || '0') +
                    parseFloat(caja?.prestamos || '0');
                  const suma = saldoDisponible - resta;

                  const transferencia = parseFloat(caja?.transacciones || '0')

                  const saldoDisponible2 = suma;
                  // Mostrar el cuadro de diálogo para realizar el préstamo si el saldo disponible es suficiente
                  //  if (saldoDisponible2 >= 0) {
                  Swal.fire({
                    title: 'Realizar Pago',
                    html:
                      '<input id="prestamosTexto" class="swal2-input" placeholder="Valor del pago">' +
                      // '<input id="comentarios" class="swal2-input" placeholder="Comentario">',
                      '<select id="tipo" class="swal2-select" style="margin-top: 10px; width: 55%;">' +
                      '<option value="Efectivo">Efectivo</option>' +
                      '<option value="Transferencia">Transferencia</option>' +
                      '</select>' +
                      '<input id="nombreTrabajador" class="swal2-input" placeholder="Nombre del trabajador">' +
                      '<textarea id="comentarios" class="swal2-textarea" placeholder="Comentario" style="height: 150px;"></textarea>',

                    showCancelButton: true,
                    confirmButtonColor: '#1337E8',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Realizar Pago',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                      const prestamosTexto = parseFloat((<HTMLInputElement>document.getElementById('prestamosTexto')).value);
                      const comentarios = (<HTMLInputElement>document.getElementById('comentarios')).value;
                      const nombre = (<HTMLInputElement>document.getElementById('nombreTrabajador')).value;
                      const tipo = (<HTMLSelectElement>document.getElementById('tipo')).value;
                      // Verificar si el saldo disponible es mayor o igual al valor del préstamo
                      if (tipo == "Efectivo") {

                        if (saldoDisponible2 >= prestamosTexto) {
                          // Realizar el préstamo


                          const estado = "pagoTrabajadores"
                          this.pagarTrabajadores(idCaja, prestamosTexto, comentarios, estado, nombre, tipo);
                        } else {
                          //    // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                          const saldoFormateado = saldoDisponible2.toLocaleString('es-CO');
                          Swal.fire({
                            icon: 'error',
                            title: 'Saldo Insuficiente para efectivo',
                            text: `El saldo disponible $ ${saldoFormateado} no es suficiente para realizar el pago del trabajador.`
                          });

                        }

                      } else {
                        if (transferencia >= prestamosTexto) {
                          // Realizar el préstamo


                          const estado = "pagoTrabajadores"
                          this.pagarTrabajadores(idCaja, prestamosTexto, comentarios, estado, nombre, tipo);
                        } else {
                          //    // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                          const saldoFormateado = transferencia.toLocaleString('es-CO');
                          Swal.fire({
                            icon: 'error',
                            title: 'Saldo Insuficiente para transferencia',
                            text: `El saldo disponible $ ${saldoFormateado} no es suficiente para realizar el pago del trabajador.`
                          });

                        }


                      }



                    }
                  });
                  //  } else {
                  //    // Mostrar un mensaje de advertencia si no se puede calcular el saldo disponible
                  //    Swal.fire({
                  //      icon: 'error',
                  //      title: 'Error',
                  //      text: 'No se pudo calcular el saldo disponible.'
                  //    });
                  //  }
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
                          this.abrirModalPrestamo(idCaja);
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
              complete: () => {



              }
            });
          }



        }
      }
    });

  }


  abrirModalGastosVariados(idCaja: number) {



    Swal.fire({
      title: '¿Metodo de pago?',
      input: 'radio',
      inputOptions: {
        gastos: 'Gastos Variado'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor selecciona una opción';
        }
        return undefined; // Devuelve undefined cuando no hay errores
      },
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === 'gastos') {


          // Inicializar las variables
          let idUsuario: number = 0;

          // Obtener el idUsuario del localStorage
          const usuarioString = localStorage.getItem('usuario');
          const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
          const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
          if (datosDesencriptados !== null) {
            const usuario = JSON.parse(datosDesencriptados);
            idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
          }


          // Verificar que se haya obtenido el idUsuario
          if (this.idUsuarioCajaGeneral !== 0) {
            this._CajaServicio.obtenerCajaGeneralPorUsuario(this.idUsuarioCajaGeneral).subscribe({
              next: (caja: Caja | null) => {
                const cajaActualizada: Caja = {
                  idCaja: idCaja,

                  estado: '',
                  nombreUsuario: '',
                  idUsuario: idUsuario
                };

                // Verificar si la idCaja obtenida del usuario coincide con la idCaja pasada como parámetro
                if (caja && caja.idCaja !== idCaja) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Usted no puede realizar un préstamo en esta caja .'
                  });
                  return; // Detener la ejecución
                }

                // Obtener la información de la caja actual
                // const cajaActual = this.dataInicio.find(caja => caja.idCaja === idCaja);
                // Obtener la información de la caja actual
                // const cajaActual2 = this.dataListaCajaGeneral.filteredData.find(caja => caja.idCaja === idCaja);

                // Verificar si la caja está cerrada
                if (caja && caja.estado === 'Cerrada') {
                  // Mostrar un mensaje de advertencia si la caja está cerrada
                  Swal.fire({
                    icon: 'warning',
                    title: 'Caja Cerrada',
                    text: 'No se puede realizar un préstamo en una caja cerrada.'
                  });
                } else {
                  // Calcular el saldo disponible sumando el saldo inicial y los ingresos actuales
                  // const saldoDisponible = parseFloat(cajaActual2?.saldoInicialTexto || '0') +
                  //   parseFloat(cajaActual2?.ingresosTexto || '0');
                  // const resta = parseFloat(cajaActual2?.gastosTexto || '0') +
                  //   parseFloat(cajaActual2?.prestamosTexto || '0');
                  // const suma = saldoDisponible - resta;
                  const saldoDisponible = parseFloat(caja?.saldoInicial || '0') +
                    parseFloat(caja?.ingresos || '0');
                  const resta = parseFloat(caja?.gastos || '0') +
                    parseFloat(caja?.prestamos || '0');
                  const suma = saldoDisponible - resta;

                  const transferencia = parseFloat(caja?.transacciones || '0')

                  const saldoDisponible2 = suma;
                  // Mostrar el cuadro de diálogo para realizar el préstamo si el saldo disponible es suficiente
                  //  if (saldoDisponible2 >= 0) {
                  Swal.fire({
                    title: 'Realizar Gasto',
                    html:
                      '<select id="tipoGasto" class="swal2-select" style="margin-top: 10px; width: 55%;">' +

                      '<option value="Pago aplicativo">Pago aplicativo</option>' +
                      '<option value="Pago teléfono móvil">Pago teléfono móvil</option>' +
                      '<option value="Pago cuota moto">Pago cuota moto</option>' +
                      '<option value="Pago gasolina moto">Pago gasolina moto</option>' +
                      '<option value="Pago panaderia">Pago panaderia</option>' +
                      '<option value="Pago de salud">Pago de salud</option>' +
                      '<option value="Variados">Pagos variados</option>' +

                      '</select>' +
                      '<input id="prestamosTexto" class="swal2-input" placeholder="Valor del pago">' +
                      // '<input id="comentarios" class="swal2-input" placeholder="Comentario">',
                      '<select id="tipo" class="swal2-select" style="margin-top: 10px; width: 55%;">' +

                      '<option value="Efectivo">Efectivo</option>' +
                      '<option value="Transferencia">Transferencia</option>' +
                      '</select>' +

                      '<textarea id="comentarios" class="swal2-textarea" placeholder="Comentario" style="height: 150px;"></textarea>',

                    showCancelButton: true,
                    confirmButtonColor: '#1337E8',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Realizar Gasto',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                      const prestamosTexto = parseFloat((<HTMLInputElement>document.getElementById('prestamosTexto')).value);
                      const comentarios = (<HTMLInputElement>document.getElementById('comentarios')).value;
                      // const nombre = (<HTMLInputElement>document.getElementById('nombreTrabajador')).value;
                      const tipo = (<HTMLSelectElement>document.getElementById('tipo')).value;
                      // Verificar si el saldo disponible es mayor o igual al valor del préstamo
                      const estado = (<HTMLSelectElement>document.getElementById('tipoGasto')).value;

                      if (tipo == "Efectivo") {
                        if (saldoDisponible2 >= prestamosTexto) {
                          // Realizar el préstamo


                          // const estado = "pagar"


                          this.pagarVariados(idCaja, prestamosTexto, comentarios, estado, tipo);
                        } else {
                          // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                          const saldoFormateado = saldoDisponible2.toLocaleString('es-CO');
                          Swal.fire({
                            icon: 'error',
                            title: 'Saldo Insuficiente',
                            text: `El saldo disponible $ ${saldoFormateado} no es suficiente para realizar el gasto en efectivo.`
                          });

                        }
                      } else {


                        if (transferencia >= prestamosTexto) {
                          // Realizar el préstamo

                          // const estado = "pagar"


                          this.pagarVariados(idCaja, prestamosTexto, comentarios, estado, tipo);
                        } else {
                          // Mostrar un mensaje de advertencia si el saldo disponible es insuficiente
                          const saldoFormateado = transferencia.toLocaleString('es-CO');
                          Swal.fire({
                            icon: 'error',
                            title: 'Saldo Insuficiente',
                            text: `El saldo disponible $ ${saldoFormateado} no es suficiente para realizar  el gasto en transferencia.`
                          });

                        }


                      }

                    }
                  });
                  //  } else {
                  //    // Mostrar un mensaje de advertencia si no se puede calcular el saldo disponible
                  //    Swal.fire({
                  //      icon: 'error',
                  //      title: 'Error',
                  //      text: 'No se pudo calcular el saldo disponible.'
                  //    });
                  //  }
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
                          this.abrirModalGastosVariados(idCaja);
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
              complete: () => {



              }
            });
          }



        }
      }
    });

  }



  //original
  // abrirModalPrestamo(idCaja: number) {
  //   // Obtener la información de la caja actual
  //   const cajaActual = this.dataInicio.find(caja => caja.idCaja === idCaja);

  //   // Verificar si la caja está cerrada
  //   if (cajaActual && cajaActual.estado === 'Cerrada') {
  //     // Mostrar un mensaje de advertencia si la caja está cerrada
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Caja Cerrada',
  //       text: 'No se puede realizar un préstamo en una caja cerrada.'
  //     });
  //   } else {
  //     // Mostrar el cuadro de diálogo para realizar el préstamo si la caja está abierta
  //     Swal.fire({
  //       title: 'Realizar Préstamo',
  //       html:
  //         '<input id="prestamosTexto" class="swal2-input" placeholder="Valor del préstamo">' +
  //         '<input id="comentarios" class="swal2-input" placeholder="Comentario">',
  //       showCancelButton: true,
  //       confirmButtonText: 'Realizar Préstamo',
  //       cancelButtonText: 'Cancelar',
  //       preConfirm: () => {
  //         const prestamosTexto = parseFloat((<HTMLInputElement>document.getElementById('prestamosTexto')).value);
  //         const comentarios = (<HTMLInputElement>document.getElementById('comentarios')).value;
  //         this.realizarPrestamo(idCaja, prestamosTexto, comentarios);
  //       }
  //     });
  //   }
  // }
  // abrirModalPrestamo(idCaja: number) {
  //   // Obtener la información de la caja actual
  //   const cajaIndex = this.dataInicio.findIndex(caja => caja.idCaja === idCaja);

  //   // Verificar si cajaIndex es -1, lo que significa que no se encontró ninguna coincidencia
  //   if (cajaIndex === -1) {
  //     console.error(`La caja con idCaja ${idCaja} no existe en this.dataInicio`);
  //     return; // Salir de la función si no se encontró ninguna coincidencia
  //   }

  //   // Asignar el valor de la caja encontrada a cajaActual
  //   const cajaActual = this.dataInicio[cajaIndex];
  //   // Verificar si la caja está cerrada
  //   if (cajaActual && cajaActual.estado === 'Cerrada') {
  //     // Mostrar un mensaje de advertencia si la caja está cerrada
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Caja Cerrada',
  //       text: 'No se puede realizar un préstamo en una caja cerrada.'
  //     });
  //   } else {
  //     // Mostrar el cuadro de diálogo para realizar el préstamo si la caja está abierta
  //     Swal.fire({
  //       title: 'Realizar Préstamo',
  //       html:
  //         '<input id="prestamosTexto" class="swal2-input" placeholder="Valor del préstamo">' +
  //         '<input id="comentarios" class="swal2-input" placeholder="Comentario">',
  //       showCancelButton: true,
  //       confirmButtonText: 'Realizar Préstamo',
  //       cancelButtonText: 'Cancelar',
  //       preConfirm: () => {
  //         const prestamosTexto = parseFloat((<HTMLInputElement>document.getElementById('prestamosTexto')).value);
  //         const comentarios = (<HTMLInputElement>document.getElementById('comentarios')).value;

  //         // Verificar si cajaActual.saldoFinalTexto no es undefined y es convertible a un número
  //         if (cajaActual && cajaActual.saldoInicialTexto !== undefined && !isNaN(parseFloat(cajaActual.saldoInicialTexto))) {
  //           const saldoFinal = parseFloat(cajaActual.saldoInicialTexto);

  //           // Verificar si el valor del préstamo es mayor que el saldo inicial de la caja
  //           if (prestamosTexto > saldoFinal) {
  //             Swal.fire({
  //               icon: 'error',
  //               title: 'Error',
  //               text: 'El valor del préstamo no puede ser mayor que el saldo inicial de la caja.'
  //             });
  //             return false; // Cancelar el envío del formulario
  //           }
  //         } else {
  //           // Manejar el caso en el que cajaActual.saldoFinalTexto no es un número válido
  //           Swal.fire({
  //             icon: 'error',
  //             title: 'Error',
  //             text: 'El saldo  de la caja no te alcanza para prestar.'
  //           });
  //           return false; // Cancelar el envío del formulario
  //         }

  //         // Si no se ejecuta ninguna de las condiciones anteriores, se asume que todas las validaciones son exitosas
  //         // y se puede proceder con el préstamo.
  //         this.realizarPrestamo(idCaja, prestamosTexto, comentarios);

  //         // Devolver true para indicar que la función preConfirm ha terminado correctamente
  //         return true;
  //       }
  //     });
  //   }
  // }


  realizarPrestamo(idCaja: number, prestamosTexto: number, comentarios: string, estado: string, tipo: string) {
    this._CajaServicio.realizarPrestamo(idCaja, prestamosTexto, comentarios, estado, tipo).subscribe(
      () => {
        Swal.fire('Préstamo realizado con éxito', '', 'success');
        // Aquí puedes agregar lógica adicional después de realizar el préstamo, como volver a cargar la lista de cajas

        this.obtenercajaGeneral();
      },
      error => {
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
                  this.realizarPrestamo(idCaja, prestamosTexto, comentarios, estado, tipo);
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

  pagarPrestamo(idCaja: number, prestamosTexto: number, comentarios: string, estado: string, tipo: string) {
    this._CajaServicio.pagarPrestamo(idCaja, prestamosTexto, comentarios, estado, tipo).subscribe(
      () => {
        Swal.fire('Préstamo realizado con éxito', '', 'success');
        // Aquí puedes agregar lógica adicional después de realizar el préstamo, como volver a cargar la lista de cajas

        this.obtenercajaGeneral();
      },
      error => {
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
                  this.pagarPrestamo(idCaja, prestamosTexto, comentarios, estado, tipo);
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

  pagarTrabajadores(idCaja: number, prestamosTexto: number, comentarios: string, estado: string, nombre: string, tipo: string) {
    this._CajaServicio.pagoTrabajadores(idCaja, prestamosTexto, comentarios, estado, nombre, tipo).subscribe(
      () => {
        Swal.fire('Préstamo realizado con éxito', '', 'success');
        // Aquí puedes agregar lógica adicional después de realizar el préstamo, como volver a cargar la lista de cajas

        this.obtenercajaGeneral();
      },
      error => {
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
                  this.pagarTrabajadores(idCaja, prestamosTexto, comentarios, estado, nombre, tipo);
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

  pagarVariados(idCaja: number, prestamosTexto: number, comentarioVariados: string, estado: string, tipo: string) {
    this._CajaServicio.pagosVariados(idCaja, prestamosTexto, comentarioVariados, estado, tipo).subscribe(
      () => {
        Swal.fire('Pago realizado con éxito', '', 'success');
        this.obtenercajaGeneral(); // recargar tabla o lista
      },
      error => {
        let idUsuario: number = 0;

        // Obtener el idUsuario del localStorage
        const usuarioString = localStorage.getItem('usuario');
        const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

        if (datosDesencriptados) {
          const usuario = JSON.parse(datosDesencriptados);
          idUsuario = usuario.idUsuario;

          this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
            (usuario: any) => {
              console.log('Usuario obtenido:', usuario);
              const refreshToken = usuario.refreshToken;

              this._usuarioServicio.renovarToken(refreshToken).subscribe(
                (response: any) => {
                  console.log('Token actualizado:', response.token);
                  localStorage.setItem('authToken', response.token);

                  // Reintentar el pago después de renovar el token
                  this.pagarVariados(idCaja, prestamosTexto, comentarioVariados, estado, tipo);
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


  realizarPrestamoCajaGeneral(idCaja: number, prestamosTexto: number, comentarios: string, estado: string, tipo: string) {
    this._CajaServicio.pedirPrestamo(idCaja, prestamosTexto, comentarios, estado, tipo).subscribe(
      () => {
        Swal.fire('Préstamo realizado con éxito', '', 'success');
        // Aquí puedes agregar lógica adicional después de realizar el préstamo, como volver a cargar la lista de cajas

        this.obtenercajaGeneral();
      },
      error => {
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
                  this.realizarPrestamoCajaGeneral(idCaja, prestamosTexto, comentarios, estado, tipo);
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

  pagarPrestamoCajaGeneral(idCaja: number, prestamosTexto: number, comentarios: string, estado: string, tipo: string) {
    this._CajaServicio.PagarPrestamo(idCaja, prestamosTexto, comentarios, estado, tipo).subscribe(
      () => {
        Swal.fire('Préstamo realizado con éxito', '', 'success');
        // Aquí puedes agregar lógica adicional después de realizar el préstamo, como volver a cargar la lista de cajas

        this.obtenercajaGeneral();
      },
      error => {
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
                  this.pagarPrestamoCajaGeneral(idCaja, prestamosTexto, comentarios, estado, tipo);
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

  // verPrestamo(caja: Caja): void {
  //   this.dialog.open(ModalPrestamosComponent, {
  //     data: {
  //       comentarios: caja.comentarios || 'No hay Prestamos',

  //     }
  //   });
  // }
  // verGastos(caja: Caja): void {
  //   this.dialog.open(ModalPrestamosComponent, {
  //     data: {
  //       comentarios: caja.comentariosGastos || 'No hay Gastos',

  //     }
  //   });
  // }
  // verDevoluciones(caja: Caja): void {
  //   this.dialog.open(ModalPrestamosComponent, {
  //     data: {
  //       comentarios: caja.comentariosDevoluciones || 'No hay Devoluciones',

  //     }
  //   });
  // }

  verComentario(tipo: 'prestamos' | 'gastos' | 'devoluciones' | 'prestamosCajaGeneral' | 'variados' | 'trabajadores', caja: Caja): void {
    let comentario = '';

    switch (tipo) {
      case 'prestamos':
        comentario = caja.comentarios || 'No hay Préstamos';
        break;
      case 'gastos':
        comentario = caja.comentariosGastos || 'No hay Gastos';
        break;
      case 'devoluciones':
        comentario = caja.comentariosDevoluciones || 'No hay Devoluciones';
        break;
      case 'prestamosCajaGeneral':
        comentario = caja.comentarioPrestamosCajaGeneral || 'No hay Préstamos Caja General';
        break;
      case 'variados':
        comentario = caja.comentarioVariados || 'No hay Comentarios Variados';
        break;
      case 'trabajadores':
        comentario = caja.comentariosTrabajadores || 'No hay Comentarios de Trabajadores';
        break;
    }

    this.dialog.open(ModalPrestamosComponent, {
      data: {
        comentarios: comentario
      }
    });
  }




}
