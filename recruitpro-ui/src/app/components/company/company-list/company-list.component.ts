import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';   // <-- Added

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './company-list.component.html',
})
export class CompanyListComponent implements OnInit {

  companies: any[] = [];
  search = '';
  sortBy = 'CompanyName';
  order = 'asc';
  page = 1;
  pageSize = 5;
  totalRecords = 0;
  Math = Math;
  loading = false;
  displayedColumns = [
    'CompanyCode',
    'CompanyName',
    'Email',
    'Phone',
    'Status',
    'Actions'
  ];

  constructor(
    private companyService: CompanyService,
    public authService: AuthService,   // <-- Added
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCompanies();
  }

  // <-- Added
  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  loadCompanies() {
    this.loading = true;

    this.companyService.getCompanies(
      this.search,
      this.sortBy,
      this.order,
      this.page,
      this.pageSize
    ).subscribe({
      next: (response: any) => {
        this.companies = [...response.data];
        this.totalRecords = response.total_records;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.log(error);
        this.loading = false;
      }
    });
  }

  searchCompany() {
    this.page = 1;
    this.loadCompanies();
  }

  sort(column: string) {
    if (this.sortBy === column) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.order = 'asc';
    }
    this.loadCompanies();
  }

  addCompany() {
    this.router.navigate(['/company/add']);
  }

  editCompany(id: number) {
    this.router.navigate(['/company/edit', id]);
  }

  deleteCompany(id: number) {
    if (!confirm('Delete this company?')) {
      return;
    }

    this.companyService.deleteCompany(id).subscribe({
      next: () => {
        alert('Company Deleted');
        this.loadCompanies();
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadCompanies();
    }
  }

  nextPage() {
    if (this.page * this.pageSize < this.totalRecords) {
      this.page++;
      this.loadCompanies();
    }
  }
}