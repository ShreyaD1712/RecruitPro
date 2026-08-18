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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

import { JobCategoryService } from '../../../services/job-category.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-job-category-edit',
    standalone: true,

    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatSelectModule
    ],

    templateUrl: './job-category-edit.component.html',
})
export class JobCategoryEditComponent implements OnInit {

    // ==========================
    // FORM
    // ==========================

    jobCategoryForm!: FormGroup;

    // ==========================
    // JOB CATEGORY ID
    // ==========================

    jobCategoryId!: number;

    // ==========================
    // COMPANY
    // ==========================

    companies: any[] = [];

    // ==========================
    // LOADING
    // ==========================

    loading = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private jobCategoryService: JobCategoryService,
        private companyService: CompanyService,
        public authService: AuthService
    ) { }

    // ==========================
    // INIT
    // ==========================

    ngOnInit(): void {

        // Permission Check

        if (
            !this.hasPermission(
                'UPDATE_JOB_CATEGORY'
            )
        ) {

            alert(
                'You are not authorized to access this page.'
            );

            this.router.navigate([
                '/job-category'
            ]);

            return;
        }

        // Get Job Category ID

        this.jobCategoryId = Number(
            this.route.snapshot.paramMap.get('id')
        );

        if (!this.jobCategoryId) {

            alert(
                'Invalid Job Category ID.'
            );

            this.router.navigate([
                '/job-category'
            ]);

            return;
        }

        // Create Form

        this.jobCategoryForm = this.fb.group({

            CategoryName: [
                '',
                Validators.required
            ],

            CompanyId: [
                null,
                Validators.required
            ],

            Description: [
                ''
            ],

            IsActive: [
                true
            ]

        });

        // Load company first

        this.loadCompany();
    }

    // ==========================
    // PERMISSION CHECK
    // ==========================

    hasPermission(
        permission: string
    ): boolean {

        return this.authService.hasPermission(
            permission
        );
    }

    // ==========================
    // LOAD LOGGED-IN USER COMPANY
    // ==========================

    loadCompany(): void {

        const companyId =
            this.authService.getCompanyId();

        if (!companyId) {

            alert(
                'Company information not found.'
            );

            this.router.navigate([
                '/job-category'
            ]);

            return;
        }

        this.companyService
            .getCompany(companyId)
            .subscribe({

                next: (company: any) => {

                    // Show user's company
                    this.companies = [
                        company
                    ];

                    // Set CompanyId

                    this.jobCategoryForm.patchValue({
                        CompanyId: company.CompanyId
                    });

                    // Disable Company dropdown
                    // Company cannot be changed

                    this.jobCategoryForm
                        .get('CompanyId')
                        ?.disable();

                    // Load Job Category

                    this.loadJobCategory();
                },

                error: (err: any) => {

                    console.log(
                        'Error loading company:',
                        err
                    );

                    alert(
                        'Unable to load company.'
                    );

                    this.router.navigate([
                        '/job-category'
                    ]);
                }

            });
    }

    // ==========================
    // LOAD JOB CATEGORY
    // ==========================

    loadJobCategory(): void {

        this.jobCategoryService
            .getJobCategoryById(
                this.jobCategoryId
            )
            .subscribe({

                next: (jobCategory: any) => {

                    // Security check

                    const loggedInCompanyId =
                        this.authService.getCompanyId();

                    if (
                        jobCategory.CompanyId !==
                        loggedInCompanyId
                    ) {

                        alert(
                            'You are not authorized to edit this job category.'
                        );

                        this.router.navigate([
                            '/job-category'
                        ]);

                        return;
                    }

                    // Fill form

                    this.jobCategoryForm.patchValue({

                        CategoryName:
                            jobCategory.CategoryName,

                        CompanyId:
                            jobCategory.CompanyId,

                        Description:
                            jobCategory.Description,

                        IsActive:
                            jobCategory.IsActive

                    });

                },

                error: (err: any) => {

                    console.log(err);

                    alert(
                        err?.error?.detail ||
                        'Job Category not found.'
                    );

                    this.router.navigate([
                        '/job-category'
                    ]);
                }

            });
    }

    // ==========================
    // UPDATE JOB CATEGORY
    // ==========================

    updateJobCategory(): void {

        if (
            !this.hasPermission(
                'UPDATE_JOB_CATEGORY'
            )
        ) {

            alert(
                'You do not have permission to update job categories.'
            );

            return;
        }

        if (
            this.jobCategoryForm.invalid
        ) {

            this.jobCategoryForm.markAllAsTouched();

            return;
        }

        this.loading = true;

        /*
         * getRawValue() includes
         * disabled CompanyId.
         */

        const data =
            this.jobCategoryForm.getRawValue();

        this.jobCategoryService
            .updateJobCategory(
                this.jobCategoryId,
                data
            )
            .subscribe({

                next: () => {

                    this.loading = false;

                    alert(
                        'Job Category Updated Successfully'
                    );

                    this.router.navigate([
                        '/job-category'
                    ]);
                },

                error: (err: any) => {

                    this.loading = false;

                    console.log(err);

                    alert(
                        err?.error?.detail ||
                        'Failed to update job category.'
                    );
                }

            });
    }

    // ==========================
    // CANCEL
    // ==========================

    cancel(): void {

        this.router.navigate([
            '/job-category'
        ]);
    }

}