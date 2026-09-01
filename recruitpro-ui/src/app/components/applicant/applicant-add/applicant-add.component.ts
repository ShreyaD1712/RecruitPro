import {
    Component,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    FormsModule
} from '@angular/forms';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import { forkJoin } from 'rxjs';
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
    // MODE
    // ==================================================
    isEditMode = false;
    // ==================================================
    // APPLICANT
    // ==================================================
    applicantForm!: FormGroup;
    applicantId: number | null = null;
    companyId: number | null = null;
    applicantCreated = false;
    loading = false;
    pageLoading = false;
    genders = [
        'Male',
        'Female',
        'Other'
    ];
    // ==================================================
    // ACTIVE SECTION
    // ==================================================
    activeSection:
        '' |
        'skills' |
        'education' |
        'work-experience' |
        'documents' = '';
    // ==================================================
    // SKILLS
    // ==================================================
    availableSkills: any[] = [];
    skills: any[] = [];
    selectedSkillIds: number[] = [];
    skillsLoading = false;
    skillLoading = false;
    // ==================================================
    // EDUCATION
    // ==================================================
    educationForm!: FormGroup;
    educations: any[] = [];
    educationLoading = false;
    editingEducationId: number | null = null;
    // ==================================================
    // WORK EXPERIENCE
    // ==================================================
    workExperienceForm!: FormGroup;
    workExperiences: any[] = [];
    workExperienceLoading = false;
    editingWorkExperienceId: number | null = null;
    // ==================================================
    // DOCUMENTS
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
        private applicantWorkExperienceService: ApplicantWorkExperienceService,
        private applicantDocumentService: ApplicantDocumentService,
        private skillService: SkillService,
        public authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }
    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        const id =
            this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.applicantId = Number(id);
            this.applicantCreated = true;
        }
        // ==================================================
        // PERMISSION CHECK
        // ==================================================
        if (
            !this.isEditMode &&
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
        if (
            this.isEditMode &&
            !this.authService.hasPermission(
                'UPDATE_APPLICANT'
            )
        ) {
            alert(
                'You are not authorized to update applicants.'
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
        // INITIALIZE FORMS
        // ==================================================
        this.initializeApplicantForm();
        this.initializeEducationForm();
        this.initializeWorkExperienceForm();
        // ==================================================
        // EDIT MODE
        // ==================================================
        if (
            this.isEditMode &&
            this.applicantId
        ) {
            this.activeSection = 'skills';
            this.loadApplicant();
            this.loadSkills();
        }
    }
    // ==================================================
    // INITIALIZE APPLICANT FORM
    // ==================================================
    initializeApplicantForm(): void {
        this.applicantForm =
            this.fb.group({
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
    }
    // ==================================================
    // INITIALIZE EDUCATION FORM
    // ==================================================
    initializeEducationForm(): void {
        this.educationForm =
            this.fb.group({
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
    }
    // ==================================================
    // INITIALIZE WORK EXPERIENCE FORM
    // ==================================================
    initializeWorkExperienceForm(): void {
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
    // PERMISSION CHECK
    // ==================================================
    hasPermission(
        permission: string
    ): boolean {
        return this.authService.hasPermission(
            permission
        );
    }
    // ==================================================
    // LOAD APPLICANT
    // ==================================================
    loadApplicant(): void {
        if (!this.applicantId) {
            return;
        }
        this.pageLoading = true;
        this.applicantService
            .getApplicantById(
                this.applicantId
            )
            .subscribe({
                next: (response: any) => {
                    const applicant =
                        response?.data ||
                        response;
                    this.applicantForm.patchValue({
                        FirstName:
                            applicant.FirstName,
                        LastName:
                            applicant.LastName,
                        Email:
                            applicant.Email,
                        MobileNo:
                            applicant.MobileNo,
                        DOB:
                            applicant.DOB
                                ? new Date(
                                    applicant.DOB
                                )
                                : null,
                        Gender:
                            applicant.Gender,
                        CurrentCity:
                            applicant.CurrentCity,
                        CurrentCompany:
                            applicant.CurrentCompany,
                        CurrentCTC:
                            applicant.CurrentCTC,
                        ExpectedCTC:
                            applicant.ExpectedCTC,
                        NoticePeriod:
                            applicant.NoticePeriod,
                        LinkedInUrl:
                            applicant.LinkedInUrl
                    });
                    this.pageLoading = false;
                },
                error: (err: any) => {
                    console.error(
                        'Error loading applicant:',
                        err
                    );
                    this.pageLoading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to load applicant.'
                    );
                    this.router.navigate([
                        '/applicant'
                    ]);
                }
            });
    }
    // ==================================================
    // SAVE APPLICANT
    // ==================================================
    saveApplicant(): void {
        const requiredPermission =
            this.isEditMode
                ? 'UPDATE_APPLICANT'
                : 'CREATE_APPLICANT';
        if (
            !this.authService.hasPermission(
                requiredPermission
            )
        ) {
            alert(
                'You do not have permission to perform this action.'
            );
            return;
        }
        if (
            this.applicantForm.invalid
        ) {
            this.applicantForm
                .markAllAsTouched();
            return;
        }
        const data =
            this.applicantForm
                .getRawValue();
        // ==================================================
        // FORMAT DOB
        // ==================================================
        if (data.DOB) {
            data.DOB =
                this.formatDate(
                    new Date(
                        data.DOB
                    )
                );
        }
        delete data.CompanyId;
        this.loading = true;
        if (
            this.isEditMode &&
            this.applicantId
        ) {
            this.updateApplicant(
                data
            );
        } else {
            this.createApplicant(
                data
            );
        }
    }
    // ==================================================
    // CREATE APPLICANT
    // ==================================================
    createApplicant(
        data: any
    ): void {
        this.applicantService
            .addApplicant(
                data
            )
            .subscribe({
                next: (response: any) => {
                    this.loading = false;
                    this.applicantId =
                        response.ApplicantId;
                    if (!this.applicantId) {
                        alert(
                            'Applicant created, but Applicant ID was not returned.'
                        );
                        return;
                    }
                    this.applicantCreated =
                        true;
                    this.applicantForm
                        .disable();
                    this.activeSection =
                        'skills';
                    this.availableSkills = [];
                    this.skills = [];
                    this.selectedSkillIds = [];
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
    // UPDATE APPLICANT
    // ==================================================
    updateApplicant(
        data: any
    ): void {
        if (!this.applicantId) {
            return;
        }
        this.applicantService
            .updateApplicant(
                this.applicantId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Applicant updated successfully.'
                    );
                },
                error: (err: any) => {
                    console.error(
                        'Error updating applicant:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to update applicant.'
                    );
                }
            });
    }
    // ==================================================
    // SHOW SECTION
    // ==================================================
    showSection(
        section:
            'skills' |
            'education' |
            'work-experience' |
            'documents'
    ): void {
        if (!this.applicantId) {
            alert(
                'Please save the applicant first.'
            );
            return;
        }
        this.activeSection =
            section;
        if (
            section === 'skills'
        ) {
            this.loadSkills();
        }
        if (
            section === 'education'
        ) {
            this.loadEducation();
        }
        if (
            section === 'work-experience'
        ) {
            this.loadWorkExperience();
        }
        if (
            section === 'documents'
        ) {
            this.loadDocuments();
        }
    }
    // ==================================================
    // LOAD MASTER SKILLS
    // ==================================================
    loadSkills(): void {
        if (
            !this.companyId ||
            !this.applicantId
        ) {
            return;
        }
        this.skillsLoading = true;
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
                    this.availableSkills =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : [];
                    this.skillsLoading =
                        false;
                    this.loadApplicantSkills();
                },
                error: (err: any) => {
                    console.error(
                        'Error loading skills:',
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
            .getApplicantSkills(
                this.applicantId
            )
            .subscribe({
                next: (response: any) => {
                    this.skills =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : [];
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error(
                        'Error loading applicant skills:',
                        err
                    );
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
                    ) ===
                    Number(
                        skillId
                    )
            );
        if (masterSkill) {
            return masterSkill.SkillName;
        }
        const applicantSkill =
            this.skills.find(
                skill =>
                    Number(
                        skill.SkillId
                    ) ===
                    Number(
                        skillId
                    )
            );
        return applicantSkill
            ? applicantSkill.SkillName
            : '';
    }
    // ==================================================
    // SELECTABLE SKILLS
    // ==================================================
    getSelectableSkills(): any[] {
        const assignedSkillIds =
            this.skills.map(
                skill =>
                    Number(
                        skill.SkillId
                    )
            );
        return this.availableSkills
            .filter(
                skill =>
                    !assignedSkillIds.includes(
                        Number(
                            skill.SkillId
                        )
                    )
            );
    }
    // ==================================================
    // ADD SKILLS
    // ==================================================
    addSkill(): void {
        if (!this.applicantId) {
            return;
        }
        if (this.skillLoading) {
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
        const selectedIds = [
            ...this.selectedSkillIds
        ];
        this.skillLoading = true;
        const requests =
            selectedIds.map(
                (skillId: number) =>
                    this.applicantSkillService
                        .addApplicantSkill({
                            ApplicantId:
                                Number(
                                    this.applicantId
                                ),
                            SkillId:
                                Number(
                                    skillId
                                )
                        })
            );
        forkJoin(
            requests
        )
            .subscribe({
                next: () => {
                    this.selectedSkillIds = [];
                    this.skillLoading = false;
                    this.loadApplicantSkills();
                    this.cdr.detectChanges();
                    alert(
                        'Skills added successfully.'
                    );
                },
                error: (err: any) => {
                    console.error(
                        'Error adding skills:',
                        err
                    );
                    this.skillLoading = false;
                    this.cdr.detectChanges();
                    alert(
                        err?.error?.detail ||
                        'Unable to add skills.'
                    );
                }
            });
    }
    // ==================================================
    // REMOVE SKILL
    // ==================================================
    removeSkill(
        skill: any
    ): void {
        const applicantSkillId =
            skill.ApplicantSkillId;
        if (!applicantSkillId) {
            alert(
                'Unable to identify applicant skill.'
            );
            return;
        }
        if (
            !confirm(
                `Remove ${skill.SkillName ||
                this.getSkillName(
                    skill.SkillId
                )
                } from this applicant?`
            )
        ) {
            return;
        }
        this.applicantSkillService
            .deleteApplicantSkill(
                applicantSkillId
            )
            .subscribe({
                next: () => {
                    this.skills =
                        this.skills.filter(
                            item =>
                                Number(
                                    item.ApplicantSkillId
                                ) !==
                                Number(
                                    applicantSkillId
                                )
                        );
                    this.cdr.detectChanges();
                    alert(
                        'Skill removed successfully.'
                    );
                },
                error: (err: any) => {
                    console.error(
                        'Error removing skill:',
                        err
                    );
                    alert(
                        err?.error?.detail ||
                        'Unable to remove skill.'
                    );
                }
            });
    }
    // ==================================================
    // LOAD EDUCATION
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
                            : Array.isArray(
                                response
                            )
                                ? response
                                : [];
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error(
                        'Error loading education:',
                        err
                    );
                    this.educations = [];
                    this.cdr.detectChanges();
                }
            });
    }
    // ==================================================
    // EDIT EDUCATION
    // ==================================================
    editEducation(
        education: any
    ): void {
        this.editingEducationId =
            education.ApplicantEducationId ||
            education.EducationId;
        if (
            !this.editingEducationId
        ) {
            return;
        }
        this.educationForm
            .patchValue({
                Degree:
                    education.Degree,
                Institute:
                    education.Institute,
                University:
                    education.University,
                PassingYear:
                    education.PassingYear,
                Percentage:
                    education.Percentage
            });
    }
    // ==================================================
    // SAVE EDUCATION
    // ==================================================
    saveEducation(): void {
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
        this.educationLoading =
            true;
        // ==================================================
        // UPDATE
        // ==================================================
        if (
            this.editingEducationId
        ) {
            this.applicantEducationService
                .updateEducation(
                    this.editingEducationId,
                    data
                )
                .subscribe({
                    next: () => {
                        this.educationLoading =
                            false;
                        this.editingEducationId =
                            null;
                        this.educationForm
                            .reset();
                        this.loadEducation();
                        alert(
                            'Education updated successfully.'
                        );
                    },
                    error: (err: any) => {
                        this.educationLoading =
                            false;
                        alert(
                            err?.error?.detail ||
                            'Unable to update education.'
                        );
                    }
                });
            return;
        }
        // ==================================================
        // ADD
        // ==================================================
        this.applicantEducationService
            .addEducation(
                data
            )
            .subscribe({
                next: () => {
                    this.educationLoading =
                        false;
                    this.educationForm
                        .reset();
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
    // CANCEL EDUCATION EDIT
    // ==================================================
    cancelEducationEdit(): void {
        this.editingEducationId =
            null;
        this.educationForm
            .reset();
    }
    // ==================================================
    // LOAD WORK EXPERIENCE
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
                            : Array.isArray(
                                response
                            )
                                ? response
                                : [];
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error(
                        'Error loading work experience:',
                        err
                    );
                    this.workExperiences = [];
                    this.cdr.detectChanges();
                }
            });
    }
    // ==================================================
    // EDIT WORK EXPERIENCE
    // ==================================================
    editWorkExperience(
        experience: any
    ): void {
        this.editingWorkExperienceId =
            experience.WorkExperienceId;
        if (
            !this.editingWorkExperienceId
        ) {
            return;
        }
        this.workExperienceForm
            .patchValue({
                CompanyName:
                    experience.CompanyName,
                Designation:
                    experience.Designation,
                StartDate:
                    experience.StartDate
                        ? new Date(
                            experience.StartDate
                        )
                        : null,
                EndDate:
                    experience.EndDate
                        ? new Date(
                            experience.EndDate
                        )
                        : null,
                CurrentlyWorking:
                    experience.CurrentlyWorking,
                Responsibilities:
                    experience.Responsibilities
            });
    }
    // ==================================================
    // SAVE WORK EXPERIENCE
    // ==================================================
    saveWorkExperience(): void {
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
        if (
            data.StartDate
        ) {
            data.StartDate =
                this.formatDate(
                    new Date(
                        data.StartDate
                    )
                );
        }
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
        // ==================================================
        // UPDATE
        // ==================================================
        if (
            this.editingWorkExperienceId
        ) {
            this.applicantWorkExperienceService
                .updateWorkExperience(
                    this.editingWorkExperienceId,
                    data
                )
                .subscribe({
                    next: () => {
                        this.workExperienceLoading =
                            false;
                        this.editingWorkExperienceId =
                            null;
                        this.resetWorkExperienceForm();
                        this.loadWorkExperience();
                        alert(
                            'Work experience updated successfully.'
                        );
                    },
                    error: (err: any) => {
                        this.workExperienceLoading =
                            false;
                        alert(
                            err?.error?.detail ||
                            'Unable to update work experience.'
                        );
                    }
                });
            return;
        }
        // ==================================================
        // ADD
        // ==================================================
        this.applicantWorkExperienceService
            .addWorkExperience(
                data
            )
            .subscribe({
                next: () => {
                    this.workExperienceLoading =
                        false;
                    this.resetWorkExperienceForm();
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
    // RESET WORK EXPERIENCE FORM
    // ==================================================
    resetWorkExperienceForm(): void {
        this.workExperienceForm
            .reset({
                CompanyName: '',
                Designation: '',
                StartDate: null,
                EndDate: null,
                CurrentlyWorking: false,
                Responsibilities: ''
            });
    }
    // ==================================================
    // CANCEL WORK EXPERIENCE EDIT
    // ==================================================
    cancelWorkExperienceEdit(): void {
        this.editingWorkExperienceId =
            null;
        this.resetWorkExperienceForm();
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
            ).padStart(
                2,
                '0'
            );
        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                '0'
            );
        return `${year}-${month}-${day}`;
    }
    // ==================================================
    // LOAD DOCUMENTS
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
                            : Array.isArray(
                                response
                            )
                                ? response
                                : [];
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error(
                        'Error loading documents:',
                        err
                    );
                    this.documents = [];
                    this.cdr.detectChanges();
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
                next: () => {
                    this.documentLoading =
                        false;
                    this.selectedFile =
                        null;
                    this.documentType =
                        '';
                    this.loadDocuments();
                    alert(
                        'Document uploaded successfully.'
                    );
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
    // FINISH
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