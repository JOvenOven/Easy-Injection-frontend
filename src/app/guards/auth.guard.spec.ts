import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('AuthGuard - Protección Crítica de Autenticación', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'verifyToken', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockRoute = {
      queryParams: {},
      params: {},
      url: [],
      fragment: null,
      data: {},
      outlet: 'primary',
      component: null,
      routeConfig: null,
      root: {} as any,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      paramMap: {} as any,
      queryParamMap: {} as any,
      title: undefined
    };

    mockState = {
      url: '/dashboard',
      root: {} as any
    };

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Autenticación por Token', () => {
    it('debería crear el guard', () => {
      expect(guard).toBeTruthy();
    });

    it('debería permitir acceso con token válido', (done) => {
      const mockToken = 'valid-token-123';
      localStorage.setItem('authToken', mockToken);
      
      authService.getToken.and.returnValue(mockToken);
      authService.verifyToken.and.returnValue(of({ valid: true }));

      const result = guard.canActivate(mockRoute, mockState);

      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBeTrue();
          expect(authService.verifyToken).toHaveBeenCalled();
          done();
        });
      } else if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe(allowed => {
          expect(allowed).toBeTrue();
          expect(authService.verifyToken).toHaveBeenCalled();
          done();
        });
      }
    });

    it('debería denegar acceso sin token', () => {
      authService.getToken.and.returnValue(null);

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debería denegar acceso con token expirado', (done) => {
      const expiredToken = 'expired-token-123';
      localStorage.setItem('authToken', expiredToken);
      
      authService.getToken.and.returnValue(expiredToken);
      authService.verifyToken.and.returnValue(throwError({ status: 401, message: 'Token expirado' }));

      const result = guard.canActivate(mockRoute, mockState);

      if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe(allowed => {
          expect(allowed).toBeFalse();
          expect(authService.logout).toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          done();
        });
      }
    });

    it('debería denegar acceso con token inválido', (done) => {
      const invalidToken = 'invalid-token-123';
      localStorage.setItem('authToken', invalidToken);
      
      authService.getToken.and.returnValue(invalidToken);
      authService.verifyToken.and.returnValue(throwError({ status: 401 }));

      const result = guard.canActivate(mockRoute, mockState);

      if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe(allowed => {
          expect(allowed).toBeFalse();
          expect(authService.logout).toHaveBeenCalled();
          done();
        });
      }
    });
  });

  describe('Manejo de Query Parameters', () => {
    it('debería extraer token desde query params', () => {
      const tokenFromQuery = 'query-token-123';
      mockRoute.queryParams = { token: tokenFromQuery };
      mockState.url = '/dashboard?token=' + tokenFromQuery;

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBeTrue();
      expect(localStorage.getItem('authToken')).toBe(tokenFromQuery);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
    });

    it('debería manejar token de verificación de email', () => {
      const verificationToken = 'email-verify-token-456';
      mockRoute.queryParams = { token: verificationToken };
      mockState.url = '/verify-success?token=' + verificationToken;

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBeTrue();
      expect(localStorage.getItem('authToken')).toBe(verificationToken);
    });

    it('debería limpiar URL después de extraer token', () => {
      const tokenFromQuery = 'clean-url-token';
      mockRoute.queryParams = { token: tokenFromQuery };
      mockState.url = '/dashboard?token=' + tokenFromQuery;

      guard.canActivate(mockRoute, mockState);

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
    });
  });

  describe('Protección de Rutas', () => {
    it('debería proteger rutas de dashboard', () => {
      authService.getToken.and.returnValue(null);
      mockState.url = '/dashboard';

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debería proteger rutas de scans', () => {
      authService.getToken.and.returnValue(null);
      mockState.url = '/dashboard/new-scan';

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debería permitir acceso con verificación válida', (done) => {
      const validToken = 'valid-token';
      authService.getToken.and.returnValue(validToken);
      authService.verifyToken.and.returnValue(of({ valid: true, user: { id: '123' } }));

      const result = guard.canActivate(mockRoute, mockState);

      if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe(allowed => {
          expect(allowed).toBeTrue();
          done();
        });
      }
    });
  });

  describe('Manejo de Errores', () => {
    it('debería cerrar sesión en error de red', (done) => {
      const token = 'network-error-token';
      authService.getToken.and.returnValue(token);
      authService.verifyToken.and.returnValue(throwError({ error: 'Network error', status: 0 }));

      const result = guard.canActivate(mockRoute, mockState);

      if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe(allowed => {
          expect(allowed).toBeFalse();
          expect(authService.logout).toHaveBeenCalled();
          done();
        });
      }
    });

    it('debería manejar error del servidor durante verificación', (done) => {
      const token = 'server-error-token';
      authService.getToken.and.returnValue(token);
      authService.verifyToken.and.returnValue(throwError({ status: 500 }));

      const result = guard.canActivate(mockRoute, mockState);

      if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe(allowed => {
          expect(allowed).toBeFalse();
          expect(authService.logout).toHaveBeenCalled();
          done();
        });
      }
    });
  });
});
