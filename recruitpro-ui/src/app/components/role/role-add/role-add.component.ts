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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { RoleService } from '../../../services/role.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-role-add',
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
  templateUrl: './role-add.component.html'
})
export class RoleAddComponent implements OnInit {
  // ==================================================
  // FORM
  // ==================================================
  roleForm!: FormGroup;
  // ==================================================
  // MODE
  // ==================================================
  isEditMode = false;
  roleId: number | null = null;
  // ==================================================
  // DATA
  // ==================================================
  companies: any[] = [];
  // ==================================================
  // LOADING
  // ==================================================
  loading = false;
  loadingCompanies = false;
  loadingRole = false;
  // ==================================================
  // CONSTRUCTOR
  // ==================================================
  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
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
      this.roleId = Number(id);
    }
    // ==================================================
    // PERMISSION CHECK
    // ==================================================
    if (
      !this.isEditMode &&
      !this.hasPermission(
        'CREATE_ROLE'
      )
    ) {
      alert(
        'You are not authorized to create roles.'
      );
      this.router.navigate([
        '/role'
      ]);
      return;
    }
    if (
      this.isEditMode &&
      !this.hasPermission(
        'UPDATE_ROLE'
      )
    ) {
      alert(
        'You are not authorized to update roles.'
      );
      this.router.navigate([
        '/role'
      ]);
      return;
    }
    // ==================================================
    // FORM
    // ==================================================
    this.roleForm =
      this.fb.group({
        RoleName: [
          '',
          Validators.required
        ],
        CompanyId: [
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
          next: (response: any) => {
            this.companies =
              response.data || [];
            this.loadingCompanies =
              false;
            if (
              this.isEditMode &&
              this.roleId
            ) {
              this.loadRole();
            }
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
          this.roleForm
            .patchValue({
              CompanyId:
                company.CompanyId
            });
          // Company visible but disabled
          this.roleForm
            .get('CompanyId')
            ?.disable();
          this.loadingCompanies =
            false;
          if (
            this.isEditMode &&
            this.roleId
          ) {
            this.loadRole();
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
  // LOAD ROLE
  // ==================================================
  loadRole(): void {
    if (!this.roleId) {
      return;
    }
    this.loadingRole = true;
    this.roleService
      .getRoleById(
        this.roleId
      )
      .subscribe({
        next: (response: any) => {
          console.log(
            'Role Edit Response:',
            response
          );
          const role =
            response?.data ||
            response;
          this.roleForm
            .patchValue({
              RoleName:
                role.RoleName,
              CompanyId:
                role.CompanyId,
              Description:
                role.Description || '',
              IsActive:
                role.IsActive
            });
          // Company-scoped users cannot change company
          if (
            !this.hasPermission(
              'VIEW_ALL_COMPANIES'
            )
          ) {
            this.roleForm
              .get('CompanyId')
              ?.disable();
          }
          this.loadingRole =
            false;
        },
        error: (err: any) => {
          console.error(
            'Error loading role:',
            err
          );
          this.loadingRole =
            false;
          alert(
            err?.error?.detail ||
            'Failed to load Role'
          );
          this.router.navigate([
            '/role'
          ]);
        }
      });
  }
  // ==================================================
  // SAVE ROLE
  // ==================================================
  saveRole(): void {
    const requiredPermission =
      this.isEditMode
        ? 'UPDATE_ROLE'
        : 'CREATE_ROLE';
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
      this.roleForm.invalid
    ) {
      this.roleForm
        .markAllAsTouched();
      return;
    }
    // Includes disabled CompanyId
    const roleData =
      this.roleForm
        .getRawValue();
    this.loading = true;
    // ==================================================
    // EDIT
    // ==================================================
    if (
      this.isEditMode &&
      this.roleId
    ) {
      this.updateRole(
        roleData
      );
    }
    // ==================================================
    // ADD
    // ==================================================
    else {
      this.createRole(
        roleData
      );
    }
  }
  // ==================================================
  // CREATE ROLE
  // ==================================================
  createRole(
    roleData: any
  ): void {
    this.roleService
      .addRole(
        roleData
      )
      .subscribe({
        next: () => {
          this.loading = false;
          alert(
            'Role Added Successfully'
          );
          this.router.navigate([
            '/role'
          ]);
        },
        error: (err: any) => {
          console.error(
            'Error adding role:',
            err
          );
          this.loading = false;
          alert(
            err?.error?.detail ||
            'Failed to add Role'
          );
        }
      });
  }
  // ==================================================
  // UPDATE ROLE
  // ==================================================
  updateRole(
    roleData: any
  ): void {
    if (!this.roleId) {
      return;
    }
    this.roleService
      .updateRole(
        this.roleId,
        roleData
      )
      .subscribe({
        next: () => {
          this.loading = false;
          alert(
            'Role Updated Successfully'
          );
          this.router.navigate([
            '/role'
          ]);
        },
        error: (err: any) => {
          console.error(
            'Error updating role:',
            err
          );
          this.loading = false;
          alert(
            err?.error?.detail ||
            'Failed to update Role'
          );
        }
      });
  }
  // ==================================================
  // CANCEL
  // ==================================================
  cancel(): void {
    this.router.navigate([
      '/role'
    ]);
  }
}