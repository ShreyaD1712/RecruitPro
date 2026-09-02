import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RolePermissionService {
    private apiUrl = 'http://127.0.0.1:8000/role-permissions';

    constructor(private http: HttpClient) { }

    // ==================================================
    // GET ROLE PERMISSIONS
    // ==================================================
    getPermissions(roleId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${roleId}`);
    }

    // ==================================================
    // GET MODULE PERMISSIONS
    // ==================================================
    getModulePermissions(roleId: number, moduleKey: string): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/${roleId}/module/${moduleKey}`
        );
    }

    // ==================================================
    // SAVE PERMISSIONS
    // ==================================================
    savePermissions(roleId: number, permissions: string[]): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/`,
            {
                RoleId: roleId,
                Permissions: permissions
            }
        );
    }
}