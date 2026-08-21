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
import { ApplicantService } from '../../../services/applicant.service';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-applicant-list',
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
        MatTooltipModule
    ],
    templateUrl: './applicant-list.component.html',
})
export class ApplicantListComponent implements OnInit {
    // ==================================================
    // APPLICANTS
    // ==================================================
    applicants: any[] = [];
    // ==================================================
    // SELECTED APPLICANT
    // Used for custom popup
    // ==================================================
    selectedApplicant: any = null;
    showApplicantPopup = false;
    // ==================================================
    // SEARCH
    // ==================================================
    search = '';
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
    // TABLE COLUMNS
    // ==================================================
    displayedColumns = [
        'Name',
        'Email',
        'MobileNo',
        'CurrentCompany',
        'CurrentCity',
        'ExpectedCTC',
        'NoticePeriod',
        'Actions'
    ];
    // ==================================================
    // CONSTRUCTOR
    // ==================================================
    constructor(
        private applicantService: ApplicantService,
        public authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }
    // ==================================================
    // ON INIT
    // ==================================================
    ngOnInit(): void {
        this.loadApplicants();
    }
    // ==================================================
    // LOAD APPLICANTS
    // ==================================================
    loadApplicants(): void {
        this.loading = true;
        this.applicantService
            .getApplicants(
                this.search,
                this.sortBy,
                this.order,
                this.page,
                this.pageSize
            )
            .subscribe({
                next: (response: any) => {
                    this.applicants =
                        response.data || [];
                    this.totalRecords =
                        response.total_records || 0;
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.log(
                        'Error loading applicants:',
                        err
                    );
                    this.applicants = [];
                    this.totalRecords = 0;
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
    }
    // ==================================================
    // SEARCH
    // ==================================================
    searchApplicants(): void {
        this.page = 1;
        this.loadApplicants();
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
        this.loadApplicants();
    }
    // ==================================================
    // OPEN APPLICANT POPUP
    // ==================================================
    openApplicantPopup(
        applicant: any,
        event?: Event
    ): void {
        // Prevent any row click
        // from affecting the popup
        if (event) {
            event.stopPropagation();
        }
        this.selectedApplicant = applicant;
        this.showApplicantPopup = true;
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    }
    // ==================================================
    // CLOSE APPLICANT POPUP
    // ==================================================
    closeApplicantPopup(): void {
        this.selectedApplicant = null;
        this.showApplicantPopup = false;
        // Restore scrolling
        document.body.style.overflow = '';
    }
    // ==================================================
    // CLOSE POPUP WHEN CLICKING BACKDROP
    // ==================================================
    closePopupOnBackdrop(
        event: MouseEvent
    ): void {
        if (
            event.target === event.currentTarget
        ) {
            this.closeApplicantPopup();
        }
    }
    // ==================================================
    // ADD APPLICANT
    // ==================================================
    addApplicant(): void {
        if (!this.authService.hasPermission('CREATE_APPLICANT')) {
            alert('You are not authorized to create applicants.')
            return;
        }
        this.router.navigate([
            '/applicant/add'
        ]);
    }
    // ==================================================
    // EDIT APPLICANT
    // ==================================================
    editApplicant(
        id: number,
        event?: Event
    ): void {
        // Prevent popup
        if (event) {
            event.stopPropagation();
        }
        this.router.navigate([
            '/applicant/edit',
            id
        ]);
    }
    // ==================================================
    // DELETE APPLICANT
    // ==================================================
    deleteApplicant(
        id: number,
        event?: Event
    ): void {
        // Prevent popup
        if (event) {
            event.stopPropagation();
        }
        if (
            !confirm(
                'Delete this Applicant?'
            )
        ) {
            return;
        }
        this.applicantService
            .deleteApplicant(id)
            .subscribe({
                next: () => {
                    alert(
                        'Applicant Deleted Successfully'
                    );
                    // If last record of page
                    // was deleted
                    if (
                        this.applicants.length === 1 &&
                        this.page > 1
                    ) {
                        this.page--;
                    }
                    this.loadApplicants();
                },
                error: (err) => {
                    console.log(
                        'Error deleting applicant:',
                        err
                    );
                    alert(
                        err.error?.detail ||
                        'Unable to delete applicant'
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
            this.loadApplicants();
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
            this.loadApplicants();
        }
    }
}