import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Portal Escolar
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar suas notas
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="matricula" class="sr-only">Matrícula</label>
              <input
                id="matricula"
                name="matricula"
                type="text"
                required
                formControlName="matricula"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Matrícula"
              />
            </div>
            <div>
              <label for="senha" class="sr-only">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                formControlName="senha"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
              />
            </div>
          </div>

          <div *ngIf="errorMessage" class="text-red-600 text-sm text-center">
            {{ errorMessage }}
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                ⏳
              </span>
              {{ isLoading ? 'Entrando...' : 'Entrar' }}
            </button>
          </div>

          <div class="text-center text-sm text-gray-600">
            <p><strong>Usuários de teste:</strong></p>
            <p>Admin: ADMIN001 / admin123</p>
            <p>Aluno: 2024001 / 123456</p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      matricula: ['', [Validators.required]],
      senha: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { matricula, senha } = this.loginForm.value;

      this.authService.login(matricula, senha).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.usuario.tipo_usuario === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/aluno']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Erro ao fazer login';
        }
      });
    }
  }
}