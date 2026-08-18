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
import { InterviewRoundService } from '../../../services/interview-round.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-interview-round-add',
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
    templateUrl: './interview-round-add.component.html',
})
export class InterviewRoundAddComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    interviewRoundForm!: FormGroup;
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
        private interviewRoundService: InterviewRoundService,
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
                'CREATE_INTERVIEW_ROUND'
            )
        ) {
            alert(
                'You are not authorized to create interview rounds.'
            );
            this.router.navigate([
                '/interview-round'
            ]);
            return;
        }
        // ----------------------------------------------
        // Create Form
        // ----------------------------------------------
        this.interviewRoundForm = this.fb.group({
            RoundName: [
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
                '/interview-round'
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
                    this.interviewRoundForm.patchValue({
                        CompanyId:
                            company.CompanyId
                    });
                    // ----------------------------------------
                    // Disable Company dropdown
                    // ----------------------------------------
                    this.interviewRoundForm
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
                        '/interview-round'
                    ]);
                }
            });
    }
    // ==================================================
    // SAVE INTERVIEW ROUND
    // ==================================================
    saveInterviewRound(): void {
        // ----------------------------------------------
        // Permission Check
        // ----------------------------------------------
        if (
            !this.authService.hasPermission(
                'CREATE_INTERVIEW_ROUND'
            )
        ) {
            alert(
                'You do not have permission to create interview rounds.'
            );
            return;
        }
        // ----------------------------------------------
        // Form Validation
        // ----------------------------------------------
        if (
            this.interviewRoundForm.invalid
        ) {
            this.interviewRoundForm.markAllAsTouched();
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
            this.interviewRoundForm.getRawValue();
        // ----------------------------------------------
        // Add Interview Round
        // ----------------------------------------------
        this.interviewRoundService
            .addInterviewRound(data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Interview Round Added Successfully'
                    );
                    this.router.navigate([
                        '/interview-round'
                    ]);
                },
                error: (err: any) => {
                    console.log(err);
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to add interview round'
                    );
                }
            });
    }
    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate([
            '/interview-round'
        ]);
    }
}