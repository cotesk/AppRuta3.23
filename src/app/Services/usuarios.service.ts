
import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Observable, of, observable, Subject, throwError } from "rxjs";
import { environment } from '../environments/environment';
import { ReponseApi } from '../Interfaces/reponse-api';
import { Usuario } from '../Interfaces/usuario';
import { Login } from '../Interfaces/login';
import { catchError, map, tap } from "rxjs/operators";
import { AuthConfig, OAuthService } from "angular-oauth2-oidc";

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" })
};


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private isDocenteLoggedIn;
  isDocente = new Subject<boolean>();


  private urlApi: string = environment.endpoint + "Usuario/"
  private contra: string = environment.endpoint + "Usuario"

  private usuario: Usuario = {};

  constructor(private http: HttpClient, private oauthService: OAuthService,) {
    this.isDocenteLoggedIn = false;
    // this.configureOAuth();
  }



  // iniciarSesionChatGpt(request: any) {
  //   const url = `${this.apiUrl}/Usuario/IniciarSesion`;
  //   return this.http.post(url, request);
  // }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error('No se encontró un token JWT en el almacenamiento local.');
      throw new Error('No se encontró un token JWT en el almacenamiento local.');
    }
    return new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    });
  }
  private getHeaders2(): HttpHeaders {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error('No se encontró un token JWT en el almacenamiento local.');
      throw new Error('No se encontró un token JWT en el almacenamiento local.');
    }
    return new HttpHeaders({

      "Authorization": `Bearer ${token}`
    });
  }

  iniciarSesion(request: Login): Observable<ReponseApi> {
    return this.http.post<ReponseApi>(`${this.urlApi}IniciarSesion`, request)
      .pipe(
        catchError(error => {
          // Manejo de errores
          console.error('Error en la solicitud de inicio de sesión:', error);
          return throwError(error);
        })
      );
  }

  // registerFromGoogle(nombre: string, correo: string): Observable<any> {
  //   return this.http.post(`${this.urlApi}RegisterFromGoogle`, { nombreCompleto: nombre, correo: correo });
  // }

  // loginWithGoogle(correo: string): Observable<any> {
  //   return this.http.post(`${this.urlApi}LoginWithGoogle`, { correo: correo });
  // }
  obtenerUsuarioPorId(idUsuario: number): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}ObtenerUsuarioPorId/${idUsuario}`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  getClaveSecreta(): Observable<{ claveSecreta: string }> {
    const headers = this.getHeaders();
    return this.http.get<{ claveSecreta: string }>(`${this.contra}`, { headers: headers });
  }

  obtenerUsuarioPorcorreo(correo: string): Observable<ReponseApi> {

    return this.http.get<any>(`${this.urlApi}ObtenerUsuarioPorcorreo/${correo}`).pipe(
      catchError(this.handleError)
    );
  }
  renovarToken(refreshToken: string): Observable<any> {
    const refreshTokenDto = { refreshToken: refreshToken };

    return this.http.post<any>(`${this.urlApi}RenovarToken`, refreshTokenDto).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    return throwError('Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo más tarde.');
  }


  lista(): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}Lista`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  listaUsuario(): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.urlApi}ListaUsuarios`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerImagenUsuario(idUsuario: number): Observable<any> {
    const url = `${this.urlApi}imagen/${idUsuario}`;
    return this.http.get<any>(url);
  }

  listaPaginada(page: number = 1, pageSize: number = 5, searchTerm: string = ''): Observable<any> {
    const url = `${this.urlApi}ListaPaginada?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
  listaPaginadaCliente(page: number = 1, pageSize: number = 5, searchTerm: string = ''): Observable<any> {
    const url = `${this.urlApi}ListaPaginadaCliente?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  guardar(request: Usuario): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.post<ReponseApi>(`${this.urlApi}Guardar`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }
  guardar2(request: Usuario): Observable<ReponseApi> {
    // const headers = this.getHeaders();
    return this.http.post<ReponseApi>(`${this.urlApi}GuardarNuevo`, request,).pipe(
      catchError(this.handleError)
    );
  }
  editar(request: Usuario): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.put<ReponseApi>(`${this.urlApi}Editar`, request, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<ReponseApi> {
    const headers = this.getHeaders();
    return this.http.delete<ReponseApi>(`${this.urlApi}Eliminar/${id}`, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  exportarProductos(): Observable<Blob> {
    const headers = this.getHeaders(); // Añadir headers
    return this.http.get(`${this.urlApi}exportar-usuarios`, { headers: headers, responseType: 'blob' }).pipe(
      catchError(this.handleError) // Manejar errores
    );
  }

  // Método para importar productos
  importarProductos(file: File): Observable<any> {
    const headers = this.getHeaders2(); // Añadir headers
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.urlApi}importar-usuarios`, formData, { headers: headers, responseType: 'text' }).pipe(
      catchError(this.handleError) // Manejar errores
    );
  }


  actualizarImagenProducto(idUsuario: number, nuevaImagen: File): Observable<ReponseApi> {

    console.log('ID del Usuario en actualizarImagenUsuario:', idUsuario);

    const formData = new FormData();
    formData.append('imagen', nuevaImagen);

    const headers = this.getHeaders2();

    return this.http.post<ReponseApi>(`${this.urlApi}ActualizarImagen/${idUsuario}`, formData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al actualizar la imagen del usuario:', error);
          return throwError('Error al actualizar la imagen del usuario. Inténtelo de nuevo más tarde.');
        })
      );

  }

  recuperarContraseña(correo: string): Observable<any> {
    return this.http.post<any>(`${this.urlApi}RecuperarContraseña`, { correo }, httpOptions).pipe(
      catchError(error => {
        console.error('Error en la solicitud de recuperación de contraseña:', error);
        return throwError(error);
      })
    );
  }
  activarCuenta(correo: string): Observable<any> {
    return this.http.post<any>(`${this.urlApi}ActivarUsuario`, { correo }, httpOptions).pipe(
      catchError(error => {
        console.error('Error en la solicitud de recuperación de contraseña:', error);
        return throwError(error);
      })
    );
  }
  solicitarRestablecimientoContrasena(email: string): Observable<any> {
    return this.http.post(`${this.urlApi}SolicitarRestablecimientoContrasena`, { correo: email });
  }

  restablecerContrasena(correo: string, token: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(`${this.urlApi}RestablecerContrasena`, { correo, token, nuevaContrasena });
  }

  activacion(correo: string, token: string, codigo: string): Observable<any> {
    return this.http.post(`${this.urlApi}Activacion`, { correo, token, codigo });
  }
  //  actualizarImagenProducto(idUsuario: number, nuevaImagen: File): Observable<ReponseApi> {
  //   console.log('ID del Usuario en actualizarImagenUsuario:', idUsuario);

  //   const formData = new FormData();
  //   formData.append('imagen', nuevaImagen);

  //   return this.http.post<ReponseApi>(`${this.urlApi}ActualizarImagen/${idUsuario}`, formData);
  // }

  decodeBase64ToImageUrl(base64String: string): string {
    const bytes = atob(base64String);
    const arrayBuffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      arrayBuffer[i] = bytes.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: 'image/png' });
    return URL.createObjectURL(blob);
  }

  //LoginGoogle
  private authConfig: AuthConfig = {

    clientId: '1006953044303-6prugfbs5utmmsuiefakv403p28l34h9.apps.googleusercontent.com',
    redirectUri: 'http://localhost:4200/pages', // Ajusta según tu redirección
    scope: 'openid profile email',
    issuer: 'https://accounts.google.com',
    responseType: 'code', // Tipo de respuesta, asegúrate de que sea compatible con tu flujo
    requireHttps: true, // Cambia a false si estás desarrollando localmente sin HTTPS
  };


  loginWithGoogle() {
    this.oauthService.initImplicitFlow();
  }

  logout() {
    this.oauthService.logOut();
  }



  // Obtener los datos del usuario autenticado
  get identityClaims() {
    return this.oauthService.getIdentityClaims();
  }

  // Método adicional para obtener el token y enviarlo al backend
  getToken() {
    return this.oauthService.getAccessToken()
  }

  private configureOAuth() {
    this.oauthService.configure(this.authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    fetch(`${this.authConfig.issuer}/.well-known/openid-configuration`)
      .then(response => response.json())
      .then(config => {
        console.log("Configuración de OpenID:", config);
        this.oauthService.loadDiscoveryDocumentAndTryLogin()
          .then(() => {
            console.log('Tokens cargados:', this.oauthService.getAccessToken());
            if (this.oauthService.hasValidAccessToken()) {
              console.log("Access token válido.");
              this.handleLogin();
            } else {
              console.log("No hay un access token válido.");
            }
          })
          .catch(err => {
            console.error("Error durante la carga del documento de descubrimiento:", err);
          });
      })
      .catch(err => {
        console.error('Error al obtener el documento de descubrimiento:', err);
      });
  }

  handleLogin() {
    // Verificar si se ha obtenido el access_token
    const accessToken = this.oauthService.getAccessToken();
    console.log('Access Token:', accessToken);
    if (accessToken) {
      // Cargar el perfil del usuario solo si hay un access_token
      this.oauthService.loadUserProfile().then(user => {
        console.log('Perfil de usuario cargado:', user);
        // Aquí puedes enviar el token al backend
        this.http.post(`${this.urlApi}login-google`, { token: accessToken })
          .subscribe(response => {
            console.log('Usuario registrado o verificado:', response);
          });
      }).catch(err => {
        console.error("Error al cargar el perfil del usuario:", err);
      });
    } else {
      console.error("No se encontró el access_token.");
    }
  }



  //Fin Google



  //Desde abajo



  // lista(): Observable<ReponseApi> {

  //   return this.http.get<ReponseApi>(`${this.urlApi}Lista`)
  // }

  // guardar(request: Usuario): Observable<ReponseApi> {

  //   return this.http.post<ReponseApi>(`${this.urlApi}Guardar`, request)

  // }
  // editar(request: Usuario): Observable<ReponseApi> {

  //   return this.http.put<ReponseApi>(`${this.urlApi}Editar`, request)

  // }

  // eliminar(id: number): Observable<ReponseApi> {

  //   return this.http.delete<ReponseApi>(`${this.urlApi}Eliminar/${id}`)

  // }

  // actualizarImagenProducto(idUsuario: number, nuevaImagen: File): Observable<ReponseApi> {
  //   console.log('ID del Usuario en actualizarImagenUsuario:', idUsuario);

  //   const formData = new FormData();
  //   formData.append('imagen', nuevaImagen);

  //   return this.http.post<ReponseApi>(`${this.urlApi}ActualizarImagen/${idUsuario}`, formData);
  // }







}
