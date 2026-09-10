import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    // ==================================================
    // API URL
    // ==================================================
    private apiUrl =
        'http://127.0.0.1:8000/notifications';

    constructor(
        private http: HttpClient
    ) { }

    // ==================================================
    // GET ALL NOTIFICATIONS
    // ==================================================
    getNotifications(
        search: string = '',
        isRead: boolean | null = null,
        notificationType: string | null = null,
        sortBy: string = 'CreatedOn',
        order: string = 'desc',
        page: number = 1,
        pageSize: number = 10
    ): Observable<any> {

        let params = new HttpParams()
            .set('search', search)
            .set('sort_by', sortBy)
            .set('order', order)
            .set('page', page.toString())
            .set('page_size', pageSize.toString());

        // ==================================================
        // READ / UNREAD FILTER
        // ==================================================
        if (isRead !== null) {
            params = params.set(
                'is_read',
                isRead.toString()
            );
        }

        // ==================================================
        // NOTIFICATION TYPE FILTER
        // ==================================================
        if (
            notificationType &&
            notificationType !== 'All'
        ) {
            params = params.set(
                'notification_type',
                notificationType
            );
        }

        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }

    // ==================================================
    // GET UNREAD COUNT
    // ==================================================
    getUnreadCount(): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/unread-count`
        );
    }

    // ==================================================
    // GET NOTIFICATION BY ID
    // ==================================================
    getNotificationById(
        notificationId: number
    ): Observable<any> {

        return this.http.get<any>(
            `${this.apiUrl}/${notificationId}`
        );
    }

    // ==================================================
    // ADD NOTIFICATION
    // ==================================================
    addNotification(
        data: any
    ): Observable<any> {

        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }

    // ==================================================
    // MARK NOTIFICATION AS READ
    // ==================================================
    markAsRead(
        notificationId: number
    ): Observable<any> {

        return this.http.put<any>(
            `${this.apiUrl}/${notificationId}/read`,
            {}
        );
    }

    // ==================================================
    // MARK ALL NOTIFICATIONS AS READ
    // ==================================================
    markAllAsRead(): Observable<any> {

        return this.http.put<any>(
            `${this.apiUrl}/mark-all-read`,
            {}
        );
    }
}