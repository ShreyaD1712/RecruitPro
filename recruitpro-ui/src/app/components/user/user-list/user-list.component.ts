import {
    Component,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserService } from '../../../services/user.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-user-list',
    standalone: true,

    imports: [
        CommonModule,
        FormsModule,

        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatSelectModule,
        MatTooltipModule
    ],

    templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {

    // ==================================================
    // DATA
    // ==================================================

    users: any[] = [];

    companies: any[] = [];

    search = '';

    selectedCompanyId: number | null = null;

    // ==================================================
    // SORTING
    // ==================================================

    sortBy = 'FirstName';

    order = 'asc';

    // ==================================================
    // PAGINATION
    // ==================================================

    page = 1;

    pageSize = 10;

    totalRecords = 0;

    Math = Math;

    // ==================================================
    // LOADING
    // ==================================================

    loading = false;

    // ==================================================
    // TABLE COLUMNS
    // ==================================================

    displayedColumns = [
        'FirstName',
        'LastName',
        'Email',
        'CompanyName',
        'DepartmentName',
        'RoleName',
        'Status',
        'Actions'
    ];

    constructor(
        private userService: UserService,
        private companyService: CompanyService,

        // public because HTML uses authService.hasPermission()
        public authService: AuthService,

        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    // ==================================================
    // INIT
    // ==================================================

    ngOnInit(): void {

        this.loadCompanies();

    }

    // ==================================================
    // LOAD COMPANIES
    // ==================================================

    loadCompanies(): void {

        /*
         * Company visibility is controlled ONLY by
         * VIEW_ALL_COMPANIES permission.
         *
         * VIEW_ALL_COMPANIES
         * ------------------
         * Show all companies
         * Allow company selection
         *
         * Without VIEW_ALL_COMPANIES
         * --------------------------
         * Show only logged-in user's company
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

                    this.companies = response.data || [];

                    // Initially show all users
                    this.selectedCompanyId = null;

                    this.loadUsers();

                },

                error: (err) => {

                    console.log(
                        'Error loading companies:',
                        err
                    );

                    this.companies = [];

                    this.selectedCompanyId = null;

                    this.loadUsers();

                }

            });

        }

        else {

            /*
             * User can see only their own company.
             *
             * getCompanyId() is only used to identify
             * the company.
             *
             * It is NOT used for permission checking.
             */

            const companyId =
                this.authService.getCompanyId();

            this.companyService
                .getCompany(companyId)
                .subscribe({

                    next: (company: any) => {

                        this.companies = [company];

                        this.selectedCompanyId =
                            company.CompanyId;

                        this.loadUsers();

                    },

                    error: (err) => {

                        console.log(
                            'Error loading company:',
                            err
                        );

                        this.companies = [];

                        this.selectedCompanyId =
                            companyId;

                        this.loadUsers();

                    }

                });

        }

    }

    // ==================================================
    // COMPANY CHANGE
    // ==================================================

    companyChanged(): void {

        this.page = 1;

        this.loadUsers();

    }

    // ==================================================
    // LOAD USERS
    // ==================================================

    loadUsers(): void {

        this.loading = true;

        this.userService.getUsers(

            this.search,

            this.selectedCompanyId,

            this.sortBy,

            this.order,

            this.page,

            this.pageSize

        ).subscribe({

            next: (response: any) => {

                this.users =
                    response.data || [];

                this.totalRecords =
                    response.total_records || 0;

                this.loading = false;

                this.cdr.detectChanges();

            },

            error: (err) => {

                console.log(
                    'Error loading users:',
                    err
                );

                this.users = [];

                this.totalRecords = 0;

                this.loading = false;

                this.cdr.detectChanges();

            }

        });

    }

    // ==================================================
    // SEARCH
    // ==================================================

    searchUsers(): void {

        this.page = 1;

        this.loadUsers();

    }

    // ==================================================
    // ADD USER
    // ==================================================

    addUser(): void {

        this.router.navigate([
            '/user/add'
        ]);

    }

    // ==================================================
    // EDIT USER
    // ==================================================

    editUser(id: number): void {

        this.router.navigate([
            '/user/edit',
            id
        ]);

    }

    // ==================================================
    // DELETE USER
    // ==================================================

    deleteUser(id: number): void {

        if (
            !confirm(
                'Delete this User?'
            )
        ) {

            return;

        }

        this.userService
            .deleteUser(id)
            .subscribe({

                next: () => {

                    alert(
                        'User Deleted Successfully'
                    );

                    /*
                     * If the last user on the current
                     * page is deleted, go back one page.
                     */

                    if (
                        this.users.length === 1 &&
                        this.page > 1
                    ) {

                        this.page--;

                    }

                    this.loadUsers();

                },

                error: (err) => {

                    console.log(
                        'Error deleting user:',
                        err
                    );

                    alert(
                        err.error?.detail ||
                        'Unable to delete user'
                    );

                }

            });

    }

    // ==================================================
    // PREVIOUS PAGE
    // ==================================================

    previousPage(): void {

        if (this.page > 1) {

            this.page--;

            this.loadUsers();

        }

    }

    // ==================================================
    // NEXT PAGE
    // ==================================================

    nextPage(): void {

        if (
            this.page * this.pageSize <
            this.totalRecords
        ) {

            this.page++;

            this.loadUsers();

        }

    }

}