import {
    Component,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { InterviewFeedbackService } from '../../../services/interview-feedback.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-interview-feedback-list',
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
    templateUrl: './interview-feedback-list.component.html'
})
export class InterviewFeedbackListComponent implements OnInit {
    // ==================================================
    // FEEDBACKS
    // ==================================================
    feedbacks: any[] = [];

    // ==================================================
    // SEARCH
    // ==================================================
    search = '';

    // ==================================================
    // FILTER
    // ==================================================
    selectedRecommendation = 'All';

    recommendations = [
        'All',
        'Next Round',
        'Selected',
        'Rejected',
        'On Hold'
    ];

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
    Math = Math;

    // ==================================================
    // LOADING
    // ==================================================
    loading = false;

    // ==================================================
    // VIEW FEEDBACK POPUP
    // ==================================================
    selectedFeedback: any = null;
    showFeedbackPopup = false;

    // ==================================================
    // TABLE COLUMNS
    // ==================================================
    displayedColumns = [
        'ApplicantName',
        'JobTitle',
        'InterviewRoundName',
        'InterviewerName',
        'Rating',
        'Recommendation',
        'CreatedOn',
        'Actions'
    ];

    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private interviewFeedbackService: InterviewFeedbackService,
        public authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    // ==================================================
    // ON INIT
    // ==================================================
    ngOnInit(): void {
        this.loadFeedbacks();
    }

    // ==================================================
    // LOAD FEEDBACKS
    // ==================================================
    loadFeedbacks(): void {
        this.loading = true;

        this.interviewFeedbackService
            .getFeedbacks(
                this.search,
                null,
                this.selectedRecommendation,
                this.sortBy,
                this.order,
                this.page,
                this.pageSize
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'Interview Feedback Response:',
                        response
                    );

                    this.feedbacks =
                        (response.data || []).map(
                            (feedback: any) => {
                                const applicant =
                                    feedback.interview
                                        ?.application
                                        ?.applicant;

                                const interviewer =
                                    feedback.interview
                                        ?.interviewer;

                                return {
                                    ...feedback,

                                    // ==================================================
                                    // APPLICANT
                                    // ==================================================
                                    ApplicantName:
                                        feedback.ApplicantName ||
                                        (
                                            applicant
                                                ? `${applicant.FirstName || ''} ${applicant.LastName || ''}`.trim()
                                                : '-'
                                        ),

                                    // ==================================================
                                    // JOB OPENING
                                    // ==================================================
                                    JobTitle:
                                        feedback.JobTitle ||
                                        feedback.interview
                                            ?.application
                                            ?.job_opening
                                            ?.JobTitle ||
                                        '-',

                                    // ==================================================
                                    // INTERVIEW ROUND
                                    // ==================================================
                                    InterviewRoundName:
                                        feedback.InterviewRoundName ||
                                        feedback.interview
                                            ?.interview_round
                                            ?.RoundName ||
                                        '-',

                                    // ==================================================
                                    // INTERVIEWER
                                    // ==================================================
                                    InterviewerName:
                                        feedback.InterviewerName ||
                                        (
                                            interviewer
                                                ? `${interviewer.FirstName || ''} ${interviewer.LastName || ''}`.trim()
                                                : '-'
                                        )
                                };
                            }
                        );

                    this.totalRecords =
                        response.total_records || 0;

                    this.loading = false;

                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.log(
                        'Error loading interview feedbacks:',
                        err
                    );

                    this.feedbacks = [];
                    this.totalRecords = 0;
                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to load interview feedback.'
                    );

                    this.cdr.detectChanges();
                }
            });
    }

    // ==================================================
    // SEARCH
    // ==================================================
    searchFeedbacks(): void {
        this.page = 1;
        this.loadFeedbacks();
    }

    // ==================================================
    // RECOMMENDATION FILTER CHANGE
    // ==================================================
    onRecommendationChange(): void {
        this.page = 1;
        this.loadFeedbacks();
    }

    // ==================================================
    // SORT
    // ==================================================
    sort(
        column: string
    ): void {
        if (
            this.sortBy === column
        ) {
            this.order =
                this.order === 'asc'
                    ? 'desc'
                    : 'asc';
        } else {
            this.sortBy = column;
            this.order = 'asc';
        }

        this.page = 1;

        this.loadFeedbacks();
    }

    // ==================================================
    // VIEW FEEDBACK
    // ==================================================
    viewFeedback(
        feedback: any,
        event?: Event
    ): void {
        if (event) {
            event.stopPropagation();
        }

        if (
            !this.authService.hasPermission(
                'VIEW_INTERVIEW_FEEDBACK'
            )
        ) {
            alert(
                'You are not authorized to view interview feedback.'
            );

            return;
        }

        this.selectedFeedback =
            feedback;

        this.showFeedbackPopup =
            true;
    }

    // ==================================================
    // CLOSE FEEDBACK POPUP
    // ==================================================
    closeFeedbackPopup(): void {
        this.showFeedbackPopup =
            false;

        this.selectedFeedback =
            null;
    }

    // ==================================================
    // PREVIOUS PAGE
    // ==================================================
    previousPage(): void {
        if (
            this.page > 1
        ) {
            this.page--;

            this.loadFeedbacks();
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

            this.loadFeedbacks();
        }
    }

    // ==================================================
    // START RECORD
    // ==================================================
    getStartRecord(): number {
        if (
            this.totalRecords === 0
        ) {
            return 0;
        }

        return (
            (this.page - 1) *
            this.pageSize
        ) + 1;
    }

    // ==================================================
    // END RECORD
    // ==================================================
    getEndRecord(): number {
        return Math.min(
            this.page * this.pageSize,
            this.totalRecords
        );
    }
}