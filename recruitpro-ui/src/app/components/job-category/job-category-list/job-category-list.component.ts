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

import { JobCategoryService } from '../../../services/job-category.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-job-category-list',
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

    templateUrl: './job-category-list.component.html',
})
export class JobCategoryListComponent implements OnInit {

    jobCategories: any[] = [];

    companies: any[] = [];

    search = '';

    selectedCompanyId: number | null = null;

    sortBy = 'CategoryName';

    order = 'asc';

    page = 1;

    pageSize = 10;

    totalRecords = 0;

    Math = Math;

    loading = false;

    // ==================================================
    // TABLE COLUMNS
    // ==================================================

    displayedColumns = [
        'CategoryName',
        'Description',
        'Status',
        'Actions'
    ];

    constructor(
        private jobCategoryService: JobCategoryService,
        private companyService: CompanyService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {

        this.loadCompanies();

    }

    // ==================================================
    // LOAD COMPANIES
    // ==================================================

    loadCompanies(): void {

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

                    // Super Admin starts with all companies

                    this.selectedCompanyId = null;

                    this.loadJobCategories();

                },

                error: (err) => {

                    console.log(
                        'Error loading companies:',
                        err
                    );

                    this.companies = [];

                    this.selectedCompanyId = null;

                    this.loadJobCategories();

                }

            });

        }

        else {

            // ------------------------------------------
            // Company Admin / Other Company Users
            // ------------------------------------------

            const companyId =
                this.authService.getCompanyId();

            if (!companyId) {

                console.log(
                    'Company ID not found.'
                );

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

                        this.loadJobCategories();

                    },

                    error: (err) => {

                        console.log(
                            'Error loading company:',
                            err
                        );

                        this.companies = [];

                        this.selectedCompanyId =
                            companyId;

                        this.loadJobCategories();

                    }

                });

        }

    }

    // ==================================================
    // COMPANY CHANGE
    // ==================================================

    companyChanged(): void {

        this.page = 1;

        this.loadJobCategories();

    }

    // ==================================================
    // LOAD JOB CATEGORIES
    // ==================================================

    loadJobCategories(): void {

        this.loading = true;

        this.jobCategoryService.getJobCategories(

            this.search,

            this.selectedCompanyId,

            this.sortBy,

            this.order,

            this.page,

            this.pageSize

        ).subscribe({

            next: (response: any) => {

                this.jobCategories =
                    response.data || [];

                this.totalRecords =
                    response.total_records || 0;

                this.loading = false;

                this.cdr.detectChanges();

            },

            error: (err) => {

                console.log(
                    'Error loading job categories:',
                    err
                );

                this.jobCategories = [];

                this.totalRecords = 0;

                this.loading = false;

                this.cdr.detectChanges();

            }

        });

    }

    // ==================================================
    // SEARCH
    // ==================================================

    searchJobCategories(): void {

        this.page = 1;

        this.loadJobCategories();

    }

    // ==================================================
    // SORT
    // ==================================================

    sort(column: string): void {

        if (this.sortBy === column) {

            this.order =
                this.order === 'asc'
                    ? 'desc'
                    : 'asc';

        }

        else {

            this.sortBy = column;

            this.order = 'asc';

        }

        this.loadJobCategories();

    }

    // ==================================================
    // ADD JOB CATEGORY
    // ==================================================

    addJobCategory(): void {

        this.router.navigate([
            '/job-category/add'
        ]);

    }

    // ==================================================
    // EDIT JOB CATEGORY
    // ==================================================

    editJobCategory(id: number): void {

        this.router.navigate([
            '/job-category/edit',
            id
        ]);

    }

    // ==================================================
    // DELETE JOB CATEGORY
    // ==================================================

    deleteJobCategory(id: number): void {

        if (
            !confirm(
                'Delete this Job Category?'
            )
        ) {

            return;

        }

        this.jobCategoryService
            .deleteJobCategory(id)
            .subscribe({

                next: () => {

                    alert(
                        'Job Category Deleted Successfully'
                    );

                    if (
                        this.jobCategories.length === 1 &&
                        this.page > 1
                    ) {

                        this.page--;

                    }

                    this.loadJobCategories();

                },

                error: (err) => {

                    console.log(
                        'Error deleting job category:',
                        err
                    );

                    alert(
                        err.error?.detail ||
                        'Unable to delete job category'
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

            this.loadJobCategories();

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

            this.loadJobCategories();

        }

    }

}