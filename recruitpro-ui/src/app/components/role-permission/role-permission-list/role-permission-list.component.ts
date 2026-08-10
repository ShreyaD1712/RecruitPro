import {
    Component,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';
import {
    CommonModule
} from '@angular/common';
import {
    FormsModule
} from '@angular/forms';
import {
    Router
} from '@angular/router';
import {
    MatCardModule
} from '@angular/material/card';
import {
    MatFormFieldModule
} from '@angular/material/form-field';
import {
    MatSelectModule
} from '@angular/material/select';
import {
    MatInputModule
} from '@angular/material/input';
import {
    MatCheckboxModule
} from '@angular/material/checkbox';
import {
    MatButtonModule
} from '@angular/material/button';
import {
    MatIconModule
} from '@angular/material/icon';
import {
    MatTooltipModule
} from '@angular/material/tooltip';
import {
    CompanyService
} from '../../../services/company.service';
import {
    RoleService
} from '../../../services/role.service';
import {
    RolePermissionService
} from '../../../services/role-permission.service';
import {
    AuthService
} from '../../../services/auth.service';
@Component({
    selector: 'app-role-permission-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl:
        './role-permission-list.component.html',
    styleUrls:
        ['./role-permission-list.component.css']
})
export class RolePermissionListComponent
    implements OnInit {
    // ==================================================
    // DATA
    // ==================================================
    companies: any[] = [];
    roles: any[] = [];
    selectedCompanyId:
        number | null = null;
    selectedRoleId:
        number | null = null;
    permissions: string[] = [
        // -------------------------
        // Company
        // -------------------------
        'VIEW_ALL_COMPANIES',
        'CREATE_COMPANY',
        'UPDATE_COMPANY',
        'DELETE_COMPANY',
        // -------------------------
        // Department
        // -------------------------
        'VIEW_DEPARTMENT',
        'CREATE_DEPARTMENT',
        'UPDATE_DEPARTMENT',
        'DELETE_DEPARTMENT',
        // -------------------------
        // Designation
        // -------------------------
        'VIEW_DESIGNATION',
        'CREATE_DESIGNATION',
        'UPDATE_DESIGNATION',
        'DELETE_DESIGNATION',
        // -------------------------
        // Role
        // -------------------------
        'VIEW_ROLE',
        'CREATE_ROLE',
        'UPDATE_ROLE',
        'DELETE_ROLE',
        // -------------------------
        // User
        // -------------------------
        'VIEW_USER',
        'CREATE_USER',
        'UPDATE_USER',
        'DELETE_USER',
        // -------------------------
        // Role Permissions
        // -------------------------
        'VIEW_ROLE_PERMISSION',
        'UPDATE_ROLE_PERMISSION'
    ];
    selectedPermissions:
        string[] = [];
    // ==================================================
    // LOADING
    // ==================================================
    loadingCompanies = false;
    loadingRoles = false;
    loadingPermissions = false;
    saving = false;
    constructor(
        private companyService:
            CompanyService,
        private roleService:
            RoleService,
        private rolePermissionService:
            RolePermissionService,
        public authService:
            AuthService,
        private router:
            Router,
        private cdr:
            ChangeDetectorRef
    ) { }
    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        /*
         * Permission page itself should be
         * accessible only to users who have
         * permission to manage role permissions.
         */
        if (
            !this.hasPermission(
                'UPDATE_ROLE_PERMISSION'
            )
        ) {
            alert(
                'You are not authorized to access this page.'
            );
            this.router.navigate(['/dashboard']);
            return;
        }
        this.loadCompanies();
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
        this.loadingCompanies = true;
        /*
         * Super Admin / users with
         * VIEW_ALL_COMPANIES
         *
         * can select any company.
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
                    this.loadingCompanies = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.log(
                        'Error loading companies:',
                        err
                    );
                    this.companies = [];
                    this.loadingCompanies = false;
                    this.cdr.detectChanges();
                }
            });
            return;
        }
        /*
         * Company user
         *
         * Load only their company.
         */
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            this.companies = [];
            this.loadingCompanies = false;
            return;
        }
        this.companyService
            .getCompany(companyId)
            .subscribe({
                next: (company: any) => {
                    this.companies = [
                        company
                    ];
                    this.selectedCompanyId =
                        company.CompanyId;
                    this.loadingCompanies = false;
                    /*
                     * Automatically load roles
                     * for their company.
                     */
                    if (this.selectedCompanyId !== null) {
                        this.loadRoles(this.selectedCompanyId);
                    }
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.log(
                        'Error loading company:',
                        err
                    );
                    this.companies = [];
                    this.loadingCompanies = false;
                }
            });
    }
    // ==================================================
    // COMPANY CHANGE
    // ==================================================
    companyChanged(): void {
        this.selectedRoleId = null;
        this.roles = [];
        this.selectedPermissions = [];
        if (
            this.selectedCompanyId === null
        ) {
            return;
        }
        this.loadRoles(
            this.selectedCompanyId
        );
    }
    // ==================================================
    // LOAD ROLES
    // ==================================================
    loadRoles(
        companyId: number
    ): void {
        this.loadingRoles = true;
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
                this.loadingRoles = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.log(
                    'Error loading roles:',
                    err
                );
                this.roles = [];
                this.loadingRoles = false;
                this.cdr.detectChanges();
            }
        });
    }
    // ==================================================
    // ROLE CHANGE
    // ==================================================
    roleChanged(): void {
        this.selectedPermissions = [];
        if (
            !this.selectedRoleId
        ) {
            return;
        }
        this.loadPermissions(
            this.selectedRoleId
        );
    }
    // ==================================================
    // LOAD ROLE PERMISSIONS
    // ==================================================
    loadPermissions(
        roleId: number
    ): void {
        this.loadingPermissions = true;
        this.rolePermissionService
            .getPermissions(roleId)
            .subscribe({
                next: (response: any) => {
                    this.selectedPermissions =
                        response.Permissions || [];
                    this.loadingPermissions = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.log(
                        'Error loading permissions:',
                        err
                    );
                    this.selectedPermissions = [];
                    this.loadingPermissions = false;
                    this.cdr.detectChanges();
                }
            });
    }
    // ==================================================
    // CHECK PERMISSION
    // ==================================================
    isPermissionSelected(
        permission: string
    ): boolean {
        return this.selectedPermissions
            .includes(permission);
    }
    // ==================================================
    // TOGGLE PERMISSION
    // ==================================================
    togglePermission(
        permission: string,
        checked: boolean
    ): void {
        if (checked) {
            if (
                !this.selectedPermissions
                    .includes(permission)
            ) {
                this.selectedPermissions.push(
                    permission
                );
            }
        }
        else {
            this.selectedPermissions =
                this.selectedPermissions.filter(
                    p => p !== permission
                );
        }
    }
    // ==================================================
    // SELECT ALL
    // ==================================================
    selectAll(): void {
        this.selectedPermissions = [
            ...this.permissions
        ];
    }
    // ==================================================
    // CLEAR ALL
    // ==================================================
    clearAll(): void {
        this.selectedPermissions = [];
    }
    // ==================================================
    // SAVE
    // ==================================================
    savePermissions(): void {
        if (!this.selectedRoleId) {
            alert(
                'Please select a role.'
            );
            return;
        }
        if (
            !this.hasPermission(
                'UPDATE_ROLE_PERMISSION'
            )
        ) {
            alert(
                'You do not have permission to update role permissions.'
            );
            return;
        }
        this.saving = true;
        this.rolePermissionService
            .savePermissions(
                this.selectedRoleId,
                this.selectedPermissions
            )
            .subscribe({
                next: () => {
                    this.saving = false;
                    alert(
                        'Permissions saved successfully.'
                    );
                },
                error: (err) => {
                    this.saving = false;
                    console.log(
                        'Error saving permissions:',
                        err
                    );
                    alert(
                        err?.error?.detail ||
                        'Failed to save permissions.'
                    );
                }
            });
    }
    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate([
            '/dashboard'
        ]);
    }
}