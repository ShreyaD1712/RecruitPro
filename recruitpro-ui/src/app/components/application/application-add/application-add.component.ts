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
import { ReferralService } from '../../../services/referral.service';
import { AuthService } from '../../../services/auth.service';
import { ApplicantService } from '../../../services/applicant.service';
import { DepartmentService } from '../../../services/department.service';
import { JobOpeningService } from '../../../services/job-opening.service';
import { UserService } from '../../../services/user.service';
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
    // MODE
    // ==================================================
    isEditMode = false;
    applicationId: number | null = null;
    referralId: number | null = null;
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    loadingDepartments = false;
    loadingJobOpenings = false;
    loadingReferrerUsers = false;
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
    // REFERRAL OPTIONS
    // ==================================================
    referralOptions = [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ];
    // ==================================================
    // DATA
    // ==================================================
    applicants: any[] = [];
    departments: any[] = [];
    jobOpenings: any[] = [];
    referrerUsers: any[] = [];
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private applicationService: ApplicationService,
        private referralService: ReferralService,
        private userService: UserService,
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
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.applicationId = Number(id);
        }
        if (
            !this.isEditMode &&
            !this.authService.hasPermission('CREATE_APPLICATION')
        ) {
            alert('You are not authorized to create applications.');
            this.router.navigate(['/application']);
            return;
        }
        if (
            this.isEditMode &&
            !this.authService.hasPermission('UPDATE_APPLICATION')
        ) {
            alert('You are not authorized to update applications.');
            this.router.navigate(['/application']);
            return;
        }
        this.applicationForm = this.fb.group({
            ApplicantId: [null, Validators.required],
            DepartmentId: [null, Validators.required],
            JobOpeningId: [null, Validators.required],
            CurrentStatus: ['Applied', Validators.required],
            Remarks: ['', Validators.maxLength(5000)],
            IsReferral: [false, Validators.required],
            ReferrerUserId: [null],
            ReferralRemarks: ['', Validators.maxLength(500)]
        });
        this.applicationForm
            .get('IsReferral')
            ?.valueChanges
            .subscribe((isReferral: boolean) => {
                this.updateReferralValidation(isReferral);
                if (!isReferral) {
                    this.applicationForm.patchValue(
                        {
                            ReferrerUserId: null,
                            ReferralRemarks: ''
                        },
                        { emitEvent: false }
                    );
                }
            });
        this.loadApplicants();
        this.loadDepartments();
        this.loadReferrerUsers();
        if (this.isEditMode && this.applicationId) {
            this.loadApplication();
        }
    }
    // ==================================================
    // PERMISSION CHECK
    // ==================================================
    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }
    // ==================================================
    // REFERRAL VALIDATION
    // ==================================================
    updateReferralValidation(isReferral: boolean): void {
        const referrerControl =
            this.applicationForm.get('ReferrerUserId');
        if (isReferral) {
            referrerControl?.setValidators(
                Validators.required
            );
        } else {
            referrerControl?.clearValidators();
        }
        referrerControl?.updateValueAndValidity({
            emitEvent: false
        });
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
    // LOAD REFERRER USERS
    // ==================================================
    loadReferrerUsers(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            console.log('Company ID not found.');
            return;
        }
        this.loadingReferrerUsers = true;
        this.userService
            .getUsers(
                '',
                companyId,
                'FirstName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.referrerUsers =
                        response.data || [];
                    this.loadingReferrerUsers = false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading referrer users:',
                        err
                    );
                    this.referrerUsers = [];
                    this.loadingReferrerUsers = false;
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
            console.log('Company ID not found.');
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
        this.applicationForm.patchValue({
            JobOpeningId: null
        });
        this.jobOpenings = [];
        const departmentId =
            this.applicationForm
                .get('DepartmentId')
                ?.value;
        if (!departmentId) {
            return;
        }
        this.loadJobOpenings(
            departmentId
        );
    }
    // ==================================================
    // LOAD JOB OPENINGS
    // ==================================================
    loadJobOpenings(
        departmentId: number,
        selectedJobOpeningId: number | null = null
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
                    if (selectedJobOpeningId) {
                        this.applicationForm.patchValue({
                            JobOpeningId:
                                selectedJobOpeningId
                        });
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
    // LOAD APPLICATION
    // ==================================================
    loadApplication(): void {
        if (!this.applicationId) {
            return;
        }
        this.loading = true;
        this.applicationService
            .getApplicationById(
                this.applicationId
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'Application Edit Response:',
                        response
                    );
                    this.applicationForm.patchValue({
                        ApplicantId:
                            response.ApplicantId,
                        CurrentStatus:
                            response.CurrentStatus,
                        Remarks:
                            response.Remarks || ''
                    });
                    if (response.JobOpeningId) {
                        this.loadJobOpeningForEdit(
                            response.JobOpeningId
                        );
                    } else {
                        this.loading = false;
                    }
                    this.loadReferral();
                },
                error: (err: any) => {
                    console.error(
                        'Error loading application:',
                        err
                    );
                    this.loading = false;
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
    // LOAD JOB OPENING FOR EDIT
    // ==================================================
    loadJobOpeningForEdit(
        jobOpeningId: number
    ): void {
        this.jobOpeningService
            .getJobOpeningById(
                jobOpeningId
            )
            .subscribe({
                next: (job: any) => {
                    console.log(
                        'Job Opening Edit Response:',
                        job
                    );
                    const departmentId =
                        job.DepartmentId;
                    if (!departmentId) {
                        console.error(
                            'DepartmentId not found in Job Opening.'
                        );
                        this.loading = false;
                        return;
                    }
                    this.applicationForm.patchValue({
                        DepartmentId:
                            departmentId
                    });
                    this.loadJobOpeningsForEdit(
                        departmentId,
                        jobOpeningId
                    );
                },
                error: (err: any) => {
                    console.error(
                        'Error loading Job Opening:',
                        err
                    );
                    this.loading = false;
                }
            });
    }
    // ==================================================
    // LOAD JOB OPENINGS FOR EDIT
    // ==================================================
    loadJobOpeningsForEdit(
        departmentId: number,
        selectedJobOpeningId: number
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
                    this.applicationForm.patchValue({
                        JobOpeningId:
                            selectedJobOpeningId
                    });
                    this.loadingJobOpenings = false;
                    this.loading = false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading job openings for edit:',
                        err
                    );
                    this.jobOpenings = [];
                    this.loadingJobOpenings = false;
                    this.loading = false;
                }
            });
    }
    // ==================================================
    // LOAD REFERRAL BY APPLICATION
    // ==================================================
    loadReferral(): void {
        if (!this.applicationId) {
            return;
        }
        this.referralService
            .getReferrals(
                '',
                this.applicationId,
                null,
                null,
                'ReferralDate',
                'desc',
                1,
                1
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'Referral Response:',
                        response
                    );
                    const referrals =
                        response.data || [];
                    if (referrals.length === 0) {
                        this.referralId = null;
                        this.applicationForm.patchValue(
                            {
                                IsReferral: false,
                                ReferrerUserId: null,
                                ReferralRemarks: ''
                            },
                            {
                                emitEvent: false
                            }
                        );
                        this.updateReferralValidation(
                            false
                        );
                        return;
                    }
                    const referral =
                        referrals[0];
                    console.log(
                        'Referral Edit Record:',
                        referral
                    );
                    this.referralId =
                        referral.ReferralId;
                    const isReferral =
                        referral.ReferrerUserId !== null &&
                        referral.ReferrerUserId !== undefined;
                    // IMPORTANT:
                    // emitEvent:false prevents IsReferral
                    // valueChanges from clearing ReferralRemarks.
                    this.applicationForm.patchValue(
                        {
                            IsReferral:
                                isReferral,
                            ReferrerUserId:
                                referral.ReferrerUserId,
                            ReferralRemarks:
                                referral.Remarks ?? ''
                        },
                        {
                            emitEvent: false
                        }
                    );
                    this.updateReferralValidation(
                        isReferral
                    );
                    console.log(
                        'Referral Remarks:',
                        referral.Remarks
                    );
                    console.log(
                        'Form Referral Remarks:',
                        this.applicationForm
                            .get('ReferralRemarks')
                            ?.value
                    );
                },
                error: (err: any) => {
                    console.log(
                        'Error loading referral:',
                        err
                    );
                }
            });
    }
    // ==================================================
    // SAVE APPLICATION
    // ==================================================
    saveApplication(): void {
        const requiredPermission =
            this.isEditMode
                ? 'UPDATE_APPLICATION'
                : 'CREATE_APPLICATION';
        if (
            !this.authService.hasPermission(
                requiredPermission
            )
        ) {
            alert(
                'You do not have permission to perform this action.'
            );
            return;
        }
        if (this.applicationForm.invalid) {
            this.applicationForm
                .markAllAsTouched();
            return;
        }
        const formData =
            this.applicationForm
                .getRawValue();
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
        this.loading = true;
        if (
            this.isEditMode &&
            this.applicationId
        ) {
            this.updateApplication(
                data,
                formData
            );
        } else {
            this.createApplication(
                data,
                formData
            );
        }
    }
    // ==================================================
    // CREATE APPLICATION
    // ==================================================
    createApplication(
        data: any,
        formData: any
    ): void {
        this.applicationService
            .addApplication(data)
            .subscribe({
                next: (response: any) => {
                    const applicationId =
                        response.ApplicationId;
                    if (!applicationId) {
                        this.loading = false;
                        alert(
                            'Application created but ApplicationId was not returned.'
                        );
                        return;
                    }
                    this.applicationId =
                        applicationId;
                    this.createReferral(
                        applicationId,
                        formData
                    );
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
    // CREATE REFERRAL
    // ==================================================
    createReferral(
        applicationId: number,
        formData: any
    ): void {
        const referralData = {
            ApplicationId:
                applicationId,
            ApplicantId:
                formData.ApplicantId,
            ReferrerUserId:
                formData.IsReferral
                    ? formData.ReferrerUserId
                    : null,
            Remarks:
                formData.IsReferral
                    ? formData.ReferralRemarks
                    : null
        };
        this.referralService
            .addReferral(
                referralData
            )
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
                        'Error adding referral:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Application created, but referral could not be created.'
                    );
                }
            });
    }
    // ==================================================
    // UPDATE APPLICATION
    // ==================================================
    updateApplication(
        data: any,
        formData: any
    ): void {
        if (!this.applicationId) {
            return;
        }
        this.applicationService
            .updateApplication(
                this.applicationId,
                data
            )
            .subscribe({
                next: () => {
                    this.saveReferralForEdit(
                        formData
                    );
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
    // SAVE REFERRAL IN EDIT MODE
    // ==================================================
    saveReferralForEdit(
        formData: any
    ): void {
        if (!this.applicationId) {
            return;
        }
        const referralData = {
            ApplicationId:
                this.applicationId,
            ApplicantId:
                formData.ApplicantId,
            ReferrerUserId:
                formData.IsReferral
                    ? formData.ReferrerUserId
                    : null,
            Remarks:
                formData.IsReferral
                    ? formData.ReferralRemarks
                    : null
        };
        if (this.referralId) {
            this.updateReferral(
                referralData
            );
        } else {
            this.referralService
                .addReferral(
                    referralData
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
                            'Error creating referral:',
                            err
                        );
                        this.loading = false;
                        alert(
                            err?.error?.detail ||
                            'Application updated, but referral could not be created.'
                        );
                    }
                });
        }
    }
    // ==================================================
    // UPDATE REFERRAL
    // ==================================================
    updateReferral(
        referralData: any
    ): void {
        if (!this.referralId) {
            return;
        }
        this.referralService
            .updateReferral(
                this.referralId,
                referralData
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
                        'Error updating referral:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Application updated, but referral could not be updated.'
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