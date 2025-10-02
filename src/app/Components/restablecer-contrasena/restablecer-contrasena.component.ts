
import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UsuariosService } from '../../Services/usuarios.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-restablecer-contrasena',
  templateUrl: './restablecer-contrasena.component.html',
  styleUrl: './restablecer-contrasena.component.css'
})
export class RestablecerContrasenaComponent {
  restablecerForm: FormGroup;
  token: string | undefined;
  correo: string | undefined;
  message: string | undefined;
  ocultarPassword: boolean = true;
  passwordErrors: string[] = [];
  constructor(
    private fb: FormBuilder,
    private _usuario: UsuariosService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.restablecerForm = this.fb.group({
      // nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]]
      nuevaContrasena: ['', [
        Validators.required,
        this.primeraLetraMayusculaValidator(),
        this.contieneNumeroValidator(),
        this.longitudExactaValidator(6,15),
        this.caracterEspecialValidator()
      ]],
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    this.correo = this.route.snapshot.queryParams['correo'];
  }

  restablecerContrasena() {
    this._usuario.restablecerContrasena(this.correo!,this.token!, this.restablecerForm.value.nuevaContrasena).subscribe(response => {
      this.message = response.value;
      Swal.fire({
        icon: 'success',
        title: 'Ok',
        text: 'Se ha restablecido la contraseña.'
      });
      if (response.status) {
        this.router.navigate(['/login']);
      }
    });
  }

  onPasswordChange() {
    this.updatePasswordErrors();
  }
  updatePasswordErrors() {
    this.passwordErrors = [];
    const claveControl = this.restablecerForm.get('nuevaContrasena');

    if (claveControl?.hasError('required')) {
      this.passwordErrors.push('La contraseña es requerida.');
    }
    if (claveControl?.hasError('primeraLetraMayuscula')) {
      this.passwordErrors.push('La primera letra debe ser mayúscula.');
    }
    if (claveControl?.hasError('longitudIncorrecta')) {
      this.passwordErrors.push('La contraseña debe tener entre 6 y 15 caracteres.');
    }
    if (claveControl?.hasError('caracterEspecial')) {
      this.passwordErrors.push('La contraseña debe contener al menos un carácter especial.');
    }
    if (claveControl?.hasError('contieneNumero')) {
      this.passwordErrors.push('La contraseña debe contener al menos un número.');
    }
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

  longitudExactaValidator(minLength: number, maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const clave = control.value;
      if (typeof clave === 'string' && clave.length >= minLength && clave.length <= maxLength) {
        return null;
      }
      return { longitudIncorrecta: true };
    };
  }


}
