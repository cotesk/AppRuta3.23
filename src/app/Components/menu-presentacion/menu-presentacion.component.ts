import { ChangeDetectionStrategy, Component, OnInit ,HostListener } from '@angular/core';
// import { Producto } from '../../Interfaces/producto';
import { EmpresaService } from '../../Services/empresa.service';
import { EmpresaDataService } from '../../Services/EmpresaData.service';
import { FormBuilder } from '@angular/forms';

import { ImageDialogService } from '../../Services/image-dialog.service';
import { NavigationEnd, Router } from '@angular/router';
import { Contenido } from '../../Interfaces/contenido';
import { ReponseApi } from '../../Interfaces/reponse-api';
import { ContenidoService } from '../../Services/contenido.service';
import { Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { VerImagenProductoModalComponent } from '../layout/Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';

import { ColoresService } from '../../Services/coloresService.service';

@Component({
  selector: 'app-menu-presentacion',
  templateUrl: './menu-presentacion.component.html',
  styleUrl: './menu-presentacion.component.css',
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPresentacionComponent implements OnInit {

  ///
  nombreEmpresa: string = '';
  empresa: any;
  toolbarColorClass: string = 'toolbar-black';
  sidenavColorClass: string = 'sidenav-black';
  ngContainerColorClass: string = 'sidenav-black';
  // carritoProductos: Producto[] = [];
  selectedColor: string = '';
  images: string[] = [];
  comentarioTextoLogin: Contenido | undefined;
  currentIndex = 0;
  carouselInterval = 3000; // Intervalo de cambio de diapositivas en milisegundos
  private intervalId: any;
  private observer: IntersectionObserver | undefined;
  subscriptions: Subscription[] = [];
  public innerWidth: any;

  displayDialog: boolean = false; // controla el diálogo
  selectedProducto: any; // producto a mostrar en el diálogo

  constructor(
    // private productoService: ProductoService,
    // private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private empresaDataService: EmpresaDataService,
    // private cartService: CartService,
    private imageDialogService: ImageDialogService,
    private servicioContenido: ContenidoService,
    private colorService: ColoresService
  ) {




    // Establecer un intervalo para actualizar la lista de productos cada 5 minutos (puedes ajustar el tiempo según tus necesidades)
    // interval(1000) // 300,000 milisegundos = 5 minutos
    //   .subscribe(() => {
    //     this.actualizarListaProductos();
    //   });
  }
  startCarousel(): void {
    this.intervalId = setInterval(() => {
      this.showNextSlide();
    }, this.carouselInterval);
  }
  showNextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }
  ngOnInit(): void {

    // this.dialog.open(ModalPromocionesComponent, {
    //   disableClose: true,
    // });

    // if (this.router.url !== '/menu/cards') {
    //   this.dialog.open(ModalPromocionesComponent, {
    //     disableClose: true,
    //   });
    // }

    this.innerWidth = window.innerWidth;
    this.empresaDataService.empresaActualizada$.subscribe((nuevaEmpresa) => {
      // Actualizar el nombre de la empresa en el layout
      this.nombreEmpresa = nuevaEmpresa.nombreEmpresa;
    });
    this.obtenerInformacionEmpresa();
    const colorGuardado = localStorage.getItem('colorSeleccionado');
    if (colorGuardado) {
      this.selectedColor = colorGuardado; // Usar el color guardado como valor predeterminado
      this.cambiarColor2(colorGuardado); // Aplicar los estilos según el color guardado
    }
    // this.cartService.getCart().subscribe((products: Producto[]) => {
    //   this.carritoProductos = products;
    // });

    this.cargarContenidosImagen();
    this.startCarousel();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateRouterOutletState();
      }
    });

    // Actualizar el estado inicial del router-outlet al inicio
    this.updateRouterOutletState();

  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
  }

  isMobileView(): boolean {
    return this.innerWidth <= 768;
  }

  // Método para verificar si el router-outlet está vacío
  isRouterOutletEmpty(): boolean {
    const hasChild = !!this.routerOutletComponent();
    return !hasChild;
  }

  // Método para obtener el componente activo en el router-outlet
  private routerOutletComponent(): any {
    const outletElement = document.getElementsByTagName('router-outlet')[0];
    if (outletElement && outletElement.children.length > 0) {
      const component = outletElement.children[0];
      return component;
    }
    return null;
  }
  private updateRouterOutletState(): void {
    // Forzar la detección de cambios para que ngIf se actualice
    setTimeout(() => {
      // Implementa cualquier lógica adicional necesaria aquí
    });
  }

  verImagen2(): void {
    this.imageDialogService.openImageDialog(
      'data:image/png;base64,' + this.empresa.logo
    );
  }
  obtenerInformacionEmpresa(): void {
    this.empresaService.listaCard().subscribe({
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
      error: (error) => ({


      })
    });
  }








  getTextColorClass(): string {
    switch (this.toolbarColorClass) {
      case 'toolbar-white':
        return 'text-black';
      case 'toolbar-red':
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
        return 'text-white';
      case 'toolbar-red':
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
        return 'icon-white';
      case 'toolbar-red':
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

  verCarrito2() {
    // this.dialog.open(CarritoModalComponent, {
    //   width: '600px',
    //   data: {
    //     cartItems: this.cartService.getCartItems()
    //   }
    // });
  }

  colors = [

    { value: 'morado', viewValue: 'Morado' },
    { value: 'rojo', viewValue: 'Rojo' },
    { value: 'verde', viewValue: 'Verde' },
    { value: 'azul', viewValue: 'Azul' },
    { value: 'black', viewValue: 'Negro' },
    { value: 'blanco', viewValue: 'Blanco' },

  ];
  cambiarColor(event: Event): void {
    const colorSeleccionado = (event.target as HTMLSelectElement)?.value;

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
     // Actualiza el color en el servicio
      // this.colorService.setColor(this.selectedColor);
       this.colorService.updateColor();
  }
  cambiarColor2(colorSeleccionado: string): void {
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

  colorCircles: { [key: string]: string } = {
    blanco: '#ffffff',
    morado: '#7e3f88',
    rojo: '#940c0c',
    verde: '#064006',
    black: '#000000',
    azul: '#1f448f',
  };

  colorCircles2: { [key: string]: string } = {
    blanco: '#f4eeee',
    morado: '#522b41',
    rojo: '#c72c2c',
    verde: '#126b12',
    black: '#242222',
    azul: '#385897',
  };
  getIconColorClass(): string {
    switch (this.toolbarColorClass) {
      case 'toolbar-white':
        return 'icon-black';
      case 'toolbar-red':
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
  iniciarSesion() {
    this.router.navigate(['login']);
  }
  verImagen(imageUrl: string): void {
    if (imageUrl === "") {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `No hay imagen para mostrar`,
      });
    } else {
      // this.dialog.open(VerImagenProductoModalComponent, {
      //   data: {
      //     imageData: imageUrl
      //   }
      // });
    }

  }
  cargarContenidosImagen(): void {
    this.servicioContenido.lista().subscribe(
      (response: ReponseApi) => {
        if (response && response.status && response.value && Array.isArray(response.value)) {
          const imagenesBase64 = response.value

            .filter((contenido) => contenido.tipoContenido === 'Imagen')
            .map((imagenContenido) => imagenContenido.imagenes);
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Error',
          //   text: 'vamos por aqui .'
          // });
          this.subscriptions.push(...imagenesBase64.map(base64 => this.loadImage(base64)));

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


}
