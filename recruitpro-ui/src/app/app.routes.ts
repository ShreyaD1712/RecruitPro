import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';

import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';

import { DashboardComponent } from './components/dashboard/dashboard.component';

// Company Components
import { CompanyListComponent } from './components/company/company-list/company-list.component';
import { CompanyAddComponent } from './components/company/company-add/company-add.component';
// Department Components
import { DepartmentListComponent } from './components/department/department-list/department-list.component';
import { DepartmentAddComponent } from './components/department/department-add/department-add.component';
// Designation Components
import { DesignationListComponent } from './components/designation/designation-list/designation-list.component';
import { DesignationAddComponent } from './components/designation/designation-add/designation-add.component';
// Role Components
import { RoleListComponent } from './components/role/role-list/role-list.component';
import { RoleAddComponent } from './components/role/role-add/role-add.component';
// User Components
import { UserListComponent } from './components/user/user-list/user-list.component';
import { UserAddComponent } from './components/user/user-add/user-add.component';

import { ProfileComponent } from './components/profile/profile.component';
// Role Permission Components
import { RolePermissionListComponent } from './components/role-permission/role-permission-list/role-permission-list.component';
// Skill Components
import { SkillListComponent } from './components/skill/skill-list/skill-list.component';
import { SkillAddComponent } from './components/skill/skill-add/skill-add.component';
// Job Category Components
import { JobCategoryListComponent } from './components/job-category/job-category-list/job-category-list.component';
import { JobCategoryAddComponent } from './components/job-category/job-category-add/job-category-add.component';
// Employment Type Components
import { EmploymentTypeListComponent } from './components/employment-type/employment-type-list/employment-type-list.component';
import { EmploymentTypeAddComponent } from './components/employment-type/employment-type-add/employment-type-add.component';
// Experience Level Components
import { ExperienceLevelListComponent } from './components/experience-level/experience-level-list/experience-level-list.component';
import { ExperienceLevelAddComponent } from './components/experience-level/experience-level-add/experience-level-add.component';
// Interview Round Components
import { InterviewRoundListComponent } from './components/interview-round/interview-round-list/interview-round-list.component';
import { InterviewRoundAddComponent } from './components/interview-round/interview-round-add/interview-round-add.component';
// Job Opening Component
import { JobOpeningListComponent } from './components/job-opening/job-opening-list/job-opening-list.component';
import { JobOpeningAddComponent } from './components/job-opening/job-opening-add/job-opening-add.component';
// Applicant Component
import { ApplicantListComponent } from './components/applicant/applicant-list/applicant-list.component';
import { ApplicantAddComponent } from './components/applicant/applicant-add/applicant-add.component';
// Applications Component
import { ApplicationListComponent } from './components/application/application-list/application-list.component';
import { ApplicationAddComponent } from './components/application/application-add/application-add.component';
// Referrals
import { ReferralListComponent } from './components/referral/referral-list/referral-list.component';
// Interviews 
import { InterviewAddComponent } from './components/interview/interview-add/interview-add.component';
import { InterviewListComponent } from './components/interview/interview-list/interview-list.component';
// Interview Feedback
import { InterviewFeedbackAddComponent } from './components/interview-feedback/interview-feedback-add/interview-feedback-add.component';
import { InterviewFeedbackListComponent } from './components/interview-feedback/interview-feedback-list/interview-feedback-list.component';
// Offer
import { OfferListComponent } from './components/offers/offer-list/offer-list.component';
import { OfferAddComponent } from './components/offers/offer-add/offer-add.component';
export const routes: Routes = [
  // Login Page
  {
    path: '',
    component: LoginComponent
  },

  // Dashboard Layout
  {
    path: '',
    component: DashboardLayoutComponent,

    children: [

      // Dashboard
      {
        path: 'dashboard',
        component: DashboardComponent
      },

      // Company
      {
        path: 'company',
        component: CompanyListComponent
      },
      {
        path: 'company/add',
        component: CompanyAddComponent
      },
      {
        path: 'company/edit/:id',
        component: CompanyAddComponent
      },

      // Department
      {
        path: 'department',
        component: DepartmentListComponent
      },
      {
        path: 'department/add',
        component: DepartmentAddComponent
      },
      {
        path: 'department/edit/:id',
        component: DepartmentAddComponent
      },

      // Designation
      {
        path: 'designation',
        component: DesignationListComponent
      },
      {
        path: 'designation/add',
        component: DesignationAddComponent
      },
      {
        path: 'designation/edit/:id',
        component: DesignationAddComponent
      },
      // Role
      {
        path: 'role',
        component: RoleListComponent
      },
      {
        path: 'role/add',
        component: RoleAddComponent
      },
      {
        path: 'role/edit/:id',
        component: RoleAddComponent
      },
      // User
      {
        path: 'user',
        component: UserListComponent
      },
      {
        path: 'user/add',
        component: UserAddComponent
      },
      {
        path: 'user/edit/:id',
        component: UserAddComponent
      },
      // Profile
      {
        path: 'profile',
        component: ProfileComponent
      },
      // Role Permission
      {
        path: 'role-permission',
        component: RolePermissionListComponent
      },
      // Skill
      {
        path: 'skill',
        component: SkillListComponent
      },
      {
        path: 'skill/add',
        component: SkillAddComponent
      },
      {
        path: 'skill/edit/:id',
        component: SkillAddComponent
      },
      // Job Category
      {
        path: 'job-category',
        component: JobCategoryListComponent
      },
      {
        path: 'job-category/add',
        component: JobCategoryAddComponent
      },
      {
        path: 'job-category/edit/:id',
        component: JobCategoryAddComponent
      },
      // Employment Type
      {
        path: 'employment-type',
        component: EmploymentTypeListComponent
      },
      {
        path: 'employment-type/add',
        component: EmploymentTypeAddComponent
      },
      {
        path: 'employment-type/edit/:id',
        component: EmploymentTypeAddComponent
      },
      // Experience Level
      {
        path: 'experience-level',
        component: ExperienceLevelListComponent
      },
      {
        path: 'experience-level/add',
        component: ExperienceLevelAddComponent
      },
      {
        path: 'experience-level/edit/:id',
        component: ExperienceLevelAddComponent
      },
      // Interview Round
      {
        path: 'interview-round',
        component: InterviewRoundListComponent
      },
      {
        path: 'interview-round/add',
        component: InterviewRoundAddComponent
      },
      {
        path: 'interview-round/edit/:id',
        component: InterviewRoundAddComponent
      },
      // Job Opening
      {
        path: 'job-opening',
        component: JobOpeningListComponent
      },
      {
        path: 'job-opening/add',
        component: JobOpeningAddComponent
      },
      {
        path: 'job-opening/edit/:id',
        component: JobOpeningAddComponent
      },
      // Applicant
      {
        path: 'applicant',
        component: ApplicantListComponent
      },
      {
        path: 'applicant/add',
        component: ApplicantAddComponent
      },
      {
        path: 'applicant/edit/:id',
        component: ApplicantAddComponent
      },
      // Application
      {
        path: 'application',
        component: ApplicationListComponent
      },
      {
        path: 'application/add',
        component: ApplicationAddComponent
      },
      {
        path: 'application/edit/:id',
        component: ApplicationAddComponent
      },
      // Referral
      {
        path: 'referral',
        component: ReferralListComponent
      },
      // Interview
      {
        path: 'interview',
        component: InterviewListComponent
      },
      {
        path: 'interview/add',
        component: InterviewAddComponent
      },
      {
        path: 'interview/edit/:id',
        component: InterviewAddComponent
      },
      // Interview Feedback
      {
        path: 'interview-feedback',
        component: InterviewFeedbackListComponent
      },
      {
        path: 'interview-feedback/add',
        component: InterviewFeedbackAddComponent
      },
      {
        path: 'interview-feedback/edit/:id',
        component: InterviewFeedbackAddComponent
      },
      // Offer
      {
        path: 'offer',
        component: OfferListComponent
      },
      {
        path: 'offer/add',
        component: OfferAddComponent
      },
      {
        path: 'offer/edit/:id',
        component: OfferAddComponent
      },
      // Default Route
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }

    ]
  },

  // Invalid URL
  {
    path: '**',
    redirectTo: 'dashboard'
  }

];