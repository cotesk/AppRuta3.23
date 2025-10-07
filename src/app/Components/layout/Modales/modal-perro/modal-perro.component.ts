
import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Perro } from './../../../../Interfaces/perro';
import { PerroService } from '../../../../Services/perro.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { environment } from '../../../../environments/environment.development';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { async } from 'rxjs';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
import { VerImagenProductoModalComponent } from '../ver-imagen-producto-modal/ver-imagen-producto-modal.component';

import { style } from '@angular/animations';


@Component({
  selector: 'app-modal-perro',
  templateUrl: './modal-perro.component.html',
  styleUrl: './modal-perro.component.css'
})
export class ModalPerroComponent implements OnInit {

  formularioPerro: FormGroup;

  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";

  urlApi: string = environment.endpoint;
  public Urlimagen: string | null = null;
  public imageData: string | null = null;
  inputFileRef2: ElementRef<HTMLInputElement> | undefined;
  imagenBase64: string | null = null;
  numeroFormateado: string = '';
  nombreImagen: string = '';
  previsualizaciones: any[] = [];// Puedes asignar un valor por defecto, según el tipo de datos que necesites
  public archivos: any[] = []; // Si es un arreglo, puedes asignar un arreglo vacío como valor por defecto
  public loading: boolean = false;
  imagenes: any[] = [];
  imagenBlob: Blob = new Blob();
  modoEdicion: boolean = false;
  imagenPorDefecto: string = 'assets/Images/Caja.png';
  inputFileRef: ElementRef | undefined;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  step1FormGroup!: FormGroup;
  step2FormGroup!: FormGroup;
  step3FormGroup!: FormGroup;
  nuevoArchivo: File | null = null;
  tipodeFijo: string = "Si";
  precioCompra: number = 0;
  categoriaSeleccionada: number | null = null;

  clienteFiltrado: string = '';
  imagenesSeleccionadas: { nombre: string, base64: string }[] = [];

  idProduct: number = 0; // Asegúrate de inicializar esta variable

  // Asegúrate de inicializar esta lista
  constructor(
    private modalActual: MatDialogRef<ModalPerroComponent>,
    @Inject(MAT_DIALOG_DATA) public datosPerro: Perro, private fb: FormBuilder,
    private _productoServicio: PerroService,
    private _utilidadServicio: UtilidadService, private sanitizer: DomSanitizer,
    private _usuarioServicio: UsuariosService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.previsualizaciones = [];



    this.formularioPerro = this.fb.group({


      Urlimagen: [''],
      imageData: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      raza: ['', [Validators.maxLength(100),this.letrasSinNumerosValidator(), ]],
      edad: [null, [Validators.min(0), Validators.max(30)]],
      sexo: ['', Validators.required],
      tamano: ['', Validators.required],
      peso: [null, [Validators.min(0), Validators.max(150)]],
      temperamento: ['Desconocido'],
      esTranquilo: [false],
      sociablePerros: [false],
      sociablePersonas: [false],
      entrenadoCorrea: [false],
      entrenadoBasicos: [false],
      vacunasAlDia: [false],
      esterilizado: [false],
      alergias: [''],
      medicacion: [''],
      observaciones: ['']
    });

    if (datosPerro != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
      this.modoEdicion = true;
    }

    // console.log(datosPerro);

    if (this.formularioPerro) {

      const idProductoAsignacion = datosPerro?.idPerro ?? 0; // ✅ protección contra null
      // console.log(idProductoAsignacion);
    }


  }


  letrasSinNumerosValidator() {
    return (control: FormControl) => {
      const nombre = control.value;
      const contieneNumeros = /\d/.test(nombre); // Verifica si hay al menos un dígito
      return contieneNumeros ? { letrasSinNumerosValidator: true } : null;
    };
  }

