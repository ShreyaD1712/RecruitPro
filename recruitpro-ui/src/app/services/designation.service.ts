import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {

  private apiUrl = 'http://127.0.0.1:8000/designations';

  constructor(private http: HttpClient) { }

  // ==========================
  // Get All Designations
  // ==========================
  getDesignations(
    search: string = '',
    companyId: number | null = null,
    departmentId: number | null = null,
    sortBy: string = 'DesignationName',
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

    if (departmentId !== null) {
      params = params.set('department_id', departmentId);
    }

    return this.http.get<any>(`${this.apiUrl}/`, { params });

  }

  // ==========================
  // Get Designation By Id
  // ==========================
  getDesignationById(id: number): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}/${id}`);

  }

  // ==========================
  // Add Designation
  // ==========================
  addDesignation(data: any): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/`, data);

  }

  // ==========================
  // Update Designation
  // ==========================
  updateDesignation(
    id: number,
    data: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      data
    );

  }

  // ==========================
  // Delete Designation
  // ==========================
  deleteDesignation(id: number): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );

  }

}