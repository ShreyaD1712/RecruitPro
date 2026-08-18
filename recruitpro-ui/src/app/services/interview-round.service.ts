import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InterviewRoundService {

    private apiUrl =
        'http://127.0.0.1:8000/interview-rounds';

    constructor(
        private http: HttpClient
    ) { }

    // ==========================
    // Get All Interview Rounds
    // ==========================

    getInterviewRounds(
        search: string = '',
        companyId: number | null = null,
        sortBy: string = 'RoundName',
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
    // Get Interview Round By Id
    // ==========================

    getInterviewRoundById(
        id: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/${id}`
        );
    }

    // ==========================
    // Add Interview Round
    // ==========================

    addInterviewRound(
        data: any
    ): Observable<any> {

        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }

    // ==========================
    // Update Interview Round
    // ==========================

    updateInterviewRound(
        id: number,
        data: any
    ): Observable<any> {

        return this.http.put<any>(
            `${this.apiUrl}/${id}`,
            data
        );
    }

    // ==========================
    // Delete Interview Round
    // ==========================

    deleteInterviewRound(
        id: number
    ): Observable<any> {

        return this.http.delete<any>(
            `${this.apiUrl}/${id}`
        );
    }
}