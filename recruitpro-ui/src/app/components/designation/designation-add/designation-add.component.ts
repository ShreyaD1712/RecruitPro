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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DesignationService } from '../../../services/designation.service';
import { CompanyService } from '../../../services/company.service';
import { DepartmentService } from '../../../services/department.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-designation-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './designation-add.component.html',
 
})
export class DesignationAddComponent implements OnInit {

  designationForm!: FormGroup;

  companies: any[] = [];
  departments: any[] = [];

  constructor(
    private fb: FormBuilder,
    private designationService: DesignationService,
    private companyService: CompanyService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {

    // Permission Check
    if (!this.hasPermission('CREATE_DESIGNATION')) {

      alert('You are not authorized to access this page.');

      this.router.navigate(['/designation']);

      return;

    }

    this.designationForm = this.fb.group({

      DesignationCode: ['', Validators.required],

      DesignationName: ['', Validators.required],

      CompanyId: ['', Validators.required],

      DepartmentId: ['', Validators.required],

      Description: [''],

      IsActive: [true]

    });

    this.loadCompanies();

  }

  hasPermission(permission: string): boolean {

    return this.authService.hasPermission(permission);

  }

  // ----------------------------
  // Load Companies
  // ----------------------------
  loadCompanies() {

    // User can view all companies
    if (this.hasPermission('VIEW_ALL_COMPANIES')) {

      this.companyService.getCompanies(
        '',
        'CompanyName',
        'asc',
        1,
        1000
      ).subscribe({

        next: (res: any) => {

          this.companies = res.data;

        },

        error: (err) => {

          console.log(err);

        }

      });

    }

    // User belongs to single company
    else {

      const companyId = this.authService.getCompanyId();

      this.companyService.getCompany(companyId).subscribe({

        next: (company: any) => {

          this.companies = [company];

          this.designationForm.patchValue({

            CompanyId: company.CompanyId

          });

          this.designationForm.get('CompanyId')?.disable();

          this.loadDepartments(company.CompanyId);

        },

        error: (err) => {

          console.log(err);

        }

      });

    }

  }

  // ----------------------------
  // Company Changed
  // ----------------------------
  companyChanged() {

    const companyId = this.designationForm.get('CompanyId')?.value;

    this.designationForm.patchValue({

      DepartmentId: ''

    });

    this.departments = [];

    if (companyId) {

      this.loadDepartments(companyId);

    }

  }

  // ----------------------------
  // Load Departments
  // ----------------------------
  loadDepartments(companyId: number) {

    this.departmentService.getDepartments(
      '',
      companyId,
      'DepartmentName',
      'asc',
      1,
      1000
    ).subscribe({

      next: (res: any) => {

        this.departments = res.data;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  // ----------------------------
  // Save Designation
  // ----------------------------
  saveDesignation() {

    if (!this.hasPermission('CREATE_DESIGNATION')) {

      alert('You do not have permission to create designations.');

      return;

    }

    if (this.designationForm.invalid) {

      this.designationForm.markAllAsTouched();

      return;

    }

    // Enable CompanyId before submit
    this.designationForm.get('CompanyId')?.enable();

    this.designationService.addDesignation(
      this.designationForm.value
    ).subscribe({

      next: () => {

        alert('Designation Added Successfully');

        this.router.navigate(['/designation']);

      },

      error: (err) => {

        console.log(err);

        alert(err.error.detail);

      }

    });

  }

  // ----------------------------
  // Cancel
  // ----------------------------
  cancel() {

    this.router.navigate(['/designation']);

  }

}