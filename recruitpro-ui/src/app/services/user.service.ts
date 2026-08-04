import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://127.0.0.1:8000/users';
    constructor(
        private http: HttpClient
    ) { }
    // ==========================
    // Get All Users
    // ==========================
    getUsers(
        search: string = '',
        companyId: number | null = null,
        sortBy: string = 'FirstName',
        order: string = 'asc',
        page: number = 1,
        pageSize: number = 10
    ): Observable<any> {
        let params = new HttpParams()
            .set('search', search)
            .set('sort_by', sortBy)
            .set('order', order)
            .set('page', page)
            .set('page_size', pageSize);
        if (companyId !== null) {
            params = params.set(
                'company_id',
                companyId
            );
        }
        return this.http.get<any>(
            `${this.apiUrl}/`,
            { params }
        );
    }
    // ==========================
    // Get User By Id
    // ==========================
    getUserById(
        id: number
    ): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${id}`
        );
    }
    // ==========================
    // Add User
    // ==========================
    addUser(
        data: any
    ): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        );
    }
    // ==========================
    // Update User
    // ==========================
    updateUser(
        id: number,
        data: any
    ): Observable<any> {
        return this.http.put<any>(
            `${this.apiUrl}/${id}`,
            data
        );
    }
    // ==========================
    // Change Password
    // ==========================
    changePassword(
        id: number,
        password: string
    ): Observable<any> {
        return this.http.put<any>(
            `${this.apiUrl}/change-password/${id}`,
            {
                Password: password
            }
        );
    }
    // ==========================
    // Delete User
    // ==========================
    deleteUser(
        id: number
    ): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${id}`
        );
    }
}