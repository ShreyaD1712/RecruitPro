import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class JobOpeningService {
    private apiUrl =
        'http://127.0.0.1:8000/job-openings';
    constructor(
        private http: HttpClient
    ) { }
    // ==========================
    // Get All Job Openings
    // ==========================
    getJobOpenings(
        search: string = '',
        departmentId: number | null = null,
        designationId: number | null = null,
        status: string = 'Open',
        sortBy: string = 'CreatedOn',
        order: string = 'desc',
        page: number = 1,
        pageSize: number = 10
    ): Observable<any> {
        let params = new HttpParams()
            .set('search', search)
            .set('status', status)
            .set('sort_by', sortBy)
            .set('order', order)
            .set('page', page.toString())
            .set('page_size', pageSize.toString());
        // ==========================
        // Department Filter
        // ==========================
        if (departmentId !== null) {
            params = params.set(
                'department_id',
                departmentId.toString()
            );
        }
        // ==========================
        // Designation Filter
        // ==========================
        if (designationId !== null) {
            params = params.set(
                'designation_id',
                designationId.toString()
            );
        }
        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }
    // ==========================
    // Get Job Opening By Id
    // ==========================
    getJobOpeningById(
        id: number
    ): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${id}`
        );
    }
    // ==========================
    // Add Job Opening
    // ==========================
    addJobOpening(
        data: any
    ): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }
    // ==========================
    // Update Job Opening
    // ==========================
    updateJobOpening(
        id: number,
        data: any
    ): Observable<any> {
        return this.http.put<any>(
            `${this.apiUrl}/${id}`,
            data
        );
    }
    // ==========================
    // Delete Job Opening
    // ==========================
    deleteJobOpening(
        id: number
    ): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${id}`
        );
    }
}