import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { ApplicantService } from '../../../services/applicant.service';
import { DepartmentService } from '../../../services/department.service';
import { JobOpeningService } from '../../../services/job-opening.service';
@Component({
    selector: 'app-application-add',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    templateUrl: './application-add.component.html'
})
export class ApplicationAddComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    applicationForm!: FormGroup;
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    loadingDepartments = false;
    loadingJobOpenings = false;
    // ==================================================
    // APPLICATION STATUS
    // ==================================================
    applicationStatuses: string[] = [
        'Applied',
        'Screening',
        'Shortlisted',
        'Interview',
        'Selected',
        'Rejected',
        'Hired'
    ];
    // ==================================================
    // APPLICANTS
    // ==================================================
    applicants: any[] = [];
    // ==================================================
    // DEPARTMENTS
    // ==================================================
    departments: any[] = [];
    // ==================================================
    // JOB OPENINGS
    // ==================================================
    jobOpenings: any[] = [];
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private applicationService: ApplicationService,
        private applicantService: ApplicantService,
        private departmentService: DepartmentService,
        private jobOpeningService: JobOpeningService,
        public authService: AuthService,
        private router: Router
    ) { }
    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        // ----------------------------------------------
        // PERMISSION CHECK
        // ----------------------------------------------
        if (
            !this.authService.hasPermission(
                'CREATE_APPLICATION'
            )
        ) {
            alert(
                'You are not authorized to create applications.'
            );
            this.router.navigate([
                '/application'
            ]);
            return;
        }
        // ----------------------------------------------
        // CREATE FORM
        // ----------------------------------------------
        this.applicationForm = this.fb.group({
            ApplicantId: [
                null,
                Validators.required
            ],
            DepartmentId: [
                null,
                Validators.required
            ],
            JobOpeningId: [
                null,
                Validators.required
            ],
            CurrentStatus: [
                'Applied',
                Validators.required
            ],
            Remarks: [
                '',
                Validators.maxLength(5000)
            ]
        });
        // ----------------------------------------------
        // LOAD APPLICANTS
        // ----------------------------------------------
        this.loadApplicants();
        // ----------------------------------------------
        // LOAD DEPARTMENTS
        // ----------------------------------------------
        this.loadDepartments();
    }
    // ==================================================
    // PERMISSION CHECK
    // ==================================================
    hasPermission(
        permission: string
    ): boolean {
        return this.authService.hasPermission(
            permission
        );
    }
    // ==================================================
    // LOAD APPLICANTS
    // ==================================================
    loadApplicants(): void {
        this.applicantService
            .getApplicants(
                '',
                'CreatedOn',
                'desc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.applicants =
                        response.data || [];
                },
                error: (err: any) => {
                    console.log(
                        'Error loading applicants:',
                        err
                    );
                    this.applicants = [];
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
            console.log(
                'Company ID not found.'
            );
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
                },
                error: (err: any) => {
                    console.log(
                        'Error loading departments:',
                        err
                    );
                    this.departments = [];
                    this.loadingDepartments = false;
                }
            });
    }
    // ==================================================
    // DEPARTMENT CHANGE
    // ==================================================
    onDepartmentChange(): void {
        // Clear previously selected job opening
        this.applicationForm.patchValue({
            JobOpeningId: null
        });
        // Clear old job openings
        this.jobOpenings = [];
        const departmentId =
            this.applicationForm.get(
                'DepartmentId'
            )?.value;
        // No department selected
        if (!departmentId) {
            return;
        }
        // Load job openings for selected department
        this.loadJobOpenings(departmentId);
    }
    // ==================================================
    // LOAD JOB OPENINGS
    // ==================================================
    loadJobOpenings(
        departmentId: number
    ): void {
        this.loadingJobOpenings = true;
        this.jobOpeningService
            .getJobOpenings(
                '',
                departmentId,
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
    // SAVE APPLICATION
    // ==================================================
    saveApplication(): void {
        // ----------------------------------------------
        // PERMISSION CHECK
        // ----------------------------------------------
        if (
            !this.authService.hasPermission(
                'CREATE_APPLICATION'
            )
        ) {
            alert(
                'You do not have permission to create applications.'
            );
            return;
        }
        // ----------------------------------------------
        // FORM VALIDATION
        // ----------------------------------------------
        if (
            this.applicationForm.invalid
        ) {
            this.applicationForm.markAllAsTouched();
            return;
        }
        // ----------------------------------------------
        // GET FORM DATA
        // ----------------------------------------------
        const formData =
            this.applicationForm.getRawValue();
        // ----------------------------------------------
        // DO NOT SEND:
        //
        // AppliedDate
        // CompanyId
        // ----------------------------------------------
        //
        // AppliedDate will be generated
        // automatically by backend.
        //
        // CompanyId will come from
        // current_user["company_id"].
        // ----------------------------------------------
        const data = {
            ApplicantId:
                formData.ApplicantId,
            JobOpeningId:
                formData.JobOpeningId,
            CurrentStatus:
                formData.CurrentStatus,
            Remarks:
                formData.Remarks
        };
        // ----------------------------------------------
        // LOADING
        // ----------------------------------------------
        this.loading = true;
        // ----------------------------------------------
        // CREATE APPLICATION
        // ----------------------------------------------
        this.applicationService
            .addApplication(data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Application Added Successfully'
                    );
                    this.router.navigate([
                        '/application'
                    ]);
                },
                error: (err: any) => {
                    console.log(
                        'Error adding application:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to add application.'
                    );
                }
            });
    }
    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate([
            '/application'
        ]);
    }
}