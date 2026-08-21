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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ApplicationService } from '../../../services/application.service';
import { DepartmentService } from '../../../services/department.service';
import { JobOpeningService } from '../../../services/job-opening.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-application-list',
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
        MatTooltipModule,
        MatSelectModule
    ],
    templateUrl: './application-list.component.html'
})
export class ApplicationListComponent implements OnInit {
    // ==================================================
    // APPLICATIONS
    // ==================================================
    applications: any[] = [];
    // ==================================================
    // SEARCH
    // ==================================================
    search = '';
    // ==================================================
    // FILTERS
    // ==================================================
    departments: any[] = [];
    jobOpenings: any[] = [];
    selectedDepartmentId: number | null = null;
    selectedJobOpeningId: number | null = null;
    selectedStatus = 'All';
    // ==================================================
    // APPLICATION STATUS
    // ==================================================
    statuses = [
        'All',
        'Applied',
        'Screening',
        'Shortlisted',
        'Interview',
        'Selected',
        'Rejected',
        'Hired'
    ];
    // ==================================================
    // SORTING
    // ==================================================
    sortBy = 'AppliedDate';
    order = 'desc';
    // ==================================================
    // PAGINATION
    // ==================================================
    page = 1;
    pageSize = 10;
    totalRecords = 0;
    Math = Math;
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    loadingDepartments = false;
    loadingJobOpenings = false;
    // ==================================================
    // TABLE COLUMNS
    // ==================================================
    displayedColumns = [
        'ApplicantName',
        'ApplicantEmail',
        'ApplicantMobile',
        'JobTitle',
        'DepartmentName',
        'AppliedDate',
        'CurrentStatus',
        'Actions'
    ];
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private applicationService: ApplicationService,
        private departmentService: DepartmentService,
        private jobOpeningService: JobOpeningService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }
    // ==================================================
    // ON INIT
    // ==================================================
    ngOnInit(): void {
        this.loadApplications();
        this.loadDepartments();
    }
    // ==================================================
    // LOAD APPLICATIONS
    // ==================================================
    loadApplications(): void {
        this.loading = true;
        this.applicationService
            .getApplications(
                this.search,
                this.selectedDepartmentId,
                this.selectedJobOpeningId,
                this.selectedStatus,
                this.sortBy,
                this.order,
                this.page,
                this.pageSize
            )
            .subscribe({
                next: (response: any) => {
                    // ==================================================
                    // MAP NESTED API RESPONSE
                    // ==================================================
                    this.applications =
                        (response.data || []).map(
                            (application: any) => ({
                                ...application,
                                // Applicant
                                ApplicantName:
                                    application.applicant
                                        ? `${application.applicant.FirstName || ''} ${application.applicant.LastName || ''}`.trim()
                                        : '-',
                                ApplicantEmail:
                                    application.applicant?.Email || '-',
                                ApplicantMobile:
                                    application.applicant?.MobileNo || '-',
                                // Job Opening
                                JobTitle:
                                    application.job_opening?.JobTitle || '-',
                                // Department
                                DepartmentName:
                                    application.job_opening?.department?.DepartmentName || '-'
                            })
                        );
                    this.totalRecords =
                        response.total_records || 0;
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.log(
                        'Error loading applications:',
                        err
                    );
                    this.applications = [];
                    this.totalRecords = 0;
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to load applications.'
                    );
                    this.cdr.detectChanges();
                }
            });
    }
    // ==================================================
    // LOAD DEPARTMENTS
    // ==================================================
    loadDepartments(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            return;
        }
        this.loadingDepartments = true;
        this.departmentService
            .getDepartments(
                '',
                companyId,
                'DepartmentName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.departments =
                        response.data || [];
                    this.loadingDepartments = false;
                    this.loadJobOpenings();
                },
                error: (err: any) => {
                    console.log(
                        'Error loading departments:',
                        err
                    );
                    this.departments = [];
                    this.loadingDepartments = false;
                    this.loadJobOpenings();
                }
            });
    }
    // ==================================================
    // LOAD JOB OPENINGS
    // ==================================================
    loadJobOpenings(): void {
        this.loadingJobOpenings = true;
        this.jobOpeningService
            .getJobOpenings(
                '',
                this.selectedDepartmentId,
                null,
                'Open',
                'JobTitle',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.jobOpenings =
                        response.data || [];
                    this.loadingJobOpenings = false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading job openings:',
                        err
                    );
                    this.jobOpenings = [];
                    this.loadingJobOpenings = false;
                }
            });
    }
    // ==================================================
    // DEPARTMENT FILTER CHANGE
    // ==================================================
    onDepartmentChange(): void {
        // Reset job opening
        this.selectedJobOpeningId = null;
        // Reset pagination
        this.page = 1;
        // Reload job openings
        this.loadJobOpenings();
        // Reload applications
        this.loadApplications();
    }
    // ==================================================
    // JOB OPENING FILTER CHANGE
    // ==================================================
    onJobOpeningChange(): void {
        this.page = 1;
        this.loadApplications();
    }
    // ==================================================
    // STATUS FILTER CHANGE
    // ==================================================
    onStatusChange(): void {
        this.page = 1;
        this.loadApplications();
    }
    // ==================================================
    // SEARCH
    // ==================================================
    searchApplications(): void {
        this.page = 1;
        this.loadApplications();
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
        } else {
            this.sortBy = column;
            this.order = 'asc';
        }
        this.loadApplications();
    }
    // ==================================================
    // ADD APPLICATION
    // ==================================================
    addApplication(): void {
        if (
            !this.authService.hasPermission(
                'CREATE_APPLICATION'
            )
        ) {
            alert(
                'You are not authorized to create applications.'
            );
            return;
        }
        this.router.navigate([
            '/application/add'
        ]);
    }
    // ==================================================
    // EDIT APPLICATION
    // ==================================================
    editApplication(
        id: number,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }
        if (
            !this.authService.hasPermission(
                'UPDATE_APPLICATION'
            )
        ) {
            alert(
                'You are not authorized to edit applications.'
            );
            return;
        }
        this.router.navigate([
            '/application/edit',
            id
        ]);
    }
    // ==================================================
    // DELETE APPLICATION
    // ==================================================
    deleteApplication(
        id: number,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }
        if (
            !this.authService.hasPermission(
                'DELETE_APPLICATION'
            )
        ) {
            alert(
                'You are not authorized to delete applications.'
            );
            return;
        }
        if (
            !confirm(
                'Delete this Application?'
            )
        ) {
            return;
        }
        this.applicationService
            .deleteApplication(id)
            .subscribe({
                next: () => {
                    alert(
                        'Application Deleted Successfully'
                    );
                    if (
                        this.applications.length === 1 &&
                        this.page > 1
                    ) {
                        this.page--;
                    }
                    this.loadApplications();
                },
                error: (err: any) => {
                    console.log(
                        'Error deleting application:',
                        err
                    );
                    alert(
                        err?.error?.detail ||
                        'Unable to delete application.'
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
            this.loadApplications();
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
            this.loadApplications();
        }
    }
    // ==================================================
    // PAGE INFORMATION
    // ==================================================
    getStartRecord(): number {
        if (this.totalRecords === 0) {
            return 0;
        }
        return (
            (this.page - 1) *
            this.pageSize
        ) + 1;
    }
    getEndRecord(): number {
        return Math.min(
            this.page * this.pageSize,
            this.totalRecords
        );
    }
    // ==================================================
    // STATUS CLASS
    // ==================================================
    getStatusClass(
        status: string
    ): string {
        switch (status) {
            case 'Applied':
                return 'applied';
            case 'Screening':
                return 'screening';
            case 'Shortlisted':
                return 'shortlisted';
            case 'Interview':
                return 'interview';
            case 'Selected':
                return 'selected';
            case 'Rejected':
                return 'rejected';
            case 'Hired':
                return 'hired';
            default:
                return '';
        }
    }
}