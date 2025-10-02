import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Tarifa } from './../../../../Interfaces/tarifa';
import { TarifaService } from '../../../../Services/tarifa.service';
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
  selector: 'app-modal-tarifa',
  templateUrl: './modal-tarifa.component.html',
  styleUrl: './modal-tarifa.component.css'
})
export class ModalTarifaComponent {


  formularioTarifa: FormGroup;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  numeroFormateado: string = '';
 modoEdicion: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalTarifaComponent>,
    @Inject(MAT_DIALOG_DATA) public dataTarifa: Tarifa,
    private _tarifaServicio: TarifaService,
    private _usuarioServicio: UsuariosService,
  ) {


    this.formularioTarifa = this.fb.group({

      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      precioPorHora: ['', [Validators.required]],
      duracionHoras: ['', [Validators.required, Validators.min(1)]],
      activo: [true],
      // fechaRegistro: [dataTarifa?.fechaRegistro ?? new Date()]
    });

    if (dataTarifa != null) {
      this.tituloAccion = dataTarifa ? "Editar" : "Agregar";
      this.botonAccion = dataTarifa ? "Actualizar" : "Guardar";
       this.modoEdicion = true;
    }
  }

  ngOnInit(): void {
    // Si recibes la tarifa desde el modal
    if (this.dataTarifa != null) {
      // this.idTarifa = this.dataTarifa.idTarifa!;
      // console.log("Editando tarifa con ID:", this.idTarifa);

      const precioNumerico = parseFloat(this.dataTarifa.precioPorHoraTexto!);
      const precioFormateado = precioNumerico.toFixed(0);

      this.formularioTarifa.patchValue({
        nombre: this.dataTarifa.nombre,
        precioPorHora: precioFormateado,
        duracionHoras: this.dataTarifa.duracionHoras,
        activo: this.dataTarifa.activo,
        // fechaRegistro: this.dataTarifa.fechaRegistro
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
      this.formularioTarifa.get(campo)?.setValue(valorInput);
    } else {
      // Si el valor no es un número válido o está vacío, establece el valor en blanco en el formulario
      this.numeroFormateado = '';
      this.formularioTarifa.get(campo)?.setValue('');
    }
  }



  guardarEditar_Tarifa(): void {
    if (this.formularioTarifa.invalid) {
      return; // si el formulario no es válido, no hace nada
    }

    let precioSinFormato = this.formularioTarifa.value.precioPorHora.replace(/\./g, '');


    const tarifa: Tarifa = {
      idTarifa: this.dataTarifa == null ? 0 : this.dataTarifa.idTarifa,
      nombre: this.formularioTarifa.value.nombre,
      precioPorHoraTexto: precioSinFormato.toString(),
      duracionHoras: this.formularioTarifa.value.duracionHoras,
      activo: this.formularioTarifa.value.activo,
      // fechaRegistro: this.formularioTarifa.value.fechaRegistro
    };
    console.log(tarifa);
    if (this.dataTarifa == null) {
      // Crear tarifa
      this._tarifaServicio.guardar(tarifa).subscribe({
        next: (data) => {
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Tarifa Registrada',
              text: `La tarifa fue registrada`,
            });
            // this._utilidadServicio.mostrarAlerta("El usuario fue registrado", "Exito");
            this.dialogRef.close("true");
            // this.actualizarLocalStorage(_usuario);
          } else {
            console.log(data.msg);
            if (data.msg == "El nombre de la tarifa ya existe.") {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `El nombre de la tarifa ya existe.`,
              });


            }

            else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo guardar la tarifa`,
              });

            }
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
                    this.guardarEditar_Tarifa();
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
      // Editar tarifa
      this._tarifaServicio.editar(tarifa).subscribe({
        next: (data) => {
          if (data.status) {


            Swal.fire({
              icon: 'success',
              title: 'La tarifa fue editada',
              text: `La tarifa fue editada`,
            });



            this.dialogRef.close("true");





          } else {
            if (data.msg == "El nombre de la tarifa ya existe.") {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `El nombre de la tarifa ya existe.`,
              });


            }

            else {
              Swal.fire({
                icon: 'error',
                title: 'ERROR',
                text: `No se pudo editar la tarifa`,
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
                    this.guardarEditar_Tarifa();
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
  }


}
