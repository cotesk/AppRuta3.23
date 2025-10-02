import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Rol } from '../../Interfaces/rol';
import { Usuario } from '../../Interfaces/usuario';
import { RolService } from '../../Services/rol.service';
import { UsuariosService } from '../../Services/usuarios.service';
import { UtilidadService } from '../../Reutilizable/utilidad.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';
import { VerImagenProductoModalComponent } from '../layout/Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { MatTooltip } from '@angular/material/tooltip';
// function contrasenasCoinciden(control: AbstractControl): ValidationErrors | null {
//   const clave = control.get('clave')?.value;
//   const confirmarClave = control.get('confirmarClave')?.value;

//   return clave === confirmarClave ? null : { 'contrasenasNoCoinciden': true };
// }



@Component({
  selector: 'app-nuevos-usuarios',
  templateUrl: './nuevos-usuarios.component.html',
  styleUrl: './nuevos-usuarios.component.css',

})
export class NuevosUsuariosComponent {
  formularioUsuario: FormGroup;
  ocultarPassword: boolean = true;
  tituloAccion: string = "Nuevos";
  botonAccion: string = "Guardar";
  listaRoles: Rol[] = [];
  modoEdicion: boolean = false;
  public previsualizacion: SafeUrl | null = null;
  imagenBase64: string | null = null;
  public imagenUrl: string | null = null;
  public Urlimagen: string | null = null;
  inputFileRef: ElementRef | undefined;
  imagenSeleccionada: boolean = false;
  nuevoArchivo: File | null = null;
  // Variable de estado para rastrear qué validaciones de contraseña han fallado
  passwordErrors: string[] = [];
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  @ViewChild(MatTooltip) tooltip!: MatTooltip;


  constructor(
    public modalActual: MatDialogRef<NuevosUsuariosComponent>,
    @Inject(MAT_DIALOG_DATA) public datosUsuario: Usuario, private fb: FormBuilder,
    private _rolServicio: RolService, private _usuarioServicio: UsuariosService,
    private _utilidadServicio: UtilidadService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,

  ) {
    this.formularioUsuario = this.fb.group({
      nombreCompleto: ['', [Validators.required, this.letrasSinNumerosValidator(), Validators.maxLength(25)]],
      correo: ['', [Validators.required, Validators.email, this.validateEmailDomain]],
      idRol: [''],
      clave: ['', [
        Validators.required,
        this.primeraLetraMayusculaValidator(),
        this.contieneNumeroValidator(),
        this.longitudExactaValidator(6,15),
        this.caracterEspecialValidator()
      ]],
      esActivo: [''],
      Urlimagen: [''],
      imagenUrl: [''],
      confirmarClave: ['', [Validators.required]],
    }, { validators: this.contrasenasCoinciden });


    if (datosUsuario != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";

    }

    this._rolServicio.lista().subscribe({

      next: (data) => {
        if (data.status) this.listaRoles = data.value
      },



    })

  }



  validateEmailDomain(control: FormControl) {
    const email = control.value;
    if (email && email.indexOf('@') !== -1) {
      const domain = email.substring(email.lastIndexOf('@') + 1);
      if (domain === 'gmail.com' || domain === 'hotmail.com' || domain === 'outlook.com'|| domain === 'unicesar.edu.co') {
        return null; // Válido
      }
      return { invalidDomain: true }; // Dominio no válido
    }
    return null; // No es un correo electrónico o no hay dominio para validar
  }


  ngOnInit(): void {

    if (this.datosUsuario != null) {
      this, this.formularioUsuario.patchValue({
        nombreCompleto: this.datosUsuario.nombreCompleto,
        correo: this.datosUsuario.correo,
        idRol: this.datosUsuario.idRol,
        clave: this.datosUsuario.clave,
        // esActivo: this.datosUsuario.esActivo.toString(),
        esActivo: this.datosUsuario.esActivo?.toString() || 'valor_predeterminado',

        imagenUrl: [''],
        confirmarClave: this.datosUsuario.clave,
      })

    }
    // Agrega esto al final del ngOnInit
    this.formularioUsuario.setValidators([this.contrasenasCoinciden]);
    this.formularioUsuario.updateValueAndValidity();

  }

