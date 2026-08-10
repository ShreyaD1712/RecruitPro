import { Injectable } from '@angular/core';

import {
    HttpClient
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RolePermissionService {

    private apiUrl =
        'http://127.0.0.1:8000/role-permissions';

    constructor(
        private http: HttpClient
    ) { }

    // ==========================
    // Get Permissions By Role
    // ==========================

    getPermissions(
        roleId: number
    ): Observable<any> {

        return this.http.get(
            `${this.apiUrl}/${roleId}`
        );

    }

    // ==========================
    // Save Permissions
    // ==========================

    savePermissions(
        roleId: number,
        permissions: string[]
    ): Observable<any> {

        const data = {
            RoleId: roleId,
            Permissions: permissions
        };

        return this.http.post(
            `${this.apiUrl}/`,
            data
        );

    }

}