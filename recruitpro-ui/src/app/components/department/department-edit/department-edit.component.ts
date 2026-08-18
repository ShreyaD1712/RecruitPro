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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DepartmentService } from '../../../services/department.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-department-edit',
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
  templateUrl: './department-edit.component.html',
  
})
export class DepartmentEditComponent implements OnInit {

  departmentForm!: FormGroup;

  departmentId!: number;

  companies: any[] = [];

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private companyService: CompanyService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    // Permission Check
    if (!this.hasPermission('UPDATE_DEPARTMENT')) {
      alert('You are not authorized to access this page.');
      this.router.navigate(['/department']);
      return;
    }

    this.departmentId = Number(this.route.snapshot.paramMap.get('id'));

    this.departmentForm = this.fb.group({

      DepartmentCode: ['', Validators.required],

      DepartmentName: ['', Validators.required],

      CompanyId: ['', Validators.required],

      Description: [''],

      IsActive: [true]

    });

    this.loadCompanies();

    this.loadDepartment();

  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  loadCompanies() {

    
    const companyId = this.authService.getCompanyId();

    // Super Admin
    if (this.hasPermission('VIEW_ALL_COMPANIES')) {

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

          console.log(err);

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

          console.log(err);

        }

      });

    }

  }

  loadDepartment() {

    this.departmentService.getDepartmentById(this.departmentId)
      .subscribe({

        next: (res) => {

          this.departmentForm.patchValue(res);

        },

        error: (err) => {

          console.log(err);

          alert(err.error.detail);

          this.router.navigate(['/department']);

        }

      });

  }

  updateDepartment() {

    if (!this.hasPermission('UPDATE_DEPARTMENT')) {

      alert('You do not have permission to update departments.');

      return;

    }

    if (this.departmentForm.invalid) {

      this.departmentForm.markAllAsTouched();

      return;

    }

    // Enable CompanyId before submit if disabled
    this.departmentForm.get('CompanyId')?.enable();

    this.departmentService.updateDepartment(
      this.departmentId,
      this.departmentForm.value
    ).subscribe({

      next: () => {

        alert('Department Updated Successfully');

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