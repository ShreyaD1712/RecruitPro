import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/auth';

  constructor(private http: HttpClient) { }

  getUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  }
  getPermissions(): string[] {
    return this.getUser()?.permissions || [];
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  isSuperAdmin(): boolean {
    return this.getUser()?.is_super_admin;
  }

  getCompanyId(): number {
    return this.getUser()?.company_id;
  }
  getRoleId(): number {
    return this.getUser()?.role_id;
  }

  login(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      data
    );
  }
}