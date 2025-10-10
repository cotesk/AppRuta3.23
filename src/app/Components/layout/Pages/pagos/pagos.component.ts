import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { ReponseApi } from '../../../../Interfaces/reponse-api';
import { VerImagenProductoModalComponent } from '../../Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { MatDialog } from '@angular/material/dialog';

import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EmpresaService } from '../../../../Services/empresa.service';
import { Empresa } from '../../../../Interfaces/empresa';
import Swal from 'sweetalert2';
import { interval, of, switchMap } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ImageDialogService } from '../../../../Services/image-dialog.service';
import { EmpresaDataService } from '../../../../Services/EmpresaData.service';

import { MatSelectChange } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
// import { ExchangeRateService } from '../../../../Services/ExchangeRateService.service';
import { environment } from '../../../../environments/environment';
import { CustomPreferenceRequest } from '../../../../Interfaces/CustomPreferenceRequest';
import { MatTableDataSource } from '@angular/material/table';

import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaseadorDiaService } from '../../../../Services/paseadorDia.service';
import { PaseoService } from '../../../../Services/paseo.service';
import { CajaService } from '../../../../Services/caja.service';

import moment from 'moment';
import jsPDF from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { createNumberMask } from 'text-mask-addons';
import JsBarcode from 'jsbarcode';
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Caja } from '../../../../Interfaces/caja';
import { HttpErrorResponse } from '@angular/common/http';
import * as QRCode from 'qrcode';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SignalRService } from '../../../../Services/signalr.service';
import { Router } from '@angular/router';
import { PagoService } from '../../../../Services/pago.service';
import { Usuario } from '../../../../Interfaces/usuario';
import { Pago } from '../../../../Interfaces/pago';
import { ModalUsuarioComponent } from '../../Modales/modal-usuario/modal-usuario.component';
import { Paseo } from '../../../../Interfaces/paseo';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class PagosComponent implements OnInit, OnDestroy {

  metodo: string | null = null;
  codigoFiltro: string | null = null;

  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  metodoBusqueda: string | null = 'Nombre';
  metodoBusquedaPago: string | null = 'Pagado';
  metodoTipo: string | null = '';
  // formularioProducto: FormGroup;

  precioPorCajaSeleccionado: { [key: number]: boolean } = {};
  ///
  nombreEmpresa: string = '';
  empresa: any;

  selectedColor: string = '';

  categoriaControl = new FormControl('');
  private mercadopago: any;
  clienteFiltrado: string = '';

  //Venta

  claveSecreta: string | null = null;
  error: string | null = null;


  venta: any;

  bloquearBotonRegistrar: boolean = false;


  UsuarioSeleccionadoTemporal: any;

  paseoSeleccionadoTemporal: any;
  ListaproductoSeleccionadoTemporal: any[] = [];
  pagos: Pago[] = [];
  usuarioSeleccionado!: Usuario | null;
  tipodePagoPorDefecto: string = "Efectivo";
  tipodePago: string = "Nequi";
  metododePagoPorDefecto: string = "Pagado";
  unidaddePagoPorDefecto: string = "Unitario";
  tipodeFacturaPorDefecto: string = "Ticket";
  listaClientesFiltrada: Usuario[] = [];
  listaClientes: Usuario[] = [];
  totalPagar: number = 0;
  GanaciaPagar: number = 0;
  CantidadPagar: number = 0;
  total: string = "";
  formularioProductoVenta: FormGroup;
  // columnasTabla: string[] = ['imagen', 'producto', 'cliente', 'cantidad', 'unidadMedida',
  //   'precio', 'total', 'valorPagado', 'accion',];
  columnasTabla: string[] = [
    'idPaseo',
    'fecha',
    'turno',
    'nombrePasador',
    'costoTotal',
    'estado',
    'acciones'
  ];



  paseos: any[] = [];
  pagedPaseos: any[] = [];
  searchTerm: string = ''; // Término de búsqueda, si aplica

  totalItems = 0;
  paginaActual = 1;
  tamanioPagina = 5;
  // idMesaSeleccionada = 1;
  dataSource = new MatTableDataSource<Pago>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  // formularioCliente: FormGroup;
  listaCliente: Usuario[] = [];
  listaClienteFiltrada: Usuario[] = [];

  form: FormGroup = new FormGroup({});

  numeroFormateado: string = '';
  tipoBusqueda: string | null = '';

  hayCajaAbierta: boolean = false;
  // Variable para almacenar el precio del producto
  precioProducto: string = '';
  // Declaración de la variable para almacenar el tipo de pago seleccionado
  public tipoPagoSeleccionado: string = this.tipodePagoPorDefecto;

  totalConDescuento: number = this.totalPagar;
  Vueltos: number = 0;
  PrecioEfectivo: number | null = null;
  PrecioTransferencia: number | null = null;
  dataInicioCaja: Caja[] = [];
  dataListaCaja = new MatTableDataSource(this.dataInicioCaja);

  constructor(

    private dialog: MatDialog,

    private _usuarioServicio: UsuariosService,
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private empresaDataService: EmpresaDataService,

    private imageDialogService: ImageDialogService,

    private _utilidadServicio: UtilidadService,
    private paseoService: PaseoService,
    private pagoService: PagoService,
    private cajaService: CajaService,
    private snackBar: MatSnackBar,
    private signalRService: SignalRService,
    private router: Router

    // private exchangeRateService: ExchangeRateService
  ) {



    // this.formularioProducto = this.fb.group({

    //   categoria: ['',],
    //   precioFiltro: [''],
    //   nombreFiltro: ['']
    // });
    this.formularioProductoVenta = new FormGroup({
      // Otros controles del formulario
      metodoPago: new FormControl(''), // Asegúrate de que este control refleje el valor seleccionado en tu mat-select
      intereses: new FormControl(''),
    });

    // Establecer un intervalo para actualizar la lista de productos cada 5 minutos (puedes ajustar el tiempo según tus necesidades)
    // interval(1000) // 300,000 milisegundos = 5 minutos
    //   .subscribe(() => {
    //     this.cargarProductos();
    //   });
    // interval(1000) // 300,000 milisegundos = 5 minutos
    //   .subscribe(() => {
    //     this.actualizarListaMesa();
    //   });


    this.formularioProductoVenta = this.fb.group({
      cliente: ['', Validators.required],
      // cliente: ['', [Validators.maxLength(35)]],
      // mesaId: [''],
      precioPagadoTexto: ['0', Validators.required],
      tipoBusqueda: ['',],
      metodoBusqueda: ['Pagado'],

    });


    this.formularioProductoVenta.get('cliente')?.valueChanges.subscribe(value => {
      this.listaClienteFiltrada = this.filtrarClientes(value);
    });





  }

  ngOnDestroy(): void {
    console.log('[PedidoComponent] Destruyendo...');

    this.listeners.forEach((unsubscribe, i) => {
      unsubscribe();
      console.log(`[PedidoComponent] Listener ${i} desuscrito`);
    });

    this.listeners = []; // Limpia el array
    // this.signalRService.stopConnection(); // si aplica
  }
  private listeners: (() => void)[] = [];

  ngOnInit(): void {


    this.signalRService.startConnection();


    this.inicializar
    // this.cargarProductos();
    this.listaUsuariosClientes();
    // this.CategoriaCompleta();
    // this.obtenerCategorias();
    // this.fetchProductos();


    this.obtenerCajasAbiertas();

    this.formularioProductoVenta.get('precioPagadoTexto')!.valueChanges.subscribe(value => {
      this.aplicarVueltos(value);
    });


  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

  }


  onPageChange(event: PageEvent) {
    this.paginaActual = event.pageIndex + 1;
    this.tamanioPagina = event.pageSize;
    this.cargarpaseosPendiente();
  }


  cargarpaseosPendiente() {
    if (!this.usuarioSeleccionado) return;

    console.log(this.usuarioSeleccionado.idUsuario!);
    console.log(this.paginaActual);
    console.log(this.tamanioPagina);
    this.paseoService.obtenerPorCliente(this.usuarioSeleccionado.idUsuario!, this.paginaActual, this.tamanioPagina, this.searchTerm, "Entregado")
      .subscribe(resp => {
        console.log('Respuesta del backend:', resp);

        if (resp && resp.data) {
          this.paseos = resp.data;
          this.totalItems = resp.total;
          // Actualizar la tabla
          this.dataSource.data = this.paseos;
          // console.log(this.dataSource.data);
        } else {
          this.paseos = [];
          this.totalItems = 0;
          this.dataSource.data = [];
        }
      });


  }



  deseleccionarCliente() {
    // Puedes realizar acciones adicionales aquí antes de deseleccionar
    this.usuarioSeleccionado = null;
  }


  inicializar() {


    // this.formularioProducto = this.fb.group({

    //   categoria: ['',],
    //   precioFiltro: [''],
    //   nombreFiltro: ['']
    // });


    this.formularioProductoVenta = this.fb.group({
      cliente: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      // mesa: ['', [Validators.maxLength(35)]],
      // mesaId: [''],
      precioPagadoTexto: ['0', Validators.required],
      tipoBusqueda: ['',],
      metodoBusqueda: [''],

    });



    this.formularioProductoVenta.get('cliente')?.valueChanges.subscribe(value => {
      this.listaClienteFiltrada = this.filtrarClientes(value);
    });



    // this.actualizarListaProductos();
    this.listaUsuariosClientes();

  }



  private listaUsuariosClientes() {
    this._usuarioServicio.lista().subscribe({

      next: (data) => {
        console.log(data);
        if (data.status) {

          this.listaCliente = data.value
            .filter((u: Usuario) => u.rolDescripcion?.toLowerCase() === 'cliente')
            .sort((a: Usuario, b: Usuario) => a.nombreCompleto!.localeCompare(b.nombreCompleto!));

          console.log(this.listaCliente);
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
                  this.listaUsuariosClientes();
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

  aplicarVueltos(vueltos: string) {
    // console.log(vueltos);

    if (vueltos == "0") {

      this.Vueltos = 0;

    } else {

      // Eliminar los puntos de separación de miles
      const limpio = vueltos.replace(/\./g, '');

      // Convertir el string limpio a número
      const vuelto: number = parseInt(limpio, 10) || 0;
      console.log(vuelto);

      // Calcular el vuelto
      this.Vueltos = vuelto - this.totalConDescuento;

    }


  }


  // Añade un nuevo método para filtrar clientes
  filtrarClientes(nombre: any): Usuario[] {
    // Verificar si nombre es una cadena antes de llamar a trim()

    const valorBuscado = typeof nombre === "string" ? nombre.toLocaleLowerCase() : nombre.nombreCompleto.toLocaleLowerCase();
    const clientesFiltrados = this.listaCliente.filter(item => item.nombreCompleto!.toLocaleLowerCase().includes(valorBuscado));
    console.log('Clientes filtrados:', clientesFiltrados);
    return clientesFiltrados;
  }


  obtenerCajasAbiertas() {
    this.cajaService.listaSoloHoy().subscribe({
      next: (data) => {
        console.log(data);
        if (data && Array.isArray(data.value) && data.value.length > 0) {

          // Verificar si al menos una caja está abierta
          const cajaAbierta = data.value.find((caja: any) => caja.estado === 'Abierto');
          console.log();
          if (cajaAbierta) {
            // Si se encuentra al menos una caja abierta
            // Verificar si la fecha de inicio de la caja abierta coincide con la fecha actual
            const fechaInicioCaja = moment(cajaAbierta.fechaApertura);
            const fechaHoy = moment();
            if (fechaInicioCaja.isSame(fechaHoy, 'day')) {
              // Si la fecha de inicio coincide con la fecha actual, se puede proceder con la venta
              this.hayCajaAbierta = true;

            } else {
              // Si la fecha de inicio no coincide con la fecha actual, mostrar un mensaje de error
              Swal.fire({
                icon: 'error',
                title: '¡ ERROR !',
                text: 'Primero debe cerrar la caja antes de iniciar una nueva venta.'
              });
              this.bloquearBotonRegistrar = false;
              this.hayCajaAbierta = false;

            }
          } else {
            // Si no se encuentra ninguna caja abierta
            Swal.fire({
              icon: 'warning',
              title: 'Atención',
              text: 'No hay cajas abiertas'
            });
            this.hayCajaAbierta = false;
          }
        } else {
          this.hayCajaAbierta = false;
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'No hay cajas abiertas'
          });
        }
      },
      error: (error) => {
        let idUsuario: number = 0;


        // Obtener el idUsuario del localStorage
        const usuarioString = localStorage.getItem('usuario');
        const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA!);
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
                  this.obtenerCajasAbiertas();
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


  formatearNumero4(event: any, campo: string): void {
    let valorInput = event.target.value.replace(/\./g, ''); // Elimina los puntos existentes

    // Verifica si el valor es un número válido antes de formatear
    if (valorInput !== '' && !isNaN(parseFloat(valorInput))) {
      valorInput = parseFloat(valorInput).toLocaleString('es-CO', { maximumFractionDigits: 2 });
      this.numeroFormateado = valorInput;

      // Actualiza el valor formateado en el formulario
      this.formularioProductoVenta.get(campo)?.setValue(valorInput);

    } else {
      // Si el valor no es un número válido o está vacío, establece el valor en cero en el formulario
      this.numeroFormateado = '0';
      this.formularioProductoVenta.get(campo)?.setValue('0');
    }
  }

  onChangeTipoBusqueda19(event: any) {
    this.metodoTipo = event.value; // Actualiza el valor de tipoBusqueda

    if (this.metodoTipo === 'Efectivo') {
      this.formularioProductoVenta.get('precioPagadoTexto')!.setValue('0'); // Establece el valor de intereses a vacío
      // this.actualizarTotal();

    } else {

      // Si no es 'Efectivo', establece 'precioPagadoTexto' a cero en todos los productos de la lista



      this.formularioProductoVenta.get('precioPagadoTexto')!.setValue('0');
      this.Vueltos = 0;
    }
  }

  onChangeTipoBusqueda17(event: any) {
    this.metodoBusquedaPago = event.value; // Actualiza el valor de tipoBusqueda

    if (this.metodoBusquedaPago === 'Pagado') {

    } else {

      // Si no es 'Efectivo', establece 'precioPagadoTexto' a cero en todos los productos de la lista


      this.formularioProductoVenta.get('precioPagadoTexto')!.setValue('0');
      this.Vueltos = 0;
    }
  }


  mostrarMesas(cliente: Usuario): string {

    return cliente.nombreCompleto!;

  }
  mostrarListaCliente(): void {
    this.listaClienteFiltrada = this.listaCliente;
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

  pagoParaVenta(event: MatAutocompleteSelectedEvent) {
    this.usuarioSeleccionado = event.option.value;
    this.paginaActual = 1;
    // console.log( this.usuarioSeleccionado);
    this.cargarpaseosPendiente();
  }


  verImagen(data: any): void {
    // console.log(data);
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: [data.imagenUrl]
      }
    });
  }




  // seleccionarPedidoUnico(pedido: any): void {
  //   // Si ya está seleccionado, desmarcarlo
  //   if (this.pedidoSeleccionado?.idPedido === pedido.idPedido) {
  //     this.pedidoSeleccionado = null;
  //   } else {
  //     this.pedidoSeleccionado = pedido;
  //   }
  // }

  filtrarEntradaCliente(event: any): void {
    const inputCliente = event.target.value;



    // const soloLetras = inputCliente.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');

    // Almacena el valor filtrado en la variable clienteFiltrado
    this.clienteFiltrado = inputCliente;

    // Establece el valor en el control del formulario
    this.formularioProductoVenta.get('cliente')?.setValue(this.clienteFiltrado);
  }



  nuevaMesa(event: MouseEvent): void {
    event.stopPropagation();
    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true

    }).afterClosed().subscribe(resultado => {
      this.listaUsuariosClientes();
    });
  }

  lastItem(item: any, list: any[]): boolean {
    return item === list[list.length - 1];
  }


  formatearNumero2(numero: number): string {
    return numero.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }


  calcularTotalCaja(element: any): string {
    const precio = parseFloat(element.precioUnitarioTexto || '0');
    const cantidad = parseFloat(element.cantidad || '0');


    // console.log(saldoInicial);
    const total = precio * cantidad;

    // console.log(suma);
    return this.formatearNumero2(total);
  }

  verDetallePedido(pedido: any): void {
    const productos = pedido.detallePedidos.map((d: any, i: number) => `
    <tr>
      <td style="padding:4px; border: 1px solid #ccc;">${i + 1}</td>
      <td style="padding:4px; border: 1px solid #ccc;">${d.descripcionProducto}</td>
      <td style="padding:4px; border: 1px solid #ccc;">${d.cantidad}</td>
      <td style="padding:4px; border: 1px solid #ccc;">${this.formatearNumero(d.precioUnitarioTexto)}</td>
      <td style="padding:4px; border: 1px solid #ccc;">${this.calcularTotalCaja(d)}</td>
      <td style="padding:4px; border: 1px solid #ccc;">${this.formatearNumero(d.totalTexto)}</td>
    </tr>
  `).join('');

    const htmlDetalle = `
    <strong>Mesa:</strong> ${pedido.nombreMesa}<br/>
    <strong>Tipo de Mesa:</strong> ${pedido.detallePedidos[0].tipoMesa}<br/>
    <strong>Atendido por:</strong> ${pedido.nombreUsuario}<br/>
    <strong>Comentario:</strong> ${pedido.comentarioGeneral}<br/><br/>
    <table style="width:100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="padding:4px; border: 1px solid #ccc;">#</th>
          <th style="padding:4px; border: 1px solid #ccc;">Producto</th>
          <th style="padding:4px; border: 1px solid #ccc;">Cant.</th>
          <th style="padding:4px; border: 1px solid #ccc;">Precio</th>
           <th style="padding:4px; border: 1px solid #ccc;">Sub Total</th>
          <th style="padding:4px; border: 1px solid #ccc;">Total</th>
        </tr>
      </thead>
      <tbody>${productos}</tbody>
    </table>
  `;

    Swal.fire({
      title: `Detalle del Pedido #${pedido.idPedido}`,
      html: htmlDetalle,
      width: '600px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6',
      customClass: {
        htmlContainer: 'swal-wide'  // Opcional para mayor estilo
      }
    });
  }


  pagarPaseo(paseo: Paseo) {

    // console.log(paseo);
    const fechaFormateada = new Date(paseo.fecha!).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });


    Swal.fire({
      title: '¿Registrar pago?',
      text: `¿Deseas registrar el pago del paseo del ${paseo.turno} (${fechaFormateada}) por ${paseo.costoTotal?.toLocaleString()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then(result => {
      if (result.isConfirmed) {


        // Inicializar las variables
        let idUsuario: number = 0;
        let idCaja: number = 0;

        // Obtener el idUsuario del localStorage
        const usuarioString = localStorage.getItem('usuario');
        const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA!);
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
                let cajaActualizada: Caja = {
                  idCaja: idCaja,
                  transaccionesTexto: (paseo.costoTotal)?.toString(),
                  ingresosTexto: (paseo.costoTotal)?.toString(),
                  metodoPago: this.tipodePagoPorDefecto,
                  estado: '',
                  nombreUsuario: '',
                  idUsuario: idUsuario
                };

                // console.log(cajaActualizada);
              } else {
                // Manejar el caso en el que no se encuentre una caja abierta para el idUsuario
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se encontró una caja abierta para el usuario actual',
                  confirmButtonText: 'Aceptar'
                });
                // Detener la ejecución
                return;
              }
            },
            error: (error) => {
              // Manejo de error y renovación de token si es necesario
              if (error === "Error al realizar la solicitud. Por favor, inténtalo de nuevo más tarde.") {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se encontró una caja abierta para el usuario actual',
                  confirmButtonText: 'Aceptar'
                });
                return
                // this.renovarTokenYSolicitarVenta();

              } else {
                this.renovarTokenYSolicitarVenta(paseo);
              }
            },
            complete: async () => {

              let TipoPago: any
              const metodo: string = this.formularioProductoVenta.value.metodoBusqueda;
              let PrecioPagado: string = this.formularioProductoVenta.value.precioPagadoTexto ?? "0";
              // console.log(PrecioPagado);
              if (this.tipodePagoPorDefecto == 'Transferencia' || this.tipodePagoPorDefecto == 'Combinado') {
                if (PrecioPagado != "0") {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Precio pagado no puede tener ningun valor porque es por ${this.tipodePagoPorDefecto}`,

                    confirmButtonText: 'Aceptar'
                  });
                  return
                }
                TipoPago = this.tipodePago;

              } else {

                TipoPago = "Sin ningún tipo de pago";
              }

              console.log(this.tipodePagoPorDefecto);
              if (this.tipodePagoPorDefecto === 'Combinado') {
                const totalVenta = (paseo.costoTotal!); // Asegúrate de tener este valor previamente calculado

                const { value: formValues } = await Swal.fire({
                  title: `Pago combinado<br><small>Total: $${totalVenta.toLocaleString()}</small>`,
                  html: `
      <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
        <label for="efectivo">💵 Efectivo:</label>
        <input id="efectivo" type="number" class="swal2-input" placeholder="Ingrese valor en efectivo">
        <label for="transferencia">🏦 Transferencia:</label>
        <input id="transferencia" type="number" class="swal2-input" placeholder="Ingrese valor en transferencia">
      </div>
    `,
                  focusConfirm: false,
                  showCancelButton: true,
                  confirmButtonColor: '#1337E8',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Aceptar',
                  cancelButtonText: 'Cancelar',
                  preConfirm: () => {
                    const efectivo = parseFloat((document.getElementById('efectivo') as HTMLInputElement).value);
                    const transferencia = parseFloat((document.getElementById('transferencia') as HTMLInputElement).value);

                    if (isNaN(efectivo) || isNaN(transferencia)) {
                      Swal.showValidationMessage('Debe ingresar valores válidos en ambos campos');
                      return;
                    }

                    const totalIngresado = efectivo + transferencia;
                    if (totalIngresado < totalVenta) {
                      Swal.showValidationMessage(`El total ingresado ($${totalIngresado.toLocaleString()}) no puede ser menor al total de la venta ($${totalVenta.toLocaleString()})`);
                      return;
                    }

                    return { efectivo, transferencia };
                  }
                });

                if (formValues) {
                  this.PrecioEfectivo = formValues.efectivo;
                  this.PrecioTransferencia = formValues.transferencia;

                  const pago: Pago = {
                    idUsuario: this.usuarioSeleccionado!.idUsuario,
                    montoTexto: paseo.costoTotal!.toString(),
                    tipoPago: this.tipodePagoPorDefecto,
                    tipoTranferencia: TipoPago,
                    precioEfectivoTexto: (this.PrecioEfectivo!).toString(),
                    precioPagadoTexto: PrecioPagado,
                    precioTransferenciaTexto: (this.PrecioTransferencia!).toString(),
                    anulada: false,
                    idCaja: idCaja
                  };
                  console.log(pago);

                  this.confirmarGeneracionFactura(pago, idCaja, paseo);


                } else {
                  this.bloquearBotonRegistrar = true;
                  console.log('El usuario canceló el pago combinado');
                }
              } else {


                let pagado: number = 0;
                let total: number = 0;
                let suma: number = 0;
                // console.log(PrecioPagado);
                pagado = parseFloat(PrecioPagado.replace(/\./g, '').replace(',', '.'));
                total = (paseo.costoTotal!)

                this.Vueltos = pagado - total

                console.log(pagado);
                // console.log(total);

                if (pagado == 0) {
                  pagado = total;

                }


                if (pagado < total) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Precio pagado no puede ser menor al total`,
                  });
                  return

                } else {

                  const pago: Pago = {
                    idUsuario: this.usuarioSeleccionado!.idUsuario,
                    montoTexto: paseo.costoTotal!.toString(),
                    tipoPago: this.tipodePagoPorDefecto,
                    tipoTranferencia: TipoPago,
                    precioEfectivoTexto: '0',
                    precioPagadoTexto: PrecioPagado,
                    precioTransferenciaTexto: '0',
                    anulada: false,
                    idCaja: idCaja
                  };
                  console.log(pago);
                  this.confirmarGeneracionFactura(pago, idCaja, paseo);

                }



              }




            }
          });


        } else {
          console.log('No se encontró el idUsuario en el localStorage');
        }



      }
    });
  }


  confirmarGeneracionFactura(request: Pago, idCaja: number, paseo: Paseo) {
    Swal.fire({
      title: '¿Desea generar factura?',
      text: 'Si generas la factura esta será almacenada en el servidor.',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Sí',
      cancelButtonColor: '#d33',
      cancelButtonText: 'No',
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {

        this.procesarRegistroPaseo(request, idCaja, paseo);


      } else {

        this.confirmarCancelacionFactura(request, idCaja, paseo);

      }
    });
  }

  confirmarGeneracionTodoPagosFactura(request: Pago, idCaja: number, paseo: Paseo) {
    Swal.fire({
      title: '¿Desea generar factura?',
      text: 'Si generas la factura esta será almacenada en el servidor.',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Sí',
      cancelButtonColor: '#d33',
      cancelButtonText: 'No',
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {

        this.procesarRegistroTodosPaseos(request, idCaja, paseo);


      } else {

        this.confirmarCancelacionTodosFactura(request, idCaja, paseo);

      }
    });
  }



  async procesarRegistroPaseo(pago: Pago, idCaja: number, paseo: Paseo) {
    this.bloquearBotonRegistrar = true;
    // Guardar el cliente seleccionado actual antes de la validación
    this.UsuarioSeleccionadoTemporal = this.usuarioSeleccionado;
    this.paseoSeleccionadoTemporal = paseo;
    //funciona
    console.log(this.paseoSeleccionadoTemporal);
    console.log(this.ListaproductoSeleccionadoTemporal);
    console.log(pago);

    this.pagoService.registrarUno(pago, paseo.idPaseo!).subscribe({
      next: (resp) => {
        Swal.close();
        if (resp.status) {
          // Swal.fire({
          //   icon: 'success',
          //   title: 'Pago registrado',
          //   text: 'El pago se registró exitosamente y el paseo fue marcado como pagado.',
          //   confirmButtonColor: '#28a745'
          // });
          console.log(resp);
          if (this.tipodeFacturaPorDefecto == "Ticket") {
            this.generarTicket(resp);

          }
          // Refrescar tabla o estado
          this.cargarpaseosPendiente();
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: resp.msg || 'No fue posible registrar el pago.',
            confirmButtonColor: '#fbc02d'
          });
        }
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'Ocurrió un problema al registrar el pago.',
          confirmButtonColor: '#d33'
        });
        console.error(err);
      },
      complete: () => {  // ✅ ahora conserva el this del componente
        this.actualizarCajaConVenta(pago, idCaja);
      }
    });


  }


  actualizarCajaConVenta(request: Pago, idCaja: number) {
    let idUsuario: number = 0;
    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA!);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    if (datosDesencriptados !== null) {
      const usuario = JSON.parse(datosDesencriptados);
      idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
    }
    console.log(request);
    if (idCaja !== undefined) {
      let suma: string = "0";

      suma = request.montoTexto!;


      let cajaActualizada: Caja = {
        idCaja: idCaja,
        transaccionesTexto: suma,
        ingresosTexto: suma,
        metodoPago: this.tipodePagoPorDefecto,
        estado: '',
        nombreUsuario: '',
        idUsuario: idUsuario
      };
      console.log(cajaActualizada);
      console.log(request);
      if (request.tipoPago == "Combinado") {
        cajaActualizada.ingresosTexto = this.PrecioEfectivo!.toString();
        cajaActualizada.transaccionesTexto = this.PrecioTransferencia!.toString();
        console.log(cajaActualizada);
        this.actualizarCajaPagosCombinado(cajaActualizada);
      } else {

        this.actualizarCaja(cajaActualizada);
      }


    } else {
      console.error('No se encontró una caja abierta para el usuario actual');
    }
    this.CantidadPagar = 0;
  }



  async procesarRegistroTodosPaseos(pago: Pago, idCaja: number, paseo: Paseo) {
    this.bloquearBotonRegistrar = true;
    // Guardar el cliente seleccionado actual antes de la validación
    this.UsuarioSeleccionadoTemporal = this.usuarioSeleccionado;
    this.paseoSeleccionadoTemporal = paseo;
    //funciona
    console.log(this.paseoSeleccionadoTemporal);
    console.log(this.ListaproductoSeleccionadoTemporal);
    console.log(pago);

    this.pagoService.registrarTodos(pago).subscribe({
      next: (resp) => {
        Swal.close();
        if (resp.status) {
          // Swal.fire({
          //   icon: 'success',
          //   title: 'Pago registrado',
          //   text: 'El pago se registró exitosamente y el paseo fue marcado como pagado.',
          //   confirmButtonColor: '#28a745'
          // });
          console.log(resp);
          if (this.tipodeFacturaPorDefecto == "Ticket") {
            this.generarTicketTodos(resp);

          }
          // Refrescar tabla o estado
          this.cargarpaseosPendiente();
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: resp.msg || 'No fue posible registrar el pago.',
            confirmButtonColor: '#fbc02d'
          });
        }
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'Ocurrió un problema al registrar el pago.',
          confirmButtonColor: '#d33'
        });
        console.error(err);
      },
      complete: () => {  // ✅ ahora conserva el this del componente
        this.actualizarCajaConVenta(pago, idCaja);
      }
    });


  }



  renovarTokenYSolicitarVenta(pedido: Paseo) {
    let idUsuario: number = 0;
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA!);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    if (datosDesencriptados !== null) {
      const usuario = JSON.parse(datosDesencriptados);
      idUsuario = usuario.idUsuario;
      this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
        (usuario: any) => {
          let refreshToken = usuario.refreshToken;
          this._usuarioServicio.renovarToken(refreshToken).subscribe(
            (response: any) => {
              localStorage.setItem('authToken', response.token);
              this.pagarPaseo(pedido);
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

  renovarTokenYSolicitarVenta2() {
    let idUsuario: number = 0;
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA!);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    if (datosDesencriptados !== null) {
      const usuario = JSON.parse(datosDesencriptados);
      idUsuario = usuario.idUsuario;
      this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
        (usuario: any) => {
          let refreshToken = usuario.refreshToken;
          this._usuarioServicio.renovarToken(refreshToken).subscribe(
            (response: any) => {
              localStorage.setItem('authToken', response.token);
              this.pagarTodosLosPaseos();
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


  procesarRegistroPagos2(pago: Pago, idCaja: number, paseo: Paseo) {
    this.bloquearBotonRegistrar = true;
    // console.log(pago);

    this.pagoService.registrarUno(pago, paseo.idPaseo!).subscribe({
      next: (resp) => {
        Swal.close();
        if (resp.status) {
          Swal.fire({
            icon: 'success',
            title: 'Pago registrado',
            text: 'El pago se registró exitosamente y el paseo fue marcado como pagado.',
            confirmButtonColor: '#28a745'
          });
          // Refrescar tabla o estado
          this.cargarpaseosPendiente();
          // if (this.tipodeFacturaPorDefecto == "Ticket") {
          //   this.generarTicket(resp);

          // }

        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: resp.msg || 'No fue posible registrar el pago.',
            confirmButtonColor: '#fbc02d'
          });
        }
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'Ocurrió un problema al registrar el pago.',
          confirmButtonColor: '#d33'
        });
        console.error(err);
      },
      complete: () => {  // ✅ ahora conserva el this del componente
        this.actualizarCajaConVenta(pago, idCaja);
      }
    });

  }
  procesarRegistroTodoPagos2(pago: Pago, idCaja: number, paseo: Paseo) {
    this.bloquearBotonRegistrar = true;
    console.log(pago);

    this.pagoService.registrarTodos(pago).subscribe({
      next: (resp) => {
        Swal.close();
        if (resp.status) {
          Swal.fire({
            icon: 'success',
            title: 'Pago registrado',
            text: 'El pago se registró exitosamente y el paseo fue marcado como pagado.',
            confirmButtonColor: '#28a745'
          });
          // Refrescar tabla o estado
          this.cargarpaseosPendiente();
          // if (this.tipodeFacturaPorDefecto == "Ticket") {
          //   this.generarTicket(resp);

          // }

        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: resp.msg || 'No fue posible registrar el pago.',
            confirmButtonColor: '#fbc02d'
          });
        }
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'Ocurrió un problema al registrar el pago.',
          confirmButtonColor: '#d33'
        });
        console.error(err);
      },
      complete: () => {  // ✅ ahora conserva el this del componente
        this.actualizarCajaConVenta(pago, idCaja);
      }
    });

  }
  confirmarCancelacionFactura(request: Pago, idCaja: number, paseo: Paseo) {
    Swal.fire({
      title: 'Cancelar generación de factura',
      text: '¿Estás seguro de que no deseas generar la factura?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar',
    }).then((confirmResult) => {
      if (confirmResult.isConfirmed) {
        Swal.fire('Cancelado', 'No se generará la factura.', 'success');
        this.bloquearBotonRegistrar = false;
      } else {
        this.procesarRegistroPagos2(request, idCaja, paseo);
      }
    });
  }

  confirmarCancelacionTodosFactura(request: Pago, idCaja: number, paseo: Paseo) {
    Swal.fire({
      title: 'Cancelar generación de factura',
      text: '¿Estás seguro de que no deseas generar la factura?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar',
    }).then((confirmResult) => {
      if (confirmResult.isConfirmed) {
        Swal.fire('Cancelado', 'No se generará la factura.', 'success');
        this.bloquearBotonRegistrar = false;
      } else {
        this.procesarRegistroTodoPagos2(request, idCaja, paseo);
      }
    });
  }



  handleErrorResponse(error: any) {
    console.error('Error al registrar la venta:', error);

    if (error && error.errors) {
      console.error('Detalles del error en el servidor:', error.errors);

      for (const key of Object.keys(error.errors)) {
        const errorMessage = error.errors[key];
        console.error(`Error en ${key}: ${errorMessage}`);
      }
    } else {
      console.error('Detalles del error desconocido:', error);
    }
  }

  reiniciarCampos(): void {
    // this.totalConDescuento=0;
    this.totalPagar = 0.00;

    this.PrecioEfectivo = 0;
    this.PrecioTransferencia = 0;
    // this.mesaSeleccionado = null;
    this.paseoSeleccionadoTemporal = null


    this.formularioProductoVenta.get('precioPagadoTexto')!.setValue('0');
    //  this.formularioProductoVenta.reset();  // Agrega esto para reiniciar el formulario

    // Asegúrate de que formularioProductoVenta no sea nulo antes de acceder a sus propiedades
    if (this.formularioProductoVenta) {
      const productoControl = this.formularioProductoVenta.get('producto');

      // Asegúrate de que productoControl no sea nulo antes de llamar a setValue
      if (productoControl) {
        productoControl.setValue('');
      }
    }

    if (this.formularioProductoVenta) {
      // Asegúrate de que el control del cliente no sea nulo antes de acceder a setValue
      const clienteControl = this.formularioProductoVenta.get('mesa');

      if (clienteControl) {
        clienteControl.setValue('');
      }
    }
  }








  actualizarCaja(caja: Caja): void {
    this.cajaService.obtenerCajaPorUsuario(caja.idUsuario).subscribe(c => {
      if (c) {
        // Actualiza los valores de ingresosTexto y metodoPago en la caja encontrada
        c.ingresosTexto = caja.ingresosTexto;
        c.metodoPago = caja.metodoPago;
        c.transaccionesTexto = caja.transaccionesTexto;
        // Llama al servicio para actualizar la caja en la base de datos
        this.cajaService.editarIngreso(c).subscribe(() => {
          console.log(`Caja actualizada para el usuario ${caja.idUsuario}: ingresosTexto = ${caja.ingresosTexto}, metodoPago = ${caja.metodoPago}`);
        });
      } else {
        console.error(`No se encontró una caja para el usuario ${caja.idUsuario}`);
      }
    }, error => {
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
                this.actualizarCaja(caja);
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

  actualizarCajaPagosCombinado(caja: Caja): void {
    this.cajaService.obtenerCajaPorUsuario(caja.idUsuario).subscribe(c => {
      if (c) {
        // Actualiza los valores de ingresosTexto y metodoPago en la caja encontrada
        c.ingresosTexto = caja.ingresosTexto;
        c.metodoPago = caja.metodoPago;
        c.transaccionesTexto = caja.transaccionesTexto;
        // Llama al servicio para actualizar la caja en la base de datos
        this.cajaService.editarPagosCombinados(c).subscribe(() => {
          console.log(`Caja actualizada para el usuario ${caja.idUsuario}: ingresosTexto = ${caja.ingresosTexto}, metodoPago = ${caja.metodoPago}`);
        });
      } else {
        console.error(`No se encontró una caja para el usuario ${caja.idUsuario}`);
      }
    }, error => {
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
                this.actualizarCaja(caja);
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


  pagarTodosLosPaseos() {
    if (!this.usuarioSeleccionado) {
      Swal.fire('Atención', 'Debe seleccionar un cliente antes de pagar.', 'warning');
      return;
    }

    if (this.paseos.length === 0) {
      Swal.fire('Atención', 'Este cliente no tiene paseos pendientes.', 'info');
      return;
    }

    Swal.fire({
      title: '¿Pagar todos los paseos?',
      text: `Se registrará el pago de todos los paseos del cliente ${this.usuarioSeleccionado.nombreCompleto}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, pagar todos',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1337E8',
      cancelButtonColor: '#d33',
    }).then(result => {
      if (result.isConfirmed) {

        // Inicializar las variables
        let idUsuario: number = 0;
        let idCaja: number = 0;

        // Obtener el idUsuario del localStorage
        const usuarioString = localStorage.getItem('usuario');
        const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA!);
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
                // let cajaActualizada: Caja = {
                //   idCaja: idCaja,
                //   transaccionesTexto: (paseo.costoTotal)?.toString(),
                //   ingresosTexto: (paseo.costoTotal)?.toString(),
                //   metodoPago: this.tipodePagoPorDefecto,
                //   estado: '',
                //   nombreUsuario: '',
                //   idUsuario: idUsuario
                // };

                // console.log(cajaActualizada);
              } else {
                // Manejar el caso en el que no se encuentre una caja abierta para el idUsuario
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se encontró una caja abierta para el usuario actual',
                  confirmButtonText: 'Aceptar'
                });
                // Detener la ejecución
                return;
              }
            },
            error: (error) => {
              // Manejo de error y renovación de token si es necesario
              if (error === "Error al realizar la solicitud. Por favor, inténtalo de nuevo más tarde.") {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se encontró una caja abierta para el usuario actual',
                  confirmButtonText: 'Aceptar'
                });
                return
                // this.renovarTokenYSolicitarVenta();

              } else {
                this.renovarTokenYSolicitarVenta2();
              }
            },
            complete: async () => {


              this.pagoService.totalPorCliente(this.usuarioSeleccionado?.idUsuario!).subscribe({
                next: async (resp) => {
                  if (resp.status) {
                    console.log(resp);
                    let totalDeuda = resp.value.total;
                    let paseo = resp.value.paseos;
                    this.paseoSeleccionadoTemporal = paseo;

                    // 1️⃣ Mostrar resumen total antes de continuar
                    const paseosDetalleHtml = Array.isArray(paseo)
                      ? paseo.map((p: any) =>
                        `<li>#${p.idPaseo} - ${new Date(p.fecha).toLocaleDateString('es-CO')} - ${p.turno} - $${p.costoTotal.toLocaleString()}</li>`
                      ).join('')
                      : '';

                    const { isConfirmed } = await Swal.fire({
                      title: `Resumen del pago`,
                      html: `
          <p>Cliente: <b>${this.usuarioSeleccionado!.nombreCompleto}</b></p>
          <p>Total a pagar: <b>$${totalDeuda.toLocaleString()}</b></p>
          <p>Número de paseos: <b>${paseo.length}</b></p>
          <ul style="text-align:left;">${paseosDetalleHtml}</ul>
        `,
                      icon: 'info',
                      showCancelButton: true,
                      confirmButtonText: 'Continuar',
                      cancelButtonText: 'Cancelar',
                      confirmButtonColor: '#1337E8',
                      cancelButtonColor: '#d33',
                      width: '500px'
                    });

                    if (!isConfirmed) return; // si canceló, salir

                    // 2️⃣ Ahora continúa tu lógica existente para pago combinado o normal
                    let TipoPago: any;
                    const metodo: string = this.formularioProductoVenta.value.metodoBusqueda;
                    let PrecioPagado: string = this.formularioProductoVenta.value.precioPagadoTexto ?? "0";

                    if (this.tipodePagoPorDefecto == 'Transferencia' || this.tipodePagoPorDefecto == 'Combinado') {
                      if (PrecioPagado != "0") {
                        Swal.fire({
                          icon: 'error',
                          title: 'Error',
                          text: `Precio pagado no puede tener ningún valor porque es por ${this.tipodePagoPorDefecto}`,
                          confirmButtonText: 'Aceptar'
                        });
                        return;
                      }
                      TipoPago = this.tipodePago;
                    } else {
                      TipoPago = "Sin ningún tipo de pago";
                    }

                    console.log(this.tipodePagoPorDefecto);

                    if (this.tipodePagoPorDefecto === 'Combinado') {
                      const totalVenta = totalDeuda;
                      const { value: formValues } = await Swal.fire({
                        title: `Pago combinado<br><small>Total: $${totalVenta.toLocaleString()}</small>`,
                        html: `
            <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
              <label for="efectivo">💵 Efectivo:</label>
              <input id="efectivo" type="number" class="swal2-input" placeholder="Ingrese valor en efectivo">
              <label for="transferencia">🏦 Transferencia:</label>
              <input id="transferencia" type="number" class="swal2-input" placeholder="Ingrese valor en transferencia">
            </div>
          `,
                        focusConfirm: false,
                        showCancelButton: true,
                        confirmButtonColor: '#1337E8',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Aceptar',
                        cancelButtonText: 'Cancelar',
                        preConfirm: () => {
                          const efectivo = parseFloat((document.getElementById('efectivo') as HTMLInputElement).value);
                          const transferencia = parseFloat((document.getElementById('transferencia') as HTMLInputElement).value);

                          if (isNaN(efectivo) || isNaN(transferencia)) {
                            Swal.showValidationMessage('Debe ingresar valores válidos en ambos campos');
                            return;
                          }

                          const totalIngresado = efectivo + transferencia;
                          if (totalIngresado < totalVenta) {
                            Swal.showValidationMessage(`El total ingresado ($${totalIngresado.toLocaleString()}) no puede ser menor al total de la venta ($${totalVenta.toLocaleString()})`);
                            return;
                          }

                          return { efectivo, transferencia };
                        }
                      });

                      if (formValues) {
                        this.PrecioEfectivo = formValues.efectivo;
                        this.PrecioTransferencia = formValues.transferencia;

                        const pago: Pago = {
                          idUsuario: this.usuarioSeleccionado!.idUsuario,
                          montoTexto: totalDeuda!.toString(),
                          tipoPago: this.tipodePagoPorDefecto,
                          tipoTranferencia: TipoPago,
                          precioEfectivoTexto: (this.PrecioEfectivo!).toString(),
                          precioPagadoTexto: PrecioPagado,
                          precioTransferenciaTexto: (this.PrecioTransferencia!).toString(),
                          anulada: false,
                          idCaja: idCaja
                        };
                        console.log(pago);

                        this.confirmarGeneracionTodoPagosFactura(pago, idCaja, paseo);

                      } else {
                        this.bloquearBotonRegistrar = true;
                        console.log('El usuario canceló el pago combinado');
                      }

                    } else {
                      let pagado: number = parseFloat(PrecioPagado.replace(/\./g, '').replace(',', '.'));
                      let total: number = totalDeuda;
                      this.Vueltos = pagado - total;

                      if (pagado == 0) pagado = total;

                      if (pagado < total) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Error',
                          text: `Precio pagado no puede ser menor al total`,
                        });
                        return;
                      }

                      const pago: Pago = {
                        idUsuario: this.usuarioSeleccionado!.idUsuario,
                        montoTexto: totalDeuda!.toString(),
                        tipoPago: this.tipodePagoPorDefecto,
                        tipoTranferencia: TipoPago,
                        precioEfectivoTexto: '0',
                        precioPagadoTexto: PrecioPagado,
                        precioTransferenciaTexto: '0',
                        anulada: false,
                        idCaja: idCaja
                      };
                      console.log(pago);
                      this.confirmarGeneracionTodoPagosFactura(pago, idCaja, paseo);
                    }
                  }
                },
                error: (err) => console.error('Error al obtener total:', err)
              });







            }
          });


        } else {
          console.log('No se encontró el idUsuario en el localStorage');
        }

      }
    });
  }


  async generarTicket(ventaData: any) {


    // console.log(ventaData);
    // console.log(ventaData.value.detalleVenta[0].precioPagadoTexto);

    // Llamada al servicio para obtener la información de la empresa
    this.empresaService.lista().subscribe({
      next: (response) => {
        // Verificar si la respuesta tiene éxito (status = true)
        if (response.status) {

          // Mostrar SweetAlert2 para preguntar por el tamaño del ticket
          Swal.fire({
            title: 'Seleccionar Tamaño del Ticket',
            input: 'radio',
            inputOptions: {
              '58': '58mm',
              '80': '80mm',
            },
            inputValidator: (value) => {
              if (!value) {
                return 'Por favor selecciona un tamaño de ticket';
              }
              return null;
            },
            showCancelButton: true,
            confirmButtonColor: '#1337E8',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false,
          }).then((result) => {

            if (result.isConfirmed) {
              // Capturar el valor seleccionado
              const tamañoTicket = result.value;

              // Configurar el tamaño de página basado en la selección
              const pageSize = tamañoTicket === '58' ? { width: 58, height: 'auto' } : { width: 80, height: 'auto' };

              // console.log('Tamaño del ticket seleccionado:', tamañoTicket);
              // console.log('Configuración del tamaño de página:', pageSize);

              // Ajustar el tamaño del texto del encabezado
              const headerStyle = tamañoTicket === '58'
                ? { fontSize: '1' }  // Tamaño de fuente para 58mm
                : { fontSize: '2' }; // Tamaño de fuente para 80mm

              const mensaje = tamañoTicket === '58' ?
                "***** Ticket de Pagos *****"
                :
                "********** Ticket de Pagos **********"

              const rayas = tamañoTicket === '58' ?
                "---------------------------------------------------------------------------"
                :
                "-----------------------------------------------------------------------------------------------------------"



              const empresas = response.value as Empresa[];
              // if (empresas.length > 0) {

              // Inicializar las variables
              let idUsuario: number = 0;
              let idCaja: number = 0;

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
                  next: async (caja: Caja | null) => {
                    if (caja !== null) {
                      // Si se encuentra una caja abierta para el idUsuario
                      idCaja = caja.idCaja;
                      let UsuarioDatosTemporal: any;
                      // Verificar si this.clienteSeleccionado es válido antes de continuar
                      if (!this.usuarioSeleccionado || !this.usuarioSeleccionado!.nombreCompleto) {
                        // throw new Error('No se ha seleccionado un cliente válido.');
                        // this.clienteSeleccionado = this.clienteSeleccionadoTemporal;
                        UsuarioDatosTemporal = this.UsuarioSeleccionadoTemporal;
                        // ventaData.value.detalleVenta = [...this.ListaproductoSeleccionadoTemporal];
                        // console.log(this.listaProductoParaVenta);
                      }

                      UsuarioDatosTemporal = this.UsuarioSeleccionadoTemporal;

                      const nombreCliente = UsuarioDatosTemporal!.nombreCompleto! || 'No disponible';



                      const empresa = empresas[0];
                      // Extraer los datos de la empresa
                      const nombreEmpresa = empresa ? empresa.nombreEmpresa : 'No disponible';
                      const direccion2 = empresa ? empresa.direccion : 'No disponible';
                      const telefono2 = empresa ? empresa.telefono : 'No disponible';
                      const correo = empresa ? empresa.correo : 'No disponible';
                      const rut = empresa ? empresa.rut : 'No disponible';
                      const logoBase64 = empresa ? empresa.logo : '';
                      // Agregar prefijo al logo base64
                      let logoBase64WithPrefix = 'data:image/png;base64,' + logoBase64;
                      const numeroDocumento = ventaData.value.idPago != null ? ventaData.value.idPago : 'No disponible';
                      const usuarioString = localStorage.getItem('usuario');
                      const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
                      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
                      // Verificar si usuarioString es nulo antes de parsearlo
                      const usuario = datosDesencriptados ? JSON.parse(datosDesencriptados) : null;
                      // Obtener el nombre completo del usuario si existe
                      const nombreUsuario = usuario ? usuario.nombreCompleto : 'Desconocido';

                      const urlQR = `https://ruta-3-23.web.app/menu/consultar_Pagos?pagos=${this.usuarioSeleccionado!.correo}`;
                      const qrImageBase64 = await QRCode.toDataURL(urlQR);

                      // Obtener la fecha y hora actual para mostrarla en el ticket
                      const fechaActual = new Date().toLocaleString('es-CO', {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      });

                      const TipoPago = this.tipodePagoPorDefecto
                      const MedioPago = this.tipodePago

                      // Crear un array para almacenar la información de la tienda
                      let informacionTienda: any[] = [

                      ];

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
                      // Agregar el resto de la información de la tienda
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
                      // Calcular el precio pagado total, que abarca toda la venta
                      // const precioPagadoTotal = this.parseNumeroColombiano(ventaData.value.detalleVenta[0].precioPagadoTexto);
                      const precioPagadoTotal = this.parseNumeroColombiano(this.formularioProductoVenta.get('precioPagadoTexto')!.value || '0');

                      // Calcular el vuelto total restando el total de la venta del precio pagado total
                      let vueltoTotal;
                      let precioEfectivo
                      let precioTransferencia
                      let totalVenta
                      let totalPagado
                      if (this.tipodePagoPorDefecto == "Transferencia" || this.tipodePagoPorDefecto == "Fiado") {
                        vueltoTotal = "0";

                      } else {
                        if (this.tipodePagoPorDefecto == "Combinado") {
                          precioEfectivo = parseFloat(ventaData.value.precioEfectivoTexto) || 0;
                          precioTransferencia = parseFloat(ventaData.value.precioTransferenciaTexto) || 0;
                          totalVenta = parseFloat(ventaData.value.montoTexto) || 0
                          totalPagado = precioEfectivo + precioTransferencia;
                          vueltoTotal = totalPagado > totalVenta ? totalPagado - totalVenta : 0;

                        } else {
                          if (precioPagadoTotal > 0) {
                            vueltoTotal = precioPagadoTotal - parseFloat(ventaData.value.montoTexto);

                          } else {
                            vueltoTotal = precioPagadoTotal

                          }

                        }

                      }


                      const documentDefinition: any = {
                        pageSize,
                        // pageSize: { width: 80, height: 297 }, // Tamaño típico de un ticket
                        pageMargins: [2, 3, 5, 1], // Márgenes [izquierda, arriba, derecha, abajo]
                        content: [
                          ...informacionTienda,
                          // Agregar el nombre de usuario
                          { text: mensaje, style: 'header' },
                          { text: `Atendido por: ${nombreUsuario}`, style: 'subheader' },
                          { text: `Fecha de emisión: ${fechaActual}`, style: 'subheader' },
                          { text: `Id de Pago: ${numeroDocumento}`, style: 'subheader' },
                          { text: `Nombre del cliente: ${nombreCliente}`, style: 'subheader' },
                          ...(TipoPago === 'Combinado' || TipoPago === 'Transferencia' ? [
                            { text: `Medio de Pago: ${MedioPago}`, style: 'subheader' },

                          ] : []),
                          { text: '' }, // Espacio en blanco
                          {
                            text: rayas, style: 'subheader2'
                          },
                          // Tabla de detalles de productos vendidos
                          {
                            table: {
                              headerRows: 1,
                              widths: tamañoTicket === '80'
                                ? ['auto', '*', 'auto', 'auto', 'auto']
                                : ['auto', '*', 'auto', 'auto', 'auto'],
                              alignment: 'center',
                              body: [
                                [
                                  { text: 'Id Paseo', style: 'tableHeader', alignment: 'center' },
                                  { text: 'Fecha', style: 'tableHeader', alignment: 'center' },
                                  { text: 'Perros', style: 'tableHeader', alignment: 'center' },
                                  { text: 'Turno', style: 'tableHeader', alignment: 'center' },
                                  { text: 'Tarifa', style: 'tableHeader', alignment: 'center' },
                                  // { text: 'Total', style: 'tableHeader', alignment: 'center' }
                                ],
                                ...this.paseoSeleccionadoTemporal.perros.map((perro: any) => ([
                                  { text: this.paseoSeleccionadoTemporal.idPaseo, alignment: 'center', style: 'peque' },
                                  { text: this.paseoSeleccionadoTemporal.fecha.split('T')[0], alignment: 'center', style: 'peque' },
                                  { text: perro.nombre, alignment: 'center', style: 'peque' },
                                  { text: this.paseoSeleccionadoTemporal.turno, alignment: 'center', style: 'peque' },
                                  { text: this.paseoSeleccionadoTemporal.nombreTarifa, alignment: 'center', style: 'peque' },
                                  // { text: this.formatearNumero(this.paseoSeleccionadoTemporal.costoTotal.toString()), alignment: 'center', style: 'peque' }
                                ]))
                              ]
                            },
                            layout: {
                              // Reducir el tamaño de fuente y el tamaño de las celdas para acercarlas
                              defaultBorder: false,
                              hLineWidth: () => 0.5,
                              vLineWidth: () => 0.5,
                              paddingLeft: () => 0, // Reducir el espacio interno a la izquierda de las celdas
                              paddingRight: () => 0.5, // Reducir el espacio interno a la derecha de las celdas
                              paddingTop: () => 0, // Reducir el espacio superior, le quita espacio de uno arriba de otro
                              paddingBottom: () => 0, // Reducir el espacio inferior
                            },
                            margin: [0, 0, 0, 0]
                          },

                          // {

                          //   text: rayas, style: 'subheader'
                          // },
                          // { text: `Total de Iva: ${totalIva.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader' },
                          { text: '-----------------------------------------------', alignment: 'right', style: 'subheader2' },
                          // Separador decorativo
                          { text: '' },
                          { text: `Recibido: ${precioPagadoTotal.toLocaleString('es-CO')} $`, alignment: 'right', style: 'subheader' },
                          { text: `Total del pago: ${this.formatearNumeroMostrado(ventaData.value.montoTexto)} $`, alignment: 'right', style: 'subheader' },
                          { text: '-----------------------------------------------', alignment: 'right', style: 'subheader2' },
                          // { text: `Vueltos : ${vueltoTotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader' },
                          // 👇 INSERTAMOS CONDICIÓN AQUÍ
                          ...(this.tipodePagoPorDefecto === 'Combinado' ? [
                            {
                              text: `Pago en efectivo: ${this.formatearNumeroMostrado(ventaData.value.precioEfectivoTexto)} $`,
                              alignment: 'right',
                              style: 'subheader'
                            },
                            {
                              text: `Pago por transferencia: ${this.formatearNumeroMostrado(ventaData.value.precioTransferenciaTexto)} $`,
                              alignment: 'right',
                              style: 'subheader'
                            },

                            ...(precioEfectivo! > totalVenta! ? [
                              {
                                text: `Vueltos en efectivo : ${vueltoTotal.toLocaleString('es-CO',
                                  { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                              },
                            ] : []),

                            ...(precioTransferencia! > totalVenta! ? [
                              {
                                text: `Vueltos en transferencia : ${vueltoTotal.toLocaleString('es-CO',
                                  { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                              },
                            ] : []),
                            ...(totalVenta! == totalPagado! ? [
                              {
                                text: `Vueltos : ${vueltoTotal.toLocaleString('es-CO',
                                  { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                              },
                            ] : [


                              {
                                text: `Vueltos : ${vueltoTotal.toLocaleString('es-CO',
                                  { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                              },
                            ]),

                          ] : []),

                          ...(this.tipodePagoPorDefecto !== 'Combinado' ? [
                            {
                              text: `Vueltos : ${vueltoTotal.toLocaleString('es-CO',
                                { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                            },
                          ] : []),

                          {
                            text: rayas, style: 'subheader2'
                          }, // Separador decorativo
                          { text: '' },
                          { text: 'Escanee su pago:', alignment: 'center', style: 'subheader' },
                          { image: qrImageBase64, alignment: 'center', margin: [0, 0], fit: [35, 35] },
                          // { text: urlQR, alignment: 'center', fontSize: 2 }, // opcional, puedes mostrar la URL debajo

                          {
                            text: rayas, style: 'subheader2'
                          }, // Separador decorativo
                          { text: '' },
                          {
                            text: '¡Gracias por su pago!',
                            alignment: 'center',
                            style: 'header',
                            margin: [0, 10, 0, 0],
                          },
                          {
                            text: 'Esperamos volver a servirle muy pronto.',
                            alignment: 'center',
                            style: 'subheader',
                            margin: [0, 0, 0, 5],
                          },
                          {
                            text: [
                              { text: '¿Interesado en este sistema o uno similar? ', bold: true },
                              'Contáctame: '
                            ],
                            alignment: 'center',
                            style: 'subheader',
                            margin: [0, 15, 0, 0],
                          },
                          {
                            text: [
                              { text: 'Carlos Cotes\n', bold: true },
                              ' 301 209 1145\n',
                              ' carloscotes48@gmail.com\n'
                            ],
                            alignment: 'center',
                            style: 'subheader',
                            // color: '#555555'
                          },

                          {
                            // Mensaje de validez para devoluciones de productos
                            text: '\n',

                          }
                        ],

                        styles: tamañoTicket === '80' ? {
                          // Estilos para ticket de 80mm
                          header: {
                            fontSize: 4,
                            bold: true,
                            alignment: 'center',
                            margin: [0, 0, 0, 2] // Margen inferior de 20 unidades
                          },
                          subheader: {
                            fontSize: 3,
                            bold: true,
                            // margin: [0, 0, 0, 1] // Margen inferior de 10 unidades
                          },
                          subheader2: {
                            fontSize: 2,
                            bold: true,
                            // margin: [0, 0, 0, 1] // Margen inferior de 10 unidades
                          },
                          tableHeader: {
                            bold: true,
                            fontSize: 3, // Reducir el tamaño de fuente a 5
                            color: 'black',
                          },
                          peque: {

                            fontSize: 3,
                            bold: true,
                            // margin: [0, 0, 0, 1]
                          },

                        } : {
                          header: {
                            fontSize: 4,
                            bold: true,
                            alignment: 'center',
                            margin: [0, 0, 0, 2] // Margen inferior de 20 unidades
                          },
                          subheader: {
                            fontSize: 2,
                            bold: true,
                            // margin: [0, 0, 0, 1] // Margen inferior de 10 unidades
                          },
                          subheader2: {
                            fontSize: 2,
                            bold: true,
                            // margin: [0, 0, 0, 1] // Margen inferior de 10 unidades
                          },
                          tableHeader: {
                            bold: true,
                            fontSize: 2, // Reducir el tamaño de fuente a 5
                            color: 'black',
                          },
                          peque: {

                            fontSize: 2,
                            bold: true,
                            // margin: [0, 0, 0, 1]
                          },
                        }
                      };
                      this.reiniciarCampos();
                      this.cargarpaseosPendiente();
                      // Swal.fire({
                      //   icon: 'success',
                      //   title: 'Venta Registrada.',
                      //   text: `Venta Registrada: ${numeroDocumento}`,
                      // });

                      Swal.fire({
                        icon: 'success',
                        title: 'Pago registrado',
                        text: 'El pago se registró exitosamente y el paseo fue marcado como pagado.',
                        // confirmButtonColor: '#28a745'
                      });

                      pdfMake.vfs = pdfFonts.pdfMake.vfs;
                      const pdfDoc = pdfMake.createPdf(documentDefinition);

                      pdfDoc.getBase64((data) => {
                        // Abrir el PDF en una nueva ventana del navegador
                        const win = window.open();
                        if (win) {
                          win.document.write('<iframe width="100%" height="100%" src="data:application/pdf;base64,' + data + '"></iframe>');
                        } else {
                          console.error('No se pudo abrir la ventana del navegador.');
                        }
                      });
                    } else {
                      // Manejar el caso en el que no se encuentre una caja abierta para el idUsuario
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se encontró una caja abierta para el usuario actual',
                        confirmButtonText: 'Aceptar'
                      });
                      // Detener la ejecución
                      return;
                    }

                  },
                  error: (error) => {

                    let idUsuario: number = 0;
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
                              this.generarTicket(ventaData);
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





            } else {
              const numeroDocumento = ventaData.value.numeroDocumento != null ? ventaData.value.numeroDocumento : 'No disponible';

              // El usuario canceló la operación
              Swal.fire('Cancelado', `Venta Registrada, pero no se generó el ticket. Número de venta: ${numeroDocumento}`, 'info');
              this.bloquearBotonRegistrar = true;
            }
          });




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
                  this.generarTicket(ventaData);
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

  async generarTicketTodos(ventaData: any) {


    // console.log(ventaData);
    // console.log(ventaData.value.detalleVenta[0].precioPagadoTexto);

    // Llamada al servicio para obtener la información de la empresa
    this.empresaService.lista().subscribe({
      next: (response) => {
        // Verificar si la respuesta tiene éxito (status = true)
        if (response.status) {

          // Mostrar SweetAlert2 para preguntar por el tamaño del ticket
          Swal.fire({
            title: 'Seleccionar Tamaño del Ticket',
            input: 'radio',
            inputOptions: {
              '58': '58mm',
              '80': '80mm',
            },
            inputValidator: (value) => {
              if (!value) {
                return 'Por favor selecciona un tamaño de ticket';
              }
              return null;
            },
            showCancelButton: true,
            confirmButtonColor: '#1337E8',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            allowOutsideClick: false,
          }).then((result) => {

            if (result.isConfirmed) {
              // Capturar el valor seleccionado
              const tamañoTicket = result.value;

              // Configurar el tamaño de página basado en la selección
              const pageSize = tamañoTicket === '58' ? { width: 58, height: 'auto' } : { width: 80, height: 'auto' };

              // console.log('Tamaño del ticket seleccionado:', tamañoTicket);
              // console.log('Configuración del tamaño de página:', pageSize);

              // Ajustar el tamaño del texto del encabezado
              const headerStyle = tamañoTicket === '58'
                ? { fontSize: '1' }  // Tamaño de fuente para 58mm
                : { fontSize: '2' }; // Tamaño de fuente para 80mm

              const mensaje = tamañoTicket === '58' ?
                "***** Ticket de Pagos *****"
                :
                "********** Ticket de Pagos **********"

              const rayas = tamañoTicket === '58' ?
                "---------------------------------------------------------------------------"
                :
                "-----------------------------------------------------------------------------------------------------------"



              const empresas = response.value as Empresa[];
              // if (empresas.length > 0) {

              // Inicializar las variables
              let idUsuario: number = 0;
              let idCaja: number = 0;

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
                  next: async (caja: Caja | null) => {
                    if (caja !== null) {
                      // Si se encuentra una caja abierta para el idUsuario
                      idCaja = caja.idCaja;
                      let UsuarioDatosTemporal: any;
                      // Verificar si this.clienteSeleccionado es válido antes de continuar
                      if (!this.usuarioSeleccionado || !this.usuarioSeleccionado!.nombreCompleto) {
                        // throw new Error('No se ha seleccionado un cliente válido.');
                        // this.clienteSeleccionado = this.clienteSeleccionadoTemporal;
                        UsuarioDatosTemporal = this.UsuarioSeleccionadoTemporal;
                        // ventaData.value.detalleVenta = [...this.ListaproductoSeleccionadoTemporal];
                        // console.log(this.listaProductoParaVenta);
                      }

                      UsuarioDatosTemporal = this.UsuarioSeleccionadoTemporal;

                      const nombreCliente = UsuarioDatosTemporal!.nombreCompleto! || 'No disponible';



                      const empresa = empresas[0];
                      // Extraer los datos de la empresa
                      const nombreEmpresa = empresa ? empresa.nombreEmpresa : 'No disponible';
                      const direccion2 = empresa ? empresa.direccion : 'No disponible';
                      const telefono2 = empresa ? empresa.telefono : 'No disponible';
                      const correo = empresa ? empresa.correo : 'No disponible';
                      const rut = empresa ? empresa.rut : 'No disponible';
                      const logoBase64 = empresa ? empresa.logo : '';
                      // Agregar prefijo al logo base64
                      let logoBase64WithPrefix = 'data:image/png;base64,' + logoBase64;
                      const numeroDocumento = ventaData.value.idPago != null ? ventaData.value.idPago : 'No disponible';
                      const usuarioString = localStorage.getItem('usuario');
                      const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
                      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
                      // Verificar si usuarioString es nulo antes de parsearlo
                      const usuario = datosDesencriptados ? JSON.parse(datosDesencriptados) : null;
                      // Obtener el nombre completo del usuario si existe
                      const nombreUsuario = usuario ? usuario.nombreCompleto : 'Desconocido';

                      const urlQR = `https://ruta-3-23.web.app/menu/consultar_Pagos?pagos=${this.usuarioSeleccionado!.correo}`;
                      const qrImageBase64 = await QRCode.toDataURL(urlQR);

                      // Obtener la fecha y hora actual para mostrarla en el ticket
                      const fechaActual = new Date().toLocaleString('es-CO', {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      });

                      const TipoPago = this.tipodePagoPorDefecto
                      const MedioPago = this.tipodePago

                      // Crear un array para almacenar la información de la tienda
                      let informacionTienda: any[] = [

                      ];

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
                      // Agregar el resto de la información de la tienda
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
                      // Calcular el precio pagado total, que abarca toda la venta
                      // const precioPagadoTotal = this.parseNumeroColombiano(ventaData.value.detalleVenta[0].precioPagadoTexto);
                      const precioPagadoTotal = this.parseNumeroColombiano(this.formularioProductoVenta.get('precioPagadoTexto')!.value || '0');

                      // Calcular el vuelto total restando el total de la venta del precio pagado total
                      let vueltoTotal;
                      let precioEfectivo
                      let precioTransferencia
                      let totalVenta
                      let totalPagado
                      if (this.tipodePagoPorDefecto == "Transferencia" || this.tipodePagoPorDefecto == "Fiado") {
                        vueltoTotal = "0";

                      } else {
                        if (this.tipodePagoPorDefecto == "Combinado") {
                          precioEfectivo = parseFloat(ventaData.value.precioEfectivoTexto) || 0;
                          precioTransferencia = parseFloat(ventaData.value.precioTransferenciaTexto) || 0;
                          totalVenta = parseFloat(ventaData.value.montoTexto) || 0
                          totalPagado = precioEfectivo + precioTransferencia;
                          vueltoTotal = totalPagado > totalVenta ? totalPagado - totalVenta : 0;

                        } else {
                          if (precioPagadoTotal > 0) {
                            vueltoTotal = precioPagadoTotal - parseFloat(ventaData.value.montoTexto);

                          } else {
                            vueltoTotal = precioPagadoTotal

                          }

                        }

                      }


                      const documentDefinition: any = {
                        pageSize,
                        // pageSize: { width: 80, height: 297 }, // Tamaño típico de un ticket
                        pageMargins: [2, 3, 5, 1], // Márgenes [izquierda, arriba, derecha, abajo]
                        content: [
                          ...informacionTienda,
                          // Agregar el nombre de usuario
                          { text: mensaje, style: 'header' },
                          { text: `Atendido por: ${nombreUsuario}`, style: 'subheader' },
                          { text: `Fecha de emisión: ${fechaActual}`, style: 'subheader' },
                          { text: `Id de Pago: ${numeroDocumento}`, style: 'subheader' },
                          { text: `Nombre del cliente: ${nombreCliente}`, style: 'subheader' },
                          ...(TipoPago === 'Combinado' || TipoPago === 'Transferencia' ? [
                            { text: `Medio de Pago: ${MedioPago}`, style: 'subheader' },

                          ] : []),
                          { text: '' }, // Espacio en blanco
                          {
                            text: rayas, style: 'subheader2'
                          },
                          // Tabla de detalles de productos vendidos
                          {
                            table: {
                              headerRows: 1,
                              widths: tamañoTicket === '80'
                                ? ['auto', '*', 'auto', 'auto', 'auto']
                                : ['auto', '*', 'auto', 'auto', 'auto'],
                              alignment: 'center',
                              body: [
                                [
                                  { text: 'Id Paseo', style: 'tableHeader', alignment: 'center' },
                                  { text: 'Fecha', style: 'tableHeader', alignment: 'center' },
                                  { text: 'Perros', style: 'tableHeader', alignment: 'center' },
                                  { text: 'Turno', style: 'tableHeader', alignment: 'center' },
                                  { text: 'Tarifa', style: 'tableHeader', alignment: 'center' }
                                ],
                                // 🔥 Aquí recorremos cada paseo y sus perros
                                ...this.paseoSeleccionadoTemporal.flatMap((paseo: any) =>
                                  paseo.perros.map((perro: any) => ([
                                    { text: paseo.idPaseo.toString(), alignment: 'center', style: 'peque' },
                                    { text: (paseo.fecha ?? '').split('T')[0], alignment: 'center', style: 'peque' },
                                    { text: perro.nombre, alignment: 'center', style: 'peque' },
                                    { text: paseo.turno, alignment: 'center', style: 'peque' },
                                    { text: paseo.nombreTarifa, alignment: 'center', style: 'peque' }
                                  ]))
                                )
                              ]
                            },
                            layout: {
                              // Reducir el tamaño de fuente y el tamaño de las celdas para acercarlas
                              defaultBorder: false,
                              hLineWidth: () => 0.5,
                              vLineWidth: () => 0.5,
                              paddingLeft: () => 0, // Reducir el espacio interno a la izquierda de las celdas
                              paddingRight: () => 0.5, // Reducir el espacio interno a la derecha de las celdas
                              paddingTop: () => 0, // Reducir el espacio superior, le quita espacio de uno arriba de otro
                              paddingBottom: () => 0, // Reducir el espacio inferior
                            },
                            margin: [0, 0, 0, 0]
                          },

                          // {

                          //   text: rayas, style: 'subheader'
                          // },
                          // { text: `Total de Iva: ${totalIva.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader' },
                          { text: '-----------------------------------------------', alignment: 'right', style: 'subheader2' },
                          // Separador decorativo
                          { text: '' },
                          { text: `Recibido: ${precioPagadoTotal.toLocaleString('es-CO')} $`, alignment: 'right', style: 'subheader' },
                          { text: `Total del pago: ${this.formatearNumeroMostrado(ventaData.value.montoTexto)} $`, alignment: 'right', style: 'subheader' },
                          { text: '-----------------------------------------------', alignment: 'right', style: 'subheader2' },
                          // { text: `Vueltos : ${vueltoTotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader' },
                          // 👇 INSERTAMOS CONDICIÓN AQUÍ
                          ...(this.tipodePagoPorDefecto === 'Combinado' ? [
                            {
                              text: `Pago en efectivo: ${this.formatearNumeroMostrado(ventaData.value.precioEfectivoTexto)} $`,
                              alignment: 'right',
                              style: 'subheader'
                            },
                            {
                              text: `Pago por transferencia: ${this.formatearNumeroMostrado(ventaData.value.precioTransferenciaTexto)} $`,
                              alignment: 'right',
                              style: 'subheader'
                            },

                            ...(precioEfectivo! > totalVenta! ? [
                              {
                                text: `Vueltos en efectivo : ${vueltoTotal.toLocaleString('es-CO',
                                  { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                              },
                            ] : []),

                            ...(precioTransferencia! > totalVenta! ? [
                              {
                                text: `Vueltos en transferencia : ${vueltoTotal.toLocaleString('es-CO',
                                  { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                              },
                            ] : []),
                            ...(totalVenta! == totalPagado! ? [
                              {
                                text: `Vueltos : ${vueltoTotal.toLocaleString('es-CO',
                                  { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                              },
                            ] : [


                              {
                                text: `Vueltos : ${vueltoTotal.toLocaleString('es-CO',
                                  { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                              },
                            ]),

                          ] : []),

                          ...(this.tipodePagoPorDefecto !== 'Combinado' ? [
                            {
                              text: `Vueltos : ${vueltoTotal.toLocaleString('es-CO',
                                { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $`, alignment: 'right', style: 'subheader'
                            },
                          ] : []),

                          {
                            text: rayas, style: 'subheader2'
                          }, // Separador decorativo
                          { text: '' },
                          { text: 'Escanee su pago:', alignment: 'center', style: 'subheader' },
                          { image: qrImageBase64, alignment: 'center', margin: [0, 0], fit: [35, 35] },
                          // { text: urlQR, alignment: 'center', fontSize: 2 }, // opcional, puedes mostrar la URL debajo

                          {
                            text: rayas, style: 'subheader2'
                          }, // Separador decorativo
                          { text: '' },
                          {
                            text: '¡Gracias por su pago!',
                            alignment: 'center',
                            style: 'header',
                            margin: [0, 10, 0, 0],
                          },
                          {
                            text: 'Esperamos volver a servirle muy pronto.',
                            alignment: 'center',
                            style: 'subheader',
                            margin: [0, 0, 0, 5],
                          },
                          {
                            text: [
                              { text: '¿Interesado en este sistema o uno similar? ', bold: true },
                              'Contáctame: '
                            ],
                            alignment: 'center',
                            style: 'subheader',
                            margin: [0, 15, 0, 0],
                          },
                          {
                            text: [
                              { text: 'Carlos Cotes\n', bold: true },
                              ' 301 209 1145\n',
                              ' carloscotes48@gmail.com\n'
                            ],
                            alignment: 'center',
                            style: 'subheader',
                            // color: '#555555'
                          },

                          {
                            // Mensaje de validez para devoluciones de productos
                            text: '\n',

                          }
                        ],

                        styles: tamañoTicket === '80' ? {
                          // Estilos para ticket de 80mm
                          header: {
                            fontSize: 4,
                            bold: true,
                            alignment: 'center',
                            margin: [0, 0, 0, 2] // Margen inferior de 20 unidades
                          },
                          subheader: {
                            fontSize: 3,
                            bold: true,
                            // margin: [0, 0, 0, 1] // Margen inferior de 10 unidades
                          },
                          subheader2: {
                            fontSize: 2,
                            bold: true,
                            // margin: [0, 0, 0, 1] // Margen inferior de 10 unidades
                          },
                          tableHeader: {
                            bold: true,
                            fontSize: 3, // Reducir el tamaño de fuente a 5
                            color: 'black',
                          },
                          peque: {

                            fontSize: 3,
                            bold: true,
                            // margin: [0, 0, 0, 1]
                          },

                        } : {
                          header: {
                            fontSize: 4,
                            bold: true,
                            alignment: 'center',
                            margin: [0, 0, 0, 2] // Margen inferior de 20 unidades
                          },
                          subheader: {
                            fontSize: 2,
                            bold: true,
                            // margin: [0, 0, 0, 1] // Margen inferior de 10 unidades
                          },
                          subheader2: {
                            fontSize: 2,
                            bold: true,
                            // margin: [0, 0, 0, 1] // Margen inferior de 10 unidades
                          },
                          tableHeader: {
                            bold: true,
                            fontSize: 2, // Reducir el tamaño de fuente a 5
                            color: 'black',
                          },
                          peque: {

                            fontSize: 2,
                            bold: true,
                            // margin: [0, 0, 0, 1]
                          },
                        }
                      };

                      console.log(this.paseoSeleccionadoTemporal);

                      this.reiniciarCampos();
                      this.cargarpaseosPendiente();
                      // Swal.fire({
                      //   icon: 'success',
                      //   title: 'Venta Registrada.',
                      //   text: `Venta Registrada: ${numeroDocumento}`,
                      // });

                      Swal.fire({
                        icon: 'success',
                        title: 'Pago registrado',
                        text: 'El pago se registró exitosamente y el paseo fue marcado como pagado.',
                        // confirmButtonColor: '#28a745'
                      });

                      pdfMake.vfs = pdfFonts.pdfMake.vfs;
                      const pdfDoc = pdfMake.createPdf(documentDefinition);

                      pdfDoc.getBase64((data) => {
                        // Abrir el PDF en una nueva ventana del navegador
                        const win = window.open();
                        if (win) {
                          win.document.write('<iframe width="100%" height="100%" src="data:application/pdf;base64,' + data + '"></iframe>');
                        } else {
                          console.error('No se pudo abrir la ventana del navegador.');
                        }
                      });
                    } else {
                      // Manejar el caso en el que no se encuentre una caja abierta para el idUsuario
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se encontró una caja abierta para el usuario actual',
                        confirmButtonText: 'Aceptar'
                      });
                      // Detener la ejecución
                      return;
                    }

                  },
                  error: (error) => {

                    let idUsuario: number = 0;
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
                              this.generarTicket(ventaData);
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





            } else {
              const numeroDocumento = ventaData.value.numeroDocumento != null ? ventaData.value.numeroDocumento : 'No disponible';

              // El usuario canceló la operación
              Swal.fire('Cancelado', `Venta Registrada, pero no se generó el ticket. Número de venta: ${numeroDocumento}`, 'info');
              this.bloquearBotonRegistrar = true;
            }
          });




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
                  this.generarTicket(ventaData);
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


  formatearNumeroMostrado(valor: string | number | null | undefined): string {
    if (valor == null) return '';

    const limpio = valor
      .toString()
      .replace(/\./g, '')   // quitar puntos de miles
      .replace(/,/g, '.');  // cambiar coma decimal por punto

    const numero = Number(limpio);

    if (!isNaN(numero) && isFinite(numero)) {
      return numero.toLocaleString('es-CO', { maximumFractionDigits: 2 });
    } else {
      return '';
    }
  }

  parseNumeroColombiano(valor: string | number): number {
    if (typeof valor === 'number') return valor;

    return parseFloat(
      valor
        .toString()
        .replace(/\./g, '')   // quitar separadores de miles
        .replace(/,/g, '.')   // reemplazar coma decimal por punto
    );
  }

  anular(pago: Pago) {
    Swal.fire({
      title: '¿Anular pago?',
      text: 'Esta acción revertirá los paseos asociados a este pago.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {

        let totalDevolucionDecimal: number
        let totalDevolucion: string
        let precioEfectivoTexto: number
        let precioTransferenciaTexto: number
        let totalDevolucionTransferencia: string
        let totalDevolucionEfectivo: string

        if (pago.tipoPago == "Combinado") {
          totalDevolucionDecimal = pago ? parseFloat(pago.montoTexto!) : 0;
          totalDevolucion = totalDevolucionDecimal.toString();

          precioEfectivoTexto = pago ? parseFloat(pago.montoTexto!) : 0;
          totalDevolucionEfectivo = precioEfectivoTexto.toString();

          precioTransferenciaTexto = pago ? parseFloat(pago.precioTransferenciaTexto!) : 0;
          totalDevolucionTransferencia = precioTransferenciaTexto.toString();



        } else {
          totalDevolucionDecimal = pago ? parseFloat(pago.montoTexto!) : 0;
          totalDevolucion = totalDevolucionDecimal.toString();

        }


        let idUsuario: number = 0;
        let idCaja: number = 0;
        let nombreUsua: string = "";
        let nombreUsua2: string = "";
        let cajaActualizada2: Caja;


        // Obtener el idUsuario del localStorage
        const usuarioString = localStorage.getItem('usuario');
        const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
        if (datosDesencriptados !== null) {
          const usuario = JSON.parse(datosDesencriptados);
          idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
          nombreUsua2 = usuario.nombreCompleto;
        }




        // Verificar que se haya obtenido el idUsuario
        if (idUsuario !== 0) {
          this.cajaService.obtenerCajaPoridCaja(pago.idCaja).subscribe({
            next: (caja: Caja | null) => {
              if (caja !== null) {
                // Si se encuentra una caja abierta para el idUsuario
                idCaja = caja.idCaja;
                nombreUsua = caja.nombreUsuario;

                let cajaActualizada: Caja = {
                  idCaja: idCaja,
                  devolucionesTexto: totalDevolucion,
                  ingresosTexto: totalDevolucion,
                  transaccionesTexto: totalDevolucion,
                  metodoPago: pago.tipoPago,
                  estado: '',
                  nombreUsuario: '',
                  idUsuario: idUsuario
                };

                if (pago.tipoPago == "Combinado") {
                  cajaActualizada.devolucionesTexto = totalDevolucion;
                  cajaActualizada.ingresosTexto = totalDevolucionEfectivo;
                  cajaActualizada.transaccionesTexto = totalDevolucionTransferencia;
                }



                // Verificar si cajaActualizada está definida antes de intentar actualizar la caja
                if (cajaActualizada2 !== undefined) {
                  // Actualizar la caja
                  this.actualizarCaja(cajaActualizada2);
                }

                // Verificar si el idCaja de la venta es diferente al idCaja actual del usuario
                // if (idCajaVenta !== idCaja) {
                //   Swal.fire({
                //     icon: 'error',
                //     title: 'Error',
                //     text: 'No puede anular una venta realizada en una caja diferente a la actual.',
                //     confirmButtonText: 'Aceptar'
                //   });
                //   return; // Detener la ejecución
                // }
                // Verificar si el idCaja de la venta es diferente al idCaja actual del usuario
                if (nombreUsua !== nombreUsua2) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No puede anular un pago realizado  desde una caja diferente a la actual.',
                    confirmButtonText: 'Aceptar'
                  });
                  return; // Detener la ejecución
                }
                cajaActualizada2 = cajaActualizada;


                this.pagoService.anularPago(pago.idPago!).subscribe({
                  next: (rsp) => {
                    if (rsp.status) {
                      // Swal.fire('✅ Anulado', rsp.msg, 'success');
                      // this.cargarpaseosPendiente(); 


                      Swal.fire({
                        title: 'Realizar un comentario',
                        html:
                          // '<input id="prestamosTexto" class="swal2-input" placeholder="Valor del préstamo">' +
                          // '<input id="comentariosDevoluciones" class="swal2-input" placeholder="Comentario">',
                          '<textarea id="comentariosDevoluciones" class="swal2-textarea" placeholder="Comentario" style="height: 150px;"></textarea>',
                        showCancelButton: true,
                        confirmButtonColor: '#1337E8',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Realizar comentario',
                        cancelButtonText: 'Cancelar',
                        allowOutsideClick: false, // Evitar que se cierre haciendo clic fuera del diálogo
                        preConfirm: () => {
                          // const prestamosTexto = parseFloat((<HTMLInputElement>document.getElementById('prestamosTexto')).value);
                          const comentariosDevoluciones = (<HTMLInputElement>document.getElementById('comentariosDevoluciones')).value;
                          // Verificar si el saldo disponible es mayor o igual al valor del préstamo

                          // Verificar si el campo de comentario está vacío
                          if (comentariosDevoluciones.trim() === '') {
                            Swal.showValidationMessage('Por favor, ingrese un comentario.'); // Mostrar mensaje de validación
                          } else {
                            // Verificar que idCaja tenga un valor asignado
                            if (idCaja !== undefined) {
                              // Actualizar la caja correspondiente con los nuevos valores de ingresosTexto y metodoPago
                              const cajaActualizada2: Caja = {
                                idCaja: idCaja,
                                devolucionesTexto: totalDevolucion,
                                ingresosTexto: totalDevolucion,
                                transaccionesTexto: totalDevolucion,
                                metodoPago: pago.tipoPago,
                                estado: '',
                                nombreUsuario: '',
                                idUsuario: idUsuario
                              };

                              if (pago.tipoPago == "Combinado") {
                                cajaActualizada.devolucionesTexto = totalDevolucionEfectivo;
                                cajaActualizada.ingresosTexto = totalDevolucionEfectivo;
                                cajaActualizada.transaccionesTexto = totalDevolucionTransferencia;
                              }

                            }

                            this.ComentarioDevoluciones(idCaja, pago.idPago!.toString(), comentariosDevoluciones);

                            // Verificar si cajaActualizada está definida antes de intentar actualizar la caja
                            if (cajaActualizada2 !== undefined) {
                              // Actualizar la caja
                              this.actualizarCaja(cajaActualizada2);
                            }


                            // Swal.fire({
                            //   icon: 'success',
                            //   title: 'Venta Anulada ',
                            //   text: `Solicitud de anulación de venta completada.`,
                            // });


                            // Recargar los datos después de anular la venta
                            // this.buscarVentas(this.page, this.pageSize,this.searchTerm);
                            this.cargarpaseosPendiente();
                          }


                        }
                      });


                    } else {
                      Swal.fire('⚠️ Error', rsp.msg, 'warning');
                    }
                  },
                  error: (err) => {
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
                              this.anular(pago);
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






                //  this.actualizarCaja(cajaActualizada);
              } else {
                // Manejar el caso en el que no se encuentre una caja abierta para el idUsuario
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se encontró una caja abierta para el usuario actual',
                  confirmButtonText: 'Aceptar'
                });
                // Detener la ejecución
                return;
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
                        this.anular(pago);
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
    });
  }

  ComentarioDevoluciones(idCaja: number, numeroDocumento: string, comentariosDevoluciones: string) {
    const estado = "Pago"
    this.cajaService.devoluciones(idCaja, numeroDocumento, comentariosDevoluciones, estado).subscribe(
      () => {

        Swal.fire({
          icon: 'success',
          title: 'Pago Anulado.',
          text: `Solicitud de anulación de pago completada.`,
        });


        // Swal.fire('Comentario guardado exitosamente', '', 'success');
        // Aquí puedes agregar lógica adicional después de realizar el préstamo, como volver a cargar la lista de cajas

        this.obtenerCaja();
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
                  this.ComentarioDevoluciones(idCaja, numeroDocumento, comentariosDevoluciones);
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


  obtenerCaja() {

    this.cajaService.lista().subscribe({

      next: (data) => {
        if (data.status)
          this.dataListaCaja.data = data.value;
        else
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
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

    })
  }



}