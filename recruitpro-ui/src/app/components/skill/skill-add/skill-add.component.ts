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
import { SkillService } from '../../../services/skill.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-skill-add',
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
    templateUrl: './skill-add.component.html',
})
export class SkillAddComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    skillForm!: FormGroup;
    // ==================================================
    // DATA
    // ==================================================
    companies: any[] = [];
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    constructor(
        private fb: FormBuilder,
        private skillService: SkillService,
        private companyService: CompanyService,
        public authService: AuthService,
        private router: Router
    ) { }
    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        // Permission Check
        if (
            !this.authService.hasPermission(
                'CREATE_SKILL'
            )
        ) {
            alert(
                'You are not authorized to create skills.'
            );
            this.router.navigate([
                '/skill'
            ]);
            return;
        }
        // Create Form
        this.skillForm = this.fb.group({
            SkillName: [
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
        // Load Companies
        this.loadCompanies();
    }
    // ==================================================
    // LOAD COMPANIES
    // ==================================================
    loadCompanies(): void {
        /*
         * User with VIEW_ALL_COMPANIES permission
         * can select any company.
         */
        if (
            this.authService.hasPermission(
                'VIEW_ALL_COMPANIES'
            )
        ) {
            this.companyService.getCompanies(
                '',
                'CompanyName',
                'asc',
                1,
                1000
            ).subscribe({
                next: (response: any) => {
                    this.companies =
                        response.data || [];
                    // Do not automatically select company
                    this.skillForm.patchValue({
                        CompanyId: null
                    });
                },
                error: (err) => {
                    console.log(
                        'Error loading companies:',
                        err
                    );
                    this.companies = [];
                }
            });
        }
        /*
         * Company-based user:
         * Automatically select only their company.
         */
        else {
            const companyId =
                this.authService.getCompanyId();
            if (!companyId) {
                console.log(
                    'Company information not found.'
                );
                return;
            }
            this.companyService
                .getCompany(companyId)
                .subscribe({
                    next: (company: any) => {
                        // Show only their company
                        this.companies = [
                            company
                        ];
                        // Automatically select company
                        this.skillForm.patchValue({
                            CompanyId:
                                company.CompanyId
                        });
                        // Disable company selection
                        this.skillForm
                            .get('CompanyId')
                            ?.disable();
                    },
                    error: (err) => {
                        console.log(
                            'Error loading company:',
                            err
                        );
                    }
                });
        }
    }
    // ==================================================
    // SAVE SKILL
    // ==================================================
    saveSkill(): void {
        // Permission Check
        if (
            !this.authService.hasPermission(
                'CREATE_SKILL'
            )
        ) {
            alert(
                'You do not have permission to create skills.'
            );
            return;
        }
        // Form Validation
        if (
            this.skillForm.invalid
        ) {
            this.skillForm.markAllAsTouched();
            return;
        }
        this.loading = true;
        /*
         * getRawValue() is important.
         *
         * CompanyId is disabled for users
         * who can only access their own company.
         *
         * getRawValue() includes disabled fields.
         */
        const data =
            this.skillForm.getRawValue();
        this.skillService
            .addSkill(data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Skill Added Successfully'
                    );
                    this.router.navigate([
                        '/skill'
                    ]);
                },
                error: (err) => {
                    console.log(err);
                    this.loading = false;
                    alert(
                        err.error?.detail ||
                        'Unable to add skill'
                    );
                }
            });
    }
    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate([
            '/skill'
        ]);
    }
}