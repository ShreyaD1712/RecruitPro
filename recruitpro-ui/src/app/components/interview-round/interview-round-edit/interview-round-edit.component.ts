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
import { InterviewRoundService } from '../../../services/interview-round.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-interview-round-edit',
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
    templateUrl: './interview-round-edit.component.html',
})
export class InterviewRoundEditComponent implements OnInit {
    // ==========================
    // FORM
    // ==========================
    interviewRoundForm!: FormGroup;
    // ==========================
    // INTERVIEW ROUND ID
    // ==========================
    interviewRoundId!: number;
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
        private interviewRoundService: InterviewRoundService,
        private companyService: CompanyService,
        public authService: AuthService
    ) { }
    // ==========================
    // INIT
    // ==========================
    ngOnInit(): void {
        // ------------------------------------------
        // Permission Check
        // ------------------------------------------
        if (
            !this.hasPermission(
                'UPDATE_INTERVIEW_ROUND'
            )
        ) {
            alert(
                'You are not authorized to access this page.'
            );
            this.router.navigate([
                '/interview-round'
            ]);
            return;
        }
        // ------------------------------------------
        // Get Interview Round ID
        // ------------------------------------------
        this.interviewRoundId = Number(
            this.route.snapshot.paramMap.get('id')
        );
        if (!this.interviewRoundId) {
            alert(
                'Invalid Interview Round ID.'
            );
            this.router.navigate([
                '/interview-round'
            ]);
            return;
        }
        // ------------------------------------------
        // Create Form
        // ------------------------------------------
        this.interviewRoundForm = this.fb.group({
            RoundName: [
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
        // ------------------------------------------
        // Load Company
        // ------------------------------------------
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
                '/interview-round'
            ]);
            return;
        }
        this.companyService
            .getCompany(companyId)
            .subscribe({
                next: (company: any) => {
                    // --------------------------------
                    // Show user's company
                    // --------------------------------
                    this.companies = [
                        company
                    ];
                    // --------------------------------
                    // Set CompanyId
                    // --------------------------------
                    this.interviewRoundForm.patchValue({
                        CompanyId:
                            company.CompanyId
                    });
                    // --------------------------------
                    // Disable Company dropdown
                    // --------------------------------
                    this.interviewRoundForm
                        .get('CompanyId')
                        ?.disable();
                    // --------------------------------
                    // Load Interview Round
                    // --------------------------------
                    this.loadInterviewRound();
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
                        '/interview-round'
                    ]);
                }
            });
    }
    // ==========================
    // LOAD INTERVIEW ROUND
    // ==========================
    loadInterviewRound(): void {
        this.interviewRoundService
            .getInterviewRoundById(
                this.interviewRoundId
            )
            .subscribe({
                next: (interviewRound: any) => {
                    // --------------------------------
                    // Security Check
                    // --------------------------------
                    const loggedInCompanyId =
                        this.authService.getCompanyId();
                    if (
                        interviewRound.CompanyId !==
                        loggedInCompanyId
                    ) {
                        alert(
                            'You are not authorized to edit this interview round.'
                        );
                        this.router.navigate([
                            '/interview-round'
                        ]);
                        return;
                    }
                    // --------------------------------
                    // Fill Form
                    // --------------------------------
                    this.interviewRoundForm.patchValue({
                        RoundName:
                            interviewRound.RoundName,
                        CompanyId:
                            interviewRound.CompanyId,
                        Description:
                            interviewRound.Description,
                        IsActive:
                            interviewRound.IsActive
                    });
                },
                error: (err: any) => {
                    console.log(err);
                    alert(
                        err?.error?.detail ||
                        'Interview Round not found.'
                    );
                    this.router.navigate([
                        '/interview-round'
                    ]);
                }
            });
    }
    // ==========================
    // UPDATE INTERVIEW ROUND
    // ==========================
    updateInterviewRound(): void {
        // ------------------------------------------
        // Permission Check
        // ------------------------------------------
        if (
            !this.hasPermission(
                'UPDATE_INTERVIEW_ROUND'
            )
        ) {
            alert(
                'You do not have permission to update interview rounds.'
            );
            return;
        }
        // ------------------------------------------
        // Form Validation
        // ------------------------------------------
        if (
            this.interviewRoundForm.invalid
        ) {
            this.interviewRoundForm.markAllAsTouched();
            return;
        }
        this.loading = true;
        /*
         * getRawValue() includes
         * disabled CompanyId.
         */
        const data =
            this.interviewRoundForm.getRawValue();
        // ------------------------------------------
        // Update Interview Round
        // ------------------------------------------
        this.interviewRoundService
            .updateInterviewRound(
                this.interviewRoundId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Interview Round Updated Successfully'
                    );
                    this.router.navigate([
                        '/interview-round'
                    ]);
                },
                error: (err: any) => {
                    this.loading = false;
                    console.log(err);
                    alert(
                        err?.error?.detail ||
                        'Failed to update interview round.'
                    );
                }
            });
    }
    // ==========================
    // CANCEL
    // ==========================
    cancel(): void {
        this.router.navigate([
            '/interview-round'
        ]);
    }
}
