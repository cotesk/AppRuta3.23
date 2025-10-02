import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Licencias } from '../../../../Interfaces/licencias';
import { LicenciaService } from '../../../../Services/licencia.service';

@Component({
  selector: 'app-licencias',
  templateUrl: './licencias.component.html',
  styleUrls: ['./licencias.component.css']
})
export class LicenciaComponent implements OnInit {
  licenciaForm!: FormGroup;
  licencias: Licencias[] = [];

  
  // ✅ Propiedades para la paginación
  licenciasPaginadas: Licencias[] = [];
  paginaActual: number = 1;
  tamanoPagina: number = 5; // 5 registros por página
  totalPaginasDisponibles: number = 0;
  searchTerm = '';

  displayedColumns: string[] = ['id', 'serial', 'fechaInicio', 'fechaFin', 'estadoPago', 'activa', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private licenciaService: LicenciaService
  ) { }

  ngOnInit(): void {
    this.licenciaForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });
    this.cargarLicencias();
  }

  generarLicencia(): void {
    if (this.licenciaForm.invalid) return;

    Swal.fire({
      title: '¿Está seguro?',
      text: 'Se va a generar una nueva licencia',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1337E8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.licenciaService.crearLicencia(this.licenciaForm.value).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Licencia generada correctamente', 'success');
            this.licenciaForm.reset();
            this.cargarLicencias();
          },
          error: (err) => {
            // console.error('❌ Error al generar licencia:', err);
            Swal.fire('Error', 'No se pudo generar la licencia', 'error');
          }
        });
      } else {
        // console.log('⚠️ Acción cancelada por el usuario');
      }
    });
  }

  // cargarLicencias(): void {
  //   this.licenciaService.getLicencias().subscribe({
  //     next: (res) => {
  //       // ✅ Ordenar de mayor a menor por ID
  //       this.licencias = res.sort((a, b) => b.id! - a.id!);

  //       this.paginaActual = 1; // reiniciamos siempre en la primera página
  //       this.actualizarPaginacion();
  //     },
  //     error: () =>
  //       Swal.fire('Error', 'No se pudieron cargar las licencias', 'error')
  //   });
  // }

  cargarLicencias(): void {
    this.licenciaService.getLicenciasPaginadas(this.paginaActual, this.tamanoPagina, this.searchTerm).subscribe({
      next: (res) => {
        this.licenciasPaginadas = res.data;
        this.totalPaginasDisponibles = res.totalPages;
      },
      error: () =>
        Swal.fire('Error', 'No se pudieron cargar las licencias', 'error')
    });
  }

  desactivarLicencia(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'La licencia será desactivada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1337E8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.licenciaService.desactivarLicencia(id).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Licencia desactivada', 'success');
            this.cargarLicencias();
          },
          error: () =>
            Swal.fire('Error', 'No se pudo desactivar la licencia', 'error')
        });
      }
    });
  }

  // ✅ Métodos de paginación
  // actualizarPaginacion(): void {
  //   const inicio = (this.paginaActual - 1) * this.tamanoPagina;
  //   const fin = inicio + this.tamanoPagina;
  //   this.licenciasPaginadas = this.licencias.slice(inicio, fin);

  // }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual = pagina;
    // this.actualizarPaginacion();
    this.cargarLicencias();
  }

  totalPaginas(): number {
    return this.totalPaginasDisponibles;
  }
  aplicarFiltroTabla(event: Event) {
    const filtroValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (filtroValue === 'pagado' || filtroValue === 'Pagado') {
      this.searchTerm = '1';
    } else if (filtroValue === 'no pagado' || filtroValue === 'No Pagado') {
      this.searchTerm = '0';
    } else {
      this.searchTerm = filtroValue;
    }

    this.cargarLicencias();
  }

  copiarAlPortapapeles(serial: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(serial).then(() => {
        // Aquí puedes usar SweetAlert2 o snackbar
        alert('Serial copiado al portapapeles ✅');
      }).catch(err => {
        console.error('Error al copiar: ', err);
      });
    } else {
      // Fallback para navegadores muy antiguos
      const input = document.createElement('input');
      input.value = serial;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('Serial copiado al portapapeles ✅');
    }
  }


}
