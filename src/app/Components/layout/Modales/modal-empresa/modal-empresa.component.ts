import { EmpresaService } from './../../../../Services/empresa.service';
import { Empresa } from './../../../../Interfaces/empresa';
import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { environment } from '../../../../environments/environment.development';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { async } from 'rxjs';
import Swal from 'sweetalert2';
import { EmpresaDataService } from '../../../../Services/EmpresaData.service';
import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-modal-empresa',
  templateUrl: './modal-empresa.component.html',
  styleUrl: './modal-empresa.component.css'
})
export class ModalEmpresaComponent {
  formularioEmpresa: FormGroup;

  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  urlApi: string = environment.endpoint;
  public Urlimagen: string | null = null;
  public logo: string | null = null;
  public logoNombre: string | null = null;
  inputFileRef2: ElementRef<HTMLInputElement> | undefined;
  imagenBase64: string | null = null;
  numeroFormateado: string = '';
  public previsualizacion: SafeUrl | null = null;// Puedes asignar un valor por defecto, según el tipo de datos que necesites
  public archivos: any[] = []; // Si es un arreglo, puedes asignar un arreglo vacío como valor por defecto
  public loading: boolean = false;
  imagenes: any[] = [];
  imagenBlob: Blob = new Blob();
  modoEdicion: boolean = false;
  imagenPorDefecto: string = 'assets/Images/Caja.png';
  inputFileRef: ElementRef | undefined;
  nuevoArchivo: File | null = null;
  empresaActualizada: Empresa = {
    idEmpresa: 0,
    nombreEmpresa: '',
    rut: '',
    direccion: '',
    telefono: '',
    propietario: '',
    logo: '',
    correo: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    logoNombre:''
  }; // Inicializa la variable
  // Asegúrate de inicializar esta lista
  constructor(
    private modalActual: MatDialogRef<ModalEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public datosEmpresa: Empresa, private fb: FormBuilder,
    private _empresaServicio: EmpresaService,
    private _utilidadServicio: UtilidadService, private sanitizer: DomSanitizer,
    private empresaDataService: EmpresaDataService,
    private _usuarioServicio: UsuariosService,
    @Inject(MAT_DIALOG_DATA) public data: any,

  ) {
    this.previsualizacion = null;
    this.formularioEmpresa = this.fb.group({

      // nombre: ['', [Validators.required, this.letrasSinNumerosValidator(), Validators.maxLength(55)]],
      nombreEmpresa: ['', [Validators.required, this.letrasSinNumerosValidator(), Validators.maxLength(20)]],
      rut: ['', Validators.required],
      direccion: ['', Validators.required],
      // stock: ['', Validators.required],
      // telefono: ['', [ Validators.pattern('[0-9]*'), Validators.maxLength(10), this.validarLongitudTelefono]],
      telefono: ['', [ Validators.pattern('[0-9]*'), Validators.maxLength(10), ]],
      // esActivo: ['', Validators.required],
      propietario: ['', [Validators.required, this.letrasSinNumerosValidator(), Validators.maxLength(20)]],
      Urlimagen: [''],
      logo: [''],
      correo: ['', [, Validators.email, this.validateEmailDomain]],
      facebook: [''],
      instagram: [''],
      tiktok: [''],

    });

    if (datosEmpresa != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
      this.modoEdicion = true;
    }


  }
  validarLongitudTelefono(control: AbstractControl): { [key: string]: boolean } | null {
    const valor = control.value;

    if (valor && valor.toString().length === 10) {
      return null; // Válido
    } else {
      return { longitudTelefono: true }; // No válido
    }
  }
  validateEmailDomain(control: FormControl) {
    const email = control.value;
    if (email && email.indexOf('@') !== -1) {
      const domain = email.substring(email.lastIndexOf('@') + 1);
      if (domain === 'gmail.com' || domain === 'hotmail.com' || domain === 'outlook.com') {
        return null; // Válido
      }
      return { invalidDomain: true }; // Dominio no válido
    }
    return null; // No es un correo electrónico o no hay dominio para validar
  }

