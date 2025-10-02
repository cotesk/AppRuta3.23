import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { DashBoardComponent } from './Pages/dash-board/dash-board.component';
import { UsuarioComponent } from './Pages/usuario/usuario.component';
import { SharedModule } from '../../Reutilizable/shared/shared.module';
import { ModalUsuarioComponent } from './Modales/modal-usuario/modal-usuario.component';
import { CambiarImagenComponent } from './Modales/cambiar-imagen/cambiar-imagen.component';
import { BackupComponent } from './Pages/backup/backup.component';
import { ConfirmDialogComponent } from './Modales/confirm-dialog/confirm-dialog.component';
import { CambiarImagenUsuarioComponent } from './Modales/cambiar-imagen-usuario/cambiar-imagen-usuario.component';
import { ConfirmacionAnulacionComponent } from './Modales/confirmacion-anulacion/confirmacion-anulacion.component';
import { ModalTemporizadorComponent } from './Modales/modal-temporizador/modal-temporizador.component';
import { ImageDialogComponent } from './Modales/image-dialog/image-dialog.component';
import { ChangeInfoModalComponent } from './Modales/change-info-modal/change-info-modal.component';
import { ApiComponent } from './Pages/api/api.component';
import { VerImagenProductoModalComponent } from './Modales/ver-imagen-producto-modal/ver-imagen-producto-modal.component';
import { ModalCambioImagenUsuarioComponent } from './Modales/modal-cambio-imagen-usuario/modal-cambio-imagen-usuario.component';
import { LoadingModalComponent } from './Modales/loading-modal/loading-modal.component';
import { EmpresaComponent } from './Pages/empresa/empresa.component';
import { ModalEmpresaComponent } from './Modales/modal-empresa/modal-empresa.component';
import { CambiarImagenEmpresaComponent } from './Modales/cambiar-imagen-empresa/cambiar-imagen-empresa.component';
import { NotificacionesDialogComponent } from './Modales/notificaciones-dialog/notificaciones-dialog.component';
import { MenuComponent } from './Pages/menu/menu.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CajaComponent } from './Pages/caja/caja.component';
import { ModalAbrirCajaComponent } from './Modales/modal-abrir-caja/modal-abrir-caja.component';
import { ColoresComponent } from './Pages/colores/colores.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ContenidoComponent } from './Pages/contenido/contenido.component';
import { ModalContenidoComponent } from './Modales/modal-contenido/modal-contenido.component';
import { CambiarImagenContenidoComponent } from './Modales/cambiar-imagen-contenido/cambiar-imagen-contenido.component';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { LicenciaComponent } from './Pages/licencias/licencias.component';
import { ModalPrestamosComponent } from './Modales/modal-prestamos/modal-prestamos.component';
import { ModalListaClientesComponent } from './Modales/modal-lista-clientes/modal-lista-clientes.component';
import { TarifaComponent } from './Pages/tarifa/tarifa.component';
import { PagosComponent } from './Pages/pagos/pagos.component';
import { AsignarPaseosComponent } from './Pages/asignar-paseos/asignar-paseos.component';
import { AsignarDiaPaseadorComponent } from './Pages/asignar-dia-paseador/asignar-dia-paseador.component';
import { ModalPerroComponent } from './Modales/modal-perro/modal-perro.component';
import { ModalTarifaComponent } from './Modales/modal-tarifa/modal-tarifa.component';
import { ModalAsignarDiaPaseadorComponent } from './Modales/modal-asignar-dia-paseador/modal-asignar-dia-paseador.component';
import { PerroComponent } from './Pages/perro/perro.component';
import { PerfilPerrosComponent } from './Pages/perfil-perros/perfil-perros.component';
import { HistorialPaseoComponent } from './Pages/historial-paseo/historial-paseo.component';
import { HistorialPagosComponent } from './Pages/historial-pagos/historial-pagos.component';


@NgModule({
  declarations: [
    DashBoardComponent,
    UsuarioComponent,
    ModalUsuarioComponent,
    CambiarImagenComponent,
    BackupComponent,
    ConfirmDialogComponent,
    CambiarImagenUsuarioComponent,
    ConfirmacionAnulacionComponent,
    ModalTemporizadorComponent,
    ImageDialogComponent,
    ChangeInfoModalComponent,
    ApiComponent,
    VerImagenProductoModalComponent,
    ModalCambioImagenUsuarioComponent,
    LoadingModalComponent,
    EmpresaComponent,
    ModalEmpresaComponent,
    CambiarImagenEmpresaComponent,
    NotificacionesDialogComponent,
    MenuComponent,
    CajaComponent,
    ModalAbrirCajaComponent,
    ColoresComponent,
    ContenidoComponent,
    ModalContenidoComponent,
    CambiarImagenContenidoComponent,
    LicenciaComponent,
    ModalPrestamosComponent,
    ModalListaClientesComponent,
    TarifaComponent,
    PagosComponent,
    AsignarPaseosComponent,
    AsignarDiaPaseadorComponent,
    ModalPerroComponent,
    ModalTarifaComponent,
    ModalAsignarDiaPaseadorComponent,
    PerroComponent,
    PerfilPerrosComponent,
    HistorialPaseoComponent,
    HistorialPagosComponent
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    SharedModule,
    MatTooltipModule,
    CarouselModule.forRoot(),
    MatStepperModule,
    NgxExtendedPdfViewerModule
  ],
})
export class LayoutModule { }
