import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApplicantDocumentService {

    private apiUrl =
        'http://127.0.0.1:8000/applicant-documents';

    constructor(
        private http: HttpClient
    ) { }

    // ==================================================
    // GET ALL DOCUMENTS FOR APPLICANT
    // ==================================================
    getApplicantDocuments(
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
    // UPLOAD DOCUMENT
    // ==================================================
    uploadDocument(
        applicantId: number,
        file: File,
        documentType: string
    ): Observable<any> {

        const formData = new FormData();

        formData.append(
            'applicant_id',
            applicantId.toString()
        );

        formData.append(
            'document_type',
            documentType
        );

        formData.append(
            'file',
            file
        );

        return this.http.post<any>(
            `${this.apiUrl}/`,
            formData
        );
    }

    // ==================================================
    // GET DOCUMENT BY ID
    // ==================================================
    getDocumentById(
        documentId: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/${documentId}`
        );
    }

    // ==================================================
    // DELETE DOCUMENT
    // ==================================================
    deleteDocument(
        documentId: number
    ): Observable<any> {

        return this.http.delete<any>(
            `${this.apiUrl}/${documentId}`
        );
    }
}