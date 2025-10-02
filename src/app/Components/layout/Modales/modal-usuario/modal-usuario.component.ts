import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Rol } from '../../../../Interfaces/rol';
import { Usuario } from '../../../../Interfaces/usuario';
import { RolService } from '../../../../Services/rol.service';
import { UsuariosService } from '../../../../Services/usuarios.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../Services/auth.service';
import * as CryptoJS from 'crypto-js';
import { VerImagenProductoModalComponent } from '../ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { MatTooltip } from '@angular/material/tooltip';


@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html',
  styleUrl: './modal-usuario.component.css'
})
export class ModalUsuarioComponent implements OnInit {

  formularioUsuario: FormGroup;
  ocultarPassword: boolean = true;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  listaRoles: Rol[] = [];
  modoEdicion: boolean = false;
  modoEdicion2: boolean = true;
  public previsualizacion: SafeUrl | null = null;
  imagenBase64: string | null = null;
  public imageData: string | null = null;
  public Urlimagen: string | null = null;
  inputFileRef: ElementRef | undefined;
  imagenSeleccionada: boolean = false;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  // Variable de estado para rastrear qué validaciones de contraseña han fallado
  passwordErrors: string[] = [];
  nuevoArchivo: File | null = null;
  nombreImagen: string = '';
  nombreUsuario: string = "";
  rolUsuario: string = "";

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  camaraActiva: boolean = false;
  accionSeleccionada: string = ''; // Para rastrear la opción seleccionada
  stream: MediaStream | null = null;
  rolSeleccionado: number = 0;

