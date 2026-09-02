import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CompanyService } from '../../../services/company.service';
import { RoleService } from '../../../services/role.service';
import { RolePermissionService } from '../../../services/role-permission.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-role-permission-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './role-permission-list.component.html',
    styleUrls: ['./role-permission-list.component.css']
})
export class RolePermissionListComponent implements OnInit {
    // ==================================================
    // COMPANY / ROLE
    // ==================================================
    companies: any[] = [];
    roles: any[] = [];
    selectedCompanyId: number | null = null;
    selectedRoleId: number | null = null;
    selectedRole: any = null;

    // ==================================================
    // MODULES
    // ==================================================
    permissionModules = [
        { key: 'COMPANY', label: 'Company', icon: 'business' },
        { key: 'DEPARTMENT', label: 'Department', icon: 'account_tree' },
        { key: 'DESIGNATION', label: 'Designation', icon: 'badge' },
        { key: 'ROLE', label: 'Role', icon: 'admin_panel_settings' },
        { key: 'USER', label: 'User', icon: 'person' },
        { key: 'ROLE_PERMISSION', label: 'Role Permission', icon: 'security' },
        { key: 'SKILL', label: 'Skill', icon: 'psychology' },
        { key: 'JOB_CATEGORY', label: 'Job Category', icon: 'category' },
        { key: 'EMPLOYMENT_TYPE', label: 'Employment Type', icon: 'work_outline' },
        { key: 'EXPERIENCE_LEVEL', label: 'Experience Level', icon: 'workspace_premium' },
        { key: 'INTERVIEW_ROUND', label: 'Interview Round', icon: 'format_list_numbered' },
        { key: 'JOB_OPENING', label: 'Job Opening', icon: 'work' },
        { key: 'APPLICANT', label: 'Applicant', icon: 'person_search' },
        { key: 'APPLICATION', label: 'Application', icon: 'description' },
        { key: 'REFERRAL', label: 'Referral', icon: 'people_alt' },
        { key: 'INTERVIEW', label: 'Interview', icon: 'record_voice_over' },
        { key: 'INTERVIEW_FEEDBACK', label: 'Interview Feedback', icon: 'rate_review' },
        { key: 'OFFER', label: 'Offer', icon: 'request_quote' }
    ];

    // ==================================================
    // PERMISSIONS
    // ==================================================
    selectedModule: any = null;
    currentModulePermissions: any[] = [];
    selectedPermissions: string[] = [];

    // ==================================================
    // LOADING
    // ==================================================
    loadingCompanies = false;
    loadingRoles = false;
    loadingPermissions = false;
    loadingModulePermissions = false;
    saving = false;

    constructor(
        private companyService: CompanyService,
        private roleService: RoleService,
        private rolePermissionService: RolePermissionService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        if (!this.hasPermission('UPDATE_ROLE_PERMISSION')) {
            alert('You are not authorized to access this page.');
            this.router.navigate(['/dashboard']);
            return;
        }

        this.loadCompanies();
    }

    // ==================================================
    // PERMISSION CHECK
    // ==================================================
    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    // ==================================================
    // LOAD COMPANIES
    // ==================================================
    loadCompanies(): void {
        this.loadingCompanies = true;

        if (this.hasPermission('VIEW_ALL_COMPANIES')) {
            this.companyService.getCompanies('', 'CompanyName', 'asc', 1, 1000).subscribe({
                next: (response: any) => {
                    this.companies = response.data || [];
                    this.loadingCompanies = false;
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error('Error loading companies:', err);
                    this.companies = [];
                    this.loadingCompanies = false;
                    this.cdr.detectChanges();
                }
            });
            return;
        }

        const companyId = this.authService.getCompanyId();

        if (!companyId) {
            this.companies = [];
            this.loadingCompanies = false;
            return;
        }

        this.companyService.getCompany(companyId).subscribe({
            next: (company: any) => {
                this.companies = [company];
                this.selectedCompanyId = company.CompanyId;
                this.loadingCompanies = false;
                this.loadRoles(company.CompanyId);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading company:', err);
                this.companies = [];
                this.loadingCompanies = false;
                this.cdr.detectChanges();
            }
        });
    }

    // ==================================================
    // COMPANY CHANGE
    // ==================================================
    companyChanged(): void {
        this.selectedRoleId = null;
        this.selectedRole = null;
        this.roles = [];
        this.selectedPermissions = [];
        this.currentModulePermissions = [];
        this.selectedModule = null;

        if (this.selectedCompanyId === null) return;

        this.loadRoles(this.selectedCompanyId);
    }

