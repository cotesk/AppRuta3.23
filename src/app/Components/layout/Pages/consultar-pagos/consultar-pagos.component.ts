import { Component, ViewChild } from '@angular/core';
import { Pago } from '../../../../Interfaces/pago';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { PagoService } from '../../../../Services/pago.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from '../../../../Services/signalr.service';


@Component({
  selector: 'app-consultar-pagos',
  templateUrl: './consultar-pagos.component.html',
  styleUrl: './consultar-pagos.component.css'
})
export class ConsultarPagosComponent {

  columnasTabla: string[] = ['idPago', 'nombreUsuario', 'fechaPago', 'tipoPago', 'tipoTranferencia', 'montoTexto'];
  dataInicio: Pago[] = [];
  dataListaVenta = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;
  formularioVenta: FormGroup;
  Selector: string = "id";


  NombreCliente: string = "";
  CedulaCliente: string = "";
  Numerodeventa: string = "";
  TipoPago: string = "";
  Total: string = "";


  constructor(
    private dialog: MatDialog,
    private _pagoServicio: PagoService,
    private _utilidadServicio: UtilidadService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private signalRService: SignalRService,
    private router: Router
  ) {

    this.formularioVenta = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
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

    const pago = this.signalRService.onPagoAnulado((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/menu/consultar_Pagos') {
        this.buscarCompra();
      }
    });
    this.listeners.push(pago);

    const pago2 = this.signalRService.onPagoRegistrado((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/menu/consultar_Pagos') {
        this.buscarCompra();
      }
    });
    this.listeners.push(pago2);

    const pago3 = this.signalRService.onTodosPagoRegistrado((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/menu/consultar_Pagos') {
        this.buscarCompra();
      }
    });
    this.listeners.push(pago3);


    this.route.queryParams.subscribe(params => {
      const numeroQR = params['pagos'];
      if (numeroQR) {
        this.Selector = 'id';
        this.formularioVenta.get('correo')?.setValue(numeroQR);
        this.buscarCompra(); // Ejecuta la búsqueda automáticamente
      }
    });
  }

  onSelectChange(event: any) {
    this.formularioVenta.reset();
    this.limpiarCampos();
  }

  limpiarCampos(): void {

    this.dataListaVenta.data = [];
    this.NombreCliente = "";
    this.CedulaCliente = "";
    this.Numerodeventa = "";
    this.TipoPago = "";
    this.Total = "";

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
  formatearNumero2(numero: any): string {
    if (typeof numero === 'number' && !isNaN(numero)) {
      return numero.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    } else {
      return 'N/A';
    }
  }

  calcularSubTotalProducto(element: any): string {
    const precio = parseFloat(element.precioTexto?.replace(',', '.') || '0');
    const cantidad = parseFloat(element.cantidad || '0');
    const total = precio * cantidad;

    return this.formatearNumero2(total);
  }


  buscarCompra() {
    const correo = this.formularioVenta.get('correo')?.value;
    if (!correo) return;

    this._pagoServicio.pagoCorreo(correo).subscribe({
      next: (resp) => {
        if (resp.status && resp.value?.pagos?.length > 0) {
          const pagos = resp.value.pagos;
          console.log(resp);
          this.dataListaVenta.data = pagos;
          this.dataInicio = pagos;

          // Como solo es por correo, tomamos el primer pago para mostrar info del cliente
          const primerPago = pagos[0];
          this.NombreCliente = primerPago.nombreUsuario;
          this.TipoPago = primerPago.tipoPago;
          this.Total = primerPago.montoTexto;
          this.Numerodeventa = primerPago.idPago.toString();

          this.dataListaVenta.paginator = this.paginacionTabla;
        } else {
          Swal.fire('No encontrado', 'No se encontraron pagos asociados a este correo.', 'info');
          this.limpiarCampos();
        }
      },
      error: () => {
        Swal.fire('Error', 'No se pudo obtener la información de los pagos.', 'error');
        this.limpiarCampos();
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';

    const date = new Date(fecha);

    // Verifica si la fecha es válida
    if (isNaN(date.getTime())) return fecha;

    // Formato colombiano con hora y AM/PM
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true, // Muestra AM/PM
    });
  }



}
