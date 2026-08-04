import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/auth';

  constructor(private http: HttpClient) {}

  getUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  }
  getRoleId(): number{
    return this.getUser()?.role_id;
  } 
  getCompanyId(): number{
    return this.getUser()?.company_id;
  }
  
  login(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      data
    );
  }
}