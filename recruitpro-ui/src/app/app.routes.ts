import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';

import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';

import { DashboardComponent } from './components/dashboard/dashboard.component';

// Company Components
import { CompanyListComponent } from './components/company/company-list/company-list.component';
import { CompanyAddComponent } from './components/company/company-add/company-add.component';
import { CompanyEditComponent } from './components/company/company-edit/company-edit.component';
// Department Components
import { DepartmentListComponent } from './components/department/department-list/department-list.component';
import { DepartmentAddComponent } from './components/department/department-add/department-add.component';
import { DepartmentEditComponent } from './components/department/department-edit/department-edit.component';
// Designation Components
import { DesignationListComponent } from './components/designation/designation-list/designation-list.component';
import { DesignationAddComponent } from './components/designation/designation-add/designation-add.component';
import { DesignationEditComponent } from './components/designation/designation-edit/designation-edit.component';
// Role Components
import { RoleListComponent } from './components/role/role-list/role-list.component';
import { RoleAddComponent } from './components/role/role-add/role-add.component';
import { RoleEditComponent } from './components/role/role-edit/role-edit.component';
// User Components
import { UserListComponent } from './components/user/user-list/user-list.component';
import { UserAddComponent } from './components/user/user-add/user-add.component';
import { UserEditComponent } from './components/user/user-edit/user-edit.component';

import { ProfileComponent } from './components/profile/profile.component';
// Role Permission Components
import { RolePermissionListComponent } from './components/role-permission/role-permission-list/role-permission-list.component';
// Skill Components
import { SkillListComponent } from './components/skill/skill-list/skill-list.component';
import { SkillAddComponent } from './components/skill/skill-add/skill-add.component';
import { SkillEditComponent } from './components/skill/skill-edit/skill-edit.component';
// Job Category Components
import { JobCategoryListComponent } from './components/job-category/job-category-list/job-category-list.component';
import { JobCategoryAddComponent } from './components/job-category/job-category-add/job-category-add.component';
import { JobCategoryEditComponent } from './components/job-category/job-category-edit/job-category-edit.component';
// Employment Type Components
import { EmploymentTypeListComponent } from './components/employment-type/employment-type-list/employment-type-list.component';
import { EmploymentTypeAddComponent } from './components/employment-type/employment-type-add/employment-type-add.component';
import { EmploymentTypeEditComponent } from './components/employment-type/employment-type-edit/employment-type-edit.component';
// Experience Level Components
import { ExperienceLevelListComponent } from './components/experience-level/experience-level-list/experience-level-list.component';
import { ExperienceLevelAddComponent } from './components/experience-level/experience-level-add/experience-level-add.component';
import { ExperienceLevelEditComponent } from './components/experience-level/experience-level-edit/experience-level-edit.component';
// Interview Round Components
import { InterviewRoundListComponent } from './components/interview-round/interview-round-list/interview-round-list.component';
import { InterviewRoundAddComponent } from './components/interview-round/interview-round-add/interview-round-add.component';
import { InterviewRoundEditComponent } from './components/interview-round/interview-round-edit/interview-round-edit.component';
// Job Opening Component
import { JobOpeningListComponent } from './components/job-opening/job-opening-list/job-opening-list.component';
import { JobOpeningAddComponent } from './components/job-opening/job-opening-add/job-opening-add.component';
import { JobOpeningEditComponent } from './components/job-opening/job-opening-edit/job-opening-edit.component';
// Applicant Component
import { ApplicantListComponent } from './components/applicant/applicant-list/applicant-list.component';
import { ApplicantAddComponent } from './components/applicant/applicant-add/applicant-add.component';
import { ApplicantEditComponent } from './components/applicant/applicant-edit/applicant-edit.component';
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
        component: CompanyEditComponent
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
        component: DepartmentEditComponent
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
        component: DesignationEditComponent
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
        component: RoleEditComponent
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
        component: UserEditComponent
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
        component: SkillEditComponent
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
        component: JobCategoryEditComponent
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
        component: EmploymentTypeEditComponent
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
        component: ExperienceLevelEditComponent
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
        component: InterviewRoundEditComponent
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
        component: JobOpeningEditComponent
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
        component: ApplicantEditComponent
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