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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

import { JobCategoryService } from '../../../services/job-category.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-job-category-add',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatSelectModule
    ],
    templateUrl: './job-category-add.component.html'
})
export class JobCategoryAddComponent implements OnInit {
    // ==================================================
    // FORM / MODE
    // ==================================================
    jobCategoryForm!: FormGroup;
    isEditMode = false;
    jobCategoryId: number | null = null;

    // ==================================================
    // DATA / LOADING
    // ==================================================
    companies: any[] = [];
    loading = false;
    loadingJobCategory = false;

    constructor(
        private fb: FormBuilder,
        private jobCategoryService: JobCategoryService,
        private companyService: CompanyService,
        public authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

        if (id) {
            this.isEditMode = true;
            this.jobCategoryId = Number(id);
        }

        const requiredPermission = this.isEditMode
            ? 'UPDATE_JOB_CATEGORY'
            : 'CREATE_JOB_CATEGORY';

        if (!this.hasPermission(requiredPermission)) {
            alert('You are not authorized to access this page.');
            this.router.navigate(['/job-category']);
            return;
        }

        this.jobCategoryForm = this.fb.group({
            CategoryName: ['', Validators.required],
            Description: [''],
            CompanyId: [null, Validators.required],
            IsActive: [true]
        });

        this.loadCompanies();
    }

    // ==================================================
    // PERMISSION CHECK
    // ==================================================
    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    // ==================================================
    // LOAD COMPANIES
    // ==================================================
    loadCompanies(): void {
        if (this.hasPermission('VIEW_ALL_COMPANIES')) {
            this.companyService.getCompanies('', 'CompanyName', 'asc', 1, 1000).subscribe({
                next: (response: any) => {
                    this.companies = response.data || [];

                    if (this.isEditMode) {
                        this.loadJobCategory();
                    } else {
                        this.jobCategoryForm.patchValue({ CompanyId: null });
                    }
                },
                error: (err: any) => {
                    console.error('Error loading companies:', err);
                    this.companies = [];
                }
            });
            return;
        }

        const companyId = this.authService.getCompanyId();

        if (!companyId) {
            alert('Company information not found.');
            this.router.navigate(['/job-category']);
            return;
        }

        this.companyService.getCompany(companyId).subscribe({
            next: (company: any) => {
                this.companies = [company];

                if (this.isEditMode) {
                    this.loadJobCategory();
                } else {
                    this.jobCategoryForm.patchValue({ CompanyId: company.CompanyId });
                    this.jobCategoryForm.get('CompanyId')?.disable();
                }
            },
            error: (err: any) => {
                console.error('Error loading company:', err);
                alert('Unable to load company.');
                this.router.navigate(['/job-category']);
            }
        });
    }

    // ==================================================
    // LOAD JOB CATEGORY
    // ==================================================
    loadJobCategory(): void {
        if (!this.jobCategoryId) return;

        this.loadingJobCategory = true;

        this.jobCategoryService.getJobCategoryById(this.jobCategoryId).subscribe({
            next: (response: any) => {
                const jobCategory = response?.data || response;

                if (
                    !this.hasPermission('VIEW_ALL_COMPANIES') &&
                    Number(jobCategory.CompanyId) !== Number(this.authService.getCompanyId())
                ) {
                    alert('You are not authorized to edit this job category.');
                    this.router.navigate(['/job-category']);
                    return;
                }

                this.jobCategoryForm.patchValue({
                    CategoryName: jobCategory.CategoryName,
                    Description: jobCategory.Description || '',
                    CompanyId: jobCategory.CompanyId,
                    IsActive: jobCategory.IsActive
                });

                if (!this.hasPermission('VIEW_ALL_COMPANIES')) {
                    this.jobCategoryForm.get('CompanyId')?.disable();
                }

                this.loadingJobCategory = false;
            },
            error: (err: any) => {
                console.error('Error loading job category:', err);
                this.loadingJobCategory = false;
                alert(err?.error?.detail || 'Job Category not found.');
                this.router.navigate(['/job-category']);
            }
        });
    }

    // ==================================================
    // SAVE JOB CATEGORY
    // ==================================================
    saveJobCategory(): void {
        const requiredPermission = this.isEditMode
            ? 'UPDATE_JOB_CATEGORY'
            : 'CREATE_JOB_CATEGORY';

        if (!this.hasPermission(requiredPermission)) {
            alert('You do not have permission to perform this action.');
            return;
        }

        if (this.jobCategoryForm.invalid) {
            this.jobCategoryForm.markAllAsTouched();
            return;
        }

        const data = this.jobCategoryForm.getRawValue();
        this.loading = true;

        if (this.isEditMode && this.jobCategoryId) {
            this.updateJobCategory(data);
        } else {
            this.createJobCategory(data);
        }
    }

    // ==================================================
    // CREATE JOB CATEGORY
    // ==================================================
    createJobCategory(data: any): void {
        this.jobCategoryService.addJobCategory(data).subscribe({
            next: () => {
                this.loading = false;
                alert('Job Category Added Successfully');
                this.router.navigate(['/job-category']);
            },
            error: (err: any) => {
                console.error('Error adding job category:', err);
                this.loading = false;
                alert(err?.error?.detail || 'Unable to add job category');
            }
        });
    }

    // ==================================================
    // UPDATE JOB CATEGORY
    // ==================================================
    updateJobCategory(data: any): void {
        if (!this.jobCategoryId) return;

        this.jobCategoryService
            .updateJobCategory(this.jobCategoryId, data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert('Job Category Updated Successfully');
                    this.router.navigate(['/job-category']);
                },
                error: (err: any) => {
                    console.error('Error updating job category:', err);
                    this.loading = false;
                    alert(err?.error?.detail || 'Failed to update job category.');
                }
            });
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/job-category']);
    }
}