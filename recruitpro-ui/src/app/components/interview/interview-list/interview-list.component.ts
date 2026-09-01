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
import { InterviewService } from '../../../services/interview.service';
import { InterviewFeedbackService } from '../../../services/interview-feedback.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-interview-list',
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
    templateUrl: './interview-list.component.html'
})
export class InterviewListComponent implements OnInit {
    // ==================================================
    // INTERVIEWS
    // ==================================================
    interviews: any[] = [];

    // ==================================================
    // SEARCH
    // ==================================================
    search = '';

    // ==================================================
    // FILTERS
    // ==================================================
    selectedStatus = 'All';

    // ==================================================
    // INTERVIEW STATUS
    // ==================================================
    statuses = [
        'All',
        'Scheduled',
        'Completed',
        'Cancelled',
        'Rescheduled'
    ];

    // ==================================================
    // SORTING
    // ==================================================
    sortBy = 'InterviewDate';
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

    // ==================================================
    // TABLE COLUMNS
    // ==================================================
    displayedColumns = [
        'ApplicantName',
        'JobTitle',
        'InterviewRoundName',
        'InterviewDate',
        'InterviewMode',
        'InterviewerName',
        'Status',
        'Actions'
    ];

    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private interviewService: InterviewService,
        private interviewFeedbackService: InterviewFeedbackService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    // ==================================================
    // ON INIT
    // ==================================================
    ngOnInit(): void {
        this.loadInterviews();
    }

