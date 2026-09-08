import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReportService {

    private apiUrl = 'http://127.0.0.1:8000/reports';

    constructor(
        private http: HttpClient
    ) { }

    // =========================================================
    // RECRUITMENT SUMMARY
    // =========================================================
    getRecruitmentSummary(
        companyId?: number | null,
        fromDate?: string | null,
        toDate?: string | null
    ): Observable<any> {

        let params = new HttpParams();

        if (companyId != null) {
            params = params.set('company_id', companyId.toString());
        }

        if (fromDate) {
            params = params.set('from_date', fromDate);
        }

        if (toDate) {
            params = params.set('to_date', toDate);
        }

        return this.http.get<any>(
            `${this.apiUrl}/summary`,
            { params }
        );
    }

    // =========================================================
    // APPLICATION REPORT
    // =========================================================
    getApplicationReport(
        companyId?: number | null,
        departmentId?: number | null,
        jobOpeningId?: number | null,
        applicationStatus?: string | null,
        fromDate?: string | null,
        toDate?: string | null,
        search: string = '',
        page: number = 1,
        pageSize: number = 10
    ): Observable<any> {

        let params = new HttpParams()
            .set('search', search)
            .set('page', page.toString())
            .set('page_size', pageSize.toString());

        if (companyId != null) {
            params = params.set('company_id', companyId.toString());
        }

        if (departmentId != null) {
            params = params.set(
                'department_id',
                departmentId.toString()
            );
        }

        if (jobOpeningId != null) {
            params = params.set(
                'job_opening_id',
                jobOpeningId.toString()
            );
        }

        if (applicationStatus) {
            params = params.set(
                'application_status',
                applicationStatus
            );
        }

        if (fromDate) {
            params = params.set('from_date', fromDate);
        }

        if (toDate) {
            params = params.set('to_date', toDate);
        }

        return this.http.get<any>(
            `${this.apiUrl}/applications`,
            { params }
        );
    }

    // =========================================================
    // INTERVIEW REPORT
    // =========================================================
    getInterviewReport(
        companyId?: number | null,
        interviewStatus?: string | null,
        interviewerId?: number | null,
        interviewRoundId?: number | null,
        fromDate?: string | null,
        toDate?: string | null,
        search: string = '',
        page: number = 1,
        pageSize: number = 10
    ): Observable<any> {

        let params = new HttpParams()
            .set('search', search)
            .set('page', page.toString())
            .set('page_size', pageSize.toString());

        if (companyId != null) {
            params = params.set('company_id', companyId.toString());
        }

        if (interviewStatus) {
            params = params.set(
                'interview_status',
                interviewStatus
            );
        }

        if (interviewerId != null) {
            params = params.set(
                'interviewer_id',
                interviewerId.toString()
            );
        }

        if (interviewRoundId != null) {
            params = params.set(
                'interview_round_id',
                interviewRoundId.toString()
            );
        }

        if (fromDate) {
            params = params.set('from_date', fromDate);
        }

        if (toDate) {
            params = params.set('to_date', toDate);
        }

        return this.http.get<any>(
            `${this.apiUrl}/interviews`,
            { params }
        );
    }

    // =========================================================
    // OFFER REPORT
    // =========================================================
    getOfferReport(
        companyId?: number | null,
        offerStatus?: string | null,
        fromDate?: string | null,
        toDate?: string | null,
        search: string = '',
        page: number = 1,
        pageSize: number = 10
    ): Observable<any> {

        let params = new HttpParams()
            .set('search', search)
            .set('page', page.toString())
            .set('page_size', pageSize.toString());

        if (companyId != null) {
            params = params.set('company_id', companyId.toString());
        }

        if (offerStatus) {
            params = params.set(
                'offer_status',
                offerStatus
            );
        }

        if (fromDate) {
            params = params.set('from_date', fromDate);
        }

        if (toDate) {
            params = params.set('to_date', toDate);
        }

        return this.http.get<any>(
            `${this.apiUrl}/offers`,
            { params }
        );
    }

    // =========================================================
    // HIRED CANDIDATES REPORT
    // =========================================================
    getHiredCandidatesReport(
        companyId?: number | null,
        departmentId?: number | null,
        jobOpeningId?: number | null,
        fromDate?: string | null,
        toDate?: string | null,
        search: string = '',
        page: number = 1,
        pageSize: number = 10
    ): Observable<any> {

        let params = new HttpParams()
            .set('search', search)
            .set('page', page.toString())
            .set('page_size', pageSize.toString());

        if (companyId != null) {
            params = params.set('company_id', companyId.toString());
        }

        if (departmentId != null) {
            params = params.set(
                'department_id',
                departmentId.toString()
            );
        }

        if (jobOpeningId != null) {
            params = params.set(
                'job_opening_id',
                jobOpeningId.toString()
            );
        }

        if (fromDate) {
            params = params.set('from_date', fromDate);
        }

        if (toDate) {
            params = params.set('to_date', toDate);
        }

        return this.http.get<any>(
            `${this.apiUrl}/hired-candidates`,
            { params }
        );
    }
}