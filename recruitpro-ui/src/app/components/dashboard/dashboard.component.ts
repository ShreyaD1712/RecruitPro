import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  stats = {
    TotalCompanies: 0,
    TotalJobOpenings: 0,
    TotalApplications: 0,
    ShortlistedCandidates: 0,
    TotalInterviews: 0,
    TotalOffers: 0,
    HiredCandidates: 0
  };

  applicationsByStatus: any[] = [];
  applicationsByDepartment: any[] = [];
  applicationsByCompany: any[] = [];

  isSuperAdmin = false;
  loading = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    const user = this.authService.getUser();

    this.isSuperAdmin =
      user?.role_id === 1;

    this.loadDashboard();
  }

  loadDashboard(): void {

    this.loading = true;

    this.dashboardService
      .getDashboard()
      .subscribe({
        next: (response: any) => {

          console.log(
            'Dashboard Response:',
            response
          );

          this.stats =
            response.Stats || this.stats;

          this.applicationsByStatus =
            response.ApplicationsByStatus || [];

          this.applicationsByDepartment =
            response.ApplicationsByDepartment || [];

          this.applicationsByCompany =
            response.ApplicationsByCompany || [];

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (err: any) => {

          console.error(
            'Dashboard Error:',
            err
          );

          this.loading = false;

          this.cdr.detectChanges();

          alert(
            err?.error?.detail ||
            'Unable to load dashboard.'
          );
        }
      });
  }
}