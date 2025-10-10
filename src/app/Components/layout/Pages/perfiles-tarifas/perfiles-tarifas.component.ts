import { Component, OnInit } from '@angular/core';

import Swal from 'sweetalert2';
import { TarifaService } from '../../../../Services/tarifa.service';
import { Tarifa } from '../../../../Interfaces/tarifa';

@Component({
  selector: 'app-perfiles-tarifas',
  templateUrl: './perfiles-tarifas.component.html',
  styleUrls: ['./perfiles-tarifas.component.css']
})
export class PerfilesTarifasComponent implements OnInit {

  tarifas: Tarifa[] = [];
  cargando = true;

  constructor(private tarifaService: TarifaService) {}

  ngOnInit(): void {
    this.obtenerTarifas();
  }

  obtenerTarifas(): void {
    this.tarifaService.perfilTarifa().subscribe({
      next: (resp) => {
        if (resp.status) {
          this.tarifas = resp.value;
        } else {
          Swal.fire('Atención', resp.msg || 'No se pudieron cargar las tarifas.', 'warning');
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Ocurrió un error al cargar las tarifas.', 'error');
        this.cargando = false;
      }
    });
  }

}
