import { ChangeInfoModalComponent } from './../Components/layout/Modales/change-info-modal/change-info-modal.component';
import { Usuario } from './../Interfaces/usuario';
// change-info-modal.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class ChangeInfoModalService {
  constructor(private dialog: MatDialog) {}
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  abrirModal(): void {
    const usuarioEncriptado = localStorage.getItem('usuario');

    if (!usuarioEncriptado) {
      console.error('No se encontraron datos de usuario en el localStorage.');
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(usuarioEncriptado, this.CLAVE_SECRETA);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

      if (!datosDesencriptados) {
        console.error('Error al desencriptar los datos del usuario.');
        return;
      }

      const usuarioLocalStorage = JSON.parse(datosDesencriptados) as Usuario;

      const dialogRef = this.dialog.open(ChangeInfoModalComponent, {
        width: '400px',
        data: usuarioLocalStorage,
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('El modal se cerró');
        
        // Puedes realizar acciones adicionales después de que el modal se cierra
      });

    } catch (error) {
      console.error('Error al desencriptar los datos del usuario:', error);
    }
  }
}
