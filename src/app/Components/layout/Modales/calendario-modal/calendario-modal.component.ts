import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import moment, { Moment } from 'moment';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../../../Services/usuarios.service';
import { VerImagenProductoModalComponent } from '../ver-imagen-producto-modal/ver-imagen-producto-modal.component';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-calendario-modal',
  templateUrl: './calendario-modal.component.html',
  styleUrl: './calendario-modal.component.css',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class CalendarioModalComponent {

  fechasRegistradas: {
    fecha: moment.Moment,
    estado: string,
    idUsuario: number,
    idPaseo: number,
    turno?: string,
    nombrePasador?: string,
    nombreTarifa?: string,
    costoTotal?: number,
    perros?: {
      idPerro: number,
      nombre: string,
      // raza: string,
      imagenUrl: string[]
    }[]
  }[] = [];
  selectedDate: Date | null = new Date();
  mesActual = moment();
  diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  diasDelMes: number[] = [];
  diasPrevios: number[] = [];
  meses = [
    { nombre: 'Enero', valor: 0 },
    { nombre: 'Febrero', valor: 1 },
    { nombre: 'Marzo', valor: 2 },
    { nombre: 'Abril', valor: 3 },
    { nombre: 'Mayo', valor: 4 },
    { nombre: 'Junio', valor: 5 },
    { nombre: 'Julio', valor: 6 },
    { nombre: 'Agosto', valor: 7 },
    { nombre: 'Septiembre', valor: 8 },
    { nombre: 'Octubre', valor: 9 },
    { nombre: 'Noviembre', valor: 10 },
    { nombre: 'Diciembre', valor: 11 },
  ];
  anios: number[] = [];
  mesSeleccionado = this.mesActual.month();
  anioSeleccionado = this.mesActual.year();
  error: boolean | undefined;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  imagenClienteSeleccionada: string | null = null;


  constructor(
    public dialogRef: MatDialogRef<CalendarioModalComponent>,
    private _usuarioServicio: UsuariosService,
    // private _pagoServicio: PagosService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fechasRegistradas: {
        fecha: string,
        estado: string,
        idUsuario: number,
        idPaseo: number,
        turno?: string,
        nombrePasador?: string,
        nombreTarifa?: string,
        costoTotal?: number,
        perros?: {
          idPerro: number,
          nombre: string,
          // raza: string,
          imagenUrl: string[]
        }[]
      }[]
    },
    private cdr: ChangeDetectorRef
  ) {

    this.generarCalendario();
    this.generarAnios();
    // console.log('Fechas iniciales:', data);
    // console.log('Fechas iniciales:', data.fechasRegistradas);
    // this.imagenClienteSeleccionada = data.fechasRegistradas[0].imagenUrl;
    // Convierte las fechas y almacena el estado de pago
    this.fechasRegistradas = data.fechasRegistradas.map(fechaData => {
      const fechaMoment = moment(fechaData.fecha, 'YYYY-MM-DD');
      return {
        fecha: fechaMoment,
        estado: fechaData.estado,
        idUsuario: fechaData.idUsuario,
        idPaseo: fechaData.idPaseo,
        turno: fechaData.turno,
        nombrePasador: fechaData.nombrePasador,
        nombreTarifa: fechaData.nombreTarifa,
        costoTotal: fechaData.costoTotal,
        perros: fechaData.perros || []
      };
    });


    // console.log('Fechas convertidas:', this.fechasRegistradas);
  }


  verImagen(): void {
    //  console.log(usuario);
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: [this.imagenClienteSeleccionada]
      }
    });
  }

  mesAnterior() {
    this.mesActual = this.mesActual.subtract(1, 'month');
    this.mesSeleccionado = this.mesActual.month();
    this.anioSeleccionado = this.mesActual.year();
    this.generarCalendario();
  }

  mesSiguiente() {
    this.mesActual = this.mesActual.add(1, 'month');
    this.mesSeleccionado = this.mesActual.month();
    this.anioSeleccionado = this.mesActual.year();
    this.generarCalendario();
  }

  cambiarMes() {
    this.mesActual = moment().year(this.anioSeleccionado).month(this.mesSeleccionado);
    this.generarCalendario();
  }

  cambiarAnio() {
    this.mesActual = moment().year(this.anioSeleccionado).month(this.mesSeleccionado);
    this.generarCalendario();
  }

  generarAnios() {
    const anioActual = moment().year();
    this.anios = Array.from({ length: 20 }, (_, i) => anioActual - 10 + i);
  }

  ngOnInit() {
    this.generarCalendario();
  }