  ngOnInit(): void {
    // this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(this.imagenPorDefecto);
    // this.imagenBase64 = this.imagenPorDefecto;
    // this.imageData = this.imagenPorDefecto;
    // this.formularioEmpresa.setValidators(this.imagenRequeridaValidator());
    // this.formularioEmpresa.updateValueAndValidity();
    const imagenBase64 = this.imagenBase64;
    const producto = this.data.empresa;
    this.previsualizacion = this.data.imageUrl;



    if (this.datosEmpresa != null) {


      this.formularioEmpresa.patchValue({
        nombreEmpresa: this.datosEmpresa.nombreEmpresa,
        rut: this.datosEmpresa.rut,
        direccion: this.datosEmpresa.direccion,
        // stock: this.datosEmpresa.stock,
        telefono: this.datosEmpresa.telefono,
        propietario: this.datosEmpresa.propietario,
        // esActivo: this.datosEmpresa.esActivo.toString(),

        logo: [''],
        correo: this.datosEmpresa.correo,
        instagram: this.datosEmpresa.instagram,
        facebook: this.datosEmpresa.facebook,
        tiktok: this.datosEmpresa.tiktok,


      })

    }



  }


  formatearNumero(event: any, campo: string): void {
    let valorInput = event.target.value.replace(/\./g, ''); // Elimina los puntos existentes

    // Verifica si el valor es un número válido antes de formatear
    if (valorInput !== '' && !isNaN(parseFloat(valorInput))) {
      valorInput = parseFloat(valorInput).toLocaleString('es-CO', { maximumFractionDigits: 2 });
      this.numeroFormateado = valorInput;

      // Actualiza el valor formateado en el formulario
      this.formularioEmpresa.get(campo)?.setValue(valorInput);
    } else {
      // Si el valor no es un número válido o está vacío, establece el valor en blanco en el formulario
      this.numeroFormateado = '';
      this.formularioEmpresa.get(campo)?.setValue('');
    }
  }





  imagenRequeridaValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const imageData = control.get('imageData')?.value;
      const esModoEdicion = this.modoEdicion;

      if (!esModoEdicion && !imageData) {
        return { 'imagenRequerida': true };
      }

