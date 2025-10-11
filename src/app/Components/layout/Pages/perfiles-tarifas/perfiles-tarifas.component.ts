import { Component, OnDestroy, OnInit } from '@angular/core';

import Swal from 'sweetalert2';
import { TarifaService } from '../../../../Services/tarifa.service';
import { Tarifa } from '../../../../Interfaces/tarifa';
import { SignalRService } from '../../../../Services/signalr.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfiles-tarifas',
  templateUrl: './perfiles-tarifas.component.html',
  styleUrls: ['./perfiles-tarifas.component.css']
})
export class PerfilesTarifasComponent implements OnInit , OnDestroy{

  tarifas: Tarifa[] = [];
  cargando = true;

  constructor(
    private tarifaService: TarifaService,
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

    const tarifa = this.signalRService.onTarifasRegistrado((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/pages/tarifas') {
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


        this.obtenerTarifas();
        // this.obtenerCategorias();
      } else if (currentRoute === '/menu/perfiles_tarifas') {
        this.obtenerTarifas();
      }
    });
    this.listeners.push(tarifa);


    const tarifa2 = this.signalRService.onTarifasEditada((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/pages/tarifas') {


        this.obtenerTarifas();

      } else if (currentRoute === '/menu/perfiles_tarifas') {
        this.obtenerTarifas();
      }
    });
    this.listeners.push(tarifa2);

    const tarifa3 = this.signalRService.onTarifasEliminada((pedido) => {
      const currentRoute = this.router.url;
      console.log('📦 Pedido actualizado:', pedido);
      console.log(currentRoute);
      // Solo muestra mensaje si está en /pages/historial_Pedidos
      if (currentRoute === '/pages/tarifas') {
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


        this.obtenerTarifas();
        // this.obtenerCategorias();
      } else if (currentRoute === '/menu/perfiles_tarifas') {
        this.obtenerTarifas();
      }
    });
    this.listeners.push(tarifa3);


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
