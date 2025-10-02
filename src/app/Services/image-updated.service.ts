// image-updated.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageUpdatedService {
  private imageUpdatedSource = new Subject<void>();

  imageUpdated$ = this.imageUpdatedSource.asObservable();

  nombreUsuario: string = "";
  rolUsuario: string = "";
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  imageData: Uint8Array | string = "";

  updateImage() {
    console.log('Notificando actualización de imagen');
    this.imageUpdatedSource.next();
  }

  actualizarImagenUsuario(): void {
    const usuarioEncriptado = localStorage.getItem('usuario');
    if (usuarioEncriptado) {
      try {
        const bytes = CryptoJS.AES.decrypt(usuarioEncriptado, this.CLAVE_SECRETA);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

        if (datosDesencriptados) {
          const usuario = JSON.parse(datosDesencriptados);
          this.nombreUsuario = usuario.nombreCompleto || '';
          this.rolUsuario = usuario.rolDescripcion || '';

          // Verifica si hay datos de imagen en el usuario desencriptado
          if (usuario.imageData) {
            console.log('Imagen en el almacenamiento local:', usuario.imageData);
            // Crear un nuevo elemento de imagen
            const img = new Image();

            // Cuando la imagen se carga correctamente, asigna la cadena base64 como src
            img.onload = () => {
              this.imageData = usuario.imageData; // Asigna la cadena base64 al campo de imagen en el componente
              console.log('Imagen cargada correctamente:', this.imageData); // Verifica si la imagen se cargó correctamente
            };

            // Cuando hay un error al cargar la imagen, muestra un mensaje de error
            img.onerror = () => {
              console.error('Error al cargar la imagen');
            };

            // Asignar la cadena base64 como src del elemento de imagen
            img.src = 'data:image/png;base64,' + usuario.imageData;
          } else {
            console.error('No se encontraron datos de imagen en el usuario desencriptado');
          }
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

  obtenerNuevaImagenUrl(): string {
    // Lógica para obtener la imagen almacenada desde el localStorage
    const imageData = localStorage.getItem('imagenUsuario');

    // Verificar si la imagen existe y si es una cadena base64
    if (imageData && imageData.startsWith('data:image')) {
      // La imagen ya es una URL, así que devolverla directamente
      return imageData;
    }

    // Si la imagen se almacena como un Uint8Array o Blob, conviértela a URL
    if (imageData) {
      const uint8Array = new Uint8Array(JSON.parse(imageData));
      const blob = new Blob([uint8Array], { type: 'image/png' });
      return URL.createObjectURL(blob);
    }

    // En caso de que no haya imagen, puedes proporcionar una URL de imagen por defecto
    return 'URL_POR_DEFECTO';
  }
}
