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
import { InterviewRoundService } from '../../../services/interview-round.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-interview-round-list',
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
    templateUrl: './interview-round-list.component.html',
})
export class InterviewRoundListComponent implements OnInit {
    interviewRounds: any[] = [];
    companies: any[] = [];
    search = '';
    selectedCompanyId: number | null = null;
    sortBy = 'RoundName';
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
        'RoundName',
        'Description',
        'Status',
        'Actions'
    ];
    constructor(
        private interviewRoundService: InterviewRoundService,
        private companyService: CompanyService,
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
                    this.loadInterviewRounds();
                },
                error: (err) => {
                    console.log(
                        'Error loading companies:',
                        err
                    );
                    this.companies = [];
                    this.selectedCompanyId = null;
                    this.loadInterviewRounds();
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
                        this.loadInterviewRounds();
                    },
                    error: (err) => {
                        console.log(
                            'Error loading company:',
                            err
                        );
                        this.companies = [];
                        this.selectedCompanyId =
                            companyId;
                        this.loadInterviewRounds();
                    }
                });
        }
    }
    // ==================================================
    // COMPANY CHANGE
    // ==================================================
    companyChanged(): void {
        this.page = 1;
        this.loadInterviewRounds();
    }
    // ==================================================
    // LOAD INTERVIEW ROUNDS
    // ==================================================
    loadInterviewRounds(): void {
        this.loading = true;
        this.interviewRoundService.getInterviewRounds(
            this.search,
            this.selectedCompanyId,
            this.sortBy,
            this.order,
            this.page,
            this.pageSize
        ).subscribe({
            next: (response: any) => {
                this.interviewRounds =
                    response.data || [];
                this.totalRecords =
                    response.total_records || 0;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.log(
                    'Error loading interview rounds:',
                    err
                );
                this.interviewRounds = [];
                this.totalRecords = 0;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }
    // ==================================================
    // SEARCH
    // ==================================================
    searchInterviewRounds(): void {
        this.page = 1;
        this.loadInterviewRounds();
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
        this.loadInterviewRounds();
    }
    // ==================================================
    // ADD INTERVIEW ROUND
    // ==================================================
    addInterviewRound(): void {
        this.router.navigate([
            '/interview-round/add'
        ]);
    }
    // ==================================================
    // EDIT INTERVIEW ROUND
    // ==================================================
    editInterviewRound(id: number): void {
        this.router.navigate([
            '/interview-round/edit',
            id
        ]);
    }
    // ==================================================
    // DELETE INTERVIEW ROUND
    // ==================================================
    deleteInterviewRound(id: number): void {
        if (
            !confirm(
                'Delete this Interview Round?'
            )
        ) {
            return;
        }
        this.interviewRoundService
            .deleteInterviewRound(id)
            .subscribe({
                next: () => {
                    alert(
                        'Interview Round Deleted Successfully'
                    );
                    if (
                        this.interviewRounds.length === 1 &&
                        this.page > 1
                    ) {
                        this.page--;
                    }
                    this.loadInterviewRounds();
                },
                error: (err) => {
                    console.log(
                        'Error deleting interview round:',
                        err
                    );
                    alert(
                        err.error?.detail ||
                        'Unable to delete interview round'
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
            this.loadInterviewRounds();
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
            this.loadInterviewRounds();
        }
    }
}