      return null;
    };
  }

  selectFile(event: any): void {
    if (!this.modoEdicion) { // Solo si no estás en modo de edición
      const archivo = event.target.files[0];

      if (archivo) {
        const lector = new FileReader();
        lector.onload = (e) => {
          this.imagenBase64 = e.target?.result as string;
          this.logoNombre = archivo.name;
          console.log('Imagen Base64:', this.imagenBase64);
          console.log('previsualizacion:', this.previsualizacion);

          if (typeof e.target?.result === 'string') {
            // Crea una URL segura para la imagen
            this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target?.result);
            this.logo = this.imagenBase64;
            this.nuevoArchivo = archivo;
          } else {
            console.error('El resultado no es una cadena.');
          }
        };
        lector.readAsDataURL(archivo);
      }
      // Actualiza la referencia directamente desde el evento de cambio
      if (event.target) {
        event.target.value = '';
      }
    }
  }


  limpiarImagen(): void {
    this.formularioEmpresa.patchValue({
      imageData: '',
    });
    this.previsualizacion = null;
    this.imagenBase64 = null;
  }

  obtenerUrlSeguraDeImagen(): SafeUrl | null {
    const safeUrl = this.imagenBase64 ? this.sanitizer.bypassSecurityTrustUrl(this.imagenBase64) : null;

    return safeUrl;
  }

  letrasValidator() {
    return (control: FormControl) => {
      const nombre = control.value;
      const soloLetras = /^[a-zA-Z]+$/.test(nombre);
      return soloLetras ? null : { letrasValidator: true };
    };
  }

  letrasSinNumerosValidator() {
    return (control: FormControl) => {
      const nombre = control.value;
      const contieneNumeros = /\d/.test(nombre); // Verifica si hay al menos un dígito
      return contieneNumeros ? { letrasSinNumerosValidator: true } : null;
    };
  }







  async guardarEditar_Empresa() {
    console.log("Estado del formulario:", this.formularioEmpresa.status);

    // Verificar si el formulario es inválido
    // if (this.formularioEmpresa.invalid) {
    //   this._utilidadServicio.mostrarAlerta("Por favor, complete todos los campos correctamente", "Error");
    //   return;
    // }

    // if (this.nuevoArchivo!.size > 3000000) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Advertencia',
    //     text: 'La imagen no debe superar los 3 MB de tamaño.',
    //   });
    //   return;
    // }

    // const imagenBase64 = this.imagenBase64;

    // // Verificar si no se seleccionó ninguna imagen
    // if (!this.modoEdicion && !imagenBase64) {
    //   this._utilidadServicio.mostrarAlerta("Debe seleccionar una imagen", "Error");
    //   return;
    // }
    let archivoBlob: Blob | null = null;
    let archivo = "assets/Images/PorDefecto.png";
    const obtenerBlobDesdeArchivo = (rutaArchivo: string): Promise<Blob> => {
      return fetch(rutaArchivo).then(response => {
        return response.blob();
      });
    };
    if (!this.nuevoArchivo) {
      // Llamar a la función para obtener el Blob
      obtenerBlobDesdeArchivo(archivo).then(blob => {
        const lector = new FileReader();
        lector.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            // Crea una URL segura para la imagen
            // this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target?.result);
            this.logo = e.target?.result as string;
            // this.imagenSeleccionada = true;
            // this.nuevoArchivo = archivo;
            archivoBlob = this.nuevoArchivo;
            this.procesarArchivo(archivoBlob!);
            console.log('Imagen Base64:', this.logo);
            console.log('Previsualización:', this.previsualizacion);
          } else {
            console.error('El resultado no es una cadena.');
          }
        };

        // Leer el Blob como una URL de datos
        lector.readAsDataURL(blob);
      }).catch(error => {
        console.error('Error al obtener el archivo como Blob:', error);
      });
    }


  }

  procesarArchivo(archivoBlob: Blob) {

    // Usar el valor del formulario si se ha realizado un cambio, de lo contrario, conservar el valor actual

    const _empresa: Empresa = {
      idEmpresa: this.datosEmpresa == null ? 0 : this.datosEmpresa.idEmpresa,
      nombreEmpresa: this.formularioEmpresa.value.nombreEmpresa,
      rut: this.formularioEmpresa.value.rut,
      telefono: this.formularioEmpresa.value.telefono,
      direccion: this.formularioEmpresa.value.direccion,
      propietario: this.formularioEmpresa.value.propietario,
      correo: this.formularioEmpresa.value.correo,
      facebook: this.formularioEmpresa.value.facebook,
      instagram: this.formularioEmpresa.value.instagram,
      tiktok: this.formularioEmpresa.value.tiktok,
      logo: this.logo ? this.logo.split(',')[1] : "",
      logoNombre: this.logoNombre && this.logoNombre.trim() !== "" ? this.logoNombre : "PorDefecto.png" // Si está vacío o nulo, usa "PorDefecto.png"
    };
    // if (_producto.stock <= 0) {

    //   this._utilidadServicio.mostrarAlerta("Digite un Stok mayor a Cero ", "ERROR!");
    // } else {


    if (this.datosEmpresa == null) {
      this._empresaServicio.guardar(_empresa).subscribe({
        next: (data) => {
          if (data.status) {

            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: `No se pudo registrar el producto `,
            });

          } else {

            Swal.fire({
              icon: 'success',
              title: 'Empresa Registrada',
              text: `La empresa fue registrada`,
            });
            // this._utilidadServicio.mostrarAlerta("El producto fue registrado", "Exito");
            this.modalActual.close("true");
            location.reload();
            // this._utilidadServicio.mostrarAlerta("Ya existe un producto con ese mismo nombre", "Error");
          }
        }, error: (e) => {


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
                    this.guardarEditar_Empresa();
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
      this._empresaServicio.editar(_empresa).subscribe({
        next: (data) => {
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Correcto',
              text: `La informacion de la empresa fue actualizada`,
            });
            this.empresaDataService.actualizarEmpresa(_empresa);
            this.modalActual.close('true');

          } else {
            Swal.fire({
              icon: 'error',
              title: 'ERROR!',
              text: `No se pudo actualizar la  informacion de la empresa`,
            });
            // this._utilidadServicio.mostrarAlerta("No se pudo editar el producto", "Error");
          }
        }, error: (e) => {


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
                    this.guardarEditar_Empresa();
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

}
