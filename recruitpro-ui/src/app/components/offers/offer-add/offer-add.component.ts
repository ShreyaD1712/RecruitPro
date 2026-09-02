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
    applicationId: number | null = null;

    application: any = null;

    loading = false;

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
        const applicationId =
            this.route.snapshot.queryParamMap.get('applicationId');

        if (id) {
            this.isEditMode = true;
            this.offerId = Number(id);
        }

        if (applicationId) {
            this.applicationId = Number(applicationId);
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
            return;
        }

        if (this.applicationId) {
            this.offerForm.patchValue({
                ApplicationId: this.applicationId
            });

            this.validateApplication(this.applicationId);
        } else {
            alert('Application information not found.');
            this.router.navigate(['/application']);
        }
    }

    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    // ==================================================
    // VALIDATE APPLICATION
    // ==================================================
    validateApplication(applicationId: number): void {
        this.applicationService
            .getApplicationById(applicationId)
            .subscribe({
                next: (response: any) => {
                    this.application = response?.data || response;

                    if (this.application.CurrentStatus !== 'Selected') {
                        alert(
                            'Offer can only be created for a selected application.'
                        );

                        this.router.navigate(['/application']);
                        return;
                    }

                    if (!this.isEditMode) {
                        this.checkExistingOffer(applicationId);
                    }
                },

                error: (err: any) => {
                    console.error(
                        'Error validating application:',
                        err
                    );

                    alert(
                        err?.error?.detail ||
                        'Unable to validate application.'
                    );

                    this.router.navigate(['/application']);
                }
            });
    }

    // ==================================================
    // CHECK EXISTING OFFER
    // ==================================================
    checkExistingOffer(applicationId: number): void {
        this.offerService
            .getOfferByApplication(applicationId)
            .subscribe({
                next: (response: any) => {
                    if (response?.exists) {
                        alert(
                            'Offer already exists for this application.'
                        );

                        this.router.navigate([
                            '/offer/edit',
                            response.offer.OfferId
                        ]);
                    }
                },

                error: (err: any) => {
                    console.error(
                        'Error checking existing offer:',
                        err
                    );
                }
            });
    }

    // ==================================================
    // LOAD OFFER
    // ==================================================
    loadOffer(): void {
        if (!this.offerId) return;

        this.loading = true;

        this.offerService
            .getOfferById(this.offerId)
            .subscribe({
                next: (response: any) => {
                    const offer = response?.data || response;

                    this.applicationId =
                        offer.ApplicationId;

                    this.application =
                        offer.application || null;

                    this.offerForm.patchValue({
                        ApplicationId:
                            offer.ApplicationId,
                        OfferedSalary:
                            offer.OfferedSalary,
                        OfferDate:
                            offer.OfferDate || null,
                        JoiningDate:
                            offer.JoiningDate || null,
                        OfferStatus:
                            offer.OfferStatus || 'Draft',
                        Remarks:
                            offer.Remarks || ''
                    });

                    this.offerForm
                        .get('ApplicationId')
                        ?.disable();

                    this.loading = false;
                },

                error: (err: any) => {
                    console.error(
                        'Error loading offer:',
                        err
                    );

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
    // SAVE OFFER
    // ==================================================
    saveOffer(): void {
        const permission = this.isEditMode
            ? 'UPDATE_OFFER'
            : 'CREATE_OFFER';

        if (!this.authService.hasPermission(permission)) {
            alert(
                'You do not have permission to perform this action.'
            );
            return;
        }

        if (this.offerForm.invalid) {
            this.offerForm.markAllAsTouched();
            return;
        }

        const formData =
            this.offerForm.getRawValue();

        if (
            formData.OfferDate &&
            formData.JoiningDate &&
            new Date(formData.JoiningDate) <
            new Date(formData.OfferDate)
        ) {
            alert(
                'Joining Date cannot be before Offer Date.'
            );
            return;
        }

        const data = {
            ApplicationId:
                formData.ApplicationId,
            OfferedSalary:
                formData.OfferedSalary !== '' &&
                    formData.OfferedSalary !== null
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

        console.log('Offer Data:', data);

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
        this.offerService
            .addOffer(data)
            .subscribe({
                next: () => {
                    this.loading = false;

                    alert(
                        'Offer Added Successfully'
                    );

                    this.router.navigate(['/offer']);
                },

                error: (err: any) => {
                    console.error(
                        'Error adding offer:',
                        err
                    );

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

                    alert(
                        'Offer Updated Successfully'
                    );

                    this.router.navigate(['/offer']);
                },

                error: (err: any) => {
                    console.error(
                        'Error updating offer:',
                        err
                    );

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
        if (!value) {
            return null;
        }

        const date = new Date(value);

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

        return `${year}-${month}-${day}`;
    }

    // ==================================================
    // CANCEL
    // ==================================================
    cancel(): void {
        this.router.navigate(['/offer']);
    }
}