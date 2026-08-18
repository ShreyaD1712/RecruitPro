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
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RoleService } from '../../../services/role.service';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-role-list',
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
    MatSelectModule,
    MatTooltipModule
  ],

  templateUrl: './role-list.component.html',
})
export class RoleListComponent implements OnInit {

  // --------------------------------------------------
  // Data
  // --------------------------------------------------

  roles: any[] = [];

  companies: any[] = [];

  search = '';

  selectedCompanyId: number | null = null;

  // --------------------------------------------------
  // Sorting
  // --------------------------------------------------

  sortBy = 'RoleName';

  order = 'asc';

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  page = 1;

  pageSize = 10;

  totalRecords = 0;

  Math = Math;

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  loading = false;

  // --------------------------------------------------
  // Table Columns
  // --------------------------------------------------

  displayedColumns = [
    'RoleId',
    'RoleName',
    'Status',
    'Actions'
  ];

  constructor(
    private roleService: RoleService,
    private companyService: CompanyService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  // ==================================================
  // INIT
  // ==================================================

  ngOnInit(): void {

    this.loadCompanies();

  }

  // ==================================================
  // LOAD COMPANIES
  // ==================================================

  loadCompanies(): void {

    /*
     * VIEW_ALL_COMPANIES
     *
     * If user has this permission:
     *      -> Show all companies
     *      -> Allow company filtering
     *
     * If user does not have this permission:
     *      -> Show only their company
     *      -> Company dropdown effectively contains
     *         only their company
     */

    if (
      this.authService.hasPermission(
        'VIEW_ALL_COMPANIES'
      )
    ) {

      this.companyService.getCompanies(
        '',
        'CompanyName',
        'asc',
        1,
        1000
      ).subscribe({

        next: (response: any) => {

          this.companies = response.data || [];

          /*
           * Initially show all roles.
           */

          this.selectedCompanyId = null;

          this.loadRoles();

        },

        error: (err) => {

          console.log(
            'Error loading companies:',
            err
          );

          this.companies = [];

          this.loadRoles();

        }

      });

    }

    else {

      /*
       * User can only view their company.
       *
       * CompanyId is obtained from AuthService only
       * to identify the logged-in user's company.
       *
       * Permission controls the access.
       */

      const companyId =
        this.authService.getCompanyId();

      this.companyService
        .getCompany(companyId)
        .subscribe({

          next: (company: any) => {

            this.companies = [company];

            this.selectedCompanyId =
              company.CompanyId;

            this.loadRoles();

          },

          error: (err) => {

            console.log(
              'Error loading company:',
              err
            );

            this.companies = [];

            this.selectedCompanyId =
              companyId;

            this.loadRoles();

          }

        });

    }

  }

  // ==================================================
  // COMPANY CHANGE
  // ==================================================

  companyChanged(): void {

    this.page = 1;

    this.loadRoles();

  }

  /*
   * Keep this alias in case older HTML
   * still uses onCompanyChange().
   */

  onCompanyChange(): void {

    this.companyChanged();

  }

  // ==================================================
  // LOAD ROLES
  // ==================================================

  loadRoles(): void {

    this.loading = true;

    this.roleService.getRoles(

      this.search,

      this.sortBy,

      this.order,

      this.page,

      this.pageSize,

      this.selectedCompanyId ?? undefined

    ).subscribe({

      next: (response: any) => {

        this.roles =
          response.data || [];

        this.totalRecords =
          response.total_records || 0;

        this.loading = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.log(
          'Error loading roles:',
          err
        );

        this.roles = [];

        this.totalRecords = 0;

        this.loading = false;

        this.cdr.detectChanges();

      }

    });

  }

  // ==================================================
  // SEARCH
  // ==================================================

  searchRole(): void {

    this.page = 1;

    this.loadRoles();

  }

  // ==================================================
  // ADD ROLE
  // ==================================================

  addRole(): void {

    if (
      !this.authService.hasPermission(
        'CREATE_ROLE'
      )
    ) {

      return;

    }

    this.router.navigate([
      '/role/add'
    ]);

  }

  // ==================================================
  // EDIT ROLE
  // ==================================================

  editRole(id: number): void {

    if (
      !this.authService.hasPermission(
        'UPDATE_ROLE'
      )
    ) {

      return;

    }

    this.router.navigate([
      '/role/edit',
      id
    ]);

  }

  // ==================================================
  // DELETE ROLE
  // ==================================================

  deleteRole(id: number): void {

    if (
      !this.authService.hasPermission(
        'DELETE_ROLE'
      )
    ) {

      return;

    }

    if (
      !confirm(
        'Delete this Role?'
      )
    ) {

      return;

    }

    this.roleService
      .deleteRole(id)
      .subscribe({

        next: () => {

          alert(
            'Role Deleted Successfully'
          );

          /*
           * If the last record on the current
           * page was deleted, move back.
           */

          if (
            this.roles.length === 1 &&
            this.page > 1
          ) {

            this.page--;

          }

          this.loadRoles();

        },

        error: (err) => {

          console.log(
            'Error deleting role:',
            err
          );

          alert(
            err.error?.detail ||
            'Unable to delete role'
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

      this.loadRoles();

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

      this.loadRoles();

    }

  }

  // ==================================================
  // CANCEL
  // ==================================================

  cancel(): void {

    this.router.navigate([
      '/role'
    ]);

  }

}