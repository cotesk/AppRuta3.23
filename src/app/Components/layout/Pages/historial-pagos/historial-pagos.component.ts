import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { PagoService } from '../../../../Services/pago.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-historial-pagos',
  templateUrl: './historial-pagos.component.html',
  styleUrl: './historial-pagos.component.css'
})
export class HistorialPagosComponent implements OnInit {

  dataPagos = new MatTableDataSource<any>([]);
  columnasTabla: string[] = ['idPago', 'nombreUsuario', 'fechaPago', 'tipoPago', 'monto', 'acciones'];

  page: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  totalRegistros: number = 0;
  terminoBusqueda: string = '';

  constructor(private pagoService: PagoService) { }

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos() {
    this.pagoService.listaPaginada(this.page, this.pageSize, this.terminoBusqueda)
      .subscribe({
        next: (resp) => {
          if (resp.status) {
            console.log(resp);
            this.dataPagos.data = resp.value.data;
            this.totalPages = resp.value.totalPaginas;
            this.totalRegistros = resp.value.totalRegistros;
          } else {
            Swal.fire('Atención', 'No se pudieron cargar los pagos.', 'warning');
          }
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Error al cargar los pagos.', 'error');
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


  aplicarFiltroTabla(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.terminoBusqueda = input.trim();
    // this.page = 1;
    this.cargarPagos();
  }

  firstPage() {
    this.page = 1;
    this.cargarPagos();
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.cargarPagos();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.cargarPagos();
    }
  }

  lastPage() {
    this.page = this.totalPages;
    this.cargarPagos();
  }

  nuevoPago() {


  }


  formatearNumero(numero: string): string {
    if (!numero) return '0';

    // Elimina cualquier espacio
    numero = numero.trim();

    // 1️⃣ Reemplaza el separador de miles "." por vacío
    // 2️⃣ Reemplaza la coma "," decimal por un punto "."
    const limpio = numero.replace(/\./g, '').replace(',', '.');

    // Convierte a número real
    const valorNumerico = parseFloat(limpio);

    // Si no es un número válido, retorna el texto original
    if (isNaN(valorNumerico)) return numero;

    // 3️⃣ Devuelve formateado al estilo colombiano
    return valorNumerico.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }


  verDetallePago(pago: any) {
    Swal.fire({
      title: 'Detalle del Pago',
      html: `
        <b>Usuario:</b> ${pago.nombreUsuario}<br>
        <b>Tipo:</b> ${pago.tipoPago}<br>
        <b>Monto:</b> ${this.formatearNumero(pago.montoTexto)}<br>
        <b>Fecha:</b> ${this, this.formatearFecha(pago.fechaPago)}
      `,
      icon: 'info'
    });
  }

  eliminarPago(pago: any) {
    Swal.fire({
      title: '¿Eliminar pago?',
      text: `¿Seguro que deseas eliminar el pago #${pago.idPago}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        // Aquí puedes llamar al servicio para eliminar el pago
        Swal.fire('Eliminado', 'El pago ha sido eliminado.', 'success');
      }
    });
  }

  /* ---------- Flujo principal ---------- */
  generarPDF() {
    Swal.fire({
      title: 'Seleccione tipo de reporte',
      input: 'select',
      inputOptions: { mes: 'Por mes', dia: 'Por día' },
      inputPlaceholder: 'Elige una opción',
      showCancelButton: true,
        confirmButtonColor: '#1337E8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Cancelar'
    }).then((res) => {
      if (!res.isConfirmed) return;
      const tipo = res.value;
      if (tipo === 'mes') this.pedirMesYAño();
      if (tipo === 'dia') this.pedirDiaMesAño();
    });
  }

  /* ---------- Pedir mes y año ---------- */
  private pedirMesYAño() {
    Swal.fire({
      title: 'Mes y Año',
      html: `
      <input id="month" type="number" class="swal2-input" placeholder="Mes (1-12)" min="1" max="12">
      <input id="year" type="number" class="swal2-input" placeholder="Año" value="${new Date().getFullYear()}">
    `,
      showCancelButton: true,
      confirmButtonColor: '#1337E8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Generar PDF',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const month = Number((document.getElementById('month') as HTMLInputElement).value);
        const year = Number((document.getElementById('year') as HTMLInputElement).value);
        if (!month || month < 1 || month > 12 || !year) {
          Swal.showValidationMessage('Ingresa un mes (1-12) y un año válido.');
        }
        return { month, year };
      }
    }).then(r => { if (r.isConfirmed) this.cargarTodosYGenerarPDFPorMes(r.value.month, r.value.year); });
  }

  /* ---------- Pedir día, mes y año ---------- */
  private pedirDiaMesAño() {
    Swal.fire({
      title: 'Día, Mes y Año',
      html: `
      <input id="day" type="number" class="swal2-input" placeholder="Día (1-31)" min="1" max="31">
      <input id="month" type="number" class="swal2-input" placeholder="Mes (1-12)" min="1" max="12">
      <input id="year" type="number" class="swal2-input" placeholder="Año" value="${new Date().getFullYear()}">
    `,
      showCancelButton: true,
      confirmButtonColor: '#1337E8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Generar PDF',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const day = Number((document.getElementById('day') as HTMLInputElement).value);
        const month = Number((document.getElementById('month') as HTMLInputElement).value);
        const year = Number((document.getElementById('year') as HTMLInputElement).value);
        if (!day || day < 1 || day > 31 || !month || month < 1 || month > 12 || !year) {
          Swal.showValidationMessage('Ingresa día (1-31), mes (1-12) y año válidos.');
        }
        return { day, month, year };
      }
    }).then(r => { if (r.isConfirmed) this.cargarTodosYGenerarPDFPorDia(r.value.day, r.value.month, r.value.year); });
  }

  /* ---------- Cargar todos los pagos y generar reporte ---------- */
  private cargarTodosYGenerarPDFPorMes(mes: number, anio: number) {
    this.pagoService.listaTodos().subscribe({
      next: (resp) => {
        if (resp.status) {
          const filtrados = resp.value.filter((p: any) => {
            const { m, y } = this.parseFechaDDMMYYYY(p.fechaPago);
            return m === mes && y === anio;
          });

          if (!filtrados.length) {
            Swal.fire('Sin datos', 'No hay pagos para ese mes y año.', 'warning');
            return;
          }

          const totalMes = filtrados.reduce(
            (acc: number, p: any) => acc + this.parseMonto(p.montoTexto),
            0
          );

          this.crearPDF(
            filtrados,
            `Historial de Pagos - ${mes}/${anio}`,
            `Total del mes: ${this.formatCOP(totalMes)}`
          );
        } else {
          Swal.fire('Error', 'No se pudieron obtener los pagos.', 'error');
        }
      },
      error: () => Swal.fire('Error', 'Error al cargar los pagos.', 'error'),
    });
  }

  private cargarTodosYGenerarPDFPorDia(dia: number, mes: number, anio: number) {
    this.pagoService.listaTodos().subscribe({
      next: (resp) => {
        if (resp.status) {
          const filtrados = resp.value.filter((p: any) => {
            const { d, m, y } = this.parseFechaDDMMYYYY(p.fechaPago);
            return d === dia && m === mes && y === anio;
          });

          if (!filtrados.length) {
            Swal.fire('Sin datos', 'No hay pagos para esa fecha.', 'warning');
            return;
          }

          const totalDia = filtrados.reduce(
            (acc: number, p: any) => acc + this.parseMonto(p.montoTexto),
            0
          );

          this.crearPDF(
            filtrados,
            `Historial de Pagos - ${dia}/${mes}/${anio}`,
            `Total del día: ${this.formatCOP(totalDia)}`
          );
        } else {
          Swal.fire('Error', 'No se pudieron obtener los pagos.', 'error');
        }
      },
      error: () => Swal.fire('Error', 'Error al cargar los pagos.', 'error'),
    });
  }

  /* ---------- Crear el PDF ---------- */
  private crearPDF(data: any[], titulo: string, totalTexto: string) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(titulo, 14, 14);

autoTable(doc, {
  startY: 20,
  head: [['#', '#Pago', 'Cliente', 'Fecha de Pago', 'Monto', 'Tipo de Pago', 'Transferencia', 'Precio Efect Trans', 'Precio Transf', 'Dinero Recibido']],
  body: data.map((p, index) => [
    index + 1, 
    p.idPago,
    p.nombreUsuario,
    this.formatearFecha(p.fechaPago),
    p.montoTexto, // Ya viene en formato '16.000'
    p.tipoPago || 'N/A',
    (p.tipoTranferencia === 'Sin ningún tipo de pago' ? 'N/A' : (p.tipoTranferencia || 'N/A')),
    p.precioEfectivoTexto || 'N/A',
    p.precioTransferenciaTexto || 'N/A',
    p.precioPagadoTexto || 'N/A',
  ]),
  styles: { fontSize: 10 },
  headStyles: { fillColor: [30, 144, 255], halign: 'center', valign: 'middle' },
  columnStyles: {
    0: { halign: 'center' }, // Enumerador
    1: { halign: 'center' }, // idPago
    2: { halign: 'center' }, // Cliente
    3: { halign: 'center' }, // Fecha
    4: { halign: 'center' }, // Monto
    5: { halign: 'center' }, // Tipo de Pago
    6: { halign: 'center' }, // Transferencia
    7: { halign: 'center' }, // Precio Efectivo
    8: { halign: 'center' }, // Precio Transferencia
    9: { halign: 'center' }, // Dinero Recibido
  },
});


    const finalY = (doc as any).lastAutoTable?.finalY ?? 20;
    doc.setFontSize(12);
    doc.text(totalTexto, 14, finalY + 10);

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  /* ---------- Utilidades ---------- */
  private parseFechaDDMMYYYY(fecha: string) {
    const d = new Date(fecha);
    return { d: d.getDate(), m: d.getMonth() + 1, y: d.getFullYear() };
  }

  private parseMonto(montoTexto: string): number {
    if (!montoTexto) return 0;
    // El monto viene como "16.000" → quitamos el punto para convertir a número
    const limpio = montoTexto.replace(/\./g, '');
    const valor = parseFloat(limpio);
    return isNaN(valor) ? 0 : valor;
  }

  private formatCOP(valor: number): string {
    if (isNaN(valor)) return '0';
    return valor.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }





}
