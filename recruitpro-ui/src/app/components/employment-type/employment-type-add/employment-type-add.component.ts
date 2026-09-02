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

import { EmploymentTypeService } from '../../../services/employment-type.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-employment-type-add',
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
    templateUrl: './employment-type-add.component.html'
})
export class EmploymentTypeAddComponent implements OnInit {
    // ==================================================
    // FORM / MODE
    // ==================================================
    employmentTypeForm!: FormGroup;
    isEditMode = false;
    employmentTypeId: number | null = null;

    // ==================================================
    // DATA / LOADING
    // ==================================================
    companies: any[] = [];
    loading = false;
    loadingEmploymentType = false;

    constructor(
        private fb: FormBuilder,
        private employmentTypeService: EmploymentTypeService,
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
            this.employmentTypeId = Number(id);
        }

        const requiredPermission = this.isEditMode
            ? 'UPDATE_EMPLOYMENT_TYPE'
            : 'CREATE_EMPLOYMENT_TYPE';

        if (!this.hasPermission(requiredPermission)) {
            alert('You are not authorized to access this page.');
            this.router.navigate(['/employment-type']);
            return;
        }

        this.employmentTypeForm = this.fb.group({
            EmploymentTypeName: ['', Validators.required],
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
                        this.loadEmploymentType();
                    } else {
                        this.employmentTypeForm.patchValue({ CompanyId: null });
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
            this.router.navigate(['/employment-type']);
            return;
        }

        this.companyService.getCompany(companyId).subscribe({
            next: (company: any) => {
                this.companies = [company];

                if (this.isEditMode) {
                    this.loadEmploymentType();
                } else {
                    this.employmentTypeForm.patchValue({
                        CompanyId: company.CompanyId
                    });

                    this.employmentTypeForm.get('CompanyId')?.disable();
                }
            },
            error: (err: any) => {
                console.error('Error loading company:', err);
                alert('Unable to load company.');
                this.router.navigate(['/employment-type']);
            }
        });
    }

    // ==================================================
    // LOAD EMPLOYMENT TYPE
    // ==================================================
    loadEmploymentType(): void {
        if (!this.employmentTypeId) return;

        this.loadingEmploymentType = true;

        this.employmentTypeService
            .getEmploymentTypeById(this.employmentTypeId)
            .subscribe({
                next: (response: any) => {
                    const employmentType = response?.data || response;

                    if (
                        !this.hasPermission('VIEW_ALL_COMPANIES') &&
                        Number(employmentType.CompanyId) !== Number(this.authService.getCompanyId())
                    ) {
                        alert('You are not authorized to edit this employment type.');
                        this.router.navigate(['/employment-type']);
                        return;
                    }

                    this.employmentTypeForm.patchValue({
                        EmploymentTypeName: employmentType.EmploymentTypeName,
                        Description: employmentType.Description || '',
                        CompanyId: employmentType.CompanyId,
                        IsActive: employmentType.IsActive
                    });

                    if (!this.hasPermission('VIEW_ALL_COMPANIES')) {
                        this.employmentTypeForm.get('CompanyId')?.disable();
                    }

                    this.loadingEmploymentType = false;
                },
                error: (err: any) => {
                    console.error('Error loading employment type:', err);
                    this.loadingEmploymentType = false;
                    alert(err?.error?.detail || 'Employment Type not found.');
                    this.router.navigate(['/employment-type']);
                }
            });
    }

    // ==================================================
    // SAVE EMPLOYMENT TYPE
    // ==================================================
    saveEmploymentType(): void {
        const requiredPermission = this.isEditMode
            ? 'UPDATE_EMPLOYMENT_TYPE'
            : 'CREATE_EMPLOYMENT_TYPE';

        if (!this.hasPermission(requiredPermission)) {
            alert('You do not have permission to perform this action.');
            return;
        }

        if (this.employmentTypeForm.invalid) {
            this.employmentTypeForm.markAllAsTouched();
            return;
        }

        const data = this.employmentTypeForm.getRawValue();
        this.loading = true;

        if (this.isEditMode && this.employmentTypeId) {
            this.updateEmploymentType(data);
        } else {
            this.createEmploymentType(data);
        }
    }

    // ==================================================
    // CREATE EMPLOYMENT TYPE
    // ==================================================
    createEmploymentType(data: any): void {
        this.employmentTypeService.addEmploymentType(data).subscribe({
            next: () => {
                this.loading = false;
                alert('Employment Type Added Successfully');
                this.router.navigate(['/employment-type']);
            },
            error: (err: any) => {
                console.error('Error adding employment type:', err);
                this.loading = false;
                alert(err?.error?.detail || 'Unable to add employment type');
            }
        });
    }

    // ==================================================
    // UPDATE EMPLOYMENT TYPE
    // ==================================================
    updateEmploymentType(data: any): void {
        if (!this.employmentTypeId) return;

        this.employmentTypeService
            .updateEmploymentType(this.employmentTypeId, data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert('Employment Type Updated Successfully');
                    this.router.navigate(['/employment-type']);
                },
                error: (err: any) => {
                    console.error('Error updating employment type:', err);
                    this.loading = false;
                    alert(err?.error?.detail || 'Failed to update employment type.');
                }
            });
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/employment-type']);
    }
}