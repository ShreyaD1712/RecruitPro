import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApplicantEducationService {

    private apiUrl =
        'http://127.0.0.1:8000/applicant-educations';

    constructor(
        private http: HttpClient
    ) { }

    // ==================================================
    // GET ALL EDUCATION
    // ==================================================
    getEducations(
        applicantId: number
    ): Observable<any> {

        const params = new HttpParams()
            .set(
                'applicant_id',
                applicantId.toString()
            );

        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }

    // ==================================================
    // GET EDUCATION BY ID
    // ==================================================
    getEducationById(
        educationId: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/${educationId}`
        );
    }

    // ==================================================
    // ADD EDUCATION
    // ==================================================
    addEducation(
        data: any
    ): Observable<any> {

        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }

    // ==================================================
    // UPDATE EDUCATION
    // ==================================================
    updateEducation(
        educationId: number,
        data: any
    ): Observable<any> {

        return this.http.put<any>(
            `${this.apiUrl}/${educationId}`,
            data
        );
    }

    // ==================================================
    // DELETE EDUCATION
    // ==================================================
    deleteEducation(
        educationId: number
    ): Observable<any> {

        return this.http.delete<any>(
            `${this.apiUrl}/${educationId}`
        );
    }
}