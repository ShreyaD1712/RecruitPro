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
import { JobOpeningService } from '../../../services/job-opening.service';
import { DepartmentService } from '../../../services/department.service';
import { DesignationService } from '../../../services/designation.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-job-opening-list',
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
    templateUrl: './job-opening-list.component.html',
})
export class JobOpeningListComponent implements OnInit {
    // ==================================================
    // JOB OPENINGS
    // ==================================================
    jobOpenings: any[] = [];
    // ==================================================
    // DEPARTMENTS
    // ==================================================
    departments: any[] = [];
    selectedDepartmentId: number | null = null;
    // ==================================================
    // DESIGNATIONS
    // ==================================================
    designations: any[] = [];
    selectedDesignationId: number | null = null;
    selectedStatus = 'Open';
    // ==================================================
    // SEARCH
    // ==================================================
    search = '';
    // ==================================================
    // SORTING
    // ==================================================
    sortBy = 'CreatedOn';
    order = 'desc';
    // ==================================================
    // PAGINATION
    // ==================================================
    page = 1;
    pageSize = 10;
    totalRecords = 0;
    // ==================================================
    // OTHER
    // ==================================================
    Math = Math;
    loading = false;
    // ==================================================
    // TABLE COLUMNS
    // ==================================================
    displayedColumns = [
        'JobTitle',
        'Department',
        'Designation',
        'Location',
        'NoOfVacancies',
        'Salary',
        'Status',
        'Actions'
    ];
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private jobOpeningService: JobOpeningService,
        private departmentService: DepartmentService,
        private designationService: DesignationService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }
    // ==================================================
    // ON INIT
    // ==================================================
    ngOnInit(): void {
        this.loadDepartments();
    }
    // ==================================================
    // LOAD DEPARTMENTS
    // ==================================================
    loadDepartments(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            console.log(
                'Company ID not found.'
            );
            return;
        }
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
                    // Initially show all departments
                    this.selectedDepartmentId =
                        null;
                    // Initially show all designations
                    this.designations = [];
                    this.selectedDesignationId =
                        null;
                    this.loadJobOpenings();
                },
                error: (err) => {
                    console.log(
                        'Error loading departments:',
                        err
                    );
                    this.departments = [];
                    this.loadJobOpenings();
                }
            });
    }
    // ==================================================
    // DEPARTMENT CHANGE
    // ==================================================
    departmentChanged(): void {
        this.page = 1;
        // Reset designation
        this.selectedDesignationId =
            null;
        this.designations = [];
        // If no department selected,
        // show all job openings.
        if (
            this.selectedDepartmentId === null
        ) {
            this.loadJobOpenings();
            return;
        }
        this.loadDesignations();
    }
    // ==================================================
    // LOAD DESIGNATIONS
    // ==================================================
    loadDesignations(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            console.log(
                'Company ID not found.'
            );
            return;
        }
        if (
            this.selectedDepartmentId === null
        ) {
            this.designations = [];
            this.loadJobOpenings();
            return;
        }
        this.designationService
            .getDesignations(
                '',
                companyId,
                this.selectedDepartmentId,
                'DesignationName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.designations =
                        response.data || [];
                    this.loadJobOpenings();
                },
                error: (err) => {
                    console.log(
                        'Error loading designations:',
                        err
                    );
                    this.designations = [];
                    this.loadJobOpenings();
                }
            });
    }
    // ==================================================
    // DESIGNATION CHANGE
    // ==================================================
    designationChanged(): void {
        this.page = 1;
        this.loadJobOpenings();
    }
    // ==================================================
    // STATUS CHANGE
    // ==================================================
    statusChanged(): void {
        this.page = 1;
        this.loadJobOpenings();
    }
    // ==================================================
    // LOAD JOB OPENINGS
    // ==================================================
    loadJobOpenings(): void {
        this.loading = true;
        this.jobOpeningService.getJobOpenings(
            this.search,
            this.selectedDepartmentId,
            this.selectedDesignationId,
            this.selectedStatus,
            this.sortBy,
            this.order,
            this.page,
            this.pageSize
        ).subscribe({
            next: (response: any) => {
                this.jobOpenings =
                    response.data || [];
                this.totalRecords =
                    response.total_records || 0;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.log(
                    'Error loading job openings:',
                    err
                );
                this.jobOpenings = [];
                this.totalRecords = 0;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }
    // ==================================================
    // SEARCH
    // ==================================================
    searchJobOpenings(): void {
        this.page = 1;
        this.loadJobOpenings();
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
        this.loadJobOpenings();
    }
    // ==================================================
    // ADD JOB OPENING
    // ==================================================
    addJobOpening(): void {
        this.router.navigate([
            '/job-opening/add'
        ]);
    }
    // ==================================================
    // EDIT JOB OPENING
    // ==================================================
    editJobOpening(id: number): void {
        this.router.navigate([
            '/job-opening/edit',
            id
        ]);
    }
    // ==================================================
    // DELETE JOB OPENING
    // ==================================================
    deleteJobOpening(id: number): void {
        if (
            !confirm(
                'Delete this Job Opening?'
            )
        ) {
            return;
        }
        this.jobOpeningService
            .deleteJobOpening(id)
            .subscribe({
                next: () => {
                    alert(
                        'Job Opening Deleted Successfully'
                    );
                    if (
                        this.jobOpenings.length === 1 &&
                        this.page > 1
                    ) {
                        this.page--;
                    }
                    this.loadJobOpenings();
                },
                error: (err) => {
                    console.log(
                        'Error deleting job opening:',
                        err
                    );
                    alert(
                        err.error?.detail ||
                        'Unable to delete job opening'
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
            this.loadJobOpenings();
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
            this.loadJobOpenings();
        }
    }
}