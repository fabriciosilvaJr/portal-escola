import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotasService, NotasComAnalise } from '../../services/notas.service';

@Component({
  selector: 'app-aluno-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Portal Escolar</h1>
              <p class="text-sm text-gray-600">Bem-vindo, {{ currentUser?.nome }}</p>
            </div>
            <button
              (click)="logout()"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div *ngIf="isLoading" class="text-center py-8">
          <p class="text-lg text-gray-600">Carregando suas notas...</p>
        </div>

        <div *ngIf="!isLoading && notasComAnalise.length === 0" class="text-center py-8">
          <p class="text-lg text-gray-600">Nenhuma nota encontrada para seu usuário.</p>
        </div>

        <!-- Notas por Ano -->
        <div *ngFor="let analise of notasComAnalise" class="mb-8">
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-4 py-5 sm:px-6 bg-indigo-600 text-white">
              <h3 class="text-lg leading-6 font-medium">
                Boletim {{ analise.notas.ano }} - {{ currentUser?.matricula }}
              </h3>
            </div>

            <!-- Cards de Melhor e Pior Nota -->
            <div class="px-4 py-5 sm:p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <!-- Melhor Nota -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-bold">↑</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <h4 class="text-lg font-medium text-green-900">Melhor Disciplina</h4>
                      <p class="text-2xl font-bold text-green-700">{{ analise.melhorDisciplina.nota }}</p>
                      <p class="text-sm text-green-600">{{ analise.melhorDisciplina.nome }}</p>
                    </div>
                  </div>
                </div>

                <!-- Pior Nota -->
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-bold">↓</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <h4 class="text-lg font-medium text-red-900">Disciplina para Melhorar</h4>
                      <p class="text-2xl font-bold text-red-700">{{ analise.piorDisciplina.nota }}</p>
                      <p class="text-sm text-red-600">{{ analise.piorDisciplina.nome }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Gráfico de Barras -->
              <div class="mb-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">Gráfico de Notas por Disciplina</h4>
                <div class="space-y-3">
                  <div *ngFor="let disciplina of analise.disciplinas" class="flex items-center">
                    <div class="w-32 text-sm font-medium text-gray-700 truncate">
                      {{ disciplina.nome }}
                    </div>
                    <div class="flex-1 mx-4">
                      <div class="bg-gray-200 rounded-full h-6 relative">
                        <div 
                          class="bg-indigo-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                          [style.width.%]="(disciplina.nota / 10) * 100"
                        >
                          <span class="text-white text-xs font-medium">{{ disciplina.nota }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="w-12 text-sm font-medium text-gray-900 text-right">
                      {{ disciplina.nota }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tabela de Notas -->
              <div class="overflow-x-auto">
                <h4 class="text-lg font-medium text-gray-900 mb-4">Detalhamento das Notas</h4>
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disciplina</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let disciplina of analise.disciplinas" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ disciplina.nome }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ disciplina.nota }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [class.bg-green-100]="disciplina.nota >= 7"
                          [class.text-green-800]="disciplina.nota >= 7"
                          [class.bg-yellow-100]="disciplina.nota >= 5 && disciplina.nota < 7"
                          [class.text-yellow-800]="disciplina.nota >= 5 && disciplina.nota < 7"
                          [class.bg-red-100]="disciplina.nota < 5"
                          [class.text-red-800]="disciplina.nota < 5"
                        >
                          {{ getStatus(disciplina.nota) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AlunoDashboardComponent implements OnInit {
  currentUser = this.authService.getCurrentUser();
  notasComAnalise: NotasComAnalise[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private notasService: NotasService
  ) {}

  ngOnInit(): void {
    this.loadMinhasNotas();
  }

  loadMinhasNotas(): void {
    this.isLoading = true;
    this.notasService.getMinhasNotas().subscribe({
      next: (notas) => {
        this.notasComAnalise = notas;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar notas:', error);
        this.isLoading = false;
      }
    });
  }

  getStatus(nota: number): string {
    if (nota >= 7) return 'Aprovado';
    if (nota >= 5) return 'Recuperação';
    return 'Reprovado';
  }

  logout(): void {
    this.authService.logout();
  }
}