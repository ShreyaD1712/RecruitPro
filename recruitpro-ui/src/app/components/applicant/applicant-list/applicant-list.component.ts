import {
    Component,
    OnInit,
    ChangeDetectorRef,
    NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicantService } from '../../../services/applicant.service';
import { ApplicantSkillService } from '../../../services/applicant-skill.service';
import { ApplicantEducationService } from '../../../services/applicant-education.service';
import { ApplicantWorkExperienceService } from '../../../services/applicant-work-experience.service';
import { ApplicantDocumentService } from '../../../services/applicant-document.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-applicant-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatTooltipModule
    ],
    templateUrl:
        './applicant-list.component.html'
})
export class ApplicantListComponent
    implements OnInit {
    // ==================================================
    // APPLICANTS
    // ==================================================
    applicants: any[] = [];
    // ==================================================
    // SELECTED APPLICANT
    // ==================================================
    selectedApplicant: any = null;
    showApplicantPopup = false;
    // ==================================================
    // POPUP DETAILS
    // ==================================================
    applicantSkills: any[] = [];
    applicantEducations: any[] = [];
    applicantWorkExperiences: any[] = [];
    applicantDocuments: any[] = [];
    popupLoading = false;
    // ==================================================
    // SEARCH
    // ==================================================
    search = '';
    // ==================================================
    // SORTING
    // ==================================================
    sortBy = 'CreatedOn';
    order = 'desc';
    // ==================================================
    // PAGINATION
    // ==================================================
    page = 1;
    pageSize = 10;
    totalRecords = 0;
    Math = Math;
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    // ==================================================
    // TABLE COLUMNS
    // ==================================================
    displayedColumns = [
        'Name',
        'Email',
        'MobileNo',
        'CurrentCompany',
        'CurrentCity',
        'ExpectedCTC',
        'NoticePeriod',
        'Actions'
    ];
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private applicantService:
            ApplicantService,
        private applicantSkillService:
            ApplicantSkillService,
        private applicantEducationService:
            ApplicantEducationService,
        private applicantWorkExperienceService:
            ApplicantWorkExperienceService,
        private applicantDocumentService:
            ApplicantDocumentService,
        public authService:
            AuthService,
        private router:
            Router,
        private cdr:
            ChangeDetectorRef,
        private ngZone:
            NgZone
    ) { }
    // ==================================================
    // ON INIT
    // ==================================================
    ngOnInit(): void {
        this.loadApplicants();
    }
    // ==================================================
    // LOAD APPLICANTS
    // ==================================================
    loadApplicants(): void {
        this.loading = true;
        this.applicantService
            .getApplicants(
                this.search,
                this.sortBy,
                this.order,
                this.page,
                this.pageSize
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'Applicants Response:',
                        response
                    );
                    this.applicants =
                        Array.isArray(response?.data)
                            ? response.data
                            : [];
                    this.totalRecords =
                        response?.total_records || 0;
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error(
                        'Error loading applicants:',
                        err
                    );
                    this.applicants = [];
                    this.totalRecords = 0;
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
    }
    // ==================================================
    // SEARCH
    // ==================================================
    searchApplicants(): void {
        this.page = 1;
        this.loadApplicants();
    }
    // ==================================================
    // SORT
    // ==================================================
    sort(
        column: string
    ): void {
        if (
            this.sortBy === column
        ) {
            this.order =
                this.order === 'asc'
                    ? 'desc'
                    : 'asc';
        } else {
            this.sortBy = column;
            this.order = 'asc';
        }
        this.loadApplicants();
    }
    // ==================================================
    // OPEN APPLICANT POPUP
    // ==================================================
    openApplicantPopup(
        applicant: any,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }
        if (!applicant?.ApplicantId) {
            alert(
                'Applicant information not found.'
            );
            return;
        }
        // ==================================================
        // OPEN POPUP IMMEDIATELY
        // ==================================================
        this.ngZone.run(() => {
            this.selectedApplicant =
                applicant;
            this.showApplicantPopup =
                true;
            this.popupLoading =
                true;
            // Clear previous applicant
            this.applicantSkills = [];
            this.applicantEducations = [];
            this.applicantWorkExperiences = [];
            this.applicantDocuments = [];
            document.body.style.overflow =
                'hidden';
            this.cdr.detectChanges();
        });
        const applicantId =
            Number(
                applicant.ApplicantId
            );
        console.log(
            'Loading complete details for ApplicantId:',
            applicantId
        );
        // ==================================================
        // LOAD COMPLETE APPLICANT DETAILS
        // ==================================================
        forkJoin({
            applicant:
                this.applicantService
                    .getApplicantById(
                        applicantId
                    ),
            // IMPORTANT:
            // Skills are loaded from ApplicantSkills API
            skills:
                this.applicantSkillService
                    .getApplicantSkills(
                        applicantId
                    ),
            educations:
                this.applicantEducationService
                    .getEducations(
                        applicantId
                    ),
            workExperiences:
                this.applicantWorkExperienceService
                    .getWorkExperiences(
                        applicantId
                    ),
            documents:
                this.applicantDocumentService
                    .getApplicantDocuments(
                        applicantId
                    )
        })
            .subscribe({
                next: (response: any) => {
                    console.log(
                        '================================'
                    );
                    console.log(
                        'FULL POPUP RESPONSE:',
                        response
                    );
                    console.log(
                        'APPLICANT RESPONSE:',
                        response.applicant
                    );
                    console.log(
                        'APPLICANT SKILLS RESPONSE:',
                        response.skills
                    );
                    console.log(
                        'EDUCATION RESPONSE:',
                        response.educations
                    );
                    console.log(
                        'WORK EXPERIENCE RESPONSE:',
                        response.workExperiences
                    );
                    console.log(
                        'DOCUMENT RESPONSE:',
                        response.documents
                    );
                    console.log(
                        '================================'
                    );
                    this.ngZone.run(() => {
                        // ==================================================
                        // APPLICANT
                        // ==================================================
                        this.selectedApplicant =
                            response.applicant?.data ||
                            response.applicant ||
                            applicant;
                        // ==================================================
                        // APPLICANT SKILLS
                        // ==================================================
                        if (
                            Array.isArray(
                                response.skills?.data
                            )
                        ) {
                            this.applicantSkills =
                                response.skills.data;
                        } else if (
                            Array.isArray(
                                response.skills
                            )
                        ) {
                            this.applicantSkills =
                                response.skills;
                        } else {
                            this.applicantSkills =
                                [];
                        }
                        console.log(
                            'FINAL APPLICANT SKILLS:',
                            this.applicantSkills
                        );
                        // ==================================================
                        // EDUCATION
                        // ==================================================
                        if (
                            Array.isArray(
                                response.educations?.data
                            )
                        ) {
                            this.applicantEducations =
                                response.educations.data;
                        } else if (
                            Array.isArray(
                                response.educations
                            )
                        ) {
                            this.applicantEducations =
                                response.educations;
                        } else {
                            this.applicantEducations =
                                [];
                        }
                        // ==================================================
                        // WORK EXPERIENCE
                        // ==================================================
                        if (
                            Array.isArray(
                                response.workExperiences?.data
                            )
                        ) {
                            this.applicantWorkExperiences =
                                response.workExperiences.data;
                        } else if (
                            Array.isArray(
                                response.workExperiences
                            )
                        ) {
                            this.applicantWorkExperiences =
                                response.workExperiences;
                        } else {
                            this.applicantWorkExperiences =
                                [];
                        }
                        // ==================================================
                        // DOCUMENTS
                        // ==================================================
                        if (
                            Array.isArray(
                                response.documents?.data
                            )
                        ) {
                            this.applicantDocuments =
                                response.documents.data;
                        } else if (
                            Array.isArray(
                                response.documents
                            )
                        ) {
                            this.applicantDocuments =
                                response.documents;
                        } else {
                            this.applicantDocuments =
                                [];
                        }
                        console.log(
                            'FINAL DOCUMENTS:',
                            this.applicantDocuments
                        );
                        // ==================================================
                        // STOP LOADING
                        // ==================================================
                        this.popupLoading =
                            false;
                        this.cdr.detectChanges();
                    });
                },
                error: (err: any) => {
                    console.error(
                        'Error loading applicant details:',
                        err
                    );
                    this.ngZone.run(() => {
                        this.popupLoading =
                            false;
                        this.cdr.detectChanges();
                        alert(
                            err?.error?.detail ||
                            'Unable to load complete applicant details.'
                        );
                    });
                }
            });
    }
    // ==================================================
    // CLOSE APPLICANT POPUP
    // ==================================================
    closeApplicantPopup(): void {
        this.ngZone.run(() => {
            this.selectedApplicant =
                null;
            this.applicantSkills =
                [];
            this.applicantEducations =
                [];
            this.applicantWorkExperiences =
                [];
            this.applicantDocuments =
                [];
            this.showApplicantPopup =
                false;
            this.popupLoading =
                false;
            document.body.style.overflow =
                '';
            this.cdr.detectChanges();
        });
    }
    // ==================================================
    // CLOSE POPUP ON BACKDROP
    // ==================================================
    closePopupOnBackdrop(
        event: MouseEvent
    ): void {
        if (
            event.target ===
            event.currentTarget
        ) {
            this.closeApplicantPopup();
        }
    }
    // ==================================================
    // GET APPLICANT SKILL NAME
    // ==================================================
    getApplicantSkillName(
        skill: any
    ): string {
        if (!skill) {
            return '-';
        }
        // ApplicantSkills API directly returns SkillName
        if (skill.SkillName) {
            return skill.SkillName;
        }
        // In case backend returns nested Skill
        if (skill.skill?.SkillName) {
            return skill.skill.SkillName;
        }
        if (skill.Skill?.SkillName) {
            return skill.Skill.SkillName;
        }
        return '-';
    }
    // ==================================================
    // GET DOCUMENT NAME
    // ==================================================
    getDocumentName(
        document: any
    ): string {
        return (
            document?.FileName ||
            document?.DocumentName ||
            document?.OriginalFileName ||
            document?.OriginalName ||
            'View Document'
        );
    }
    // ==================================================
    // CHECK PDF
    // ==================================================
    isPdf(
        document: any
    ): boolean {
        const fileName =
            this.getDocumentName(
                document
            )
                .toLowerCase();
        return fileName
            .endsWith('.pdf');
    }
    // ==================================================
    // GET DOCUMENT URL
    // ==================================================
    getDocumentUrl(
        document: any
    ): string {
        console.log(
            'Building URL for document:',
            document
        );
        let filePath =
            document?.FileUrl ||
            document?.FileURL ||
            document?.FilePath ||
            document?.DocumentPath ||
            document?.Path ||
            document?.StoredFilePath ||
            '';
        if (!filePath) {
            console.error(
                'No file path found in document:',
                document
            );
            return '';
        }
        // ==================================================
        // WINDOWS PATH FIX
        // ==================================================
        filePath =
            String(filePath)
                .replace(
                    /\\/g,
                    '/'
                );
        console.log(
            'Document File Path:',
            filePath
        );
        // ==================================================
        // FULL HTTP URL
        // ==================================================
        if (
            filePath.startsWith('http://') ||
            filePath.startsWith('https://')
        ) {
            return encodeURI(
                filePath
            );
        }
        // ==================================================
        // PATH STARTS WITH /
        // Example:
        // /uploads/applicant_documents/resume.pdf
        // ==================================================
        if (
            filePath.startsWith('/')
        ) {
            return encodeURI(
                'http://127.0.0.1:8000' +
                filePath
            );
        }
        // ==================================================
        // RELATIVE PATH
        // Example:
        // uploads/applicant_documents/resume.pdf
        // ==================================================
        return encodeURI(
            'http://127.0.0.1:8000/' +
            filePath
        );
    }
    // ==================================================
    // OPEN DOCUMENT
    // ==================================================
    openDocument(
        document: any
    ): void {
        console.log(
            'Opening Document:',
            document
        );
        const url =
            this.getDocumentUrl(
                document
            );
        console.log(
            'FINAL DOCUMENT URL:',
            url
        );
        if (!url) {
            alert(
                'Document file path not found.'
            );
            return;
        }
        window.open(
            url,
            '_blank',
            'noopener,noreferrer'
        );
    }
    // ==================================================
    // ADD APPLICANT
    // ==================================================
    addApplicant(): void {
        if (
            !this.authService.hasPermission(
                'CREATE_APPLICANT'
            )
        ) {
            alert(
                'You are not authorized to create applicants.'
            );
            return;
        }
        this.router.navigate([
            '/applicant/add'
        ]);
    }
    // ==================================================
    // EDIT APPLICANT
    // ==================================================
    editApplicant(
        id: number,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }
        this.router.navigate([
            '/applicant/edit',
            id
        ]);
    }
    // ==================================================
    // DELETE APPLICANT
    // ==================================================
    deleteApplicant(
        id: number,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }
        if (
            !confirm(
                'Delete this Applicant?'
            )
        ) {
            return;
        }
        this.applicantService
            .deleteApplicant(
                id
            )
            .subscribe({
                next: () => {
                    alert(
                        'Applicant Deleted Successfully'
                    );
                    if (
                        this.applicants.length === 1 &&
                        this.page > 1
                    ) {
                        this.page--;
                    }
                    this.loadApplicants();
                },
                error: (err: any) => {
                    console.error(
                        'Error deleting applicant:',
                        err
                    );
                    alert(
                        err?.error?.detail ||
                        'Unable to delete applicant'
                    );
                }
            });
    }
    // ==================================================
    // PREVIOUS PAGE
    // ==================================================
    previousPage(): void {
        if (
            this.page > 1
        ) {
            this.page--;
            this.loadApplicants();
        }
    }
    // ==================================================
    // NEXT PAGE
    // ==================================================
    nextPage(): void {
        if (
            this.page * this.pageSize <
            this.totalRecords
        ) {
            this.page++;
            this.loadApplicants();
        }
    }
}