import {
    Component,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

import { OfferService } from '../../../services/offer.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-offer-list',
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
    templateUrl: './offer-list.component.html'
})
export class OfferListComponent implements OnInit {

    offers: any[] = [];

    search = '';
    selectedOfferStatus = 'All';

    offerStatuses = [
        'All',
        'Draft',
        'Sent',
        'Accepted',
        'Rejected',
        'Withdrawn'
    ];

    sortBy = 'CreatedOn';
    order = 'desc';

    page = 1;
    pageSize = 10;
    totalRecords = 0;
    Math = Math;

    loading = false;

    selectedOffer: any = null;
    showOfferPopup = false;

    displayedColumns = [
        'ApplicantName',
        'JobTitle',
        'DepartmentName',
        'OfferedSalary',
        'OfferDate',
        'JoiningDate',
        'OfferStatus',
        'Actions'
    ];

    constructor(
        private offerService: OfferService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadOffers();
    }

    // ==================================================
    // LOAD OFFERS
    // ==================================================
    loadOffers(): void {
        this.loading = true;

        this.offerService.getOffers(
            this.search,
            null,
            null,
            null,
            this.selectedOfferStatus,
            this.sortBy,
            this.order,
            this.page,
            this.pageSize
        ).subscribe({
            next: (response: any) => {
                console.log('Offer Response:', response);

                this.offers = (response.data || []).map((offer: any) => {
                    const applicant = offer.application?.applicant;
                    const jobOpening = offer.application?.job_opening;

                    return {
                        ...offer,

                        ApplicantName:
                            offer.ApplicantName ||
                            (
                                applicant
                                    ? `${applicant.FirstName || ''} ${applicant.LastName || ''}`.trim()
                                    : '-'
                            ),

                        JobTitle:
                            offer.JobTitle ||
                            jobOpening?.JobTitle ||
                            '-',

                        DepartmentName:
                            offer.DepartmentName ||
                            jobOpening?.department?.DepartmentName ||
                            '-',

                        DesignationName:
                            offer.DesignationName ||
                            jobOpening?.designation?.DesignationName ||
                            '-',

                        ApplicationStatus:
                            offer.ApplicationStatus ||
                            offer.application?.CurrentStatus ||
                            '-'
                    };
                });

                this.totalRecords = response.total_records || 0;
                this.loading = false;

                this.cdr.detectChanges();
            },

            error: (err: any) => {
                console.error('Error loading offers:', err);

                this.offers = [];
                this.totalRecords = 0;
                this.loading = false;

                alert(
                    err?.error?.detail ||
                    'Unable to load offers.'
                );

                this.cdr.detectChanges();
            }
        });
    }

    // ==================================================
    // SEARCH
    // ==================================================
    searchOffers(): void {
        this.page = 1;
        this.loadOffers();
    }

    // ==================================================
    // STATUS FILTER
    // ==================================================
    onOfferStatusChange(): void {
        this.page = 1;
        this.loadOffers();
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
        } else {
            this.sortBy = column;
            this.order = 'asc';
        }

        this.page = 1;
        this.loadOffers();
    }

    // ==================================================
    // ADD OFFER
    // ==================================================
    addOffer(): void {
        if (!this.authService.hasPermission('CREATE_OFFER')) {
            alert('You do not have permission to create offers.');
            return;
        }

        this.router.navigate([
            '/offer/add'
        ]);
    }

    // ==================================================
    // VIEW OFFER
    // ==================================================
    viewOffer(
        offer: any,
        event?: Event
    ): void {
        event?.stopPropagation();

        if (!this.authService.hasPermission('VIEW_OFFER')) {
            alert('You are not authorized to view offers.');
            return;
        }

        this.selectedOffer = offer;
        this.showOfferPopup = true;
    }

    // ==================================================
    // CLOSE POPUP
    // ==================================================
    closeOfferPopup(): void {
        this.showOfferPopup = false;
        this.selectedOffer = null;
    }

    // ==================================================
    // EDIT OFFER
    // ==================================================
    editOffer(
        offer: any,
        event?: Event
    ): void {
        event?.stopPropagation();

        if (!this.authService.hasPermission('UPDATE_OFFER')) {
            alert('You do not have permission to update offers.');
            return;
        }

        this.router.navigate([
            '/offer/edit',
            offer.OfferId
        ]);
    }

    // ==================================================
    // DELETE OFFER
    // ==================================================
    deleteOffer(
        offer: any,
        event?: Event
    ): void {
        event?.stopPropagation();

        if (!this.authService.hasPermission('DELETE_OFFER')) {
            alert('You do not have permission to delete offers.');
            return;
        }

        if (
            !confirm(
                `Delete offer for ${offer.ApplicantName || 'this applicant'}?`
            )
        ) {
            return;
        }

        this.offerService
            .deleteOffer(offer.OfferId)
            .subscribe({
                next: () => {
                    alert('Offer deleted successfully.');

                    if (
                        this.offers.length === 1 &&
                        this.page > 1
                    ) {
                        this.page--;
                    }

                    this.loadOffers();
                },

                error: (err: any) => {
                    console.error('Error deleting offer:', err);

                    alert(
                        err?.error?.detail ||
                        'Unable to delete offer.'
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
            this.loadOffers();
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
            this.loadOffers();
        }
    }

    // ==================================================
    // START RECORD
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