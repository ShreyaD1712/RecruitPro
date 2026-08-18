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
import { UserService } from '../../../services/user.service';
import { CompanyService } from '../../../services/company.service';
import { DepartmentService } from '../../../services/department.service';
import { RoleService } from '../../../services/role.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-user-add',
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
    templateUrl: './user-add.component.html',
    
})
export class UserAddComponent implements OnInit {
    userForm!: FormGroup;
    companies: any[] = [];
    departments: any[] = [];
    roles: any[] = [];
    loading = false;
    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private companyService: CompanyService,
        private departmentService: DepartmentService,
        private roleService: RoleService,
        public authService: AuthService,
        private router: Router
    ) { }
    ngOnInit(): void {
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
            Password: ['', Validators.required],
            MobileNo: ['', Validators.required],
            CompanyId: [
                null,
                Validators.required
            ],
            DepartmentId: [
                null,
                Validators.required
            ],
            RoleId: [
                null,
                Validators.required
            ],
            IsActive: [true]
        });
        this.loadCompanies();
    }
    // ==================================================
    // LOAD COMPANIES
    // ==================================================
    loadCompanies(): void {
        /*
         * User can view all companies
         */
        if (
            this.authService.hasPermission(
                'VIEW_ALL_COMPANIES'
            )
        ) {
            this.companyService.getCompanies(
                '',
                'CompanyName',
                'asc',
                1,
                1000
            ).subscribe({
                next: (response: any) => {
                    this.companies =
                        response.data || [];
                    /*
                     * Do not select a company automatically
                     * for users who can view all companies.
                     */
                    this.userForm.patchValue({
                        CompanyId: null
                    });
                    this.departments = [];
                    this.roles = [];
                },
                error: (err) => {
                    console.log(
                        'Error loading companies:',
                        err
                    );
                }
            });
        }
        /*
         * User can only view their company
         */
        else {
            const companyId =
                this.authService.getCompanyId();
            this.companyService
                .getCompany(companyId)
                .subscribe({
                    next: (company: any) => {
                        /*
                         * Show the actual company
                         * in the dropdown.
                         */
                        this.companies = [
                            company
                        ];
                        /*
                         * Automatically select
                         * their company.
                         */
                        this.userForm.patchValue({
                            CompanyId:
                                company.CompanyId
                        });
                        /*
                         * Disable company selection.
                         */
                        this.userForm
                            .get('CompanyId')
                            ?.disable();
                        /*
                         * Automatically load
                         * company departments and roles.
                         */
                        this.loadDepartments(
                            company.CompanyId
                        );
                        this.loadRoles(
                            company.CompanyId
                        );
                    },
                    error: (err) => {
                        console.log(
                            'Error loading company:',
                            err
                        );
                    }
                });
        }
    }
    // ==================================================
    // COMPANY CHANGE
    // ==================================================
    companyChanged(): void {
        const companyId =
            this.userForm.get('CompanyId')?.value;
        if (!companyId) {
            this.departments = [];
            this.roles = [];
            this.userForm.patchValue({
                DepartmentId: null,
                RoleId: null
            });
            return;
        }
        /*
         * When company changes,
         * reload departments and roles.
         */
        this.loadDepartments(
            companyId
        );
        this.loadRoles(
            companyId
        );
    }
    // ==================================================
    // LOAD DEPARTMENTS
    // ==================================================
    loadDepartments(
        companyId: number
    ): void {
        this.departmentService.getDepartments(
            '',
            companyId,
            'DepartmentName',
            'asc',
            1,
            1000,
        ).subscribe({
            next: (response: any) => {
                this.departments =
                    response.data || [];
                /*
                 * Reset department whenever
                 * company changes.
                 */
                this.userForm.patchValue({
                    DepartmentId: null
                });
            },
            error: (err) => {
                console.log(
                    'Error loading departments:',
                    err
                );
                this.departments = [];
            }
        });
    }
    // ==================================================
    // LOAD ROLES
    // ==================================================
    loadRoles(
        companyId: number
    ): void {
        this.roleService.getRoles(
            '',
            'RoleName',
            'asc',
            1,
            1000,
            companyId
        ).subscribe({
            next: (response: any) => {
                this.roles =
                    response.data || [];
                /*
                 * Reset role whenever
                 * company changes.
                 */
                this.userForm.patchValue({
                    RoleId: null
                });
            },
            error: (err) => {
                console.log(
                    'Error loading roles:',
                    err
                );
                this.roles = [];
            }
        });
    }
    // ==================================================
    // SAVE USER
    // ==================================================
    saveUser(): void {
        if (
            this.userForm.invalid
        ) {
            this.userForm.markAllAsTouched();
            return;
        }
        this.loading = true;
        /*
         * getRawValue() is important because
         * CompanyId is disabled for restricted users.
         */
        const data =
            this.userForm.getRawValue();
        this.userService
            .addUser(data)
            .subscribe({
                next: () => {
                    alert(
                        'User Added Successfully'
                    );
                    this.router.navigate([
                        '/user'
                    ]);
                },
                error: (err) => {
                    console.log(err);
                    alert(
                        err.error?.detail ||
                        'Unable to add user'
                    );
                    this.loading = false;
                }
            });
    }
    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate([
            '/user'
        ]);
    }
}