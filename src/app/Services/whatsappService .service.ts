import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  constructor() { }

  enviarPorWhatsApp(pdfLink: string): void {
    // Abrir el enlace de WhatsApp
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(pdfLink)}`, '_blank');
  }
}
