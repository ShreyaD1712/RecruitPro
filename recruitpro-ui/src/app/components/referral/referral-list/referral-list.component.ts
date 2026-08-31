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
import { ReferralService } from '../../../services/referral.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-referral-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatCardModule
    ],
    templateUrl: './referral-list.component.html'
})
export class ReferralListComponent implements OnInit {
    // ==================================================
    // REFERRALS
    // ==================================================
    referrals: any[] = [];

    // ==================================================
    // SEARCH
    // ==================================================
    search = '';

    // ==================================================
    // SORTING
    // ==================================================
    sortBy = 'ReferralDate';
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
        'ReferrerName',
        'ReferralDate',
        'Remarks'
    ];

    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private referralService: ReferralService,
        public authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    // ==================================================
    // ON INIT
    // ==================================================
    ngOnInit(): void {
        if (
            !this.authService.hasPermission(
                'VIEW_REFERRAL'
            )
        ) {
            return;
        }

        this.loadReferrals();
    }

    // ==================================================
    // LOAD REFERRALS
    // ==================================================
    loadReferrals(): void {
        this.loading = true;

        this.referralService
            .getReferrals(
                this.search,
                null,
                null,
                true,
                this.sortBy,
                this.order,
                this.page,
                this.pageSize
            )
            .subscribe({
                next: (response: any) => {
                    // ==================================================
                    // MAP API RESPONSE
                    // ==================================================
                    this.referrals =
                        (response.data || []).map(
                            (referral: any) => ({
                                ...referral,

                                // Applicant
                                ApplicantName:
                                    referral.ApplicantName ||
                                    (
                                        referral.applicant
                                            ? `${referral.applicant.FirstName || ''} ${referral.applicant.LastName || ''}`.trim()
                                            : '-'
                                    ),

                                // Job Opening
                                JobTitle:
                                    referral.JobTitle ||
                                    referral.application?.job_opening?.JobTitle ||
                                    '-',

                                // Referrer
                                ReferrerName:
                                    referral.ReferrerName ||
                                    (
                                        referral.referrer
                                            ? `${referral.referrer.FirstName || ''} ${referral.referrer.LastName || ''}`.trim()
                                            : '-'
                                    )
                            })
                        );

                    this.totalRecords =
                        response.total_records || 0;

                    this.loading = false;

                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    console.log(
                        'Error loading referrals:',
                        err
                    );

                    this.referrals = [];
                    this.totalRecords = 0;
                    this.loading = false;

                    alert(
                        err?.error?.detail ||
                        'Unable to load referrals.'
                    );

                    this.cdr.detectChanges();
                }
            });
    }

    // ==================================================
    // SEARCH
    // ==================================================
    searchReferrals(): void {
        this.page = 1;
        this.loadReferrals();
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

        this.loadReferrals();
    }

    // ==================================================
    // PREVIOUS PAGE
    // ==================================================
    previousPage(): void {
        if (this.page > 1) {
            this.page--;
            this.loadReferrals();
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
            this.loadReferrals();
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
}