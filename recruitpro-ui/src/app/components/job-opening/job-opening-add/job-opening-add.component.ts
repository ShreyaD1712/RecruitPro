import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
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
    selector: 'app-job-opening-add',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    templateUrl: './job-opening-add.component.html'
})
export class JobOpeningAddComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    jobOpeningForm!: FormGroup;
    // ==================================================
    // COMPANY
    // ==================================================
    companyId: number | null = null;
    // ==================================================
    // DROPDOWN DATA
    // ==================================================
    departments: any[] = [];
    designations: any[] = [];
    jobCategories: any[] = [];
    employmentTypes: any[] = [];
    experienceLevels: any[] = [];
    // ==================================================
    // STATUS
    // ==================================================
    statuses = [
        'Open',
        'Closed'
    ];
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    loadingDepartments = false;
    loadingDesignations = false;
    loadingJobCategories = false;
    loadingEmploymentTypes = false;
    loadingExperienceLevels = false;
    constructor(
        private fb: FormBuilder,
        private jobOpeningService: JobOpeningService,
        private departmentService: DepartmentService,
        private designationService: DesignationService,
        private jobCategoryService: JobCategoryService,
        private employmentTypeService: EmploymentTypeService,
        private experienceLevelService: ExperienceLevelService,
        public authService: AuthService,
        private router: Router
    ) { }
    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        // ----------------------------------------------
        // Permission Check
        // ----------------------------------------------
        if (
            !this.authService.hasPermission(
                'CREATE_JOB_OPENING'
            )
        ) {
            alert(
                'You are not authorized to create job openings.'
            );
            this.router.navigate([
                '/job-opening'
            ]);
            return;
        }
        // ----------------------------------------------
        // Get Logged-In User Company
        // ----------------------------------------------
        this.companyId =
            this.authService.getCompanyId();
        if (!this.companyId) {
            alert(
                'Company information not found.'
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
        // Department Change
        // ----------------------------------------------
        this.jobOpeningForm
            .get('DepartmentId')
            ?.valueChanges
            .subscribe((departmentId: number | null) => {
                this.designations = [];
                this.jobOpeningForm
                    .get('DesignationId')
                    ?.reset();
                if (departmentId) {
                    this.loadDesignations(
                        departmentId
                    );
                }
            });
        // ----------------------------------------------
        // Load Dropdowns
        // ----------------------------------------------
        this.loadDepartments();
        this.loadJobCategories();
        this.loadEmploymentTypes();
        this.loadExperienceLevels();
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
        if (!this.companyId) {
            return;
        }
        this.loadingDepartments = true;
        this.departmentService
            .getDepartments(
                '',
                this.companyId,
                'DepartmentName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.departments =
                        response.data || [];
                    this.loadingDepartments =
                        false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading departments:',
                        err
                    );
                    this.departments = [];
                    this.loadingDepartments =
                        false;
                    alert(
                        err?.error?.detail ||
                        'Unable to load departments.'
                    );
                }
            });
    }
    // ==================================================
    // LOAD DESIGNATIONS
    // ==================================================
    loadDesignations(
        departmentId: number
    ): void {
        if (!this.companyId) {
            return;
        }
        this.loadingDesignations = true;
        this.designationService
            .getDesignations(
                '',
                this.companyId,
                departmentId,
                'DesignationName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.designations =
                        response.data || [];
                    this.loadingDesignations =
                        false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading designations:',
                        err
                    );
                    this.designations = [];
                    this.loadingDesignations =
                        false;
                    alert(
                        err?.error?.detail ||
                        'Unable to load designations.'
                    );
                }
            });
    }
    // ==================================================
    // LOAD JOB CATEGORIES
    // ==================================================
    loadJobCategories(): void {
        if (!this.companyId) {
            return;
        }
        this.loadingJobCategories = true;
        this.jobCategoryService
            .getJobCategories(
                '',
                this.companyId,
                'CategoryName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.jobCategories =
                        response.data || [];
                    this.loadingJobCategories =
                        false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading job categories:',
                        err
                    );
                    this.jobCategories = [];
                    this.loadingJobCategories =
                        false;
                    alert(
                        err?.error?.detail ||
                        'Unable to load job categories.'
                    );
                }
            });
    }
    // ==================================================
    // LOAD EMPLOYMENT TYPES
    // ==================================================
    loadEmploymentTypes(): void {
        if (!this.companyId) {
            return;
        }
        this.loadingEmploymentTypes = true;
        this.employmentTypeService
            .getEmploymentTypes(
                '',
                this.companyId,
                'EmploymentTypeName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.employmentTypes =
                        response.data || [];
                    this.loadingEmploymentTypes =
                        false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading employment types:',
                        err
                    );
                    this.employmentTypes = [];
                    this.loadingEmploymentTypes =
                        false;
                    alert(
                        err?.error?.detail ||
                        'Unable to load employment types.'
                    );
                }
            });
    }
    // ==================================================
    // LOAD EXPERIENCE LEVELS
    // ==================================================
    loadExperienceLevels(): void {
        if (!this.companyId) {
            return;
        }
        this.loadingExperienceLevels = true;
        this.experienceLevelService
            .getExperienceLevels(
                '',
                this.companyId,
                'LevelName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.experienceLevels =
                        response.data || [];
                    this.loadingExperienceLevels =
                        false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading experience levels:',
                        err
                    );
                    this.experienceLevels = [];
                    this.loadingExperienceLevels =
                        false;
                    alert(
                        err?.error?.detail ||
                        'Unable to load experience levels.'
                    );
                }
            });
    }
    // ==================================================
    // SAVE JOB OPENING
    // ==================================================
    saveJobOpening(): void {
        // ----------------------------------------------
        // Permission Check
        // ----------------------------------------------
        if (
            !this.authService.hasPermission(
                'CREATE_JOB_OPENING'
            )
        ) {
            alert(
                'You do not have permission to create job openings.'
            );
            return;
        }
        // ----------------------------------------------
        // Form Validation
        // ----------------------------------------------
        if (
            this.jobOpeningForm.invalid
        ) {
            this.jobOpeningForm.markAllAsTouched();
            return;
        }
        // ----------------------------------------------
        // Company Check
        // ----------------------------------------------
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            alert(
                'Company information not found.'
            );
            return;
        }
        // ----------------------------------------------
        // Salary Validation
        // ----------------------------------------------
        const salaryFrom =
            this.jobOpeningForm.get(
                'SalaryFrom'
            )?.value;
        const salaryTo =
            this.jobOpeningForm.get(
                'SalaryTo'
            )?.value;
        if (
            salaryFrom !== null &&
            salaryTo !== null &&
            salaryFrom > salaryTo
        ) {
            alert(
                'Salary From cannot be greater than Salary To.'
            );
            return;
        }
        // ----------------------------------------------
        // Loading
        // ----------------------------------------------
        this.loading = true;
        // ----------------------------------------------
        // Get Form Data
        // ----------------------------------------------
        const data =
            this.jobOpeningForm.getRawValue();
        /*
         * IMPORTANT:
         *
         * CompanyId is intentionally NOT sent
         * from Angular.
         *
         * Backend gets CompanyId from:
         *
         * current_user["company_id"]
         *
         * This prevents a user from creating a
         * Job Opening for another company.
         */
        delete data.CompanyId;
        // ----------------------------------------------
        // Add Job Opening
        // ----------------------------------------------
        this.jobOpeningService
            .addJobOpening(data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Job Opening Added Successfully'
                    );
                    this.router.navigate([
                        '/job-opening'
                    ]);
                },
                error: (err: any) => {
                    console.log(err);
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to add job opening.'
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