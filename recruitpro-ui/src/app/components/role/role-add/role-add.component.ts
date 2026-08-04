import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-role-add',
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
  templateUrl: './role-add.component.html',
  styleUrls: ['./role-add.component.css']
})
export class RoleAddComponent {

  roleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private router: Router
  ) {

    this.roleForm = this.fb.group({

      RoleName: ['', Validators.required],
      Description: [''],
      IsActive: [true]

    });

  }

  saveRole() {

    if (this.roleForm.invalid) {

      this.roleForm.markAllAsTouched();

      return;

    }

    this.roleService.addRole(this.roleForm.value)
      .subscribe({

        next: () => {

          alert('Role Added Successfully');

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