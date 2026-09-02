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
    templateUrl: './skill-add.component.html'
})
export class SkillAddComponent implements OnInit {
    // ==================================================
    // FORM / MODE
    // ==================================================
    skillForm!: FormGroup;
    isEditMode = false;
    skillId: number | null = null;

    // ==================================================
    // DATA / LOADING
    // ==================================================
    companies: any[] = [];
    loading = false;
    loadingSkill = false;

    constructor(
        private fb: FormBuilder,
        private skillService: SkillService,
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
            this.skillId = Number(id);
        }

        const requiredPermission = this.isEditMode
            ? 'UPDATE_SKILL'
            : 'CREATE_SKILL';

        if (!this.hasPermission(requiredPermission)) {
            alert('You are not authorized to access this page.');
            this.router.navigate(['/skill']);
            return;
        }

        this.skillForm = this.fb.group({
            SkillName: ['', Validators.required],
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
                        this.loadSkill();
                    } else {
                        this.skillForm.patchValue({ CompanyId: null });
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
            this.router.navigate(['/skill']);
            return;
        }

        this.companyService.getCompany(companyId).subscribe({
            next: (company: any) => {
                this.companies = [company];

                if (this.isEditMode) {
                    this.loadSkill();
                } else {
                    this.skillForm.patchValue({
                        CompanyId: company.CompanyId
                    });

                    this.skillForm.get('CompanyId')?.disable();
                }
            },
            error: (err: any) => {
                console.error('Error loading company:', err);
                alert('Unable to load company.');
                this.router.navigate(['/skill']);
            }
        });
    }

    // ==================================================
    // LOAD SKILL
    // ==================================================
    loadSkill(): void {
        if (!this.skillId) return;

        this.loadingSkill = true;

        this.skillService.getSkillById(this.skillId).subscribe({
            next: (skill: any) => {
                const data = skill?.data || skill;

                if (
                    !this.hasPermission('VIEW_ALL_COMPANIES') &&
                    Number(data.CompanyId) !== Number(this.authService.getCompanyId())
                ) {
                    alert('You are not authorized to edit this skill.');
                    this.router.navigate(['/skill']);
                    return;
                }

                this.skillForm.patchValue({
                    SkillName: data.SkillName,
                    Description: data.Description || '',
                    CompanyId: data.CompanyId,
                    IsActive: data.IsActive
                });

                if (!this.hasPermission('VIEW_ALL_COMPANIES')) {
                    this.skillForm.get('CompanyId')?.disable();
                }

                this.loadingSkill = false;
            },
            error: (err: any) => {
                console.error('Error loading skill:', err);
                this.loadingSkill = false;
                alert(err?.error?.detail || 'Skill not found.');
                this.router.navigate(['/skill']);
            }
        });
    }

    // ==================================================
    // SAVE SKILL
    // ==================================================
    saveSkill(): void {
        const requiredPermission = this.isEditMode
            ? 'UPDATE_SKILL'
            : 'CREATE_SKILL';

        if (!this.hasPermission(requiredPermission)) {
            alert('You do not have permission to perform this action.');
            return;
        }

        if (this.skillForm.invalid) {
            this.skillForm.markAllAsTouched();
            return;
        }

        const data = this.skillForm.getRawValue();
        this.loading = true;

        if (this.isEditMode && this.skillId) {
            this.updateSkill(data);
        } else {
            this.createSkill(data);
        }
    }

    // ==================================================
    // CREATE SKILL
    // ==================================================
    createSkill(data: any): void {
        this.skillService.addSkill(data).subscribe({
            next: () => {
                this.loading = false;
                alert('Skill Added Successfully');
                this.router.navigate(['/skill']);
            },
            error: (err: any) => {
                console.error('Error adding skill:', err);
                this.loading = false;
                alert(err?.error?.detail || 'Unable to add skill');
            }
        });
    }

    // ==================================================
    // UPDATE SKILL
    // ==================================================
    updateSkill(data: any): void {
        if (!this.skillId) return;

        this.skillService.updateSkill(this.skillId, data).subscribe({
            next: () => {
                this.loading = false;
                alert('Skill Updated Successfully');
                this.router.navigate(['/skill']);
            },
            error: (err: any) => {
                console.error('Error updating skill:', err);
                this.loading = false;
                alert(err?.error?.detail || 'Failed to update skill.');
            }
        });
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/skill']);
    }
}