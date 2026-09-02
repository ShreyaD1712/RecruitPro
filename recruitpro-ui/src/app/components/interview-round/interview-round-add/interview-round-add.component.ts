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
    templateUrl: './interview-round-add.component.html'
})
export class InterviewRoundAddComponent implements OnInit {
    // ==================================================
    // FORM / MODE
    // ==================================================
    interviewRoundForm!: FormGroup;
    isEditMode = false;
    interviewRoundId: number | null = null;

    // ==================================================
    // DATA / LOADING
    // ==================================================
    companies: any[] = [];
    loading = false;
    loadingInterviewRound = false;

    constructor(
        private fb: FormBuilder,
        private interviewRoundService: InterviewRoundService,
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
            this.interviewRoundId = Number(id);
        }

        const requiredPermission = this.isEditMode
            ? 'UPDATE_INTERVIEW_ROUND'
            : 'CREATE_INTERVIEW_ROUND';

        if (!this.hasPermission(requiredPermission)) {
            alert('You are not authorized to access this page.');
            this.router.navigate(['/interview-round']);
            return;
        }

        this.interviewRoundForm = this.fb.group({
            RoundName: ['', Validators.required],
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
                        this.loadInterviewRound();
                    } else {
                        this.interviewRoundForm.patchValue({ CompanyId: null });
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
            this.router.navigate(['/interview-round']);
            return;
        }

        this.companyService.getCompany(companyId).subscribe({
            next: (company: any) => {
                this.companies = [company];

                if (this.isEditMode) {
                    this.loadInterviewRound();
                } else {
                    this.interviewRoundForm.patchValue({
                        CompanyId: company.CompanyId
                    });

                    this.interviewRoundForm.get('CompanyId')?.disable();
                }
            },
            error: (err: any) => {
                console.error('Error loading company:', err);
                alert('Unable to load company.');
                this.router.navigate(['/interview-round']);
            }
        });
    }

    // ==================================================
    // LOAD INTERVIEW ROUND
    // ==================================================
    loadInterviewRound(): void {
        if (!this.interviewRoundId) return;

        this.loadingInterviewRound = true;

        this.interviewRoundService
            .getInterviewRoundById(this.interviewRoundId)
            .subscribe({
                next: (response: any) => {
                    const interviewRound = response?.data || response;

                    if (
                        !this.hasPermission('VIEW_ALL_COMPANIES') &&
                        Number(interviewRound.CompanyId) !== Number(this.authService.getCompanyId())
                    ) {
                        alert('You are not authorized to edit this interview round.');
                        this.router.navigate(['/interview-round']);
                        return;
                    }

                    this.interviewRoundForm.patchValue({
                        RoundName: interviewRound.RoundName,
                        Description: interviewRound.Description || '',
                        CompanyId: interviewRound.CompanyId,
                        IsActive: interviewRound.IsActive
                    });

                    if (!this.hasPermission('VIEW_ALL_COMPANIES')) {
                        this.interviewRoundForm.get('CompanyId')?.disable();
                    }

                    this.loadingInterviewRound = false;
                },
                error: (err: any) => {
                    console.error('Error loading interview round:', err);
                    this.loadingInterviewRound = false;
                    alert(err?.error?.detail || 'Interview Round not found.');
                    this.router.navigate(['/interview-round']);
                }
            });
    }

    // ==================================================
    // SAVE INTERVIEW ROUND
    // ==================================================
    saveInterviewRound(): void {
        const requiredPermission = this.isEditMode
            ? 'UPDATE_INTERVIEW_ROUND'
            : 'CREATE_INTERVIEW_ROUND';

        if (!this.hasPermission(requiredPermission)) {
            alert('You do not have permission to perform this action.');
            return;
        }

        if (this.interviewRoundForm.invalid) {
            this.interviewRoundForm.markAllAsTouched();
            return;
        }

        const data = this.interviewRoundForm.getRawValue();
        this.loading = true;

        if (this.isEditMode && this.interviewRoundId) {
            this.updateInterviewRound(data);
        } else {
            this.createInterviewRound(data);
        }
    }

    // ==================================================
    // CREATE INTERVIEW ROUND
    // ==================================================
    createInterviewRound(data: any): void {
        this.interviewRoundService.addInterviewRound(data).subscribe({
            next: () => {
                this.loading = false;
                alert('Interview Round Added Successfully');
                this.router.navigate(['/interview-round']);
            },
            error: (err: any) => {
                console.error('Error adding interview round:', err);
                this.loading = false;
                alert(err?.error?.detail || 'Unable to add interview round');
            }
        });
    }

    // ==================================================
    // UPDATE INTERVIEW ROUND
    // ==================================================
    updateInterviewRound(data: any): void {
        if (!this.interviewRoundId) return;

        this.interviewRoundService
            .updateInterviewRound(this.interviewRoundId, data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert('Interview Round Updated Successfully');
                    this.router.navigate(['/interview-round']);
                },
                error: (err: any) => {
                    console.error('Error updating interview round:', err);
                    this.loading = false;
                    alert(err?.error?.detail || 'Failed to update interview round.');
                }
            });
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/interview-round']);
    }
}