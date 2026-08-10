import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatDividerModule
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    profileForm!: FormGroup;

    editMode = false;

    profileImage = '';

    roleName = '';

    companyName = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private profileService: ProfileService

    ) { }

    ngOnInit(): void {

        this.profileForm = this.fb.group({

            firstName: [{ value: '', disabled: true }],
            lastName: [{ value: '', disabled: true }],
            email: [{ value: '', disabled: true }],
            mobileNo: [{ value: '', disabled: true }]

        });

        this.loadUser();

        this.profileService.profileImage$.subscribe(image => {

            this.profileImage = image;

        });

    }

    loadUser(): void {

        const token = localStorage.getItem('token');

        if (!token) {

            this.router.navigate(['/']);

            return;

        }

        const payload = JSON.parse(atob(token.split('.')[1]));

        this.profileForm.patchValue({

            firstName: payload.first_name || '',

            lastName: payload.last_name || '',

            email: payload.sub || '',

            mobileNo: payload.mobile_no || ''

        });

        this.roleName = payload.role_name || 'Super Admin';

        this.companyName = payload.company_name || 'RecruitPro';

    }

    enableEdit(): void {

        this.editMode = true;

        this.profileForm.get('firstName')?.enable();

        this.profileForm.get('lastName')?.enable();

        this.profileForm.get('mobileNo')?.enable();

    }

    cancelEdit(): void {

        this.editMode = false;

        this.profileForm.get('firstName')?.disable();

        this.profileForm.get('lastName')?.disable();

        this.profileForm.get('mobileNo')?.disable();

        this.loadUser();

    }

    saveProfile(): void {

        if (this.profileForm.invalid) {

            this.profileForm.markAllAsTouched();

            return;

        }

        console.log(this.profileForm.getRawValue());

        alert('Profile Updated Successfully');

        this.editMode = false;

        this.profileForm.get('firstName')?.disable();

        this.profileForm.get('lastName')?.disable();

        this.profileForm.get('mobileNo')?.disable();

    }
    changePicture(event: any): void {

        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {

            this.profileImage = reader.result as string;

            this.profileService.setProfileImage(this.profileImage);

        };

        reader.readAsDataURL(file);

    }

    removePicture(): void {

        this.profileImage = '';

        this.profileService.removeProfileImage();

    }

    logout(): void {

        localStorage.removeItem('token');

        this.router.navigate(['/']);

    }

}