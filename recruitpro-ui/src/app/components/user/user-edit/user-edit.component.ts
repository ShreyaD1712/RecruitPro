import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import {
    ActivatedRoute,
    Router
} from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';

import { UserService } from '../../../services/user.service';
import { CompanyService } from '../../../services/company.service';
import { DepartmentService } from '../../../services/department.service';
import { RoleService } from '../../../services/role.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-user-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatCardModule
    ],
    templateUrl: './user-edit.component.html',
})
export class UserEditComponent implements OnInit {

    userForm!: FormGroup;

    userId!: number;

    companies: any[] = [];
    departments: any[] = [];
    roles: any[] = [];

    loading = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private companyService: CompanyService,
        private departmentService: DepartmentService,
        private roleService: RoleService,
        public authService: AuthService
    ) { }

    ngOnInit(): void {

        // Permission Check
        if (!this.hasPermission('UPDATE_USER')) {

            alert('You are not authorized to access this page.');

            this.router.navigate(['/user']);

            return;
        }

        this.userId = Number(
            this.route.snapshot.paramMap.get('id')
        );

        if (!this.userId) {

            alert('Invalid User ID.');

            this.router.navigate(['/user']);

            return;
        }

        this.userForm = this.fb.group({

            FirstName: ['', Validators.required],

            LastName: ['', Validators.required],

            Email: [
                '',
                [
                    Validators.required,
                    Validators.email
                ]
            ],

            MobileNo: ['', Validators.required],

            CompanyId: [null, Validators.required],

            DepartmentId: [null, Validators.required],

            RoleId: [null, Validators.required],

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

    loadCompanies(): void {

        // Super Admin / users with permission to view all companies
        if (this.authService.hasPermission('VIEW_ALL_COMPANIES')) {

            this.companyService.getCompanies(
                '',
                'CompanyName',
                'asc',
                1,
                1000
            ).subscribe({

                next: (res: any) => {

                    this.companies = res.data || [];

                    this.loadUser();

                },

                error: (err) => {

                    console.log(err);

                    this.companies = [];

                    this.loadUser();

                }

            });

        }

        // Company user
        else {

            const companyId = this.authService.getCompanyId();

            if (!companyId) {

                alert('Company information not found.');

                this.router.navigate(['/user']);

                return;
            }

            // Get ONLY the logged-in user's company
            this.companyService.getCompany(companyId)
                .subscribe({

                    next: (company: any) => {

                        // Put their company in dropdown
                        this.companies = [company];

                        // Load user first
                        this.loadUser();

                    },

                    error: (err) => {

                        console.log(err);

                        alert('Unable to load your company.');

                        this.router.navigate(['/user']);

                    }

                });

        }
    }
    // ----------------------------
    // Load User
    // ----------------------------

    loadUser(): void {

        this.userService.getUserById(
            this.userId
        ).subscribe({

            next: (user: any) => {

                this.userForm.patchValue({

                    FirstName: user.FirstName,

                    LastName: user.LastName,

                    Email: user.Email,

                    MobileNo: user.MobileNo,

                    CompanyId: user.CompanyId,

                    DepartmentId: user.DepartmentId,

                    RoleId: user.RoleId,

                    IsActive: user.IsActive

                });

                const companyId =
                    this.userForm.get('CompanyId')?.value;

                if (companyId) {
                    if (!this.authService.hasPermission('VIEW_ALL_COMPANIES')) {

                        this.userForm.get('CompanyId')?.disable();

                    }

                    this.loadDepartments(companyId);

                    this.loadRoles(companyId);

                }

            },

            error: (err) => {

                console.log(err);

                alert(
                    err?.error?.detail ||
                    'User not found.'
                );

                this.router.navigate(['/user']);

            }

        });
    }

    // ----------------------------
    // Company Changed
    // ----------------------------

    companyChanged(): void {

        const companyId =
            this.userForm.get('CompanyId')?.value;

        this.userForm.patchValue({

            DepartmentId: null,

            RoleId: null

        });

        this.departments = [];

        this.roles = [];

        if (!companyId) {

            return;
        }

        this.loadDepartments(companyId);

        this.loadRoles(companyId);
    }

    // ----------------------------
    // Load Departments
    // ----------------------------

    loadDepartments(companyId: number): void {

        this.departmentService.getDepartments(
            '',
            companyId,
            'DepartmentName',
            'asc',
            1,
            1000
        ).subscribe({

            next: (res: any) => {

                this.departments = res.data || [];

            },

            error: (err) => {

                console.log(err);

                this.departments = [];
            }

        });
    }

    // ----------------------------
    // Load Roles
    // ----------------------------

    loadRoles(companyId?: number): void {

        this.roleService.getRoles(
            '',
            'RoleName',
            'asc',
            1,
            1000,
            companyId
        ).subscribe({

            next: (res: any) => {

                this.roles = res.data || [];

            },

            error: (err) => {

                console.log(err);

                this.roles = [];
            }

        });
    }

    // ----------------------------
    // Update User
    // ----------------------------

    updateUser(): void {

        if (!this.hasPermission('UPDATE_USER')) {

            alert('You do not have permission to update users.');

            return;
        }

        if (this.userForm.invalid) {

            this.userForm.markAllAsTouched();

            return;
        }

        this.loading = true;

        this.userService.updateUser(
            this.userId,
            this.userForm.getRawValue()
        ).subscribe({

            next: () => {

                this.loading = false;

                alert('User Updated Successfully');

                this.router.navigate(['/user']);

            },

            error: (err) => {

                this.loading = false;

                console.log(err);

                alert(
                    err?.error?.detail ||
                    'Failed to update user.'
                );

            }

        });
    }

    // ----------------------------
    // Cancel
    // ----------------------------

    cancel(): void {

        this.router.navigate(['/user']);
    }

}