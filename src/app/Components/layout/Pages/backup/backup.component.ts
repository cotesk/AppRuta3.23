import Swal from 'sweetalert2';
import { BackupService } from './../../../../Services/backup.service';
import { Component } from '@angular/core';


@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
})
export class BackupComponent {
  constructor(private backupService: BackupService) { }

  private script: string | null = null;
  private restoringDatabase = false;
  private restoreSuccess = false;
  private restoreError = '';
  scriptData: FormData | null = null;

  generateAndDownloadScript() {
    this.backupService.generateSqlScript().subscribe((script: string) => {
      this.script = script; // Guarda el script generado
      this.downloadScript(script); // Descarga el script como archivo
    });
  }

  downloadScript(script: string) {
    const blob = new Blob([script], { type: 'text/sql' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      this.script = e.target?.result as string;
    };

    reader.readAsText(file);
  }

  restoreDatabase() {
    if (this.script) {
      const formData = new FormData();
      formData.append('scriptFile', new Blob([this.script], { type: 'text/sql' }), 'backup.sql');

      this.backupService.restoreDatabase(formData).subscribe(
        (response: string) => {
          console.log(response);
          // Mostrar mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Base de datos restaurada correctamente.',
          });
        },
        (error: any) => {
          console.error(error);
          // Mostrar mensaje de error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al restaurar la base de datos. Por favor, inténtalo de nuevo más tarde.',
          });
        }
      );
    } else {
      console.error("No se ha seleccionado ningún archivo de script.");
      // Mostrar mensaje de advertencia
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No se ha seleccionado ningún archivo de script.',
      });
    }
  }











}
