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

import { OfferService } from '../../../services/offer.service';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-offer-add',
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
    templateUrl: './offer-add.component.html'
})
export class OfferAddComponent implements OnInit {

    offerForm!: FormGroup;

    isEditMode = false;
    offerId: number | null = null;

    applications: any[] = [];
    application: any = null;

    loading = false;
    loadingApplications = false;

    offerStatuses = [
        'Draft',
        'Sent',
        'Accepted',
        'Rejected',
        'Withdrawn'
    ];

    constructor(
        private fb: FormBuilder,
        private offerService: OfferService,
        private applicationService: ApplicationService,
        public authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

        if (id) {
            this.isEditMode = true;
            this.offerId = Number(id);
        }

        const permission = this.isEditMode
            ? 'UPDATE_OFFER'
            : 'CREATE_OFFER';

        if (!this.authService.hasPermission(permission)) {
            alert('You are not authorized to access this page.');
            this.router.navigate(['/offer']);
            return;
        }

        this.offerForm = this.fb.group({
            ApplicationId: [null, Validators.required],
            OfferedSalary: [null, Validators.min(0)],
            OfferDate: [null],
            JoiningDate: [null],
            OfferStatus: ['Draft', Validators.maxLength(50)],
            Remarks: ['', Validators.maxLength(500)]
        });

        if (this.isEditMode && this.offerId) {
            this.loadOffer();
        } else {
            this.loadApplications();
        }
    }

    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    // ==================================================
    // LOAD SELECTED APPLICATIONS WITHOUT OFFER
    // ==================================================
    loadApplications(): void {
        this.loadingApplications = true;

        this.applicationService.getApplications(
            '',
            null,
            null,
            'Selected',
            'AppliedDate',
            'desc',
            1,
            1000
        ).subscribe({
            next: (response: any) => {
                const selectedApplications = response.data || [];

                if (!selectedApplications.length) {
                    this.applications = [];
                    this.loadingApplications = false;
                    return;
                }

                this.applications = [];
                let completed = 0;

                selectedApplications.forEach((application: any) => {
                    this.offerService
                        .getOfferByApplication(application.ApplicationId)
                        .subscribe({
                            next: (offerResponse: any) => {
                                if (!offerResponse?.exists) {
                                    this.applications.push({
                                        ...application,
                                        ApplicantName: application.applicant
                                            ? `${application.applicant.FirstName || ''} ${application.applicant.LastName || ''}`.trim()
                                            : '-',
                                        JobTitle:
                                            application.job_opening?.JobTitle || '-',
                                        DepartmentName:
                                            application.job_opening?.department?.DepartmentName || '-'
                                    });
                                }

                                completed++;
                                if (completed === selectedApplications.length) {
                                    this.loadingApplications = false;
                                }
                            },
                            error: () => {
                                completed++;
                                if (completed === selectedApplications.length) {
                                    this.loadingApplications = false;
                                }
                            }
                        });
                });
            },
            error: (err: any) => {
                console.error('Error loading applications:', err);
                this.applications = [];
                this.loadingApplications = false;

                alert(
                    err?.error?.detail ||
                    'Unable to load selected applications.'
                );
            }
        });
    }

    // ==================================================
    // APPLICATION CHANGE
    // ==================================================
    applicationChanged(): void {
        const applicationId =
            this.offerForm.get('ApplicationId')?.value;

        this.application = this.applications.find(
            application =>
                application.ApplicationId === applicationId
        ) || null;
    }

    // ==================================================
    // LOAD OFFER
    // ==================================================
    loadOffer(): void {
        if (!this.offerId) return;

        this.loading = true;

        this.offerService.getOfferById(this.offerId)
            .subscribe({
                next: (response: any) => {
                    const offer = response?.data || response;

                    this.offerForm.patchValue({
                        ApplicationId: offer.ApplicationId,
                        OfferedSalary: offer.OfferedSalary,
                        OfferDate: offer.OfferDate || null,
                        JoiningDate: offer.JoiningDate || null,
                        OfferStatus: offer.OfferStatus || 'Draft',
                        Remarks: offer.Remarks || ''
                    });

                    this.offerForm.get('ApplicationId')?.disable();

                    this.loadApplicationDetails(
                        offer.ApplicationId
                    );

                    this.loading = false;
                },
                error: (err: any) => {
                    console.error('Error loading offer:', err);
                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to load offer.'
                    );

                    this.router.navigate(['/offer']);
                }
            });
    }

    // ==================================================
    // LOAD APPLICATION DETAILS FOR EDIT
    // ==================================================
    loadApplicationDetails(applicationId: number): void {
        this.applicationService
            .getApplicationById(applicationId)
            .subscribe({
                next: (response: any) => {
                    const application =
                        response?.data || response;

                    this.application = {
                        ...application,
                        ApplicantName: application.applicant
                            ? `${application.applicant.FirstName || ''} ${application.applicant.LastName || ''}`.trim()
                            : '-',
                        JobTitle:
                            application.job_opening?.JobTitle || '-',
                        DepartmentName:
                            application.job_opening?.department?.DepartmentName || '-'
                    };
                },
                error: (err: any) => {
                    console.error(
                        'Error loading application details:',
                        err
                    );
                }
            });
    }

    // ==================================================
    // SAVE OFFER
    // ==================================================
    saveOffer(): void {
        const permission = this.isEditMode
            ? 'UPDATE_OFFER'
            : 'CREATE_OFFER';

        if (!this.authService.hasPermission(permission)) {
            alert('You do not have permission to perform this action.');
            return;
        }

        if (this.offerForm.invalid) {
            this.offerForm.markAllAsTouched();
            return;
        }

        const formData = this.offerForm.getRawValue();

        if (
            formData.OfferDate &&
            formData.JoiningDate &&
            new Date(formData.JoiningDate) <
            new Date(formData.OfferDate)
        ) {
            alert('Joining Date cannot be before Offer Date.');
            return;
        }

        const data = {
            ApplicationId: formData.ApplicationId,
            OfferedSalary:
                formData.OfferedSalary !== null &&
                    formData.OfferedSalary !== ''
                    ? Number(formData.OfferedSalary)
                    : null,
            OfferDate:
                this.formatDate(formData.OfferDate),
            JoiningDate:
                this.formatDate(formData.JoiningDate),
            OfferStatus:
                formData.OfferStatus || null,
            Remarks:
                formData.Remarks || null
        };

        this.loading = true;

        if (this.isEditMode && this.offerId) {
            this.updateOffer(data);
        } else {
            this.createOffer(data);
        }
    }

    // ==================================================
    // CREATE OFFER
    // ==================================================
    createOffer(data: any): void {
        this.offerService.addOffer(data)
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert('Offer Added Successfully');
                    this.router.navigate(['/offer']);
                },
                error: (err: any) => {
                    console.error('Error adding offer:', err);
                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to add offer.'
                    );
                }
            });
    }

    // ==================================================
    // UPDATE OFFER
    // ==================================================
    updateOffer(data: any): void {
        if (!this.offerId) return;

        this.offerService
            .updateOffer(
                this.offerId,
                data
            )
            .subscribe({
                next: () => {
                    this.loading = false;
                    alert('Offer Updated Successfully');
                    this.router.navigate(['/offer']);
                },
                error: (err: any) => {
                    console.error('Error updating offer:', err);
                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to update offer.'
                    );
                }
            });
    }

    // ==================================================
    // FORMAT DATE
    // ==================================================
    formatDate(value: any): string | null {
        if (!value) return null;

        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(
            date.getMonth() + 1
        ).padStart(2, '0');
        const day = String(
            date.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/offer']);
    }
}