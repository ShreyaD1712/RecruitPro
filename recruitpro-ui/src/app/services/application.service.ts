import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class ApplicationService {
    private apiUrl =
        'http://127.0.0.1:8000/applications';
    constructor(
        private http: HttpClient
    ) { }
    // ==================================================
    // GET ALL APPLICATIONS
    // ==================================================
    getApplications(
        search: string = '',
        departmentId: number | null = null,
        jobOpeningId: number | null = null,
        currentStatus: string = 'All',
        sortBy: string = 'AppliedDate',
        order: string = 'desc',
        page: number = 1,
        pageSize: number = 10
    ): Observable<any> {
        let params = new HttpParams()
            .set('search', search)
            .set('sort_by', sortBy)
            .set('order', order)
            .set('page', page.toString())
            .set('page_size', pageSize.toString());
        // ==================================================
        // DEPARTMENT FILTER
        // ==================================================
        if (departmentId !== null) {
            params = params.set(
                'department_id',
                departmentId.toString()
            );
        }
        // ==================================================
        // JOB OPENING FILTER
        // ==================================================
        if (jobOpeningId !== null) {
            params = params.set(
                'job_opening_id',
                jobOpeningId.toString()
            );
        }
        // ==================================================
        // STATUS FILTER
        // ==================================================
        if (
            currentStatus &&
            currentStatus !== 'All'
        ) {
            params = params.set(
                'Current_Status',
                currentStatus
            );
        }
        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }
    // ==================================================
    // GET APPLICATION BY ID
    // ==================================================
    getApplicationById(
        id: number
    ): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${id}`
        );
    }
    // ==================================================
    // ADD APPLICATION
    // ==================================================
    addApplication(
        data: any
    ): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }
    // ==================================================
    // UPDATE APPLICATION
    // ==================================================
    updateApplication(
        id: number,
        data: any
    ): Observable<any> {
        return this.http.put<any>(
            `${this.apiUrl}/${id}`,
            data
        );
    }
    // ==================================================
    // DELETE APPLICATION
    // ==================================================
    deleteApplication(
        id: number
    ): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${id}`
        );
    }
}