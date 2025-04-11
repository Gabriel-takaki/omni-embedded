import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from "./services/auth.service";
import {tap} from "rxjs/operators";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adiciona o token, quando disponível, a todas as requisições, exceto as para os conteúdos estáticos
    if (this.auth?.jwtToken && !request.url.includes('static') && !request.url.endsWith('/login')) {
      request = request.clone({
        setHeaders: {Authorization: `Bearer ${this.auth.jwtToken}`}
      });
    }

    return next.handle(request).pipe(tap(() => {
      },
      (err: any) => {
        if (err instanceof HttpErrorResponse && !request.url.endsWith('/login')) {
          if (err.status !== 401) {
            return;
          }
          this.auth.logout();
        }
      }));

  }

}
