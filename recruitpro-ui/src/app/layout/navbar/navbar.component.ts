import {
  Component,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ProfileService } from '../../services/profile.service';
import { NotificationService } from '../../services/notification.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  profileImage = '';
  userName = '';

  unreadCount = 0;
  notifications: any[] = [];

  showNotifications = false;
  notificationLoading = false;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {

    const token = localStorage.getItem('token');

    if (token) {
      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      this.userName = payload.sub;
    }

    this.profileService.profileImage$
      .subscribe(image => {

        this.profileImage = image;

        this.cdr.detectChanges();
      });

    this.loadUnreadCount();
  }

  // ==================================================
  // PROFILE
  // ==================================================
  openProfile(): void {

    this.showNotifications = false;

    this.router.navigate(['/profile']);
  }

  // ==================================================
  // LOAD UNREAD COUNT
  // ==================================================
  loadUnreadCount(): void {

    this.notificationService
      .getUnreadCount()
      .subscribe({

        next: (response) => {

          this.unreadCount =
            response?.unread_count || 0;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading unread notification count:',
            error
          );

          this.cdr.detectChanges();
        }
      });
  }

  // ==================================================
  // TOGGLE NOTIFICATIONS
  // ==================================================
  toggleNotifications(): void {

    this.showNotifications =
      !this.showNotifications;

    if (this.showNotifications) {
      this.loadLatestNotifications();
    }

    this.cdr.detectChanges();
  }

  // ==================================================
  // LOAD LATEST NOTIFICATIONS
  // ==================================================
  loadLatestNotifications(): void {

    this.notificationLoading = true;

    this.cdr.detectChanges();

    this.notificationService
      .getNotifications(
        '',
        null,
        null,
        'CreatedOn',
        'desc',
        1,
        5
      )
      .subscribe({

        next: (response) => {

          this.notifications =
            response?.data || [];

          this.notificationLoading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error loading notifications:',
            error
          );

          this.notifications = [];

          this.notificationLoading = false;

          this.cdr.detectChanges();
        }
      });
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

          if (this.unreadCount > 0) {
            this.unreadCount--;
          }

          this.cdr.detectChanges();
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
  markAllAsRead(
    event?: Event
  ): void {

    if (event) {
      event.stopPropagation();
    }

    if (this.unreadCount === 0) {
      return;
    }

    this.notificationService
      .markAllAsRead()
      .subscribe({

        next: () => {

          this.notifications.forEach(
            notification => {
              notification.IsRead = true;
            }
          );

          this.unreadCount = 0;

          this.cdr.detectChanges();
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
  // VIEW ALL
  // ==================================================
  viewAllNotifications(
    event?: Event
  ): void {

    if (event) {
      event.stopPropagation();
    }

    this.showNotifications = false;

    this.cdr.detectChanges();

    this.router.navigate(
      ['/notifications']
    );
  }
}