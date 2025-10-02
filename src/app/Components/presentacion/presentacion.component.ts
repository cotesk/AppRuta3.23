import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Contenido } from '../../Interfaces/contenido';
import { Router } from '@angular/router';
import { ContenidoService } from '../../Services/contenido.service';

@Component({
  selector: 'app-presentacion',
  templateUrl: './presentacion.component.html',
  styleUrl: './presentacion.component.css'
})
export class PresentacionComponent implements OnInit {
  comentarioTextoLogin: Contenido | undefined;
  constructor(

    private router: Router,

    private servicioContenido: ContenidoService
    // private firebaseApp: FirebaseApp

  ) {


  }

  ngOnInit(): void {



    this.servicioContenido.lista().subscribe(
      (response) => {
        if (response && response.status && response.value && Array.isArray(response.value)) {
          const contenidoTextoLogin = response.value.find(contenido => contenido.tipoComentarios === 'Texto Login');
          if (contenidoTextoLogin) {
            this.comentarioTextoLogin = contenidoTextoLogin;
          }
        } else {
          console.error('Respuesta API inesperada:', response);
        }
      },
      (error) => {
        console.error('Error al cargar contenidos:', error);
      }
    );


  }


}
