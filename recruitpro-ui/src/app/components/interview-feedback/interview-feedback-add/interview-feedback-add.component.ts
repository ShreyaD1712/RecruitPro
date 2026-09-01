import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule
} from '@angular/forms';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { InterviewFeedbackService } from '../../../services/interview-feedback.service';
import { InterviewService } from '../../../services/interview.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-interview-feedback-add',
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
    templateUrl: './interview-feedback-add.component.html'
})
export class InterviewFeedbackAddComponent implements OnInit {
    // ==================================================
    // FORM
    // ==================================================
    feedbackForm!: FormGroup;

    // ==================================================
    // MODE
    // ==================================================
    isEditMode = false;
    feedbackId: number | null = null;
    interviewId: number | null = null;

    // ==================================================
    // LOADING
    // ==================================================
    loading = false;

    // ==================================================
    // RATINGS
    // ==================================================
    ratings = [
        1,
        2,
        3,
        4,
        5
    ];

    // ==================================================
    // RECOMMENDATIONS
    // ==================================================
    recommendations = [
        'Next Round',
        'Selected',
        'Rejected',
        'On Hold'
    ];

    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private fb: FormBuilder,
        private interviewFeedbackService: InterviewFeedbackService,
        private interviewService: InterviewService,
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

        const interviewId =
            this.route.snapshot.queryParamMap.get(
                'interviewId'
            );

        if (id) {
            this.isEditMode = true;
            this.feedbackId = Number(id);
        }

        if (interviewId) {
            this.interviewId =
                Number(interviewId);
        }

        // ==================================================
        // PERMISSION CHECK
        // ==================================================
        if (
            !this.isEditMode &&
            !this.authService.hasPermission(
                'CREATE_INTERVIEW_FEEDBACK'
            )
        ) {
            alert(
                'You are not authorized to add interview feedback.'
            );

            this.router.navigate([
                '/interview'
            ]);

            return;
        }

        if (
            this.isEditMode &&
            !this.authService.hasPermission(
                'UPDATE_INTERVIEW_FEEDBACK'
            )
        ) {
            alert(
                'You are not authorized to update interview feedback.'
            );

            this.router.navigate([
                '/interview'
            ]);

            return;
        }

        // ==================================================
        // FORM
        // ==================================================
        this.feedbackForm = this.fb.group({
            InterviewId: [
                null,
                Validators.required
            ],
            Rating: [
                null,
                [
                    Validators.min(1),
                    Validators.max(5)
                ]
            ],
            Strengths: [
                ''
            ],
            Weaknesses: [
                ''
            ],
            Recommendation: [
                null
            ],
            Comments: [
                ''
            ]
        });

        // ==================================================
        // EDIT MODE
        // ==================================================
        if (
            this.isEditMode &&
            this.feedbackId
        ) {
            this.loadFeedback();
            return;
        }

        // ==================================================
        // ADD MODE
        // ==================================================
        if (this.interviewId) {
            this.feedbackForm.patchValue({
                InterviewId:
                    this.interviewId
            });

            this.validateInterview(
                this.interviewId
            );
        } else {
            alert(
                'Interview information not found.'
            );

            this.router.navigate([
                '/interview'
            ]);
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
    // VALIDATE INTERVIEW
    // ==================================================
    validateInterview(
        interviewId: number
    ): void {
        this.interviewService
            .getInterviewById(
                interviewId
            )
            .subscribe({
                next: (response: any) => {
                    if (
                        response.Status !==
                        'Completed'
                    ) {
                        alert(
                            'Feedback can only be added for a completed interview.'
                        );

                        this.router.navigate([
                            '/interview'
                        ]);
                    }
                },
                error: (err: any) => {
                    console.log(
                        'Error validating interview:',
                        err
                    );

                    alert(
                        err?.error?.detail ||
                        'Unable to validate interview.'
                    );

                    this.router.navigate([
                        '/interview'
                    ]);
                }
            });
    }

    // ==================================================
    // LOAD FEEDBACK
    // ==================================================
    loadFeedback(): void {
        if (!this.feedbackId) {
            return;
        }

        this.loading = true;

        this.interviewFeedbackService
            .getFeedbackById(
                this.feedbackId
            )
            .subscribe({
                next: (response: any) => {
                    console.log(
                        'Feedback Edit Response:',
                        response
                    );

                    this.interviewId =
                        response.InterviewId;

                    this.feedbackForm.patchValue({
                        InterviewId:
                            response.InterviewId,
                        Rating:
                            response.Rating,
                        Strengths:
                            response.Strengths || '',
                        Weaknesses:
                            response.Weaknesses || '',
                        Recommendation:
                            response.Recommendation || null,
                        Comments:
                            response.Comments || ''
                    });

                    this.loading = false;

                    this.validateInterview(
                        response.InterviewId
                    );
                },
                error: (err: any) => {
                    console.log(
                        'Error loading feedback:',
                        err
                    );

                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to load interview feedback.'
                    );

                    this.router.navigate([
                        '/interview'
                    ]);
                }
            });
    }

    // ==================================================
    // SAVE FEEDBACK
    // ==================================================
    saveFeedback(): void {
        const requiredPermission =
            this.isEditMode
                ? 'UPDATE_INTERVIEW_FEEDBACK'
                : 'CREATE_INTERVIEW_FEEDBACK';

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

        if (
            this.feedbackForm.invalid
        ) {
            this.feedbackForm
                .markAllAsTouched();

            return;
        }

        const formData =
            this.feedbackForm
                .getRawValue();

        const data = {
            InterviewId:
                formData.InterviewId,
            Rating:
                formData.Rating,
            Strengths:
                formData.Strengths || null,
            Weaknesses:
                formData.Weaknesses || null,
            Recommendation:
                formData.Recommendation || null,
            Comments:
                formData.Comments || null
        };

        console.log(
            'Feedback Data:',
            data
        );

        this.loading = true;

        if (
            this.isEditMode &&
            this.feedbackId
        ) {
            this.updateFeedback(
                data
            );
        } else {
            this.createFeedback(
                data
            );
        }
    }

    // ==================================================
    // CREATE FEEDBACK
    // ==================================================
    createFeedback(
        data: any
    ): void {
        this.interviewFeedbackService
            .addFeedback(
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;

                    alert(
                        'Interview Feedback Added Successfully'
                    );

                    this.router.navigate([
                        '/interview'
                    ]);
                },
                error: (err: any) => {
                    console.log(
                        'Error adding feedback:',
                        err
                    );

                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to add interview feedback.'
                    );
                }
            });
    }

    // ==================================================
    // UPDATE FEEDBACK
    // ==================================================
    updateFeedback(
        data: any
    ): void {
        if (!this.feedbackId) {
            return;
        }

        this.interviewFeedbackService
            .updateFeedback(
                this.feedbackId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;

                    alert(
                        'Interview Feedback Updated Successfully'
                    );

                    this.router.navigate([
                        '/interview'
                    ]);
                },
                error: (err: any) => {
                    console.log(
                        'Error updating feedback:',
                        err
                    );

                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to update interview feedback.'
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