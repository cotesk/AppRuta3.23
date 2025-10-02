import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UtilidadService } from '../Reutilizable/utilidad.service';
import { tick } from '@angular/core/testing';
import { Observable, BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { filter, take } from 'rxjs/operators';
import { MenuService } from './menu.service';
import { UsuariosService } from './usuarios.service';

@Injectable({
  providedIn: 'root'
})
export class AuthLoginGuard implements CanActivate {
  private isDataReadySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  constructor(private authService: AuthService, private router: Router,
    private utilidad: UtilidadService,
    private _utilidadServicio: UtilidadService,
    private menuService: MenuService,
    private _usuarioServicio: UsuariosService,
  ) { }
  //no me deja ir al login pero no tiene permiso de acceso
  // canActivate(): boolean {


  //   console.log('AuthGuard invoked');
  //   if (this.authService.isAuthenticated()) {

  //     return true;
  //   } else {
  //     console.log('User not authenticated. Redirecting to login.');
  //     // Redirigir a la página de inicio de sesión si no está autenticado
  //     this.router.navigate(['/login']);
  //     this.utilidad.eliminarSesionUsuario();
  //     this.authService.logout();
  //     return false;
  //   }
  // }




  // canActivate(): Observable<boolean> | boolean {
  //   if (this.authService.isAuthenticated()) {
  //     const usuario = this.authService.obtenerUsuarioLocalStorage();

  //     if (usuario && usuario.idUsuario !== undefined) {
  //       const idUsuario: number = usuario.idUsuario;
  //       const requestedUrl = this.router.url;
  // //  const requestedUrl = this.router.url.startsWith('/pages') ? this.router.url : '/pages';

  //       if (usuario.rolDescripcion === 'Administrador') {
  //         // Usuario Administrador, permitir acceso a todas las páginas
  //         return true;
  //       } else {
  //         // Usuario no Administrador, obtener los menús asociados al usuario
  //         return this.authService.obtenerMenusUsuario(idUsuario).pipe(
  //           switchMap((menus) => {
  //             const tieneAcceso = this.verificarAccesoParaRol(requestedUrl, usuario.rolDescripcion || '', menus);
  //             if (tieneAcceso) {
  //               // Informar que los datos están listos
  //               this.isDataReadySubject.next(true);
  //               return of(true);
  //             } else {
  //               this.mostrarMensajeAccesoDenegado();
  //               this.redirigirInicio();
  //               return of(false);
  //             }
  //           }),
  //           catchError(() => {
  //             // Manejar errores aquí si es necesario
  //             this.mostrarMensajeAccesoDenegado();
  //             this.redirigirInicio();
  //             return of(false);
  //           })
  //         );
  //       }
  //     } else {
  //       // No se pudo obtener el usuario o su ID. Redirigir al inicio de sesión.
  //       this.redirigirInicio();
  //       this.utilidad.eliminarSesionUsuario();
  //       this.authService.logout();
  //       return false;
  //     }
  //   } else {
  //     console.log('Usuario no autenticado. Redirigiendo al inicio de sesión.');
  //     // Redirigir a la página de inicio de sesión si no está autenticado
  //     this.mostrarMensajeAccesoDenegado();
  //     this.redirigirInicio();
  //     this.utilidad.eliminarSesionUsuario();
  //     this.authService.logout();
  //     return false;
  //   }
  // }

  //funcionando actualmente 2024
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const url: string = state.url;
    if (this.authService.isAuthenticated()) {
      const rolesPermitidos: string[] = ['Administrador', 'Paseador', 'Cliente'];
      const rolUsuarioActual = this.authService.getCurrentUserRole();
      // Guarda la URL solicitada en localStorage
      localStorage.setItem('redirectUrl', url);
      console.log('Rol del usuario actual:', rolUsuarioActual);

      if (rolesPermitidos.includes(rolUsuarioActual)) {
        const idUsuario = this.authService.getCurrentUserId();
        console.log('ID del usuario actual:', idUsuario);

        return this.menuService.obtenerMenusPorUsuario(idUsuario!).pipe(
          map(menus => {
            console.log('Menús del usuario:', menus);
            const url = state.url;

            if (url === "/pages") {
              return true;
            }

            const tieneAcceso = menus.some(menu => menu.url === url);
            if (tieneAcceso) {
              return true;
            } else {
              this.router.navigate(['/pages']);
              return false;
            }
          })
        );
      } else {
        this.router.navigate(['/login']);
        return of(false);
      }
    } else {
      this.authService.redirectUrl = state.url;
      this.router.navigate(['/login']);
      return of(false);
    }
  }

  // canActivate(
  //   next: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean> {
  //   // Verificar si el usuario está autenticado
  //   if (!this.authService.isAuthenticated()) {
  //     // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  //     this.router.navigate(['/login']);
  //     return of(false);
  //   }


  //   // Obtener el id de usuario actual
  //   const idUsuario = this.authService.getCurrentUserId();

  //   // Obtener los menús asociados al usuario actual
  //   return this.menuService.obtenerMenusPorUsuario(idUsuario!).pipe(
  //     map(menus => {
  //       // Verificar si la ruta solicitada está presente en los menús del usuario
  //       const url = state.url;
  //       const hasAccess = menus.some(menu => menu.url === url);
  //       if (hasAccess) {
  //         return true;
  //       } else {
  //         // Si el usuario no tiene acceso a la ruta, redirigir a una página de acceso denegado o a la página principal
  //         this.router.navigate(['/pages']);
  //         return false;
  //       }
  //     })
  //   );
  // }



  private mostrarMensajeAccesoDenegado(): void {
    // Utiliza tu servicio Utilidad para mostrar un mensaje de acceso denegado
    //this.utilidad.mostrarAlerta('Acceso denegado. No tienes permisos para acceder a esta página.', "ERROR!");

  }



}
