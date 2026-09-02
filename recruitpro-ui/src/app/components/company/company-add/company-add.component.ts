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

import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-company-add',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSlideToggleModule
    ],
    templateUrl: './company-add.component.html'
})
export class CompanyAddComponent implements OnInit {
    // ==================================================
    // FORM / MODE
    // ==================================================
    companyForm!: FormGroup;
    isEditMode = false;
    companyId: number | null = null;

    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    loadingCompany = false;

    constructor(
        private fb: FormBuilder,
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
            this.companyId = Number(id);
        }

        const requiredPermission = this.isEditMode
            ? 'UPDATE_COMPANY'
            : 'CREATE_COMPANY';

        if (!this.hasPermission(requiredPermission)) {
            alert('You are not authorized to access this page.');
            this.router.navigate(['/company']);
            return;
        }

        this.companyForm = this.fb.group({
            CompanyCode: ['', [Validators.required, Validators.maxLength(50)]],
            CompanyName: ['', [Validators.required, Validators.maxLength(150)]],
            Email: ['', [
                Validators.required,
                Validators.email,
                Validators.maxLength(150)
            ]],
            Phone: ['', Validators.maxLength(20)],
            Website: ['', Validators.maxLength(250)],
            Address: ['', Validators.maxLength(500)],
            IsActive: [true]
        });

        if (this.isEditMode && this.companyId) {
            this.loadCompany();
        }
    }

    // ==================================================
    // PERMISSION CHECK
    // ==================================================
    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    // ==================================================
    // LOAD COMPANY
    // ==================================================
    loadCompany(): void {
        if (!this.companyId) return;

        this.loadingCompany = true;

        this.companyService.getCompany(this.companyId).subscribe({
            next: (response: any) => {
                const company = response?.data || response;

                this.companyForm.patchValue({
                    CompanyCode: company.CompanyCode,
                    CompanyName: company.CompanyName,
                    Email: company.Email,
                    Phone: company.Phone || '',
                    Website: company.Website || '',
                    Address: company.Address || '',
                    IsActive: company.IsActive
                });

                this.loadingCompany = false;
            },
            error: (err: any) => {
                console.error('Error loading company:', err);
                this.loadingCompany = false;

                alert(
                    err?.error?.detail ||
                    'Company not found'
                );

                this.router.navigate(['/company']);
            }
        });
    }

    // ==================================================
    // SAVE COMPANY
    // ==================================================
    saveCompany(): void {
        const requiredPermission = this.isEditMode
            ? 'UPDATE_COMPANY'
            : 'CREATE_COMPANY';

        if (!this.hasPermission(requiredPermission)) {
            alert('You do not have permission to perform this action.');
            return;
        }

        if (this.companyForm.invalid) {
            this.companyForm.markAllAsTouched();
            return;
        }

        const data = this.companyForm.getRawValue();
        this.loading = true;

        if (this.isEditMode && this.companyId) {
            this.updateCompany(data);
        } else {
            this.createCompany(data);
        }
    }

    // ==================================================
    // CREATE COMPANY
    // ==================================================
    createCompany(data: any): void {
        this.companyService.addCompany(data).subscribe({
            next: () => {
                this.loading = false;
                alert('Company Added Successfully');
                this.router.navigate(['/company']);
            },
            error: (err: any) => {
                console.error('Error adding company:', err);
                this.loading = false;

                alert(
                    err?.error?.detail ||
                    'Unable to add company'
                );
            }
        });
    }

    // ==================================================
    // UPDATE COMPANY
    // ==================================================
    updateCompany(data: any): void {
        if (!this.companyId) return;

        this.companyService
            .updateCompany(this.companyId, data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert('Company Updated Successfully');
                    this.router.navigate(['/company']);
                },
                error: (err: any) => {
                    console.error('Error updating company:', err);
                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to update company'
                    );
                }
            });
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/company']);
    }
}