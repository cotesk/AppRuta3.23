import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  constructor() {}

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://www.caribepolar.somee.com/hubs/pedido', {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ Conexión establecida con el Hub de pedidos'))
      .catch(err => console.error('❌ Error al conectar con el Hub:', err));
  }

  public onPedidoActualizado(callback: (data: any) => void): void {
    this.hubConnection.on('PedidoActualizado', callback);
  }

  public enviarNotificacion(data: any): void {
    this.hubConnection.invoke('EnviarPedido', data)
      .catch(err => console.error('❌ Error al invocar EnviarPedido:', err));
  }
}
