import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InterviewFeedbackService {

    // ==================================================
    // API URL
    // ==================================================
    private apiUrl =
        'http://127.0.0.1:8000/interview-feedback';

    constructor(
        private http: HttpClient
    ) { }

    // ==================================================
    // GET ALL INTERVIEW FEEDBACK
    // ==================================================
    getFeedbacks(
        search: string = '',
        interviewId: number | null = null,
        recommendation: string | null = null,
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
        // INTERVIEW FILTER
        // ==================================================
        if (interviewId !== null) {
            params = params.set(
                'interview_id',
                interviewId.toString()
            );
        }

        // ==================================================
        // RECOMMENDATION FILTER
        // ==================================================
        if (
            recommendation &&
            recommendation !== 'All'
        ) {
            params = params.set(
                'recommendation',
                recommendation
            );
        }

        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }

    // ==================================================
    // GET FEEDBACK BY INTERVIEW
    // ==================================================
    getFeedbackByInterview(
        interviewId: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/by-interview/${interviewId}`
        );
    }

    // ==================================================
    // GET FEEDBACK BY ID
    // ==================================================
    getFeedbackById(
        feedbackId: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/${feedbackId}`
        );
    }

    // ==================================================
    // ADD FEEDBACK
    // ==================================================
    addFeedback(
        data: any
    ): Observable<any> {

        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }

    // ==================================================
    // UPDATE FEEDBACK
    // ==================================================
    updateFeedback(
        feedbackId: number,
        data: any
    ): Observable<any> {

        return this.http.put<any>(
            `${this.apiUrl}/${feedbackId}`,
            data
        );
    }

    // ==================================================
    // DELETE FEEDBACK
    // ==================================================
    deleteFeedback(
        feedbackId: number
    ): Observable<any> {

        return this.http.delete<any>(
            `${this.apiUrl}/${feedbackId}`
        );
    }
}