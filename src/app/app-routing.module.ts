import { NuevosUsuariosComponent } from './Components/nuevos-usuarios/nuevos-usuarios.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { AuthLoginGuard } from './Services/auth-login.guard';
import { LayoutComponent } from './Components/layout/layout.component';
// import { ProductoCardComponent } from './Components/layout/Pages/producto-card/producto-card.component';
import { SolicitarRestablecimientoComponent } from './Components/solicitar-restablecimiento/solicitar-restablecimiento.component';
import { RestablecerContrasenaComponent } from './Components/restablecer-contrasena/restablecer-contrasena.component';
import { MenuPresentacionComponent } from './Components/menu-presentacion/menu-presentacion.component';
import { PresentacionComponent } from './Components/presentacion/presentacion.component';
import { ActivarCuentaComponent } from './Components/activar-cuenta/activar-cuenta.component';
import { SuccessPaymentComponent } from './Components/success-payment/success-payment.component';
import { ErrorPaymentComponent } from './Components/error-payment/error-payment.component';
//import { MenuPresentacionComponent } from './Components/layout/Pages/menu-presentacion/menu-presentacion.component';
// import { ConsultarCompraOnlineComponent } from './Components/layout/Pages/consultar-compra-online/consultar-compra-online.component';
import { PendientePaymentComponent } from './Components/pendiente-payment/pendiente-payment.component';
// import { MercadoPagoCompraOnlineComponent } from './Components/layout/Pages/mercado-pago-compra-online/mercado-pago-compra-online.component';
// import { ConsultarVentasComponent } from './Components/layout/Pages/consultar-ventas/consultar-ventas.component';
import { LicenciaComponent } from './Components/layout/Pages/licencias/licencias.component';
import { ConsultarPagosComponent } from './Components/layout/Pages/consultar-pagos/consultar-pagos.component';
import { PerfilesPaseadoresComponent } from './Components/layout/Pages/perfiles-paseadores/perfiles-paseadores.component';
import { PerfilesTarifasComponent } from './Components/layout/Pages/perfiles-tarifas/perfiles-tarifas.component';
const routes: Routes = [


  { path: "", component: LoginComponent, pathMatch: "full" },
  //  { path: 'pages/cards', component: ProductoCardComponent, pathMatch: "full" },
  // { path: 'solicitar-restablecimiento', component: SolicitarRestablecimientoComponent, pathMatch: "full" },
  { path: 'login', component: LoginComponent },
  // { path: 'nuevosUsuarios', component: NuevosUsuariosComponent},
  { path: 'activar-cuenta', component: ActivarCuentaComponent },
  { path: 'restablecer-contrasena', component: RestablecerContrasenaComponent },
  { path: 'pago-exitoso', component: SuccessPaymentComponent },
  { path: 'pago-cancelado', component: ErrorPaymentComponent },
  { path: 'pago-pendiente', component: PendientePaymentComponent },
    { path: 'licencias', component: LicenciaComponent },
  //funcional
  {
    path: "menu",
    component: MenuPresentacionComponent,
    children: [
      { path: "", redirectTo: "cards", pathMatch: "full" },
      // { path: "cards", component: ProductoCardComponent },
      { path: "presentacion", component: PresentacionComponent },
      
      // { path: "", redirectTo: "consultar_Abonos", pathMatch: "full" },
      // { path: "", redirectTo: "consultar_Compra_Online", pathMatch: "full" },
      // { path: "consultar_Compra_Online", component: ConsultarCompraOnlineComponent },
      // { path: "consultar_Compra_Online", component: MercadoPagoCompraOnlineComponent },
        { path: "consultar_Pagos", component: ConsultarPagosComponent },
        { path: "perfiles_paseador", component: PerfilesPaseadoresComponent },
         { path: "perfiles_tarifas", component: PerfilesTarifasComponent },
    ]
  },
  {
    path: 'pages', loadChildren: () => import("./Components/layout/layout.module").then(m => m.LayoutModule),
    canActivate: [AuthLoginGuard],
  },

  { path: '**', redirectTo: 'login' },
  // { path: 'preview/:id', component: PreviewComponent, pathMatch: 'full' },
  // {path:'pages',loadChildren:()=>import("./Components/layout/layout.module").then(m => m.LayoutModule)},
  //  {path:'**',redirectTo:'login',pathMatch:"full"},




];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
