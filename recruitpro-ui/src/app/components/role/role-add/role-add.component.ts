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
  templateUrl: './role-add.component.html',
  styleUrls: ['./role-add.component.css']
})
export class RoleAddComponent implements OnInit {

  roleForm!: FormGroup;

  companies: any[] = [];

  loggedInRoleId = 0;
  loggedInCompanyId = 0;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private companyService: CompanyService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.loggedInRoleId = this.authService.getRoleId();
    this.loggedInCompanyId = this.authService.getCompanyId();

    this.roleForm = this.fb.group({

      RoleName: ['', Validators.required],

      CompanyId: [null, Validators.required],

      Description: [''],

      IsActive: [true]

    });

    this.loadCompanies();
  }
  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }
  loadCompanies(): void {

    // Super Admin
    if (this.loggedInRoleId === 1) {

      this.companyService.getCompanies(
        '',
        'CompanyName',
        'asc',
        1,
        1000
      ).subscribe({

        next: (response: any) => {

          this.companies = response.data || [];

        },

        error: (err) => {

          console.log(err);

        }

      });

    }

    // Company Admin / other company-based users
    else {

      this.companyService.getCompany(
        this.loggedInCompanyId
      ).subscribe({

        next: (company: any) => {

          this.companies = [company];

          this.roleForm.patchValue({
            CompanyId: company.CompanyId
          });

          this.roleForm.get('CompanyId')?.disable();

        },

        error: (err) => {

          console.log(err);

        }

      });

    }
  }

  saveRole(): void {

    if (this.roleForm.invalid) {

      this.roleForm.markAllAsTouched();

      return;

    }

    this.loading = true;

    /*
     * CompanyId is disabled for non-Super Admin.
     * getRawValue() includes disabled controls.
     */
    const roleData = this.roleForm.getRawValue();

    this.roleService.addRole(roleData)
      .subscribe({

        next: () => {

          this.loading = false;

          alert('Role Added Successfully');

          this.router.navigate(['/role']);

        },

        error: (err) => {

          console.log(err);

          this.loading = false;

          alert(
            err?.error?.detail ||
            'Failed to add Role'
          );

        }

      });
  }

  cancel(): void {

    this.router.navigate(['/role']);

  }
}