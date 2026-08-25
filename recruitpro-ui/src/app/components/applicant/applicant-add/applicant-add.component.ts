import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    FormsModule
} from '@angular/forms';
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
    skills: any[] = [];
    availableSkills: any[] = [];

    selectedSkillIds: number[] = [];

    skillExperience: { [key: number]: number } = {};

    skillsLoading = false;
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
    constructor(
        private fb: FormBuilder,
        private applicantService: ApplicantService,
        private applicantSkillService: ApplicantSkillService,
        private applicantEducationService: ApplicantEducationService,
        private applicantWorkExperienceService: ApplicantWorkExperienceService,
        private applicantDocumentService: ApplicantDocumentService,
        private skillService: SkillService,
        public authService: AuthService,
        private router: Router
    ) { }
    ngOnInit(): void {
        // ==================================================
        // PERMISSION
        // ==================================================
        if (!this.authService.hasPermission('CREATE_APPLICANT')) {
            alert('You are not authorized to create applicants.');
            this.router.navigate(['/applicant']);
            return;
        }
        this.companyId = this.authService.getCompanyId();
        if (!this.companyId) {
            alert('Company information not found.');
            this.router.navigate(['/applicant']);
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
            DOB: [null],
            Gender: [null],
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
        this.workExperienceForm = this.fb.group({
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
            EndDate: [null],
            CurrentlyWorking: [false],
            Responsibilities: ['']
        });
    }
    // ==================================================
    // PERMISSION
    // ==================================================
    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }
    // ==================================================
    // SAVE APPLICANT
    // ==================================================
    saveApplicant(): void {
        if (!this.authService.hasPermission('CREATE_APPLICANT')) {
            alert('You do not have permission to create applicants.');
            return;
        }
        if (this.applicantForm.invalid) {
            this.applicantForm.markAllAsTouched();
            return;
        }
        const companyId = this.authService.getCompanyId();
        if (!companyId) {
            alert('Company information not found.');
            return;
        }
        this.loading = true;
        const data = this.applicantForm.getRawValue();
        // ==================================================
        // FORMAT DOB
        // ==================================================
        if (data.DOB) {
            const date = new Date(data.DOB);
            const year = date.getFullYear();
            const month = String(
                date.getMonth() + 1
            ).padStart(2, '0');
            const day = String(
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
                    // Store ApplicantId internally
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
                    // Open Skills section
                    this.activeSection = 'skills';
                    // Load existing applicant skills
                    this.loadSkills();
                    alert(
                        'Applicant created successfully.'
                    );
                },
                error: (err: any) => {
                    console.log(
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
    showSection(section: string): void {

        if (!this.applicantId) {

            alert(
                'Please save the applicant first.'
            );

            return;
        }

        this.activeSection = section;

        if (section === 'skills') {

            this.loadSkills();

        }

        if (section === 'education') {

            this.loadEducation();

        }

        if (section === 'work-experience') {

            this.loadWorkExperience();

        }

        if (section === 'documents') {

            this.loadDocuments();

        }

    }
    // ==================================================
    // LOAD COMPANY SKILLS + APPLICANT SKILLS
    // ==================================================

    loadSkills(): void {

        if (!this.applicantId || !this.companyId) {
            console.log(
                'Cannot load skills.',
                'ApplicantId:',
                this.applicantId,
                'CompanyId:',
                this.companyId
            );
            return;
        }

        this.skillsLoading = true;

        console.log(
            'Loading skills for company:',
            this.companyId
        );

        this.skillService
            .getSkills(
                '',
                this.companyId,
                'SkillName',
                'asc',
                1,
                1000
            )
            .subscribe({

                next: (response: any) => {

                    console.log(
                        'FULL SKILLS RESPONSE:',
                        response
                    );

                    if (Array.isArray(response?.data)) {

                        this.availableSkills = response.data;

                    } else {

                        this.availableSkills = [];

                    }

                    console.log(
                        'AVAILABLE SKILLS:',
                        this.availableSkills
                    );

                    console.log(
                        'SKILL COUNT:',
                        this.availableSkills.length
                    );

                    this.skillsLoading = false;

                    // Load skills already assigned
                    this.loadApplicantSkills();

                },

                error: (err: any) => {

                    console.error(
                        'Error loading master skills:',
                        err
                    );

                    this.availableSkills = [];

                    this.skillsLoading = false;

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

        this.applicantSkillService
            .getApplicantSkills(this.applicantId)
            .subscribe({

                next: (response: any) => {

                    console.log(
                        'Applicant Skills response:',
                        response
                    );

                    if (Array.isArray(response?.data)) {

                        this.skills = response.data;

                    } else {

                        this.skills = [];

                    }

                    console.log(
                        'Applicant Skills:',
                        this.skills
                    );

                },

                error: (err: any) => {

                    console.error(
                        'Error loading applicant skills:',
                        err
                    );

                    this.skills = [];

                }

            });
    }
    // ==================================================
    // GET SKILL NAME
    // ==================================================

    getSkillName(skillId: number): string {

        const skill = this.availableSkills.find(
            skill => Number(skill.SkillId) === Number(skillId)
        );

        return skill
            ? skill.SkillName
            : '';
    }
    // ==================================================
    // ADD MULTIPLE SKILLS
    // ==================================================
    addSkill(): void {

        if (!this.applicantId) {

            alert(
                'Please save the applicant first.'
            );

            return;
        }

        if (
            !this.selectedSkillIds ||
            this.selectedSkillIds.length === 0
        ) {

            alert(
                'Please select at least one skill.'
            );

            return;
        }

        // Validate experience
        for (
            const skillId of this.selectedSkillIds
        ) {

            const experience =
                this.skillExperience[skillId];

            if (
                experience === undefined ||
                experience === null ||
                experience < 0
            ) {

                alert(
                    'Please enter experience for all selected skills.'
                );

                return;
            }

        }

        this.skillLoading = true;

        const requests =
            this.selectedSkillIds.map(
                (skillId: number) => {

                    const data = {

                        ApplicantId: this.applicantId,

                        SkillId: skillId,

                        ExperienceInYears:
                            this.skillExperience[skillId]

                    };

                    console.log(
                        'Adding Applicant Skill:',
                        data
                    );

                    return this.applicantSkillService
                        .addApplicantSkill(data);

                }
            );

        let completed = 0;
        let failed = false;

        requests.forEach(request => {

            request.subscribe({

                next: (response: any) => {

                    console.log(
                        'Applicant Skill added:',
                        response
                    );

                    completed++;

                    if (
                        completed === requests.length &&
                        !failed
                    ) {

                        this.skillLoading = false;

                        this.selectedSkillIds = [];

                        this.skillExperience = {};

                        this.loadApplicantSkills();

                        alert(
                            'Skills added successfully.'
                        );

                    }

                },

                error: (err: any) => {

                    failed = true;

                    this.skillLoading = false;

                    console.error(
                        'Error adding applicant skill:',
                        err
                    );

                    alert(
                        err?.error?.detail ||
                        'Unable to add skills.'
                    );

                }

            });

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
                        response || [];
                },
                error: (err: any) => {
                    console.log(
                        'Error loading education:',
                        err
                    );
                }
            });
    }
    addEducation(): void {
        if (!this.applicantId) {
            return;
        }
        if (this.educationForm.invalid) {
            this.educationForm.markAllAsTouched();
            return;
        }
        const data = {
            ApplicantId:
                this.applicantId,
            ...this.educationForm.getRawValue()
        };
        this.educationLoading = true;
        this.applicantEducationService
            .addEducation(data)
            .subscribe({
                next: () => {
                    this.educationLoading = false;
                    this.educationForm.reset();
                    this.loadEducation();
                    alert(
                        'Education added successfully.'
                    );
                },
                error: (err: any) => {
                    this.educationLoading = false;
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
                        response || [];
                },
                error: (err: any) => {
                    console.log(
                        'Error loading work experience:',
                        err
                    );
                }
            });
    }
    addWorkExperience(): void {
        if (!this.applicantId) {
            return;
        }
        if (this.workExperienceForm.invalid) {
            this.workExperienceForm.markAllAsTouched();
            return;
        }
        const data =
            this.workExperienceForm.getRawValue();
        if (data.StartDate) {
            data.StartDate =
                this.formatDate(
                    new Date(data.StartDate)
                );
        }
        if (
            data.EndDate &&
            !data.CurrentlyWorking
        ) {
            data.EndDate =
                this.formatDate(
                    new Date(data.EndDate)
                );
        }
        if (data.CurrentlyWorking) {
            data.EndDate = null;
        }
        data.ApplicantId =
            this.applicantId;
        this.workExperienceLoading = true;
        this.applicantWorkExperienceService
            .addWorkExperience(data)
            .subscribe({
                next: () => {
                    this.workExperienceLoading = false;
                    this.workExperienceForm.reset({
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
                    this.workExperienceLoading = false;
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
    formatDate(date: Date): string {
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
                        response || [];
                },
                error: (err: any) => {
                    console.log(
                        'Error loading documents:',
                        err
                    );
                }
            });
    }
    // ==================================================
    // FILE SELECT
    // ==================================================
    onFileSelected(event: any): void {
        const file =
            event.target.files?.[0];
        if (!file) {
            return;
        }
        this.selectedFile = file;
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
        this.documentLoading = true;
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
                    this.documentLoading = false;
                    alert(
                        'Document uploaded successfully.'
                    );
                    this.selectedFile = null;
                    this.documentType = '';
                    this.loadDocuments();
                },
                error: (err: any) => {
                    console.error(
                        'Document upload error:',
                        err
                    );
                    this.documentLoading = false;
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