    // ==================================================
    // LOAD INTERVIEWS
    // ==================================================
    loadInterviews(): void {
        this.loading = true;

        this.interviewService
            .getInterviews(
                this.search,
                null,
                null,
                null,
                this.selectedStatus,
                this.sortBy,
                this.order,
                this.page,
                this.pageSize
            )
            .subscribe({
                next: (response: any) => {
                    this.interviews =
                        (response.data || []).map(
                            (interview: any) => ({
                                ...interview,

                                ApplicantName:
                                    interview.ApplicantName ||
                                    (
                                        interview.application?.applicant
                                            ? `${interview.application.applicant.FirstName || ''} ${interview.application.applicant.LastName || ''}`.trim()
                                            : '-'
                                    ),

                                JobTitle:
                                    interview.JobTitle ||
                                    interview.application
                                        ?.job_opening
                                        ?.JobTitle ||
                                    '-',

                                InterviewRoundName:
                                    interview.InterviewRoundName ||
                                    interview.interview_round
                                        ?.RoundName ||
                                    '-',

                                InterviewerName:
                                    interview.InterviewerName ||
                                    (
                                        interview.interviewer
                                            ? `${interview.interviewer.FirstName || ''} ${interview.interviewer.LastName || ''}`.trim()
                                            : '-'
                                    ),

                                FeedbackExists: false,
                                FeedbackId: null,
                                FeedbackLoading: false
                            })
                        );

                    this.totalRecords =
                        response.total_records || 0;

                    this.loading = false;

                    this.loadFeedbackStatus();

                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.log(
                        'Error loading interviews:',
                        err
                    );

                    this.interviews = [];
                    this.totalRecords = 0;
                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to load interviews.'
                    );

                    this.cdr.detectChanges();
                }
            });
    }

    // ==================================================
    // LOAD FEEDBACK STATUS
    // ==================================================
    loadFeedbackStatus(): void {
        this.interviews.forEach(
            (interview: any) => {
                if (
                    interview.Status !== 'Completed'
                ) {
                    return;
                }

                interview.FeedbackLoading = true;

                this.interviewFeedbackService
                    .getFeedbackByInterview(
                        interview.InterviewId
                    )
                    .subscribe({
                        next: (response: any) => {
                            interview.FeedbackExists =
                                response.exists === true;

                            interview.FeedbackId =
                                response.feedback
                                    ?.FeedbackId || null;

                            interview.FeedbackLoading =
                                false;

                            this.cdr.detectChanges();
                        },
                        error: (err: any) => {
                            console.log(
                                'Error checking feedback:',
                                err
                            );

                            interview.FeedbackExists =
                                false;

                            interview.FeedbackId =
                                null;

                            interview.FeedbackLoading =
                                false;

                            this.cdr.detectChanges();
                        }
                    });
            }
        );
    }

    // ==================================================
    // STATUS FILTER CHANGE
    // ==================================================
    onStatusChange(): void {
        this.page = 1;
        this.loadInterviews();
    }

    // ==================================================
    // SEARCH
    // ==================================================
    searchInterviews(): void {
        this.page = 1;
        this.loadInterviews();
    }

    // ==================================================
    // SORT
    // ==================================================
    sort(
        column: string
    ): void {
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
        this.loadInterviews();
    }

    // ==================================================
    // ADD INTERVIEW
    // ==================================================
    addInterview(): void {
        if (
            !this.authService.hasPermission(
                'CREATE_INTERVIEW'
            )
        ) {
            alert(
                'You are not authorized to schedule interviews.'
            );
            return;
        }

        this.router.navigate([
            '/interview/add'
        ]);
    }

    // ==================================================
    // EDIT INTERVIEW
    // ==================================================
    editInterview(
        id: number,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }

        if (
            !this.authService.hasPermission(
                'UPDATE_INTERVIEW'
            )
        ) {
            alert(
                'You are not authorized to edit interviews.'
            );
            return;
        }

        this.router.navigate([
            '/interview/edit',
            id
        ]);
    }

    // ==================================================
    // CANCEL INTERVIEW
    // ==================================================
    cancelInterview(
        id: number,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }

        if (
            !this.authService.hasPermission(
                'UPDATE_INTERVIEW'
            )
        ) {
            alert(
                'You are not authorized to cancel interviews.'
            );
            return;
        }

        if (
            !confirm(
                'Cancel this Interview?'
            )
        ) {
            return;
        }

        this.interviewService
            .cancelInterview(id)
            .subscribe({
                next: () => {
                    alert(
                        'Interview Cancelled Successfully'
                    );

                    this.loadInterviews();
                },
                error: (err: any) => {
                    console.log(
                        'Error cancelling interview:',
                        err
                    );

                    alert(
                        err?.error?.detail ||
                        'Unable to cancel interview.'
                    );
                }
            });
    }

    // ==================================================
    // DELETE INTERVIEW
    // ==================================================
    deleteInterview(
        id: number,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }

        if (
            !this.authService.hasPermission(
                'DELETE_INTERVIEW'
            )
        ) {
            alert(
                'You are not authorized to delete interviews.'
            );
            return;
        }

        if (
            !confirm(
                'Delete this Interview?'
            )
        ) {
            return;
        }

        this.interviewService
            .deleteInterview(id)
            .subscribe({
                next: () => {
                    alert(
                        'Interview Deleted Successfully'
                    );

                    if (
                        this.interviews.length === 1 &&
                        this.page > 1
                    ) {
                        this.page--;
                    }

                    this.loadInterviews();
                },
                error: (err: any) => {
                    console.log(
                        'Error deleting interview:',
                        err
                    );

                    alert(
                        err?.error?.detail ||
                        'Unable to delete interview.'
                    );
                }
            });
    }

    // ==================================================
    // OPEN INTERVIEW FEEDBACK
    // ==================================================
    openFeedback(
        interview: any,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }

        // Feedback only for completed interview
        if (
            interview.Status !== 'Completed'
        ) {
            return;
        }

        if (interview.FeedbackLoading) {
            return;
        }

        // ==================================================
        // EDIT FEEDBACK
        // ==================================================
        if (
            interview.FeedbackExists &&
            interview.FeedbackId
        ) {
            if (
                !this.authService.hasPermission(
                    'UPDATE_INTERVIEW_FEEDBACK'
                )
            ) {
                alert(
                    'You are not authorized to update interview feedback.'
                );
                return;
            }

            this.router.navigate([
                '/interview-feedback/edit',
                interview.FeedbackId
            ]);

            return;
        }

        // ==================================================
        // ADD FEEDBACK
        // ==================================================
        if (
            !this.authService.hasPermission(
                'CREATE_INTERVIEW_FEEDBACK'
            )
        ) {
            alert(
                'You are not authorized to add interview feedback.'
            );
            return;
        }

        this.router.navigate(
            [
                '/interview-feedback/add'
            ],
            {
                queryParams: {
                    interviewId:
                        interview.InterviewId
                }
            }
        );
    }

    // ==================================================
    // PREVIOUS PAGE
    // ==================================================
    previousPage(): void {
        if (this.page > 1) {
            this.page--;
            this.loadInterviews();
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
            this.loadInterviews();
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
            case 'Scheduled':
                return 'scheduled';

            case 'Completed':
                return 'completed';

            case 'Cancelled':
                return 'cancelled';

            case 'Rescheduled':
                return 'rescheduled';

            default:
                return '';
        }
    }
}