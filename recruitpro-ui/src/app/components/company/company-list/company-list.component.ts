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
  styleUrls: ['./company-list.component.css']
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
  // indicate loading state for async operations
  loading: boolean = false;
  constructor(
    private companyService: CompanyService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.loadCompanies();
  }
  loadCompanies() {
    this.loading = true;
    const data: any = {
      sortBy: this.sortBy,
      order: this.order,
      page: this.page,
      pageSize: this.pageSize
    };
    if (this.search != '') {
      data.search = this.search.trim();
    }
    this.companyService.getCompanies(
      this.search,
      this.sortBy,
      this.order,
      this.page,
      this.pageSize
    ).subscribe({
      next: (response: any) => {
        console.log(response);
        this.companies = [...response.data];
        this.totalRecords = response.total_records;
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