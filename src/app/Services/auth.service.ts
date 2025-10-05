import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../Interfaces/usuario';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Menu } from '../Interfaces/menu';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';
import jwtDecode from 'jwt-decode';

import { UsuariosService } from './usuarios.service';
import { environment } from '../environments/environment';
import { LicenciaService } from './licencia.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isUserLoggedIn: boolean = false;
  // private apiUrl = 'http://localhost:5226/api/';
  //private apiUrl = 'https://www.sofemprethy.somee.com/api/';
  //private apiUrl = "https://sofeemprethy-001-site1.jtempurl.com/api/";
  private apiUrl: string = environment.endpoint;
  private usuario: Usuario = {}; // Agrega esta línea con una inicialización vacía
  private userRole: string | undefined; // Propiedad para almacenar el rol del usuario
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  redirectUrl: string | null = null;
  usuarios: any;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private _usuarioServicio: UsuariosService,
    private licenciaService: LicenciaService
    // private toastr: ToastrService

  ) {

    // this.setupInactivityTimer();


    //me elimina la autenticacion si cierro la pesataña y mantiene la sesion abierta si recargo la pagina
    const storedToken = sessionStorage.getItem(this.tokenKey) || localStorage.getItem(this.tokenKey);
    if (storedToken) {
      this.setAuthToken(storedToken);

    } else {
      localStorage.removeItem("usuario");
    }

    window.addEventListener('beforeunload', () => {
      // Almacenar el authToken en sesión al recargar la página
      const currentToken = this.getAuthToken();
      if (currentToken) {
        sessionStorage.setItem(this.tokenKey, currentToken);
      }
    });

    window.addEventListener('unload', () => {
      // Eliminar el authToken al cerrar la ventana o el navegador
      this.removeAuthToken();
    });
  }

  private tokenKey = 'authToken';
  private inactivityTimeout: any;

  setAuthToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeAuthToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {

    // Verifica si el token está presente y es válido según tus criterios
    const token = this.getAuthToken();
    if (!token) {
      return false;
    }
    const isTokenExpired = this.isTokenExpired(token);
    if (isTokenExpired) {
      let idUsuario: number = 0;

      // Obtener el idUsuario del localStorage
      const usuarioString = localStorage.getItem('usuario');
      const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
      if (datosDesencriptados !== null) {
        const usuario = JSON.parse(datosDesencriptados);
        idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

        this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
          (usuario: any) => {

            console.log('Usuario obtenido:', usuario);
            let refreshToken = usuario.refreshToken


            // Manejar la renovación del token
            this._usuarioServicio.renovarToken(refreshToken).subscribe(
              (response: any) => {
                console.log('Token actualizado:', response.token);
                // Guardar el nuevo token de acceso en el almacenamiento local
                localStorage.setItem('authToken', response.token)
                // Redirigir de nuevo a la URL original después de la renovación del token
                const redirectUrl = this.redirectUrl || localStorage.getItem('redirectUrl') || '/pages';
                localStorage.removeItem('redirectUrl');
                this.router.navigateByUrl(redirectUrl);
              },
              (error: any) => {
                console.error('Error al actualizar el token:', error);
              }
            );



          },
          (error: any) => {
            console.error('Error al obtener el usuario:', error);
          }
        );
      }


      return true;
    }


    return true;
  }
  isTokenExpired(token: string): boolean {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        // El token no tiene el formato correcto
        return true;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = new Date().getTime();

      return expirationTime < currentTime;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true; // Por precaución, consideramos que el token ha expirado en caso de error
    }
  }

  //para eliminar la sesion por inatividad
  // public setupInactivityTimer(): void {
  //   document.addEventListener('mousemove', () => this.resetInactivityTimer());
  //   document.addEventListener('keydown', () => this.resetInactivityTimer());
  //   document.addEventListener('touchstart', () => this.resetInactivityTimer());//para dispositivo movil
  //   this.resetInactivityTimer();
  // }
  public setupInactivityTimer(): void {
    // Detectar eventos de interacción para resetear el temporizador de inactividad
    const events = ['mousemove', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, this.resetInactivityTimer.bind(this));
    });

    // Establecer el temporizador inicialmente
    this.resetInactivityTimer();
  }

  //Funcional
  // public resetInactivityTimer(): void {
  //   clearTimeout(this.inactivityTimeout);
  //   this.inactivityTimeout = setTimeout(() => {
  //     this.logout();
  //     this.router.navigate(['/login']);
  //   // }, 2 * 60 * 1000); // 2 minutos
  // }, 10 * 1000); // 10 segundo
  // }
  public resetInactivityTimer(): void {
    clearTimeout(this.inactivityTimeout);
    console.log(this.router.url);
    // Verificar la ruta actual antes de mostrar el mensaje
    if (this.router.url !== '/login') {
      this.inactivityTimeout = setTimeout(() => {
        // Mostrar un mensaje antes de cerrar la sesión con SweetAlert
        Swal.fire({
          title: 'Cerrar sesión por inactividad',
          text: 'Se cerrará la sesión por inactividad . ¿Desea continuar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, cerrar sesión'
        }).then((result) => {
          if (result.isConfirmed) {
            // Cerrar sesión después de 1 segundo
            setTimeout(() => {
              this.logout();
              this.router.navigate(['/login']);
            }, 1 * 1000); // 1 segundo
          } else {
            // Reiniciar el temporizador de inactividad si el usuario elige no cerrar sesión
            this.resetInactivityTimer();
          }
        });
      }, 20 * 60 * 1000); //10 * 1000 = 10 segundos , 2 * 60 * 1000 = 2 minutos
    }
  }

  // login() {
  //   // Lógica de inicio de sesión (puedes implementarla según tus necesidades)
  //   this.isUserLoggedIn = true;
  //    // Ejemplo: almacenar un indicador de autenticación en el localStorage
  //    localStorage.setItem('isAuthenticated', 'true');
  //   // Redirigir a la página deseada después de iniciar sesión
  //   this.router.navigate(['pages']);
  // }

  logout() {
    // detener el timer de inactividad
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }


    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('redirectUrl');
    // // Lógica de cierre de sesión
    // this.isUserLoggedIn = false;
    //   // Ejemplo: eliminar el indicador de autenticación del localStorage
    //   localStorage.removeItem('isAuthenticated');
    // Redirigir a la página de inicio de sesión después de cerrar sesión
    this.router.navigate(['login']);
  }


  // isAuthenticated(): boolean {
  //   console.log('Checking authentication status:', this.isUserLoggedIn);
  //   //asi no permite acceder a otro compenete y me saca
  //   // return this.isUserLoggedIn;
  //   return localStorage.getItem('isAuthenticated') === 'true';
  // }
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
  actualizarUsuario(usuario: Usuario): Observable<any> {
    const url = `${this.apiUrl}Usuario/EditarUsuario/${usuario.idUsuario}`;
    const headers = this.getHeaders();
    return this.http.put(url, usuario, { headers }).pipe(
      catchError((error) => {
        console.error('Error al actualizar usuario:', error);
        throw error; // Puedes manejar el error aquí según tus necesidades
      })
    );
  }
  verifyAuthentication(): Observable<boolean> {
    // Obtenemos el token de autenticación del almacenamiento local
    const token = localStorage.getItem('authToken');

    if (!token) {
      // Si no hay token, el usuario no está autenticado
      return of(false);
    }

    // Podemos considerar el token como válido si está presente en el almacenamiento local
    return of(true);
  }
  getCurrentUserRole(): string {
    // Aquí deberías obtener el rol del usuario actual.
    // Puedes obtenerlo desde el token de autenticación
    // o desde cualquier otro lugar donde se almacene la información del usuario.
    // Por ahora, vamos a devolver un rol de ejemplo para demostración.
    const usuario = this.obtenerUsuarioLocalStorage();

    if (usuario) {
      // Devolver el rol del usuario actual
      console.log('Rol del usuario:', usuario?.rolDescripcion);
      return usuario.rolDescripcion!;
    } else {
      // Si no se encuentra el usuario en el almacenamiento local, devolver un valor predeterminado
      return 'Invitado';
    }
  }
  getCurrentUserId() {
    const usuario = this.obtenerUsuarioLocalStorage();

    if (usuario) {
      // Devolver el rol del usuario actual
      console.log('ID del usuario:', usuario?.idUsuario);
      return usuario.idUsuario!;
    } else {
      // Si no se encuentra el usuario en el almacenamiento local, devolver un valor predeterminado
      return null;
    }
  }
  // actualizarUsuarioLocal(usuario: Usuario): void {
  //   // Actualizamos el objeto 'usuario' localmente en el servicio
  //   this.usuario = { ...usuario };
  //   // También podrías almacenar esto en el local storage si es necesario
  //   localStorage.setItem('usuario', JSON.stringify(usuario));
  // }

  // ===== USUARIO =====
  private cargarUsuarioDeLocalStorage(): void {
    const usuarioEncriptado = localStorage.getItem('usuario');
    if (usuarioEncriptado) {
      try {
        const bytes = CryptoJS.AES.decrypt(usuarioEncriptado, this.CLAVE_SECRETA);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
        if (datosDesencriptados) {
          const usuario = JSON.parse(datosDesencriptados) as Usuario;
          this.usuarioSubject.next(usuario);
        }
      } catch (e) {
        console.error('Error al desencriptar usuario:', e);
      }
    }
  }

  actualizarUsuarioLocal(usuario: Usuario): void {
    const usuarioEncriptado = CryptoJS.AES.encrypt(JSON.stringify(usuario), this.CLAVE_SECRETA).toString();
    localStorage.setItem('usuario', usuarioEncriptado);
    this.usuarioSubject.next(usuario);
  }

  obtenerUsuarioLocalStorage(): Usuario | null {
    const usuarioEncriptado = localStorage.getItem('usuario');

    if (usuarioEncriptado) {
      try {
        const bytes = CryptoJS.AES.decrypt(usuarioEncriptado, this.CLAVE_SECRETA);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

        if (datosDesencriptados) {
          return JSON.parse(datosDesencriptados);
        } else {
          console.error('Los datos desencriptados están vacíos.');
          return null;
        }
      } catch (error) {
        console.error('Error al desencriptar los datos:', error);
        return null;
      }
    } else {
      console.error('No se proporcionó ningún dato encriptado.');
      return null;
    }


    return null;
  }
  //funcional
  // obtenerUsuarioLocalStorage(): Usuario | null {
  //   const usuarioString = localStorage.getItem('usuario');
  //   const usuario = usuarioString ? JSON.parse(usuarioString) : null;
  //   console.log('Usuario obtenido del localStorage:', usuario);
  //   return usuario;
  // }
  actualizarDatosUsuarioLocal(usuario: Usuario): void {
    // Actualiza los datos del usuario en el localStorage
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  obtenerMenusUsuario(idUsuario: number): Observable<Menu[]> {
    const url = `${this.apiUrl}Menu/Lista?idUsuario=${idUsuario}`;
    const headers = this.getHeaders();
    return this.http.get<Menu[]>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error al obtener menús de usuario:', error);
        throw error;
      })
    );
  }


  validarLicencia(): Observable<boolean> {
    const url = `${this.apiUrl}Licencias/consultar`;
    return this.http.get<any>(url).pipe(
      map((res: any) => {
        console.log('Licencia válida:', res);
        if (res && res.licencia) {
          const estadoPago = res.licencia.estadoPago;
          const activa = res.licencia.activa;
          return estadoPago === true && activa === true;
        }
        return false;
      }),
      catchError(err => {
        console.error('Error validando licencia:', err);
        return of(false);
      })
    );
  }


  mostrarAlertaLicencia(mensaje: string): void {
    Swal.fire({
      title: 'Licencia Vencida o Licencia Desactivada',
      confirmButtonColor: '#1337E8',
      text: mensaje,
      icon: 'error',
      confirmButtonText: 'Ingresar nueva licencia'
    }).then(() => {
      this.pedirLicencia();
    });
  }

  pedirLicencia(): void {
    Swal.fire({
      title: 'Ingrese su licencia',
      text: '📞 Pongase en contacto con el dueño del aplicativo para gestionar su licencia: 3012091145',
      input: 'text',
      inputPlaceholder: 'Digite el serial de la licencia',
      confirmButtonColor: '#1337E8',
      cancelButtonColor: '#d33',
      showCancelButton: false,
      confirmButtonText: 'Validar',
      allowOutsideClick: false,
      allowEscapeKey: false,
      preConfirm: (serial) => {
        if (!serial) {
          Swal.showValidationMessage('Debe ingresar un serial válido');
          // console.warn('⚠️ Validación fallida: serial vacío');
          return false;
        }

        // ✅ Caso 1: licencia por defecto
        if (serial === '1081828957') {
          // console.info('✅ Licencia por defecto detectada, redirigiendo a /licencias');
          this.router.navigate(['/licencias']);
          return true;
        }

        //console.log('🔎 Validando serial ingresado:', serial);

        // ✅ Caso 2: validar contra API
        return this.licenciaService.validarLicencia(serial).toPromise()
          .then((res) => {
            //console.log('📩 Respuesta del backend:', res);

            if (res.mensaje === 'Pago confirmado') {
              localStorage.setItem('licencia', serial);
               this.router.navigate(['/pages']);
              // console.info('✅ Licencia válida guardada en localStorage:', serial);
              return true; // cierra el Swal
            } else {
              // console.warn('⚠️ Licencia inválida:', res.mensaje);
              Swal.showValidationMessage(res.mensaje);
              return false; // mantiene abierto
            }
          })
          .catch((err) => {
            // console.error('❌ Error en la validación de licencia:', err);

            // Intentamos leer el mensaje que manda tu API
            let mensajeError = 'Error validando licencia';
            if (err?.error?.mensaje) {
              mensajeError = err.error.mensaje;  // 👈 viene del backend (ej: "Licencia vencida")
            } else if (err.message) {
              // Solo mostramos algo corto
              mensajeError = 'Esta licencia no es válida';
            }

            Swal.showValidationMessage(`Error validando licencia: ${mensajeError}`);
            return false;
          });

      }
    }).then((result) => {
      if (result.isConfirmed) {
        // console.log('🎉 Swal confirmado: licencia válida');
        Swal.fire('Éxito', 'Licencia válida, puede continuar', 'success');
      } else {
        //console.log('ℹ️ Swal cerrado sin confirmar');
      }
    });
  }




}
