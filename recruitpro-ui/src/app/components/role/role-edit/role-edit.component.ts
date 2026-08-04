import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-role-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.css']
})
export class RoleEditComponent implements OnInit {

  roleForm!: FormGroup;

  roleId!: number;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.roleId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.roleForm = this.fb.group({

      RoleName: ['', Validators.required],
      Description: [''],

      IsActive: [true]

    });

    this.loadRole();

  }

  loadRole() {

    this.roleService.getRoleById(this.roleId)
      .subscribe({

        next: (response) => {

          this.roleForm.patchValue(response);

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  updateRole() {

    if (this.roleForm.invalid) {

      this.roleForm.markAllAsTouched();

      return;

    }

    this.roleService.updateRole(
      this.roleId,
      this.roleForm.value
    ).subscribe({

      next: () => {

        alert('Role Updated Successfully');

        this.router.navigate(['/role']);

      },

      error: (err) => {

        console.log(err);

        alert(err.error.detail);

      }

    });

  }

  cancel() {

    this.router.navigate(['/role']);

  }

}