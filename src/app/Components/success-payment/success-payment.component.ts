import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
// import { PayPalService } from '../../Services/PayPal.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-success-payment',
  templateUrl: './success-payment.component.html',
  styleUrls: ['./success-payment.component.css']
})
export class SuccessPaymentComponent implements OnInit {

  token: string | null = null;
  payerId: string | null = null;
  successMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    // private payPalService: PayPalService
  ) {}

  ngOnInit(): void {
    // Obtener parámetros de la URL de PayPal
    // const token = this.route.snapshot.queryParamMap.get('token');
    // const payerID = this.route.snapshot.queryParamMap.get('PayerID');
    this.token = this.route.snapshot.queryParams['token'];
    this.payerId = this.route.snapshot.queryParams['PayerID'];
    // Verificar si `token` y `PayerID` están presentes
    if (this.token && this.payerId) {
      // Realizar el proceso de captura del pago
         // Llamamos al servicio para confirmar el pago
        //  this.payPalService.confirmPayment(this.token!, this.payerId!).subscribe(
        //   (response) => {
        //     this.successMessage = response; // Guardamos el mensaje de éxito
        //     console.log('Pago confirmado:', this.successMessage);
        //     // La respuesta ahora es un texto
        //     // Swal.fire({
        //     //   title: 'Pago Confirmado',
        //     //   text: this.successMessage,
        //     //   icon: 'success',
        //     //   confirmButtonText: 'Aceptar'
        //     // });
        //   },
        //   (error) => {
        //     console.error('Error al confirmar el pago:', error);
        //   }
        // );
    }
    //  else {
    //   // Si los parámetros no están presentes, redirigir a una página o mostrar un mensaje
    //   alert('Parámetros inválidos. Redirigiendo...');
    //   this.router.navigate(['/error-page']); // Redirige a una página de error o como prefieras
    // }
  }




  // Método para cerrar el diálogo y redirigir
  closeDialog(): void {
    this.router.navigate(['/login']);
  }
}
