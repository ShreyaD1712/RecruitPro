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

import { ExperienceLevelService } from '../../../services/experience-level.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-experience-level-add',
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
    templateUrl: './experience-level-add.component.html'
})
export class ExperienceLevelAddComponent implements OnInit {
    // ==================================================
    // FORM / MODE
    // ==================================================
    experienceLevelForm!: FormGroup;
    isEditMode = false;
    experienceLevelId: number | null = null;

    // ==================================================
    // DATA / LOADING
    // ==================================================
    companies: any[] = [];
    loading = false;
    loadingExperienceLevel = false;

    constructor(
        private fb: FormBuilder,
        private experienceLevelService: ExperienceLevelService,
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
            this.experienceLevelId = Number(id);
        }

        const requiredPermission = this.isEditMode
            ? 'UPDATE_EXPERIENCE_LEVEL'
            : 'CREATE_EXPERIENCE_LEVEL';

        if (!this.hasPermission(requiredPermission)) {
            alert('You are not authorized to access this page.');
            this.router.navigate(['/experience-level']);
            return;
        }

        this.experienceLevelForm = this.fb.group({
            LevelName: ['', Validators.required],
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
                        this.loadExperienceLevel();
                    } else {
                        this.experienceLevelForm.patchValue({ CompanyId: null });
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
            this.router.navigate(['/experience-level']);
            return;
        }

        this.companyService.getCompany(companyId).subscribe({
            next: (company: any) => {
                this.companies = [company];

                if (this.isEditMode) {
                    this.loadExperienceLevel();
                } else {
                    this.experienceLevelForm.patchValue({
                        CompanyId: company.CompanyId
                    });

                    this.experienceLevelForm.get('CompanyId')?.disable();
                }
            },
            error: (err: any) => {
                console.error('Error loading company:', err);
                alert('Unable to load company.');
                this.router.navigate(['/experience-level']);
            }
        });
    }

    // ==================================================
    // LOAD EXPERIENCE LEVEL
    // ==================================================
    loadExperienceLevel(): void {
        if (!this.experienceLevelId) return;

        this.loadingExperienceLevel = true;

        this.experienceLevelService
            .getExperienceLevelById(this.experienceLevelId)
            .subscribe({
                next: (response: any) => {
                    const experienceLevel = response?.data || response;

                    if (
                        !this.hasPermission('VIEW_ALL_COMPANIES') &&
                        Number(experienceLevel.CompanyId) !== Number(this.authService.getCompanyId())
                    ) {
                        alert('You are not authorized to edit this experience level.');
                        this.router.navigate(['/experience-level']);
                        return;
                    }

                    this.experienceLevelForm.patchValue({
                        LevelName: experienceLevel.LevelName,
                        Description: experienceLevel.Description || '',
                        CompanyId: experienceLevel.CompanyId,
                        IsActive: experienceLevel.IsActive
                    });

                    if (!this.hasPermission('VIEW_ALL_COMPANIES')) {
                        this.experienceLevelForm.get('CompanyId')?.disable();
                    }

                    this.loadingExperienceLevel = false;
                },
                error: (err: any) => {
                    console.error('Error loading experience level:', err);
                    this.loadingExperienceLevel = false;
                    alert(err?.error?.detail || 'Experience Level not found.');
                    this.router.navigate(['/experience-level']);
                }
            });
    }

    // ==================================================
    // SAVE EXPERIENCE LEVEL
    // ==================================================
    saveExperienceLevel(): void {
        const requiredPermission = this.isEditMode
            ? 'UPDATE_EXPERIENCE_LEVEL'
            : 'CREATE_EXPERIENCE_LEVEL';

        if (!this.hasPermission(requiredPermission)) {
            alert('You do not have permission to perform this action.');
            return;
        }

        if (this.experienceLevelForm.invalid) {
            this.experienceLevelForm.markAllAsTouched();
            return;
        }

        const data = this.experienceLevelForm.getRawValue();
        this.loading = true;

        if (this.isEditMode && this.experienceLevelId) {
            this.updateExperienceLevel(data);
        } else {
            this.createExperienceLevel(data);
        }
    }

    // ==================================================
    // CREATE EXPERIENCE LEVEL
    // ==================================================
    createExperienceLevel(data: any): void {
        this.experienceLevelService.addExperienceLevel(data).subscribe({
            next: () => {
                this.loading = false;
                alert('Experience Level Added Successfully');
                this.router.navigate(['/experience-level']);
            },
            error: (err: any) => {
                console.error('Error adding experience level:', err);
                this.loading = false;
                alert(err?.error?.detail || 'Unable to add experience level');
            }
        });
    }

    // ==================================================
    // UPDATE EXPERIENCE LEVEL
    // ==================================================
    updateExperienceLevel(data: any): void {
        if (!this.experienceLevelId) return;

        this.experienceLevelService
            .updateExperienceLevel(this.experienceLevelId, data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert('Experience Level Updated Successfully');
                    this.router.navigate(['/experience-level']);
                },
                error: (err: any) => {
                    console.error('Error updating experience level:', err);
                    this.loading = false;
                    alert(err?.error?.detail || 'Failed to update experience level.');
                }
            });
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/experience-level']);
    }
}