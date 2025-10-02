import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Paseo } from '../../../../Interfaces/paseo';
import { PaseoService } from '../../../../Services/paseo.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ReponseApi } from './../../../../Interfaces/reponse-api';
import { MatTable } from '@angular/material/table';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EmpresaService } from '../../../../Services/empresa.service';
import { Empresa } from '../../../../Interfaces/empresa';

import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
import { PaseadorDiaService } from '../../../../Services/paseadorDia.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PasadorDias } from '../../../../Interfaces/pasadorDias';
import { ModalAsignarDiaPaseadorComponent } from '../../Modales/modal-asignar-dia-paseador/modal-asignar-dia-paseador.component';
import { Tarifa } from '../../../../Interfaces/tarifa';
import { Perro } from '../../../../Interfaces/perro';
import { TarifaService } from '../../../../Services/tarifa.service';
import { PerroService } from '../../../../Services/perro.service';
import { Usuario } from '../../../../Interfaces/usuario';
import { ModalUsuarioComponent } from '../../Modales/modal-usuario/modal-usuario.component';
import { VerImagenProductoModalComponent } from '../../Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { MAT_DATE_FORMATS } from '@angular/material/core';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};


@Component({
  selector: 'app-asignar-paseos',
  templateUrl: './asignar-paseos.component.html',
  styleUrl: './asignar-paseos.component.css',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class AsignarPaseosComponent {
  formularioPaseo: FormGroup;
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  listaPaseador: Usuario[] = [];
  // listaClientes: PasadorDias[] = [];
  listaPerros: Perro[] = [];
  listaTarifas: Tarifa[] = [];
  perrosSeleccionados: any[] = [];
  listaDiasPasador: any[] = [];
  cupoDisponible: number | null = null;
  paseadorSeleccionado: any = null;
  modoEdicion: boolean = false;

  constructor(
    private fb: FormBuilder,
    private paseoService: PaseoService,
    private dialog: MatDialog,
    private _diasServicio: PaseadorDiaService,
    private _utilidadServicio: UtilidadService,
    private _usuarioServicio: UsuariosService,
    private _tarifaServicio: TarifaService,
    private _PerroServicio: PerroService,
      public dialogRef: MatDialogRef<AsignarPaseosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.formularioPaseo = this.fb.group({
      idUsuarioPasador: ['', Validators.required],
      idUsuarioCliente: ['',],
      idTarifa: ['', Validators.required],
      fecha: new FormControl(null, {
        validators: [
          Validators.required,
          this.fechaNoAnterior.bind(this), // Aquí vinculamos la función de validación personalizada
          this.validarRangoFecha()
        ]
      }),
      turno: ['', Validators.required],
      idsPerros: [[], Validators.required],
      todaSemana: [false]
    });
  }


  validarRangoFecha(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fecha = control.value;
      if (!fecha) return null;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // quitar hora para comparar bien

      // calcular el próximo mismo día de la semana
      const maxFecha = new Date(hoy);
      maxFecha.setDate(hoy.getDate() + 7); // siempre el mismo día de la semana siguiente

      if (fecha < hoy) {
        return { fechaAnterior: true };
      }
      if (fecha > maxFecha) {
        return { maxDate: true };
      }

      return null;
    };
  }



  obtenerDiaPaseador() {



    this._usuarioServicio.lista().subscribe({

      next: (data) => {
        // console.log(data);
        if (data.status) {

          this.listaPaseador = data.value
            .filter((u: Usuario) => u.rolDescripcion?.toLowerCase() === 'paseador')
            .sort((a: Usuario, b: Usuario) => a.nombreCompleto!.localeCompare(b.nombreCompleto!));

          // console.log(this.listaPaseador);
        }

        else
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `no se encontraron datos`,
          });
        // this._utilidadServicio.mostrarAlerta("no se encontraron datos", "Oops!");
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
                  this.obtenerDiaPaseador();
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

  obtenerTarifas() {

    this._tarifaServicio.lista().subscribe({

      next: (data) => {
        if (data.status) {
          // data.value.sort((a: Tarifa, b: Tarifa) => a.nombre.localeCompare(b.nombre));
          this.listaTarifas = data.value;
        }

        else
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: `no se encontraron datos`,
          });
        // this._utilidadServicio.mostrarAlerta("no se encontraron datos", "Oops!");
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
                  this.obtenerTarifas();
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


  obtenerPerro() {

    let idUsuario: number = 0;
    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(datosDesencriptados);
    const usuario = JSON.parse(datosDesencriptados);
    idUsuario = usuario.idUsuario;

    this._PerroServicio.obtenerPerrosPorUsuario(idUsuario).subscribe({
      next: (data) => {
        if (data.status) {
          // console.log(data);
          this.listaPerros = data.value;

        } else {

          this.listaPerros = data.value;
          // Swal.fire({
          //   icon: 'warning',
          //   title: 'Advertencia',
          //   text: 'No se encontraron datos',
          // });

        }
      },
      error: (e) => {

        let idUsuario: number = 0;
        const usuarioString = localStorage.getItem('usuario');
        const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
        if (datosDesencriptados) {
          const usuario = JSON.parse(datosDesencriptados);
          idUsuario = usuario.idUsuario;

          this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
            (usuario: any) => {
              let refreshToken = usuario.refreshToken;
              this._usuarioServicio.renovarToken(refreshToken).subscribe(
                (response: any) => {
                  localStorage.setItem('authToken', response.token);
                  this.obtenerPerro();
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

  fechaNoAnterior(control: FormControl): { [key: string]: boolean } | null {
    const fechaSeleccionada = new Date(control.value);

    if (!fechaSeleccionada || isNaN(fechaSeleccionada.getTime())) {
      return null; // si no hay fecha, no validar todavía
    }

    // Normalizar ambas fechas al inicio del día
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    fechaSeleccionada.setHours(0, 0, 0, 0);

    // Validar que no sea anterior a hoy
    if (fechaSeleccionada < hoy) {
      return { fechaAnterior: true };
    }

    return null;
  }


  onPasadorChange(event: any) {
    const idPasador = event.value;
    this.paseadorSeleccionado = this.listaPaseador.find(p => p.idUsuario === idPasador) || null;

    if (idPasador) {
      this._diasServicio.obtenerDiasPorUsuarioCompleto(idPasador).subscribe({
        next: (resp) => {
          if (resp.status) {
            console.log(resp);
            this.listaDiasPasador = resp.value;
          } else {
            this.listaDiasPasador = [];
          }
        },
        error: (err) => {
          console.error('Error al obtener días del pasador', err);
          this.listaDiasPasador = [];
        }
      });
    }
  }

  onPerrosChange(event: any) {
    const idsSeleccionados = event.value; // array de IDs seleccionados
    this.perrosSeleccionados = this.listaPerros.filter(
      perro => idsSeleccionados.includes(perro.idPerro)
    );
    // console.log("IDs seleccionados:", idsSeleccionados);
    // console.log("Perros seleccionados:", this.perrosSeleccionados);
  }


  verImagen(Perro: Perro): void {
    // console.log(Perro);
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: Perro.imagenUrl
      }
    });
  }

  verImagen2(paseador: any): void {
    //  console.log(paseador);
    this.dialog.open(VerImagenProductoModalComponent, {
      data: {
        imagenes: [paseador.imagenUrl]
      }
    });
  }


  nuevoPasadorDia() {

    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true

    }).afterClosed().subscribe(resultado => {

      if (resultado === "true") this.obtenerDiaPaseador();

    });
  }

  ngOnInit(): void {

  if (this.data?.paseo) {
    // console.log(this.data.paseo);
    this.modoEdicion = true;
    // Cargar datos en el formulario
    this.formularioPaseo.patchValue({
      idUsuarioPasador: this.data.paseo.idUsuarioPasador,
      idTarifa: this.data.paseo.idTarifa,
      fecha: new Date(this.data.paseo.fecha),
      turno: this.data.paseo.turno,
      todaSemana: false, // depende de tu lógica
      idsPerros: this.data.paseo.idsPerros || [] // si guardas perros
    });

    // Si quieres mostrar los perros seleccionados
    this.perrosSeleccionados = this.listaPerros.filter(p => 
      this.data.paseo.idsPerros.includes(p.idPerro)
    );
  }

    this.obtenerDiaPaseador();
    this.obtenerTarifas();
    this.obtenerPerro();
    this.formularioPaseo.get('idsPerros')?.valueChanges.subscribe((ids: number[]) => {
      this.perrosSeleccionados = this.listaPerros.filter(p => ids.includes(p.idPerro!));
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

  getColorDia(dia: string): string {
    switch (dia) {
      case 'Lunes': return 'chip-lunes';
      case 'Martes': return 'chip-martes';
      case 'Miércoles': return 'chip-miercoles';
      case 'Jueves': return 'chip-jueves';
      case 'Viernes': return 'chip-viernes';
      case 'Sábado': return 'chip-sabado';
      case 'Domingo': return 'chip-domingo';
      default: return '';
    }
  }


  onTurnoChange(event: any) {
    const turno = event.value; // mañana, tarde, noche
    const fecha = this.formularioPaseo.get('fecha')?.value;
    const pasadorId = this.formularioPaseo.get('idUsuarioPasador')?.value;

    if (!fecha || !pasadorId) {
      this.cupoDisponible = null;
      return;
    }

    // Obtener día de la semana
    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    const diaSeleccionado = this.listaDiasPasador.find(
      d => d.diaSemana.toLowerCase() === diaSemana.toLowerCase()
    );

    if (!diaSeleccionado) {
      this.cupoDisponible = null;
      return;
    }

    switch (turno) {
      case 'mañana':
        this.cupoDisponible = diaSeleccionado.cupoManana;
        break;
      case 'tarde':
        this.cupoDisponible = diaSeleccionado.cupoTarde;
        break;
      case 'noche':
        this.cupoDisponible = diaSeleccionado.cupoNoche;
        break;
    }
  }


  asignarPaseo() {
    if (this.formularioPaseo.invalid) {
      Swal.fire('Advertencia', 'Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    // Obtenemos los datos del formulario
    // const paseo: Paseo = this.formularioPaseo.value;

    // Obtenemos los IDs de perros seleccionados desde el formulario
    const idsPerros: number[] = this.formularioPaseo.get('idsPerros')?.value || [];
    // console.log(idsPerros);
    if (idsPerros.length === 0) {
      Swal.fire('Advertencia', 'Debes seleccionar al menos un perro', 'warning');
      return;
    }

    let idUsuario: number = 0;
    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(datosDesencriptados);
    const usuario = JSON.parse(datosDesencriptados);
    idUsuario = usuario.idUsuario;

    // Construcción manual del objeto Paseo
    const _paseo: Paseo = {
      idPaseo: 0,
      idUsuarioPasador: this.formularioPaseo.value.idUsuarioPasador,
      idUsuarioCliente: idUsuario,
      idTarifa: this.formularioPaseo.value.idTarifa,
      turno: this.formularioPaseo.value.turno,
      fecha: this.formularioPaseo.value.fecha ?? new Date(),


    };
    // console.log(_paseo);
    // Llamamos al servicio para guardar
    let todaSemana = this.formularioPaseo.value.todaSemana;
    // console.log(todaSemana);
    if (todaSemana == true) {
      this.paseoService.guardarSemana(_paseo, idsPerros).subscribe({
        next: (resp) => {
          // console.log(resp);
          if (resp.status) {
            Swal.fire('Éxito', 'Paseo asignado correctamente', 'success');
            this.formularioPaseo.reset();
            this.perrosSeleccionados = [];
            this.listaDiasPasador = [];
            this.paseadorSeleccionado = false;
          } else {
            Swal.fire('Error', resp.msg, 'error');
          }
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo asignar el paseo', 'error');
          console.error(err);
        }
      });
    } else {
      this.paseoService.guardar(_paseo, idsPerros).subscribe({
        next: (resp) => {
          if (resp.status) {
            Swal.fire('Éxito', 'Paseo asignado correctamente', 'success');
            this.formularioPaseo.reset();
            this.perrosSeleccionados = [];
            this.listaDiasPasador = [];
            this.paseadorSeleccionado = false;
          } else {
            Swal.fire('Error', resp.msg, 'error');
          }
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo asignar el paseo', 'error');
          console.error(err);
        }
      });
    }

  }

}
