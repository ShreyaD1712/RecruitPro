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

    applications: any[] = [];
    search = '';

    departments: any[] = [];
    jobOpenings: any[] = [];

    selectedDepartmentId: number | null = null;
    selectedJobOpeningId: number | null = null;
    selectedStatus = 'All';

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

    sortBy = 'AppliedDate';
    order = 'desc';

    page = 1;
    pageSize = 10;
    totalRecords = 0;
    Math = Math;

    loading = false;
    loadingDepartments = false;
    loadingJobOpenings = false;

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

    constructor(
        private applicationService: ApplicationService,
        private departmentService: DepartmentService,
        private jobOpeningService: JobOpeningService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadApplications();
        this.loadDepartments();
    }

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
                    this.applications = (response.data || []).map(
                        (application: any) => ({
                            ...application,

                            ApplicantName:
                                application.applicant
                                    ? `${application.applicant.FirstName || ''} ${application.applicant.LastName || ''}`.trim()
                                    : '-',

                            ApplicantEmail:
                                application.applicant?.Email || '-',

                            ApplicantMobile:
                                application.applicant?.MobileNo || '-',

                            JobTitle:
                                application.job_opening?.JobTitle || '-',

                            DepartmentName:
                                application.job_opening
                                    ?.department
                                    ?.DepartmentName || '-'
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

    loadDepartments(): void {
        const companyId =
            this.authService.getCompanyId();

        if (!companyId) return;

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

    onDepartmentChange(): void {
        this.selectedJobOpeningId = null;
        this.page = 1;
        this.loadJobOpenings();
        this.loadApplications();
    }

    onJobOpeningChange(): void {
        this.page = 1;
        this.loadApplications();
    }

    onStatusChange(): void {
        this.page = 1;
        this.loadApplications();
    }

    searchApplications(): void {
        this.page = 1;
        this.loadApplications();
    }

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

        this.page = 1;
        this.loadApplications();
    }

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

    editApplication(
        id: number,
        event?: Event
    ): void {
        event?.stopPropagation();

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

    deleteApplication(
        id: number,
        event?: Event
    ): void {
        event?.stopPropagation();

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
    // ADD OFFER
    // ==================================================
    addOffer(
        application: any,
        event?: Event
    ): void {
        event?.stopPropagation();

        if (
            !this.authService.hasPermission(
                'CREATE_OFFER'
            )
        ) {
            alert(
                'You are not authorized to create offers.'
            );
            return;
        }

        if (
            application.CurrentStatus !==
            'Selected'
        ) {
            alert(
                'Offer can only be created for a selected application.'
            );
            return;
        }

        this.router.navigate(
            ['/offer/add'],
            {
                queryParams: {
                    applicationId:
                        application.ApplicationId
                }
            }
        );
    }

    previousPage(): void {
        if (this.page > 1) {
            this.page--;
            this.loadApplications();
        }
    }

    nextPage(): void {
        if (
            this.page * this.pageSize <
            this.totalRecords
        ) {
            this.page++;
            this.loadApplications();
        }
    }

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