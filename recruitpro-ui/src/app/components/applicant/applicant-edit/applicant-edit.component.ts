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
    selector: 'app-applicant-edit',
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
    templateUrl:
        './applicant-edit.component.html'
})
export class ApplicantEditComponent
    implements OnInit {
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
    pageLoading = false;
    // ==================================================
    // ACTIVE SECTION
    // ==================================================
    activeSection:
        'skills' |
        'education' |
        'work-experience' |
        'documents'
        = 'skills';
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
        private skillService:
            SkillService,
        public authService:
            AuthService,
        private route:
            ActivatedRoute,
        private router:
            Router,
        private cdr:
            ChangeDetectorRef
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
        // GET APPLICANT ID
        // ==================================================
        const id =
            Number(
                this.route.snapshot
                    .paramMap
                    .get('id')
            );
        if (!id) {
            alert(
                'Applicant information not found.'
            );
            this.router.navigate([
                '/applicant'
            ]);
            return;
        }
        this.applicantId = id;
        // ==================================================
        // DEFAULT SECTION
        // ==================================================
        this.activeSection = 'skills';
        // ==================================================
        // LOAD APPLICANT
        // ==================================================
        this.loadApplicant();
        this.loadSkills();
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
    // PERMISSION
    // ==================================================
    hasPermission(
        permission: string
    ): boolean {
        return this.authService
            .hasPermission(
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
                    console.log(
                        'Applicant:',
                        response
                    );
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
    // UPDATE APPLICANT
    // ==================================================
    updateApplicant(): void {
        if (!this.applicantId) {
            return;
        }
        if (
            !this.authService.hasPermission(
                'UPDATE_APPLICANT'
            )
        ) {
            alert(
                'You do not have permission to update applicants.'
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
        this.loading = true;
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
        this.applicantService
            .updateApplicant(
                this.applicantId,
                data
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'Applicant updated:',
                        response
                    );
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
                    this.skillsLoading =
                        false;
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
            return masterSkill
                .SkillName;
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
        this.cdr.detectChanges();
        const requests =
            selectedIds.map(
                (
                    skillId: number
                ) => {
                    return this
                        .applicantSkillService
                        .addApplicantSkill({
                            ApplicantId:
                                Number(
                                    this.applicantId
                                ),
                            SkillId:
                                Number(
                                    skillId
                                )
                        });
                }
            );
        forkJoin(
            requests
        )
            .subscribe({
                next: () => {
                    selectedIds.forEach(
                        (
                            skillId: number
                        ) => {
                            const masterSkill =
                                this.availableSkills
                                    .find(
                                        skill =>
                                            Number(
                                                skill.SkillId
                                            ) ===
                                            Number(
                                                skillId
                                            )
                                    );
                            if (!masterSkill) {
                                return;
                            }
                            const exists =
                                this.skills.some(
                                    skill =>
                                        Number(
                                            skill.SkillId
                                        ) ===
                                        Number(
                                            skillId
                                        )
                                );
                            if (!exists) {
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
                    this.selectedSkillIds =
                        [];
                    this.skillLoading =
                        false;
                    this.cdr.detectChanges();
                    this.loadApplicantSkills();
                    alert(
                        'Skills added successfully.'
                    );
                },
                error: (err: any) => {
                    console.error(
                        'Error adding skills:',
                        err
                    );
                    this.skillLoading =
                        false;
                    this.cdr.detectChanges();
                    alert(
                        err?.error?.detail ||
                        'Unable to add skills.'
                    );
                }
            });
    }
    // ==================================================
    // REMOVE APPLICANT SKILL
    // ==================================================
    removeSkill(skill: any): void {
        const applicantSkillId =
            skill.ApplicantSkillId;
        if (!applicantSkillId) {
            console.error(
                'ApplicantSkillId not found:',
                skill
            );
            alert(
                'Unable to identify applicant skill.'
            );
            return;
        }
        const confirmed =
            confirm(
                `Remove ${skill.SkillName ||
                this.getSkillName(skill.SkillId)
                } from this applicant?`
            );
        if (!confirmed) {
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
                        'Error removing applicant skill:',
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
                    console.log(
                        'Education response:',
                        response
                    );
                    this.educations =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : Array.isArray(response)
                                ? response
                                : [];
                    console.log(
                        'Loaded Education:',
                        this.educations
                    );
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
            console.error(
                'Education ID not found:',
                education
            );
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
        this.cdr.detectChanges();
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
        // UPDATE EDUCATION
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
        // ADD EDUCATION
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
                    console.log(
                        'Work Experience response:',
                        response
                    );
                    this.workExperiences =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : Array.isArray(response)
                                ? response
                                : [];
                    console.log(
                        'Loaded Work Experiences:',
                        this.workExperiences
                    );
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
            console.error(
                'WorkExperienceId not found:',
                experience
            );
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
        this.cdr.detectChanges();
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
        // ==================================================
        // START DATE
        // ==================================================
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
            data.EndDate =
                null;
        }
        data.ApplicantId =
            this.applicantId;
        this.workExperienceLoading =
            true;
        // ==================================================
        // UPDATE EXPERIENCE
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
        // ADD EXPERIENCE
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
    // RESET WORK EXPERIENCE
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
            )
                .padStart(
                    2,
                    '0'
                );
        const day =
            String(
                date.getDate()
            )
                .padStart(
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
                    console.log(
                        'Documents response:',
                        response
                    );
                    this.documents =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : Array.isArray(response)
                                ? response
                                : [];
                    console.log(
                        'Loaded Documents:',
                        this.documents
                    );
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
        this.router.navigate([
            '/applicant'
        ]);
    }
}