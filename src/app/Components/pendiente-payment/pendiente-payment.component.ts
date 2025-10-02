import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pendiente-payment',
  templateUrl: './pendiente-payment.component.html',
  styleUrl: './pendiente-payment.component.css'
})
export class PendientePaymentComponent {
  constructor(
    private router: Router,
  ) {}

  closeDialog(): void {

    this.router.navigate(['/login']);
  }

}
