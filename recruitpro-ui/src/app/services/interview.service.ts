import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InterviewService {
    private apiUrl =
        'http://127.0.0.1:8000/interviews';

    constructor(
        private http: HttpClient
    ) { }

    // ==================================================
    // GET ALL INTERVIEWS
    // ==================================================
    getInterviews(
        search: string = '',
        applicationId: number | null = null,
        interviewRoundId: number | null = null,
        interviewerId: number | null = null,
        interviewStatus: string | null = null,
        sortBy: string = 'InterviewDate',
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
        // INTERVIEW ROUND FILTER
        // ==================================================
        if (interviewRoundId !== null) {
            params = params.set(
                'interview_round_id',
                interviewRoundId.toString()
            );
        }

        // ==================================================
        // INTERVIEWER FILTER
        // ==================================================
        if (interviewerId !== null) {
            params = params.set(
                'interviewer_id',
                interviewerId.toString()
            );
        }

        // ==================================================
        // STATUS FILTER
        // ==================================================
        if (
            interviewStatus &&
            interviewStatus !== 'All'
        ) {
            params = params.set(
                'interview_status',
                interviewStatus
            );
        }

        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }

    // ==================================================
    // GET INTERVIEW BY ID
    // ==================================================
    getInterviewById(
        id: number
    ): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${id}`
        );
    }

    // ==================================================
    // ADD INTERVIEW
    // ==================================================
    addInterview(
        data: any
    ): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }

    // ==================================================
    // UPDATE INTERVIEW
    // ==================================================
    updateInterview(
        id: number,
        data: any
    ): Observable<any> {
        return this.http.put<any>(
            `${this.apiUrl}/${id}`,
            data
        );
    }

    // ==================================================
    // CANCEL INTERVIEW
    // ==================================================
    cancelInterview(
        id: number
    ): Observable<any> {
        return this.http.put<any>(
            `${this.apiUrl}/${id}/cancel`,
            {}
        );
    }

    // ==================================================
    // DELETE INTERVIEW
    // ==================================================
    deleteInterview(
        id: number
    ): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${id}`
        );
    }
}