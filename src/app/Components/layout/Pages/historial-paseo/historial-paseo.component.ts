import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Paseo } from '../../../../Interfaces/paseo';
import { PaseoService } from '../../../../Services/paseo.service';
import { UtilidadService } from '../../../../Reutilizable/utilidad.service';
import { MatDialog } from '@angular/material/dialog';
import { PaseadorDiaService } from '../../../../Services/paseadorDia.service';
import { UsuariosService } from '../../../../Services/usuarios.service';
import { AsignarPaseosComponent } from '../asignar-paseos/asignar-paseos.component';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-historial-paseo',
  templateUrl: './historial-paseo.component.html',
  styleUrl: './historial-paseo.component.css'
})
export class HistorialPaseoComponent {

  paseos: any[] = [];
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';


  constructor(
    private fb: FormBuilder,
    private paseoService: PaseoService,
    private dialog: MatDialog,
    private _diasServicio: PaseadorDiaService,
    private _utilidadServicio: UtilidadService,
    private _usuarioServicio: UsuariosService,

  ) { }



  ngOnInit(): void {


    let idUsuario: number = 0;
    // Obtener el idUsuario del localStorage
    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(datosDesencriptados);
    const usuario = JSON.parse(datosDesencriptados);
    idUsuario = usuario.idUsuario;

    this.paseoService.obtenerPorCliente(idUsuario).subscribe(resp => {
      if (resp.status) {
        // console.log(resp.value);
        this.paseos = resp.value;
      }
    });
  }

  editarPaseo(paseo: any) {
    this.dialog.open(AsignarPaseosComponent, {
      width: '900px',
      data: { paseo }  // <-- pasa el paseo al modal
    }).afterClosed().subscribe(() => {
      this.ngOnInit(); // refrescar después de editar
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

  eliminarPaseo(paseo: any) {
    Swal.fire({
      title: '¿Eliminar paseo?',
      text: `Eliminar paseo del ${paseo.fecha} (${paseo.turno})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.paseoService.eliminar(paseo.idPaseo).subscribe(() => {
          Swal.fire('Eliminado', 'El paseo fue eliminado', 'success');
          this.ngOnInit(); // refrescar lista
        });
      }
    });
  }


}
