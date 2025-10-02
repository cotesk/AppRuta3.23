import { UsuariosService } from './../../Services/usuarios.service';
import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-solicitar-restablecimiento',
  templateUrl: './solicitar-restablecimiento.component.html',
  styleUrl: './solicitar-restablecimiento.component.css'
})
export class SolicitarRestablecimientoComponent {
  solicitudForm: FormGroup;
  mensaje: string | undefined;
  mensajeColor: string = 'green';

  constructor(private fb: FormBuilder, private usuarioService: UsuariosService) {
    this.solicitudForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  solicitarRestablecimiento() {

    if (this.solicitudForm.valid) {
      this.usuarioService.solicitarRestablecimientoContrasena(this.solicitudForm.value.correo).subscribe(response => {
        if (response.status) {
          this.mensaje = response.value;
          this.mensajeColor = 'green';
        } else {
          this.mensaje = response.msg;
          this.mensajeColor = 'red';
        }

        // Limpia el campo de correo después de 5 segundos
        setTimeout(() => {
          this.solicitudForm.reset();
          this.mensaje = undefined;
        }, 5000);

      }, error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al intentar solicitar el restablecimiento de contraseña.'
        });
        this.mensajeColor = 'red';
        // Limpia el campo de correo después de 5 segundos
        setTimeout(() => {
          this.solicitudForm.reset();
          this.mensaje = undefined;
        }, 5000);

      });
    }
  }


}
