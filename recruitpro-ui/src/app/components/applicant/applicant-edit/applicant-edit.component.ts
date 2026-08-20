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
import { ApplicantService } from '../../../services/applicant.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-applicant-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    templateUrl: './applicant-edit.component.html',
})
export class ApplicantEditComponent implements OnInit {
    applicantForm!: FormGroup;
    applicantId!: number;
    loading = false;
    genders: string[] = [
        'Male',
        'Female',
        'Other'
    ];
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private applicantService: ApplicantService,
        public authService: AuthService
    ) { }
    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        // ----------------------------------------------
        // Permission Check
        // ----------------------------------------------
        if (!this.hasPermission('UPDATE_APPLICANT')) {
            alert('You are not authorized to edit applicants.');
            this.router.navigate(['/applicant']);
            return;
        }
        // ----------------------------------------------
        // Get Applicant ID
        // ----------------------------------------------
        this.applicantId =
            Number(this.route.snapshot.paramMap.get('id'));
        if (!this.applicantId) {
            alert('Invalid Applicant ID.');
            this.router.navigate(['/applicant']);
            return;
        }
        // ----------------------------------------------
        // Create Form
        // ----------------------------------------------
        this.applicantForm = this.fb.group({
            // PERSONAL INFORMATION
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
            // PROFESSIONAL INFORMATION
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
        // ----------------------------------------------
        // Load Applicant
        // ----------------------------------------------
        this.loadApplicant();
    }
    // ==================================================
    // PERMISSION CHECK
    // ==================================================
    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }
    // ==================================================
    // LOAD APPLICANT
    // ==================================================
    loadApplicant(): void {
        this.loading = true;
        this.applicantService
            .getApplicantById(this.applicantId)
            .subscribe({
                next: (applicant: any) => {
                    this.loading = false;
                    // ----------------------------------
                    // Company Security Check
                    // ----------------------------------
                    const loggedInCompanyId =
                        this.authService.getCompanyId();
                    if (
                        applicant.CompanyId !==
                        loggedInCompanyId
                    ) {
                        alert(
                            'You are not authorized to edit this applicant.'
                        );
                        this.router.navigate(['/applicant']);
                        return;
                    }
                    // ----------------------------------
                    // Fill Form
                    // ----------------------------------
                    this.applicantForm.patchValue({
                        FirstName:
                            applicant.FirstName,
                        LastName:
                            applicant.LastName,
                        Email:
                            applicant.Email,
                        MobileNo:
                            applicant.MobileNo,
                        DOB:
                            applicant.DOB,
                        Gender:
                            applicant.Gender,
                        CurrentCity:
                            applicant.CurrentCity,
                        CurrentCompany:
                            applicant.CurrentCompany,
                        CurrentCTC:
                            applicant.CurrentCTC,
                        ExpectedCTC:
                            applicant.ExpectedCTC,
                        NoticePeriod:
                            applicant.NoticePeriod,
                        LinkedInUrl:
                            applicant.LinkedInUrl
                    });
                },
                error: (err: any) => {
                    this.loading = false;
                    console.log(err);
                    alert(
                        err?.error?.detail ||
                        'Applicant not found.'
                    );
                    this.router.navigate(['/applicant']);
                }
            });
    }
    // ==================================================
    // UPDATE APPLICANT
    // ==================================================
    updateApplicant(): void {
        // ----------------------------------------------
        // Permission Check
        // ----------------------------------------------
        if (
            !this.hasPermission('UPDATE_APPLICANT')
        ) {
            alert(
                'You do not have permission to update applicants.'
            );
            return;
        }
        // ----------------------------------------------
        // Form Validation
        // ----------------------------------------------
        if (this.applicantForm.invalid) {
            this.applicantForm.markAllAsTouched();
            return;
        }
        // ----------------------------------------------
        // CTC Validation
        // ----------------------------------------------
        const currentCTC =
            this.applicantForm
                .get('CurrentCTC')
                ?.value;
        const expectedCTC =
            this.applicantForm
                .get('ExpectedCTC')
                ?.value;
        if (
            currentCTC !== null &&
            currentCTC !== '' &&
            expectedCTC !== null &&
            expectedCTC !== '' &&
            Number(currentCTC) < 0
        ) {
            alert(
                'Current CTC cannot be negative.'
            );
            return;
        }
        if (
            expectedCTC !== null &&
            expectedCTC !== '' &&
            Number(expectedCTC) < 0
        ) {
            alert(
                'Expected CTC cannot be negative.'
            );
            return;
        }
        // ----------------------------------------------
        // Get Form Data
        // ----------------------------------------------
        const data =
            this.applicantForm.value;
        this.loading = true;
        // Update API
        this.applicantService
            .updateApplicant(
                this.applicantId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Applicant Updated Successfully'
                    );
                    this.router.navigate([
                        '/applicant'
                    ]);
                },
                error: (err: any) => {
                    this.loading = false;
                    console.log(err);
                    alert(
                        err?.error?.detail ||
                        'Failed to update applicant.'
                    );
                }
            });
    }
    // CANCEL
    cancel(): void {
        this.router.navigate([
            '/applicant'
        ]);
    }
}