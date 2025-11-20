import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, User } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService - Funciones Críticas', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    _id: '123',
    username: 'testuser',
    email: 'test@example.com',
    fecha_registro: '2024-01-01',
    estado_cuenta: 'activo',
    email_verificado: true
  };

  const mockToken = 'mock-jwt-token-12345';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Autenticación', () => {
    it('debería crear el servicio', () => {
      expect(service).toBeTruthy();
    });

    it('debería hacer login exitosamente', (done) => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = {
        success: true,
        token: mockToken,
        user: mockUser
      };

      service.login(email, password).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.token).toBe(mockToken);
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockResponse);
    });

    it('debería manejar error de login', (done) => {
      service.login('wrong@example.com', 'wrong').subscribe(
        () => fail('debería haber fallado'),
        error => {
          expect(error.status).toBe(401);
          done();
        }
      );

      const req = httpMock.expectOne(`${environment.backendUrl}api/login`);
      req.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('debería hacer logout correctamente', () => {
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      service.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });

    it('debería verificar si el usuario está logueado', () => {
      expect(service.isLoggedIn()).toBeFalse();

      localStorage.setItem('authToken', mockToken);
      expect(service.isLoggedIn()).toBeTrue();
    });
  });

  describe('Gestión de Tokens', () => {
    it('debería verificar token válido', (done) => {
      localStorage.setItem('authToken', mockToken);
      const mockResponse = { valid: true, user: mockUser };

      service.verifyToken().subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/auth/verify`);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockResponse);
    });

    it('debería manejar token inválido', (done) => {
      localStorage.setItem('authToken', 'invalid-token');

      service.verifyToken().subscribe(
        () => fail('debería haber fallado'),
        error => {
          expect(error.status).toBe(401);
          done();
        }
      );

      const req = httpMock.expectOne(`${environment.backendUrl}api/auth/verify`);
      req.flush({ message: 'Token inválido' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Recuperación de Contraseña', () => {
    it('debería enviar solicitud de recuperación', (done) => {
      const email = 'test@example.com';
      const mockResponse = { success: true, message: 'Email enviado' };

      service.forgotPassword(email).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/auth/forgot-password`);
      expect(req.request.body).toEqual({ email });
      req.flush(mockResponse);
    });

    it('debería resetear contraseña con token válido', (done) => {
      const resetToken = 'valid-reset-token';
      const newPassword = 'newPassword123';
      const mockResponse = { success: true, message: 'Contraseña actualizada' };

      service.resetPassword(resetToken, newPassword).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}api/auth/reset-password`);
      expect(req.request.body).toEqual({ token: resetToken, newPassword });
      req.flush(mockResponse);
    });
  });
});

