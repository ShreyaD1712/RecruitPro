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