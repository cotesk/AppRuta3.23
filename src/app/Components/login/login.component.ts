import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { Login } from '../../Interfaces/login';
import { UsuariosService } from '../../Services/usuarios.service';
import { UtilidadService } from '../../Reutilizable/utilidad.service';
import { Usuario } from '../../Interfaces/usuario';
import { AuthService } from '../../Services/auth.service';
// import { ProductoService } from '../../Services/producto.service';
import { MatDialog } from '@angular/material/dialog';
// import { Producto } from '../../Interfaces/producto';
// import { ModalStockComponent } from '../layout/Modales/modal-stock/modal-stock.component';
import { Observable, Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { TemporizadorService } from '../../Services/temporizador.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalTemporizadorComponent } from '../layout/Modales/modal-temporizador/modal-temporizador.component';
import { NuevosUsuariosComponent } from '../nuevos-usuarios/nuevos-usuarios.component';
import Swal from 'sweetalert2';
import { LoadingModalComponent } from '../layout/Modales/loading-modal/loading-modal.component';
// import { ProductoCardComponent } from '../layout/Pages/producto-card/producto-card.component';
import { ContenidoService } from '../../Services/contenido.service';
import { Contenido } from '../../Interfaces/contenido';
import { ReponseApi } from '../../Interfaces/reponse-api';
import { VerImagenProductoModalComponent } from '../layout/Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { SolicitarRestablecimientoComponent } from '../solicitar-restablecimiento/solicitar-restablecimiento.component';
// import { AuthGoogleService } from '../../Services/auth-google.service';
// import { CartService } from '../../Services/cart.service';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
// import { FirebaseApp } from '@angular/fire/app';
// import { getApps } from '@angular/fire/app';
// import { Auth } from 'firebase/auth';
// import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',

})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  formularioLogin: FormGroup;
  ocultarPassword: boolean = true;
  mostrarLoading: boolean = false;
  usuario: Usuario = {} as Usuario;
  botonIngresarDesactivado: boolean = false;
  subscriptions: Subscription[] = [];
  intentosFallidos: number = 0;
  tiempoRestante: number = 30;
  errorMessage: string = '';
  tiempoRestante$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  bloquearFormulario: boolean = false;

  images: string[] = [];
  comentarioTextoLogin: Contenido | undefined;
  // images = [

  //   'assets/Images/Local.jpg',
  //   'assets/Images/Local2.jpg',
  //   'assets/Images/Local3.jpg',
  //   'assets/Images/Local4.jpg'

  // ]
  currentIndex = 0;
  carouselInterval = 3000; // Intervalo de cambio de diapositivas en milisegundos
  private intervalId: any;
  private observer: IntersectionObserver | undefined;


  startCarousel(): void {
    this.intervalId = setInterval(() => {
      this.showNextSlide();
    }, this.carouselInterval);
  }
  ngAfterViewInit(): void {
    this.initIntersectionObserver();
  }
  showNextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }
  initIntersectionObserver(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const imgElement = entry.target as HTMLImageElement;
          const src = imgElement.getAttribute('data-src');
          if (src) {
            imgElement.src = src;
            imgElement.classList.remove('lazy-load');
            this.observer!.unobserve(imgElement);
          }
        }
      });
    });

    const lazyImages = document.querySelectorAll('.lazy-load');
    lazyImages.forEach(img => this.observer!.observe(img));
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _usuarioServicio: UsuariosService,
    private _utilidadServicio: UtilidadService,
    private authService: AuthService,
    // private productoService: ProductoService, // Agrega ProductoService
    private dialog: MatDialog, // Agrega MatDialog
    private temporizadorService: TemporizadorService,
    private servicioContenido: ContenidoService,
    // private authGoogleService: AuthGoogleService,
    // private cartService: CartService,
    private oauthService: OAuthService
    // private firebaseApp: FirebaseApp

  ) {
    this.formularioLogin = this.fb.group({

      email: ['', [Validators.required, Validators.email, Validators.maxLength(35)]],
      password: ['', Validators.required]
    })


  }
  private authConfig: AuthConfig = {


    loginUrl: 'https://accounts.google.com/o/oauth2/auth',
    redirectUri: window.location.origin + '/pages',
    clientId: '1006953044303-6prugfbs5utmmsuiefakv403p28l34h9.apps.googleusercontent.com',
    scope: 'openid profile email',
    issuer: 'https://accounts.google.com',
    strictDiscoveryDocumentValidation: false,
  };

  ngOnInit(): void {

    this.configureOAuth();
    //funciona para inabilitar la aplicacion visualmente dejandola en blanco es funcional
    // const dueDate = new Date('2025-11-15');    // Fecha de vencimiento
    // const deadline = 3;  // Plazo en días
    // const currentDate = new Date();  // Fecha actual

    // const daysPassed = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // if (daysPassed > 0) {
    //   const daysLate = daysPassed - deadline;
    //   let opacity = 1 - (daysLate / deadline);
    //   opacity = Math.min(opacity, 1);
    //   opacity = Math.max(opacity, 0);

    //   // Aplicar la opacidad al body del documento
    //   document.body.style.opacity = opacity.toString();

    //   // Mostrar mensaje de alerta si el plazo ha pasado
    //   if (daysPassed > deadline) {
    //     Swal.fire({
    //       title: 'Tiempo vencido',
    //       text: `Han pasado ${daysLate} días desde el plazo de 15 días. Reúnase con su dueño.`,
    //       icon: 'warning',
    //       confirmButtonText: 'Entendido'
    //     });
    //   }

    // }
    //fin

    this.cargarContenidosImagen();
    this.startCarousel();


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

    // Verifica si el usuario ya está autenticado al iniciar el componente
    if (this.authService.isAuthenticated()) {
      // Si ya está autenticado, redirige a la página deseada (por ejemplo, 'pages')
      this.router.navigate(['pages']);
    } else {
      // Verifica si el formulario debe estar bloqueado al iniciar el componente
      const bloquearFormulario = localStorage.getItem('bloquearFormulario');
      if (bloquearFormulario && bloquearFormulario === 'true') {
        this.bloquearFormulario = true;
        this.iniciarConteoRegresivo();  // Inicia el conteo solo si el formulario está bloqueado
        this.mostrarModalTemporizador();
      }
    }
    const bloquearFormulario = localStorage.getItem('bloquearFormulario');
    if (bloquearFormulario && bloquearFormulario === 'true') {
      this.bloquearFormulario = true;
      this.iniciarConteoRegresivo();  // Inicia el conteo solo si el formulario está bloqueado
      this.mostrarModalTemporizador();
    }
  }
  login() {
    // const nombre = this.formularioLogin.value.email;
    // const correo = this.formularioLogin.value.password;
    // this.authGoogleService.login();
     this._usuarioServicio.loginWithGoogle();
    // this.oauthService.initLoginFlow();
    // this.authService.login();
  }

  configureOAuth() {
    this.oauthService.configure(this.authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  logout() {
    // this.authGoogleService.logout();
  }

  mostrarModalTemporizador() {
    // Abre el modal de temporizador solo si el formulario está bloqueado
    if (this.bloquearFormulario) {
      const dialogRef = this.dialog.open(ModalTemporizadorComponent, {
        disableClose: true,

      });

      // Espera a que el modal se haya abierto
      dialogRef.afterOpened().subscribe(() => {
        // Inicia el conteo regresivo dentro del modal
        this.temporizadorService.iniciarConteoRegresivo(30);
      });

      // Suscríbete al cierre del modal
      dialogRef.afterClosed().subscribe(() => {
        // Restablece el conteo al cerrar el modal

        this.resetearConteo();
      });
    }
  }

  verImagen(imageUrl: string): void {
    if (imageUrl === "") {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `No hay imagen para mostrar`,
      });
    } else {
      this.dialog.open(VerImagenProductoModalComponent, {
        data: {
          imagenes: [imageUrl]
        }
      });
    }

  }
  //original
  //   iniciarSesion() {

  //     this.mostrarLoading = true;

  //     const request: Login = {
  //       correo: this.formularioLogin.value.email,
  //       clave: this.formularioLogin.value.password,

  //     }


  // this._usuarioServicio.iniciarSesion(request).subscribe({
  //   next: (data) => {
  //     if (data.status) {
  //       this._utilidadServicio.guardarSesionUsuario(data.value);
  //       this.authService.login();  // Asegúrate de que este método esté siendo llamado


  //       console.log('User authenticated:', this.authService.isAuthenticated());
  //       this.router.navigate(["pages"]);
  //     } else {
  //       this._utilidadServicio.mostrarAlerta("No se encontraron coincidencias", "opps!");
  //     }
  //   },
  //   complete: () => {
  //     this.mostrarLoading = false;
  //   },
  //   error: () => {
  //     this._utilidadServicio.mostrarAlerta("Hubo un error", "opps!");
  //     this.mostrarLoading = false;
  //   },
  // });



  //  }
  cargarContenidosImagen(): void {
    this.servicioContenido.lista().subscribe(
      (response: ReponseApi) => {
        if (response && response.status && response.value && Array.isArray(response.value)) {
          // const imagenesBase64 = response.value
          this.images = response.value
            .filter((contenido) => contenido.tipoContenido === 'Imagen')
            .map((imagenContenido) => imagenContenido.imagenUrl);
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Error',
          //   text: 'vamos por aqui .'
          // });
          //funcional
          // this.subscriptions.push(...imagenesBase64.map(base64 => this.loadImage(base64)));

        } else {
          console.error('La respuesta API no contiene los datos esperados:', response);
        }
      },
      (error) => {
        console.error('Error al cargar contenidos de imágenes:', error);
      }
    );
  }

  loadImage(base64String: string): Subscription {
    return this.decodificarBase64AUrl(base64String).subscribe(
      (url: string) => {
        this.images.push(url);
      },
      (error) => {
        console.error('Error al decodificar la imagen:', error);
      }
    );
  }

  // Método para decodificar una cadena base64 a URL de imagen
  decodificarBase64AUrl(base64String: string): Observable<string> {
    return new Observable((observer) => {
      const binaryString = window.atob(base64String);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      observer.next(url);
      observer.complete();
      // // Al limpiar la URL, revoca el objeto URL para liberar recursos
      // return () => URL.revokeObjectURL(url);
    });
  }

  hideImage(imageUrl: string): void {
    const index = this.images.indexOf(imageUrl);
    if (index !== -1) {
      this.images.splice(index, 1); // Elimina la URL del array al ocultar la imagen
      URL.revokeObjectURL(imageUrl); // Revoca la URL de objeto para liberar recursos
    }
  }
  mostrarRecuperarSwal() {
    Swal.fire({
      title: 'Ingrese su correo electrónico',
      input: 'email',
      inputLabel: 'Correo electrónico',
      inputPlaceholder: 'Ingrese su correo electrónico',
      showCancelButton: true,
      confirmButtonColor: '#1337E8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (!value) {
          return 'Debe ingresar un correo electrónico';
        } else {
          return ''; // Retorna una cadena vacía si no hay problemas de validación
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const correo = result.value;
        // Swal.fire({
        //   title: 'Buscando...',
        //   allowOutsideClick: false,
        //   html: '<img src="assets/Images/bean-mr.gif" style="width: 200px; height: 200px;">',
        //   didOpen: () => {
        //     Swal.showLoading();
        //   }
        // });

        this._usuarioServicio.recuperarContraseña(correo).subscribe(
          (response: any) => {
            if (response.status) {
              Swal.fire('Éxito', 'Se ha enviado la contraseña a tu correo electrónico.', 'success');
            } else {
              Swal.fire('Error', response.msg, 'error');
            }
          },
          (error) => {
            Swal.fire('Error', 'Hubo un error al enviar el correo electrónico.', 'error');
          }
        );
      }
    });
  }
  navigateToRoute() {
    // this.router.navigate(['/']);
    this.router.navigate(['/menu/cards']);
  }
  cambiarContra() {
    this.dialog.open(SolicitarRestablecimientoComponent, {
      width: '500px', // Ancho del modal
      height: '340px',
      // disableClose: true,

    });
    //  this.router.navigate(['/']);

  }

  iniciarSesion(event: Event) {
    event.preventDefault();
    console.log('Iniciando sesión...');

    this.botonIngresarDesactivado = true;
    // this.cartService.clearCart();
    const request: Login = {
      correo: this.formularioLogin.value.email,
      clave: this.formularioLogin.value.password,
    };

    const dialogRef = this.dialog.open(LoadingModalComponent, {
      disableClose: true, // Evita que el usuario cierre el modal haciendo clic fuera de él
    });

    this._usuarioServicio.iniciarSesion(request).subscribe({
      next: (data) => {
        console.log('Respuesta del servidor:', data);
        if (data && data.status) {
          console.log('Usuario autenticado');

          if (data.value) {
            // Accede a los datos del usuario
            const usuario = data.value;
            console.log('Datos del usuario:', usuario);

            // Guarda la sesión del usuario
            this._utilidadServicio.guardarSesionUsuario(usuario);
          }
          // this.authService.login();
          const token = data.token;
          this.authService.setAuthToken(token);

          // const token = data.value.token;
          // this.authService.setAuthToken(token);

          if (data.value.rolDescripcion === 'Administrador' || data.value.rolDescripcion === 'Supervisor') {
            console.log('Redirigiendo a la página de administrador o supervisor');
                   this.botonIngresarDesactivado = false;
                    dialogRef.close();  // Cierra el modal después de 5 segundos
                    this.router.navigate(["pages"]);
          } else {
            this.botonIngresarDesactivado = false;
            setTimeout(() => {
              dialogRef.close();
              console.log('Redirigiendo a la página de empleados');
              this.resetearConteo();
              // Usuario es Empleado, redirigir a la página correspondiente sin mostrar el modal
              this.router.navigate(["pages"]);
            }, 3000);
          }
        } else {


          setTimeout(() => {
            dialogRef.close();

            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `No se encontraron coincidencias`,
            })
            console.log('Error en la autenticación del usuario');
            // this._utilidadServicio.mostrarAlerta("No se encontraron coincidencias", "opps!");
            this.mostrarLoading = false;
            this.botonIngresarDesactivado = false;
            this.manejarIntentoFallido();
          }, 3000);


        }

      },
      complete: () => {
        console.log('Proceso de inicio de sesión completo');
        this.mostrarLoading = false;
        this.botonIngresarDesactivado = false;
      },
      error: (err) => {

        console.log('Error en el proceso de inicio de sesión:', err);

        if (err.error.mensaje == "Error inesperado: Error inesperado: El usuario no existe.") {
          dialogRef.close();
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `Verifique que su contraseña o usuario este correctamente.`,
          })
          this.mostrarLoading = false;
          this.botonIngresarDesactivado = false;
          this.manejarIntentoFallido();

        } else {


          setTimeout(() => {
            dialogRef.close();
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `Este usuario esta inactivo.`,
            })
            console.error('Error en el proceso de inicio de sesión:', err);
            // this._utilidadServicio.mostrarAlerta("Hubo un error", "opps!");
            console.log('Error en el proceso de inicio de sesión');
            this.mostrarLoading = false;
            this.botonIngresarDesactivado = false;
            this.manejarIntentoFallido();
          }, 3000);


        }






      },
    });

  }


  // openProductModal(products: Producto[]) {
  //   // const dialogRef = this.dialog.open(ModalStockComponent, {
  //   //   width: '610px',
  //   //   disableClose: true,
  //   //   data: { producto: products }
  //   // });

  //   // dialogRef.afterClosed().subscribe(result => {
  //   //   console.log('El diálogo se cerró');
  //   //   // Limpia las imágenes al cerrar el modal
  //   // });
  // }
  redirigirANuevosUsuarios(): void {

    const dialogRef = this.dialog.open(NuevosUsuariosComponent, {

      width: '550px',
      height: '540px'
    });

    // Suscríbete al cierre del modal
    dialogRef.afterClosed().subscribe(() => {
      console.log('El diálogo se cerró');
      // Lógica a realizar después de cerrar el diálogo si es necesario
    });
  }


  nuevoProducto() {
    // const dialogRef = this.dialog.open(ProductoCardComponent, {
    //   // Configuración del diálogo si es necesario
    // });

    // // Suscríbete al cierre del modal
    // dialogRef.afterClosed().subscribe(() => {
    //   console.log('El diálogo se cerró');
    //   // Lógica a realizar después de cerrar el diálogo si es necesario
    // });
  }

  manejarIntentoFallido() {
    this.intentosFallidos++;
    console.log('Intentos fallidos:', this.intentosFallidos);

    if (this.intentosFallidos >= 3) {
      this.iniciarConteoRegresivo();
      this.botonIngresarDesactivado = false;
      this.errorMessage = 'Has excedido el número máximo de intentos. Intenta nuevamente después de un tiempo.';
      localStorage.setItem('bloquearFormulario', 'true');  // Almacena en LocalStorage

      // Abre el modal de temporizador
      const dialogRef = this.dialog.open(ModalTemporizadorComponent, {
        disableClose: true, // No permite cerrar el modal haciendo clic fuera de él
      });

      // Espera a que el modal se haya abierto
      dialogRef.afterOpened().subscribe(() => {
        // Inicia el conteo regresivo dentro del modal
        this.temporizadorService.iniciarConteoRegresivo(30);
      });

      // Suscríbete al cierre del modal
      dialogRef.afterClosed().subscribe(() => {
        // Restablece el conteo al cerrar el modal
        this.resetearConteo();
        // Remueve el bloqueo al cerrar el modal
        localStorage.removeItem('bloquearFormulario');
        this.bloquearFormulario = false;
      });
    }


  }



  // Ejemplo en el método iniciarConteoRegresivo()
  iniciarConteoRegresivo() {
    console.log('Iniciando conteo regresivo');
    this.botonIngresarDesactivado = true;

    this.temporizadorService.iniciarConteoRegresivo(this.tiempoRestante);

    this.temporizadorService.getTiempoRestante$().subscribe((tiempoRestante) => {
      console.log('Nuevo tiempo:', tiempoRestante);
      if (tiempoRestante === 0) {
        this.resetearConteo();
        // this.errorMessage = '';  // Restablecer el mensaje de error al completar el contador
        this.botonIngresarDesactivado = false;

        this.errorMessage = '';
        this.cerrarModal();
      }
    });
  }

  resetearConteo() {
    console.log('Reseteando conteo');
    this.tiempoRestante$.next(0);
    this.intentosFallidos = 0;
    this.botonIngresarDesactivado = false;
    // Establece el valor en el localStorage a false al restablecer el conteo
    localStorage.setItem('bloquearFormulario', 'false');
  }

  cuentaRegresiva() {
    return timer(0, 1000).pipe(
      take(this.tiempoRestante)
    );
  }
  ngOnDestroy(): void {
    // Asegúrate de destruir la suscripción cuando el componente se destruye
    this.temporizadorService.ngOnDestroy();
    clearInterval(this.intervalId);
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.images.forEach(url => URL.revokeObjectURL(url));
  }


  cerrarModal(): void {
    // Agrega cualquier lógica de limpieza o manipulación antes de cerrar el modal si es necesario
    this.temporizadorService.ngOnDestroy(); // Llama al ngOnDestroy del servicio para detener el temporizador
    this.dialog.closeAll(); // Cierra todos los modales abiertos (asegúrate de que no haya otros modales abiertos)
  }
}





