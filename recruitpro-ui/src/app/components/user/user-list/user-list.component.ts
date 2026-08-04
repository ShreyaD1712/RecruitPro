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
        MatSelectModule
    ],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
    users: any[] = [];
    companies: any[] = [];
    search = '';
    selectedCompanyId: number | null = null;
    loggedInRoleId = 0;
    loggedInCompanyId = 0;
    sortBy = 'FirstName';
    order = 'asc';
    page = 1;
    pageSize = 10;
    totalRecords = 0;
    Math = Math;
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
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }
    ngOnInit(): void {
        this.loggedInRoleId = this.authService.getRoleId();
        this.loggedInCompanyId = this.authService.getCompanyId();
        this.loadCompanies();
    }
    loadCompanies() {
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
                    this.companies = response.data;
                    // Show all companies by default
                    this.selectedCompanyId = null;
                    this.loadUsers();
                },
                error: (err) => {
                    console.log(err);
                }
            });
        }
        // Company Admin / Employee
        else {
            this.companyService.getCompany(
                this.loggedInCompanyId
            ).subscribe({
                next: (company: any) => {
                    this.companies = [company];
                    this.selectedCompanyId = company.CompanyId;
                    this.loadUsers();
                },
                error: (err) => {
                    console.log(err);
                }
            });
        }
    }
    companyChanged() {
        this.page = 1;
        this.loadUsers();
    }
    loadUsers() {
        this.userService.getUsers(
            this.search,
            this.selectedCompanyId,
            this.sortBy,
            this.order,
            this.page,
            this.pageSize
        ).subscribe({
            next: (response: any) => {
                this.users = response.data;
                this.totalRecords = response.total_records;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.log(err);
            }
        });
    }
    searchUsers() {
        this.page = 1;
        this.loadUsers();
    }
    addUser() {
        this.router.navigate(['/user/add']);
    }
    editUser(id: number) {
        this.router.navigate(['/user/edit', id]);
    }
    deleteUser(id: number) {
        if (confirm('Delete this User?')) {
            this.userService.deleteUser(id)
                .subscribe({
                    next: () => {
                        this.loadUsers();
                    },
                    error: (err) => {
                        console.log(err);
                    }
                });
        }
    }
    previousPage() {
        if (this.page > 1) {
            this.page--;
            this.loadUsers();
        }
    }
    nextPage() {
        if (this.page * this.pageSize < this.totalRecords) {
            this.page++;
            this.loadUsers();
        }
    }
}