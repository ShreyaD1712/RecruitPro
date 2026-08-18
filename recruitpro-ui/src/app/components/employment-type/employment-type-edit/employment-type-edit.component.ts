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

import { EmploymentTypeService } from '../../../services/employment-type.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-employment-type-edit',
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

    templateUrl: './employment-type-edit.component.html',
})
export class EmploymentTypeEditComponent implements OnInit {

    // ==========================
    // FORM
    // ==========================

    employmentTypeForm!: FormGroup;

    // ==========================
    // EMPLOYMENT TYPE ID
    // ==========================

    employmentTypeId!: number;

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
        private employmentTypeService: EmploymentTypeService,
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
                'UPDATE_EMPLOYMENT_TYPE'
            )
        ) {

            alert(
                'You are not authorized to access this page.'
            );

            this.router.navigate([
                '/employment-type'
            ]);

            return;
        }

        // Get Employment Type ID

        this.employmentTypeId = Number(
            this.route.snapshot.paramMap.get('id')
        );

        if (!this.employmentTypeId) {

            alert(
                'Invalid Employment Type ID.'
            );

            this.router.navigate([
                '/employment-type'
            ]);

            return;
        }

        // Create Form

        this.employmentTypeForm = this.fb.group({

            EmploymentTypeName: [
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
                '/employment-type'
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

                    this.employmentTypeForm.patchValue({
                        CompanyId: company.CompanyId
                    });

                    // Disable Company dropdown
                    // Company cannot be changed

                    this.employmentTypeForm
                        .get('CompanyId')
                        ?.disable();

                    // Load Employment Type

                    this.loadEmploymentType();
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

    // ==========================
    // LOAD EMPLOYMENT TYPE
    // ==========================

    loadEmploymentType(): void {

        this.employmentTypeService
            .getEmploymentTypeById(
                this.employmentTypeId
            )
            .subscribe({

                next: (employmentType: any) => {

                    // Security check

                    const loggedInCompanyId =
                        this.authService.getCompanyId();

                    if (
                        employmentType.CompanyId !==
                        loggedInCompanyId
                    ) {

                        alert(
                            'You are not authorized to edit this employment type.'
                        );

                        this.router.navigate([
                            '/employment-type'
                        ]);

                        return;
                    }

                    // Fill form

                    this.employmentTypeForm.patchValue({

                        EmploymentTypeName:
                            employmentType.EmploymentTypeName,

                        CompanyId:
                            employmentType.CompanyId,

                        Description:
                            employmentType.Description,

                        IsActive:
                            employmentType.IsActive

                    });

                },

                error: (err: any) => {

                    console.log(err);

                    alert(
                        err?.error?.detail ||
                        'Employment Type not found.'
                    );

                    this.router.navigate([
                        '/employment-type'
                    ]);
                }

            });
    }

    // ==========================
    // UPDATE EMPLOYMENT TYPE
    // ==========================

    updateEmploymentType(): void {

        if (
            !this.hasPermission(
                'UPDATE_EMPLOYMENT_TYPE'
            )
        ) {

            alert(
                'You do not have permission to update employment types.'
            );

            return;
        }

        if (
            this.employmentTypeForm.invalid
        ) {

            this.employmentTypeForm.markAllAsTouched();

            return;
        }

        this.loading = true;

        /*
         * getRawValue() includes
         * disabled CompanyId.
         */

        const data =
            this.employmentTypeForm.getRawValue();

        this.employmentTypeService
            .updateEmploymentType(
                this.employmentTypeId,
                data
            )
            .subscribe({

                next: () => {

                    this.loading = false;

                    alert(
                        'Employment Type Updated Successfully'
                    );

                    this.router.navigate([
                        '/employment-type'
                    ]);
                },

                error: (err: any) => {

                    this.loading = false;

                    console.log(err);

                    alert(
                        err?.error?.detail ||
                        'Failed to update employment type.'
                    );
                }

            });
    }

    // ==========================
    // CANCEL
    // ==========================

    cancel(): void {

        this.router.navigate([
            '/employment-type'
        ]);
    }

}