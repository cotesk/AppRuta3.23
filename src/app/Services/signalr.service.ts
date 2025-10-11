import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  private calificacionesRegistradaHandlers: ((data: any) => void)[] = [];

  private perroRegistradoHandlers: ((data: any) => void)[] = [];
  private perroEditadoHandlers: ((data: any) => void)[] = [];
  private perroEliminadoHandlers: ((data: any) => void)[] = [];
  private perroImagenHandlers: ((data: any) => void)[] = [];
  private perroNuevaImagenHandlers: ((data: any) => void)[] = [];
  private perroEliminarImagenHandlers: ((data: any) => void)[] = [];

  private pagoRegistradoHandlers: ((data: any) => void)[] = [];
  private pagoAnuladoHandlers: ((data: any) => void)[] = [];
  private pagoTodosRegistradoHandlers: ((data: any) => void)[] = [];

  private tarifaRegistradoHandlers: ((data: any) => void)[] = [];
  private tarifaEliminadaHandlers: ((data: any) => void)[] = [];
  private tarifaEditadaHandlers: ((data: any) => void)[] = [];

  private paseoRegistradoHandlers: ((data: any) => void)[] = [];
  private paseoSeamanaRegistradoHandlers: ((data: any) => void)[] = [];
  private paseoEditadoHandlers: ((data: any) => void)[] = [];
  private paseoSemanaEditadoHandlers: ((data: any) => void)[] = [];
  private paseoEntregadoHandlers: ((data: any) => void)[] = [];
  private paseoFinalizadoHandlers: ((data: any) => void)[] = [];
  private paseoEnCursoHandlers: ((data: any) => void)[] = [];
  private paseoEliminadoHandlers: ((data: any) => void)[] = [];
  private paseoCanceladoHandlers: ((data: any) => void)[] = [];

  private usuarioImagenHandlers: ((data: any) => void)[] = [];
  private usuarioEditadoHandlers: ((data: any) => void)[] = [];
  private usuarioEliminadoHandlers: ((data: any) => void)[] = [];
  private usuarioNuevoClienteHandlers: ((data: any) => void)[] = [];
  private usuarioRegistradoHandlers: ((data: any) => void)[] = [];

  constructor() { }

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://www.paseo.somee.com/hubs/pedido', {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ Conexión establecida con el Hub de pedidos'))
      .catch(err => console.error('❌ Error al conectar con el Hub:', err));
  }

  stopConnection(): void {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.stop().then(() => {
        console.log('🔌 SignalR desconectado');
      }).catch(err => {
        console.error('❌ Error al detener la conexión SignalR:', err);
      });
    }
  }

  // ==== UTILIDAD GENERAL PARA REGISTRO ÚNICO Y DESUSCRIPCIÓN ====
  private registerHandler<T>(
    eventName: string,
    callback: (data: T) => void,
    handlersList: ((data: T) => void)[]
  ): () => void {
    if (!handlersList.includes(callback)) {
      handlersList.push(callback);
      this.hubConnection.on(eventName, callback);
    }

    return () => {
      this.hubConnection.off(eventName, callback);
      const index = handlersList.indexOf(callback);
      if (index !== -1) handlersList.splice(index, 1);
      console.log(`🧹 Desuscrito de ${eventName}`);
    };
  }

  //Calificaciones
  onCalificacionRegistrado(callback: (data: any) => void): () => void {
    return this.registerHandler('CalificacionRegistrada', callback, this.calificacionesRegistradaHandlers);
  }
  //Perros

  onPerroRegistrado(callback: (data: any) => void): () => void {
    return this.registerHandler('PerroRegistrado', callback, this.perroRegistradoHandlers);
  }
  onPerroEditado(callback: (data: any) => void): () => void {
    return this.registerHandler('PerroEditado', callback, this.perroEditadoHandlers);
  }
  onPerroEliminado(callback: (data: any) => void): () => void {
    return this.registerHandler('PerroEliminado', callback, this.perroEliminadoHandlers);
  }
  onPerroImagen(callback: (data: any) => void): () => void {
    return this.registerHandler('ImagenPerro', callback, this.perroImagenHandlers);
  }
  onPerroNuevaImagen(callback: (data: any) => void): () => void {
    return this.registerHandler('NuevaImagenPerro', callback, this.perroNuevaImagenHandlers);
  }
  onPerroEliminarImagen(callback: (data: any) => void): () => void {
    return this.registerHandler('EliminarImagenPerro', callback, this.perroEliminarImagenHandlers);
  }

  //Pagos

  onPagoRegistrado(callback: (data: any) => void): () => void {
    return this.registerHandler('PagoRegistrado', callback, this.pagoRegistradoHandlers);
  }
  onTodosPagoRegistrado(callback: (data: any) => void): () => void {
    return this.registerHandler('PagoTodoRegistrado', callback, this.pagoTodosRegistradoHandlers);
  }
  onPagoAnulado(callback: (data: any) => void): () => void {
    return this.registerHandler('PagoAnulado', callback, this.pagoAnuladoHandlers);
  }

  //Tarifas
  onTarifasRegistrado(callback: (data: any) => void): () => void {
    return this.registerHandler('TarifaRegistrada', callback, this.tarifaRegistradoHandlers);
  }
  onTarifasEditada(callback: (data: any) => void): () => void {
    return this.registerHandler('TarifaEditada', callback, this.tarifaEditadaHandlers);
  }
  onTarifasEliminada(callback: (data: any) => void): () => void {
    return this.registerHandler('TarifaEliminada', callback, this.tarifaEliminadaHandlers);
  }

  //Paseo
  onPaseoRegistrado(callback: (data: any) => void): () => void {
    return this.registerHandler('PaseoCreado', callback, this.paseoRegistradoHandlers);
  }
  onPaseoRegistradoSemana(callback: (data: any) => void): () => void {
    return this.registerHandler('PaseoCreadoSemana', callback, this.paseoSeamanaRegistradoHandlers);
  }
  onPaseoEditado(callback: (data: any) => void): () => void {
    return this.registerHandler('PaseoEditado', callback, this.paseoEditadoHandlers);
  }
  onPaseoEditadoSemana(callback: (data: any) => void): () => void {
    return this.registerHandler('PaseoEditadoSemana', callback, this.paseoSemanaEditadoHandlers);
  }
  onPaseoEntregado(callback: (data: any) => void): () => void {
    return this.registerHandler('PaseoEntregado', callback, this.paseoEntregadoHandlers);
  }
  onPaseoFinalizado(callback: (data: any) => void): () => void {
    return this.registerHandler('PaseoFinalizado', callback, this.paseoFinalizadoHandlers);
  }
  onPaseoEnCurso(callback: (data: any) => void): () => void {
    return this.registerHandler('PaseoEnCurso', callback, this.paseoEnCursoHandlers);
  }
  onPaseoCancelado(callback: (data: any) => void): () => void {
    return this.registerHandler('PaseoCancelado', callback, this.paseoCanceladoHandlers);
  }
  onPaseoEliminado(callback: (data: any) => void): () => void {
    return this.registerHandler('PaseoEliminado', callback, this.paseoEliminadoHandlers);
  }

  //Usuarios
  onUsuarioImagen(callback: (data: any) => void): () => void {
    return this.registerHandler('ImagenUsuario', callback, this.usuarioImagenHandlers);
  }
  onUsuarioEliminado(callback: (data: any) => void): () => void {
    return this.registerHandler('UsuarioEliminado', callback, this.usuarioEliminadoHandlers);
  }
  onUsuarioEditado(callback: (data: any) => void): () => void {
    return this.registerHandler('UsuarioEditado', callback, this.usuarioEditadoHandlers);
  }
  onUsuarioRegistrado(callback: (data: any) => void): () => void {
    return this.registerHandler('UsuarioRegistrado', callback, this.usuarioRegistradoHandlers);
  }
  onUsuarioNuevoCliente(callback: (data: any) => void): () => void {
    return this.registerHandler('UsuarioNuevoCliente', callback, this.usuarioNuevoClienteHandlers);
  }



}
