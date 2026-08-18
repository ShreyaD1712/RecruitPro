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
import { ExperienceLevelService } from '../../../services/experience-level.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-experience-level-edit',
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
    templateUrl: './experience-level-edit.component.html',
})
export class ExperienceLevelEditComponent implements OnInit {
    // ==========================
    // FORM
    // ==========================
    experienceLevelForm!: FormGroup;
    // ==========================
    // EXPERIENCE LEVEL ID
    // ==========================
    experienceLevelId!: number;
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
        private experienceLevelService: ExperienceLevelService,
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
                'UPDATE_EXPERIENCE_LEVEL'
            )
        ) {
            alert(
                'You are not authorized to access this page.'
            );
            this.router.navigate([
                '/experience-level'
            ]);
            return;
        }
        // Get Experience Level ID
        this.experienceLevelId = Number(
            this.route.snapshot.paramMap.get('id')
        );
        if (!this.experienceLevelId) {
            alert(
                'Invalid Experience Level ID.'
            );
            this.router.navigate([
                '/experience-level'
            ]);
            return;
        }
        // Create Form
        this.experienceLevelForm = this.fb.group({
            LevelName: [
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
                '/experience-level'
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
                    this.experienceLevelForm.patchValue({
                        CompanyId: company.CompanyId
                    });
                    // Disable Company dropdown
                    // Company cannot be changed
                    this.experienceLevelForm
                        .get('CompanyId')
                        ?.disable();
                    // Load Experience Level
                    this.loadExperienceLevel();
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
                        '/experience-level'
                    ]);
                }
            });
    }
    // ==========================
    // LOAD EXPERIENCE LEVEL
    // ==========================
    loadExperienceLevel(): void {
        this.experienceLevelService
            .getExperienceLevelById(
                this.experienceLevelId
            )
            .subscribe({
                next: (experienceLevel: any) => {
                    // Security check
                    const loggedInCompanyId =
                        this.authService.getCompanyId();
                    if (
                        experienceLevel.CompanyId !==
                        loggedInCompanyId
                    ) {
                        alert(
                            'You are not authorized to edit this experience level.'
                        );
                        this.router.navigate([
                            '/experience-level'
                        ]);
                        return;
                    }
                    // Fill form
                    this.experienceLevelForm.patchValue({
                        LevelName:
                            experienceLevel.LevelName,
                        CompanyId:
                            experienceLevel.CompanyId,
                        Description:
                            experienceLevel.Description,
                        IsActive:
                            experienceLevel.IsActive
                    });
                },
                error: (err: any) => {
                    console.log(err);
                    alert(
                        err?.error?.detail ||
                        'Experience Level not found.'
                    );
                    this.router.navigate([
                        '/experience-level'
                    ]);
                }
            });
    }
    // ==========================
    // UPDATE EXPERIENCE LEVEL
    // ==========================
    updateExperienceLevel(): void {
        if (
            !this.hasPermission(
                'UPDATE_EXPERIENCE_LEVEL'
            )
        ) {
            alert(
                'You do not have permission to update experience levels.'
            );
            return;
        }
        if (
            this.experienceLevelForm.invalid
        ) {
            this.experienceLevelForm.markAllAsTouched();
            return;
        }
        this.loading = true;
        /*
         * getRawValue() includes
         * disabled CompanyId.
         */
        const data =
            this.experienceLevelForm.getRawValue();
        this.experienceLevelService
            .updateExperienceLevel(
                this.experienceLevelId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Experience Level Updated Successfully'
                    );
                    this.router.navigate([
                        '/experience-level'
                    ]);
                },
                error: (err: any) => {
                    this.loading = false;
                    console.log(err);
                    alert(
                        err?.error?.detail ||
                        'Failed to update experience level.'
                    );
                }
            });
    }
    // ==========================
    // CANCEL
    // ==========================
    cancel(): void {
        this.router.navigate([
            '/experience-level'
        ]);
    }
}