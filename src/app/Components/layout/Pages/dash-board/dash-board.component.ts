import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { VerImagenProductoModalComponent } from '../../Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { Chart, registerables } from 'Chart.js'
import { DashBoardService } from '../../../../Services/dash-board.service';
import { from } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import moment from 'moment';
import Swal from 'sweetalert2';
import { EmpresaService } from '../../../../Services/empresa.service';
import { Empresa } from '../../../../Interfaces/empresa';
import { CajaService } from '../../../../Services/caja.service';
import { Caja } from '../../../../Interfaces/caja';
import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
import { CellHookData } from 'jspdf-autotable';

Chart.register(...registerables);


@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.css',
  animations: [
    trigger('productoHighlight', [
      state('highlighted-1', style({
        transform: 'scale(1.1)',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
        border: '12px solid #FFD700',
      })),
      state('highlighted-2', style({
        transform: 'scale(1.1)',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
        border: '12px solid #C0C0C0',
      })),
      state('highlighted-3', style({
        transform: 'scale(1.1)',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
        border: '12px solid #cd7f32',
      })),
      transition('* => highlighted-1', animate('300ms ease-out')),
      transition('* => highlighted-2', animate('300ms ease-out')),
      transition('* => highlighted-3', animate('300ms ease-out')),
    ]),
  ],
})

export class DashBoardComponent implements OnInit {
  @ViewChild('tablaProductos', { static: true }) tablaProductos!: ElementRef;

  totalIngresos: string = "0";
  totalVentas: string = "0";
  totalVentasAnio: string = "0";
  //Online
  totalVentasOnline: string = "0";
  totalVentasOnlineAnio: string = "0";
  //
  totalProductos: string = "0";
  totalProductosBodega: string = "0";
  totalProveedores: string = "0";
  totalUsuarios: string = "0";
  totalCliente: string = "0";
  totalGanancia: string = "0";
  totalProductosCantidad: string = "0";
  totalcompras: string = "0";
  totalComprasAnio: string = "0";
  productosMasVendidos: any[] = [];
  topProductosMasVendidos: any[] = [];
  totalVentasAnulada: string = "0";
  totalComprasAnulada: string = "0";
  // Agrega una propiedad para controlar la visibilidad de la tabla
  mostrarTabla: boolean = false;
  // Agrega una propiedad para almacenar todos los productos
  todosProductosMasVendidos: any[] = [];
  totalCompraProductosCantidad: string = "0";
  TotalCaja: string = "0";
  NombreCaja: string = "No Registrado";
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  totalEgresos: string = "0";
  myChart: Chart | undefined;
  productosPorPagina = 5;
  paginaActual = 1;
  filtro = '';
  isMobile: boolean = false;
  constructor(
    private _dashboardServicio: DashBoardService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private elRef: ElementRef,
    private empresaService: EmpresaService,
    private cajaService: CajaService,
    private _usuarioServicio: UsuariosService,
  ) {


  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) { // Especificamos el tipo de evento
    this.checkMobile();
  }


