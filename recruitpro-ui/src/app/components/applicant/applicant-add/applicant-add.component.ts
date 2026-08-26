import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    FormsModule
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ApplicantService } from '../../../services/applicant.service';
import { ApplicantSkillService } from '../../../services/applicant-skill.service';
import { ApplicantEducationService } from '../../../services/applicant-education.service';
import { ApplicantWorkExperienceService } from '../../../services/applicant-work-experience.service';
import { ApplicantDocumentService } from '../../../services/applicant-document.service';
import { SkillService } from '../../../services/skill.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-applicant-add',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule
    ],
    templateUrl: './applicant-add.component.html'
})
export class ApplicantAddComponent implements OnInit {
    // ==================================================
    // APPLICANT
    // ==================================================
    applicantForm!: FormGroup;
    applicantId: number | null = null;
    companyId: number | null = null;
    genders = [
        'Male',
        'Female',
        'Other'
    ];
    loading = false;
    applicantCreated = false;
    activeSection = '';
    // ==================================================
    // SKILLS
    // ==================================================
    availableSkills: any[] = [];
    skills: any[] = [];
    selectedSkillIds: number[] = [];
    skillsLoading = false;
    skillsLoaded = false;
    skillLoading = false;
    // ==================================================
    // EDUCATION
    // ==================================================
    educationForm!: FormGroup;
    educations: any[] = [];
    educationLoading = false;
    // ==================================================
    // WORK EXPERIENCE
    // ==================================================
    workExperienceForm!: FormGroup;
    workExperiences: any[] = [];
    workExperienceLoading = false;
    // ==================================================
    // DOCUMENT
    // ==================================================
    selectedFile: File | null = null;
    documentType = '';
    documentLoading = false;
    documents: any[] = [];
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private applicantService: ApplicantService,
        private applicantSkillService: ApplicantSkillService,
        private applicantEducationService: ApplicantEducationService,
        private applicantWorkExperienceService:
            ApplicantWorkExperienceService,
        private applicantDocumentService:
            ApplicantDocumentService,
        private skillService: SkillService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }
    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        // ==================================================
        // PERMISSION
        // ==================================================
        if (
            !this.authService.hasPermission(
                'CREATE_APPLICANT'
            )
        ) {
            alert(
                'You are not authorized to create applicants.'
            );
            this.router.navigate([
                '/applicant'
            ]);
            return;
        }
        // ==================================================
        // COMPANY
        // ==================================================
        this.companyId =
            this.authService.getCompanyId();
        if (!this.companyId) {
            alert(
                'Company information not found.'
            );
            this.router.navigate([
                '/applicant'
            ]);
            return;
        }
        // ==================================================
        // APPLICANT FORM
        // ==================================================
        this.applicantForm = this.fb.group({
            FirstName: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(100)
                ]
            ],
            LastName: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(100)
                ]
            ],
            Email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                    Validators.maxLength(150)
                ]
            ],
            MobileNo: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(20)
                ]
            ],
            DOB: [
                null
            ],
            Gender: [
                null
            ],
            CurrentCity: [
                '',
                Validators.maxLength(100)
            ],
            CurrentCompany: [
                '',
                Validators.maxLength(150)
            ],
            CurrentCTC: [
                null,
                Validators.min(0)
            ],
            ExpectedCTC: [
                null,
                Validators.min(0)
            ],
            NoticePeriod: [
                '',
                Validators.maxLength(50)
            ],
            LinkedInUrl: [
                '',
                Validators.maxLength(255)
            ]
        });
        // ==================================================
        // EDUCATION FORM
        // ==================================================
        this.educationForm = this.fb.group({
            Degree: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(100)
                ]
            ],
            Institute: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(150)
                ]
            ],
            University: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(150)
                ]
            ],
            PassingYear: [
                null,
                [
                    Validators.required,
                    Validators.min(1900),
                    Validators.max(2100)
                ]
            ],
            Percentage: [
                null,
                [
                    Validators.required,
                    Validators.min(0),
                    Validators.max(100)
                ]
            ]
        });
        // ==================================================
        // WORK EXPERIENCE FORM
        // ==================================================
        this.workExperienceForm =
            this.fb.group({
                CompanyName: [
                    '',
                    [
                        Validators.required,
                        Validators.maxLength(150)
                    ]
                ],
                Designation: [
                    '',
                    [
                        Validators.required,
                        Validators.maxLength(100)
                    ]
                ],
                StartDate: [
                    null,
                    Validators.required
                ],
                EndDate: [
                    null
                ],
                CurrentlyWorking: [
                    false
                ],
                Responsibilities: [
                    ''
                ]
            });
    }
    // ==================================================
    // PERMISSION
    // ==================================================
    hasPermission(
        permission: string
    ): boolean {
        return this.authService.hasPermission(
            permission
        );
    }
    // ==================================================
    // SAVE APPLICANT
    // ==================================================
    saveApplicant(): void {
        if (
            !this.authService.hasPermission(
                'CREATE_APPLICANT'
            )
        ) {
            alert(
                'You do not have permission to create applicants.'
            );
            return;
        }
        if (
            this.applicantForm.invalid
        ) {
            this.applicantForm.markAllAsTouched();
            return;
        }
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            alert(
                'Company information not found.'
            );
            return;
        }
        this.loading = true;
        const data =
            this.applicantForm.getRawValue();
        // ==================================================
        // FORMAT DOB
        // ==================================================
        if (data.DOB) {
            const date =
                new Date(data.DOB);
            const year =
                date.getFullYear();
            const month =
                String(
                    date.getMonth() + 1
                ).padStart(2, '0');
            const day =
                String(
                    date.getDate()
                ).padStart(2, '0');
            data.DOB =
                `${year}-${month}-${day}`;
        }
        delete data.CompanyId;
        // ==================================================
        // CREATE APPLICANT
        // ==================================================
        this.applicantService
            .addApplicant(data)
            .subscribe({
                next: (response: any) => {
                    this.loading = false;
                    console.log(
                        'Applicant created:',
                        response
                    );
                    this.applicantId =
                        response.ApplicantId;
                    if (!this.applicantId) {
                        alert(
                            'Applicant created, but Applicant ID was not returned.'
                        );
                        return;
                    }
                    this.applicantCreated = true;
                    this.applicantForm.disable();
                    // Open Skills
                    this.activeSection =
                        'skills';
                    // Reset skill state
                    this.availableSkills = [];
                    this.skills = [];
                    this.selectedSkillIds = [];
                    this.skillsLoaded = false;
                    // Load company skills
                    this.loadSkills();
                    alert(
                        'Applicant created successfully.'
                    );
                },
                error: (err: any) => {
                    console.error(
                        'Error adding applicant:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to add applicant.'
                    );
                }
            });
    }
    // ==================================================
    // SHOW SECTION
    // ==================================================
    showSection(
        section: string
    ): void {
        if (!this.applicantId) {
            alert(
                'Please save the applicant first.'
            );
            return;
        }
        this.activeSection =
            section;
        // ==================================================
        // SKILLS
        // ==================================================
        if (
            section === 'skills'
        ) {
            this.loadSkills();
        }
        // ==================================================
        // EDUCATION
        // ==================================================
        if (
            section === 'education'
        ) {
            this.loadEducation();
        }
        // ==================================================
        // WORK EXPERIENCE
        // ==================================================
        if (
            section === 'work-experience'
        ) {
            this.loadWorkExperience();
        }
        // ==================================================
        // DOCUMENTS
        // ==================================================
        if (
            section === 'documents'
        ) {
            this.loadDocuments();
        }
    }
    // ==================================================
    // LOAD COMPANY SKILLS
    // ==================================================
    loadSkills(): void {
        if (!this.companyId) {
            console.error('CompanyId missing');
            return;
        }

        console.log('loadSkills CALLED');
        this.skillsLoading = true;

        this.skillService
            .getSkills('', this.companyId, 'SkillName', 'asc', 1, 1000)
            .subscribe({
                next: (response: any) => {
                    console.log('FULL SKILLS RESPONSE:', response);

                    this.availableSkills = Array.isArray(response?.data)
                        ? response.data
                        : [];

                    console.log('AVAILABLE SKILLS:', this.availableSkills);
                    console.log('SKILL COUNT:', this.availableSkills.length);

                    this.skillsLoading = false;

                    console.log(
                        'FINAL SkillsLoading:',
                        this.skillsLoading
                    );

                    this.loadApplicantSkills();
                },

                error: (err: any) => {
                    console.error('Error loading master skills:', err);

                    this.availableSkills = [];
                    this.skillsLoading = false;

                    console.log(
                        'skillsLoading AFTER ERROR:',
                        this.skillsLoading
                    );
                }
            });
    }
    // ==================================================
    // LOAD APPLICANT SKILLS
    // ==================================================
    loadApplicantSkills(): void {
        if (!this.applicantId) {
            return;
        }
        console.log(
            'Loading Applicant Skills for Applicant:',
            this.applicantId
        );
        this.applicantSkillService
            .getApplicantSkills(
                this.applicantId
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'Applicant Skills response:',
                        response
                    );
                    if (
                        Array.isArray(
                            response?.data
                        )
                    ) {
                        this.skills =
                            response.data;
                    } else {
                        this.skills = [];
                    }
                    console.log(
                        'Applicant Skills:',
                        this.skills
                    );
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error(
                        'Error loading applicant skills:',
                        err
                    );
                    // New applicant normally has no skills
                    this.skills = [];
                    this.cdr.detectChanges();
                }
            });
    }
    // ==================================================
    // GET SKILL NAME
    // ==================================================
    getSkillName(
        skillId: number
    ): string {
        const masterSkill =
            this.availableSkills.find(
                skill =>
                    Number(
                        skill.SkillId
                    ) === Number(skillId)
            );
        if (masterSkill) {
            return masterSkill.SkillName;
        }
        const applicantSkill =
            this.skills.find(
                skill =>
                    Number(
                        skill.SkillId
                    ) === Number(skillId)
            );
        return applicantSkill
            ? applicantSkill.SkillName
            : '';
    }
    // ==================================================
    // GET ONLY UNASSIGNED SKILLS
    // ==================================================
    getSelectableSkills(): any[] {
        const assignedSkillIds =
            this.skills.map(
                skill =>
                    Number(skill.SkillId)
            );
        return this.availableSkills.filter(
            skill =>
                !assignedSkillIds.includes(
                    Number(skill.SkillId)
                )
        );
    }
    // ==================================================
    // ADD MULTIPLE SKILLS
    // ==================================================
    addSkill(): void {

        if (!this.applicantId) {
            alert('Please save the applicant first.');
            return;
        }

        if (this.skillLoading) {
            return;
        }

        if (
            !this.selectedSkillIds ||
            this.selectedSkillIds.length === 0
        ) {
            alert('Please select at least one skill.');
            return;
        }

        // --------------------------------------------------
        // SAVE CURRENT SELECTION
        // --------------------------------------------------

        const selectedIds = [
            ...this.selectedSkillIds
        ];

        console.log(
            'Selected Skills:',
            selectedIds
        );

        console.log(
            'Applicant ID:',
            this.applicantId
        );

        // --------------------------------------------------
        // START LOADING
        // --------------------------------------------------

        this.skillLoading = true;

        this.cdr.detectChanges();

        // --------------------------------------------------
        // CREATE REQUESTS
        // --------------------------------------------------

        const requests = selectedIds.map(
            (skillId: number) => {

                const data = {
                    ApplicantId: Number(this.applicantId),
                    SkillId: Number(skillId)
                };

                console.log(
                    'Adding Applicant Skill:',
                    data
                );

                return this.applicantSkillService
                    .addApplicantSkill(data);
            }
        );

        // --------------------------------------------------
        // SAVE ALL SELECTED SKILLS
        // --------------------------------------------------

        forkJoin(requests).subscribe({

            next: (responses: any[]) => {

                console.log(
                    'All Applicant Skills Added:',
                    responses
                );

                // --------------------------------------------------
                // ADD SKILLS TO UI IMMEDIATELY
                // --------------------------------------------------

                selectedIds.forEach(
                    (skillId: number) => {

                        const masterSkill =
                            this.availableSkills.find(
                                skill =>
                                    Number(skill.SkillId) ===
                                    Number(skillId)
                            );

                        if (!masterSkill) {
                            return;
                        }

                        // Prevent duplicate display
                        const alreadyExists =
                            this.skills.some(
                                skill =>
                                    Number(skill.SkillId) ===
                                    Number(skillId)
                            );

                        if (!alreadyExists) {

                            this.skills = [
                                ...this.skills,
                                {
                                    SkillId:
                                        masterSkill.SkillId,

                                    SkillName:
                                        masterSkill.SkillName
                                }
                            ];
                        }
                    }
                );

                // --------------------------------------------------
                // CLEAR DROPDOWN
                // --------------------------------------------------

                this.selectedSkillIds = [];

                // --------------------------------------------------
                // STOP SAVING
                // --------------------------------------------------

                this.skillLoading = false;

                // --------------------------------------------------
                // FORCE UI UPDATE
                // --------------------------------------------------

                this.cdr.detectChanges();

                console.log(
                    'Displayed Applicant Skills:',
                    this.skills
                );

                // --------------------------------------------------
                // LOAD FROM BACKEND
                // --------------------------------------------------

                this.loadApplicantSkills();

                alert(
                    'Skills added successfully.'
                );
            },

            error: (err: any) => {

                console.error(
                    'Error adding applicant skills:',
                    err
                );

                // IMPORTANT
                // Always stop Saving state

                this.skillLoading = false;

                this.cdr.detectChanges();

                alert(
                    err?.error?.detail ||
                    err?.error?.message ||
                    'Unable to add skills.'
                );
            }
        });
    }
    // ==================================================
    // EDUCATION
    // ==================================================
    loadEducation(): void {
        if (!this.applicantId) {
            return;
        }
        this.applicantEducationService
            .getEducations(
                this.applicantId
            )
            .subscribe({
                next: (response: any) => {
                    this.educations =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : response || [];
                },
                error: (err: any) => {
                    console.error(
                        'Error loading education:',
                        err
                    );
                    this.educations = [];
                }
            });
    }
    // ==================================================
    // ADD EDUCATION
    // ==================================================
    addEducation(): void {
        if (!this.applicantId) {
            return;
        }
        if (
            this.educationForm.invalid
        ) {
            this.educationForm
                .markAllAsTouched();
            return;
        }
        const data = {
            ApplicantId:
                this.applicantId,
            ...this.educationForm
                .getRawValue()
        };
        this.educationLoading = true;
        this.applicantEducationService
            .addEducation(data)
            .subscribe({
                next: () => {
                    this.educationLoading =
                        false;
                    this.educationForm.reset();
                    this.loadEducation();
                    alert(
                        'Education added successfully.'
                    );
                },
                error: (err: any) => {
                    this.educationLoading =
                        false;
                    alert(
                        err?.error?.detail ||
                        'Unable to add education.'
                    );
                }
            });
    }
    // ==================================================
    // WORK EXPERIENCE
    // ==================================================
    loadWorkExperience(): void {
        if (!this.applicantId) {
            return;
        }
        this.applicantWorkExperienceService
            .getWorkExperiences(
                this.applicantId
            )
            .subscribe({
                next: (response: any) => {
                    this.workExperiences =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : response || [];
                },
                error: (err: any) => {
                    console.error(
                        'Error loading work experience:',
                        err
                    );
                    this.workExperiences = [];
                }
            });
    }
    // ==================================================
    // ADD WORK EXPERIENCE
    // ==================================================
    addWorkExperience(): void {
        if (!this.applicantId) {
            return;
        }
        if (
            this.workExperienceForm.invalid
        ) {
            this.workExperienceForm
                .markAllAsTouched();
            return;
        }
        const data =
            this.workExperienceForm
                .getRawValue();
        // ==================================================
        // START DATE
        // ==================================================
        if (data.StartDate) {
            data.StartDate =
                this.formatDate(
                    new Date(
                        data.StartDate
                    )
                );
        }
        // ==================================================
        // END DATE
        // ==================================================
        if (
            data.EndDate &&
            !data.CurrentlyWorking
        ) {
            data.EndDate =
                this.formatDate(
                    new Date(
                        data.EndDate
                    )
                );
        }
        if (
            data.CurrentlyWorking
        ) {
            data.EndDate = null;
        }
        data.ApplicantId =
            this.applicantId;
        this.workExperienceLoading =
            true;
        this.applicantWorkExperienceService
            .addWorkExperience(data)
            .subscribe({
                next: () => {
                    this.workExperienceLoading =
                        false;
                    this.workExperienceForm
                        .reset({
                            CompanyName: '',
                            Designation: '',
                            StartDate: null,
                            EndDate: null,
                            CurrentlyWorking: false,
                            Responsibilities: ''
                        });
                    this.loadWorkExperience();
                    alert(
                        'Work experience added successfully.'
                    );
                },
                error: (err: any) => {
                    this.workExperienceLoading =
                        false;
                    alert(
                        err?.error?.detail ||
                        'Unable to add work experience.'
                    );
                }
            });
    }
    // ==================================================
    // DATE FORMAT
    // ==================================================
    formatDate(
        date: Date
    ): string {
        const year =
            date.getFullYear();
        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, '0');
        const day =
            String(
                date.getDate()
            ).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    // ==================================================
    // DOCUMENTS
    // ==================================================
    loadDocuments(): void {
        if (!this.applicantId) {
            return;
        }
        this.applicantDocumentService
            .getApplicantDocuments(
                this.applicantId
            )
            .subscribe({
                next: (response: any) => {
                    this.documents =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : response || [];
                },
                error: (err: any) => {
                    console.error(
                        'Error loading documents:',
                        err
                    );
                    this.documents = [];
                }
            });
    }
    // ==================================================
    // FILE SELECT
    // ==================================================
    onFileSelected(
        event: any
    ): void {
        const file =
            event.target.files?.[0];
        if (!file) {
            return;
        }
        this.selectedFile =
            file;
    }
    // ==================================================
    // UPLOAD DOCUMENT
    // ==================================================
    uploadDocument(): void {
        if (!this.applicantId) {
            alert(
                'Please save the applicant first.'
            );
            return;
        }
        if (!this.selectedFile) {
            alert(
                'Please select a document.'
            );
            return;
        }
        if (!this.documentType) {
            alert(
                'Please select document type.'
            );
            return;
        }
        this.documentLoading =
            true;
        this.applicantDocumentService
            .uploadDocument(
                this.applicantId,
                this.selectedFile,
                this.documentType
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'Document uploaded:',
                        response
                    );
                    this.documentLoading =
                        false;
                    alert(
                        'Document uploaded successfully.'
                    );
                    this.selectedFile =
                        null;
                    this.documentType =
                        '';
                    this.loadDocuments();
                },
                error: (err: any) => {
                    console.error(
                        'Document upload error:',
                        err
                    );
                    this.documentLoading =
                        false;
                    alert(
                        err?.error?.detail ||
                        'Unable to upload document.'
                    );
                }
            });
    }
    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate([
            '/applicant'
        ]);
    }
    // ==================================================
    // FINISH APPLICANT
    // ==================================================
    finishApplicant(): void {
        if (!this.applicantId) {
            alert(
                'Please save the applicant first.'
            );
            return;
        }
        this.router.navigate([
            '/applicant'
        ]);
    }
}