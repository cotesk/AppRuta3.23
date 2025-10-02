
import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UsuariosService } from '../../Services/usuarios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-activar-cuenta',
  templateUrl: './activar-cuenta.component.html',
  styleUrl: './activar-cuenta.component.css'
})
export class ActivarCuentaComponent {

  token: string | undefined;
  correo: string | undefined;
  message: string | undefined;
  ocultarPassword: boolean = true;
  passwordErrors: string[] = [];
  formActivacion: FormGroup;
  constructor(
    private fb: FormBuilder,
    private _usuario: UsuariosService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formActivacion = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(10)]]
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    this.correo = this.route.snapshot.queryParams['correo'];
  }

  activarCuenta() {

    if (this.formActivacion.invalid) {
      this.formActivacion.markAllAsTouched();
      return;
    }
    const codigo = this.formActivacion.value.codigo;

    // console.log(this.token);
    // console.log(this.correo);
    // console.log(codigo);
    this._usuario.activacion(this.correo!, this.token!, codigo).subscribe(response => {
      this.message = response.value;
      console.log(response.value);

      if (response.status == true) {

        Swal.fire({
          icon: 'success',
          title: 'Ok',
          text: 'Se ha activado el usuario.'
        });

        this.router.navigate(['/login']);
      } else {
        if (response.status == false) {

          Swal.fire({
            icon: 'error',
            title: 'ERROR.',
            text: 'Su Token a expirado vuelva a solicitar un nuevo codigo de activacion.'
          });


        }
      }
    },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'ERROR!',
          text: 'Error al activar la cuenta.'
        });

      }


    );
  }



}
