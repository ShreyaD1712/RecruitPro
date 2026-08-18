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
  selector: 'app-role-edit',
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
  templateUrl: './role-edit.component.html',
})
export class RoleEditComponent implements OnInit {

  roleForm!: FormGroup;

  roleId!: number;

  companies: any[] = [];

  loggedInRoleId = 0;
  loggedInCompanyId = 0;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private companyService: CompanyService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.roleId = Number(
      this.route.snapshot.paramMap.get('id')
    );

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

          this.loadRole();

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

          this.loadRole();

        },

        error: (err) => {

          console.log(err);

        }

      });

    }
  }

  loadRole(): void {

    this.roleService.getRoleById(
      this.roleId
    ).subscribe({

      next: (response: any) => {

        this.roleForm.patchValue({

          RoleName: response.RoleName,

          CompanyId: response.CompanyId,

          Description: response.Description,

          IsActive: response.IsActive

        });

        /*
         * Company Admin cannot change company.
         * Super Admin can change company.
         */
        if (this.loggedInRoleId !== 1) {

          this.roleForm.get('CompanyId')?.disable();

        }

      },

      error: (err) => {

        console.log(err);

        alert(
          err?.error?.detail ||
          'Failed to load Role'
        );

      }

    });
  }

  companyChanged(): void {

    /*
     * Currently Role does not have Department dependency,
     * so no additional data needs to be loaded here.
     */

  }

  updateRole(): void {

    if (this.roleForm.invalid) {

      this.roleForm.markAllAsTouched();

      return;

    }

    this.loading = true;

    /*
     * getRawValue() includes CompanyId even when
     * CompanyId is disabled for Company Admin.
     */
    const roleData = this.roleForm.getRawValue();

    this.roleService.updateRole(
      this.roleId,
      roleData
    ).subscribe({

      next: () => {

        this.loading = false;

        alert('Role Updated Successfully');

        this.router.navigate(['/role']);

      },

      error: (err) => {

        console.log(err);

        this.loading = false;

        alert(
          err?.error?.detail ||
          'Failed to update Role'
        );

      }

    });
  }

  cancel(): void {

    this.router.navigate(['/role']);

  }
}