import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

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
  templateUrl: './department-add.component.html'
})
export class DepartmentAddComponent implements OnInit {
  // ==================================================
  // FORM
  // ==================================================
  departmentForm!: FormGroup;

  // ==================================================
  // MODE
  // ==================================================
  isEditMode = false;
  departmentId: number | null = null;

  // ==================================================
  // DATA
  // ==================================================
  companies: any[] = [];

  // ==================================================
  // LOADING
  // ==================================================
  loading = false;
  loadingCompanies = false;
  loadingDepartment = false;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================
  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private companyService: CompanyService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  // ==================================================
  // INIT
  // ==================================================
  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.departmentId = Number(id);
    }

    // ==================================================
    // PERMISSION CHECK
    // ==================================================
    if (
      !this.isEditMode &&
      !this.hasPermission(
        'CREATE_DEPARTMENT'
      )
    ) {
      alert(
        'You are not authorized to create departments.'
      );

      this.router.navigate([
        '/department'
      ]);

      return;
    }

    if (
      this.isEditMode &&
      !this.hasPermission(
        'UPDATE_DEPARTMENT'
      )
    ) {
      alert(
        'You are not authorized to update departments.'
      );

      this.router.navigate([
        '/department'
      ]);

      return;
    }

    // ==================================================
    // FORM
    // ==================================================
    this.departmentForm =
      this.fb.group({
        DepartmentCode: [
          '',
          Validators.required
        ],
        DepartmentName: [
          '',
          Validators.required
        ],
        CompanyId: [
          '',
          Validators.required
        ],
        Description: [
          ''
        ],
        IsActive: [
          true
        ]
      });

    // ==================================================
    // LOAD COMPANIES
    // ==================================================
    this.loadCompanies();

    // ==================================================
    // EDIT MODE
    // ==================================================
    if (
      this.isEditMode &&
      this.departmentId
    ) {
      this.loadDepartment();
    }
  }

  // ==================================================
  // PERMISSION CHECK
  // ==================================================
  hasPermission(
    permission: string
  ): boolean {
    return this.authService.hasPermission(
      permission
    );
  }

  // ==================================================
  // LOAD COMPANIES
  // ==================================================
  loadCompanies(): void {
    const companyId =
      this.authService.getCompanyId();

    this.loadingCompanies =
      true;

    // ==================================================
    // SUPER ADMIN
    // ==================================================
    if (
      this.hasPermission(
        'VIEW_ALL_COMPANIES'
      )
    ) {
      this.companyService
        .getCompanies(
          '',
          'CompanyName',
          'asc',
          1,
          100
        )
        .subscribe({
          next: (res: any) => {
            this.companies =
              res.data || [];

            this.loadingCompanies =
              false;
          },
          error: (err: any) => {
            console.error(
              'Error loading companies:',
              err
            );

            this.companies = [];

            this.loadingCompanies =
              false;
          }
        });

      return;
    }

    // ==================================================
    // COMPANY USER
    // ==================================================
    if (!companyId) {
      this.loadingCompanies =
        false;

      alert(
        'Company information not found.'
      );

      return;
    }

    this.companyService
      .getCompany(
        companyId
      )
      .subscribe({
        next: (company: any) => {
          this.companies = [
            company
          ];

          this.departmentForm
            .patchValue({
              CompanyId:
                company.CompanyId
            });

          this.departmentForm
            .get('CompanyId')
            ?.disable();

          this.loadingCompanies =
            false;
        },
        error: (err: any) => {
          console.error(
            'Error loading company:',
            err
          );

          this.companies = [];

          this.loadingCompanies =
            false;
        }
      });
  }

  // ==================================================
  // LOAD DEPARTMENT
  // ==================================================
  loadDepartment(): void {
    if (!this.departmentId) {
      return;
    }

    this.loadingDepartment =
      true;

    this.departmentService
      .getDepartmentById(
        this.departmentId
      )
      .subscribe({
        next: (response: any) => {
          console.log(
            'Department Edit Response:',
            response
          );

          const department =
            response?.data ||
            response;

          this.departmentForm
            .patchValue({
              DepartmentCode:
                department.DepartmentCode,
              DepartmentName:
                department.DepartmentName,
              CompanyId:
                department.CompanyId,
              Description:
                department.Description || '',
              IsActive:
                department.IsActive
            });

          // ==================================================
          // KEEP COMPANY DISABLED FOR COMPANY USER
          // ==================================================
          if (
            !this.hasPermission(
              'VIEW_ALL_COMPANIES'
            )
          ) {
            this.departmentForm
              .get('CompanyId')
              ?.disable();
          }

          this.loadingDepartment =
            false;
        },
        error: (err: any) => {
          console.error(
            'Error loading department:',
            err
          );

          this.loadingDepartment =
            false;

          alert(
            err?.error?.detail ||
            'Unable to load department.'
          );

          this.router.navigate([
            '/department'
          ]);
        }
      });
  }

  // ==================================================
  // SAVE DEPARTMENT
  // ==================================================
  saveDepartment(): void {
    const requiredPermission =
      this.isEditMode
        ? 'UPDATE_DEPARTMENT'
        : 'CREATE_DEPARTMENT';

    if (
      !this.hasPermission(
        requiredPermission
      )
    ) {
      alert(
        'You do not have permission to perform this action.'
      );

      return;
    }

    if (
      this.departmentForm.invalid
    ) {
      this.departmentForm
        .markAllAsTouched();

      return;
    }

    // ==================================================
    // GET RAW VALUE
    // Includes disabled CompanyId
    // ==================================================
    const data =
      this.departmentForm
        .getRawValue();

    this.loading = true;

    // ==================================================
    // EDIT
    // ==================================================
    if (
      this.isEditMode &&
      this.departmentId
    ) {
      this.updateDepartment(
        data
      );
    } else {
      this.createDepartment(
        data
      );
    }
  }

  // ==================================================
  // CREATE DEPARTMENT
  // ==================================================
  createDepartment(
    data: any
  ): void {
    this.departmentService
      .addDepartment(
        data
      )
      .subscribe({
        next: () => {
          this.loading =
            false;

          alert(
            'Department Added Successfully'
          );

          this.router.navigate([
            '/department'
          ]);
        },
        error: (err: any) => {
          console.error(
            'Error adding department:',
            err
          );

          this.loading =
            false;

          alert(
            err?.error?.detail ||
            'Unable to add department.'
          );
        }
      });
  }

  // ==================================================
  // UPDATE DEPARTMENT
  // ==================================================
  updateDepartment(
    data: any
  ): void {
    if (!this.departmentId) {
      return;
    }

    this.departmentService
      .updateDepartment(
        this.departmentId,
        data
      )
      .subscribe({
        next: () => {
          this.loading =
            false;

          alert(
            'Department Updated Successfully'
          );

          this.router.navigate([
            '/department'
          ]);
        },
        error: (err: any) => {
          console.error(
            'Error updating department:',
            err
          );

          this.loading =
            false;

          alert(
            err?.error?.detail ||
            'Unable to update department.'
          );
        }
      });
  }

  // ==================================================
  // CANCEL
  // ==================================================
  cancel(): void {
    this.router.navigate([
      '/department'
    ]);
  }
}