  verImagen(base64: string) {
    Swal.fire({
      title: 'Vista previa',
      html: `
      <div style="width:100%; display:flex; justify-content:center; align-items:center;">
        <img 
          src="${base64}" 
          alt="Imagen" 
          style="max-width: 100%; max-height: 400px; object-fit: contain;" 
        />
      </div>
    `,
      showCloseButton: true,
      showConfirmButton: false,
      width: 600
    });
  }




  eliminarImagen(index: number): void {
    this.imagenesSeleccionadas.splice(index, 1);
  }

  ngOnInit(): void {

    const imagenBase64 = this.imagenBase64;
    const producto = this.data.producto;
    this.previsualizaciones = this.data.imagenUrl;



    if (this.datosPerro != null) {

      this.idProduct = (this.datosPerro.idPerro!);
      console.log(this.idProduct);



      this.formularioPerro.patchValue({
        nombre: this.datosPerro.nombre,
        raza: this.datosPerro.raza,
        edad: this.datosPerro.edad,
        sexo: this.datosPerro.sexo,
        tamano: this.datosPerro.tamano,
        peso: this.datosPerro.peso,
        temperamento: this.datosPerro.temperamento,
        esTranquilo: this.datosPerro.esTranquilo,
        sociablePerros: this.datosPerro.sociablePerros,
        sociablePersonas: this.datosPerro.sociablePersonas,
        entrenadoCorrea: this.datosPerro.entrenadoCorrea,
        entrenadoBasicos: this.datosPerro.entrenadoBasicos,
        vacunasAlDia: this.datosPerro.vacunasAlDia,
        esterilizado: this.datosPerro.esterilizado,
        alergias: this.datosPerro.alergias,
        medicacion: this.datosPerro.medicacion,
        observaciones: this.datosPerro.observaciones
      });

    }


  }


  formatearNumero(event: any, campo: string): void {
    let valorInput = event.target.value.replace(/\./g, ''); // Elimina los puntos existentes

    // Verifica si el valor es un número válido antes de formatear
    if (valorInput !== '' && !isNaN(parseFloat(valorInput))) {
      valorInput = parseFloat(valorInput).toLocaleString('es-CO', { maximumFractionDigits: 2 });
      this.numeroFormateado = valorInput;

      // Actualiza el valor formateado en el formulario
      this.formularioPerro.get(campo)?.setValue(valorInput);
    } else {
      // Si el valor no es un número válido o está vacío, establece el valor en blanco en el formulario
      this.numeroFormateado = '';
      this.formularioPerro.get(campo)?.setValue('');
    }
  }


