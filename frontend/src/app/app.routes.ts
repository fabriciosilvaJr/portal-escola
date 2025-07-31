import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'aluno', 
    loadComponent: () => import('./components/aluno-dashboard/aluno-dashboard.component').then(m => m.AlunoDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '/login' }
];