
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { LayoutComponent } from './layout.component';
import { DashBoardComponent } from './Pages/dash-board/dash-board.component';
import { UsuarioComponent } from './Pages/usuario/usuario.component';


import { BackupComponent } from './Pages/backup/backup.component';

import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ApiComponent } from './Pages/api/api.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { AuthLoginGuard } from '../../Services/auth-login.guard';

import { ModalUsuarioComponent } from './Modales/modal-usuario/modal-usuario.component';
import { EmpresaComponent } from './Pages/empresa/empresa.component';
import { MenuComponent } from './Pages/menu/menu.component';
import { CajaComponent } from './Pages/caja/caja.component';
import { ColoresComponent } from './Pages/colores/colores.component';

import { ContenidoComponent } from './Pages/contenido/contenido.component';

// import { CartComponent } from './Pages/cart/cart.component';

// import { MenuPresentacionComponent } from './Pages/menu-presentacion/menu-presentacion.component';
import { NotificacionesDialogComponent } from './Modales/notificaciones-dialog/notificaciones-dialog.component';
import { SuccessPaymentComponent } from '../success-payment/success-payment.component';
import { PerroComponent } from './Pages/perro/perro.component';
import { PerfilPerrosComponent } from './Pages/perfil-perros/perfil-perros.component';
import { TarifaComponent } from './Pages/tarifa/tarifa.component';
import { AsignarDiaPaseadorComponent } from './Pages/asignar-dia-paseador/asignar-dia-paseador.component';
import { AsignarPaseosComponent } from './Pages/asignar-paseos/asignar-paseos.component';
import { HistorialPagosComponent } from './Pages/historial-pagos/historial-pagos.component';
import { HistorialPaseoComponent } from './Pages/historial-paseo/historial-paseo.component';
import { MisPaseosComponent } from './Pages/mis-paseos/mis-paseos.component';
import { PagosComponent } from './Pages/pagos/pagos.component';


const routes: Routes = [{

  path: "",
  component: LayoutComponent,
  canActivate: [AuthLoginGuard],
  children: [

    { path: 'dashboard', component: DashBoardComponent },
    { path: 'usuarios', component: UsuarioComponent, },
    { path: 'backup', component: BackupComponent },
    { path: 'api', component: ApiComponent },
    { path: 'usuarios', component: UsuarioComponent },
    { path: 'empresa', component: EmpresaComponent },
    { path: 'menu', component: MenuComponent },
    { path: 'caja', component: CajaComponent },
    { path: 'colores', component: ColoresComponent },
    { path: 'contenido', component: ContenidoComponent },
    { path: 'perros', component: PerroComponent },
    { path: 'Perfil_perros', component: PerfilPerrosComponent },
    { path: 'tarifas', component: TarifaComponent },
    { path: 'Asignar_dias', component: AsignarDiaPaseadorComponent },
    { path: 'paseos', component: AsignarPaseosComponent },
    { path: 'Historial_paseos', component: HistorialPaseoComponent },
    { path: 'historial_pagos', component: HistorialPagosComponent },
    { path: 'estado_paseos', component: MisPaseosComponent },
    { path: 'pagos', component: PagosComponent },



  ]

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