  @ViewChild(MatTooltip) tooltip!: MatTooltip;
  constructor(
    private modalActual: MatDialogRef<ModalUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public datosUsuario: Usuario, private fb: FormBuilder,
    private _rolServicio: RolService, private _usuarioServicio: UsuariosService,
    private _utilidadServicio: UtilidadService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {
    this.formularioUsuario = this.fb.group({

      nombreCompleto: ['', [Validators.required, this.letrasSinNumerosValidator(), Validators.maxLength(25)]],
      correo: ['', [Validators.required, Validators.email, this.validateEmailDomain, Validators.maxLength(35)]],
      idRol: ['', Validators.required],
      clave: ['', [
        Validators.required,
        this.primeraLetraMayusculaValidator(),
        this.contieneNumeroValidator(),
        this.longitudExactaValidator(6, 15),
        this.caracterEspecialValidator()
      ]],
      esActivo: ['1',],
      Urlimagen: [''],
      imageData: [''],
      // 🔹 Nuevos campos opcionales
      capacidadNoche: [null],
      capacidadManana: [null],
      capacidadTarde: [null],
      direccion: [null],
      barrio: [null],
      referencia: [null],


    });

    if (datosUsuario != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
      this.modoEdicion = true;
      this.modoEdicion2 = false;
    }

    this.formularioUsuario.get('idRol')?.valueChanges.subscribe((value) => {
      console.log('Valor seleccionado:', value);
      if (value === 1) {
        this.rolSeleccionado = value;

      } else if (value === 2) {
        this.rolSeleccionado = value;
      }
    });

    this._rolServicio.lista().subscribe({

      next: (data) => {
        if (data.status)
          data.value.sort((a: Rol, b: Rol) => a.nombre.localeCompare(b.nombre));
        this.listaRoles = data.value;
        // this.listaRoles = data.value
      },
      error: (e) => {

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

    })

  }
  lista() {
    this._rolServicio.lista().subscribe({

      next: (data) => {
        if (data.status)
          data.value.sort((a: Rol, b: Rol) => a.nombre.localeCompare(b.nombre));
        this.listaRoles = data.value;
      },
      error: (e) => {

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

    })
  }

  onRolChange(event: any) {
    console.log(event.value);
    this.rolSeleccionado = event.value; // el id del rol
  }

  validateEmailDomain(control: FormControl) {
    const email = control.value;
    if (email && email.indexOf('@') !== -1) {
      const domain = email.substring(email.lastIndexOf('@') + 1);
      if (domain === 'gmail.com' || domain === 'hotmail.com' || domain === 'outlook.com' || domain === 'unicesar.edu.co') {
        return null; // Válido
      }
      return { invalidDomain: true }; // Dominio no válido
    }
    return null; // No es un correo electrónico o no hay dominio para validar
  }


  ngOnInit(): void {

    if (this.datosUsuario != null) {
      this.formularioUsuario.patchValue({
        nombreCompleto: this.datosUsuario.nombreCompleto,
        correo: this.datosUsuario.correo,
        idRol: this.datosUsuario.idRol,
        clave: this.datosUsuario.clave,
        // esActivo: this.datosUsuario.esActivo.toString(),
        esActivo: this.datosUsuario.esActivo?.toString() || 'valor_predeterminado',

        imageData: [''],
        capacidadNoche: this.datosUsuario?.capacidadNoche ?? null,
        capacidadManana: this.datosUsuario?.capacidadManana ?? null,
        capacidadTarde: this.datosUsuario?.capacidadTarde ?? null,
        direccion: this.datosUsuario?.direccion ?? null,
        barrio: this.datosUsuario?.barrio ?? null,
        referencia: this.datosUsuario?.referencia ?? null,

      })

    }

  }

  getRoleIcon(roleName: string): string {
    switch (roleName) {
      case 'Administrador':
        return 'administrador-icon';
      case 'Paseador':
        return 'paseador-icon';
      case 'Cliente':
        return 'cliente-icon';
      default:
        return '';
    }
  }

  getRoleIconName(roleName: string): string {
    switch (roleName) {
      case 'Administrador':
        return 'admin_panel_settings';
      case 'Paseador':
        return 'pets';
      case 'Cliente':
        return 'person';
      default:
        return '';
    }
  }


  verImagen(): void {
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: [this.previsualizacion]
      }
    });
  }
  selectFile(event: any): void {
    if (!this.modoEdicion) { // Solo si no estás en modo de edición
      const archivo = event.target.files[0];

      if (archivo) {
        this.nombreImagen = archivo.name;
        const lector = new FileReader();
        lector.onload = (e) => {
          this.imagenBase64 = e.target?.result as string;

          console.log('Imagen Base64:', this.imagenBase64);
          console.log('previsualizacion:', this.previsualizacion);

          if (typeof e.target?.result === 'string') {
            // Crea una URL segura para la imagen
            this.previsualizacion = this.sanitizer.bypassSecurityTrustUrl(e.target?.result);
            this.imageData = this.imagenBase64;
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
      imageData: '',
    });
    this.previsualizacion = null;
    this.imagenBase64 = null;
    this.imagenSeleccionada = false;

    if (this.accionSeleccionada === 'tomarFoto') {
      this.activarCamara();
    } else if (this.accionSeleccionada === 'elegirFoto') {
      this.DesactivarCamara();
      this.camaraActiva = false; // Desactiva la cámara si estaba activa
    }

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

  onSeleccionAccion(event: any): void {
    this.accionSeleccionada = event.value;
    if (this.accionSeleccionada === 'tomarFoto') {
      this.activarCamara();
    } else if (this.accionSeleccionada === 'elegirFoto') {
      this.DesactivarCamara();
      this.camaraActiva = false; // Desactiva la cámara si estaba activa
    }
  }

  DesactivarCamara() {
    const video = this.videoElement.nativeElement;
    const stream = video.srcObject as MediaStream;

    if (stream) {
      stream.getTracks().forEach(track => track.stop()); // Detiene cada pista (audio/video)
      video.srcObject = null;
      video.style.display = 'none';
    }

    this.camaraActiva = false;
  }
  activarCamara() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.stream = stream;
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.style.display = 'block';
        this.camaraActiva = true;
      })
      .catch((error) => {
        console.error('Error al activar la cámara:', error);
        alert('No se pudo acceder a la cámara.');
      });
  }

