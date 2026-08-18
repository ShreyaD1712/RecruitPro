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
import { ExperienceLevelService } from '../../../services/experience-level.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-experience-level-list',
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
    templateUrl: './experience-level-list.component.html',
})
export class ExperienceLevelListComponent implements OnInit {
    experienceLevels: any[] = [];
    companies: any[] = [];
    search = '';
    selectedCompanyId: number | null = null;
    sortBy = 'LevelName';
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
        'LevelName',
        'Description',
        'Status',
        'Actions'
    ];
    constructor(
        private experienceLevelService: ExperienceLevelService,
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
                    this.loadExperienceLevels();
                },
                error: (err) => {
                    console.log(
                        'Error loading companies:',
                        err
                    );
                    this.companies = [];
                    this.selectedCompanyId = null;
                    this.loadExperienceLevels();
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
                        this.loadExperienceLevels();
                    },
                    error: (err) => {
                        console.log(
                            'Error loading company:',
                            err
                        );
                        this.companies = [];
                        this.selectedCompanyId =
                            companyId;
                        this.loadExperienceLevels();
                    }
                });
        }
    }
    // ==================================================
    // COMPANY CHANGE
    // ==================================================
    companyChanged(): void {
        this.page = 1;
        this.loadExperienceLevels();
    }
    // ==================================================
    // LOAD EXPERIENCE LEVELS
    // ==================================================
    loadExperienceLevels(): void {
        this.loading = true;
        this.experienceLevelService.getExperienceLevels(
            this.search,
            this.selectedCompanyId,
            this.sortBy,
            this.order,
            this.page,
            this.pageSize
        ).subscribe({
            next: (response: any) => {
                this.experienceLevels =
                    response.data || [];
                this.totalRecords =
                    response.total_records || 0;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.log(
                    'Error loading experience levels:',
                    err
                );
                this.experienceLevels = [];
                this.totalRecords = 0;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }
    // ==================================================
    // SEARCH
    // ==================================================
    searchExperienceLevels(): void {
        this.page = 1;
        this.loadExperienceLevels();
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
        this.loadExperienceLevels();
    }
    // ==================================================
    // ADD EXPERIENCE LEVEL
    // ==================================================
    addExperienceLevel(): void {
        this.router.navigate([
            '/experience-level/add'
        ]);
    }
    // ==================================================
    // EDIT EXPERIENCE LEVEL
    // ==================================================
    editExperienceLevel(id: number): void {
        this.router.navigate([
            '/experience-level/edit',
            id
        ]);
    }
    // ==================================================
    // DELETE EXPERIENCE LEVEL
    // ==================================================
    deleteExperienceLevel(id: number): void {
        if (
            !confirm(
                'Delete this Experience Level?'
            )
        ) {
            return;
        }
        this.experienceLevelService
            .deleteExperienceLevel(id)
            .subscribe({
                next: () => {
                    alert(
                        'Experience Level Deleted Successfully'
                    );
                    if (
                        this.experienceLevels.length === 1 &&
                        this.page > 1
                    ) {
                        this.page--;
                    }
                    this.loadExperienceLevels();
                },
                error: (err) => {
                    console.log(
                        'Error deleting experience level:',
                        err
                    );
                    alert(
                        err.error?.detail ||
                        'Unable to delete experience level'
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
            this.loadExperienceLevels();
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
            this.loadExperienceLevels();
        }
    }
}