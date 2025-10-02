import { Component, OnInit } from '@angular/core';
import { Menu } from './../../../../Interfaces/menu';
import { MenuService } from './../../../../Services/menu.service';
import { Rol } from '../../../../Interfaces/rol';
import { RolService } from '../../../../Services/rol.service';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../../../Services/usuarios.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  menus: Menu[] = [];
  allMenus: Menu[] = [];
  selectedMenus: number[] = [];
  selectedMenus2: number[] = [];
  selectedRoleId: number | null = null;
  roles: Rol[] = [];
  private readonly CLAVE_SECRETA = '9P#5a^6s@Lb!DfG2@17#Co-Tes#07';
  selectedOperation: string = 'agregar';


  constructor(private rolService: RolService, private menuService: MenuService,
    private _usuarioServicio: UsuariosService,
  ) { }

  ngOnInit(): void {
    this.obtenerRoles();
    this.obtenerTodosLosMenus();
    this.procesarMenus();

  }



  onOperationChange(): void {
    // Limpiar selección al cambiar la operación
    this.selectedRoleId = null;
    this.selectedMenus = [];
    this.selectedMenus2 = [];
  }
  procesarMenus() {
    const idMenusPadre = new Set(this.allMenus.map(menu => menu.idMenuPadre));
    this.allMenus = this.allMenus.map(menu => ({
      ...menu,
      esPadre: idMenusPadre.has(menu.idMenu)
    }));
  }


  obtenerRoles(): void {
    this.rolService.lista().subscribe(response => {
      if (response.status) {
        this.roles = response.value;
      } else {
        console.error('Error al obtener los roles:', response.msg);
      }
    }, error => {
      console.error('Error al obtener los roles:', error);

      // Proceso adicional para obtener el usuario y renovar el token
      let idUsuario: number = 0;

      // Obtener el idUsuario del localStorage
      const usuarioString = localStorage.getItem('usuario');
      const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
      if (datosDesencriptados !== null) {
        const usuario = JSON.parse(datosDesencriptados);
        idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

        this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
          (usuario: any) => {

            console.log('Usuario obtenido:', usuario);
            let refreshToken = usuario.refreshToken

            // Manejar la renovación del token
            this._usuarioServicio.renovarToken(refreshToken).subscribe(
              (response: any) => {
                console.log('Token actualizado:', response.token);
                // Guardar el nuevo token de acceso en el almacenamiento local
                localStorage.setItem('authToken', response.token);
                this.obtenerRoles();
              },
              (error: any) => {
                console.error('Error al actualizar el token:', error);
              }
            );

          },
          (error: any) => {
            console.error('Error al obtener el usuario:', error);
          }
        );
      }
    });
  }



  obtenerMenusAsociados(): void {
    if (this.selectedRoleId !== null) {
      this.menuService.obtenerMenuRolesPorRol(this.selectedRoleId).subscribe(response => {
        if (response.status) {
          const menusAsociados = response.value;
          this.menus = menusAsociados;
          this.selectedMenus = this.menus.map(menu => menu.idMenu);
          this.selectedMenus2 =this.selectedMenus
        } else {
          console.error('Error al obtener los roles:', response.msg);
        }
      }, error => {
        console.error('Error al obtener los roles:', error);

        // Proceso adicional para obtener el usuario y renovar el token
        let idUsuario: number = 0;

        // Obtener el idUsuario del localStorage
        const usuarioString = localStorage.getItem('usuario');
        const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
        if (datosDesencriptados !== null) {
          const usuario = JSON.parse(datosDesencriptados);
          idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

          this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
            (usuario: any) => {

              console.log('Usuario obtenido:', usuario);
              let refreshToken = usuario.refreshToken

              // Manejar la renovación del token
              this._usuarioServicio.renovarToken(refreshToken).subscribe(
                (response: any) => {
                  console.log('Token actualizado:', response.token);
                  // Guardar el nuevo token de acceso en el almacenamiento local
                  localStorage.setItem('authToken', response.token);
                  this.obtenerMenusAsociados();
                },
                (error: any) => {
                  console.error('Error al actualizar el token:', error);
                }
              );

            },
            (error: any) => {
              console.error('Error al obtener el usuario:', error);
            }
          );
        }
      });

    }
  }

  obtenerTodosLosMenus(): void {
    console.log('Obteniendo todos los menús...');
    this.menuService.listaMenu().subscribe(response => {
      if (response.status) {
        //funcional
        // this.allMenus = response.value;
        this.allMenus = response.value.sort((a: Menu, b: Menu) => a.nombre.localeCompare(b.nombre));
        this.procesarMenus();
      } else {
        console.error('Error al obtener los roles:', response.msg);
      }
    }, error => {
      console.error('Error al obtener los roles:', error);

      // Proceso adicional para obtener el usuario y renovar el token
      let idUsuario: number = 0;

      // Obtener el idUsuario del localStorage
      const usuarioString = localStorage.getItem('usuario');
      const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
      if (datosDesencriptados !== null) {
        const usuario = JSON.parse(datosDesencriptados);
        idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

        this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
          (usuario: any) => {

            console.log('Usuario obtenido:', usuario);
            let refreshToken = usuario.refreshToken

            // Manejar la renovación del token
            this._usuarioServicio.renovarToken(refreshToken).subscribe(
              (response: any) => {
                console.log('Token actualizado:', response.token);
                // Guardar el nuevo token de acceso en el almacenamiento local
                localStorage.setItem('authToken', response.token);
                this.obtenerTodosLosMenus();
              },
              (error: any) => {
                console.error('Error al actualizar el token:', error);
              }
            );

          },
          (error: any) => {
            console.error('Error al obtener el usuario:', error);
          }
        );
      }
    });

  }



  toggleMenu(idMenu: number): void {
    const menu = this.allMenus.find(menu => menu.idMenu === idMenu);

    if (menu && !menu.esPadre) {
      if (this.selectedMenus.includes(idMenu)) {
        this.selectedMenus = this.selectedMenus.filter(menuId => menuId !== idMenu);
        // Desmarcar el padre si no tiene otros hijos seleccionados
        if (menu.idMenuPadre && !this.selectedMenus.some(m => this.allMenus.find(menu => menu.idMenu === m)?.idMenuPadre === menu.idMenuPadre)) {
          this.selectedMenus = this.selectedMenus.filter(menuId => menuId !== menu.idMenuPadre);
        }
      } else {
        this.selectedMenus.push(idMenu);
        // Marcar el padre
        if (menu.idMenuPadre && !this.selectedMenus.includes(menu.idMenuPadre)) {
          this.selectedMenus.push(menu.idMenuPadre);
        }
      }
    }
  }

  isMenuPadre(idMenu: number): boolean {
    return this.allMenus.some(menu => menu.idMenuPadre === idMenu);
  }


  estaMenuSeleccionado(idMenu: number): boolean {
    return this.selectedMenus.includes(idMenu);
  }
  estaMenuSeleccionado2(idMenu: number): boolean {
    return this.selectedMenus2.includes(idMenu);
  }

  onChangeRol(): void {
    this.obtenerMenusAsociados(); // Actualizar los menús asociados cuando cambia el rol seleccionado
  }
  deseleccionarTodos(tabla: number) {
    if (tabla === 0) {
      // Lógica para deseleccionar todos los checkboxes en la primera tabla
      this.allMenus.slice(0, this.allMenus.length / 2).forEach(menu => {
        this.selectedMenus =[];
      });
    } else if (tabla === 1) {
      // Lógica para deseleccionar todos los checkboxes en la segunda tabla
      this.allMenus.slice(this.allMenus.length / 2).forEach(menu => {
        this.selectedMenus =[];
      });
    }
  }

  // actualizarPermisos(): void {
  //   // Lógica para actualizar los permisos con los menús seleccionados
  //   if (this.selectedRoleId !== null) {
  //     // Obtener los menús seleccionados
  //     const menusSeleccionados = this.allMenus.filter(menu => this.selectedMenus.includes(menu.idMenu));

  //     // Llamar al servicio para actualizar los permisos
  //     this.menuService.actualizarPermisos(this.selectedRoleId, menusSeleccionados).subscribe(response => {
  //       if (response) {
  //         // Mostrar mensaje de éxito
  //         Swal.fire('Éxito', 'Permisos actualizados exitosamente.', 'success');
  //       } else {
  //         // Mostrar mensaje de error
  //         Swal.fire('Error', 'Error al actualizar permisos.', 'error');
  //       }
  //     });
  //   }
  // }

  // Método para agregar un permiso
  agregarPermiso(): void {

    const selectedMenusHijos = this.selectedMenus.filter(id => !this.isMenuPadre(id));
    if (selectedMenusHijos.length === 0) {
      Swal.fire('Error', 'Por favor selecciona al menos un menú hijo.', 'error');
      return;
    }

    // Verificar si se ha seleccionado al menos un menú
    if (this.selectedMenus.length === 0) {
      Swal.fire('Error', 'Por favor selecciona al menos un menú.', 'error');
      return;
    }
    // Verificar si se ha seleccionado un rol
    if (this.selectedRoleId === null) {
      Swal.fire('Error', 'Por favor selecciona un rol.', 'error');
      return;
    }

    if (this.selectedRoleId !== null) {
      const roleId = +this.selectedRoleId!;
      this.menuService.obtenerMenuRolesPorRol(roleId).subscribe(response => {
        if (response.status) {
          // Lógica para verificar nuevos permisos y confirmar la acción
          const nuevosPermisos = this.selectedMenus.filter(menuId => !response.value.map((menu: any) =>
            menu.idMenu).includes(menuId));
          if (nuevosPermisos.length > 0) {
            Swal.fire({
              title: 'Agregar permiso',
              text: '¿Está seguro de agregar el permiso?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Sí',
              cancelButtonColor: '#d33',
              cancelButtonText: 'Cancelar'
            }).then((result) => {
              if (result.isConfirmed) {
                // Agregar permisos si el usuario confirma la acción
                this.menuService.agregarPermiso(roleId, nuevosPermisos[0]).subscribe(agregarResponse => {
                  if (agregarResponse) {
                    Swal.fire('Éxito', 'Permiso agregado exitosamente.', 'success');
                    console.log('Permisos agregados exitosamente.');
                    // Limpiar selección
                    this.selectedRoleId = null;
                    this.selectedMenus = [];
                    this.selectedMenus2 = [];
                  } else {
                    // Swal.fire('Error', 'Error al agregar permisos.', 'error');
                    console.error('Error al agregar permisos.');
                    this.selectedRoleId = null;
                    this.selectedMenus = [];
                    this.selectedMenus2 = [];
                  }
                }, error => {
                  let idUsuario: number = 0;

                  // Obtener el idUsuario del localStorage
                  const usuarioString = localStorage.getItem('usuario');
                  const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
                  const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
                  if (datosDesencriptados !== null) {
                    const usuario = JSON.parse(datosDesencriptados);
                    idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

                    this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
                      (usuario: any) => {

                        console.log('Usuario obtenido:', usuario);
                        let refreshToken = usuario.refreshToken

                        // Manejar la renovación del token
                        this._usuarioServicio.renovarToken(refreshToken).subscribe(
                          (response: any) => {
                            console.log('Token actualizado:', response.token);
                            // Guardar el nuevo token de acceso en el almacenamiento local
                            localStorage.setItem('authToken', response.token);
                            this.agregarPermisos(roleId, nuevosPermisos);
                          },
                          (error: any) => {
                            console.error('Error al actualizar el token:', error);
                          }
                        );

                      },
                      (error: any) => {
                        console.error('Error al obtener el usuario:', error);
                      }
                    );
                  }



                });
              }
            });
          } else {
            // Swal.fire('Información', 'No hay nuevos permisos para agregar.', 'info');
            console.log('No hay nuevos permisos para agregar.');
            this.selectedRoleId = null;
            this.selectedMenus = [];
          }
        } else {
          // Swal.fire('Error', 'Error al obtener los permisos actuales.', 'error');
          console.error('Error al obtener los permisos actuales:', response.msg);
          this.selectedRoleId = null;
          this.selectedMenus = [];
        }
      }, error => {

        let idUsuario: number = 0;

        // Obtener el idUsuario del localStorage
        const usuarioString = localStorage.getItem('usuario');
        const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
        const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
        if (datosDesencriptados !== null) {
          const usuario = JSON.parse(datosDesencriptados);
          idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

          this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
            (usuario: any) => {

              console.log('Usuario obtenido:', usuario);
              let refreshToken = usuario.refreshToken

              // Manejar la renovación del token
              this._usuarioServicio.renovarToken(refreshToken).subscribe(
                (response: any) => {
                  console.log('Token actualizado:', response.token);
                  // Guardar el nuevo token de acceso en el almacenamiento local
                  localStorage.setItem('authToken', response.token);
                  this.agregarPermiso();
                },
                (error: any) => {
                  console.error('Error al actualizar el token:', error);
                }
              );

            },
            (error: any) => {
              console.error('Error al obtener el usuario:', error);
            }
          );
        }




      });
    }
  }

  agregarPermisos(roleId: number, nuevosPermisos: number[]) {


    this.menuService.agregarPermiso(roleId, nuevosPermisos[0]).subscribe(agregarResponse => {
      if (agregarResponse) {
        Swal.fire('Éxito', 'Permiso agregado exitosamente.', 'success');
        console.log('Permisos agregados exitosamente.');
        // Limpiar selección
        this.selectedRoleId = null;
        this.selectedMenus = [];
      } else {
        // Swal.fire('Error', 'Error al agregar permisos.', 'error');
        console.error('Error al agregar permisos.');
        this.selectedRoleId = null;
        this.selectedMenus = [];
      }
    }, error => {
      let idUsuario: number = 0;

      // Obtener el idUsuario del localStorage
      const usuarioString = localStorage.getItem('usuario');
      const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
      const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
      if (datosDesencriptados !== null) {
        const usuario = JSON.parse(datosDesencriptados);
        idUsuario = usuario.idUsuario; // Obtener el idUsuario del objeto usuario

        this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
          (usuario: any) => {

            console.log('Usuario obtenido:', usuario);
            let refreshToken = usuario.refreshToken

            // Manejar la renovación del token
            this._usuarioServicio.renovarToken(refreshToken).subscribe(
              (response: any) => {
                console.log('Token actualizado:', response.token);
                // Guardar el nuevo token de acceso en el almacenamiento local
                localStorage.setItem('authToken', response.token);
                this.agregarPermisos(roleId, nuevosPermisos);
              },
              (error: any) => {
                console.error('Error al actualizar el token:', error);
              }
            );

          },
          (error: any) => {
            console.error('Error al obtener el usuario:', error);
          }
        );
      }


    });
  }
  // Método para eliminar un permiso
  eliminarPermiso(): void {
    if (this.selectedRoleId !== null) {
      if (this.selectedMenus.length === 0) {
        Swal.fire('Error', 'No se ha seleccionado ningún menú para eliminar permisos.', 'error');
        return;
      }
      Swal.fire({
        title: 'Eliminar permiso',
        text: '¿Está seguro de eliminar el permiso?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Sí',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          const roleId = +this.selectedRoleId!;
          let permisosEliminados = 0;
          let permisosFallidos = 0;

          this.selectedMenus.forEach((menuId, index, array) => {
            this.menuService.eliminarPermiso(roleId, menuId).subscribe(response => {
              if (response) {
                permisosEliminados++;
              } else {
                permisosFallidos++;
              }

              // Mostrar el mensaje solo una vez, después de completar todas las eliminaciones
              if (index === array.length - 1) {
                if (permisosFallidos === 0) {
                  Swal.fire('Éxito', 'Permisos eliminados exitosamente.', 'success');
                } else {
                  Swal.fire('Advertencia', `Algunos permisos no se pudieron eliminar. Eliminados: ${permisosEliminados}, Fallidos: ${permisosFallidos}.`, 'warning');
                }

                // Limpiar selección
                this.selectedRoleId = null;
                this.selectedMenus = [];
                this.selectedMenus2 = [];
              }
            }, error => {
              permisosFallidos++;
              console.error('Error al eliminar permiso.', error);

              // Al final del ciclo, mostrar el mensaje si hay fallos
              if (index === array.length - 1) {
                Swal.fire('Advertencia', `Algunos permisos no se pudieron eliminar. Eliminados: ${permisosEliminados}, Fallidos: ${permisosFallidos}.`, 'warning');

                // Limpiar selección
                this.selectedRoleId = null;
                this.selectedMenus = [];
                this.selectedMenus2 = [];
              }

              // Manejo de errores y actualización de token, como ya lo tienes
              this.handleTokenRefresh();
            });
          });
        }
      });
    } else {
      this.selectedRoleId = null;
      this.selectedMenus = [];
    }
  }

  handleTokenRefresh() {
    let idUsuario: number = 0;

    const usuarioString = localStorage.getItem('usuario');
    const bytes = CryptoJS.AES.decrypt(usuarioString!, this.CLAVE_SECRETA);
    const datosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);

    if (datosDesencriptados !== null) {
      const usuario = JSON.parse(datosDesencriptados);
      idUsuario = usuario.idUsuario;

      this._usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe(
        (usuario: any) => {
          let refreshToken = usuario.refreshToken;

          this._usuarioServicio.renovarToken(refreshToken).subscribe(
            (response: any) => {
              localStorage.setItem('authToken', response.token);
              this.eliminar();
            },
            (error: any) => {
              console.error('Error al actualizar el token:', error);
            }
          );
        },
        (error: any) => {
          console.error('Error al obtener el usuario:', error);
        }
      );
    }
  }


  eliminar() {
    const roleId = +this.selectedRoleId!;
    let permisosEliminados = 0;
    let permisosFallidos = 0;

    this.selectedMenus.forEach((menuId, index, array) => {
      this.menuService.eliminarPermiso(roleId, menuId).subscribe(response => {
        if (response) {
          permisosEliminados++;
        } else {
          permisosFallidos++;
        }

        // Mostrar el mensaje solo una vez, después de completar todas las eliminaciones
        if (index === array.length - 1) {
          if (permisosFallidos === 0) {
            Swal.fire('Éxito', 'Permisos eliminados exitosamente.', 'success');
          } else {
            Swal.fire('Advertencia', `Algunos permisos no se pudieron eliminar. Eliminados: ${permisosEliminados}, Fallidos: ${permisosFallidos}.`, 'warning');
          }

          // Limpiar selección
          this.selectedRoleId = null;
          this.selectedMenus = [];
          this.selectedMenus2 = [];
        }
      }, error => {
        permisosFallidos++;
        console.error('Error al eliminar permiso.', error);

        // Al final del ciclo, mostrar el mensaje si hay fallos
        if (index === array.length - 1) {
          Swal.fire('Advertencia', `Algunos permisos no se pudieron eliminar. Eliminados: ${permisosEliminados}, Fallidos: ${permisosFallidos}.`, 'warning');

          // Limpiar selección
          this.selectedRoleId = null;
          this.selectedMenus = [];
          this.selectedMenus2 = [];
        }

        // Manejo de errores y actualización de token, como ya lo tienes
        this.handleTokenRefresh();
      });
    });
  }

  //original
  // eliminarPermiso(): void {
  //   if (this.selectedRoleId !== null) {
  //     // Eliminar permiso para todos los menús seleccionados
  //     this.selectedMenus.forEach(menuId => {
  //       this.menuService.eliminarPermiso(this.selectedRoleId!, menuId).subscribe(response => {
  //         if (response) {
  //           console.log('Permiso eliminado exitosamente.');
  //         } else {
  //           console.error('Error al eliminar permiso.');
  //         }
  //       });
  //     });
  //   }
  // }
}
