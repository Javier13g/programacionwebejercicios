import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  private readonly http = inject(HttpClient);

  /**
   * POST /auth/forgot-password-sms { telefono }
   * El backend genera un código numérico de 6 dígitos y lo envía por SMS
   * (vía Twilio) al teléfono del empleado si pertenece a uno activo.
   *
   * El endpoint SIEMPRE devuelve 200 con el mismo mensaje: el backend no
   * revela si el teléfono existe (anti-enumeración).
   */
  forgotPasswordSms(telefono: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/forgot-password-sms', {
      telefono
    });
  }

  /**
   * POST /auth/reset-password-sms { telefono, codigo, newPassword }
   * Devuelve 200 si el código es correcto y la contraseña se cambió.
   * Devuelve 400 si el código es inválido, expiró, ya fue usado, o se
   * agotaron los intentos permitidos.
   */
  resetPasswordByCode(
    telefono: string,
    codigo: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/reset-password-sms', {
      telefono,
      codigo,
      newPassword
    });
  }
}
