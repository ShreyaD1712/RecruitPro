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
  templateUrl: './designation-add.component.html'
})
export class DesignationAddComponent implements OnInit {
  // ==================================================
  // FORM
  // ==================================================
  designationForm!: FormGroup;
  // ==================================================
  // MODE
  // ==================================================
  isEditMode = false;
  designationId: number | null = null;
  // ==================================================
  // DATA
  // ==================================================
  companies: any[] = [];
  departments: any[] = [];
  // ==================================================
  // LOADING
  // ==================================================
  loading = false;
  loadingCompanies = false;
  loadingDepartments = false;
  loadingDesignation = false;
  // ==================================================
  // CONSTRUCTOR
  // ==================================================
  constructor(
    private fb: FormBuilder,
    private designationService: DesignationService,
    private companyService: CompanyService,
    private departmentService: DepartmentService,
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
      this.designationId = Number(id);
    }
    // ==================================================
    // PERMISSION CHECK
    // ==================================================
    if (
      !this.isEditMode &&
      !this.hasPermission(
        'CREATE_DESIGNATION'
      )
    ) {
      alert(
        'You are not authorized to create designations.'
      );
      this.router.navigate([
        '/designation'
      ]);
      return;
    }
    if (
      this.isEditMode &&
      !this.hasPermission(
        'UPDATE_DESIGNATION'
      )
    ) {
      alert(
        'You are not authorized to update designations.'
      );
      this.router.navigate([
        '/designation'
      ]);
      return;
    }
    // ==================================================
    // FORM
    // ==================================================
    this.designationForm =
      this.fb.group({
        DesignationCode: [
          '',
          Validators.required
        ],
        DesignationName: [
          '',
          Validators.required
        ],
        CompanyId: [
          null,
          Validators.required
        ],
        DepartmentId: [
          null,
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
      this.designationId
    ) {
      this.loadDesignation();
    }
  }
  // ==================================================
  // PERMISSION
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
    this.loadingCompanies = true;
    // ==================================================
    // USER CAN VIEW ALL COMPANIES
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
          1000
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
    // COMPANY-SCOPED USER
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
          this.designationForm
            .patchValue({
              CompanyId:
                company.CompanyId
            });
          // Company visible but disabled
          this.designationForm
            .get('CompanyId')
            ?.disable();
          this.loadingCompanies =
            false;
          // In Add mode load departments now
          if (
            !this.isEditMode
          ) {
            this.loadDepartments(
              company.CompanyId
            );
          }
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
  // COMPANY CHANGE
  // ==================================================
  companyChanged(): void {
    const companyId =
      this.designationForm
        .get('CompanyId')
        ?.value;
    // Reset department
    this.designationForm
      .patchValue({
        DepartmentId: null
      });
    this.departments = [];
    if (companyId) {
      this.loadDepartments(
        companyId
      );
    }
  }
  // ==================================================
  // LOAD DEPARTMENTS
  // ==================================================
  loadDepartments(
    companyId: number,
    selectedDepartmentId: number | null = null
  ): void {
    this.loadingDepartments =
      true;
    this.departmentService
      .getDepartments(
        '',
        companyId,
        'DepartmentName',
        'asc',
        1,
        1000
      )
      .subscribe({
        next: (res: any) => {
          this.departments =
            res.data || [];
          this.loadingDepartments =
            false;
          // Edit mode:
          // restore existing DepartmentId
          if (
            selectedDepartmentId
          ) {
            this.designationForm
              .patchValue({
                DepartmentId:
                  selectedDepartmentId
              });
          }
        },
        error: (err: any) => {
          console.error(
            'Error loading departments:',
            err
          );
          this.departments = [];
          this.loadingDepartments =
            false;
        }
      });
  }
  // ==================================================
  // LOAD DESIGNATION
  // ==================================================
  loadDesignation(): void {
    if (!this.designationId) {
      return;
    }
    this.loadingDesignation =
      true;
    this.designationService
      .getDesignationById(
        this.designationId
      )
      .subscribe({
        next: (response: any) => {
          console.log(
            'Designation Edit Response:',
            response
          );
          const designation =
            response?.data ||
            response;
          this.designationForm
            .patchValue({
              DesignationCode:
                designation.DesignationCode,
              DesignationName:
                designation.DesignationName,
              CompanyId:
                designation.CompanyId,
              Description:
                designation.Description || '',
              IsActive:
                designation.IsActive
            });
          // ==================================================
          // LOAD DEPARTMENTS OF EXISTING COMPANY
          // ==================================================
          if (
            designation.CompanyId
          ) {
            this.loadDepartments(
              designation.CompanyId,
              designation.DepartmentId
            );
          }
          // ==================================================
          // COMPANY-SCOPED USER
          // ==================================================
          if (
            !this.hasPermission(
              'VIEW_ALL_COMPANIES'
            )
          ) {
            this.designationForm
              .get('CompanyId')
              ?.disable();
          }
          this.loadingDesignation =
            false;
        },
        error: (err: any) => {
          console.error(
            'Error loading designation:',
            err
          );
          this.loadingDesignation =
            false;
          alert(
            err?.error?.detail ||
            'Unable to load designation.'
          );
          this.router.navigate([
            '/designation'
          ]);
        }
      });
  }
  // ==================================================
  // SAVE DESIGNATION
  // ==================================================
  saveDesignation(): void {
    const requiredPermission =
      this.isEditMode
        ? 'UPDATE_DESIGNATION'
        : 'CREATE_DESIGNATION';
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
      this.designationForm.invalid
    ) {
      this.designationForm
        .markAllAsTouched();
      return;
    }
    // ==================================================
    // GET RAW VALUE
    // Includes disabled CompanyId
    // ==================================================
    const data =
      this.designationForm
        .getRawValue();
    this.loading = true;
    // ==================================================
    // EDIT
    // ==================================================
    if (
      this.isEditMode &&
      this.designationId
    ) {
      this.updateDesignation(
        data
      );
    } else {
      this.createDesignation(
        data
      );
    }
  }
  // ==================================================
  // CREATE DESIGNATION
  // ==================================================
  createDesignation(
    data: any
  ): void {
    this.designationService
      .addDesignation(
        data
      )
      .subscribe({
        next: () => {
          this.loading =
            false;
          alert(
            'Designation Added Successfully'
          );
          this.router.navigate([
            '/designation'
          ]);
        },
        error: (err: any) => {
          console.error(
            'Error adding designation:',
            err
          );
          this.loading =
            false;
          alert(
            err?.error?.detail ||
            'Unable to add designation.'
          );
        }
      });
  }
  // ==================================================
  // UPDATE DESIGNATION
  // ==================================================
  updateDesignation(
    data: any
  ): void {
    if (!this.designationId) {
      return;
    }
    this.designationService
      .updateDesignation(
        this.designationId,
        data
      )
      .subscribe({
        next: () => {
          this.loading =
            false;
          alert(
            'Designation Updated Successfully'
          );
          this.router.navigate([
            '/designation'
          ]);
        },
        error: (err: any) => {
          console.error(
            'Error updating designation:',
            err
          );
          this.loading =
            false;
          alert(
            err?.error?.detail ||
            'Unable to update designation.'
          );
        }
      });
  }
  // ==================================================
  // CANCEL
  // ==================================================
  cancel(): void {
    this.router.navigate([
      '/designation'
    ]);
  }
}