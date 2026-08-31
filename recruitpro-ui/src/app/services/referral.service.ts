import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class ReferralService {
    private apiUrl =
        'http://127.0.0.1:8000/referrals';
    constructor(
        private http: HttpClient
    ) { }
    // ==================================================
    // GET ALL REFERRALS
    // ==================================================
    getReferrals(
        search: string = '',
        applicationId: number | null = null,
        applicantId: number | null = null,
        referredOnly: boolean | null = null,
        sortBy: string = 'ReferralDate',
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
        // APPLICATION FILTER
        // ==================================================
        if (applicationId !== null) {
            params = params.set(
                'application_id',
                applicationId.toString()
            );
        }
        // ==================================================
        // APPLICANT FILTER
        // ==================================================
        if (applicantId !== null) {
            params = params.set(
                'applicant_id',
                applicantId.toString()
            );
        }
        // ==================================================
        // REFERRED FILTER
        // ==================================================
        if (referredOnly !== null) {
            params = params.set(
                'referred_only',
                referredOnly.toString()
            );
        }
        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }
    // ==================================================
    // GET REFERRAL BY ID
    // ==================================================
    getReferralById(
        id: number
    ): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${id}`
        );
    }
    // ==================================================
    // ADD REFERRAL
    // ==================================================
    addReferral(
        data: any
    ): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }
    // ==================================================
    // UPDATE REFERRAL
    // ==================================================
    updateReferral(
        id: number,
        data: any
    ): Observable<any> {
        return this.http.put<any>(
            `${this.apiUrl}/${id}`,
            data
        );
    }
    // ==================================================
    // DELETE REFERRAL
    // ==================================================
    deleteReferral(
        id: number
    ): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${id}`
        );
    }
}