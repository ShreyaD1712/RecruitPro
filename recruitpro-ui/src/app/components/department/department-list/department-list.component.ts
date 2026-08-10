import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

import { DepartmentService } from '../../../services/department.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-department-list',
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
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit {

  departments: any[] = [];
  companies: any[] = [];

  search = '';

  selectedCompanyId: number | null = null;

  loggedInRoleId = 0;
  loggedInCompanyId = 0;

  sortBy = 'DepartmentName';
  order = 'asc';

  page = 1;
  pageSize = 10;
  totalRecords = 0;

  Math = Math;

  displayedColumns = [
    'DepartmentCode',
    'DepartmentName',
    'CompanyName',
    'Status',
    'Actions'
  ];

  constructor(
    private departmentService: DepartmentService,
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

  // Permission Check
  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  loadCompanies() {

    // Super Admin
    if (this.loggedInRoleId == 1) {

      this.companyService.getCompanies(
        '',
        'CompanyName',
        'asc',
        1,
        1000
      ).subscribe({

        next: (response: any) => {

          this.companies = response.data;

          this.selectedCompanyId = null;

          this.loadDepartments();

        },

        error: (err) => {

          console.log(err);

        }

      });

    }

    // Company Admin
    else {

      this.companyService.getCompany(
        this.loggedInCompanyId
      ).subscribe({

        next: (company: any) => {

          this.companies = [company];

          this.selectedCompanyId = company.CompanyId;

          this.loadDepartments();

        },

        error: (err) => {

          console.log(err);

        }

      });

    }

  }

  onCompanyChange() {

    this.page = 1;

    this.loadDepartments();

  }

  loadDepartments() {

    this.departmentService.getDepartments(
      this.search,
      this.selectedCompanyId,
      this.sortBy,
      this.order,
      this.page,
      this.pageSize
    ).subscribe({

      next: (response: any) => {

        this.departments = response.data;

        this.totalRecords = response.total_records;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  searchDepartment() {

    this.page = 1;

    this.loadDepartments();

  }

  addDepartment() {

    if (!this.hasPermission('CREATE_DEPARTMENT')) {

      alert('You do not have permission to add departments.');

      return;

    }

    this.router.navigate(['/department/add']);

  }

  editDepartment(id: number) {

    if (!this.hasPermission('UPDATE_DEPARTMENT')) {

      alert('You do not have permission to update departments.');

      return;

    }

    this.router.navigate(['/department/edit', id]);

  }

  deleteDepartment(id: number) {

    if (!this.hasPermission('DELETE_DEPARTMENT')) {

      alert('You do not have permission to delete departments.');

      return;

    }

    if (confirm('Delete this Department?')) {

      this.departmentService.deleteDepartment(id)
        .subscribe({

          next: () => {

            alert('Department Deleted Successfully');

            this.loadDepartments();

          },

          error: (err) => {

            console.log(err);

            alert(err.error.detail);

          }

        });

    }

  }

  previousPage() {

    if (this.page > 1) {

      this.page--;

      this.loadDepartments();

    }

  }

  nextPage() {

    if (this.page * this.pageSize < this.totalRecords) {

      this.page++;

      this.loadDepartments();

    }

  }

}