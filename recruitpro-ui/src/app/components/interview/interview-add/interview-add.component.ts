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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { InterviewService } from '../../../services/interview.service';
import { ApplicationService } from '../../../services/application.service';
import { InterviewRoundService } from '../../../services/interview-round.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-interview-add',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './interview-add.component.html'
})
export class InterviewAddComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    interviewForm!: FormGroup;
    // ==================================================
    // MODE
    // ==================================================
    isEditMode = false;
    interviewId: number | null = null;
    // ==================================================
    // LOADING
    // ==================================================
    loading = false;
    loadingApplications = false;
    loadingInterviewRounds = false;
    loadingInterviewers = false;
    // ==================================================
    // DATA
    // ==================================================
    applications: any[] = [];
    interviewRounds: any[] = [];
    interviewers: any[] = [];
    // ==================================================
    // INTERVIEW MODES
    // ==================================================
    interviewModes = [
        'Online',
        'In Person',
        'Phone'
    ];
    // ==================================================
    // INTERVIEW STATUS
    // ==================================================
    interviewStatuses = [
        'Scheduled',
        'Completed',
        'Cancelled',
        'Rescheduled'
    ];
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private interviewService: InterviewService,
        private applicationService: ApplicationService,
        private interviewRoundService: InterviewRoundService,
        private userService: UserService,
        public authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }
    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        const id =
            this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.interviewId = Number(id);
        }
        // ==================================================
        // PERMISSION CHECK
        // ==================================================
        if (
            !this.isEditMode &&
            !this.authService.hasPermission(
                'CREATE_INTERVIEW'
            )
        ) {
            alert(
                'You are not authorized to schedule interviews.'
            );
            this.router.navigate([
                '/interview'
            ]);
            return;
        }
        if (
            this.isEditMode &&
            !this.authService.hasPermission(
                'UPDATE_INTERVIEW'
            )
        ) {
            alert(
                'You are not authorized to update interviews.'
            );
            this.router.navigate([
                '/interview'
            ]);
            return;
        }
        // ==================================================
        // FORM
        // ==================================================
        this.interviewForm = this.fb.group({
            ApplicationId: [
                null,
                Validators.required
            ],
            InterviewRoundId: [
                null,
                Validators.required
            ],
            InterviewerId: [
                null,
                Validators.required
            ],
            InterviewDate: [
                null,
                Validators.required
            ],
            InterviewTime: [
                '',
                Validators.required
            ],
            InterviewMode: [
                null,
                Validators.required
            ],
            Status: [
                'Scheduled',
                Validators.required
            ]
        });
        // ==================================================
        // LOAD DATA
        // ==================================================
        this.loadApplications();
        this.loadInterviewRounds();
        this.loadInterviewers();
        // ==================================================
        // EDIT MODE
        // ==================================================
        if (
            this.isEditMode &&
            this.interviewId
        ) {
            this.loadInterview();
        }
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
    // LOAD APPLICATIONS
    // ==================================================
    loadApplications(): void {
        this.loadingApplications = true;
        this.applicationService
            .getApplications(
                '',
                null,
                null,
                'All',
                'AppliedDate',
                'desc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.applications =
                        (response.data || []).map(
                            (application: any) => ({
                                ...application,
                                ApplicantName:
                                    application.ApplicantName ||
                                    (
                                        application.applicant
                                            ? `${application.applicant.FirstName || ''} ${application.applicant.LastName || ''}`.trim()
                                            : ''
                                    ),
                                JobTitle:
                                    application.JobTitle ||
                                    application.job_opening?.JobTitle ||
                                    ''
                            })
                        );
                    this.loadingApplications = false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading applications:',
                        err
                    );
                    this.applications = [];
                    this.loadingApplications = false;
                }
            });
    }
    // ==================================================
    // LOAD INTERVIEW ROUNDS
    // ==================================================
    loadInterviewRounds(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            console.log(
                'Company ID not found.'
            );
            return;
        }
        this.loadingInterviewRounds = true;
        this.interviewRoundService
            .getInterviewRounds(
                '',
                companyId,
                'RoundName',
                'asc',
                1,
                1000
            )
            .subscribe({
                next: (response: any) => {
                    this.interviewRounds =
                        (response.data || []).filter(
                            (round: any) =>
                                round.IsActive !== false
                        );
                    this.loadingInterviewRounds = false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading interview rounds:',
                        err
                    );
                    this.interviewRounds = [];
                    this.loadingInterviewRounds = false;
                }
            });
    }
    // ==================================================
    // LOAD INTERVIEWERS
    // ==================================================
    loadInterviewers(): void {
        const companyId =
            this.authService.getCompanyId();
        if (!companyId) {
            console.log(
                'Company ID not found.'
            );
            return;
        }
        this.loadingInterviewers = true;
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
                    this.interviewers =
                        response.data || [];
                    this.loadingInterviewers = false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading interviewers:',
                        err
                    );
                    this.interviewers = [];
                    this.loadingInterviewers = false;
                }
            });
    }
    // ==================================================
    // LOAD INTERVIEW
    // ==================================================
    loadInterview(): void {
        if (!this.interviewId) {
            return;
        }
        this.loading = true;
        this.interviewService
            .getInterviewById(
                this.interviewId
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'Interview Edit Response:',
                        response
                    );
                    const interviewDate =
                        new Date(
                            response.InterviewDate
                        );
                    const hours =
                        String(
                            interviewDate.getHours()
                        ).padStart(2, '0');
                    const minutes =
                        String(
                            interviewDate.getMinutes()
                        ).padStart(2, '0');
                    const interviewTime =
                        `${hours}:${minutes}`;
                    this.interviewForm.patchValue({
                        ApplicationId:
                            response.ApplicationId,
                        InterviewRoundId:
                            response.InterviewRoundId,
                        InterviewerId:
                            response.InterviewerId,
                        InterviewDate:
                            interviewDate,
                        InterviewTime:
                            interviewTime,
                        InterviewMode:
                            response.InterviewMode,
                        Status:
                            response.Status
                    });
                    this.loading = false;
                },
                error: (err: any) => {
                    console.log(
                        'Error loading interview:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to load interview.'
                    );
                    this.router.navigate([
                        '/interview'
                    ]);
                }
            });
    }
    // ==================================================
    // SAVE INTERVIEW
    // ==================================================
    saveInterview(): void {
        const requiredPermission =
            this.isEditMode
                ? 'UPDATE_INTERVIEW'
                : 'CREATE_INTERVIEW';
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
        if (this.interviewForm.invalid) {
            this.interviewForm
                .markAllAsTouched();
            return;
        }
        const formData =
            this.interviewForm
                .getRawValue();
        // ==================================================
        // COMBINE DATE + TIME
        // ==================================================
        const interviewDateTime =
            this.combineDateAndTime(
                formData.InterviewDate,
                formData.InterviewTime
            );
        if (!interviewDateTime) {
            alert(
                'Please enter a valid interview date and time.'
            );
            return;
        }
        const data = {
            ApplicationId:
                formData.ApplicationId,
            InterviewRoundId:
                formData.InterviewRoundId,
            InterviewerId:
                formData.InterviewerId,
            InterviewDate:
                interviewDateTime,
            InterviewMode:
                formData.InterviewMode,
            Status:
                formData.Status
        };
        console.log(
            'Interview Data:',
            data
        );
        this.loading = true;
        if (
            this.isEditMode &&
            this.interviewId
        ) {
            this.updateInterview(
                data
            );
        } else {
            this.createInterview(
                data
            );
        }
    }
    // ==================================================
    // COMBINE DATE AND TIME
    // ==================================================
    combineDateAndTime(
        dateValue: any,
        timeValue: string
    ): string | null {
        if (
            !dateValue ||
            !timeValue
        ) {
            return null;
        }
        const date =
            new Date(dateValue);
        const timeParts =
            timeValue.split(':');
        if (timeParts.length !== 2) {
            return null;
        }
        const hours =
            Number(timeParts[0]);
        const minutes =
            Number(timeParts[1]);
        date.setHours(
            hours,
            minutes,
            0,
            0
        );
        const year =
            date.getFullYear();
        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, '0');
        const day =
            String(
                date.getDate()
            ).padStart(2, '0');
        const hour =
            String(
                date.getHours()
            ).padStart(2, '0');
        const minute =
            String(
                date.getMinutes()
            ).padStart(2, '0');
        return (
            `${year}-${month}-${day}` +
            `T${hour}:${minute}:00`
        );
    }
    // ==================================================
    // CREATE INTERVIEW
    // ==================================================
    createInterview(
        data: any
    ): void {
        this.interviewService
            .addInterview(
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Interview Scheduled Successfully'
                    );
                    this.router.navigate([
                        '/interview'
                    ]);
                },
                error: (err: any) => {
                    console.log(
                        'Error scheduling interview:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to schedule interview.'
                    );
                }
            });
    }
    // ==================================================
    // UPDATE INTERVIEW
    // ==================================================
    updateInterview(
        data: any
    ): void {
        if (!this.interviewId) {
            return;
        }
        this.interviewService
            .updateInterview(
                this.interviewId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert(
                        'Interview Updated Successfully'
                    );
                    this.router.navigate([
                        '/interview'
                    ]);
                },
                error: (err: any) => {
                    console.log(
                        'Error updating interview:',
                        err
                    );
                    this.loading = false;
                    alert(
                        err?.error?.detail ||
                        'Unable to update interview.'
                    );
                }
            });
    }
    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate([
            '/interview'
        ]);
    }
}