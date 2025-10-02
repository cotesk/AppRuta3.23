import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
// import { Producto } from '../Interfaces/producto';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../environments/environment';
import { NotificacionesDialogComponent } from '../Components/layout/Modales/notificaciones-dialog/notificaciones-dialog.component';
import { map } from 'rxjs/operators';
import { UsuariosService } from './usuarios.service';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private numeroProductosBajoStockSubject = new BehaviorSubject<number>(0);
  numeroProductosBajoStock$ = this.numeroProductosBajoStockSubject.asObservable();
  private intervalSubscription: any;
  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private _usuarioServicio: UsuariosService,
  ) { }

  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error('No se encontró un token JWT en el almacenamiento local.');
      throw new Error('No se encontró un token JWT en el almacenamiento local.');
    }
    return new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
  }
  // Para actualizar cada 5 minutos (300,000 milisegundos)
  //const cincoMinutos = 5 * 60 * 1000;

  // Para actualizar cada 4 horas (14,400,000 milisegundos)
  //const cuatroHoras = 4 * 60 * 60 * 1000;

  //10 * 1000 = para 10 segundos

  // iniciarActualizacionAutomatica(): void {
  //   interval(2 * 60 * 1000).pipe(
  //     switchMap(() => this.http.get<any>(`${environment.endpoint}producto/stockbajo`, { headers: this.getHeaders() }))
  //   ).subscribe(response => {
  //     if (response.status && response.value) {
  //       const productos: Producto[] = response.value; // Asigna el tipo Producto al arreglo de productos
  //       const cantidadProductos = productos.filter((producto: Producto) => producto.stock <= 5).length;

  //       this.numeroProductosBajoStockSubject.next(cantidadProductos); // Actualizar el BehaviorSubject
  //     }
  //   });
  // }

  // iniciarActualizacionAutomatica(): void {


  //   // Si ya hay una suscripción activa, cancelarla
  //   if (this.intervalSubscription) {
  //     this.intervalSubscription.unsubscribe();
  //   }
  //   //15 * 60 * 1000 15 minutos

  //   interval(10 * 1000).pipe(
  //     switchMap(() => this.http.get<any>(`${environment.endpoint}producto/stockbajo`, { headers: this.getHeaders() })),
  //     catchError(error => {
  //       console.error('Error fetching low stock products', error);
  //       this.token();
  //       return of([]); // Retorna un array vacío en caso de error
  //     })
  //   ).subscribe(response => {
  //     if (response.status && response.value) {
  //       const productos: Producto[] = response.value;
  //       const cantidadProductos = productos.filter((producto: Producto) => producto.stock <= 5).length;
  //       this.numeroProductosBajoStockSubject.next(cantidadProductos);
  //     }
  //   });
  // }
  // token() {
  //   let idUsuario: number = 0;


  //   // Obtener el idUsuario del localStorage
  //   const usuarioString = localStorage.getItem('usuario');
  //   const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
  //   const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
  //   if (datosDesencriptados !== null) {
  //     const usuario = JSON.parse(datosDesencriptados);
  //     idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

  //     this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
  //       (usuario: any) => {

  //         console.log('Usuario obtenido:', usuario);
  //         let refreshToken = usuario.refreshToken

  //         // Manejar la renovación del token
  //         this._usuarioServicio.renovarToken(refreshToken).subscribe(
  //           (response: any) => {
  //             console.log('Token actualizado:', response.token);
  //             // Guardar el nuevo token de acceso en el almacenamiento local
  //             localStorage.setItem('authToken', response.token);
  //             this.iniciarActualizacionAutomatica2();
  //           },
  //           (error: any) => {
  //             console.error('Error al actualizar el token:', error);
  //           }
  //         );



  //       },
  //       (error: any) => {
  //         console.error('Error al obtener el usuario:', error);
  //       }
  //     );
  //   }

  // }

  // iniciarActualizacionAutomatica2(): void {
  //   this.http.get<any>(`${environment.endpoint}producto/stockbajo`, { headers: this.getHeaders() })
  //     .subscribe(response => {
  //       if (response.status && response.value) {
  //         const productos: Producto[] = response.value; // Asigna el tipo Producto al arreglo de productos
  //         const cantidadProductos = productos.filter((producto: Producto) => producto.stock <= 5).length;

  //         this.numeroProductosBajoStockSubject.next(cantidadProductos); // Actualizar el BehaviorSubject
  //       }
  //     });
  // }



  // resetearContadorProductosBajoStock(): void {
  //   // Establecer el valor de productos bajo stock en cero
  //   this.numeroProductosBajoStockSubject.next(0);

  //   // Reiniciar el intervalo de actualización automática
  //   this.iniciarActualizacionAutomatica();
  // }


  // obtenerProductosBajoStock(): Observable<Producto[]> {
  //   return this.http.get<any>(`${environment.endpoint}producto/stockbajo`, { headers: this.getHeaders() }).pipe(
  //     map(response => {
  //       if (response.status && response.value) {
  //         const productos: Producto[] = response.value;
  //         this.numeroProductosBajoStockSubject.next(productos.length); // Actualizar el número de productos bajo stock

  //         // Filtrar los productos con stock <= 5
  //         const productosConStockBajo = productos.filter(producto => producto.stock <= 5);
  //         return productosConStockBajo;
  //       } else {
  //         return [];
  //       }
  //     })
  //   );
  // }




}
