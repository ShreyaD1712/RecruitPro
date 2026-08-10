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
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../services/auth.service';
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-company-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.css']
})
export class CompanyEditComponent implements OnInit {

  companyForm!: FormGroup;
  companyId!: number;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {

    this.companyForm = this.fb.group({
      CompanyCode: ['', Validators.required],
      CompanyName: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Phone: ['', Validators.required],
      Website: [''],
      Address: [''],
      IsActive: [true]
    });

  }

  ngOnInit(): void {

    // Permission Check
    if (!this.hasPermission('UPDATE_COMPANY')) {
      alert('You are not authorized to access this page.');
      this.router.navigate(['/company']);
      return;
    }

    this.companyId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadCompany();
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  loadCompany() {

    this.companyService.getCompany(this.companyId).subscribe({

      next: (response) => {
        this.companyForm.patchValue(response);
      },

      error: () => {
        alert('Company not found');
        this.router.navigate(['/company']);
      }

    });

  }

  updateCompany() {

    if (!this.hasPermission('UPDATE_COMPANY')) {
      alert('You do not have permission to update companies.');
      return;
    }

    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.companyService.updateCompany(
      this.companyId,
      this.companyForm.value
    ).subscribe({

      next: () => {
        alert('Company Updated Successfully');
        this.router.navigate(['/company']);
      },

      error: (error) => {
        alert(error.error.detail);
      }

    });

  }

  cancel() {
    this.router.navigate(['/company']);
  }

}