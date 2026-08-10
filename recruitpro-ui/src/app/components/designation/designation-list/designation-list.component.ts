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

import { DesignationService } from '../../../services/designation.service';
import { CompanyService } from '../../../services/company.service';
import { DepartmentService } from '../../../services/department.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-designation-list',
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
  templateUrl: './designation-list.component.html',
  styleUrls: ['./designation-list.component.css']
})
export class DesignationListComponent implements OnInit {

  designations: any[] = [];

  companies: any[] = [];
  departments: any[] = [];

  search = '';

  selectedCompanyId: number | null = null;
  selectedDepartmentId: number | null = null;

  loggedInRoleId = 0;
  loggedInCompanyId = 0;

  sortBy = 'DesignationName';
  order = 'asc';

  page = 1;
  pageSize = 10;
  totalRecords = 0;

  Math = Math;

  displayedColumns = [
    'DesignationCode',
    'DesignationName',
    'CompanyName',
    'DepartmentName',
    'Status',
    'Actions'
  ];

  constructor(
    private designationService: DesignationService,
    private companyService: CompanyService,
    private departmentService: DepartmentService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    if (!this.hasPermission('VIEW_DESIGNATION')) {

      alert('You are not authorized to access this page.');

      this.router.navigate(['/dashboard']);

      return;

    }

    this.loggedInRoleId = this.authService.getRoleId();
    this.loggedInCompanyId = this.authService.getCompanyId();

    this.loadCompanies();

  }

  hasPermission(permission: string): boolean {

    return this.authService.hasPermission(permission);

  }

  // -------------------------
  // Load Companies
  // -------------------------
  loadCompanies() {

    if (this.hasPermission('VIEW_ALL_COMPANIES')) {

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
          this.selectedDepartmentId = null;

          this.loadDepartments();
          this.loadDesignations();

        },

        error: (err) => {

          console.log(err);

        }

      });

    }

    else {

      this.companyService.getCompany(
        this.loggedInCompanyId
      ).subscribe({

        next: (company: any) => {

          this.companies = [company];

          this.selectedCompanyId = company.CompanyId;
          this.selectedDepartmentId = null;

          this.loadDepartments();
          this.loadDesignations();

        },

        error: (err) => {

          console.log(err);

        }

      });

    }

  }

  // -------------------------
  // Load Departments
  // -------------------------
  loadDepartments() {

    this.departmentService.getDepartments(
      '',
      this.selectedCompanyId,
      'DepartmentName',
      'asc',
      1,
      1000
    ).subscribe({

      next: (response: any) => {

        this.departments = response.data;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  // -------------------------
  // Company Changed
  // -------------------------
  companyChanged() {

    this.page = 1;

    this.selectedDepartmentId = null;

    this.loadDepartments();

    this.loadDesignations();

  }

  // -------------------------
  // Department Changed
  // -------------------------
  departmentChanged() {

    this.page = 1;

    this.loadDesignations();

  }

  // -------------------------
  // Load Designations
  // -------------------------
  loadDesignations() {

    this.designationService.getDesignations(
      this.search,
      this.selectedCompanyId,
      this.selectedDepartmentId,
      this.sortBy,
      this.order,
      this.page,
      this.pageSize
    ).subscribe({

      next: (response: any) => {

        this.designations = response.data;

        this.totalRecords = response.total_records;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  searchDesignation() {

    this.page = 1;

    this.loadDesignations();

  }

  addDesignation() {

    if (!this.hasPermission('CREATE_DESIGNATION')) {

      alert('You do not have permission to add designations.');

      return;

    }

    this.router.navigate(['/designation/add']);

  }

  editDesignation(id: number) {

    if (!this.hasPermission('UPDATE_DESIGNATION')) {

      alert('You do not have permission to update designations.');

      return;

    }

    this.router.navigate(['/designation/edit', id]);

  }

  deleteDesignation(id: number) {

    if (!this.hasPermission('DELETE_DESIGNATION')) {

      alert('You do not have permission to delete designations.');

      return;

    }

    if (confirm('Delete this Designation?')) {

      this.designationService.deleteDesignation(id).subscribe({

        next: () => {

          alert('Designation Deleted Successfully');

          this.loadDesignations();

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

      this.loadDesignations();

    }

  }

  nextPage() {

    if (this.page * this.pageSize < this.totalRecords) {

      this.page++;

      this.loadDesignations();

    }

  }

}