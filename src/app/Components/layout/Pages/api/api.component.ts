import { Component } from '@angular/core';
import { ApiService } from '../../../../Services/api.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.css']
})
export class ApiComponent {
  departamentos: any[] = [];
  ciudades: any[] = [];
  municipios: any[] = [];
  selectedDepartamentoId: number | null = null;
  selectedCiudadId: number | null = null;
  selectedDepartamento: any | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.llenarData();
  }

  llenarData() {
    this.apiService.getData().subscribe(data => {
      this.departamentos = data;
      console.log(this.departamentos);
    });
  }

  cargarCiudadesPorDepartamento() {
    if (this.selectedDepartamentoId !== null) {
      // Almacena el departamento seleccionado
      this.selectedDepartamento = this.departamentos.find(dep => dep.id === this.selectedDepartamentoId);

      this.apiService.getCiudadesByDepartamentoId(this.selectedDepartamentoId).subscribe(ciudades => {
        this.ciudades = ciudades;
        console.log('Ciudades cargadas:', this.ciudades);
      });
    } else {
      this.ciudades = [];
      this.selectedDepartamento = null;
    }
  }

  mostrarInfoCiudad() {
    if (this.selectedCiudadId !== null) {
      const ciudadSeleccionada = this.ciudades.find(ciudad => ciudad.id === String(this.selectedCiudadId));
      if (ciudadSeleccionada) {
        console.log(`Nombre del departamento: ${this.getNombreDepartamento()}`);
        console.log(`ID de la ciudad: ${ciudadSeleccionada.id}`);
        console.log(`Información de la ciudad: `, ciudadSeleccionada);
      }
    }
  }

  getNombreDepartamento(): string {
    return this.selectedDepartamento ? this.selectedDepartamento.name : 'Desconocido';
  }
}
