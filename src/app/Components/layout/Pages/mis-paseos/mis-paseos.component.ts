import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Paseo } from '../../../../Interfaces/paseo';
import { PaseoService } from '../../../../Services/paseo.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { MatDialog } from '@angular/material/dialog';
import { PaseadorDiaService } from '../../../../Services/paseadorDia.service';
import { UsuariosService } from '../../../../Services/usuarios.service';
import { AsignarPaseosComponent } from '../asignar-paseos/asignar-paseos.component';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';
import { MatCalendar, MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { CalendarioModalComponent } from '../../Modales/calendario-modal/calendario-modal.component';
import { VerImagenProductoModalComponent } from '../../Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { ModalEditarPaseosComponent } from '../../Modales/modal-editar-paseos/modal-editar-paseos.component';

@Component({
  selector: 'app-mis-paseos',
  templateUrl: './mis-paseos.component.html',
  styleUrl: './mis-paseos.component.css'
})
export class MisPaseosComponent {
paseos: any[] = [];
  paseosCalendario: any[] = [];

  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  pagedPaseos: any[] = [];
  page = 1;
  pageSize = 5;
  totalUsuario = 0;
  totalPages = 0;
  searchTerm = '';
  estadoSeleccionado: string = '';
  estados: string[] = [
    'Programado',
    'EnCurso',
    'Entregado',
    'Cancelado',
    'Finalizado',
    'Pagado'
  ];

  getIconoEstado(estado: string): string {
    switch (estado) {
      case 'Programado': return 'event';        // calendario
      case 'EnCurso': return 'directions_walk'; // persona caminando
      case 'Entregado': return 'done_all';      // check doble
      case 'Cancelado': return 'cancel';        // X
      case 'Finalizado': return 'check_circle'; // check
      case 'Pagado': return 'attach_money';     // dinero
      default: return 'help';                   // icono por defecto
    }
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'Programado': return '#607d8b'; // azul
      case 'EnCurso': return '#2196f3';    // naranja
      case 'Entregado': return '#4caf50';  // celeste
      case 'Cancelado': return '#f44336';  // rojo
      case 'Finalizado': return '#ff9800'; // verde
      case 'Pagado': return '#9c27b0';     // morado
      default: return '#ff9800';           // gris
    }
  }

  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  constructor(
    private fb: FormBuilder,
    private paseoService: PaseoService,
    private dialog: MatDialog,
    private _diasServicio: PaseadorDiaService,
    private _utilidadServicio: UtilidadService,
    private _usuarioServicio: UsuariosService,
    private cd: ChangeDetectorRef,

  ) { }



  ngOnInit(): void {


 

    this.cargarPaseos();

  }


  cargarPaseos() {
    let idUsuario: number = 0;
    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(datosDesencriptados);
    const usuario = JSON.parse(datosDesencriptados);
    idUsuario = usuario.idUsuario;

    this.paseoService.obtenerPorPaseador(idUsuario, this.page, this.pageSize, this.searchTerm, this.estadoSeleccionado)
      .subscribe(resp => {
        console.log('Respuesta del backend:', resp);

        if (resp && resp.data) {
          this.paseos = resp.data;
          this.totalUsuario = resp.total;
          this.totalPages = resp.totalPages;

          // 👇 Ya no cortes, simplemente muestra lo que viene
          this.pagedPaseos = this.paseos;
        }
      });
  }


  // actualizarPagedPaseos() {
  //   const start = this.page * this.pageSize;
  //   this.pagedPaseos = this.paseos.slice(start, start + this.pageSize);
  // }

  siguienteCard() {
    if (this.page < this.totalPages) {
      this.page++;
      this.cargarPaseos();
    }
  }

  anteriorCard() {
    if (this.page > 1) {
      this.page--;
      this.cargarPaseos();
    }
  }

  irPrimeraPagina() {
    this.page = 1;
     this.cargarPaseos();
  }

  irUltimaPagina() {
    this.page = this.totalPages;
     this.cargarPaseos();
  }



  editarPaseo(paseo: any) {
    this.dialog.open(ModalEditarPaseosComponent, {
      width: '900px',
      data: { paseo }  // <-- pasa el paseo al modal
    }).afterClosed().subscribe(() => {
      this.ngOnInit(); // refrescar después de editar
    });
  }

  verImagen(usuario: any): void {
    console.log(usuario);
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: [usuario.imagenUrl]
      }
    });
  }

  paseoRecibido(paseo: any) {
    // console.log('📩 Paseo recibido con ID:', paseo);

    // Obtener fecha/hora actual en Colombia
    const ahoraColombia = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
    );

    const fechaPaseo = new Date(paseo.fecha);

    const esMismoDia =
      ahoraColombia.getFullYear() === fechaPaseo.getFullYear() &&
      ahoraColombia.getMonth() === fechaPaseo.getMonth() &&
      ahoraColombia.getDate() === fechaPaseo.getDate();

    if (!esMismoDia) {
      Swal.fire({
        title: 'Fecha incorrecta',
        text: `Este paseo está programado para el ${fechaPaseo.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Solo se puede recibir el perro el día asignado.`,
        icon: 'warning',
        confirmButtonColor: '#286aa7ff'
      });
      console.warn('⚠️ No se puede marcar como recibido porque no es el día del paseo.');
      return;
    }

    // Validar si ya está en curso
    if (paseo.estado === "EnCurso") {
      Swal.fire({
        title: '¡Paseo ya entregado!',
        text: 'El perro ya fue entregado al paseador correctamente.',
        icon: 'warning',
        confirmButtonColor: '#286aa7ff'
      });
      return;
    }

    // Confirmar entrega
    Swal.fire({
      title: '¿El paseador ya recibió el perro?',
      text: `Confirma si el paseador ya tiene al perro asignado en este paseo (ID: ${paseo.idPaseo}).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, recibido',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#286aa7ff',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('✅ Confirmación: el paseador recibió el perro');

        this.paseoService.enCurso(paseo.idPaseo).subscribe({
          next: (resp) => {
            console.log('✅ Respuesta del backend:', resp);

            if (resp && resp.status) {
              Swal.fire({
                title: '¡Paseo iniciado!',
                text: 'El perro fue entregado al paseador correctamente.',
                icon: 'success',
                confirmButtonColor: '#286aa7ff'
              });

              console.log('🎯 Paseo marcado como "en curso". Recargando lista de paseos...');
              this.cargarPaseos();
            } else {
              Swal.fire({
                title: 'Error',
                text: resp?.msg || 'No se pudo marcar el paseo como "en curso".',
                icon: 'error',
                confirmButtonColor: '#d33'
              });
              console.warn('⚠️ El backend respondió pero no se pudo marcar en curso:', resp);
            }
          },
          error: (err) => {
            Swal.fire({
              title: 'Error de servidor',
              text: 'Ocurrió un error al intentar marcar el paseo en curso.',
              icon: 'error',
              confirmButtonColor: '#d33'
            });
            console.error('❌ Error al marcar paseo en curso:', err);
          },
          complete: () => {
            console.log('🔚 Finalizó la petición enCurso()');
          }
        });
      } else {
        console.log('❌ Acción cancelada: el paseador aún no recibió el perro');
      }
    });
  }



  vercalendario() {

    let idUsuario: number = 0;
    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(datosDesencriptados);
    const usuario = JSON.parse(datosDesencriptados);
    idUsuario = usuario.idUsuario;

    this.paseoService.obtenerPorPaseadorCalendario(idUsuario).subscribe(
      (response) => {
        if (response.status && response.value.length > 0) {

          // console.log(response.value);
          const fechasRegistradas = response.value.map((paseo: any) => {
            const fecha = paseo.fecha.split('T')[0]; // yyyy-mm-dd
            return {
              fecha: fecha,
              estado: paseo.estado,   // 👈 PASAR EL ESTADO
              idUsuario: paseo.idUsuarioCliente,
              idPaseo: paseo.idPaseo,
              turno: paseo.turno,
              nombrePasador: paseo.nombrePasador,
              nombreCliente: paseo.nombreCliente,
              nombreTarifa: paseo.nombreTarifa,
              costoTotal: paseo.costoTotal,

              perros: paseo.perros?.map((perro: any) => ({
                idPerro: perro.idPerro,
                nombre: perro.nombre,
                // raza: perro.raza,
                imagenUrl: perro.imagenUrl
              })) || []

            };
          });

          // const fechasRegistradas = response.value.map((asistencia: any) => {
          //   const fecha = asistencia.fechaAsistencia.split(' ')[0]; // Extraer solo la fecha (DD/MM/YYYY)
          //   return fecha; // Mantenerlas como cadenas
          // });

          // console.log(fechasRegistradas);

          // Abrir el modal y pasar las fechas registradas con el estado de pago
          this.dialog.open(CalendarioModalComponent, {
            data: {
              fechasRegistradas,
              tipo:"Cliente"
            }, // Enviar las fechas con su estado de pago
            width: '500px',
          }).afterClosed().subscribe(resultado => {

            if (resultado === true) { // Solo actualizar si el modal indica que hubo cambios
              this.ngOnInit(); // Método para obtener nuevamente las asistencias
            }

          });
        } else {
          // alert('No se encontraron asistencias para este usuario.');
          Swal.fire('Informacion', 'No se encontraron paseos', 'warning');
        }
      },
      (error) => console.error('Error al consultar asistencias:', error)
    );

    // this.dialog.open(CalendarioModalComponent, {
    //   width: '900px',
    //   data: { paseo }  // <-- pasa el paseo al modal
    // }).afterClosed().subscribe(() => {
    //   this.ngOnInit(); // refrescar después de editar
    // });
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

  eliminarPaseo(paseo: any) {
    // console.log(paseo);
    Swal.fire({
      title: 'Cancelar paseo?',
      text: `Cancelar paseo del ${paseo.fecha} (${paseo.turno})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.paseoService.cancelar(paseo.idPaseo).subscribe(() => {
          Swal.fire('Cancelado', 'El paseo fue cancelado', 'success');
          this.ngOnInit(); // refrescar lista
        });
      }
    });
  }


}

