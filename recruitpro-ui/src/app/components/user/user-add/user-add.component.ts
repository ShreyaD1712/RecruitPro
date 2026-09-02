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
    templateUrl: './user-add.component.html'
})
export class UserAddComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    userForm!: FormGroup;
    // ==================================================
    // MODE
    // ==================================================
    isEditMode = false;
    userId: number | null = null;
    // ==================================================
    // DATA
    // ==================================================
    companies: any[] = [];
    departments: any[] = [];
    roles: any[] = [];
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    loadingCompanies = false;
    loadingDepartments = false;
    loadingRoles = false;
    loadingUser = false;
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private companyService: CompanyService,
        private departmentService: DepartmentService,
        private roleService: RoleService,
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
            this.userId = Number(id);
        }
        // ==================================================
        // PERMISSION CHECK
        // ==================================================
        if (
            !this.isEditMode &&
            !this.hasPermission('CREATE_USER')
        ) {
            alert(
                'You are not authorized to create users.'
            );
            this.router.navigate([
                '/user'
            ]);
            return;
        }
        if (
            this.isEditMode &&
            !this.hasPermission('UPDATE_USER')
        ) {
            alert(
                'You are not authorized to update users.'
            );
            this.router.navigate([
                '/user'
            ]);
            return;
        }
        // ==================================================
        // FORM
        // ==================================================
        this.userForm =
            this.fb.group({
                FirstName: [
                    '',
                    Validators.required
                ],
                LastName: [
                    '',
                    Validators.required
                ],
                Email: [
                    '',
                    [
                        Validators.required,
                        Validators.email
                    ]
                ],
                Password: [
                    ''
                ],
                MobileNo: [
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
                RoleId: [
                    null,
                    Validators.required
                ],
                IsActive: [
                    true
                ]
            });
        // ==================================================
        // PASSWORD REQUIRED ONLY IN ADD MODE
        // ==================================================
        if (!this.isEditMode) {
            this.userForm
                .get('Password')
                ?.setValidators(
                    Validators.required
                );
            this.userForm
                .get('Password')
                ?.updateValueAndValidity();
        }
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
                            this.userId
                        ) {
                            this.loadUser();
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
            this.loadingCompanies = false;
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
                    this.userForm
                        .patchValue({
                            CompanyId:
                                company.CompanyId
                        });
                    // Company visible but disabled
                    this.userForm
                        .get('CompanyId')
                        ?.disable();
                    this.loadingCompanies =
                        false;
                    // ==================================================
                    // EDIT MODE
                    // ==================================================
                    if (
                        this.isEditMode &&
                        this.userId
                    ) {
                        this.loadUser();
                    }
                    // ==================================================
                    // ADD MODE
                    // ==================================================
                    else {
                        this.loadDepartments(
                            company.CompanyId
                        );
                        this.loadRoles(
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
    // LOAD USER
    // ==================================================
    loadUser(): void {
        if (!this.userId) {
            return;
        }
        this.loadingUser = true;
        this.userService
            .getUserById(
                this.userId
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'User Edit Response:',
                        response
                    );
                    const user =
                        response?.data ||
                        response;
                    this.userForm
                        .patchValue({
                            FirstName:
                                user.FirstName,
                            LastName:
                                user.LastName,
                            Email:
                                user.Email,
                            MobileNo:
                                user.MobileNo,
                            CompanyId:
                                user.CompanyId,
                            IsActive:
                                user.IsActive
                        });
                    // ==================================================
                    // LOAD DEPARTMENT + ROLE OPTIONS
                    // AND RESTORE SELECTED VALUES
                    // ==================================================
                    if (
                        user.CompanyId
                    ) {
                        this.loadDepartments(
                            user.CompanyId,
                            user.DepartmentId
                        );
                        this.loadRoles(
                            user.CompanyId,
                            user.RoleId
                        );
                    }
                    // Company-scoped user cannot change company
                    if (
                        !this.hasPermission(
                            'VIEW_ALL_COMPANIES'
                        )
                    ) {
                        this.userForm
                            .get('CompanyId')
                            ?.disable();
                    }
                    this.loadingUser =
                        false;
                },
                error: (err: any) => {
                    console.error(
                        'Error loading user:',
                        err
                    );
                    this.loadingUser =
                        false;
                    alert(
                        err?.error?.detail ||
                        'User not found.'
                    );
                    this.router.navigate([
                        '/user'
                    ]);
                }
            });
    }
    // ==================================================
    // COMPANY CHANGE
    // ==================================================
    companyChanged(): void {
        const companyId =
            this.userForm
                .get('CompanyId')
                ?.value;
        this.userForm
            .patchValue({
                DepartmentId: null,
                RoleId: null
            });
        this.departments = [];
        this.roles = [];
        if (!companyId) {
            return;
        }
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
        companyId: number,
        selectedDepartmentId: number | null = null
    ): void {
        this.loadingDepartments = true;
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
                next: (response: any) => {
                    this.departments =
                        response.data || [];
                    this.loadingDepartments =
                        false;
                    if (
                        selectedDepartmentId
                    ) {
                        this.userForm
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
    // LOAD ROLES
    // ==================================================
    loadRoles(
        companyId: number,
        selectedRoleId: number | null = null
    ): void {
        this.loadingRoles = true;
        this.roleService
            .getRoles(
                '',
                'RoleName',
                'asc',
                1,
                1000,
                companyId
            )
            .subscribe({
                next: (response: any) => {
                    this.roles =
                        response.data || [];
                    this.loadingRoles =
                        false;
                    if (
                        selectedRoleId
                    ) {
                        this.userForm
                            .patchValue({
                                RoleId:
                                    selectedRoleId
                            });
                    }
                },
                error: (err: any) => {
                    console.error(
                        'Error loading roles:',
                        err
                    );
                    this.roles = [];
                    this.loadingRoles =
                        false;
                }
            });
    }
    // ==================================================
    // SAVE USER
    // ==================================================
    saveUser(): void {
        const requiredPermission =
            this.isEditMode
                ? 'UPDATE_USER'
                : 'CREATE_USER';
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
            this.userForm.invalid
        ) {
            this.userForm
                .markAllAsTouched();
            return;
        }
        const data =
            this.userForm
                .getRawValue();
        // ==================================================
        // REMOVE PASSWORD IN EDIT MODE
        // ==================================================
        if (
            this.isEditMode
        ) {
            delete data.Password;
        }
        this.loading = true;
        // ==================================================
        // EDIT
        // ==================================================
        if (
            this.isEditMode &&
            this.userId
        ) {
            this.updateUser(
                data
            );
        }
        // ==================================================
        // ADD
        // ==================================================
        else {
            this.createUser(
                data
            );
        }
    }
    // ==================================================
    // CREATE USER
    // ==================================================
    createUser(
        data: any
    ): void {
        this.userService
            .addUser(
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'User Added Successfully'
                    );
                    this.router.navigate([
                        '/user'
                    ]);
                },
                error: (err: any) => {
                    console.error(
                        'Error adding user:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to add user'
                    );
                }
            });
    }
    // ==================================================
    // UPDATE USER
    // ==================================================
    updateUser(
        data: any
    ): void {
        if (!this.userId) {
            return;
        }
        this.userService
            .updateUser(
                this.userId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'User Updated Successfully'
                    );
                    this.router.navigate([
                        '/user'
                    ]);
                },
                error: (err: any) => {
                    console.error(
                        'Error updating user:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Failed to update user.'
                    );
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