  verImagen(): void {
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenUrl: this.previsualizacion
      }
    });
  }

  selectFile(event: any): void {
    if (!this.modoEdicion) { // Solo si no estás en modo de edición
      const archivo = event.target.files[0];

      if (archivo) {
        const lector = new FileReader();
        lector.onload = (e) => {
          this.imagenBase64 = e.target?.result as string;

          console.log('Imagen Base64:', this.imagenBase64);
          console.log('previsualizacion:', this.previsualizacion);

          if (typeof e.target?.result === 'string') {
            // Crea una URL segura para la imagen
            this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target?.result);
            this.imagenUrl = this.imagenBase64;
            this.imagenSeleccionada = true;
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
    this.formularioUsuario.patchValue({
      imagenUrl: '',
    });
    this.previsualizacion = null;
    this.imagenBase64 = null;
    this.imagenSeleccionada = false;

  }

  obtenerUrlSeguraDeImagen(): SafeUrl | null {
    const safeUrl = this.imagenBase64
      ? this.sanitizer.bypassSecurityTrustUrl(this.imagenBase64)
      : null;

    return safeUrl;
  }


  letrasSinNumerosValidator() {
    return (control: FormControl) => {
      const nombre = control.value;
      const contieneNumeros = /\d/.test(nombre); // Verifica si hay al menos un dígito
      return contieneNumeros ? { letrasSinNumerosValidator: true } : null;
    };
  }
  showTooltip() {
    if (this.passwordErrors.length > 0) {
      this.tooltip.show();
    }
  }

  getPasswordErrorTooltip(): string {
    return this.passwordErrors.length > 0 ? this.passwordErrors.join('\n') : '';
  }
  guardarEditar_Usuario() {



    if (this.formularioUsuario.invalid) {
      // Manejar la validación del formulario
      return;
    }
    if (this.formularioUsuario.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `Por favor, complete todos los campos correctamente`,
      });
      // this._utilidadServicio.mostrarAlerta("Por favor, complete todos los campos correctamente", "Error");
      return;
    }


    let archivoBlob: Blob | null = null;
    let archivo = "assets/Images/defecto2.png";
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
            this.imagenUrl = e.target?.result as string;
            this.imagenSeleccionada = true;
            // this.nuevoArchivo = archivo;
            archivoBlob = this.nuevoArchivo;
            this.procesarArchivo(archivoBlob!);
            console.log('Imagen Base64:', this.imagenUrl);
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
    } else {
      // Si hay un nuevo archivo seleccionado, verificar su tamaño
      if (this.nuevoArchivo.size > 3000000) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'La imagen no debe superar los 3 MB de tamaño.',
        });
        return;
      }

      archivoBlob = this.nuevoArchivo;
      this.procesarArchivo(archivoBlob);
    }



  }
  procesarArchivo(archivoBlob: Blob) {


    const _usuario: Usuario = {
      idUsuario: this.datosUsuario == null ? 0 : this.datosUsuario.idUsuario,
      nombreCompleto: this.formularioUsuario.value.nombreCompleto,
      correo: this.formularioUsuario.value.correo,
      // idRol: 4,
      // rolDescripcion: "Clientes",
      clave: this.formularioUsuario.value.clave,
      // esActivo: 0,
      imagenUrl: this.imagenUrl ? this.imagenUrl.split(',')[1] : null,
    }


    if (this.datosUsuario == null) {

      this._usuarioServicio.guardar2(_usuario).subscribe({

        next: (data) => {
          if (data.status) {
            // Swal.fire({
            //   icon: 'success',
            //   title: 'Usuario Registrado',
            //   text: `El usuario fue registrado`,
            // });
            // this._utilidadServicio.mostrarAlerta("El usuario fue registrado", "Exito");
            this.modalActual.close("true");
            this.actualizarLocalStorage(_usuario); // Pasa _usuario como argumento

            this._usuarioServicio.activarCuenta(_usuario.correo!).subscribe(
              (response: any) => {
                if (response.status) {
                  Swal.fire('Éxito', 'Se ha enviado  a tu correo electrónico un link de activacion.', 'success');
                } else {
                  Swal.fire('Error', response.msg, 'error');
                }
              },
              (error) => {
                Swal.fire('Error', 'Hubo un error al enviar el correo electrónico.', 'error');
              }
            );


          } else {

            if (data.msg == "El nombre del correo ya existe.") {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `El nombre del correo ya existe.`,
              });


            } else if (data.msg == "El nombre del usuario ya existe.") {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `El nombre del usuario ya existe.`,
              });
            }

            else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo crear el usuario`,
              });

            }
            // this._utilidadServicio.mostrarAlerta("No se pudo registrar usuario ", "Error");
          }
        }


      })
    }
  }

  contrasenasCoinciden(control: AbstractControl): ValidationErrors | null {
    const clave = control.get('clave')?.value;
    const confirmarClave = control.get('confirmarClave')?.value;

    return clave === confirmarClave ? null : { 'contrasenasNoCoinciden': true };
  }
  private actualizarLocalStorage(usuario: Usuario): void {
    // Obtener la lista actual del local storage
    const usuariosEnLocalStorage = JSON.parse(localStorage.getItem('usuarios') || '[]') as Usuario[];

    // Agregar el nuevo usuario o actualizar el existente
    const usuarioIndex = usuariosEnLocalStorage.findIndex(u => u.idUsuario === usuario.idUsuario);
    if (usuarioIndex !== -1) {
      usuariosEnLocalStorage[usuarioIndex] = usuario;
    } else {
      usuariosEnLocalStorage.push(usuario);
    }

    // Guardar la lista actualizada en el local storage
    localStorage.setItem('usuario', JSON.stringify(usuariosEnLocalStorage));
  }

  primeraLetraMayusculaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const clave = control.value;
      const primeraLetra = clave.charAt(0);
      return primeraLetra === primeraLetra.toUpperCase() ? null : { 'primeraLetraMayuscula': true };
    };
  }

  caracterEspecialValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const clave = control.value;
      const contieneCaracterEspecial = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(clave);
      return contieneCaracterEspecial ? null : { 'caracterEspecial': true };
    };
  }
  contieneNumeroValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const clave = control.value;
      const contieneNumero = /\d/.test(clave); // Verifica si hay al menos un número
      return contieneNumero ? null : { contieneNumero: true };
    };
  }

  // longitudExactaValidator(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const clave = control.value;
  //     return clave.length === 8 ? null : { longitudIncorrecta: true };
  //   };
  // }
  longitudExactaValidator(minLength: number, maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const clave = control.value;
      if (typeof clave === 'string' && clave.length >= minLength && clave.length <= maxLength) {
        return null;
      }
      return { longitudIncorrecta: true };
    };
  }


  onSubmit() {
    this.updatePasswordErrors();

    // Aquí podrías agregar la lógica para enviar el formulario si es válido
  }
  // onPasswordChange() {
  //   this.updatePasswordErrors();
  // }
  onPasswordChange() {
    this.updatePasswordErrors();
    if (this.formularioUsuario.hasError('contrasenasNoCoinciden')) {
      this.formularioUsuario.get('confirmarClave')?.setErrors([{ 'contrasenasNoCoinciden': true }]);
    } else {
      this.formularioUsuario.get('confirmarClave')?.setErrors(null);
    }
  }

  reenviar(){
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

        this._usuarioServicio.obtenerUsuarioPorcorreo(correo).subscribe(
          (response: any) => {


              if(response.nombre =="Administrador" && response.esActivo == false){

                Swal.fire('Error', 'Esta cuenta no puede ser activada, necesita ser activada desde el equipo interno de su negocio.', 'error');

              }else{

                this._usuarioServicio.activarCuenta(correo).subscribe(
                  (response: any) => {
                    if (response.status) {
                      Swal.fire('Éxito', 'Se ha enviado  a tu correo electrónico un link de activacion.', 'success');
                    } else {
                      Swal.fire('Error', response.msg, 'error');
                    }
                  },
                  (error) => {
                    Swal.fire('Error', 'Hubo un error al enviar el correo electrónico.', 'error');
                  }
                );

              }



          },
          (error) => {
            Swal.fire('Error', 'Hubo un error al enviar el correo electrónico.', 'error');
          }
        );



      }
    });
  }



  // Método para actualizar los errores de contraseña
  updatePasswordErrors() {
    this.passwordErrors = [];
    const claveControl = this.formularioUsuario.get('clave');

    if (claveControl?.hasError('required')) {
      this.passwordErrors.push('La contraseña es requerida.');
    }
    if (claveControl?.hasError('primeraLetraMayuscula')) {
      this.passwordErrors.push('La primera letra debe ser mayúscula.');
    }
    if (claveControl?.hasError('longitudIncorrecta')) {
      this.passwordErrors.push('La contraseña debe tener exactamente de 6 a 15 caracteres.');
    }
    if (claveControl?.hasError('caracterEspecial')) {
      this.passwordErrors.push('La contraseña debe contener al menos un carácter especial.');
    }
    if (claveControl?.hasError('contieneNumero')) {
      this.passwordErrors.push('La contraseña debe contener al menos un número.');
    }
  }

}
