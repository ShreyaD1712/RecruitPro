import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
    selector: 'app-user-add',
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
    templateUrl: './user-add.component.html',
    styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {

    userForm!: FormGroup;

    companies: any[] = [];
    departments: any[] = [];
    roles: any[] = [];

    loggedInRoleId = 0;
    loggedInCompanyId = 0;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private companyService: CompanyService,
        private departmentService: DepartmentService,
        private roleService: RoleService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {

        this.loggedInRoleId = this.authService.getRoleId();
        this.loggedInCompanyId = this.authService.getCompanyId();

        this.userForm = this.fb.group({

            FirstName: ['', Validators.required],

            LastName: ['', Validators.required],

            Email: ['', [Validators.required, Validators.email]],

            Password: ['', Validators.required],

            MobileNo: [''],

            CompanyId: [null, Validators.required],

            DepartmentId: [null, Validators.required],

            RoleId: [null, Validators.required],

            IsActive: [true]

        });

        this.loadCompanies();

        this.loadRoles();

    }

    loadCompanies() {

        if (this.loggedInRoleId == 1) {

            this.companyService.getCompanies(
                '',
                'CompanyName',
                'asc',
                1,
                1000
            ).subscribe({

                next: (res: any) => {

                    this.companies = res.data;

                }

            });

        }

        else {

            this.companyService
                .getCompany(this.loggedInCompanyId)
                .subscribe({

                    next: (company: any) => {

                        this.companies = [company];

                        this.userForm.patchValue({

                            CompanyId: company.CompanyId

                        });

                        this.loadDepartments();

                    }

                });

        }

    }

    companyChanged() {

        this.userForm.patchValue({

            DepartmentId: null

        });

        this.loadDepartments();

    }

    loadDepartments() {

        const companyId = this.userForm.value.CompanyId;

        if (!companyId) return;

        this.departmentService.getDepartments(
            '',
            companyId,
            'DepartmentName',
            'asc',
            1,
            1000
        ).subscribe({

            next: (res: any) => {

                this.departments = res.data;

            }

        });

    }

    loadRoles() {

        this.roleService.getRoles(
            '',
            'RoleName',
            'asc',
            1,
            1000
        ).subscribe({

            next: (res: any) => {

                this.roles = res.data;

            }

        });

    }

    saveUser() {

        if (this.userForm.invalid) {

            this.userForm.markAllAsTouched();

            return;

        }

        this.userService.addUser(
            this.userForm.value
        ).subscribe({

            next: () => {

                alert('User Added Successfully');

                this.router.navigate(['/user']);

            },

            error: (err) => {

                console.log(err);

            }

        });

    }

    cancel() {

        this.router.navigate(['/user']);

    }

}