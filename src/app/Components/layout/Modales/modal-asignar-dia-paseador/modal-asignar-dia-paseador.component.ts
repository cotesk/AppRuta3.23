import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { PasadorDias } from './../../../../Interfaces/pasadorDias';
import { PaseadorDiaService } from '../../../../Services/paseadorDia.service';
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
  selector: 'app-modal-asignar-dia-paseador',
  templateUrl: './modal-asignar-dia-paseador.component.html',
  styleUrl: './modal-asignar-dia-paseador.component.css'
})
export class ModalAsignarDiaPaseadorComponent {


  formularioPasadorDia!: FormGroup;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";

  diasSemana = [
    { nombre: 'Lunes', icono: 'event_note' },
    { nombre: 'Martes', icono: 'event_note' },
    { nombre: 'Miércoles', icono: 'event_note' },
    { nombre: 'Jueves', icono: 'event_note' },
    { nombre: 'Viernes', icono: 'event_available' },
    { nombre: 'Sábado', icono: 'weekend' },
    { nombre: 'Domingo', icono: 'beach_access' }
  ];

  modoEdicion: boolean = false;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalAsignarDiaPaseadorComponent>,
    @Inject(MAT_DIALOG_DATA) public datosPasadorDia: PasadorDias | null,
    private _paseadorServicio: PaseadorDiaService,
    private _usuarioServicio: UsuariosService,
  ) {

    this.formularioPasadorDia = this.fb.group({
      // idUsuario: ['', Validators.required],
      diaSemana: ['', Validators.required],
      trabaja: [true, Validators.required],
    });

    if (this.datosPasadorDia) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
      this.modoEdicion = true;
      // this.formularioPasadorDia.patchValue(this.datosPasadorDia);
    }

  }

  ngOnInit(): void {
    if (this.datosPasadorDia) {
      this.formularioPasadorDia.patchValue(this.datosPasadorDia);
    }
  }


  guardarEditar_PaseadorDia(): void {
    if (this.formularioPasadorDia.invalid) {
      return; // si el formulario no es válido, no hace nada
    }

    let idUsuario: number = 0;
    let nombreCompleto: string = '';

    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(datosDesencriptados);
    const usuario = JSON.parse(datosDesencriptados);
    idUsuario = usuario.idUsuario;
    nombreCompleto = usuario.nombreCompleto

    const paseadorDia: PasadorDias = {
      idPasadorDia: this.datosPasadorDia == null ? 0 : this.datosPasadorDia.idPasadorDia,
      idUsuario: idUsuario,
      diaSemana: this.formularioPasadorDia.value.diaSemana,
      trabaja: this.formularioPasadorDia.value.trabaja,
      nombreUsuario: ""
    };

    // console.log(paseadorDia);

    if (this.datosPasadorDia == null) {
      // Crear disponibilidad
      this._paseadorServicio.guardar(paseadorDia).subscribe({
        next: (data) => {
          console.log(data);
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Disponibilidad registrada',
              text: `El día fue registrado correctamente`,
            });
            this.dialogRef.close("true");
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: data.msg || 'No se pudo guardar la disponibilidad',
            });
          }
        },
        error: (e) => this.manejarErrorToken(() => this.guardarEditar_PaseadorDia())
      });
    } else {
      // Editar disponibilidad
      this._paseadorServicio.editar(paseadorDia).subscribe({
        next: (data) => {
          if (data.status) {
            Swal.fire({
              icon: 'success',
              title: 'Disponibilidad editada',
              text: `El día fue actualizado correctamente`,
            });
            this.dialogRef.close("true");
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: data.msg || 'No se pudo editar la disponibilidad',
            });
          }
        },
        error: (e) => this.manejarErrorToken(() => this.guardarEditar_PaseadorDia())
      });
    }
  }

  /**
   * Manejo de error por expiración de token
   */
  private manejarErrorToken(reintento: Function) {
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) return;

    const bytes = CryptoJS.AES.decrypt(usuarioString, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

    if (datosDesencriptados) {
      const usuario = JSON.parse(datosDesencriptados);
      this._usuarioServicio.obtenerUsuarioPorId(usuario.idUsuario).subscribe(
        (user: any) => {
          const refreshToken = user.refreshToken;
          this._usuarioServicio.renovarToken(refreshToken).subscribe(
            (response: any) => {
              localStorage.setItem('authToken', response.token);
              reintento(); // vuelve a ejecutar el método original
            },
            (error: any) => console.error('Error al actualizar el token:', error)
          );
        },
        (error: any) => console.error('Error al obtener el usuario:', error)
      );
    }
  }



}