  selectFile(event: any): void {
    const archivos: FileList = event.target.files;

    if (archivos && archivos.length + this.imagenesSeleccionadas.length <= 6) {
      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        const lector = new FileReader();
        lector.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            this.imagenesSeleccionadas.push({
              nombre: archivo.name,
              base64: e.target.result
            });
          }
        };
        lector.readAsDataURL(archivo);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Límite de imágenes',
        text: 'Solo puedes subir hasta 6 imágenes por producto.',
      });
    }

    // Limpiar input file
    event.target.value = '';
  }


  limpiarImagen(): void {
    this.formularioPerro.patchValue({
      imageData: '',
    });
    this.previsualizaciones = [];
    this.imagenBase64 = null;
  }

  // obtenerUrlSeguraDeImagen(): SafeUrl | null {
  //   const safeUrl = this.imagenBase64 ? this.sanitizer.bypassSecurityTrustUrl(this.imagenBase64) : null;

  //   return safeUrl;
  // }
  obtenerUrlSeguraDeImagen(): SafeUrl | null {
    const safeUrl = this.imagenBase64
      ? this.sanitizer.bypassSecurityTrustUrl(this.imagenBase64)
      : null;

    return safeUrl;
  }

  letrasValidator() {
    return (control: FormControl) => {
      const nombre = control.value;
      const soloLetras = /^[a-zA-Z]+$/.test(nombre);
      return soloLetras ? null : { letrasValidator: true };
    };
  }


  VerInfo(event: MouseEvent) {
    event.stopPropagation();
    Swal.fire({
      icon: 'info',
      title: 'Información sobre cómo funciona el precio fijo',
      text: 'Es cuando tu quieres que un producto tenga un precio fijo, por ejemplo, un cargador con un precio de $30,000. Si seleccionas precio fijo, el precio incluirá el IVA. Por otro lado, si no seleccionas precio fijo y el IVA es del 19%, el producto se registrará con un precio de $35,700 aplicando el IVA.',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      customClass: {
        container: 'ver-info-popup',
        htmlContainer: 'ver-info-html',
      },
      didOpen: (popup) => {
        setTimeout(() => { // Esperar un breve momento para asegurar que el modal esté completamente abierto
          const swalTextElement = popup.querySelector('.swal2-text');
          if (swalTextElement) {
            (swalTextElement as HTMLElement).style.textAlign = 'justify'; // Alineación del texto a la justificación
          }
        }, 100); // Ajusta el tiempo de espera según sea necesario
      }
    });
  }


  async guardarEditar_Producto() {


    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    const usuario = JSON.parse(datosDesencriptados);
    const idUsuarioLocalStorage = usuario ? usuario.idUsuario : null;

    if (this.formularioPerro.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `Por favor, complete todos los campos correctamente`,
      });
      return;
    }

    //si no hay datos de editar entra para que haga la imagen 
    if (this.datosPerro == null) {
      // ✅ Si no hay imágenes seleccionadas, usar imagen por defecto
      if (this.imagenesSeleccionadas.length === 0) {
        const rutaPorDefecto = 'assets/Images/perroDefecto.png';

        try {
          const response = await fetch(rutaPorDefecto);
          const blob = await response.blob();

          const base64 = await this.blobToBase64(blob) as string;
          const nombreAleatorio = `PorDefecto_${Math.floor(10000 + Math.random() * 90000)}.png`;

          this.imagenesSeleccionadas.push({
            nombre: nombreAleatorio,
            base64: base64
          });

          console.log('Imagen por defecto añadida:', nombreAleatorio);
        } catch (error) {
          console.error('Error al cargar imagen por defecto:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la imagen por defecto.',
          });
          return;
        }
      }

    }

    this.procesarArchivo();



  }

  token() {
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
              localStorage.setItem('authToken', response.token);
              this.guardarEditar_Producto();
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


  blobToBase64(blob: Blob): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result!);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }


  base64ToByteArray(base64: string): number[] {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return Array.from(bytes);
  }



  procesarArchivo() {

    let idUsuario: number = 0;
    let nombreDueno: string = '';

    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    console.log(datosDesencriptados);
    const usuario = JSON.parse(datosDesencriptados);
    idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario
    nombreDueno= usuario.nombreCompleto;

    const _perro: Perro = {
      idPerro: this.datosPerro == null ? 0 : this.datosPerro.idPerro,
      idUsuario: idUsuario,
      nombreDueno: nombreDueno,
      nombre: this.formularioPerro.value.nombre,
      raza: this.formularioPerro.value.raza,
      edad: this.formularioPerro.value.edad,
      sexo: this.formularioPerro.value.sexo,
      tamano: this.formularioPerro.value.tamano,
      peso: this.formularioPerro.value.peso,
      temperamento: this.formularioPerro.value.temperamento,

      esTranquilo: this.formularioPerro.value.esTranquilo,
      sociablePerros: this.formularioPerro.value.sociablePerros,
      sociablePersonas: this.formularioPerro.value.sociablePersonas,
      entrenadoCorrea: this.formularioPerro.value.entrenadoCorrea,
      entrenadoBasicos: this.formularioPerro.value.entrenadoBasicos,
      vacunasAlDia: this.formularioPerro.value.vacunasAlDia,
      esterilizado: this.formularioPerro.value.esterilizado,

      alergias: this.formularioPerro.value.alergias,
      medicacion: this.formularioPerro.value.medicacion,
      observaciones: this.formularioPerro.value.observaciones,
      imageData: this.imageData ? [this.imageData.split(',')[1]] : [],
      // manejo de imágenes
      imagenUrl: [],
      nombreImagen: this.nombreImagen ? [this.nombreImagen] : [],

      // compatibilidad si necesitas enviar array de objetos con más datos
      imagenes: this.imagenesSeleccionadas.map(img => ({
        nombreImagen: img.nombre,
        imageData: img.base64.split(',')[1], // solo la parte base64 sin "data:image/png;base64,"
        imagenUrl: ""
      }))
    };

    console.log(_perro);
    if (this.datosPerro == null) {
      this._productoServicio.guardar(_perro).subscribe({
        next: (data) => {
           console.log(data);
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Perro Registrado',
              text: `El perro fue registrado`,
            });
            // this._utilidadServicio.mostrarAlerta("El producto fue registrado", "Exito");
            this.modalActual.close("true");
          } else {
            if (data.msg == "Ya existe un producto con el mismo nombre") {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `Ya existe un perro con el mismo nombre`,
              });


            } else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo guardar el producto`,
              });

            }

            // this._utilidadServicio.mostrarAlerta("Ya existe un producto con ese mismo nombre", "Error");
          }
        },
        error: (error) => {
          console.log(error);
          // if (error == "Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.") {
          // console.log(e.error.errors);

          // Swal.fire({
          //   icon: 'error',
          //   title: 'ERROR',
          //   text: ` el cliente  editar`,
          // });
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
                    localStorage.setItem('authToken', response.token);
                    this.guardarEditar_Producto();
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





      });
    } else {
      this._productoServicio.editar(_perro).subscribe({
        next: (data) => {
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Producto Editado',
              text: `El producto fue editado.`,
            });
            // this._utilidadServicio.mostrarAlerta("El producto fue registrado", "Exito");
            this.modalActual.close("true");
          } else {
            if (data.msg == "Ya existe un producto con el mismo nombre") {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `Ya existe un producto con el mismo nombre`,
              });


            } else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo editar el producto`,
              });

            }

            // this._utilidadServicio.mostrarAlerta("Ya existe un producto con ese mismo nombre", "Error");
          }
        },
        error: (e) => {

          console.error('Error es :', e);
          // Swal.fire({
          //   icon: 'error',
          //   title: 'ERROR',
          //   text: ` el cliente  editar`,
          // });
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
                    localStorage.setItem('authToken', response.token);
                    this.guardarEditar_Producto();
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


      });
    }
    // }


  }



  onCategoriaSelected(option: any): void {
    this.categoriaSeleccionada = option.idCategoria;  // Guardar la categoría seleccionada

  }

  filtrarEntrada(event: any): void {
    const inputCliente = event.target.value;

    if (/^\d+$/.test(inputCliente)) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `No se puede digitar numero.`,
      });
      // Aquí, se puede mostrar una alerta o desactivar el botón de agregar.
      // this._utilidadServicio.mostrarAlerta('No se puede digitar numero.', 'ERROR!');
      // this.clienteSeleccionado = null!;
      // this.formularioPerroVenta.patchValue({
      //   cliente: null,
      //   clienteId: null,
      // });

      // Limpiar el texto del cliente seleccionado
      this.formularioPerro.get('categoria')?.setValue('');
    }
    if (inputCliente == "") {

      this.categoriaSeleccionada = inputCliente;  // Guardar la categoría seleccionada
      // this.aplicarFiltroCard();
    }

    const soloLetras = inputCliente.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');

    // Almacena el valor filtrado en la variable clienteFiltrado
    this.clienteFiltrado = soloLetras;

    // Establece el valor en el control del formulario
    this.formularioPerro.get('categoria')?.setValue(this.clienteFiltrado);
  }




  lastItem(item: any, list: any[]): boolean {
    return item === list[list.length - 1];
  }

}