  tomarFoto() {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Reflejar la imagen en el canvas
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir el contenido del canvas a una imagen
      // const imageData = canvas.toDataURL('image/png');
      // console.log('Imagen capturada:', imageData);
      // Puedes usar la imagen capturada como prefieras
      this.previsualizacion = canvas.toDataURL('image/png');


    }


    this.imageData = canvas.toDataURL('image/png');

    this.detenerCamara();
  }


  detenerCamara() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.camaraActiva = false;
    this.videoElement.nativeElement.style.display = 'none';
  }

  guardarEditar_Usuario() {
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    const usuario = JSON.parse(datosDesencriptados);
    const idUsuarioLocalStorage = usuario ? usuario.idUsuario : null;

    if (this.formularioUsuario.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `Por favor, complete todos los campos correctamente`,
      });
      return;
    }

    let archivoBlob: Blob | null = null;

    // Prioriza la foto tomada
    if (this.imageData) {
      const base64Data = this.imageData.split(',')[1];
      const binaryData = atob(base64Data);
      const arrayBuffer = new Uint8Array(binaryData.length);

      for (let i = 0; i < binaryData.length; i++) {
        arrayBuffer[i] = binaryData.charCodeAt(i);
      }

      archivoBlob = new Blob([arrayBuffer], { type: 'image/png' });
      console.log('Usando imagen tomada');
      // Genera un número aleatorio de 5 dígitos
      const numerosAleatorios = Math.floor(10000 + Math.random() * 90000);

      // Crea un nombre único para la imagen

      this.nombreImagen = `PorFoto_${numerosAleatorios}.png`;
    }
    // Verifica si se seleccionó una foto
    else if (this.nuevoArchivo) {
      if (this.nuevoArchivo.size > 3000000) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'La imagen no debe superar los 3 MB de tamaño.',
        });
        return;
      }

      archivoBlob = this.nuevoArchivo;
      console.log('Usando imagen seleccionada');
    }
    // Usa la imagen por defecto si no hay otra
    else {
      const archivo = "assets/Images/defecto2.png";
      const obtenerBlobDesdeArchivo = (rutaArchivo: string): Promise<Blob> => {
        return fetch(rutaArchivo).then(response => {
          return response.blob();
        });
      };
      obtenerBlobDesdeArchivo(archivo).then(blob => {
        const lector = new FileReader();
        lector.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            this.imageData = e.target?.result as string;

            // Genera un número aleatorio de 5 dígitos
            const numerosAleatorios = Math.floor(10000 + Math.random() * 90000);

            // Crea un nombre único para la imagen

            this.nombreImagen = `PorDefecto_${numerosAleatorios}.png`;

            // this.imagenSeleccionada = true;
            // this.nuevoArchivo = archivo;
            archivoBlob = this.nuevoArchivo;
            this.procesarArchivo(archivoBlob!);
            console.log('Imagen Base64:', this.imageData);
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
      return; // Detén aquí para evitar procesar en paralelo
    }

    // // Procesar el archivo final
    if (archivoBlob) {
      this.procesarArchivo(archivoBlob);

      console.log('Imagen final procesada:', archivoBlob);
    } else {
      console.error('No se pudo procesar ninguna imagen');
    }
  }


  getPasswordErrorTooltip(): string {
    return this.passwordErrors.length > 0 ? this.passwordErrors.join('\n') : '';
  }
  procesarArchivo(archivoBlob: Blob) {
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    const usuario = JSON.parse(datosDesencriptados);
    const idUsuarioLocalStorage = usuario ? usuario.idUsuario : null;
    // Obtener la cadena de base64 de la imagen seleccionada
    // const imagenBase64 = this.imagenBase64;

    // Verificar si no se seleccionó ninguna imagen
    // if (!this.modoEdicion && !imagenBase64) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Advertencia',
    //     text: `Debe seleccionar una imagen`,
    //   });
    //   //  this._utilidadServicio.mostrarAlerta("Debe seleccionar una imagen", "Error");
    //   return;
    // }

    // Verificar si el nombre de usuario ya existe

    // const reader = new FileReader();
    // reader.onload = () => {
    //   const imagenBase64 = reader.result?.toString();
    //   if (imagenBase64) {
    //     this.imageData = imagenBase64.split(',')[1]; // Obtener solo los datos base64
    //   }
    // };
    let idRol = this.formularioUsuario.value.idRol;

    let capacidadNoche: any;
    let capacidadManana: any;
    let capacidadTarde: any;
    let direccion: any;
    let barrio: any;
    let referencia: any;


    if (idRol == 1) {
      capacidadNoche = this.formularioUsuario.value.capacidadNoche;
      capacidadManana = this.formularioUsuario.value.capacidadManana;
      capacidadTarde = this.formularioUsuario.value.capacidadTarde;
      direccion = this.formularioUsuario.value.direccion;
      barrio = this.formularioUsuario.value.barrio;
      referencia = this.formularioUsuario.value.referencia;
    } else if (idRol == 2) {
      capacidadNoche = this.formularioUsuario.value.capacidadNoche;
      capacidadManana = this.formularioUsuario.value.capacidadManana;
      capacidadTarde = this.formularioUsuario.value.capacidadTarde;
      direccion = this.formularioUsuario.value.direccion;
      barrio = this.formularioUsuario.value.barrio;
      referencia = this.formularioUsuario.value.referencia;
    } else {

    }


    const _usuario: Usuario = {
      idUsuario: this.datosUsuario == null ? 0 : this.datosUsuario.idUsuario,
      nombreCompleto: this.formularioUsuario.value.nombreCompleto,
      correo: this.formularioUsuario.value.correo,
      idRol: this.formularioUsuario.value.idRol,
      rolDescripcion: "",
      clave: this.formularioUsuario.value.clave,
      esActivo: parseInt(this.formularioUsuario.value.esActivo),
      imageData: this.imageData ? this.imageData.split(',')[1] : null,
      nombreImagen: this.nombreImagen || null,
      imagenUrl: "",
      // imageData: this.imageData,
      capacidadNoche: capacidadNoche ?? null,
      capacidadManana: capacidadManana ?? null,
      capacidadTarde: capacidadTarde ?? null,
      direccion: direccion ?? null,
      barrio: barrio ?? null,
      referencia: referencia ?? null,
    }
    console.log(_usuario);

    if (this.datosUsuario == null) {

      this._usuarioServicio.guardar(_usuario).subscribe({

        next: (data) => {
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Usuario Registrado',
              text: `El usuario fue registrado`,
            });
            // this._utilidadServicio.mostrarAlerta("El usuario fue registrado", "Exito");
            this.modalActual.close("true");
            // this.actualizarLocalStorage(_usuario);
          } else {
            console.log(data.msg);
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
                text: `No se pudo eliminar el usuario`,
              });

            }

            // this._utilidadServicio.mostrarAlerta("No se pudo registrar usuario ", "Error");
          }
        },
        error: (e) => {


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
                    this.guardarEditar_Usuario();
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

      })
    } else {

      this._usuarioServicio.editar(_usuario).subscribe({

        next: (data) => {
          if (data.status) {

            if (idUsuarioLocalStorage !== this.datosUsuario?.idUsuario) {
              // Si los IDs son diferentes, mostrar un mensaje o tomar alguna acción necesaria
              Swal.fire({
                icon: 'success',
                title: 'El usuario fue editado',
                text: `El usuario fue editado`,
              });



              this.modalActual.close("true");
            } else {

              Swal.fire({
                icon: 'success',
                title: 'El usuario fue editado',
                text: `El usuario fue editado`,
                timer: 3000,  // 3000 milisegundos = 3 segundos
                showConfirmButton: false  // Oculta el botón de confirmación
              }).then(() => {
                // Código que se ejecutará después de que se cierre el mensaje de SweetAlert2
                this.actualizarNombreUsuario();
                this.modalActual.close("true");
                // window.location.reload();

              });


              // this.actualizarLocalStorage(_usuario); // Pasa _usuario como argumento
              // Actualizar el usuario en el localStorage sin eliminar la sesión actual

              // const storedUser = JSON.parse(localStorage.getItem('usuario')!);
              // if (storedUser) {
              //   // Actualiza solo los campos relevantes del usuario
              //   storedUser.nombreCompleto = _usuario.nombreCompleto;
              //   storedUser.correo = _usuario.correo;
              //   // Guarda el usuario actualizado en el localStorage
              //   localStorage.setItem('usuario', JSON.stringify(storedUser));
              // }


              const storedUser = localStorage.getItem('usuario');
              try {
                const bytes = CryptoJS.AES.decrypt(storedUser!, this.CLAVE_SECRETA);
                const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
                const usuarioLocalStorage = JSON.parse(datosDesencriptados) as Usuario;
                if (usuarioLocalStorage) {
                  usuarioLocalStorage.nombreCompleto = _usuario.nombreCompleto;
                  usuarioLocalStorage.correo = _usuario.correo;
                  usuarioLocalStorage.clave = _usuario.clave;
                  // Vuelve a encriptar y guarda los datos actualizados en localStorage
                  const updatedUserEncrypted = CryptoJS.AES.encrypt(JSON.stringify(usuarioLocalStorage), this.CLAVE_SECRETA).toString();
                  localStorage.setItem('usuario', updatedUserEncrypted);
                  this.authService.actualizarUsuarioLocal(usuarioLocalStorage);
                }

              } catch (error) {

              }


            }
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
                text: `No se pudo eliminar el usuario`,
              });

            }

            // this._utilidadServicio.mostrarAlerta("No se pudo registrar usuario ", "Error");
          }




        },
        error: (e) => {


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
                    this.guardarEditar_Usuario();
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

      })

    }
    // reader.readAsDataURL(archivoBlob);
  }

  actualizarNombreUsuario(): void {
    const usuarioEncriptado = localStorage.getItem('usuario');
    if (usuarioEncriptado) {
      try {
        const bytes = CryptoJS.AES.decrypt(usuarioEncriptado, this.CLAVE_SECRETA);
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

  // private actualizarLocalStorage(usuario: Usuario): void {
  //   // Obtener la lista actual del local storage
  //   const usuariosEnLocalStorage = JSON.parse(localStorage.getItem('usuarios') || '[]') as Usuario[];
  //   const bytes = CryptoJS.AES.decrypt(usuariosEnLocalStorage, this.CLAVE_SECRETA);
  //   const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
  //   // Agregar el nuevo usuario o actualizar el existente
  //   const usuarioIndex = usuariosEnLocalStorage.findIndex(u => u.idUsuario === usuario.idUsuario);
  //   if (usuarioIndex !== -1) {
  //     usuariosEnLocalStorage[usuarioIndex] = usuario;
  //   } else {
  //     usuariosEnLocalStorage.push(usuario);
  //   }

  //   // Guardar la lista actualizada en el local storage
  //   localStorage.setItem('usuario', JSON.stringify(usuariosEnLocalStorage));
  //   const token = 'tu-token-obtenido-del-servidor';
  //   this.authService.setAuthToken(token);

  // }



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
  onPasswordChange() {
    this.updatePasswordErrors();
  }
  showTooltip() {
    if (this.passwordErrors.length > 0) {
      this.tooltip.show();
    }
  }
  onSubmit() {
    this.updatePasswordErrors();

    // Aquí podrías agregar la lógica para enviar el formulario si es válido
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
