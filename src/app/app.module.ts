import { Injectable, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './Components/login/login.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { SharedModule } from './Reutilizable/shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDialogModule } from '@angular/material/dialog';

// import { AngularFireModule } from '@angular/fire';
// import { AngularFireDatabaseModule } from '@angular/fire/database';
// import { AngularFireAuth } from '@angular/fire/auth';
// import { AngularFireStorageModule } from '@angular/fire/storage';
// import { AngularFirestore } from '@angular/fire/firestore';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClientModule } from '@angular/common/http';
import { NuevosUsuariosComponent } from './Components/nuevos-usuarios/nuevos-usuarios.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { Subject } from 'rxjs';
import { SolicitarRestablecimientoComponent } from './Components/solicitar-restablecimiento/solicitar-restablecimiento.component';
import { RestablecerContrasenaComponent } from './Components/restablecer-contrasena/restablecer-contrasena.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
// import { ProductoCardComponent } from './Components/layout/Pages/producto-card/producto-card.component';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import 'moment/locale/es'; // esto es importante para toda mat-data-picker que son el selector de fecha para que quede en español
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MenuPresentacionComponent } from './Components/menu-presentacion/menu-presentacion.component';
import { PresentacionComponent } from './Components/presentacion/presentacion.component';
//import { MenuPresentacionComponent } from './Components/layout/Pages/menu-presentacion/menu-presentacion.component';
registerLocaleData(localeEs);
import { OAuthModule } from 'angular-oauth2-oidc';
import { ActivarCuentaComponent } from './Components/activar-cuenta/activar-cuenta.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SuccessPaymentComponent } from './Components/success-payment/success-payment.component';
import { ErrorPaymentComponent } from './Components/error-payment/error-payment.component';
import { PendientePaymentComponent } from './Components/pendiente-payment/pendiente-payment.component';
// import { MercadoPagoTransactionsPipe } from './Layout/Pages/mercado-pago-transactions.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { QRCodeModule } from 'angularx-qrcode';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';

@Injectable()
export class SpanishPaginatorIntl extends MatPaginatorIntl {
  // Observable to notify changes
  override changes = new Subject<void>();

  // Labels in Spanish
  override itemsPerPageLabel = 'Registros por página:';
  override nextPageLabel = 'Siguiente página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página'; // Spanish label for 'First page'
  override lastPageLabel = 'Última página'; // Spanish label for 'Last page'

  // Custom range label function
  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ): string => {
    if (length === 0) {
      return `Página 1 de 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Página ${page + 1} de ${amountPages}`;
  };
}

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@NgModule({
  declarations: [
    AppComponent,
    MenuPresentacionComponent,
    LoginComponent,
    LayoutComponent,
    NuevosUsuariosComponent,
    SolicitarRestablecimientoComponent,
    RestablecerContrasenaComponent,
    PresentacionComponent,
    ActivarCuentaComponent,
    SuccessPaymentComponent,
    ErrorPaymentComponent,
    PendientePaymentComponent,
    // MercadoPagoTransactionsPipe



  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatMomentDateModule,
    NgxDocViewerModule,
    NgxExtendedPdfViewerModule,
    MatDialogModule,
    MatMenuModule,
    HttpClientModule,
    CarouselModule.forRoot(),
    OAuthModule.forRoot(),
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
    FlexLayoutModule,
    MatTabsModule,
    QRCodeModule,
    MatChipsModule
    // AngularFireModule.initializeApp(environment.firebaseConfig),
    // AngularFireDatabaseModule,
    // AngularFireStorageModule,

  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: LOCALE_ID, useValue: 'es-ES' },//para que la fechas me la de en español
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
