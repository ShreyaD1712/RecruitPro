import {
    Component,
    OnInit,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-notification-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule
    ],
    templateUrl: './notification-list.component.html',
})
export class NotificationListComponent implements OnInit {

    notifications: any[] = [];

    search = '';

    selectedReadStatus = 'All';

    selectedNotificationType = 'All';

    notificationTypes: string[] = [
        'All',
        'Interview',
        'Application',
        'Offer',
        'Referral'
    ];

    page = 1;
    pageSize = 10;

    totalRecords = 0;
    totalPages = 1;

    loading = false;

    constructor(
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef
    ) { }

    // ==================================================
    // INIT
    // ==================================================
    ngOnInit(): void {
        this.loadNotifications();
    }

    // ==================================================
    // LOAD NOTIFICATIONS
    // ==================================================
    loadNotifications(): void {

        this.loading = true;

        this.cdr.detectChanges();

        let isRead: boolean | null = null;

        if (this.selectedReadStatus === 'Unread') {
            isRead = false;
        }

        if (this.selectedReadStatus === 'Read') {
            isRead = true;
        }

        const notificationType =
            this.selectedNotificationType === 'All'
                ? null
                : this.selectedNotificationType;

        this.notificationService
            .getNotifications(
                this.search,
                isRead,
                notificationType,
                'CreatedOn',
                'desc',
                this.page,
                this.pageSize
            )
            .subscribe({

                next: (response) => {

                    this.notifications =
                        response?.data || [];

                    this.totalRecords =
                        response?.total_records || 0;

                    this.page =
                        response?.page || 1;

                    this.pageSize =
                        response?.page_size || 10;

                    this.totalPages = Math.max(
                        1,
                        Math.ceil(
                            this.totalRecords / this.pageSize
                        )
                    );

                    this.loading = false;

                    this.cdr.detectChanges();
                },

                error: (error) => {

                    console.error(
                        'Error loading notifications:',
                        error
                    );

                    this.notifications = [];
                    this.totalRecords = 0;
                    this.totalPages = 1;
                    this.loading = false;

                    this.cdr.detectChanges();
                }
            });
    }

    // ==================================================
    // SEARCH
    // ==================================================
    onSearch(): void {

        this.page = 1;

        this.loadNotifications();
    }

    // ==================================================
    // FILTER CHANGE
    // ==================================================
    onFilterChange(): void {

        this.page = 1;

        this.loadNotifications();
    }

    // ==================================================
    // CLEAR SEARCH
    // ==================================================
    clearSearch(): void {

        this.search = '';

        this.page = 1;

        this.loadNotifications();
    }

    // ==================================================
    // MARK ONE AS READ
    // ==================================================
    markAsRead(
        notification: any
    ): void {

        if (notification.IsRead) {
            return;
        }

        this.notificationService
            .markAsRead(
                notification.NotificationId
            )
            .subscribe({

                next: () => {

                    notification.IsRead = true;

                    if (
                        this.selectedReadStatus === 'Unread'
                    ) {
                        this.loadNotifications();
                    } else {
                        this.cdr.detectChanges();
                    }
                },

                error: (error) => {

                    console.error(
                        'Error marking notification as read:',
                        error
                    );
                }
            });
    }

    // ==================================================
    // MARK ALL AS READ
    // ==================================================
    markAllAsRead(): void {

        this.notificationService
            .markAllAsRead()
            .subscribe({

                next: () => {

                    this.page = 1;

                    this.loadNotifications();
                },

                error: (error) => {

                    console.error(
                        'Error marking all notifications as read:',
                        error
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

            this.loadNotifications();
        }
    }

    // ==================================================
    // NEXT PAGE
    // ==================================================
    nextPage(): void {

        if (this.page < this.totalPages) {

            this.page++;

            this.loadNotifications();
        }
    }

    // ==================================================
    // CHECK UNREAD
    // ==================================================
    hasUnreadNotifications(): boolean {

        return this.notifications.some(
            notification =>
                notification.IsRead === false
        );
    }
}