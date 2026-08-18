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

import { DepartmentService } from '../../../services/department.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-department-add',
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
  templateUrl: './department-add.component.html',
  
})
export class DepartmentAddComponent implements OnInit {

  departmentForm!: FormGroup;

  companies: any[] = [];

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {

    // Permission Check
    if (!this.hasPermission('CREATE_DEPARTMENT')) {
      alert('You are not authorized to access this page.');
      this.router.navigate(['/department']);
      return;
    }

    this.departmentForm = this.fb.group({
      DepartmentCode: ['', Validators.required],
      DepartmentName: ['', Validators.required],
      CompanyId: ['', Validators.required],
      Description: [''],
      IsActive: [true]
    });

    this.loadCompanies();

  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  loadCompanies() {

    const roleId = this.authService.getRoleId();
    const companyId = this.authService.getCompanyId();

    // Super Admin
    if (roleId === 1) {

      this.companyService.getCompanies(
        '',
        'CompanyName',
        'asc',
        1,
        100
      ).subscribe({

        next: (res) => {
          this.companies = res.data;
        },

        error: (err) => {
          console.error(err);
        }

      });

    }

    // Company Admin
    else {

      this.companyService.getCompany(companyId).subscribe({

        next: (company) => {

          this.companies = [company];

          this.departmentForm.patchValue({
            CompanyId: company.CompanyId
          });

          this.departmentForm.get('CompanyId')?.disable();

        },

        error: (err) => {
          console.error(err);
        }

      });

    }

  }

  saveDepartment() {

    if (!this.hasPermission('CREATE_DEPARTMENT')) {
      alert('You do not have permission to create departments.');
      return;
    }

    if (this.departmentForm.invalid) {

      this.departmentForm.markAllAsTouched();

      return;

    }

    // Enable before submit so CompanyId is included
    this.departmentForm.get('CompanyId')?.enable();

    this.departmentService.addDepartment(
      this.departmentForm.value
    ).subscribe({

      next: () => {

        alert('Department Added Successfully');

        this.router.navigate(['/department']);

      },

      error: (err) => {

        console.log(err);

        alert(err.error.detail);

      }

    });

  }

  cancel() {

    this.router.navigate(['/department']);

  }

}