import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private apiUrl = 'http://127.0.0.1:8000/companies';

  constructor(private http: HttpClient) {}

  getCompanies(
    search: string = '',
    sortBy: string = '',
    order: string = 'asc',
    page: number = 1,
    pageSize: number = 1000
  ): Observable<any> {

    return this.http.get(

      `${this.apiUrl}?search=${search}&sort_by=${sortBy}&order=${order}&page=${page}&page_size=${pageSize}`

    );

  }

  getCompany(id: number): Observable<any> {

    return this.http.get(`${this.apiUrl}/${id}`);

  }

  addCompany(data: any): Observable<any> {

    return this.http.post(this.apiUrl, data);

  }

  updateCompany(id: number, data: any): Observable<any> {

    return this.http.put(`${this.apiUrl}/${id}`, data);

  }

  deleteCompany(id: number): Observable<any> {

    return this.http.delete(`${this.apiUrl}/${id}`);

  }

}