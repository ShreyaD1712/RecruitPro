import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OfferService {

    // ==================================================
    // API URL
    // ==================================================
    private apiUrl =
        'http://127.0.0.1:8000/offers';

    constructor(
        private http: HttpClient
    ) { }

    // ==================================================
    // GET ALL OFFERS
    // ==================================================
    getOffers(
        search: string = '',
        applicationId: number | null = null,
        departmentId: number | null = null,
        jobOpeningId: number | null = null,
        offerStatus: string | null = null,
        sortBy: string = 'CreatedOn',
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
        // OFFER STATUS FILTER
        // ==================================================
        if (
            offerStatus &&
            offerStatus !== 'All'
        ) {
            params = params.set(
                'offer_status',
                offerStatus
            );
        }

        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }

    // ==================================================
    // GET OFFER BY APPLICATION
    // ==================================================
    getOfferByApplication(
        applicationId: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/by-application/${applicationId}`
        );
    }

    // ==================================================
    // GET OFFER BY ID
    // ==================================================
    getOfferById(
        offerId: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/${offerId}`
        );
    }

    // ==================================================
    // ADD OFFER
    // ==================================================
    addOffer(
        data: any
    ): Observable<any> {

        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }

    // ==================================================
    // UPDATE OFFER
    // ==================================================
    updateOffer(
        offerId: number,
        data: any
    ): Observable<any> {

        return this.http.put<any>(
            `${this.apiUrl}/${offerId}`,
            data
        );
    }

    // ==================================================
    // DELETE OFFER
    // ==================================================
    deleteOffer(
        offerId: number
    ): Observable<any> {

        return this.http.delete<any>(
            `${this.apiUrl}/${offerId}`
        );
    }
}