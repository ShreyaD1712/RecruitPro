import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

import { RoleService } from '../../../services/role.service';

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
    MatCardModule
  ],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {

  roles: any[] = [];

  search = '';

  sortBy = 'RoleId';

  order = 'asc';

  page = 1;

  pageSize = 10;

  totalRecords = 0;

  Math = Math;

  displayedColumns = [
    'RoleId',
    'RoleName',
    'Status',
    'Actions'
  ];

  constructor(
    private roleService: RoleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.loadRoles();

  }

  loadRoles() {

    this.roleService.getRoles(
      this.search,
      this.sortBy,
      this.order,
      this.page,
      this.pageSize
    ).subscribe({

      next: (response: any) => {

        this.roles = response.data;

        this.totalRecords = response.total_records;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  searchRole() {

    this.page = 1;

    this.loadRoles();

  }

  addRole() {

    this.router.navigate(['/role/add']);

  }

  editRole(id: number) {

    this.router.navigate(['/role/edit', id]);

  }

  deleteRole(id: number) {

    if (confirm('Delete this Role?')) {

      this.roleService.deleteRole(id)
        .subscribe({

          next: () => {

            this.loadRoles();

          },

          error: (err) => {

            console.log(err);

          }

        });

    }

  }

  previousPage() {

    if (this.page > 1) {

      this.page--;

      this.loadRoles();

    }

  }

  nextPage() {

    if (this.page * this.pageSize < this.totalRecords) {

      this.page++;

      this.loadRoles();

    }

  }

}