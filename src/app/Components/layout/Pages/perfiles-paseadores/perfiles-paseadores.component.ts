import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ComentariosPasadorModalComponent } from '../../Modales/comentarios-pasador-modal/comentarios-pasador-modal.component';
import { CalificacionService } from '../../../../Services/calificaciones.service';
import { Router } from '@angular/router';
import { SignalRService } from '../../../../Services/signalr.service';

@Component({
  selector: 'app-perfiles-paseadores',
  templateUrl: './perfiles-paseadores.component.html',
  styleUrls: ['./perfiles-paseadores.component.css']
})
export class PerfilesPaseadoresComponent implements OnInit, OnDestroy {
  paseadores: any[] = [];
  cargando = true;
  estrellas = [1, 2, 3, 4, 5];

  constructor(
    private calificacionService: CalificacionService,
    private dialog: MatDialog,
    private signalRService: SignalRService,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    console.log('[PerroComponent] Destruyendo...');

    this.listeners.forEach((unsubscribe, i) => {
      unsubscribe();
      console.log(`[PerroComponent] Listener ${i} desuscrito`);
    });

    this.listeners = []; // Limpia el array
    // this.signalRService.stopConnection(); // si aplica
  }

  private listeners: (() => void)[] = [];
  private listenerRegistrado = false;


  ngOnInit(): void {


    this.signalRService.startConnection();

    const perfil = this.signalRService.onUsuarioImagen((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/pages/usuarios') {
        // Swal.fire({
        //   toast: true,
        //   position: 'top-end', // O 'bottom-end'
        //   icon: 'success',
        //   title: `Nuevo pedido para la mesa ${pedido.nombreMesa || 'un cliente'} #${pedido.idPedido}`,
        //   showConfirmButton: false,
        //   timer: 5000,
        //   timerProgressBar: true,
        //   didOpen: (toast) => {
        //     toast.addEventListener('mouseenter', Swal.stopTimer);
        //     toast.addEventListener('mouseleave', Swal.resumeTimer);
        //   }
        // });


        this.obtenerPaseadores();
        // this.obtenerCategorias();
      } else if (currentRoute === '/menu/perfiles_paseador') {
        this.obtenerPaseadores();
      }
    });
    this.listeners.push(perfil);

    const perfil2 = this.signalRService.onUsuarioEditado((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/pages/usuarios') {
        // Swal.fire({
        //   toast: true,
        //   position: 'top-end', // O 'bottom-end'
        //   icon: 'success',
        //   title: `Nuevo pedido para la mesa ${pedido.nombreMesa || 'un cliente'} #${pedido.idPedido}`,
        //   showConfirmButton: false,
        //   timer: 5000,
        //   timerProgressBar: true,
        //   didOpen: (toast) => {
        //     toast.addEventListener('mouseenter', Swal.stopTimer);
        //     toast.addEventListener('mouseleave', Swal.resumeTimer);
        //   }
        // });


        this.obtenerPaseadores();
        // this.obtenerCategorias();
      } else if (currentRoute === '/menu/perfiles_paseador') {
        this.obtenerPaseadores();
      }
    });
    this.listeners.push(perfil2);

    const perfil3 = this.signalRService.onUsuarioEliminado((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/pages/usuarios') {
        // Swal.fire({
        //   toast: true,
        //   position: 'top-end', // O 'bottom-end'
        //   icon: 'success',
        //   title: `Nuevo pedido para la mesa ${pedido.nombreMesa || 'un cliente'} #${pedido.idPedido}`,
        //   showConfirmButton: false,
        //   timer: 5000,
        //   timerProgressBar: true,
        //   didOpen: (toast) => {
        //     toast.addEventListener('mouseenter', Swal.stopTimer);
        //     toast.addEventListener('mouseleave', Swal.resumeTimer);
        //   }
        // });


        this.obtenerPaseadores();
        // this.obtenerCategorias();
      } else if (currentRoute === '/menu/perfiles_paseador') {
        this.obtenerPaseadores();
      }
    });
    this.listeners.push(perfil3);


    const perfil4 = this.signalRService.onUsuarioNuevoCliente((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/pages/usuarios') {
        // Swal.fire({
        //   toast: true,
        //   position: 'top-end', // O 'bottom-end'
        //   icon: 'success',
        //   title: `Nuevo pedido para la mesa ${pedido.nombreMesa || 'un cliente'} #${pedido.idPedido}`,
        //   showConfirmButton: false,
        //   timer: 5000,
        //   timerProgressBar: true,
        //   didOpen: (toast) => {
        //     toast.addEventListener('mouseenter', Swal.stopTimer);
        //     toast.addEventListener('mouseleave', Swal.resumeTimer);
        //   }
        // });


        this.obtenerPaseadores();
        // this.obtenerCategorias();
      } else if (currentRoute === '/menu/perfiles_paseador') {
        this.obtenerPaseadores();
      }
    });
    this.listeners.push(perfil4);

    const perfil5 = this.signalRService.onUsuarioRegistrado((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/pages/usuarios') {
        // Swal.fire({
        //   toast: true,
        //   position: 'top-end', // O 'bottom-end'
        //   icon: 'success',
        //   title: `Nuevo pedido para la mesa ${pedido.nombreMesa || 'un cliente'} #${pedido.idPedido}`,
        //   showConfirmButton: false,
        //   timer: 5000,
        //   timerProgressBar: true,
        //   didOpen: (toast) => {
        //     toast.addEventListener('mouseenter', Swal.stopTimer);
        //     toast.addEventListener('mouseleave', Swal.resumeTimer);
        //   }
        // });


        this.obtenerPaseadores();
        // this.obtenerCategorias();
      } else if (currentRoute === '/menu/perfiles_paseador') {
        this.obtenerPaseadores();
      }
    });
    this.listeners.push(perfil5);




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
