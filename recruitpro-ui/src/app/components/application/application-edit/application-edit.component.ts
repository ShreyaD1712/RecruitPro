import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    selector: 'app-application-edit',
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
    templateUrl: './application-edit.component.html'
})
export class ApplicationEditComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    applicationForm!: FormGroup;
    applicationId!: number;
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    loadingApplication = false;
    loadingDepartments = false;
    loadingJobOpenings = false;
    // ==================================================
    // APPLICANTS
    // ==================================================
    applicants: any[] = [];
    // ==================================================
    // DEPARTMENTS
    // ==================================================
    departments: any[] = [];
    selectedDepartmentId: number | null = null;
    departmentName = '';
    // ==================================================
    // JOB OPENINGS
    // ==================================================
    jobOpenings: any[] = [];
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
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private applicationService: ApplicationService,
        private applicantService: ApplicantService,
        private departmentService: DepartmentService,
        private jobOpeningService: JobOpeningService,
        public authService: AuthService,
        private route: ActivatedRoute,
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
                'UPDATE_APPLICATION'
            )
        ) {
            alert(
                'You are not authorized to edit applications.'
            );
            this.router.navigate([
                '/application'
            ]);
            return;
        }
        // ----------------------------------------------
        // GET APPLICATION ID
        // ----------------------------------------------
        this.applicationId = Number(
            this.route.snapshot.paramMap.get('id')
        );
        // ----------------------------------------------
        // CREATE FORM
        // ----------------------------------------------
        this.applicationForm = this.fb.group({
            ApplicantId: [
                null,
                Validators.required
            ],
            /*
             * DepartmentId is kept internally.
             *
             * It is used to filter Job Openings.
             * The Department Name itself will be
             * displayed as read-only in the HTML.
             */
            DepartmentId: [
                null,
                Validators.required
            ],
            JobOpeningId: [
                null,
                Validators.required
            ],
            /*
             * AppliedDate is only for display.
             *
             * It will NOT be sent during update.
             */
            AppliedDate: [
                {
                    value: null,
                    disabled: true
                }
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
        // LOAD DATA
        // ----------------------------------------------
        this.loadApplicants();
        this.loadDepartments();
        this.loadApplication();
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
                    /*
                     * If the application has already
                     * been loaded, determine the
                     * department name now.
                     */
                    this.setDepartmentFromJobOpening();
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
    // LOAD APPLICATION
    // ==================================================
    loadApplication(): void {
        this.loadingApplication = true;
        this.applicationService
            .getApplicationById(
                this.applicationId
            )
            .subscribe({
                next: (response: any) => {
                    const application =
                        response;
                    // ----------------------------------
                    // PATCH APPLICATION DATA
                    // ----------------------------------
                    this.applicationForm.patchValue({
                        ApplicantId:
                            application.ApplicantId,
                        JobOpeningId:
                            application.JobOpeningId,
                        AppliedDate:
                            application.AppliedDate,
                        CurrentStatus:
                            application.CurrentStatus,
                        Remarks:
                            application.Remarks
                    });
                    this.loadingApplication = false;
                    /*
                     * First try to determine the
                     * department from already loaded
                     * job openings.
                     *
                     * If job openings are not loaded
                     * yet, load them after getting
                     * the application.
                     */
                    this.setDepartmentFromJobOpening();
                    /*
                     * If we do not yet have the
                     * department, load all job openings
                     * first and then determine it.
                     */
                    if (!this.selectedDepartmentId) {
                        this.loadAllJobOpeningsForExistingApplication();
                    } else {
                        this.loadJobOpenings();
                    }
                },
                error: (err: any) => {
                    console.log(
                        'Error loading application:',
                        err
                    );
                    this.loadingApplication = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to load application.'
                    );
                    this.router.navigate([
                        '/application'
                    ]);
                }
            });
    }
    // ==================================================
    // LOAD ALL JOB OPENINGS FOR EXISTING APPLICATION
    // ==================================================
    loadAllJobOpeningsForExistingApplication(): void {
        this.loadingJobOpenings = true;
        /*
         * Load job openings without department
         * filtering so that we can find the
         * department of the existing JobOpeningId.
         */
        this.jobOpeningService
            .getJobOpenings(
                '',
                null,
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
                    /*
                     * Now the existing JobOpeningId
                     * can be found.
                     */
                    this.setDepartmentFromJobOpening();
                    /*
                     * Once the department is known,
                     * reload only its Open Job Openings.
                     */
                    if (this.selectedDepartmentId) {
                        this.loadJobOpenings();
                    }
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
    // SET DEPARTMENT FROM EXISTING JOB OPENING
    // ==================================================
    setDepartmentFromJobOpening(): void {
        const jobOpeningId =
            this.applicationForm.get(
                'JobOpeningId'
            )?.value;
        if (!jobOpeningId) {
            return;
        }
        /*
         * Find the existing Job Opening.
         */
        const job =
            this.jobOpenings.find(
                (item: any) =>
                    Number(item.JobOpeningId) ===
                    Number(jobOpeningId)
            );
        if (!job) {
            return;
        }
        // ----------------------------------------------
        // SET DEPARTMENT ID
        // ----------------------------------------------
        this.selectedDepartmentId =
            Number(job.DepartmentId);
        this.applicationForm.patchValue({
            DepartmentId:
                Number(job.DepartmentId)
        });
        // ----------------------------------------------
        // FIND DEPARTMENT NAME
        // ----------------------------------------------
        const department =
            this.departments.find(
                (item: any) =>
                    Number(item.DepartmentId) ===
                    Number(job.DepartmentId)
            );
        if (department) {
            this.departmentName =
                department.DepartmentName;
        }
        /*
         * If the job opening list currently contains
         * all job openings, reload it using the
         * selected department.
         */
        if (
            this.jobOpenings.length > 0
        ) {
            this.loadJobOpenings();
        }
    }
    // ==================================================
    // DEPARTMENT CHANGE
    // ==================================================
    onDepartmentChange(): void {
        this.selectedDepartmentId =
            this.applicationForm.get(
                'DepartmentId'
            )?.value;
        /*
         * Update department name.
         */
        const department =
            this.departments.find(
                (item: any) =>
                    Number(item.DepartmentId) ===
                    Number(this.selectedDepartmentId)
            );
        if (department) {
            this.departmentName =
                department.DepartmentName;
        } else {
            this.departmentName = '';
        }
        /*
         * Reset selected Job Opening
         * when department changes.
         */
        this.applicationForm.patchValue({
            JobOpeningId: null
        });
        /*
         * Load only Open Job Openings
         * belonging to selected department.
         */
        this.loadJobOpenings();
    }
    // ==================================================
    // LOAD JOB OPENINGS
    // ==================================================
    loadJobOpenings(): void {
        /*
         * Don't make unnecessary API call if
         * department has not been determined yet.
         */
        if (!this.selectedDepartmentId) {
            this.jobOpenings = [];
            return;
        }
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
                    /*
                     * Restore the existing
                     * Job Opening after the list
                     * has been loaded.
                     */
                    this.restoreExistingJobOpening();
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
    // RESTORE EXISTING JOB OPENING
    // ==================================================
    restoreExistingJobOpening(): void {
        const existingJobOpeningId =
            this.applicationForm.get(
                'JobOpeningId'
            )?.value;
        if (!existingJobOpeningId) {
            return;
        }
        const job =
            this.jobOpenings.find(
                (item: any) =>
                    Number(item.JobOpeningId) ===
                    Number(existingJobOpeningId)
            );
        if (job) {
            this.applicationForm.patchValue({
                JobOpeningId:
                    Number(existingJobOpeningId)
            });
        }
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
                'UPDATE_APPLICATION'
            )
        ) {
            alert(
                'You do not have permission to update applications.'
            );
            return;
        }
        // ----------------------------------------------
        // VALIDATION
        // ----------------------------------------------
        if (
            this.applicationForm.invalid
        ) {
            this.applicationForm.markAllAsTouched();
            return;
        }
        /*
         * IMPORTANT:
         *
         * Do NOT use getRawValue()
         * because AppliedDate is disabled.
         *
         * Only send fields that are allowed
         * during Application update.
         */
        const data = {
            ApplicantId:
                this.applicationForm.get(
                    'ApplicantId'
                )?.value,
            JobOpeningId:
                this.applicationForm.get(
                    'JobOpeningId'
                )?.value,
            CurrentStatus:
                this.applicationForm.get(
                    'CurrentStatus'
                )?.value,
            Remarks:
                this.applicationForm.get(
                    'Remarks'
                )?.value
        };
        this.loading = true;
        // ----------------------------------------------
        // UPDATE APPLICATION
        // ----------------------------------------------
        this.applicationService
            .updateApplication(
                this.applicationId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Application Updated Successfully'
                    );
                    this.router.navigate([
                        '/application'
                    ]);
                },
                error: (err: any) => {
                    console.log(
                        'Error updating application:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to update application.'
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