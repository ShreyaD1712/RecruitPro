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

    templateUrl: './job-category-add.component.html',
    
})
export class JobCategoryAddComponent implements OnInit {

    // ==================================================
    // FORM
    // ==================================================

    jobCategoryForm!: FormGroup;

    // ==================================================
    // COMPANY DATA
    // ==================================================

    companies: any[] = [];

    // ==================================================
    // LOADING
    // ==================================================

    loading = false;

    constructor(
        private fb: FormBuilder,
        private jobCategoryService: JobCategoryService,
        private companyService: CompanyService,
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
                'CREATE_JOB_CATEGORY'
            )
        ) {

            alert(
                'You are not authorized to create job categories.'
            );

            this.router.navigate([
                '/job-category'
            ]);

            return;
        }

        // ----------------------------------------------
        // Create Form
        // ----------------------------------------------

        this.jobCategoryForm = this.fb.group({

            CategoryName: [
                '',
                Validators.required
            ],

            Description: [
                ''
            ],

            CompanyId: [
                null,
                Validators.required
            ],

            IsActive: [
                true
            ]

        });

        // ----------------------------------------------
        // Load Company
        // ----------------------------------------------

        this.loadCompany();
    }

    // ==================================================
    // PERMISSION CHECK
    // ==================================================

    hasPermission(permission: string): boolean {

        return this.authService.hasPermission(
            permission
        );
    }

    // ==================================================
    // LOAD LOGGED-IN USER COMPANY
    // ==================================================

    loadCompany(): void {

        const companyId =
            this.authService.getCompanyId();

        // ----------------------------------------------
        // Company ID Check
        // ----------------------------------------------

        if (!companyId) {

            alert(
                'Company information not found.'
            );

            this.router.navigate([
                '/job-category'
            ]);

            return;
        }

        // ----------------------------------------------
        // Get Company
        // ----------------------------------------------

        this.companyService
            .getCompany(companyId)
            .subscribe({

                next: (company: any) => {

                    // ----------------------------------------
                    // Show only logged-in user's company
                    // ----------------------------------------

                    this.companies = [
                        company
                    ];

                    // ----------------------------------------
                    // Automatically select company
                    // ----------------------------------------

                    this.jobCategoryForm.patchValue({

                        CompanyId:
                            company.CompanyId

                    });

                    // ----------------------------------------
                    // Disable Company dropdown
                    // ----------------------------------------

                    this.jobCategoryForm
                        .get('CompanyId')
                        ?.disable();

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

    // ==================================================
    // SAVE JOB CATEGORY
    // ==================================================

    saveJobCategory(): void {

        // ----------------------------------------------
        // Permission Check
        // ----------------------------------------------

        if (
            !this.authService.hasPermission(
                'CREATE_JOB_CATEGORY'
            )
        ) {

            alert(
                'You do not have permission to create job categories.'
            );

            return;
        }

        // ----------------------------------------------
        // Form Validation
        // ----------------------------------------------

        if (
            this.jobCategoryForm.invalid
        ) {

            this.jobCategoryForm.markAllAsTouched();

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
        // Loading
        // ----------------------------------------------

        this.loading = true;

        // ----------------------------------------------
        // getRawValue()
        //
        // Important because CompanyId is disabled.
        // getRawValue() includes disabled fields.
        // ----------------------------------------------

        const data =
            this.jobCategoryForm.getRawValue();

        // ----------------------------------------------
        // Add Job Category
        // ----------------------------------------------

        this.jobCategoryService
            .addJobCategory(data)
            .subscribe({

                next: () => {

                    this.loading = false;

                    alert(
                        'Job Category Added Successfully'
                    );

                    this.router.navigate([
                        '/job-category'
                    ]);

                },

                error: (err: any) => {

                    console.log(err);

                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to add job category'
                    );

                }

            });
    }

    // ==================================================
    // CANCEL
    // ==================================================

    cancel(): void {

        this.router.navigate([
            '/job-category'
        ]);

    }

}