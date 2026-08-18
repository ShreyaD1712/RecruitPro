import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { JobOpeningService } from '../../../services/job-opening.service';
import { DepartmentService } from '../../../services/department.service';
import { DesignationService } from '../../../services/designation.service';
import { JobCategoryService } from '../../../services/job-category.service';
import { EmploymentTypeService } from '../../../services/employment-type.service';
import { ExperienceLevelService } from '../../../services/experience-level.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-job-opening-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    templateUrl: './job-opening-edit.component.html',
})
export class JobOpeningEditComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    jobOpeningForm!: FormGroup;
    // ==================================================
    // JOB OPENING ID
    // ==================================================
    jobOpeningId!: number;
    // ==================================================
    // DROPDOWN DATA
    // ==================================================
    departments: any[] = [];
    designations: any[] = [];
    jobCategories: any[] = [];
    employmentTypes: any[] = [];
    experienceLevels: any[] = [];
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private jobOpeningService: JobOpeningService,
        private departmentService: DepartmentService,
        private designationService: DesignationService,
        private jobCategoryService: JobCategoryService,
        private employmentTypeService: EmploymentTypeService,
        private experienceLevelService: ExperienceLevelService,
        public authService: AuthService
    ) { }
    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        // ----------------------------------------------
        // Permission Check
        // ----------------------------------------------
        if (
            !this.hasPermission(
                'UPDATE_JOB_OPENING'
            )
        ) {
            alert(
                'You are not authorized to edit job openings.'
            );
            this.router.navigate([
                '/job-opening'
            ]);
            return;
        }
        // ----------------------------------------------
        // Get Job Opening ID
        // ----------------------------------------------
        this.jobOpeningId = Number(
            this.route.snapshot.paramMap.get('id')
        );
        if (!this.jobOpeningId) {
            alert(
                'Invalid Job Opening ID.'
            );
            this.router.navigate([
                '/job-opening'
            ]);
            return;
        }
        // ----------------------------------------------
        // Create Form
        // ----------------------------------------------
        this.jobOpeningForm = this.fb.group({
            DepartmentId: [
                null,
                Validators.required
            ],
            DesignationId: [
                null,
                Validators.required
            ],
            JobCategoryId: [
                null,
                Validators.required
            ],
            EmploymentTypeId: [
                null,
                Validators.required
            ],
            ExperienceLevelId: [
                null,
                Validators.required
            ],
            JobTitle: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(150)
                ]
            ],
            JobDescription: [
                '',
                Validators.maxLength(5000)
            ],
            Location: [
                '',
                Validators.maxLength(150)
            ],
            NoOfVacancies: [
                1,
                [
                    Validators.required,
                    Validators.min(1)
                ]
            ],
            SalaryFrom: [
                null,
                Validators.min(0)
            ],
            SalaryTo: [
                null,
                Validators.min(0)
            ],
            Status: [
                'Open',
                Validators.required
            ]
        });
        // ----------------------------------------------
        // Load Dropdowns
        // ----------------------------------------------
        this.loadDepartments();
        this.loadJobCategories();
        this.loadEmploymentTypes();
        this.loadExperienceLevels();
        // ----------------------------------------------
        // Load Job Opening
        // ----------------------------------------------
        this.loadJobOpening();
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
    // LOAD DEPARTMENTS
    // ==================================================
    loadDepartments(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            alert(
                'Company information not found.'
            );
            return;
        }
        this.departmentService
            .getDepartments(
                '',
                companyId,
                'DepartmentName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.departments =
                        response.data || [];
                },
                error: (err: any) => {
                    console.log(
                        'Error loading departments:',
                        err
                    );
                    this.departments = [];
                }
            });
    }
    // ==================================================
    // LOAD DESIGNATIONS
    // ==================================================
    loadDesignations(
        departmentId?: number
    ): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            return;
        }
        this.designationService
            .getDesignations(
                '',
                companyId,
                departmentId ?? null,
                'DesignationName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    let data =
                        response.data || [];
                    // ----------------------------------
                    // Optional Department Filtering
                    // ----------------------------------
                    if (departmentId) {
                        data = data.filter(
                            (designation: any) =>
                                designation.DepartmentId ===
                                departmentId
                        );
                    }
                    this.designations =
                        data;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading designations:',
                        err
                    );
                    this.designations = [];
                }
            });
    }
    // ==================================================
    // DEPARTMENT CHANGE
    // ==================================================
    departmentChanged(): void {
        const departmentId =
            this.jobOpeningForm
                .get('DepartmentId')
                ?.value;
        // Reset designation
        this.jobOpeningForm
            .patchValue({
                DesignationId: null
            });
        this.designations = [];
        if (!departmentId) {
            return;
        }
        this.loadDesignations(
            departmentId
        );
    }
    // ==================================================
    // LOAD JOB CATEGORIES
    // ==================================================
    loadJobCategories(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            return;
        }
        this.jobCategoryService
            .getJobCategories(
                '',
                companyId,
                'CategoryName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.jobCategories =
                        response.data || [];
                },
                error: (err: any) => {
                    console.log(
                        'Error loading job categories:',
                        err
                    );
                    this.jobCategories = [];
                }
            });
    }
    // ==================================================
    // LOAD EMPLOYMENT TYPES
    // ==================================================
    loadEmploymentTypes(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            return;
        }
        this.employmentTypeService
            .getEmploymentTypes(
                '',
                companyId,
                'EmploymentTypeName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.employmentTypes =
                        response.data || [];
                },
                error: (err: any) => {
                    console.log(
                        'Error loading employment types:',
                        err
                    );
                    this.employmentTypes = [];
                }
            });
    }
    // ==================================================
    // LOAD EXPERIENCE LEVELS
    // ==================================================
    loadExperienceLevels(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            return;
        }
        this.experienceLevelService
            .getExperienceLevels(
                '',
                companyId,
                'ExperienceLevelName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.experienceLevels =
                        response.data || [];
                },
                error: (err: any) => {
                    console.log(
                        'Error loading experience levels:',
                        err
                    );
                    this.experienceLevels = [];
                }
            });
    }
    // ==================================================
    // LOAD JOB OPENING
    // ==================================================
    loadJobOpening(): void {
        this.loading = true;
        this.jobOpeningService
            .getJobOpeningById(
                this.jobOpeningId
            )
            .subscribe({
                next: (jobOpening: any) => {
                    this.loading = false;
                    // ----------------------------------
                    // Company Security Check
                    // ----------------------------------
                    const loggedInCompanyId =
                        this.authService.getCompanyId();
                    if (
                        jobOpening.CompanyId !==
                        loggedInCompanyId
                    ) {
                        alert(
                            'You are not authorized to edit this job opening.'
                        );
                        this.router.navigate([
                            '/job-opening'
                        ]);
                        return;
                    }
                    // ----------------------------------
                    // Load Designations
                    // ----------------------------------
                    this.loadDesignations(
                        jobOpening.DepartmentId
                    );
                    // ----------------------------------
                    // Fill Form
                    // ----------------------------------
                    this.jobOpeningForm.patchValue({
                        DepartmentId:
                            jobOpening.DepartmentId,
                        DesignationId:
                            jobOpening.DesignationId,
                        JobCategoryId:
                            jobOpening.JobCategoryId,
                        EmploymentTypeId:
                            jobOpening.EmploymentTypeId,
                        ExperienceLevelId:
                            jobOpening.ExperienceLevelId,
                        JobTitle:
                            jobOpening.JobTitle,
                        JobDescription:
                            jobOpening.JobDescription,
                        Location:
                            jobOpening.Location,
                        NoOfVacancies:
                            jobOpening.NoOfVacancies,
                        SalaryFrom:
                            jobOpening.SalaryFrom,
                        SalaryTo:
                            jobOpening.SalaryTo,
                        Status:
                            jobOpening.Status
                    });
                },
                error: (err: any) => {
                    this.loading = false;
                    console.log(err);
                    alert(
                        err?.error?.detail ||
                        'Job Opening not found.'
                    );
                    this.router.navigate([
                        '/job-opening'
                    ]);
                }
            });
    }
    // ==================================================
    // UPDATE JOB OPENING
    // ==================================================
    updateJobOpening(): void {
        if (
            !this.hasPermission(
                'UPDATE_JOB_OPENING'
            )
        ) {
            alert(
                'You do not have permission to update job openings.'
            );
            return;
        }
        if (
            this.jobOpeningForm.invalid
        ) {
            this.jobOpeningForm.markAllAsTouched();
            return;
        }
        // ----------------------------------------------
        // Salary Validation
        // ----------------------------------------------
        const salaryFrom =
            this.jobOpeningForm
                .get('SalaryFrom')
                ?.value;
        const salaryTo =
            this.jobOpeningForm
                .get('SalaryTo')
                ?.value;
        if (
            salaryFrom !== null &&
            salaryFrom !== '' &&
            salaryTo !== null &&
            salaryTo !== '' &&
            Number(salaryFrom) > Number(salaryTo)
        ) {
            alert(
                'Salary From cannot be greater than Salary To.'
            );
            return;
        }
        // ----------------------------------------------
        // Get Form Data
        // ----------------------------------------------
        const data =
            this.jobOpeningForm.value;
        this.loading = true;
        // ----------------------------------------------
        // Update API
        // ----------------------------------------------
        this.jobOpeningService
            .updateJobOpening(
                this.jobOpeningId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Job Opening Updated Successfully'
                    );
                    this.router.navigate([
                        '/job-opening'
                    ]);
                },
                error: (err: any) => {
                    this.loading = false;
                    console.log(err);
                    alert(
                        err?.error?.detail ||
                        'Failed to update job opening.'
                    );
                }
            });
    }
    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate([
            '/job-opening'
        ]);
    }
}