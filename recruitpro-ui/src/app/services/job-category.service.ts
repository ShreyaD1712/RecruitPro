import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class JobCategoryService {

    private apiUrl = 'http://127.0.0.1:8000/job-categories';

    constructor(
        private http: HttpClient
    ) { }

    // ==========================
    // Get All Job Categories
    // ==========================

    getJobCategories(
        search: string = '',
        companyId: number | null = null,
        sortBy: string = 'CategoryName',
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
    // Get Job Category By Id
    // ==========================

    getJobCategoryById(
        id: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/${id}`
        );
    }

    // ==========================
    // Add Job Category
    // ==========================

    addJobCategory(
        data: any
    ): Observable<any> {

        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }

    // ==========================
    // Update Job Category
    // ==========================

    updateJobCategory(
        id: number,
        data: any
    ): Observable<any> {

        return this.http.put<any>(
            `${this.apiUrl}/${id}`,
            data
        );
    }

    // ==========================
    // Delete Job Category
    // ==========================

    deleteJobCategory(
        id: number
    ): Observable<any> {

        return this.http.delete<any>(
            `${this.apiUrl}/${id}`
        );
    }
}