    // ==================================================
    // LOAD ROLES
    // ==================================================
    loadRoles(companyId: number): void {
        this.loadingRoles = true;

        this.roleService.getRoles('', 'RoleName', 'asc', 1, 1000, companyId).subscribe({
            next: (response: any) => {
                this.roles = response.data || [];
                this.loadingRoles = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading roles:', err);
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
        this.currentModulePermissions = [];
        this.selectedModule = null;

        this.selectedRole = this.roles.find(
            role => Number(role.RoleId) === Number(this.selectedRoleId)
        ) || null;

        if (!this.selectedRoleId) return;

        this.loadRolePermissions(this.selectedRoleId);
    }

    // ==================================================
    // VISIBLE MODULES
    // ==================================================
    getVisibleModules(): any[] {
        if (this.selectedRole?.RoleName === 'Super Admin') {
            return this.permissionModules;
        }

        return this.permissionModules.filter(
            module => module.key !== 'COMPANY'
        );
    }

    // ==================================================
    // LOAD ROLE PERMISSIONS
    // ==================================================
    loadRolePermissions(roleId: number): void {
        this.loadingPermissions = true;

        this.rolePermissionService.getPermissions(roleId).subscribe({
            next: (response: any) => {
                this.selectedPermissions = response.Permissions || [];
                this.loadingPermissions = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading role permissions:', err);
                this.selectedPermissions = [];
                this.loadingPermissions = false;
                this.cdr.detectChanges();
            }
        });
    }

    // ==================================================
    // SELECT MODULE
    // ==================================================
    selectModule(module: any): void {
        if (!this.selectedRoleId) return;

        if (module.key === 'COMPANY' && this.selectedRole?.RoleName !== 'Super Admin') {
            return;
        }

        this.selectedModule = module;
        this.loadModulePermissions(module.key);
    }

    // ==================================================
    // LOAD MODULE PERMISSIONS
    // ==================================================
    loadModulePermissions(moduleKey: string): void {
        if (!this.selectedRoleId) return;

        if (moduleKey === 'COMPANY' && this.selectedRole?.RoleName !== 'Super Admin') {
            this.currentModulePermissions = [];
            return;
        }

        this.loadingModulePermissions = true;
        this.currentModulePermissions = [];

        this.rolePermissionService
            .getModulePermissions(this.selectedRoleId, moduleKey)
            .subscribe({
                next: (response: any) => {
                    this.currentModulePermissions = response.permissions || [];
                    this.loadingModulePermissions = false;
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.error('Error loading module permissions:', err);
                    this.currentModulePermissions = [];
                    this.loadingModulePermissions = false;
                    this.cdr.detectChanges();
                }
            });
    }

    // ==================================================
    // TOGGLE PERMISSION
    // ==================================================
    togglePermission(permission: any, checked: boolean): void {
        permission.Assigned = checked;
        const permissionName = permission.PermissionName;

        if (checked) {
            if (!this.selectedPermissions.includes(permissionName)) {
                this.selectedPermissions = [...this.selectedPermissions, permissionName];
            }
        } else {
            this.selectedPermissions = this.selectedPermissions.filter(
                p => p !== permissionName
            );
        }
    }

    // ==================================================
    // SELECT ALL CURRENT MODULE
    // ==================================================
    selectAll(): void {
        this.currentModulePermissions = this.currentModulePermissions.map(
            permission => ({ ...permission, Assigned: true })
        );

        const permissionsToAdd = this.currentModulePermissions
            .map(permission => permission.PermissionName)
            .filter(permission => !this.selectedPermissions.includes(permission));

        this.selectedPermissions = [
            ...this.selectedPermissions,
            ...permissionsToAdd
        ];
    }

    // ==================================================
    // CLEAR CURRENT MODULE
    // ==================================================
    clearAll(): void {
        const currentNames = this.currentModulePermissions.map(
            permission => permission.PermissionName
        );

        this.currentModulePermissions = this.currentModulePermissions.map(
            permission => ({ ...permission, Assigned: false })
        );

        this.selectedPermissions = this.selectedPermissions.filter(
            permission => !currentNames.includes(permission)
        );
    }

    // ==================================================
    // FRIENDLY LABEL
    // ==================================================
    getPermissionLabel(permission: string): string {
        if (permission === 'VIEW_ALL_COMPANIES') return 'View All Companies';
        if (permission.startsWith('VIEW_')) return 'View';
        if (permission.startsWith('CREATE_')) return 'Create';
        if (permission.startsWith('UPDATE_')) return 'Update';
        if (permission.startsWith('DELETE_')) return 'Delete';
        return permission.replace(/_/g, ' ');
    }

    // ==================================================
    // MODULE SELECTED COUNT
    // ==================================================
    getModuleSelectedCount(module: any): number {
        if (module.key === 'COMPANY') {
            return this.selectedPermissions.filter(permission =>
                permission === 'VIEW_ALL_COMPANIES' ||
                permission === 'CREATE_COMPANY' ||
                permission === 'UPDATE_COMPANY' ||
                permission === 'DELETE_COMPANY'
            ).length;
        }

        return this.selectedPermissions.filter(
            permission => permission.endsWith(`_${module.key}`)
        ).length;
    }

    // ==================================================
    // SAVE PERMISSIONS
    // ==================================================
    savePermissions(): void {
        if (!this.selectedRoleId) {
            alert('Please select a role.');
            return;
        }

        if (!this.hasPermission('UPDATE_ROLE_PERMISSION')) {
            alert('You do not have permission to update role permissions.');
            return;
        }

        // Extra frontend protection
        if (this.selectedRole?.RoleName !== 'Super Admin') {
            const companyPermissions = [
                'VIEW_ALL_COMPANIES',
                'CREATE_COMPANY',
                'UPDATE_COMPANY',
                'DELETE_COMPANY'
            ];

            this.selectedPermissions = this.selectedPermissions.filter(
                permission => !companyPermissions.includes(permission)
            );
        }

        this.saving = true;

        this.rolePermissionService
            .savePermissions(this.selectedRoleId, this.selectedPermissions)
            .subscribe({
                next: () => {
                    this.saving = false;
                    alert('Permissions saved successfully.');
                    this.loadRolePermissions(this.selectedRoleId!);

                    if (this.selectedModule) {
                        this.loadModulePermissions(this.selectedModule.key);
                    }
                },
                error: (err: any) => {
                    console.error('Error saving permissions:', err);
                    this.saving = false;
                    alert(err?.error?.detail || 'Failed to save permissions.');
                }
            });
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/role-permission']);
    }
}