mostrarSignificadoColores() {
  Swal.fire({
    title: 'Significado de los colores',
    html: `
      <div style="text-align: left; font-size: 16px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 20px; height: 20px; background-color: #607d8b; display: inline-block; margin-right: 10px; border-radius: 4px;"></span>
          <strong>Programado:</strong> Paseo agendado y pendiente por iniciar.
        </div>

        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 20px; height: 20px; background-color: #2196f3; display: inline-block; margin-right: 10px; border-radius: 4px;"></span>
          <strong>En Curso:</strong> Paseo actualmente en proceso.
        </div>

        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 20px; height: 20px; background-color: #4caf50; display: inline-block; margin-right: 10px; border-radius: 4px;"></span>
          <strong>Entregado:</strong> El perro fue devuelto al dueño.
        </div>

        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 20px; height: 20px; background-color: #f44336; display: inline-block; margin-right: 10px; border-radius: 4px;"></span>
          <strong>Cancelado:</strong> Paseo cancelado por el cliente o paseador.
        </div>

        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 20px; height: 20px; background-color: #ff9800; display: inline-block; margin-right: 10px; border-radius: 4px;"></span>
          <strong>Finalizado:</strong> Paseo completado satisfactoriamente.
        </div>

        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="width: 20px; height: 20px; background-color: #9c27b0; display: inline-block; margin-right: 10px; border-radius: 4px;"></span>
          <strong>Pagado:</strong> El paseo ya fue cancelado económicamente.
        </div>
      </div>
    `,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#2196f3',
    width: 600,
  });
}
  // generarCalendario() {
  //   const inicioMes = this.mesActual.clone().startOf('month');
  //   const diasEnMes = this.mesActual.daysInMonth();

  //   this.diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  //   const diasPrevios = inicioMes.day();
  //   this.diasPrevios = Array.from({ length: diasPrevios }, () => null);

  //   this.diasDelMes = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  // }

  generarCalendario() {
    const inicioMes = moment().year(this.anioSeleccionado).month(this.mesSeleccionado).startOf('month');
    const diasEnMes = inicioMes.daysInMonth();
    const diaSemanaInicio = inicioMes.isoWeekday() % 7;

    this.diasPrevios = Array(diaSemanaInicio).fill(null);
    this.diasDelMes = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  }



  esFechaRegistrada(dia: number): boolean {
    return this.fechasRegistradas.some(fechaData =>
      fechaData.fecha.date() === dia &&
      fechaData.fecha.month() === this.mesActual.month() &&
      fechaData.fecha.year() === this.mesActual.year()
    );
  }

  // esPagoRealizado(dia: number): boolean {
  //   const fechaData = this.fechasRegistradas.find(fechaData =>
  //     fechaData.fecha.date() === dia &&
  //     fechaData.fecha.month() === this.mesActual.month() &&
  //     fechaData.fecha.year() === this.mesActual.year()
  //   );
  //   return fechaData ? fechaData.pagoRealizado : false;
  // }

  getEstadoClase(dia: number): string {
    const fechaData = this.fechasRegistradas.find(f =>
      f.fecha.date() === dia &&
      f.fecha.month() === this.mesActual.month() &&
      f.fecha.year() === this.mesActual.year()
    );

    if (!fechaData) return '';

    switch (fechaData.estado) {
      case 'Programado': return 'estado-programado';
      case 'EnCurso': return 'estado-encurso';
      case 'Entregado': return 'estado-entregado';
      case 'Cancelado': return 'estado-cancelado';
      case 'Finalizado': return 'estado-finalizado';
      case 'Pagado': return 'estado-pagado';
      default: return '';
    }
  }




  onFechaClick(dia: number): void {
    const paseosDelDia = this.fechasRegistradas.filter(f =>
      f.fecha.date() === dia &&
      f.fecha.month() === this.mesActual.month() &&
      f.fecha.year() === this.mesActual.year()
    );

    if (paseosDelDia.length > 0) {
      this.mostrarInfoDia(paseosDelDia);
    } else {
      Swal.fire({
        title: '📅 Sin paseos',
        text: `No hay paseos registrados para el ${dia}/${this.mesActual.month() + 1}/${this.mesActual.year()}.`,
        icon: 'info',
        confirmButtonText: 'Ok'
      });
    }
  }

 mostrarInfoDia(paseosDelDia: any[]) {
  let html = `<h3>📅 Paseos para ${paseosDelDia[0].fecha.format('DD/MM/YYYY')}</h3>`;

  paseosDelDia.forEach((paseo, idx) => {
    html += `
      <div style="border:1px solid #ddd; padding:10px; margin:10px 0; border-radius:8px;">
        <p><b>#${idx+1} - Estado:</b> ${paseo.estado}</p>
        <p><b>Paseador:</b> ${paseo.nombrePasador ?? 'N/A'}</p>
        <p><b>Tarifa:</b> ${paseo.nombreTarifa ?? 'N/A'}</p>
        <p><b>Costo:</b> ${paseo.costoTotal ?
          new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(paseo.costoTotal)
          : 'N/A'}</p>
    `;

    if (paseo.perros && paseo.perros.length > 0) {
      html += `<h4>🐶 Perros:</h4>`;
      paseo.perros.forEach((perro: any) => {
        const foto = perro.imagenUrl?.length ? perro.imagenUrl[0] : null;
        html += `
          <div style="display:flex; align-items:center; gap:10px; margin: 8px 0;">
            ${foto ? `<img src="${foto}" alt="${perro.nombre}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">` : ''}
            <b>${perro.nombre}</b>
          </div>
        `;
      });
    }

    html += `</div>`;
  });

  Swal.fire({
    title: '📅 Detalles del Paseo',
    html: html,
    width: 600,
    showCloseButton: true,
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#3085d6'
  });
}



}
