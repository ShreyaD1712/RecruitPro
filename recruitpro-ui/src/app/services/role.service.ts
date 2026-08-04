import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private apiUrl = 'http://127.0.0.1:8000/roles';

  constructor(private http: HttpClient) { }

  // ==========================
  // Get All Roles
  // ==========================
  getRoles(
    search: string = '',
    sortBy: string = 'RoleId',
    order: string = 'asc',
    page: number = 1,
    pageSize: number = 10
  ): Observable<any> {

    let params = new HttpParams()
      .set('search', search)
      .set('sort_by', sortBy)
      .set('order', order)
      .set('page', page)
      .set('page_size', pageSize);

    return this.http.get<any>(`${this.apiUrl}/`, { params });

  }

  // ==========================
  // Get Role By Id
  // ==========================
  getRoleById(id: number): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}/${id}`);

  }

  // ==========================
  // Add Role
  // ==========================
  addRole(data: any): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/`, data);

  }

  // ==========================
  // Update Role
  // ==========================
  updateRole(
    id: number,
    data: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      data
    );

  }

  // ==========================
  // Delete Role
  // ==========================
  deleteRole(id: number): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );

  }

}