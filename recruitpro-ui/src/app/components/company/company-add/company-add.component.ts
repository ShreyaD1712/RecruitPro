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

import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-company-add',
    standalone: true,

    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSlideToggleModule
    ],

    templateUrl: './company-add.component.html'
})
export class CompanyAddComponent implements OnInit {

    // ==========================
    // FORM
    // ==========================

    companyForm!: FormGroup;

    // ==========================
    // LOADING
    // ==========================

    loading = false;

    constructor(
        private fb: FormBuilder,
        private companyService: CompanyService,
        public authService: AuthService,
        private router: Router
    ) { }

    // ==========================
    // INIT
    // ==========================

    ngOnInit(): void {

        // Permission Check

        if (
            !this.authService.hasPermission(
                'CREATE_COMPANY'
            )
        ) {

            alert(
                'You are not authorized to create companies.'
            );

            this.router.navigate([
                '/company'
            ]);

            return;
        }

        // ==========================
        // CREATE FORM
        // ==========================

        this.companyForm = this.fb.group({

            CompanyCode: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(50)
                ]
            ],

            CompanyName: [
                '',
                [
                    Validators.required,
                    Validators.maxLength(150)
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

            Phone: [
                '',
                [
                    Validators.maxLength(20)
                ]
            ],

            Website: [
                '',
                [
                    Validators.maxLength(250)
                ]
            ],

            Address: [
                '',
                [
                    Validators.maxLength(500)
                ]
            ],

            IsActive: [
                true
            ]

        });

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
    // SAVE COMPANY
    // ==========================

    saveCompany(): void {

        // Permission Check

        if (
            !this.hasPermission(
                'CREATE_COMPANY'
            )
        ) {

            alert(
                'You do not have permission to create companies.'
            );

            return;
        }

        // Form Validation

        if (
            this.companyForm.invalid
        ) {

            this.companyForm.markAllAsTouched();

            return;
        }

        // Loading

        this.loading = true;

        // Form Data

        const data =
            this.companyForm.value;

        // ==========================
        // ADD COMPANY
        // ==========================

        this.companyService
            .addCompany(data)
            .subscribe({

                next: () => {

                    this.loading = false;

                    alert(
                        'Company Added Successfully'
                    );

                    this.router.navigate([
                        '/company'
                    ]);

                },

                error: (err: any) => {

                    console.log(err);

                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to add company'
                    );

                }

            });

    }

    // ==========================
    // CANCEL
    // ==========================

    cancel(): void {

        this.router.navigate([
            '/company'
        ]);

    }

}