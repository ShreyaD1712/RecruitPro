import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  profileImage = 'assets/images/default-user.png';

  userName = '';
  email = '';

  constructor(private router: Router) {

    const token = localStorage.getItem('token');

    if (token) {

      const payload = JSON.parse(atob(token.split('.')[1]));

      this.userName = payload.sub;
      this.email = payload.sub;

    }

  }

  logout() {

    localStorage.removeItem('token');

    this.router.navigate(['/']);

  }

  changePassword() {

    this.router.navigate(['/change-password']);

  }

}