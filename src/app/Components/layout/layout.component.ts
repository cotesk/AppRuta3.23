import { ImageDialogService } from './../../Services/image-dialog.service';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Menu } from '../../Interfaces/menu';
import { MenuService } from '../../Services/menu.service';
import { UtilidadService } from '../../Reutilizable/utilidad.service';
import { MatMenuModule } from '@angular/material/menu';
import { ChangeInfoModalService } from '../../Services/change-info-modal.service';
import { Usuario } from '../../Interfaces/usuario';
import { ImageUpdatedService } from '../../Services/image-updated.service';
import { MatDialog } from '@angular/material/dialog';
import { CambiarImagenUsuarioComponent } from './Modales/cambiar-imagen-usuario/cambiar-imagen-usuario.component';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef, HostListener } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../Services/auth.service';
import { ModalCambioImagenUsuarioComponent } from './Modales/modal-cambio-imagen-usuario/modal-cambio-imagen-usuario.component';

import { ReponseApi } from '../../Interfaces/reponse-api';
import { Empresa } from '../../Interfaces/empresa';
import { EmpresaService } from '../../Services/empresa.service';
import { EmpresaDataService } from '../../Services/EmpresaData.service';
import { NotificacionService } from '../../Services/notificacion.service';
import { NotificacionesDialogComponent } from './Modales/notificaciones-dialog/notificaciones-dialog.component';
// import { Producto } from '../../Interfaces/producto';
import { UsuariosService } from '../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
// import { CarritoModalComponent } from './Modales/carrito-modal/carrito-modal.component';
// import { CartService } from '../../Services/cart.service';
import { VerImagenProductoModalComponent } from './Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { ColoresService } from '../../Services/coloresService.service';
import { SignalRService } from '../../Services/signalr.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit {

  public mensaje: string = 'Hola, Mundo! ';
  listaMenus: Menu[] = [];
  correoUsuario: string = "";
  nombreUsuario: string = "";
  rolUsuario: string = "";
  usuario: any;
  imageData: Uint8Array | string = "";
  mimeType: | string = "";
  // usuario: { imagen: string } = { imagen: '' };
  selectCambiado: boolean = false;
  empresa: any;
  imageDataBase64: string | null = null;
  imagenUrl: string = '';
  nombreEmpresa: string = '';
  notificacionVisible = false;
  numeroProductosBajoStock: number = 0;
  toolbarColorClass: string = 'toolbar-white';
  sidenavColorClass: string = 'sidenav-white';
  ngContainerColorClass: string = 'sidenav-white';
  applyHoverClass = false;
  selectedColor: string = '';
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  claveSecreta: string | null = null;
  error: string | null = null;

  // carritoProductos: Producto[] = [];
  public innerWidth: any;
  constructor(
    private router: Router,
    private _menusServicio: MenuService,
    private _utilidadServicio: UtilidadService,
    private imageDialogService: ImageDialogService,
    private changeInfoModalService: ChangeInfoModalService,
    private imageUpdatedService: ImageUpdatedService,
    private dialog: MatDialog,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private empresaService: EmpresaService,
    private empresaDataService: EmpresaDataService,
    private notificacionService: NotificacionService,
    private _usuarioServicio: UsuariosService,
    // private cartService: CartService,
    private colorService: ColoresService,
    private signalRService: SignalRService
  ) {



    // this.obtenerClaveSecreta();
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString !== null) {
      const bytes = CryptoJS.AES.decrypt(usuarioString, this.CLAVE_SECRETA!);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
      this.usuario = JSON.parse(datosDesencriptados);
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'No hay notificaciones disponibles en este momento.'
      // });
      this.setupInactivityTimer();
    } else {
      // Manejar el caso en el que no se encuentra ningún usuario en el Local Storage
      // Por ejemplo, podrías asignar un valor por defecto o mostrar un mensaje de error
    }


  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }

  isMobileView(): boolean {
    return this.innerWidth <= 768;
  }
  cambiarMensaje() {
    this.mensaje = 'Mensaje cambiado!';
    this.dispararDeteccionCambios();
  }

  // Método para disparar la detección de cambios
  dispararDeteccionCambios() {
    this.cdr.markForCheck();
  }
  //se puede borrar
  actualizarImagenUsuario(): void {
    const usuarioEncriptado = localStorage.getItem('usuario');
    if (usuarioEncriptado) {
      try {
        const bytes = CryptoJS.AES.decrypt(usuarioEncriptado, this.CLAVE_SECRETA!);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

        if (datosDesencriptados) {
          const usuario = JSON.parse(datosDesencriptados);
          this.usuario = usuario;
          this.nombreUsuario = usuario.nombreCompleto || '';
          this.rolUsuario = usuario.rolDescripcion || '';

          if (usuario.imagenUrl) {
            this.cargarImagenDesdeDatos(usuario.imagenUrl);
          } else {
            console.error('No se encontraron datos de imagen en el usuario desencriptado');
          }
        } else {
          console.error('Los datos desencriptados están vacíos.');
        }
      } catch (error) {
        console.error('Error al desencriptar los datos:', error);
      }
    } else {
      console.error('No se encontraron datos en el localStorage.');
    }
  }

  cargarImagenDesdeDatos(imagenUrl: string): void {
    if (typeof imagenUrl === 'string') {
      this.imagenUrl = `${imagenUrl}`;
      this.cdr.markForCheck();
    } else {
      console.error('El tipo de datos de la imagen no es válido.');
    }
  }
  actualizarDatosUsuario(): void {
    const usuarioEncriptado = localStorage.getItem('usuario');
    if (usuarioEncriptado) {
      try {
        const bytes = CryptoJS.AES.decrypt(usuarioEncriptado, this.CLAVE_SECRETA!);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

        if (datosDesencriptados) {
          const usuario = JSON.parse(datosDesencriptados);
          this.usuario = usuario; // Almacena el usuario desencriptado

          this.nombreUsuario = usuario.nombreCompleto || '';
          this.rolUsuario = usuario.rolDescripcion || '';

          if (usuario.imagenUrl) {
            this.cargarImagenDesdeDatos(usuario.imagenUrl); // Carga la imagen desde los datos desencriptados
          } else {
            console.error('No se encontraron datos de imagen en el usuario desencriptado');
          }
        } else {
          console.error('Los datos desencriptados están vacíos.');
        }
      } catch (error) {
        console.error('Error al desencriptar los datos:', error);
      }
    } else {
      console.error('No se encontraron datos en el localStorage.');
    }
  }




  arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }



  actualizarNombreUsuario(): void {
    const usuarioEncriptado = localStorage.getItem('usuario');
    if (usuarioEncriptado) {
      try {
        const bytes = CryptoJS.AES.decrypt(usuarioEncriptado, this.CLAVE_SECRETA!);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

        if (datosDesencriptados) {
          const usuario = JSON.parse(datosDesencriptados);
          this.nombreUsuario = usuario.nombreCompleto || '';
          this.rolUsuario = usuario.rolDescripcion || '';

        } else {
          console.error('Los datos desencriptados están vacíos.');
        }
      } catch (error) {
        console.error('Error al desencriptar los datos:', error);
      }
    } else {
      console.error('No se encontraron datos en el localStorage.');
    }
  }
  actualizarImagen(nuevaImagen: Uint8Array, mimeType: string) {
    this.imageData = nuevaImagen;
    this.mimeType = mimeType;
    this.cdr.detectChanges();
  }
  obtenerClaveSecreta(): void {
    this._usuarioServicio.getClaveSecreta().subscribe({
      next: (respuesta) => {
        this.claveSecreta = respuesta.claveSecreta;
      },
      error: (err) => {
        this.error = 'Error al obtener la clave secreta.';
        console.error(err);
      }
    });
  }

  ngOnInit(): void {




    this.innerWidth = window.innerWidth;//esto para ocualtar cosa en vista movil

    // this.signalRService.startConnection();

    // this.signalRService.onPedidoActualizado((pedido) => {
    //   console.log('📦 Pedido actualizado:', pedido);
    //   // Aquí puedes actualizar el estado en tu componente
    // });






    // this.obtenerClaveSecreta();

    this.setupInactivityTimer();

    //funciona para inabilitar la aplicacion visualmente dejandola en blanco es funcional
    // const dueDate = new Date('2025-11-15');   // Fecha de vencimiento
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
    //   // if (daysPassed > deadline) {
    //   //   Swal.fire({
    //   //     title: 'Tiempo vencido',
    //   //     text: `Han pasado ${daysLate} días desde el plazo de 15 días. Reúnase con su dueño.`,
    //   //     icon: 'warning',
    //   //     confirmButtonText: 'Entendido'
    //   //   });
    //   // }

    // }

    // this.actualizarDatosUsuario();
    this.imageUpdatedService.imageUpdated$.subscribe(() => {
      this.actualizarImagenUsuario();
    });
    // this.cartService.getCart().subscribe((products: Producto[]) => {
    //   this.carritoProductos = products;
    // });
    // if (!this.authService.isAuthenticated()) {
    //   // Redirige al inicio de sesión si el usuario no está autenticado
    //   this.router.navigate(['/login']);
    // }
    // this.imageUpdatedService.imageUpdated$.subscribe(() => {
    //   // Actualizar la URL de la imagen
    //   this.obtenerInformacionEmpresa();
    //   this.actualizarImagenUsuario();
    // });


    // Suscribirse a los cambios en la cantidad de productos bajo stock
    this.notificacionService.numeroProductosBajoStock$.subscribe(numero => {
      // Asignar la cantidad de productos al componente para mostrar en la interfaz de usuario
      this.numeroProductosBajoStock = numero;
    });

    // this.notificacionService.iniciarActualizacionAutomatica();


    this.authService.usuario$.subscribe(usuario => {
      this.actualizarNombreUsuario();
      // console.log('Usuario actualizado en tiempo real:', usuario);
    });
    // Inicializa el nombre de usuario al cargar el componente
    this.actualizarNombreUsuario();

    // Actualiza el nombre de usuario cada segundo
    // setInterval(() => {
    //   this.actualizarNombreUsuario();
    // }, 1000);
    //  setInterval(() => {
    //       this.actualizarDatosUsuario();
    //     }, 1000);

    this.listaMenus.sort((a, b) => a.nombre.localeCompare(b.nombre));


    const usuario = this._utilidadServicio.obtenerSesionUsuario();
    console.log('Usuario:', usuario);


    // Suscribirse al evento de actualización de la empresa
    this.empresaDataService.empresaActualizada$.subscribe((nuevaEmpresa) => {
      // Actualizar el nombre de la empresa en el layout
      this.nombreEmpresa = nuevaEmpresa.nombreEmpresa;
    });

    // this.imageUpdatedService.imageUpdated$.subscribe(() => {
    //   console.log('Recibida notificación de actualización de imagen22');
    //   const nuevaImagenUrl = this.obtenerNuevaImagenUrl();
    //   this.zone.run(() => {
    //     this.imagenUrl = nuevaImagenUrl;
    //     // this.cdr.detectChanges(); // Activar manualmente la detección de cambios
    //   });
    // });



    if (usuario != null) {
      this.correoUsuario = usuario.correo;
      this.nombreUsuario = usuario.nombreCompleto;
      this.rolUsuario = usuario.rolDescripcion;
      if ((usuario.imagenUrl)) {
        // Si ya es un Uint8Array
        this.imagenUrl = usuario.imagenUrl;
      }

      console.log('Ruta de la imagen del usuario:', this.imageData);
      // Llamada al servicio para obtener los menús
      this._menusServicio.lista(usuario.idUsuario).subscribe({
        next: (response: ReponseApi) => {
          if (response.status) {
            const data = response.value; // Obtener los datos de la respuesta

            // Obtener los idMenu de los menús asociados con el rol del usuario
            const idMenusAsociados = data.map((entry: any) => entry.idMenu);

            // Filtrar los menús para mostrar solo aquellos asociados con el rol del usuario
            const menusAsociados = data.filter((entry: any) => idMenusAsociados.includes(entry.idMenu));

            // Organizar los menús con submenús
            this.listaMenus = this.organizarMenusConSubmenus(menusAsociados, idMenusAsociados);
          }
        },
        error: (e) => {

          this.token();
        }
      });


    }
    // Verificar si hay un color almacenado en el localStorage


    //Toma el cambio del color y lo aplica aqui en el layout

    // const colorGuardado = localStorage.getItem('colorSeleccionado');
    // if (colorGuardado) {
    //   this.selectedColor = colorGuardado; // Usar el color guardado como valor predeterminado
    //   this.cambiarColor(colorGuardado); // Aplicar los estilos según el color guardado
    // }

    this.colorService.color$.subscribe((color: string) => {
      this.cambiarColor(color);
    });

    // Si ya hay un color guardado en localStorage, se aplica al inicio
    const storedColor = localStorage.getItem('colorSeleccionado');
    if (storedColor) {
      this.cambiarColor(storedColor);
    }
    //Fin

    this.obtenerInformacionEmpresa();

  }



  lista() {
    const usuario = this._utilidadServicio.obtenerSesionUsuario();
    if (usuario != null) {
      this.correoUsuario = usuario.correo;
      this.nombreUsuario = usuario.nombreCompleto;
      this.rolUsuario = usuario.rolDescripcion;
      if (this.isUint8Array(usuario.imageData)) {
        // Si ya es un Uint8Array
        this.imageData = usuario.imageData;
      } else {
        // Si es una cadena, convertir a Uint8Array
        const binaryString = atob(usuario.imageData);
        const uint8Array = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }

        this.imageData = uint8Array;
      }


      console.log('Ruta de la imagen del usuario:', this.imageData);
      // Llamada al servicio para obtener los menús
      this._menusServicio.lista(usuario.idUsuario).subscribe({
        next: (response: ReponseApi) => {
          if (response.status) {
            const data = response.value; // Obtener los datos de la respuesta

            // Obtener los idMenu de los menús asociados con el rol del usuario
            const idMenusAsociados = data.map((entry: any) => entry.idMenu);

            // Filtrar los menús para mostrar solo aquellos asociados con el rol del usuario
            const menusAsociados = data.filter((entry: any) => idMenusAsociados.includes(entry.idMenu));

            // Organizar los menús con submenús
            this.listaMenus = this.organizarMenusConSubmenus(menusAsociados, idMenusAsociados);
          }
        },
        error: (e) => {

          this.token();
        }
      });


    }


  }

  token() {
    let idUsuario: number = 0;


    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA!);
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
              localStorage.setItem('authToken', response.token);
              this.lista();
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


  }
  detectChangesManually() {
    this.cdr.detectChanges();
  }

  colors = [
    { value: 'blanco', viewValue: 'Blanco' },
    { value: 'morado', viewValue: 'Morado' },
    { value: 'rojo', viewValue: 'Rojo' },
    { value: 'verde', viewValue: 'Verde' }

  ];
  cambiarColor(colorSeleccionado: string): void {
    // const colorSeleccionado = (event.target as HTMLSelectElement)?.value;

    // Lógica para cambiar el color según la opción seleccionada
    switch (colorSeleccionado) {
      case 'morado':
        this.toolbarColorClass = 'toolbar-morado'; // Cambiar el color de fondo del toolbar a blanco
        this.sidenavColorClass = 'sidenav-morado'; // Cambiar el color de fondo del sidenav a blanco
        this.ngContainerColorClass = 'ng-container-morado'; // Cambiar el color de fondo del contenedor ng-container a blanco
        break;
      case 'blanco':
        this.toolbarColorClass = 'toolbar-white'; // Cambiar el color de fondo del toolbar a blanco
        this.sidenavColorClass = 'sidenav-white'; // Cambiar el color de fondo del sidenav a blanco
        this.ngContainerColorClass = 'ng-container-white'; // Cambiar el color de fondo del contenedor ng-container a blanco
        break;
      case 'rojo':
        this.toolbarColorClass = 'toolbar-red'; // Cambiar el color de fondo del toolbar a rojo
        this.sidenavColorClass = 'sidenav-red'; // Cambiar el color de fondo del sidenav a rojo
        this.ngContainerColorClass = 'ng-container-red'; // Cambiar el color de fondo del contenedor ng-container a rojo
        break;
      case 'verde':
        this.toolbarColorClass = 'toolbar-green'; // Cambiar el color de fondo del toolbar a verde
        this.sidenavColorClass = 'sidenav-green'; // Cambiar el color de fondo del sidenav a verde
        this.ngContainerColorClass = 'ng-container-green'; // Cambiar el color de fondo del contenedor ng-container a verde
        break;
      case 'black':
        this.toolbarColorClass = 'toolbar-black'; // Cambiar el color de fondo del toolbar a verde
        this.sidenavColorClass = 'sidenav-black'; // Cambiar el color de fondo del sidenav a verde
        this.ngContainerColorClass = 'ng-container-black'; // Cambiar el color de fondo del contenedor ng-container a verde
        break;
      case 'azul':
        this.toolbarColorClass = 'toolbar-azul'; // Cambiar el color de fondo del toolbar a verde
        this.sidenavColorClass = 'sidenav-azul'; // Cambiar el color de fondo del sidenav a verde
        this.ngContainerColorClass = 'ng-container-azul'; // Cambiar el color de fondo del contenedor ng-container a verde
        break;
      default:
        console.error('Color no reconocido');
        break;
    }
    this.selectedColor = colorSeleccionado;
    // Guardar el color seleccionado en el localStorage
    localStorage.setItem('colorSeleccionado', colorSeleccionado);
  }
  onOptionMouseEnter() {
    this.applyHoverClass = true;
  }

  onOptionMouseLeave() {
    this.applyHoverClass = false;
  }
  getColorTextClass(color: string): string {
    return color === 'blanco' ? 'text-black' : 'text-white';
  }
  getPanelColorClass(): string {
    switch (this.toolbarColorClass) {
      case 'toolbar-white':
        return 'panel-white';
      case 'toolbar-red':
        return 'panel-red';
      case 'toolbar-green':
        return 'panel-green';
      case 'toolbar-morado':
        return 'panel-morado';
      case 'toolbar-black':
        return 'panel-black';
      case 'toolbar-azul':
        return 'panel-azul';
      default:
        return '';
    }
  }

  getButtonColorClass() {
    switch (this.selectedColor) {
      case 'rojo':
        return 'custom-button-rojo';
      case 'verde':
        return 'custom-button-verde';
      case 'morado':
        return 'custom-button-morado';
      case 'black':
        return 'custom-button-black';
      case 'azul':
        return 'custom-button-azul';
      default:
        return 'custom-button-defecto';
    }
  }


  changeColor(color: string) {
    this.selectedColor = color;
    console.log('Color seleccionado:', this.selectedColor);
  }


  getIconColorClass(): string {
    switch (this.toolbarColorClass) {
      case 'toolbar-white':
        return 'icon-black';
      case 'toolbar-red':
        return 'icon-white';
      case 'toolbar-green':
        return 'icon-white';
      case 'toolbar-morado':
        return 'icon-white';
      case 'toolbar-black':
        return 'icon-white';
      case 'toolbar-azul':
        return 'icon-black';
      default:
        return 'icon-white';
    }
  }

  getTextColorClass(): string {
    switch (this.toolbarColorClass) {
      case 'toolbar-white':
        return 'text-black';
      case 'toolbar-red':
        return 'text-white';
      case 'toolbar-green':
        return 'text-white';
      case 'toolbar-morado':
        return 'text-white';
      case 'toolbar-black':
        return 'text-white';
      case 'toolbar-azul':
        return 'text-white';
      default:
        return '';
    }
  }
  getTextColorClass2(): string {
    switch (this.toolbarColorClass) {
      case 'toolbar-white':
        return 'text-black';
      case 'toolbar-red':
        return 'text-white';
      case 'toolbar-green':
        return 'text-white';
      case 'toolbar-morado':
        return 'text-white';
      case 'toolbar-black':
        return 'text-white';
      case 'toolbar-azul':
        return 'text-white';
      default:
        return '';
    }
  }

  getIconColorClass2(): string {
    switch (this.toolbarColorClass) {
      case 'toolbar-white':
        return 'icon-black';
      case 'toolbar-red':
        return 'icon-white';
      case 'toolbar-green':
        return 'icon-white';
      case 'toolbar-morado':
        return 'icon-white';
      case 'toolbar-black':
        return 'icon-white';
      case 'toolbar-azul':
        return 'icon-white';
      default:
        return 'icon-white';
    }
  }

  handleClickEvent(event: Event): void {
    // Puedes agregar la lógica que necesites aquí
    console.log('Item clicked:', event);
  }
  abrirNotificaciones(): void {

    
  }




  obtenerInformacionEmpresa(): void {
    this.empresaService.lista2().subscribe({
      next: (response) => {
        console.log('Datos recibidos del servidor:', response);

        if (response.status && response.value.length > 0) {
          this.empresa = response.value[0];
          this.nombreEmpresa = this.empresa.nombreEmpresa;
          // console.log('Tipo de imagen:', this.empresa.logo.startsWith('data:image/png;base64,')); // Verificar el tipo de imagen

          // Verificar la URL de la imagen generada
          // console.log('URL de la imagen:', 'data:image/png;base64,' + this.empresa.logo);


        } else {
          this.empresa = response.value[0];
          this.nombreEmpresa = this.empresa.nombreEmpresa;
          console.error('Error al obtener la información de la empresa');
        }
      },
      error: (error) => this.handleTokenError(() => this.obtenerInformacionEmpresa())
    });
  }

  handleTokenError(retryCallback: () => void): void {

    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const bytes = CryptoJS.AES.decrypt(usuarioString, this.CLAVE_SECRETA!);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
      if (datosDesencriptados) {
        const usuario = JSON.parse(datosDesencriptados);
        this._usuarioServicio.obtenerUsuarioPorId(usuario.idUsuario).subscribe(
          (usuario: any) => {
            const refreshToken = usuario.refreshToken;
            this._usuarioServicio.renovarToken(refreshToken).subscribe(
              (response: any) => {
                localStorage.setItem('authToken', response.token);
                // localStorage.setItem('refreshToken', response.refreshToken);
                retryCallback();
              },
              (error: any) => {
                // Manejar error de renovación de token
              }
            );
          },
          (error: any) => {
            // Manejar error al obtener usuario por ID
          }
        );
      }
    }
  }

  verImagen2(): void {
    this.imageDialogService.openImageDialog(
      this.empresa.imagenUrl
    );
  }



  organizarMenusConSubmenus(menusAsociados: any[], idMenusAsociados: number[]): Menu[] {
    const menus: Menu[] = [];

    menusAsociados.forEach(menu => {
      const submenuIds = menusAsociados.filter(entry => entry.idMenuPadre === menu.idMenu).map(entry => entry.idMenu);
      const hasSubmenus = submenuIds.length > 0;

      // Verificar si el menú tiene submenús o no
      if (hasSubmenus || !idMenusAsociados.includes(menu.idMenuPadre)) {
        const menuObj: Menu = {
          idMenu: menu.idMenu,
          nombre: menu.nombre,
          icono: menu.icono,
          url: menu.url,
          idMenuPadre: menu.idMenuPadre,
          esPadre: menu.esPadre
        };

        // Si tiene submenús, asignarlos
        if (hasSubmenus) {
          menuObj.submenus = menusAsociados.filter(entry => entry.idMenuPadre === menu.idMenu);
        }

        menus.push(menuObj);
      }
    });

    return menus;
  }

  private setupInactivityTimer(): void {
    document.addEventListener('mousemove', () => this.authService.resetInactivityTimer());
    document.addEventListener('keydown', () => this.authService.resetInactivityTimer());
    document.addEventListener('touchstart', () => this.authService.resetInactivityTimer());
  }
  // verCarrito2() {
  //   this.dialog.open(CarritoModalComponent, {
  //     width: '600px',
  //     data: {
  //       cartItems: this.cartService.getCartItems()
  //     }
  //   });
  // }


  // limpiarCarrito() {
  //   this.cartService.clearCart(); // Llama al método clearCart del servicio
  //   Swal.fire({
  //     icon: 'success',
  //     title: 'Carrito Limpiado',
  //     text: 'El carrito ha sido limpiado correctamente.',
  //   });
  // }
  cerrarCarrito() {
    Swal.close(); // Cierra el modal de Swal
    // Lógica adicional al cerrar el carrito, si aplica
  }


  // verImagenCarrito(producto: Producto): void {
  //   this.dialog.open(VerImagenProductoModalComponent, {
  //     data: {
  //       imageData: producto.imageData
  //     }
  //   });
  // }



  enviarMensajeWhatsApp(mensaje: string) {
    this.empresaService.lista().subscribe({
      next: (response) => {
        if (response.status) {
          const empresas = response.value as Empresa[];
          const empresa = empresas.length > 0 ? empresas[0] : null;
          const telefono = empresa ? empresa.telefono : '';

          if (!telefono) {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: 'No hay número disponible.',
            });
          } else {
            const url = `https://api.whatsapp.com/send?phone=57${telefono}&text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
          }
        } else {
          console.error('La respuesta de la API indica un error:', response.msg);
        }
      },
      error: (error) => this.handleTokenError(() => this.enviarMensajeWhatsApp(mensaje))
    });
  }

  formatearNumero(numero: string): string {
    // Convierte la cadena a número
    const valorNumerico = parseFloat(numero.replace(',', '.'));

    // Verifica si es un número válido
    if (!isNaN(valorNumerico)) {
      // Formatea el número con comas como separadores de miles y dos dígitos decimales
      return valorNumerico.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else {
      // Devuelve la cadena original si no se puede convertir a número
      return numero;
    }
  }
  formatearNumero2(num: number): string {
    return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(num);
  }

  cerrarSesion() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Cerrarás la sesión actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1337E8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: '¡Sesión cerrada!',
          text: 'Has cerrado sesión exitosamente.',
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          this._utilidadServicio.eliminarSesionUsuario();
          this.authService.logout();
          this.router.navigate(['login']);
          // this.cartService.clearCart(); // para limpiar el carrito

        });
      }
    });
  }
  // cerrarSesion() {

  //   // Preguntar al usuario si está seguro de cerrar sesión
  //   const confirmacion = window.confirm('¿Estás seguro de cerrar sesión?');

  //   if (confirmacion) {
  //     // Eliminar la sesión del usuario
  //     this._utilidadServicio.eliminarSesionUsuario();

  //     // Redirigir al usuario a la página de inicio de sesión
  //     this.router.navigate(['login']);
  //   }

  // }
  // obtenerNuevaImagenUrl(): string {
  //   // Obtener la imagen almacenada desde el localStorage
  //   const imageData = localStorage.getItem('imagenUsuario');

  //   // Verificar si la imagen existe y si es una cadena base64
  //   if (imageData && imageData.startsWith('data:image')) {
  //     // La imagen ya es una URL, así que devolverla directamente
  //     return imageData;
  //   }

  //   // Si la imagen se almacena como un Uint8Array o Blob, conviértela a URL
  //   if (imageData) {
  //     const uint8Array = new Uint8Array(JSON.parse(imageData));
  //     const blob = new Blob([uint8Array], { type: 'image/png' });
  //     return URL.createObjectURL(blob);
  //   }

  //   // En caso de que no haya imagen, puedes proporcionar una URL de imagen por defecto
  //   return 'URL_POR_DEFECTO';
  // }

  convertirBytesAURL(bytes: Uint8Array, mimeType: string): string {
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  isUint8Array(value: any): value is Uint8Array {
    return value instanceof Uint8Array;
  }


  verImagen() {
    this.imageDialogService.openImageDialog(
      this.isUint8Array(this.imagenUrl) ? this.convertirBytesAURL(this.imagenUrl, this.mimeType) : this.imagenUrl
    );
  }

  cambiarNombre() {
    // Lógica para abrir el modal con la información del usuario
    this.changeInfoModalService.abrirModal();
  }

  onSeleccionDesdeSelect() {
    // Tu lógica para manejar el cambio en el select
    this.selectCambiado = true;
  }
  openCambiarImagenModal() {
    const usuario = this._utilidadServicio.obtenerSesionUsuario();

    if (usuario) {
      const dialogRef = this.dialog.open(ModalCambioImagenUsuarioComponent, {
        data: { usuario: usuario }, // Asegúrate de pasar correctamente el objeto de usuario
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('El diálogo se cerró con el resultado:', result);

        
        // Refrescar la página solo si el cambio provino del select
        // if (this.selectCambiado) {
        //   window.location.reload();
        //   location.reload();
        // }

      });
    } else {
      console.error('Usuario no encontrado al abrir el diálogo.');
    }
  }






}
