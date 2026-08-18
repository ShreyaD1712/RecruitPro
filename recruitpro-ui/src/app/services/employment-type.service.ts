import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EmploymentTypeService {

    private apiUrl = 'http://127.0.0.1:8000/employment-types';

    constructor(
        private http: HttpClient
    ) { }

    // ==========================
    // Get All Employment Types
    // ==========================

    getEmploymentTypes(
        search: string = '',
        companyId: number | null = null,
        sortBy: string = 'EmploymentTypeName',
        order: string = 'asc',
        page: number = 1,
        pageSize: number = 10
    ): Observable<any> {

        let params = new HttpParams()
            .set('search', search)
            .set('sort_by', sortBy)
            .set('order', order)
            .set('page', page.toString())
            .set('page_size', pageSize.toString());

        if (companyId !== null) {
            params = params.set(
                'company_id',
                companyId.toString()
            );
        }

        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }

    // ==========================
    // Get Employment Type By Id
    // ==========================

    getEmploymentTypeById(
        id: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/${id}`
        );
    }

    // ==========================
    // Add Employment Type
    // ==========================

    addEmploymentType(
        data: any
    ): Observable<any> {

        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }

    // ==========================
    // Update Employment Type
    // ==========================

    updateEmploymentType(
        id: number,
        data: any
    ): Observable<any> {

        return this.http.put<any>(
            `${this.apiUrl}/${id}`,
            data
        );
    }

    // ==========================
    // Delete Employment Type
    // ==========================

    deleteEmploymentType(
        id: number
    ): Observable<any> {

        return this.http.delete<any>(
            `${this.apiUrl}/${id}`
        );
    }
}