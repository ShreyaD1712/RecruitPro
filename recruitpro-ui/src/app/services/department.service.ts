import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private apiUrl = 'http://127.0.0.1:8000/departments';

  constructor(private http: HttpClient) { }

  // ==========================
  // Get All Departments
  // ==========================
  getDepartments(
    search: string = '',
    companyId: number | null = null,
    sortBy: string = 'DepartmentName',
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

    if (companyId !== null) {
      params = params.set('company_id', companyId);
    }

    return this.http.get<any>(`${this.apiUrl}/`, { params });
  }

  // ==========================
  // Get Department By Id
  // ==========================
  getDepartmentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ==========================
  // Add Department
  // ==========================
  addDepartment(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, data);
  }

  // ==========================
  // Update Department
  // ==========================
  updateDepartment(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // ==========================
  // Delete Department
  // ==========================
  deleteDepartment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

}