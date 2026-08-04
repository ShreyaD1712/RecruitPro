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

import { DesignationService } from '../../../services/designation.service';
import { CompanyService } from '../../../services/company.service';
import { DepartmentService } from '../../../services/department.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-designation-edit',
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
  templateUrl: './designation-edit.component.html',
  styleUrl: './designation-edit.component.css'
})
export class DesignationEditComponent implements OnInit {

  designationForm!: FormGroup;

  designationId!: number;

  companies: any[] = [];
  departments: any[] = [];

  roleId = 0;

  constructor(
    private fb: FormBuilder,
    private designationService: DesignationService,
    private companyService: CompanyService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.roleId = this.authService.getRoleId();

    this.designationId = Number(
      this.route.snapshot.paramMap.get('id')
    );

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

    const companyId = this.authService.getCompanyId();

    if (this.roleId === 1) {

      this.companyService.getCompanies(
        '',
        'CompanyName',
        'asc',
        1,
        100
      ).subscribe({

        next: (res: any) => {

          this.companies = res.data;

          this.loadDesignation();

        }

      });

    }
    else {

      this.companyService.getCompany(companyId).subscribe({

        next: (company: any) => {

          this.companies = [company];

          this.loadDesignation();

        }

      });

    }

  }

  loadDesignation() {

    this.designationService
      .getDesignationById(this.designationId)
      .subscribe({

        next: (res: any) => {

          this.designationForm.patchValue(res);

          this.loadDepartments(res.CompanyId);

          if (this.roleId !== 1) {

            this.designationForm
              .get('CompanyId')
              ?.disable();

          }

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  companyChanged() {

    const companyId =
      this.designationForm.get('CompanyId')?.value;

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

  updateDesignation() {

    if (this.designationForm.invalid) {

      this.designationForm.markAllAsTouched();

      return;

    }

    this.designationForm.get('CompanyId')?.enable();

    this.designationService.updateDesignation(
      this.designationId,
      this.designationForm.value
    ).subscribe({

      next: () => {

        alert('Designation Updated Successfully');

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