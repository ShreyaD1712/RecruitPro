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

import { EmploymentTypeService } from '../../../services/employment-type.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-employment-type-add',
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

    templateUrl: './employment-type-add.component.html',
   
})
export class EmploymentTypeAddComponent implements OnInit {

    // ==================================================
    // FORM
    // ==================================================

    employmentTypeForm!: FormGroup;

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
        private employmentTypeService: EmploymentTypeService,
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
                'CREATE_EMPLOYMENT_TYPE'
            )
        ) {

            alert(
                'You are not authorized to create employment types.'
            );

            this.router.navigate([
                '/employment-type'
            ]);

            return;
        }

        // ----------------------------------------------
        // Create Form
        // ----------------------------------------------

        this.employmentTypeForm = this.fb.group({

            EmploymentTypeName: [
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
                '/employment-type'
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

                    this.employmentTypeForm.patchValue({

                        CompanyId:
                            company.CompanyId

                    });

                    // ----------------------------------------
                    // Disable Company dropdown
                    // ----------------------------------------

                    this.employmentTypeForm
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
                        '/employment-type'
                    ]);

                }

            });
    }

    // ==================================================
    // SAVE EMPLOYMENT TYPE
    // ==================================================

    saveEmploymentType(): void {

        // ----------------------------------------------
        // Permission Check
        // ----------------------------------------------

        if (
            !this.authService.hasPermission(
                'CREATE_EMPLOYMENT_TYPE'
            )
        ) {

            alert(
                'You do not have permission to create employment types.'
            );

            return;
        }

        // ----------------------------------------------
        // Form Validation
        // ----------------------------------------------

        if (
            this.employmentTypeForm.invalid
        ) {

            this.employmentTypeForm.markAllAsTouched();

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
            this.employmentTypeForm.getRawValue();

        // ----------------------------------------------
        // Add Employment Type
        // ----------------------------------------------

        this.employmentTypeService
            .addEmploymentType(data)
            .subscribe({

                next: () => {

                    this.loading = false;

                    alert(
                        'Employment Type Added Successfully'
                    );

                    this.router.navigate([
                        '/employment-type'
                    ]);

                },

                error: (err: any) => {

                    console.log(err);

                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to add employment type'
                    );

                }

            });
    }

    // ==================================================
    // CANCEL
    // ==================================================

    cancel(): void {

        this.router.navigate([
            '/employment-type'
        ]);

    }

}