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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { SkillService } from '../../../services/skill.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-skill-edit',
    standalone: true,

    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatSlideToggleModule
    ],

    templateUrl: './skill-edit.component.html',
    
})
export class SkillEditComponent implements OnInit {

    skillForm!: FormGroup;

    skillId!: number;

    companies: any[] = [];

    loading = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private skillService: SkillService,
        private companyService: CompanyService,
        public authService: AuthService
    ) { }

    // ==========================
    // INIT
    // ==========================

    ngOnInit(): void {

        // Permission Check

        if (!this.hasPermission('UPDATE_SKILL')) {

            alert('You are not authorized to access this page.');

            this.router.navigate(['/skill']);

            return;
        }

        // Get Skill ID

        this.skillId = Number(
            this.route.snapshot.paramMap.get('id')
        );

        if (!this.skillId) {

            alert('Invalid Skill ID.');

            this.router.navigate(['/skill']);

            return;
        }

        // Create Form

        this.skillForm = this.fb.group({

            SkillName: [
                '',
                Validators.required
            ],

            CompanyId: [
                null,
                Validators.required
            ],

            Description: [''],

            IsActive: [true]

        });

        this.loadCompany();
    }

    // ==========================
    // PERMISSION CHECK
    // ==========================

    hasPermission(permission: string): boolean {

        return this.authService.hasPermission(permission);
    }

    // ==========================
    // LOAD LOGGED-IN USER COMPANY
    // ==========================

    loadCompany(): void {

        const companyId =
            this.authService.getCompanyId();

        if (!companyId) {

            alert('Company information not found.');

            this.router.navigate(['/skill']);

            return;
        }

        this.companyService
            .getCompany(companyId)
            .subscribe({

                next: (company: any) => {

                    // Show only user's company

                    this.companies = [company];

                    // Load Skill after company loads

                    this.loadSkill();
                },

                error: (err) => {

                    console.log(
                        'Error loading company:',
                        err
                    );

                    alert('Unable to load company.');

                    this.router.navigate(['/skill']);
                }

            });
    }

    // ==========================
    // LOAD SKILL
    // ==========================

    loadSkill(): void {

        this.skillService
            .getSkillById(this.skillId)
            .subscribe({

                next: (skill: any) => {

                    // Important security check:
                    // Company Admin should not edit
                    // a skill from another company.

                    const loggedInCompanyId =
                        this.authService.getCompanyId();

                    if (
                        skill.CompanyId !==
                        loggedInCompanyId
                    ) {

                        alert(
                            'You are not authorized to edit this skill.'
                        );

                        this.router.navigate(['/skill']);

                        return;
                    }

                    this.skillForm.patchValue({

                        SkillName:
                            skill.SkillName,

                        CompanyId:
                            skill.CompanyId,

                        Description:
                            skill.Description,

                        IsActive:
                            skill.IsActive

                    });

                    // Disable company because
                    // company should not change on update

                    this.skillForm
                        .get('CompanyId')
                        ?.disable();

                },

                error: (err) => {

                    console.log(err);

                    alert(
                        err?.error?.detail ||
                        'Skill not found.'
                    );

                    this.router.navigate(['/skill']);

                }

            });
    }

    // ==========================
    // UPDATE SKILL
    // ==========================

    updateSkill(): void {

        if (!this.hasPermission('UPDATE_SKILL')) {

            alert(
                'You do not have permission to update skills.'
            );

            return;
        }

        if (this.skillForm.invalid) {

            this.skillForm.markAllAsTouched();

            return;
        }

        this.loading = true;

        this.skillService
            .updateSkill(
                this.skillId,

                // getRawValue() includes
                // disabled CompanyId

                this.skillForm.getRawValue()
            )
            .subscribe({

                next: () => {

                    this.loading = false;

                    alert(
                        'Skill Updated Successfully'
                    );

                    this.router.navigate([
                        '/skill'
                    ]);

                },

                error: (err) => {

                    this.loading = false;

                    console.log(err);

                    alert(
                        err?.error?.detail ||
                        'Failed to update skill.'
                    );

                }

            });
    }

    // ==========================
    // CANCEL
    // ==========================

    cancel(): void {

        this.router.navigate([
            '/skill'
        ]);
    }

}