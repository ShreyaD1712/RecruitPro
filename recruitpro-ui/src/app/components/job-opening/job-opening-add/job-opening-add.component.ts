import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
    jobOpeningForm!: FormGroup;

    isEditMode = false;
    jobOpeningId: number | null = null;
    companyId: number | null = null;

    departments: any[] = [];
    designations: any[] = [];
    jobCategories: any[] = [];
    employmentTypes: any[] = [];
    experienceLevels: any[] = [];

    statuses = ['Open', 'Closed'];

    loading = false;
    loadingDepartments = false;
    loadingDesignations = false;
    loadingJobCategories = false;
    loadingEmploymentTypes = false;
    loadingExperienceLevels = false;
    loadingJobOpening = false;

    private loadingExistingData = false;

    constructor(
        private fb: FormBuilder,
        private jobOpeningService: JobOpeningService,
        private departmentService: DepartmentService,
        private designationService: DesignationService,
        private jobCategoryService: JobCategoryService,
        private employmentTypeService: EmploymentTypeService,
        private experienceLevelService: ExperienceLevelService,
        public authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

        if (id) {
            this.isEditMode = true;
            this.jobOpeningId = Number(id);
        }

        const permission = this.isEditMode
            ? 'UPDATE_JOB_OPENING'
            : 'CREATE_JOB_OPENING';

        if (!this.hasPermission(permission)) {
            alert('You are not authorized to access this page.');
            this.router.navigate(['/job-opening']);
            return;
        }

        this.companyId = this.authService.getCompanyId();

        if (!this.companyId) {
            alert('Company information not found.');
            this.router.navigate(['/job-opening']);
            return;
        }

        this.jobOpeningForm = this.fb.group({
            DepartmentId: [null, Validators.required],
            DesignationId: [null, Validators.required],
            JobCategoryId: [null, Validators.required],
            EmploymentTypeId: [null, Validators.required],
            ExperienceLevelId: [null, Validators.required],
            JobTitle: ['', [Validators.required, Validators.maxLength(150)]],
            JobDescription: ['', Validators.maxLength(5000)],
            Location: ['', Validators.maxLength(150)],
            NoOfVacancies: [1, [Validators.required, Validators.min(1)]],
            SalaryFrom: [null, Validators.min(0)],
            SalaryTo: [null, Validators.min(0)],
            Status: ['Open', Validators.required]
        });

        this.jobOpeningForm.get('DepartmentId')?.valueChanges.subscribe(
            (departmentId: number | null) => {
                if (this.loadingExistingData) return;

                this.designations = [];
                this.jobOpeningForm.patchValue(
                    { DesignationId: null },
                    { emitEvent: false }
                );

                if (departmentId) {
                    this.loadDesignations(departmentId);
                }
            }
        );

        this.loadDepartments();
        this.loadJobCategories();
        this.loadEmploymentTypes();
        this.loadExperienceLevels();

        if (this.isEditMode && this.jobOpeningId) {
            this.loadJobOpening();
        }
    }

    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    // ==================================================
    // LOAD DEPARTMENTS
    // ==================================================
    loadDepartments(): void {
        if (!this.companyId) return;

        this.loadingDepartments = true;

        this.departmentService
            .getDepartments('', this.companyId, 'DepartmentName', 'asc', 1, 1000)
            .subscribe({
                next: (response: any) => {
                    this.departments = response.data || [];
                    this.loadingDepartments = false;
                },
                error: (err: any) => {
                    console.error('Error loading departments:', err);
                    this.departments = [];
                    this.loadingDepartments = false;
                }
            });
    }

    // ==================================================
    // LOAD DESIGNATIONS
    // ==================================================
    loadDesignations(
        departmentId: number,
        selectedDesignationId: number | null = null
    ): void {
        if (!this.companyId) return;

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
                    this.designations = response.data || [];
                    this.loadingDesignations = false;

                    if (selectedDesignationId) {
                        this.jobOpeningForm.patchValue({
                            DesignationId: selectedDesignationId
                        });
                    }
                },
                error: (err: any) => {
                    console.error('Error loading designations:', err);
                    this.designations = [];
                    this.loadingDesignations = false;
                }
            });
    }

    // ==================================================
    // LOAD JOB CATEGORIES
    // ==================================================
    loadJobCategories(): void {
        if (!this.companyId) return;

        this.loadingJobCategories = true;

        this.jobCategoryService
            .getJobCategories('', this.companyId, 'CategoryName', 'asc', 1, 1000)
            .subscribe({
                next: (response: any) => {
                    this.jobCategories = response.data || [];
                    this.loadingJobCategories = false;
                },
                error: (err: any) => {
                    console.error('Error loading job categories:', err);
                    this.jobCategories = [];
                    this.loadingJobCategories = false;
                }
            });
    }

    // ==================================================
    // LOAD EMPLOYMENT TYPES
    // ==================================================
    loadEmploymentTypes(): void {
        if (!this.companyId) return;

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
                    this.employmentTypes = response.data || [];
                    this.loadingEmploymentTypes = false;
                },
                error: (err: any) => {
                    console.error('Error loading employment types:', err);
                    this.employmentTypes = [];
                    this.loadingEmploymentTypes = false;
                }
            });
    }

    // ==================================================
    // LOAD EXPERIENCE LEVELS
    // ==================================================
    loadExperienceLevels(): void {
        if (!this.companyId) return;

        this.loadingExperienceLevels = true;

        this.experienceLevelService
            .getExperienceLevels('', this.companyId, 'LevelName', 'asc', 1, 1000)
            .subscribe({
                next: (response: any) => {
                    this.experienceLevels = response.data || [];
                    this.loadingExperienceLevels = false;
                },
                error: (err: any) => {
                    console.error('Error loading experience levels:', err);
                    this.experienceLevels = [];
                    this.loadingExperienceLevels = false;
                }
            });
    }

    // ==================================================
    // LOAD JOB OPENING
    // ==================================================
    loadJobOpening(): void {
        if (!this.jobOpeningId) return;

        this.loadingJobOpening = true;

        this.jobOpeningService.getJobOpeningById(this.jobOpeningId).subscribe({
            next: (response: any) => {
                const jobOpening = response?.data || response;

                if (
                    Number(jobOpening.CompanyId) !==
                    Number(this.companyId)
                ) {
                    alert('You are not authorized to edit this job opening.');
                    this.router.navigate(['/job-opening']);
                    return;
                }

                this.loadingExistingData = true;

                this.jobOpeningForm.patchValue(
                    {
                        DepartmentId: jobOpening.DepartmentId,
                        JobCategoryId: jobOpening.JobCategoryId,
                        EmploymentTypeId: jobOpening.EmploymentTypeId,
                        ExperienceLevelId: jobOpening.ExperienceLevelId,
                        JobTitle: jobOpening.JobTitle,
                        JobDescription: jobOpening.JobDescription || '',
                        Location: jobOpening.Location || '',
                        NoOfVacancies: jobOpening.NoOfVacancies,
                        SalaryFrom: jobOpening.SalaryFrom,
                        SalaryTo: jobOpening.SalaryTo,
                        Status: jobOpening.Status
                    },
                    { emitEvent: false }
                );

                this.loadDesignations(
                    jobOpening.DepartmentId,
                    jobOpening.DesignationId
                );

                this.loadingExistingData = false;
                this.loadingJobOpening = false;
            },
            error: (err: any) => {
                console.error('Error loading job opening:', err);
                this.loadingJobOpening = false;
                alert(err?.error?.detail || 'Job Opening not found.');
                this.router.navigate(['/job-opening']);
            }
        });
    }

    // ==================================================
    // SAVE JOB OPENING
    // ==================================================
    saveJobOpening(): void {
        const permission = this.isEditMode
            ? 'UPDATE_JOB_OPENING'
            : 'CREATE_JOB_OPENING';

        if (!this.hasPermission(permission)) {
            alert('You do not have permission to perform this action.');
            return;
        }

        if (this.jobOpeningForm.invalid) {
            this.jobOpeningForm.markAllAsTouched();
            return;
        }

        const data = this.jobOpeningForm.getRawValue();

        if (
            data.SalaryFrom !== null &&
            data.SalaryFrom !== '' &&
            data.SalaryTo !== null &&
            data.SalaryTo !== '' &&
            Number(data.SalaryFrom) > Number(data.SalaryTo)
        ) {
            alert('Salary From cannot be greater than Salary To.');
            return;
        }

        delete data.CompanyId;
        this.loading = true;

        if (this.isEditMode && this.jobOpeningId) {
            this.updateJobOpening(data);
        } else {
            this.createJobOpening(data);
        }
    }

    // ==================================================
    // CREATE
    // ==================================================
    createJobOpening(data: any): void {
        this.jobOpeningService.addJobOpening(data).subscribe({
            next: () => {
                this.loading = false;
                alert('Job Opening Added Successfully');
                this.router.navigate(['/job-opening']);
            },
            error: (err: any) => {
                console.error('Error adding job opening:', err);
                this.loading = false;
                alert(err?.error?.detail || 'Unable to add job opening.');
            }
        });
    }

    // ==================================================
    // UPDATE
    // ==================================================
    updateJobOpening(data: any): void {
        if (!this.jobOpeningId) return;

        this.jobOpeningService
            .updateJobOpening(this.jobOpeningId, data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert('Job Opening Updated Successfully');
                    this.router.navigate(['/job-opening']);
                },
                error: (err: any) => {
                    console.error('Error updating job opening:', err);
                    this.loading = false;
                    alert(err?.error?.detail || 'Failed to update job opening.');
                }
            });
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/job-opening']);
    }
}