  ngOnInit(): void {

    this.checkMobile();

    this._dashboardServicio.resumen().subscribe({
      next: (data) => {

        if (data.status) {

          this.totalIngresos = data.value.totalIngresos;
          this.totalVentas = data.value.totalVentas;
          this.totalVentasAnio = data.value.totalVentasAnio;
          //Online
          this.totalVentasOnline = data.value.totalVentasOnline;
          this.totalVentasOnlineAnio = data.value.totalVentasOnlineAnio;
          //
          this.totalProductos = data.value.totalProductos;
          this.totalProductosBodega = data.value.totalProductosBodega;
          this.totalCliente = data.value.totalCliente;
          this.totalProveedores = data.value.totalProveedores;
          this.totalUsuarios = data.value.totalUsuarios;
          this.totalGanancia = data.value.totalGanancia;
          // this.totalcompras = data.value.totalcompras;
          this.totalProductosCantidad = data.value.totalProductosCantidad;
          // this.totalEgresos = data.value.totalEgresos;
          // this.totalCompraProductosCantidad = data.value.totalCompraProductosCantidad;
          this.totalVentasAnulada = data.value.totalVentasAnulada;
          // this.totalComprasAnulada = data.value.totalComprasAnulada;
          this.productosMasVendidos = data.value.productosMasVendidos;
          // // Actualizar solo los tres productos más vendidos
          // this.actualizarTopProductosMasVendidos();


          // Asignar los productos más vendidos
          if (data.value.productosMasVendidos && Array.isArray(data.value.productosMasVendidos)) {
            // Actualizar todos los productos
            this.todosProductosMasVendidos = [...data.value.productosMasVendidos];
            // Actualizar solo los tres primeros productos
            this.topProductosMasVendidos = [...this.todosProductosMasVendidos.slice(0, 3)];
            console.log('topProductosMasVendidos:', this.topProductosMasVendidos);
            // Llamar a renderizarGraficoDoughnut() después de asignar los datos
            // this.renderizarGraficoDoughnut();
          }

          this.renderizarGraficoDoughnut();
          //  // Asigna el valor antes de formatear
          //  this.totalGananciasProductos = data.value.totalGananciasProductos.toString();

          //  // Luego formatea la ganancia
          //  this.totalGananciasProductos = this.formatearNumero(this.totalGananciasProductos);
          const arrayData: any[] = data.value.ventasUltimaSemana;
          const arrayData2: any[] = data.value.ventasDoceMeses;
          //Online
          const arrayData3: any[] = data.value.ventasOnlineUltimaSemana;
          const arrayData4: any[] = data.value.ventasOnlineDoceMeses;
          //
          // const arrayData: any[] = data.value.ventasUltimaSemana.filter((value: { anulada: boolean }) => !value.anulada);

          const labelTemp = arrayData.map((value) => value.fecha);
          const dataTemp = arrayData.map((value) => value.total);
          this.mostrarGrafico(labelTemp, dataTemp)


          const labelTemp2 = arrayData2.map((value) => value.fecha);
          const dataTemp2 = arrayData2.map((value) => value.total);
          this.mostrarGraficoDoceMeses(labelTemp2, dataTemp2)

          //Online
          const labelTemp3 = arrayData3.map((value) => value.fecha);
          const dataTemp3 = arrayData3.map((value) => value.total);
          this.mostrarGraficoOnline(labelTemp3, dataTemp3)


          const labelTemp4 = arrayData4.map((value) => value.fecha);
          const dataTemp4 = arrayData4.map((value) => value.total);
          this.mostrarGraficoDoceMesesOnline(labelTemp4, dataTemp4)
          //Fin


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
                  this.GraficaVenta();
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
      complete: () => { }
    })

    this._dashboardServicio.resumenCompra().subscribe({
      next: (data) => {

        if (data.status) {

          // this.totalIngresos = data.value.totalIngresos;
          // // this.totalVentas = data.value.totalVentas;
          // this.totalProductos = data.value.totalProductos;
          // this.totalCliente = data.value.totalCliente;
          // this.totalProveedores = data.value.totalProveedores;
          // this.totalUsuarios = data.value.totalUsuarios;
          // this.totalGanancia = data.value.totalGanancia;
          this.totalComprasAnio = data.value.totalComprasAnio;
          this.totalcompras = data.value.totalcompras;
          // this.totalProductosCantidad = data.value.totalProductosCantidad;
          this.totalEgresos = data.value.totalEgresos;
          this.totalCompraProductosCantidad = data.value.totalCompraProductosCantidad;
          // this.totalVentasAnulada = data.value.totalVentasAnulada;
          this.totalComprasAnulada = data.value.totalComprasAnulada;
          // this.productosMasVendidos = data.value.productosMasVendidos;
          // // Actualizar solo los tres productos más vendidos
          // this.actualizarTopProductosMasVendidos();


          // Asignar los productos más vendidos
          // if (data.value.productosMasVendidos && Array.isArray(data.value.productosMasVendidos)) {
          //   // Actualizar todos los productos
          //   this.todosProductosMasVendidos = [...data.value.productosMasVendidos];
          //   // Actualizar solo los tres primeros productos
          //   this.topProductosMasVendidos = [...this.todosProductosMasVendidos.slice(0, 3)];
          // }



          const arrayData: any[] = data.value.compraDoceMeses;
          const arrayData2: any[] = data.value.compraUltimoMes;
          // const arrayData: any[] = data.value.ventasUltimaSemana.filter((value: { anulada: boolean }) => !value.anulada);

          const labelTemp = arrayData.map((value) => value.fecha);
          const dataTemp = arrayData.map((value) => value.total);
          this.mostrarGraficoDoceMesesCompra(labelTemp, dataTemp)
          // Suponiendo que hoy es '2024-04-18'


          const labelTemp2 = arrayData2.map((value) => value.fecha);
          const dataTemp2 = arrayData2.map((value) => value.total);
          this.mostrarGraficoCompra(labelTemp2, dataTemp2)

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
                  this.GraficaCompra();
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
      complete: () => { }
    })


    this.Caja();
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768; // Ajusta el ancho según tus necesidades
  }


  get productosPaginados() {
    const productosFiltrados = this.productosFiltrados();
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    return productosFiltrados.slice(inicio, fin);
  }

  productosFiltrados() {
    const filtroLower = this.filtro.toLowerCase();
    return this.todosProductosMasVendidos.filter(producto =>
      producto.nombre.toLowerCase().includes(filtroLower) ||
      producto.codigo.toLowerCase().includes(filtroLower)
    );
  }

  siguientePagina() {
    if (this.paginaActual * this.productosPorPagina < this.productosFiltrados().length) {
      this.paginaActual++;
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.numeroDePaginas) {
      this.paginaActual = pagina;
    }
  }

  get numeroDePaginas() {
    return Math.ceil(this.productosFiltrados().length / this.productosPorPagina);
  }

  ngAfterViewInit() {
    if (this.topProductosMasVendidos.length > 0) {
      this.renderizarGraficoDoughnut();
    }
  }
  renderizarGraficoDoughnut() {
    console.log('Entrando en renderizarGraficoDoughnut');
    let  nombresProductos ;
    if(this.isMobile== true){
       nombresProductos = this.topProductosMasVendidos.slice(0, 3).map(item => {
        return item.nombre.length > 12 ? item.nombre.slice(0, 12) + '...' : item.nombre;
      });
    }else{
       nombresProductos = this.topProductosMasVendidos.slice(0, 3).map(item => {
        return item.nombre.length > 20 ? item.nombre.slice(0, 20) + '...' : item.nombre;
      });
    }


    const cantidadesVendidas = this.topProductosMasVendidos.slice(0, 3).map(item => item.cantidadVendida);

    console.log('nombresProductos:', nombresProductos);
    console.log('cantidadesVendidas:', cantidadesVendidas);

    const canvas = document.getElementById('doughnutChart') as HTMLCanvasElement;
    console.log('Canvas:', canvas);

    const ctx = canvas.getContext('2d');
    console.log('Contexto 2D:', ctx);

    // Limpiar y renderizar nombres de productos
    const productNamesDiv = document.getElementById('productNames');
    if (productNamesDiv) {
      productNamesDiv.innerHTML = '';
      const colors = ['color-oro', 'color-plata', 'color-bronce'];

      // Iterar sobre los nombres de productos y crear elementos
      nombresProductos.forEach((nombre, index) => {
        const productNameElement = document.createElement('div');
        productNameElement.classList.add('product-name');

        // Crear el cuadro de color y establecer la clase correspondiente
        const colorBox = document.createElement('div');
        colorBox.classList.add('color-box');
        colorBox.classList.add(colors[index]); // Agregar clase dinámica

        // Añadir el cuadro de color y el texto al elemento del nombre del producto
        productNameElement.appendChild(colorBox);
        productNameElement.appendChild(document.createTextNode(`${index + 1}° Puesto: ${nombre}`));

        // Agregar el elemento del nombre del producto al contenedor
        productNamesDiv.appendChild(productNameElement);
      });
    }

    // Verificar si se pudo obtener el contexto 2D del canvas
    if (ctx) {
      // Configurar el gráfico usando la librería Chart.js
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ["1° Puesto", "2° Puesto", "3° Puesto"],
          datasets: [{
            label: 'Cantidad Vendida',
            data: cantidadesVendidas,
            backgroundColor: [
              'rgba(255, 215, 0, 0.5)', // Oro
              'rgba(192, 192, 192, 0.5)', // Plata
              'rgba(205, 127, 50, 0.5)', // Bronce
            ],
            borderColor: [
              'rgba(255, 215, 0, 1)', // Oro (borde sólido)
              'rgba(192, 192, 192, 1)', // Plata (borde sólido)
              'rgba(205, 127, 50, 1)', // Bronce (borde sólido)
            ],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem: any) {
                  return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(0);
                },
              },
            },
          },
        },
      });
    } else {
      console.log('Error: No se pudo obtener el contexto 2D del Canvas.');
    }
  }



  GraficaVenta() {
    this._dashboardServicio.resumen().subscribe({
      next: (data) => {

        if (data.status) {

          this.totalIngresos = data.value.totalIngresos;
          this.totalVentas = data.value.totalVentas;
          this.totalVentasAnio = data.value.totalVentasAnio;
          this.totalProductos = data.value.totalProductos;
          this.totalProductosBodega = data.value.totalProductosBodega;
          this.totalCliente = data.value.totalCliente;
          this.totalProveedores = data.value.totalProveedores;
          this.totalUsuarios = data.value.totalUsuarios;
          this.totalGanancia = data.value.totalGanancia;
          // this.totalcompras = data.value.totalcompras;
          this.totalProductosCantidad = data.value.totalProductosCantidad;
          // this.totalEgresos = data.value.totalEgresos;
          // this.totalCompraProductosCantidad = data.value.totalCompraProductosCantidad;
          this.totalVentasAnulada = data.value.totalVentasAnulada;
          // this.totalComprasAnulada = data.value.totalComprasAnulada;
          this.productosMasVendidos = data.value.productosMasVendidos;
          // // Actualizar solo los tres productos más vendidos
          // this.actualizarTopProductosMasVendidos();


          // Asignar los productos más vendidos
          if (data.value.productosMasVendidos && Array.isArray(data.value.productosMasVendidos)) {
            // Actualizar todos los productos
            this.todosProductosMasVendidos = [...data.value.productosMasVendidos];
            // Actualizar solo los tres primeros productos
            this.topProductosMasVendidos = [...this.todosProductosMasVendidos.slice(0, 3)];
          }
          //  // Asigna el valor antes de formatear
          //  this.totalGananciasProductos = data.value.totalGananciasProductos.toString();

          //  // Luego formatea la ganancia
          //  this.totalGananciasProductos = this.formatearNumero(this.totalGananciasProductos);
          const arrayData: any[] = data.value.ventasUltimaSemana;
          const arrayData2: any[] = data.value.ventasDoceMeses;
          // const arrayData: any[] = data.value.ventasUltimaSemana.filter((value: { anulada: boolean }) => !value.anulada);

          const labelTemp = arrayData.map((value) => value.fecha);
          const dataTemp = arrayData.map((value) => value.total);
          this.mostrarGrafico(labelTemp, dataTemp)


          const labelTemp2 = arrayData2.map((value) => value.fecha);
          const dataTemp2 = arrayData2.map((value) => value.total);
          this.mostrarGraficoDoceMeses(labelTemp2, dataTemp2)

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
                  this.GraficaVenta();
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
      complete: () => { }
    })
  }

  GraficaCompra() {
    this._dashboardServicio.resumenCompra().subscribe({
      next: (data) => {

        if (data.status) {

          // this.totalIngresos = data.value.totalIngresos;
          // // this.totalVentas = data.value.totalVentas;
          // this.totalProductos = data.value.totalProductos;
          // this.totalCliente = data.value.totalCliente;
          // this.totalProveedores = data.value.totalProveedores;
          // this.totalUsuarios = data.value.totalUsuarios;
          // this.totalGanancia = data.value.totalGanancia;
          this.totalComprasAnio = data.value.totalComprasAnio;
          this.totalcompras = data.value.totalcompras;
          // this.totalProductosCantidad = data.value.totalProductosCantidad;
          this.totalEgresos = data.value.totalEgresos;
          this.totalCompraProductosCantidad = data.value.totalCompraProductosCantidad;
          // this.totalVentasAnulada = data.value.totalVentasAnulada;
          this.totalComprasAnulada = data.value.totalComprasAnulada;
          // this.productosMasVendidos = data.value.productosMasVendidos;
          // // Actualizar solo los tres productos más vendidos
          // this.actualizarTopProductosMasVendidos();


          // Asignar los productos más vendidos
          // if (data.value.productosMasVendidos && Array.isArray(data.value.productosMasVendidos)) {
          //   // Actualizar todos los productos
          //   this.todosProductosMasVendidos = [...data.value.productosMasVendidos];
          //   // Actualizar solo los tres primeros productos
          //   this.topProductosMasVendidos = [...this.todosProductosMasVendidos.slice(0, 3)];
          // }



          const arrayData: any[] = data.value.compraDoceMeses;
          const arrayData2: any[] = data.value.compraUltimoMes;
          // const arrayData: any[] = data.value.ventasUltimaSemana.filter((value: { anulada: boolean }) => !value.anulada);

          const labelTemp = arrayData.map((value) => value.fecha);
          const dataTemp = arrayData.map((value) => value.total);
          this.mostrarGraficoDoceMesesCompra(labelTemp, dataTemp)
          // Suponiendo que hoy es '2024-04-18'


          const labelTemp2 = arrayData2.map((value) => value.fecha);
          const dataTemp2 = arrayData2.map((value) => value.total);
          this.mostrarGraficoCompra(labelTemp2, dataTemp2)

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
                  this.GraficaCompra();
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
      complete: () => { }
    })

  }
  mostrarGraficoDoceMeses(labelsGrafico: any[], dataGrafico: any[]) {

    const cantidadObjetiva = localStorage.getItem('ventaObjetivaMensual') || '20'; // Valor por defecto si no hay nada en el local storage
    const nuevaLinea = Array(dataGrafico.length).fill(parseFloat(cantidadObjetiva));
    const primeraLinea = parseFloat(nuevaLinea[0]);

    // const backgroundColors = labelsGrafico.map(() => dynamicColors());
    const dynamicColors = (value: number) => {
      // Si la cantidad de venta es menor que 2, devuelve rojo, de lo contrario, un color aleatorio fuerte
      if (value < primeraLinea) {
        return 'rgba(255, 0, 0, 0.7)'; // Rojo
      } else {
        const r = Math.floor(Math.random() * 150) + 100; // Componente rojo en el rango 100-250
        const g = Math.floor(Math.random() * 150) + 100; // Componente verde en el rango 100-250
        const b = Math.floor(Math.random() * 150) + 100; // Componente azul en el rango 100-250
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
      }
    };


    const backgroundColors = dataGrafico.map(value => dynamicColors(value));

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    // Convertir las fechas en labelsGrafico a nombres de meses
    const labelsFormatted = labelsGrafico.map((dateString) => {
      const parts = dateString.split('/'); // Separar el mes y el año
      const monthIndex = parseInt(parts[0]) - 1; // Obtener el índice del mes (restar 1 porque los meses en JavaScript son base 0)
      const year = parts[1]; // Obtener el año

      return `${monthNames[monthIndex]} ${year}`; // Construir el nombre del mes y año
    });

    const myChart = new Chart('myChartDoce', {
      type: 'bar',
      data: {
        labels: labelsFormatted,
        datasets: [{
          label: '# de Ventas',
          data: dataGrafico,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'Meta de Venta Mensual',
          data: nuevaLinea,
          borderColor: 'red', // Cambiar el color de la línea a rojo
          borderWidth: 4, // Ajustar el ancho de la línea
        },
        {
          type: 'line',
          label: 'Tramo de venta',
          data: dataGrafico,
          borderColor: 'black',
        }

        ]
      },

      options: {
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }

    });



  }
  mostrarGraficoDoceMesesOnline(labelsGrafico: any[], dataGrafico: any[]) {

    // const cantidadObjetiva = localStorage.getItem('ventaObjetivaMensual') || '20'; // Valor por defecto si no hay nada en el local storage
    // const nuevaLinea = Array(dataGrafico.length).fill(parseFloat(cantidadObjetiva));
    // const primeraLinea = parseFloat(nuevaLinea[0]);

    // const backgroundColors = labelsGrafico.map(() => dynamicColors());
    const dynamicColors = (value: number) => {

        const r = Math.floor(Math.random() * 150) + 100; // Componente rojo en el rango 100-250
        const g = Math.floor(Math.random() * 150) + 100; // Componente verde en el rango 100-250
        const b = Math.floor(Math.random() * 150) + 100; // Componente azul en el rango 100-250
        return `rgba(${r}, ${g}, ${b}, 0.7)`;

    };


    const backgroundColors = dataGrafico.map(value => dynamicColors(value));

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    // Convertir las fechas en labelsGrafico a nombres de meses
    const labelsFormatted = labelsGrafico.map((dateString) => {
      const parts = dateString.split('/'); // Separar el mes y el año
      const monthIndex = parseInt(parts[0]) - 1; // Obtener el índice del mes (restar 1 porque los meses en JavaScript son base 0)
      const year = parts[1]; // Obtener el año

      return `${monthNames[monthIndex]} ${year}`; // Construir el nombre del mes y año
    });

    const myChart = new Chart('myChartDoceOnline', {
      type: 'bar',
      data: {
        labels: labelsFormatted,
        datasets: [{
          label: '# de Ventas',
          data: dataGrafico,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          borderRadius: 5
        },

        {
          type: 'line',
          label: 'Tramo de venta',
          data: dataGrafico,
          borderColor: 'black',
        }

        ]
      },

      options: {
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }

    });



  }
  mostrarGrafico(labelsGrafico: any[], dataGrafico: any[]) {
    // const dynamicColors = () => {
    //   const r = Math.floor(Math.random() * 255);
    //   const g = Math.floor(Math.random() * 255);
    //   const b = Math.floor(Math.random() * 255);
    //   return `rgba(${r}, ${g}, ${b}, 0.2)`;
    // };
    const cantidadObjetiva = localStorage.getItem('ventaObjetiva') || '20'; // Valor por defecto si no hay nada en el local storage

    const nuevaLinea = Array(dataGrafico.length).fill(parseFloat(cantidadObjetiva));

    const primeraLinea = parseFloat(nuevaLinea[0]);


    // const backgroundColors = labelsGrafico.map(() => dynamicColors());
    const dynamicColors = (value: number) => {
      // Si la cantidad de venta es menor que 2, devuelve rojo, de lo contrario, un color aleatorio fuerte
      if (value < primeraLinea) {
        return 'rgba(255, 0, 0, 0.7)'; // Rojo
      } else {
        const r = Math.floor(Math.random() * 150) + 100; // Componente rojo en el rango 100-250
        const g = Math.floor(Math.random() * 150) + 100; // Componente verde en el rango 100-250
        const b = Math.floor(Math.random() * 150) + 100; // Componente azul en el rango 100-250
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
      }

    };


    const backgroundColors = dataGrafico.map(value => dynamicColors(value));

    // const cantidadObjetiva = localStorage.getItem('ventaObjetiva') || '20'; // Valor por defecto si no hay nada en el local storage
    // const nuevaLinea = Array(dataGrafico.length).fill(parseFloat(cantidadObjetiva));

    const myChart = new Chart('myChart', {
      type: 'bar',
      data: {
        labels: labelsGrafico,
        datasets: [{
          label: '# de Ventas',
          data: dataGrafico,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          borderRadius: 5
        }, {
          type: 'line',
          label: 'Meta de Venta Diario',
          data: nuevaLinea,
          borderColor: 'red', // Cambiar el color de la línea a rojo
          borderWidth: 4, // Ajustar el ancho de la línea
        },
        {
          type: 'line',
          label: 'Tramo de venta',
          data: dataGrafico,
          borderColor: 'black',
        }]
      },

      options: {
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }

    });



    const myChartCircular = new Chart('myChartCircular', {
      type: 'doughnut',
      data: {
        labels: labelsGrafico,
        datasets: [{
          label: '# de Ventas',
          data: dataGrafico,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          borderRadius: 5
        }]
      },

      options: {
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

  }
  mostrarGraficoOnline(labelsGrafico: any[], dataGrafico: any[]) {


    const dynamicColors = (value: number) => {
      // Si la cantidad de venta es menor que 2, devuelve rojo, de lo contrario, un color aleatorio fuerte

        const r = Math.floor(Math.random() * 150) + 100; // Componente rojo en el rango 100-250
        const g = Math.floor(Math.random() * 150) + 100; // Componente verde en el rango 100-250
        const b = Math.floor(Math.random() * 150) + 100; // Componente azul en el rango 100-250
        return `rgba(${r}, ${g}, ${b}, 0.7)`;


    };


    const backgroundColors = dataGrafico.map(value => dynamicColors(value));

    // const cantidadObjetiva = localStorage.getItem('ventaObjetiva') || '20'; // Valor por defecto si no hay nada en el local storage
    // const nuevaLinea = Array(dataGrafico.length).fill(parseFloat(cantidadObjetiva));

    const myChartOnline = new Chart('myChartOnline', {
      type: 'bar',
      data: {
        labels: labelsGrafico,
        datasets: [{
          label: '# de Ventas',
          data: dataGrafico,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'Tramo de venta',
          data: dataGrafico,
          borderColor: 'black',
        }]
      },

      options: {
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }

    });





  }

  mostrarGraficoDoceMesesCompra(labelsGrafico: any[], dataGrafico: any[]) {


    // const backgroundColors = labelsGrafico.map(() => dynamicColors());
    const dynamicColors = (value: number) => {

      const r = Math.floor(Math.random() * 150) + 100; // Componente rojo en el rango 100-250
      const g = Math.floor(Math.random() * 150) + 100; // Componente verde en el rango 100-250
      const b = Math.floor(Math.random() * 150) + 100; // Componente azul en el rango 100-250
      return `rgba(${r}, ${g}, ${b}, 0.7)`;

    };


    const backgroundColors = dataGrafico.map(value => dynamicColors(value));

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    // Convertir las fechas en labelsGrafico a nombres de meses
    const labelsFormatted = labelsGrafico.map((dateString) => {
      const parts = dateString.split('/'); // Separar el mes y el año
      const monthIndex = parseInt(parts[0]) - 1; // Obtener el índice del mes (restar 1 porque los meses en JavaScript son base 0)
      const year = parts[1]; // Obtener el año

      return `${monthNames[monthIndex]} ${year}`; // Construir el nombre del mes y año
    });

    const myChart = new Chart('myChartDoceAnio', {
      type: 'bar',
      data: {
        labels: labelsFormatted,
        datasets: [{
          label: '# de Compras',
          data: dataGrafico,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          borderRadius: 5
        },
        // {
        //   type: 'line',
        //   label: 'Meta de Venta',
        //   data: nuevaLinea,
        //   borderColor: 'red', // Cambiar el color de la línea a rojo
        //   borderWidth: 4, // Ajustar el ancho de la línea
        // },
        {
          type: 'line',
          label: 'Tramo de Compra',
          data: dataGrafico,
          borderColor: 'black',
        }

        ]
      },

      options: {
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }

    });



  }
  mostrarGraficoCompra(labelsGraficoCompra: any[], dataGraficoCompra: any[]) {

    const dynamicColors = (value: number) => {

      const r = Math.floor(Math.random() * 150) + 100; // Componente rojo en el rango 100-250
      const g = Math.floor(Math.random() * 150) + 100; // Componente verde en el rango 100-250
      const b = Math.floor(Math.random() * 150) + 100; // Componente azul en el rango 100-250
      return `rgba(${r}, ${g}, ${b}, 0.7)`;

    };


    const backgroundColors = dataGraficoCompra.map(value => dynamicColors(value));

    const myChart = new Chart('myChartCompra', {
      type: 'bar',
      data: {
        labels: labelsGraficoCompra,
        datasets: [{
          label: '# de Compras',
          data: dataGraficoCompra,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          borderRadius: 5
        },

        {
          type: 'line',
          label: 'Tramo de compra',
          data: dataGraficoCompra,
          borderColor: 'black',
        }
        ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  Caja() {


    // Inicializar las variables
    let idUsuario: number = 0;
    let idCaja: number = 0;
    let transaccionesTexto: string | undefined;
    let Prestamos: string | undefined;
    let Devoluciones: string | undefined;
    let Gastos: string | undefined;
    let Ingreso: string | undefined;
    let Inicial: string | undefined;
    let nombreUsuario: string | undefined;
    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    if (datosDesencriptados !== null) {
      const usuario = JSON.parse(datosDesencriptados);
      idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
    }

    if (idUsuario !== 0) {
      this.cajaService.obtenerCajaPorUsuario(idUsuario).subscribe({
        next: (caja: Caja | null) => {
          if (caja !== null) {
            // Si se encuentra una caja abierta para el idUsuario
            idCaja = caja.idCaja;
            transaccionesTexto = caja.transacciones;
            Prestamos = caja.prestamos;
            Devoluciones = caja.devoluciones;
            Gastos = caja.gastos;
            Ingreso = caja.ingresos;
            Inicial = caja.saldoInicial;
            nombreUsuario = caja.nombreUsuario;
            // Convertir las variables de string a number y realizar la suma
            const sumaTotal: number = (Ingreso !== undefined && Inicial !== undefined)
              ? parseFloat(Ingreso) + parseFloat(Inicial) : NaN;

              const RestaTotal: number = (Gastos !== undefined && Prestamos !== undefined && Devoluciones !== undefined)
              ? parseFloat(Gastos) + parseFloat(Prestamos) + parseFloat(Devoluciones) : NaN;

            const Resultado = sumaTotal - RestaTotal;

            this.TotalCaja = Resultado.toString();
            this.NombreCaja = nombreUsuario.toString();

            const cajaActualizada: Caja = {
              idCaja: idCaja,
              transaccionesTexto: transaccionesTexto,
              ingresosTexto: Ingreso,
              gastosTexto: Gastos,
              devolucionesTexto: Devoluciones,
              prestamosTexto: Prestamos,
              saldoInicialTexto: Inicial,
              estado: '',
              nombreUsuario: '',
              idUsuario: idUsuario
            };
            //  this.actualizarCaja(cajaActualizada);




          } else {
            // Manejar el caso en el que no se encuentre una caja abierta para el idUsuario
            // Swal.fire({
            //   icon: 'error',
            //   title: 'Error',
            //   text: 'No se encontró una caja abierta para el usuario actual',
            //   confirmButtonText: 'Aceptar'
            // });
            // // Detener la ejecución
            // return;
          }
        },
        error: (error) => {
          // console.error('Error al obtener la caja abierta:', error);
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Error',
          //   text: 'Este usuario no tiene una caja definida, define una caja para poder realizar una venta ',
          //   confirmButtonText: 'Aceptar'
          // });
          // // Detener la ejecución
          // return;
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
                    this.Caja();
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
    } else {
      console.log('No se encontró el idUsuario en el localStorage');
    }

  }
  mostrarTodosProductos(): void {
    this.mostrarTabla = !this.mostrarTabla;
  }

  abrirDialogImagen(imagenUrl: string): void {
    console.log(imagenUrl); // Verifica que la URL sea correcta
    // const dialogRef = this.dialog.open(VerImagenProductoModalComponent, {
    //   data: { imagenUrl: imagenUrl }
    // });
       this.dialog.open(VerImagenProductoModalComponent, {
          data: {
            imagenes: imagenUrl
          }
        });
    
  }
  onMouseEnter(producto: any, index: number): void {
    producto.estadoAnimacion = `highlighted-${index}`;
  }

  onMouseLeave(producto: any): void {
    producto.estadoAnimacion = 'normal'; // Agrega una propiedad estadoAnimacion en tu objeto producto
  }



  // private actualizarTopProductosMasVendidos() {
  //   // Ordenar la lista de productos por cantidad vendida de forma descendente
  //   this.topProductosMasVendidos = this.productosMasVendidos.sort((a, b) => b.cantidadVendida - a.cantidadVendida).slice(0,3);
  // }

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
  configurarVentaObjetiva(): void {

    Swal.fire({
      title: '¿Defina su metas de ventas?',
      input: 'radio',
      inputOptions: {
        diario: 'Diario',
        mensual: 'Mensual'
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
        if (result.value === 'mensual') {


          Swal.fire({
            title: 'Configurar Meta De Venta',
            input: 'number',
            inputLabel: 'Ingrese la cantidad para meta de venta mensual',
            inputAttributes: {
              min: '0',
              step: '1'
            },
            showCancelButton: true,
            confirmButtonColor: '#1337E8',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: (cantidad) => {
              return new Promise<void>((resolve) => {
                if (isNaN(cantidad) || cantidad < 0) {
                  Swal.showValidationMessage('Por favor ingrese una cantidad válida.');
                } else {
                  localStorage.setItem('ventaObjetivaMensual', cantidad);
                  resolve();
                }
              });
            }
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                icon: 'success',
                title: '¡Meta de venta mensual configurada!',
                text: `La cantidad de venta mensual es de: ${result.value}`
              });
              setTimeout(() => {
                location.reload();
              }, 1000); // Cambia el valor del tiempo de espera según tus necesidades
              // const cantidadObjetiva = localStorage.getItem('ventaObjetiva') || '20';
              // const nuevaLinea = Array(31).fill(parseFloat(cantidadObjetiva));

              // // Verificar si el gráfico está definido antes de actualizarlo
              // if (this.myChart !== undefined) {
              //   this.myChart.data.datasets[1].data = nuevaLinea;
              //   this.myChart.update(); // Actualizar el gráfico
              // } else {
              //   console.error('myChart no está definido');
              // }
            }
          });


        } else if (result.value === 'diario') {


          Swal.fire({
            title: 'Configurar Meta De Venta',
            input: 'number',
            inputLabel: 'Ingrese la cantidad para meta de venta diaria',
            inputAttributes: {
              min: '0',
              step: '1'
            },
            showCancelButton: true,
            confirmButtonColor: '#1337E8',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: (cantidad) => {
              return new Promise<void>((resolve) => {
                if (isNaN(cantidad) || cantidad < 0) {
                  Swal.showValidationMessage('Por favor ingrese una cantidad válida.');
                } else {
                  localStorage.setItem('ventaObjetiva', cantidad);
                  resolve();
                }
              });
            }
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                icon: 'success',
                title: '¡Meta de venta diaria configurada!',
                text: `La cantidad de venta diaria es: ${result.value}`
              });
              setTimeout(() => {
                location.reload();
              }, 1000); // Cambia el valor del tiempo de espera según tus necesidades
              // const cantidadObjetiva = localStorage.getItem('ventaObjetiva') || '20';
              // const nuevaLinea = Array(31).fill(parseFloat(cantidadObjetiva));

              // // Verificar si el gráfico está definido antes de actualizarlo
              // if (this.myChart !== undefined) {
              //   this.myChart.data.datasets[1].data = nuevaLinea;
              //   this.myChart.update(); // Actualizar el gráfico
              // } else {
              //   console.error('myChart no está definido');
              // }
            }
          });



        }
      }
    });






  }



  // mostrarGraficoCompra(labelsGrafico: any[], dataGrafico: any[]) {
  //   // Generate an array of dynamic colors for each day
  //   const dynamicColors = () => {
  //     const r = Math.floor(Math.random() * 255);
  //     const g = Math.floor(Math.random() * 255);
  //     const b = Math.floor(Math.random() * 255);
  //     return `rgba(${r}, ${g}, ${b}, 0.2)`;
  //   };

  //   const backgroundColors = labelsGrafico.map(() => dynamicColors());

  //   const myChart = new Chart('myChartCompra', {
  //     type: 'bar',
  //     data: {
  //       labels: labelsGrafico,
  //       datasets: [{
  //         label: '# de Compras',
  //         data: dataGrafico,
  //         backgroundColor: backgroundColors,
  //         borderColor: backgroundColors.map(color => color.replace('0.2', '1')), // Adjust border opacity
  //         borderWidth: 1
  //       }]
  //     },
  //     options: {
  //       maintainAspectRatio: false,
  //       responsive: true,
  //       scales: {
  //         y: {
  //           beginAtZero: true
  //         }
  //       }
  //     }
  //   });
  // }


  generarPDF(): void {

    Swal.fire({
      icon: 'question',
      title: 'Descargar PDF',
      text: '¿Estás seguro de que deseas descargar el PDF?',
      showCancelButton: true,
      confirmButtonColor: '#1337E8',
      confirmButtonText: 'Sí',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',

    }).then((result) => {
      if (result.isConfirmed) {


        // Llamada al servicio para obtener la información de la empresa
        this.empresaService.lista().subscribe({
          next: (response) => {
            // Verificar si la respuesta tiene éxito (status = true)
            if (response.status) {
              const empresas = response.value as Empresa[];
              if (empresas.length > 0) {
                const empresa = empresas[0];

                // Extraer los datos de la empresa
                const nombreEmpresa = empresa.nombreEmpresa;
                const direccion2 = empresa.direccion;
                const telefono2 = empresa.telefono;
                const logoBase64 = empresa?.logo;
                const correo = empresa.correo;
                const rut = empresa.rut;
                // Agregar prefijo al logo base64
                const logoBase64WithPrefix = 'data:image/png;base64,' + logoBase64;




                const pdf = new jsPDF();



                // Agregar la imagen al PDF
                if (logoBase64) {
                  const imgWidth = 40; // Ancho de la imagen en el PDF
                  const imgHeight = 40; // Altura de la imagen en el PDF
                  pdf.addImage(logoBase64WithPrefix, 'PNG', 160, 4, imgWidth, imgHeight);
                }

                pdf.setFontSize(12);
                pdf.setFont('Helvetica', 'normal');
                pdf.text('Nombre de la Empresa:' + nombreEmpresa, 70, 7);
                pdf.setFontSize(12);
                pdf.setFont('Helvetica', 'normal');
                pdf.text('Nit:' + rut, 70, 12);
                pdf.setFontSize(12);
                pdf.setFont('Helvetica', 'normal');
                pdf.text('Direccion:' + direccion2, 70, 17);
                pdf.setFontSize(12);
                pdf.setFont('Helvetica', 'normal');
                pdf.text('Telefono:' + telefono2, 70, 22);
                pdf.setFontSize(12);
                pdf.setFont('Helvetica', 'normal');
                pdf.text('Correo:' + correo, 70, 27);



                pdf.setFontSize(20);
                pdf.text('Listado de Productos', 80, 40);
                pdf.setFont('Helvetica', 'normal');
                pdf.setFontSize(12);
                pdf.text(`Fecha de creación de este reporte : ${moment().format('DD-MM-YYYY hh:mm A')}`, 20, 50);
                pdf.setFont('Helvetica', 'normal');


                pdf.setLineWidth(1);
                pdf.line(20, 60, 190, 60);  // Adjust the line position


                const data = this.todosProductosMasVendidos.map((producto, index) => [
                  index + 1, // Número
                  // producto.nombre,
                  producto.nombre.length > 40 ? producto.nombre.slice(0, 40) + '...' : producto.nombre,
                  producto.codigo,
                  producto.cantidadVendida, // Cantidad Vendida
                ]);

                (pdf as any).autoTable({
                  headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
                  bodyStyles: { textColor: [0, 0, 0] },
                  head: [['#', 'Producto','Codigo De Barra' ,'Cantidad Vendida']],
                  body: data,
                  startY: 70,
                  didDrawPage: (dataArg: any) => {
                    // Añadir número de página al pie de página
                    const pageCount = pdf.getNumberOfPages(); // Obtenemos el número total de páginas
                    const pageNumber = dataArg.pageNumber; // Obtenemos el número de página actual
                    pdf.text(`Página ${pageNumber} de ${pageCount}`, 170, 290);
                  },
                  styles: { halign: 'center' },
                });


                const uniqueIdentifier = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
                const currentDate = moment().format('YYYYMMDD-HHmmss'); // Fecha y hora actual en formato específico
                const fileName = `Productos_mas_vendidos_${uniqueIdentifier}_${currentDate}.pdf`;
                // pdf.save(fileName);
                // Obtener el base64 del PDF
                const pdfData = pdf.output('datauristring');

                // Abrir el PDF en una nueva ventana del navegador
                const win = window.open();
                if (win) {
                  win.document.write('<iframe width="100%" height="100%" src="' + pdfData + '"></iframe>');
                } else {
                  console.error('No se pudo abrir la ventana del navegador.');
                }

              } else {

                const pdf = new jsPDF();

                // Swal.fire({
                //   icon: 'success',
                //   title: 'EXITOS',
                //   text: `Archivo Descargado`,
                // });

                pdf.setFontSize(20);
                pdf.setFont('Helvetica', 'normal');
                pdf.text('Listado de Productos', 80, 30);
                pdf.setFont('Helvetica', 'normal');
                pdf.setFontSize(12);
                pdf.text(`Fecha de creación de este reporte : ${moment().format('DD-MM-YYYY hh:mm A')}`, 20, 40);



                pdf.setLineWidth(1);
                pdf.line(20, 50, 190, 50);  // Adjust the line position

                const data = this.todosProductosMasVendidos.map((producto, index) => [
                  index + 1, // Número
                  // producto.nombre,
                  producto.nombre.length > 40 ? producto.nombre.slice(0, 40) + '...' : producto.nombre,
                  producto.cantidadVendida, // Cantidad Vendida
                ]);

                (pdf as any).autoTable({
                  headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
                  bodyStyles: { textColor: [0, 0, 0] },//me coloca negro el contenido de la tabla
                  head: [['#', 'Producto', 'Cantidad Vendida']],
                  body: data,
                  startY: 60,
                  didDrawPage: (dataArg: any) => {
                    // Añadir número de página al pie de página
                    const pageCount = pdf.getNumberOfPages(); // Obtenemos el número total de páginas
                    const pageNumber = dataArg.pageNumber; // Obtenemos el número de página actual
                    pdf.text(`Página ${pageNumber} de ${pageCount}`, 170, 290);
                  },
                  styles: { halign: 'center' },
                });


                const uniqueIdentifier = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
                const currentDate = moment().format('YYYYMMDD-HHmmss'); // Fecha y hora actual en formato específico
                const fileName = `Productos_mas_vendidos_${uniqueIdentifier}_${currentDate}.pdf`;


                // pdf.save(fileName);

                // Obtener el base64 del PDF
                const pdfData = pdf.output('datauristring');

                // Abrir el PDF en una nueva ventana del navegador
                const win = window.open();
                if (win) {
                  win.document.write('<iframe width="100%" height="100%" src="' + pdfData + '"></iframe>');
                } else {
                  console.error('No se pudo abrir la ventana del navegador.');
                }



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
                      this.Pdf2();
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

        // Después de generar el PDF, mostrar mensaje de éxito
        // Swal.fire({
        //   icon: 'success',
        //   title: 'Éxito',
        //   text: 'El archivo PDF ha sido descargado',
        // });
      }
    });


  }
  Pdf2() {

    this.empresaService.lista().subscribe({
      next: (response) => {
        // Verificar si la respuesta tiene éxito (status = true)
        if (response.status) {
          const empresas = response.value as Empresa[];
          if (empresas.length > 0) {
            const empresa = empresas[0];

            // Extraer los datos de la empresa
            const nombreEmpresa = empresa.nombreEmpresa;
            const direccion2 = empresa.direccion;
            const telefono2 = empresa.telefono;
            const logoBase64 = empresa?.logo;
            const correo = empresa.correo;
            const rut = empresa.rut;
            // Agregar prefijo al logo base64
            const logoBase64WithPrefix = 'data:image/png;base64,' + logoBase64;




            const pdf = new jsPDF();



            // Agregar la imagen al PDF
            if (logoBase64) {
              const imgWidth = 40; // Ancho de la imagen en el PDF
              const imgHeight = 40; // Altura de la imagen en el PDF
              pdf.addImage(logoBase64WithPrefix, 'PNG', 160, 4, imgWidth, imgHeight);
            }

            pdf.setFontSize(12);
            pdf.setFont('Helvetica', 'normal');
            pdf.text('Nombre de la Empresa:' + nombreEmpresa, 70, 7);
            pdf.setFontSize(12);
            pdf.setFont('Helvetica', 'normal');
            pdf.text('Nit:' + rut, 70, 12);
            pdf.setFontSize(12);
            pdf.setFont('Helvetica', 'normal');
            pdf.text('Direccion:' + direccion2, 70, 17);
            pdf.setFontSize(12);
            pdf.setFont('Helvetica', 'normal');
            pdf.text('Telefono:' + telefono2, 70, 22);
            pdf.setFontSize(12);
            pdf.setFont('Helvetica', 'normal');
            pdf.text('Correo:' + correo, 70, 27);



            pdf.setFontSize(20);
            pdf.text('Listado de Productos', 80, 40);
            pdf.setFont('Helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.text(`Fecha de creación de este reporte : ${moment().format('DD-MM-YYYY hh:mm A')}`, 20, 50);
            pdf.setFont('Helvetica', 'normal');


            pdf.setLineWidth(1);
            pdf.line(20, 60, 190, 60);  // Adjust the line position


            const data = this.todosProductosMasVendidos.map((producto, index) => [
              index + 1, // Número
              // producto.nombre.slice(0, 40),
              producto.nombre.length > 40 ? producto.nombre.slice(0, 40) + '...' : producto.nombre,
              producto.codigo,
              producto.cantidadVendida,
            ]);

            (pdf as any).autoTable({
              headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
              bodyStyles: { textColor: [0, 0, 0] },
              head: [['#', 'Producto', 'Codigo De Barra','Cantidad Vendida']],
              body: data,
              startY: 70,
              didDrawPage: (dataArg: any) => {
                // Añadir número de página al pie de página
                const pageCount = pdf.getNumberOfPages(); // Obtenemos el número total de páginas
                const pageNumber = dataArg.pageNumber; // Obtenemos el número de página actual
                pdf.text(`Página ${pageNumber} de ${pageCount}`, 170, 290);
              },
              styles: { halign: 'center' },

            });

            const uniqueIdentifier = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
            const currentDate = moment().format('YYYYMMDD-HHmmss'); // Fecha y hora actual en formato específico
            const fileName = `Productos_mas_vendidos_${uniqueIdentifier}_${currentDate}.pdf`;
            // pdf.save(fileName);
            // Obtener el base64 del PDF
            const pdfData = pdf.output('datauristring');

            // Abrir el PDF en una nueva ventana del navegador
            const win = window.open();
            if (win) {
              win.document.write('<iframe width="100%" height="100%" src="' + pdfData + '"></iframe>');
            } else {
              console.error('No se pudo abrir la ventana del navegador.');
            }

          } else {

            const pdf = new jsPDF();

            // Swal.fire({
            //   icon: 'success',
            //   title: 'EXITOS',
            //   text: `Archivo Descargado`,
            // });

            pdf.setFontSize(20);
            pdf.setFont('Helvetica', 'normal');
            pdf.text('Listado de Productos', 80, 30);
            pdf.setFont('Helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.text(`Fecha de creación de este reporte : ${moment().format('DD-MM-YYYY hh:mm A')}`, 20, 40);



            pdf.setLineWidth(1);
            pdf.line(20, 50, 190, 50);  // Adjust the line position

            const data = this.todosProductosMasVendidos.map((producto, index) => [
              index + 1, // Número
              producto.nombre, // Nombre del Producto
              producto.cantidadVendida, // Cantidad Vendida
            ]);

            (pdf as any).autoTable({
              headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
              bodyStyles: { textColor: [0, 0, 0] },//me coloca negro el contenido de la tabla
              head: [['#', 'Producto', 'Cantidad Vendida']],
              body: data,
              startY: 60,
              didDrawPage: (dataArg: any) => {
                // Añadir número de página al pie de página
                const pageCount = pdf.getNumberOfPages(); // Obtenemos el número total de páginas
                const pageNumber = dataArg.pageNumber; // Obtenemos el número de página actual
                pdf.text(`Página ${pageNumber} de ${pageCount}`, 170, 290);
              },
              styles: { halign: 'center' },
            });


            const uniqueIdentifier = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
            const currentDate = moment().format('YYYYMMDD-HHmmss'); // Fecha y hora actual en formato específico
            const fileName = `Productos_mas_vendidos_${uniqueIdentifier}_${currentDate}.pdf`;


            // pdf.save(fileName);

            // Obtener el base64 del PDF
            const pdfData = pdf.output('datauristring');

            // Abrir el PDF en una nueva ventana del navegador
            const win = window.open();
            if (win) {
              win.document.write('<iframe width="100%" height="100%" src="' + pdfData + '"></iframe>');
            } else {
              console.error('No se pudo abrir la ventana del navegador.');
            }



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
                  this.Pdf2();
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

    // Después de generar el PDF, mostrar mensaje de éxito
    // Swal.fire({
    //   icon: 'success',
    //   title: 'Éxito',
    //   text: 'El archivo PDF ha sido descargado',
    // });
  }
  generarExcel(): void {

    Swal.fire({
      icon: 'question',
      title: 'Descargar Excel',
      text: '¿Estás seguro de que deseas descargar el archivo Excel?',
      showCancelButton: true,
      confirmButtonColor: '#1337E8',
      confirmButtonText: 'Sí',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {

        const uniqueIdentifier = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
        const currentDate = moment().format('DDMMYYYY'); // Fecha actual en formato específico (sin hora ni minutos)
        const fileName = `Productos_mas_vendidos_${uniqueIdentifier}_${currentDate}.xlsx`; // Nombre personalizado del archivo

        // Crear un array de objetos con la misma estructura que la tabla de datos
        const data = this.todosProductosMasVendidos.map((producto, index) => ({
          '#': index + 1,
          // 'Producto': producto.nombre,
          'Producto': producto.nombre.length > 40 ? producto.nombre.slice(0, 40) + '...' : producto.nombre,
          'Codigo': producto.codigo,
          'Cantidad Vendida': producto.cantidadVendida,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos Más Vendidos');

        XLSX.writeFile(workbook, fileName);

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'El archivo Excel ha sido descargado',
        });
      }
    });


  }



}
