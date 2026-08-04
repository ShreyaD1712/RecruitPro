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
  styleUrl: './designation-add.component.css'
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
  ) {}

  ngOnInit(): void {

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

        next: (res: any) => {

          this.companies = res.data;

        }

      });

    }

    // Company Admin
    else {

      this.companyService.getCompany(companyId).subscribe({

        next: (company: any) => {

          this.companies = [company];

          this.designationForm.patchValue({

            CompanyId: company.CompanyId

          });

          this.designationForm.get('CompanyId')?.disable();

          this.loadDepartments(company.CompanyId);

        }

      });

    }

  }

  companyChanged() {

    const companyId = this.designationForm.get('CompanyId')?.value;

    this.designationForm.patchValue({

      DepartmentId: ''

    });

    this.loadDepartments(companyId);

  }

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

      }

    });

  }

  saveDesignation() {

    if (this.designationForm.invalid) {

      this.designationForm.markAllAsTouched();

      return;

    }

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

  cancel() {

    this.router.navigate(['/designation']);

  }

}