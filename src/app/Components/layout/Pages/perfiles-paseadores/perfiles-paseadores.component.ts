import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComentariosPasadorModalComponent } from '../../Modales/comentarios-pasador-modal/comentarios-pasador-modal.component';
import { CalificacionService } from '../../../../Services/calificaciones.service';

@Component({
  selector: 'app-perfiles-paseadores',
  templateUrl: './perfiles-paseadores.component.html',
  styleUrls: ['./perfiles-paseadores.component.css']
})
export class PerfilesPaseadoresComponent implements OnInit {
  paseadores: any[] = [];
  cargando = true;
  estrellas = [1, 2, 3, 4, 5];

  constructor(
    private calificacionService: CalificacionService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.obtenerPaseadores();
  }

  obtenerPaseadores() {
    this.cargando = true;
    this.calificacionService.obtenerPromedioGeneral().subscribe({
      next: (res) => {
        if (res.status) {
          // 🔹 res.value es una lista de paseadores con sus promedios
          this.paseadores = res.value.map((p: any) => ({
            idPaseador: p.idPaseador,
            nombreCompleto: p.nombrePaseador,
            imagenUrl: p.imagenUrl,
            promedioValoracion: p.promedio,
            totalValoraciones: p.totalCalificaciones,
            ultimosComentarios: p.ultimosComentarios
          }));
        } else {
          this.paseadores = [];
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al obtener paseadores:', err);
        this.cargando = false;
      }
    });
  }

  verOpiniones(paseador: any) {
    // console.log(paseador);
    this.dialog.open(ComentariosPasadorModalComponent, {
      data: { idPasador: paseador.idPaseador },
      width: '600px',
      maxHeight: '90vh'
    });
  }
}
