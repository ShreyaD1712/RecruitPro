import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

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
    styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

    userForm!: FormGroup;

    userId!: number;

    companies: any[] = [];
    departments: any[] = [];
    roles: any[] = [];

    loggedInRoleId = 0;
    loggedInCompanyId = 0;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private companyService: CompanyService,
        private departmentService: DepartmentService,
        private roleService: RoleService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {

        this.loggedInRoleId = this.authService.getRoleId();
        this.loggedInCompanyId = this.authService.getCompanyId();

        this.userId = Number(
            this.route.snapshot.paramMap.get('id')
        );

        this.userForm = this.fb.group({

            FirstName: ['', Validators.required],

            LastName: ['', Validators.required],

            Email: ['', [Validators.required, Validators.email]],

            MobileNo: [''],

            CompanyId: [null, Validators.required],

            DepartmentId: [null, Validators.required],

            RoleId: [null, Validators.required],

            IsActive: [true]

        });

        this.loadRoles();

        this.loadCompanies();

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

                    this.loadUser();

                }

            });

        }

        else {

            this.companyService.getCompany(
                this.loggedInCompanyId
            ).subscribe({

                next: (company: any) => {

                    this.companies = [company];

                    this.loadUser();

                }

            });

        }

    }

    loadUser() {

        this.userService.getUserById(
            this.userId
        ).subscribe({

            next: (user: any) => {

                this.userForm.patchValue(user);

                this.loadDepartments();

            }

        });

    }

    loadDepartments() {

        this.departmentService.getDepartments(
            '',
            this.userForm.value.CompanyId,
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

    companyChanged() {

        this.userForm.patchValue({

            DepartmentId: null

        });

        this.loadDepartments();

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

    updateUser() {

        if (this.userForm.invalid) {

            this.userForm.markAllAsTouched();

            return;

        }

        this.userService.updateUser(
            this.userId,
            this.userForm.value
        ).subscribe({

            next: () => {

                alert('User Updated Successfully');

                this.router.navigate(['/user']);

            }

        });

    }

    cancel() {

        this.router.navigate(['/user']);

    }

}