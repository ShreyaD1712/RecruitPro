import { Injectable } from '@angular/core';

import {
    HttpClient
} from '@angular/common/http';

import {
    Observable,
    catchError,
    throwError,
    tap
} from 'rxjs';

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

        return this.http.get<any>(
            `${this.apiUrl}/${roleId}`
        ).pipe(

            tap(response => {

                console.log(
                    'Permissions loaded:',
                    response
                );

            }),

            catchError(error => {

                console.error(
                    'Error loading permissions:',
                    error
                );

                return throwError(
                    () => error
                );

            })

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

        console.log(
            'Saving permissions:',
            data
        );

        return this.http.post<any>(
            `${this.apiUrl}/`,
            data
        ).pipe(

            tap(response => {

                console.log(
                    'Save permissions response:',
                    response
                );

            }),

            catchError(error => {

                console.error(
                    'Save permissions error:',
                    error
                );

                return throwError(
                    () => error
                );

            })

        );
    }
}