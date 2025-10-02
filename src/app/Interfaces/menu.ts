export interface Menu {


  idMenu:number,
  nombre:string,
  icono:string,
  url:string,
  idMenuPadre:number;
  submenus?: Menu[];

  asociado?: number; // Propiedad opcional, dependiendo de tu API o datos
  esPadre: boolean;  // Nueva propiedad
}
