import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApplicantWorkExperienceService {

    private apiUrl =
        'http://127.0.0.1:8000/applicant-work-experiences';

    constructor(
        private http: HttpClient
    ) { }

    // ==================================================
    // GET ALL WORK EXPERIENCES
    // ==================================================
    getWorkExperiences(
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
    // GET WORK EXPERIENCE BY ID
    // ==================================================
    getWorkExperienceById(
        workExperienceId: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/${workExperienceId}`
        );
    }

    // ==================================================
    // ADD WORK EXPERIENCE
    // ==================================================
    addWorkExperience(
        data: any
    ): Observable<any> {

        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }

    // ==================================================
    // UPDATE WORK EXPERIENCE
    // ==================================================
    updateWorkExperience(
        workExperienceId: number,
        data: any
    ): Observable<any> {

        return this.http.put<any>(
            `${this.apiUrl}/${workExperienceId}`,
            data
        );
    }

    // ==================================================
    // DELETE WORK EXPERIENCE
    // ==================================================
    deleteWorkExperience(
        workExperienceId: number
    ): Observable<any> {

        return this.http.delete<any>(
            `${this.apiUrl}/${workExperienceId}`
        );
    }
}