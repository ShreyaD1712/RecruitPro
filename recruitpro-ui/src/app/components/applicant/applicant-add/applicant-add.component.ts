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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApplicantService } from '../../../services/applicant.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-applicant-add',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './applicant-add.component.html'
})
export class ApplicantAddComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    applicantForm!: FormGroup;
    // ==================================================
    // COMPANY
    // ==================================================
    companyId: number | null = null;
    // ==================================================
    // GENDER
    // ==================================================
    genders = [
        'Male',
        'Female',
        'Other'
    ];
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private applicantService: ApplicantService,
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
                'CREATE_APPLICANT'
            )
        ) {
            alert(
                'You are not authorized to create applicants.'
            );
            this.router.navigate([
                '/applicant'
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
                '/applicant'
            ]);
            return;
        }
        // ----------------------------------------------
        // Create Form
        // ----------------------------------------------
        this.applicantForm = this.fb.group({
            // ==================================================
            // PERSONAL INFORMATION
            // ==================================================
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
            // ==================================================
            // PROFESSIONAL INFORMATION
            // ==================================================
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
    // SAVE APPLICANT
    // ==================================================
    saveApplicant(): void {
        // ----------------------------------------------
        // Permission Check
        // ----------------------------------------------
        if (
            !this.authService.hasPermission(
                'CREATE_APPLICANT'
            )
        ) {
            alert(
                'You do not have permission to create applicants.'
            );
            return;
        }
        // ----------------------------------------------
        // Form Validation
        // ----------------------------------------------
        if (
            this.applicantForm.invalid
        ) {
            this.applicantForm.markAllAsTouched();
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
        // Get Form Data
        // ----------------------------------------------
        const data =
            this.applicantForm.getRawValue();
        if (data.DOB) {
            const date = new Date(data.DOB);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            data.DOB = `${year}-${month}-${day}`;
        }
        delete data.CompanyId;
        // ----------------------------------------------
        // Add Applicant
        // ----------------------------------------------
        this.applicantService
            .addApplicant(data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Applicant Added Successfully'
                    );
                    this.router.navigate([
                        '/applicant'
                    ]);
                },
                error: (err: any) => {
                    console.log(
                        'Error adding applicant:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to add applicant.'
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
}