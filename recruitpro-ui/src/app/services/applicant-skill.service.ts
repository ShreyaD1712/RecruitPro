import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class ApplicantSkillService {
    private apiUrl =
        'http://127.0.0.1:8000/applicant-skills';
    constructor(
        private http: HttpClient
    ) { }
    // ==================================================
    // GET ALL SKILLS FOR APPLICANT
    // ==================================================
    getApplicantSkills(
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
    // ADD APPLICANT SKILL
    // ==================================================
    addApplicantSkill(
        data: any
    ): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }
    // ==================================================
    // GET SKILL BY ID
    // ==================================================
    getSkillById(
        skillId: number
    ): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${skillId}`
        );
    }
    // ==================================================
    // DELETE APPLICANT SKILL
    // ==================================================
    deleteApplicantSkill(
        skillId: number
    ): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${skillId}`
        );
    }
}