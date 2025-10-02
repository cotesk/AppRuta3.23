import { MatSnackBar } from '@angular/material/snack-bar';
import { Sesion } from '../Interfaces/sesion';
import { JsonPipe } from '@angular/common';
import { Usuario } from '../Interfaces/usuario';
import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, observable, Subject } from "rxjs";
import * as CryptoJS from 'crypto-js';
import { AuthService } from '../Services/auth.service';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UtilidadService {


  isDocente = new Subject<boolean>();
   private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  private apiUrl: string = environment.endpoint + "Configuracion/"

  constructor(private _snackBar: MatSnackBar,
    private http: HttpClient, private authService: AuthService
  ) { }

  mostrarAlerta(mensaje: string, tipo: string) {

    this._snackBar.open(mensaje, tipo, {
      horizontalPosition: "end",
      verticalPosition: "top",
      duration: 6000

    })

  }

  obtenerClaveSecreta(): Observable<any> {
    const token = this.authService.getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}clave-secreta`, { headers });
  }
  //funcional
  // guardarSesionUsuario(usuarioSession: Sesion) {
  //   try {
  //     const datosUsuarioEncriptados = CryptoJS.AES.encrypt(JSON.stringify(usuarioSession), this.CLAVE_SECRETA).toString();
  //     localStorage.setItem("usuario", datosUsuarioEncriptados);
  //   } catch (error) {
  //     console.error('Error al encriptar y guardar los datos del usuario:', error);
  //     this.mostrarAlerta("Error al guardar la sesión del usuario", "error");
  //   }
  // }
  guardarSesionUsuario(usuarioSession: Sesion) {
    // this.obtenerClaveSecreta().subscribe(
    //   (response: any) => {
    //     const claveSecreta = response.claveSecreta;
        try {
          const datosUsuarioEncriptados = CryptoJS.AES.encrypt(JSON.stringify(usuarioSession), this.CLAVE_SECRETA).toString();
          localStorage.setItem('usuario', datosUsuarioEncriptados);
        } catch (error) {
          console.error('Error al encriptar y guardar los datos del usuario:', error);
          this.mostrarAlerta("Error al guardar la sesión del usuario", "error");
        }
    //   },
    //   (error) => {
    //     console.error('Error al obtener la clave secreta:', error);
    //     this.mostrarAlerta("Error al obtener la clave secreta", "error");
    //   }
    // );
  }
  obtenerSesionUsuario(): Sesion | any {
    // this.obtenerClaveSecreta().subscribe(
    //   (response: any) => {
    //     const claveSecreta = response.claveSecreta;
        try {
          const datosUsuarioEncriptados = localStorage.getItem("usuario");
          if (datosUsuarioEncriptados) {
            const bytesDesencriptados = CryptoJS.AES.decrypt(datosUsuarioEncriptados, this.CLAVE_SECRETA);
            const datosDesencriptados = bytesDesencriptados.toString(CryptoJS.enc.Utf8);
            return JSON.parse(datosDesencriptados);
          }
          return null;
        } catch (error) {
          console.error('Error al desencriptar y obtener los datos del usuario:', error);
          this.mostrarAlerta("Error al obtener la sesión del usuario", "error");
          return null;
        }
    //   },
    //   (error) => {
    //     console.error('Error al obtener la clave secreta:', error);
    //     this.mostrarAlerta("Error al obtener la clave secreta", "error");
    //   }
    // );
  }
  //funcional
  // obtenerSesionUsuario(): Sesion | null {
  //   try {
  //     const datosUsuarioEncriptados = localStorage.getItem("usuario");
  //     if (datosUsuarioEncriptados) {
  //       const bytesDesencriptados = CryptoJS.AES.decrypt(datosUsuarioEncriptados, this.CLAVE_SECRETA);
  //       const datosDesencriptados = bytesDesencriptados.toString(CryptoJS.enc.Utf8);
  //       return JSON.parse(datosDesencriptados);
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error('Error al desencriptar y obtener los datos del usuario:', error);
  //     this.mostrarAlerta("Error al obtener la sesión del usuario", "error");
  //     return null;
  //   }
  // }

  eliminarSesionUsuario() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("authToken");
  }
  // guardarSesionUsuario(usuarioSession: Sesion) {

  //   // Convertir el ArrayBuffer a una cadena base64
  //   const isBase64 = /^data:image\/[a-zA-Z]*;base64,/.test(usuarioSession.imageData);

  //   // Si no está en formato Base64, conviértela
  //   if (!isBase64) {
  //     const binaryString = atob(usuarioSession.imageData);
  //     usuarioSession.imageData = btoa(binaryString);
  //   }
  //   localStorage.setItem("usuario", JSON.stringify(usuarioSession));

  // }

  // obtenerSesionUsuario(): Sesion | null {

  //   const dataCadena = localStorage.getItem("usuario");
  //   if (!dataCadena) {
  //     return null;
  //   }
  //   const usuario = JSON.parse(dataCadena!)
  //   usuario.imageData = Uint8Array.from(atob(usuario.imageData), c => c.charCodeAt(0));
  //   return usuario;

  // }

  // eliminarSesionUsuario() {

  //   localStorage.removeItem("usuario")
  //   // localStorage.removeItem("imagenUsuario")
  // }




}
