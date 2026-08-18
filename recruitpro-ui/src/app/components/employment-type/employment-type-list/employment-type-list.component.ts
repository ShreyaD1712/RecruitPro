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

import { EmploymentTypeService } from '../../../services/employment-type.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-employment-type-list',
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

    templateUrl: './employment-type-list.component.html',
})
export class EmploymentTypeListComponent implements OnInit {

    employmentTypes: any[] = [];

    companies: any[] = [];

    search = '';

    selectedCompanyId: number | null = null;

    sortBy = 'EmploymentTypeName';

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
        'EmploymentTypeName',
        'Description',
        'Status',
        'Actions'
    ];

    constructor(
        private employmentTypeService: EmploymentTypeService,
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

                    this.loadEmploymentTypes();

                },

                error: (err) => {

                    console.log(
                        'Error loading companies:',
                        err
                    );

                    this.companies = [];

                    this.selectedCompanyId = null;

                    this.loadEmploymentTypes();

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

                        this.loadEmploymentTypes();

                    },

                    error: (err) => {

                        console.log(
                            'Error loading company:',
                            err
                        );

                        this.companies = [];

                        this.selectedCompanyId =
                            companyId;

                        this.loadEmploymentTypes();

                    }

                });

        }

    }

    // ==================================================
    // COMPANY CHANGE
    // ==================================================

    companyChanged(): void {

        this.page = 1;

        this.loadEmploymentTypes();

    }

    // ==================================================
    // LOAD EMPLOYMENT TYPES
    // ==================================================

    loadEmploymentTypes(): void {

        this.loading = true;

        this.employmentTypeService.getEmploymentTypes(

            this.search,

            this.selectedCompanyId,

            this.sortBy,

            this.order,

            this.page,

            this.pageSize

        ).subscribe({

            next: (response: any) => {

                this.employmentTypes =
                    response.data || [];

                this.totalRecords =
                    response.total_records || 0;

                this.loading = false;

                this.cdr.detectChanges();

            },

            error: (err) => {

                console.log(
                    'Error loading employment types:',
                    err
                );

                this.employmentTypes = [];

                this.totalRecords = 0;

                this.loading = false;

                this.cdr.detectChanges();

            }

        });

    }

    // ==================================================
    // SEARCH
    // ==================================================

    searchEmploymentTypes(): void {

        this.page = 1;

        this.loadEmploymentTypes();

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

        this.loadEmploymentTypes();

    }

    // ==================================================
    // ADD EMPLOYMENT TYPE
    // ==================================================

    addEmploymentType(): void {

        this.router.navigate([
            '/employment-type/add'
        ]);

    }

    // ==================================================
    // EDIT EMPLOYMENT TYPE
    // ==================================================

    editEmploymentType(id: number): void {

        this.router.navigate([
            '/employment-type/edit',
            id
        ]);

    }

    // ==================================================
    // DELETE EMPLOYMENT TYPE
    // ==================================================

    deleteEmploymentType(id: number): void {

        if (
            !confirm(
                'Delete this Employment Type?'
            )
        ) {

            return;

        }

        this.employmentTypeService
            .deleteEmploymentType(id)
            .subscribe({

                next: () => {

                    alert(
                        'Employment Type Deleted Successfully'
                    );

                    if (
                        this.employmentTypes.length === 1 &&
                        this.page > 1
                    ) {

                        this.page--;

                    }

                    this.loadEmploymentTypes();

                },

                error: (err) => {

                    console.log(
                        'Error deleting employment type:',
                        err
                    );

                    alert(
                        err.error?.detail ||
                        'Unable to delete employment type'
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

            this.loadEmploymentTypes();

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

            this.loadEmploymentTypes();

        }

    }

}