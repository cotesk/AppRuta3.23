import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-payment',
  templateUrl: './error-payment.component.html',
  styleUrl: './error-payment.component.css'
})
export class ErrorPaymentComponent {
  constructor(
    private router: Router,
  ) {}

  closeDialog(): void {

    this.router.navigate(['/menu/cards']);
  }
}
