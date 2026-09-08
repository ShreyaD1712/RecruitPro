import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { ReportService } from '../../services/report.service';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company.service';
import { DepartmentService } from '../../services/department.service';
import { JobOpeningService } from '../../services/job-opening.service';
import { UserService } from '../../services/user.service';
import { InterviewRoundService } from '../../services/interview-round.service';

@Component({
    selector: 'app-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule
    ],
    templateUrl: './report.component.html',
    styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {

    reportType = 'summary';

    reportTypes = [
        { value: 'summary', label: 'Recruitment Summary' },
        { value: 'applications', label: 'Applications Report' },
        { value: 'interviews', label: 'Interviews Report' },
        { value: 'offers', label: 'Offers Report' },
        { value: 'hired', label: 'Hired Candidates Report' }
    ];

    applicationStatuses = [
        'Applied',
        'Screening',
        'Shortlisted',
        'Interview',
        'Selected',
        'Rejected',
        'Hired'
    ];

    interviewStatuses = [
        'Scheduled',
        'Completed',
        'Cancelled',
        'Rescheduled'
    ];

    offerStatuses = [
        'Draft',
        'Sent',
        'Accepted',
        'Rejected',
        'Withdrawn'
    ];

    companies: any[] = [];
    departments: any[] = [];
    jobOpenings: any[] = [];
    interviewers: any[] = [];
    interviewRounds: any[] = [];

    selectedCompanyId: number | null = null;
    selectedDepartmentId: number | null = null;
    selectedJobOpeningId: number | null = null;

    selectedApplicationStatus: string | null = null;
    selectedInterviewStatus: string | null = null;
    selectedOfferStatus: string | null = null;

    selectedInterviewerId: number | null = null;
    selectedInterviewRoundId: number | null = null;

    fromDate = '';
    toDate = '';
    search = '';

    isSuperAdmin = false;
    loading = false;

    summary: any = null;
    data: any[] = [];

    totalRecords = 0;
    page = 1;
    pageSize = 10;

    constructor(
        private reportService: ReportService,
        public authService: AuthService,
        private companyService: CompanyService,
        private departmentService: DepartmentService,
        private jobOpeningService: JobOpeningService,
        private userService: UserService,
        private interviewRoundService: InterviewRoundService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const user = this.authService.getUser();

        this.isSuperAdmin =
            user?.is_super_admin === true ||
            user?.role_id === 1 ||
            user?.RoleId === 1;

        if (this.isSuperAdmin) {
            this.loadCompanies();
        }

        this.loadDepartments();
        this.loadInterviewers();
        this.loadInterviewRounds();
        this.loadReport();
    }

    // =========================================================
    // TOTAL PAGES
    // =========================================================

    get totalPages(): number {
        return Math.max(
            1,
            Math.ceil(this.totalRecords / this.pageSize)
        );
    }

    // =========================================================
    // COMPANIES
    // =========================================================

    loadCompanies(): void {
        this.companyService.getCompanies(
            '',
            'CompanyName',
            'asc',
            1,
            1000
        ).subscribe({
            next: (res: any) => {
                this.companies =
                    res?.data ||
                    res?.items ||
                    res ||
                    [];

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading companies:', err);
            }
        });
    }

    // =========================================================
    // DEPARTMENTS
    // =========================================================

    loadDepartments(): void {
        this.departmentService.getDepartments(
            '',
            this.selectedCompanyId,
            'DepartmentName',
            'asc',
            1,
            1000
        ).subscribe({
            next: (res: any) => {
                this.departments =
                    res?.data ||
                    res?.items ||
                    res ||
                    [];

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading departments:', err);
            }
        });
    }

    // =========================================================
    // JOB OPENINGS
    // =========================================================

    loadJobOpenings(): void {
        this.jobOpenings = [];

        if (!this.selectedDepartmentId) {
            this.cdr.detectChanges();
            return;
        }

        this.jobOpeningService.getJobOpenings(
            '',
            this.selectedDepartmentId,
            null,
            'Open',
            'CreatedOn',
            'desc',
            1,
            1000
        ).subscribe({
            next: (res: any) => {
                this.jobOpenings =
                    res?.data ||
                    res?.items ||
                    res ||
                    [];

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading job openings:', err);
            }
        });
    }

    // =========================================================
    // INTERVIEWERS
    // =========================================================

    loadInterviewers(): void {
        this.userService.getUsers(
            '',
            this.selectedCompanyId,
            'FirstName',
            'asc',
            1,
            1000
        ).subscribe({
            next: (res: any) => {
                this.interviewers =
                    res?.data ||
                    res?.items ||
                    res ||
                    [];

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading interviewers:', err);
            }
        });
    }

    // =========================================================
    // INTERVIEW ROUNDS
    // =========================================================

    loadInterviewRounds(): void {
        this.interviewRoundService.getInterviewRounds(
            '',
            this.selectedCompanyId,
            'RoundName',
            'asc',
            1,
            1000
        ).subscribe({
            next: (res: any) => {
                this.interviewRounds =
                    res?.data ||
                    res?.items ||
                    res ||
                    [];

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading interview rounds:', err);
            }
        });
    }

    // =========================================================
    // FILTER CHANGES
    // =========================================================

    companyChanged(): void {
        this.selectedDepartmentId = null;
        this.selectedJobOpeningId = null;
        this.selectedInterviewerId = null;
        this.selectedInterviewRoundId = null;

        this.jobOpenings = [];

        this.page = 1;

        this.loadDepartments();
        this.loadInterviewers();
        this.loadInterviewRounds();

        this.loadReport();
    }

    departmentChanged(): void {
        this.selectedJobOpeningId = null;

        this.page = 1;

        this.loadJobOpenings();
    }

    reportTypeChanged(): void {
        this.resetReportFilters();

        this.page = 1;

        this.loadReport();
    }

    // =========================================================
    // LOAD REPORT
    // =========================================================

    loadReport(): void {
        this.loading = true;

        this.cdr.detectChanges();

        if (this.reportType === 'summary') {
            this.loadSummary();
            return;
        }

        if (this.reportType === 'applications') {
            this.loadApplicationReport();
            return;
        }

        if (this.reportType === 'interviews') {
            this.loadInterviewReport();
            return;
        }

        if (this.reportType === 'offers') {
            this.loadOfferReport();
            return;
        }

        if (this.reportType === 'hired') {
            this.loadHiredReport();
            return;
        }

        this.loading = false;

        this.cdr.detectChanges();
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    loadSummary(): void {
        this.reportService.getRecruitmentSummary(
            this.selectedCompanyId,
            this.fromDate || null,
            this.toDate || null
        ).subscribe({
            next: (res: any) => {
                this.summary = res;

                this.data = [];
                this.totalRecords = 0;

                this.loading = false;

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error(
                    'Summary report error:',
                    err
                );

                this.summary = null;
                this.loading = false;

                this.cdr.detectChanges();
            }
        });
    }

    // =========================================================
    // APPLICATION REPORT
    // =========================================================

    loadApplicationReport(): void {
        this.reportService.getApplicationReport(
            this.selectedCompanyId,
            this.selectedDepartmentId,
            this.selectedJobOpeningId,
            this.selectedApplicationStatus,
            this.fromDate || null,
            this.toDate || null,
            this.search,
            this.page,
            this.pageSize
        ).subscribe({
            next: (res: any) => {
                this.data = res?.data || [];

                this.totalRecords =
                    res?.total_records || 0;

                this.loading = false;

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error(
                    'Application report error:',
                    err
                );

                this.data = [];
                this.totalRecords = 0;
                this.loading = false;

                this.cdr.detectChanges();
            }
        });
    }

    // =========================================================
    // INTERVIEW REPORT
    // =========================================================

    loadInterviewReport(): void {
        this.reportService.getInterviewReport(
            this.selectedCompanyId,
            this.selectedInterviewStatus,
            this.selectedInterviewerId,
            this.selectedInterviewRoundId,
            this.fromDate || null,
            this.toDate || null,
            this.search,
            this.page,
            this.pageSize
        ).subscribe({
            next: (res: any) => {
                this.data = res?.data || [];

                this.totalRecords =
                    res?.total_records || 0;

                this.loading = false;

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error(
                    'Interview report error:',
                    err
                );

                this.data = [];
                this.totalRecords = 0;
                this.loading = false;

                this.cdr.detectChanges();
            }
        });
    }

    // =========================================================
    // OFFER REPORT
    // =========================================================

    loadOfferReport(): void {
        this.reportService.getOfferReport(
            this.selectedCompanyId,
            this.selectedOfferStatus,
            this.fromDate || null,
            this.toDate || null,
            this.search,
            this.page,
            this.pageSize
        ).subscribe({
            next: (res: any) => {
                this.data = res?.data || [];

                this.totalRecords =
                    res?.total_records || 0;

                this.loading = false;

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error(
                    'Offer report error:',
                    err
                );

                this.data = [];
                this.totalRecords = 0;
                this.loading = false;

                this.cdr.detectChanges();
            }
        });
    }

    // =========================================================
    // HIRED REPORT
    // =========================================================

    loadHiredReport(): void {
        this.reportService.getHiredCandidatesReport(
            this.selectedCompanyId,
            this.selectedDepartmentId,
            this.selectedJobOpeningId,
            this.fromDate || null,
            this.toDate || null,
            this.search,
            this.page,
            this.pageSize
        ).subscribe({
            next: (res: any) => {
                this.data = res?.data || [];

                this.totalRecords =
                    res?.total_records || 0;

                this.loading = false;

                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error(
                    'Hired candidates report error:',
                    err
                );

                this.data = [];
                this.totalRecords = 0;
                this.loading = false;

                this.cdr.detectChanges();
            }
        });
    }

    // =========================================================
    // SEARCH / FILTER
    // =========================================================

    onSearch(): void {
        this.page = 1;

        this.loadReport();
    }

    applyFilters(): void {
        this.page = 1;

        this.loadReport();
    }

    resetFilters(): void {
        this.fromDate = '';
        this.toDate = '';
        this.search = '';

        this.selectedDepartmentId = null;
        this.selectedJobOpeningId = null;

        this.selectedApplicationStatus = null;
        this.selectedInterviewStatus = null;
        this.selectedOfferStatus = null;

        this.selectedInterviewerId = null;
        this.selectedInterviewRoundId = null;

        if (this.isSuperAdmin) {
            this.selectedCompanyId = null;
        }

        this.jobOpenings = [];

        this.page = 1;

        this.loadDepartments();
        this.loadInterviewers();
        this.loadInterviewRounds();

        this.loadReport();
    }

    resetReportFilters(): void {
        this.search = '';

        this.selectedDepartmentId = null;
        this.selectedJobOpeningId = null;

        this.selectedApplicationStatus = null;
        this.selectedInterviewStatus = null;
        this.selectedOfferStatus = null;

        this.selectedInterviewerId = null;
        this.selectedInterviewRoundId = null;

        this.jobOpenings = [];

        this.data = [];
        this.summary = null;

        this.totalRecords = 0;
    }

    // =========================================================
    // CUSTOM PAGINATION
    // =========================================================

    previousPage(): void {
        if (this.page > 1 && !this.loading) {
            this.page--;

            this.loadReport();
        }
    }

    nextPage(): void {
        if (
            this.page < this.totalPages &&
            !this.loading
        ) {
            this.page++;

            this.loadReport();
        }
    }

    // =========================================================
    // CSV EXPORT
    // =========================================================

    exportCsv(): void {
        if (this.reportType === 'summary') {
            this.exportSummaryCsv();
            return;
        }

        if (!this.data || this.data.length === 0) {
            alert('No data available to export');
            return;
        }

        let headers: string[] = [];
        let rows: any[][] = [];
        let fileName = 'report.csv';

        // APPLICATIONS
        if (this.reportType === 'applications') {
            headers = [
                'Applicant',
                'Email',
                'Department',
                'Job Opening',
                'Applied Date',
                'Status'
            ];

            if (this.isSuperAdmin) {
                headers.push('Company');
            }

            rows = this.data.map((item: any) => {
                const row: any[] = [
                    item.ApplicantName,
                    item.Email,
                    item.DepartmentName,
                    item.JobTitle,
                    this.formatCsvDate(item.AppliedDate),
                    item.CurrentStatus
                ];

                if (this.isSuperAdmin) {
                    row.push(item.CompanyName);
                }

                return row;
            });

            fileName = 'applications-report.csv';
        }

        // INTERVIEWS
        if (this.reportType === 'interviews') {
            headers = [
                'Applicant',
                'Job Opening',
                'Interview Date',
                'Interview Time',
                'Interview Mode',
                'Status'
            ];

            if (this.isSuperAdmin) {
                headers.push('Company');
            }

            rows = this.data.map((item: any) => {
                const row: any[] = [
                    item.ApplicantName,
                    item.JobTitle,
                    this.formatCsvDate(
                        item.InterviewDate
                    ),
                    item.InterviewTime,
                    item.InterviewMode,
                    item.Status
                ];

                if (this.isSuperAdmin) {
                    row.push(item.CompanyName);
                }

                return row;
            });

            fileName = 'interviews-report.csv';
        }

        // OFFERS
        if (this.reportType === 'offers') {
            headers = [
                'Applicant',
                'Job Opening',
                'Offered Salary',
                'Offer Date',
                'Joining Date',
                'Status'
            ];

            if (this.isSuperAdmin) {
                headers.push('Company');
            }

            rows = this.data.map((item: any) => {
                const row: any[] = [
                    item.ApplicantName,
                    item.JobTitle,
                    item.OfferedSalary ?? '',
                    this.formatCsvDate(
                        item.OfferDate
                    ),
                    this.formatCsvDate(
                        item.JoiningDate
                    ),
                    item.OfferStatus
                ];

                if (this.isSuperAdmin) {
                    row.push(item.CompanyName);
                }

                return row;
            });

            fileName = 'offers-report.csv';
        }

        // HIRED
        if (this.reportType === 'hired') {
            headers = [
                'Applicant',
                'Email',
                'Department',
                'Job Opening',
                'Applied Date',
                'Status'
            ];

            if (this.isSuperAdmin) {
                headers.push('Company');
            }

            rows = this.data.map((item: any) => {
                const row: any[] = [
                    item.ApplicantName,
                    item.Email,
                    item.DepartmentName,
                    item.JobTitle,
                    this.formatCsvDate(
                        item.AppliedDate
                    ),
                    item.CurrentStatus
                ];

                if (this.isSuperAdmin) {
                    row.push(item.CompanyName);
                }

                return row;
            });

            fileName =
                'hired-candidates-report.csv';
        }

        this.downloadCsv(
            headers,
            rows,
            fileName
        );
    }

    // =========================================================
    // SUMMARY CSV
    // =========================================================

    exportSummaryCsv(): void {
        if (!this.summary) {
            alert(
                'No summary data available to export'
            );

            return;
        }

        const headers = [
            'Metric',
            'Count'
        ];

        const rows = [
            [
                'Total Applications',
                this.summary.TotalApplications || 0
            ],
            [
                'Shortlisted Candidates',
                this.summary.ShortlistedCandidates || 0
            ],
            [
                'Total Interviews',
                this.summary.TotalInterviews || 0
            ],
            [
                'Total Offers',
                this.summary.TotalOffers || 0
            ],
            [
                'Hired Candidates',
                this.summary.HiredCandidates || 0
            ]
        ];

        this.downloadCsv(
            headers,
            rows,
            'recruitment-summary.csv'
        );
    }

    // =========================================================
    // DOWNLOAD CSV
    // =========================================================

    downloadCsv(
        headers: string[],
        rows: any[][],
        fileName: string
    ): void {

        const csvRows: string[] = [];

        csvRows.push(
            headers
                .map(value =>
                    this.escapeCsvValue(value)
                )
                .join(',')
        );

        rows.forEach(row => {
            csvRows.push(
                row
                    .map(value =>
                        this.escapeCsvValue(value)
                    )
                    .join(',')
            );
        });

        const csvContent =
            csvRows.join('\r\n');

        const blob = new Blob(
            ['\ufeff' + csvContent],
            {
                type: 'text/csv;charset=utf-8;'
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement('a');

        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    // =========================================================
    // CSV VALUE
    // =========================================================

    escapeCsvValue(value: any): string {
        if (
            value === null ||
            value === undefined
        ) {
            return '';
        }

        const text =
            String(value).replace(/"/g, '""');

        return `"${text}"`;
    }

    // =========================================================
    // CSV DATE
    // =========================================================

    formatCsvDate(value: any): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return String(value);
        }

        const day =
            String(date.getDate())
                .padStart(2, '0');

        const month =
            String(date.getMonth() + 1)
                .padStart(2, '0');

        const year =
            date.getFullYear();

        return `${day}-${month}-${year}`;
    }
}