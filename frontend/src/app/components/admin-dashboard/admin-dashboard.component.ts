import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { NotasService, NotasAluno } from '../../services/notas.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Portal Escolar - Admin</h1>
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
        <!-- Upload Section -->
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Upload de Notas (CSV)
              </h3>
              
              <div class="mb-4">
                <input
                  type="file"
                  accept=".csv"
                  (change)="onFileSelected($event)"
                  #fileInput
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <button
                (click)="uploadCSV()"
                [disabled]="!selectedFile || isUploading"
                class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {{ isUploading ? 'Enviando...' : 'Enviar CSV' }}
              </button>

              <div *ngIf="uploadMessage" class="mt-4 p-4 rounded-md" 
                   [class.bg-green-50]="uploadSuccess" 
                   [class.bg-red-50]="!uploadSuccess">
                <p [class.text-green-800]="uploadSuccess" 
                   [class.text-red-800]="!uploadSuccess">
                  {{ uploadMessage }}
                </p>
              </div>

              <div class="mt-4 text-sm text-gray-600">
                <p><strong>Formato do CSV:</strong></p>
                <p>matricula, ano, portugues, matematica, historia, geografia, biologia, fisica, quimica, filosofia, sociologia, educacao_fisica, arte, ingles</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notas Table -->
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Todas as Notas
                <button
                  (click)="loadNotas()"
                  class="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Atualizar
                </button>
              </h3>

              <!-- Filtros -->
              <div class="flex flex-wrap gap-4 items-center">
                <div class="flex items-center gap-2">
                  <label class="text-sm font-medium text-gray-700">Ano:</label>
                  <select
                    [(ngModel)]="anoFiltro"
                    (ngModelChange)="onAnoChange()"
                    class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  >
                    <option [ngValue]="null">Todos</option>
                    <option *ngFor="let ano of anosDisponiveis" [ngValue]="ano">{{ ano }}</option>
                  </select>
                </div>

                <div class="flex items-center gap-2">
                  <label class="text-sm font-medium text-gray-700">Matrícula:</label>
                  <input
                    type="text"
                    [(ngModel)]="matriculaFiltro"
                    (ngModelChange)="onMatriculaChange()"
                    placeholder="Buscar por matrícula"
                    class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div class="flex items-center gap-2">
                  <label class="text-sm font-medium text-gray-700">Registros por página:</label>
                  <select
                    [(ngModel)]="pageSize"
                    (ngModelChange)="onPageSizeChange()"
                    class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  >
                    <option [ngValue]="10">10</option>
                    <option [ngValue]="25">25</option>
                    <option [ngValue]="50">50</option>
                  </select>
                </div>

                <div class="text-sm text-gray-600">
                  Total: {{ total }} registro(s)
                </div>
              </div>
            </div>

            <div *ngIf="isLoading" class="px-4 py-5 text-center">
              <p>Carregando notas...</p>
            </div>

            <div *ngIf="!isLoading && notas.length === 0" class="px-4 py-5 text-center text-gray-500">
              <p>Nenhuma nota encontrada</p>
            </div>

            <div *ngIf="!isLoading && notas.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mat.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hist.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Geo.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fís.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quím.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fil.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soc.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ed.F.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arte</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingl.</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let nota of notas" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ nota.matricula }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.nome || 'N/A' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.ano }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.portugues || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.matematica || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.historia || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.geografia || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.biologia || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.fisica || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.quimica || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.filosofia || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.sociologia || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.educacao_fisica || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.arte || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ nota.ingles || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginação -->
            <div *ngIf="!isLoading && totalPages > 1" class="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700">
                  Página {{ page }} de {{ totalPages }}
                </div>
                <div class="flex gap-2">
                  <button
                    (click)="previousPage()"
                    [disabled]="page === 1"
                    class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    (click)="nextPage()"
                    [disabled]="page === totalPages"
                    class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser = this.authService.getCurrentUser();
  notas: NotasAluno[] = [];
  selectedFile: File | null = null;
  isLoading = false;
  isUploading = false;
  uploadMessage = '';
  uploadSuccess = false;

  page = 1;
  pageSize = 10;
  totalPages = 0;
  total = 0;
  anoFiltro: number | null = null;
  anosDisponiveis: number[] = [];
  matriculaFiltro = '';
  private matricula$ = new Subject<string>();
  private matriculaSubscription?: Subscription;
  private scrollPosition = 0;

  constructor(
    private authService: AuthService,
    private notasService: NotasService
  ) {}

  ngOnInit(): void {
    this.loadAnos();
    this.loadNotas();
    
    this.matriculaSubscription = this.matricula$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.loadNotas();
    });
  }

  ngOnDestroy(): void {
    this.matriculaSubscription?.unsubscribe();
  }

  onMatriculaChange(): void {
    this.matricula$.next(this.matriculaFiltro);
  }

  loadAnos(): void {
    this.notasService.getAnosDisponiveis().subscribe({
      next: (anos) => {
        this.anosDisponiveis = anos;
      },
      error: (error) => {
        console.error('Erro ao carregar anos:', error);
      }
    });
  }

  loadNotas(preserveScroll = false): void {
    if (preserveScroll) {
      this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    }
    
    this.isLoading = true;
    this.notasService.getTodasNotas(
      this.page, 
      this.pageSize, 
      this.anoFiltro || undefined,
      this.matriculaFiltro || undefined
    ).subscribe({
      next: (response) => {
        this.notas = response.data;
        this.total = response.total;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        
        if (preserveScroll) {
          setTimeout(() => {
            window.scrollTo(0, this.scrollPosition);
          }, 0);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar notas:', error);
        this.isLoading = false;
      }
    });
  }

  onAnoChange(): void {
    this.page = 1;
    this.loadNotas();
  }

  onPageSizeChange(): void {
    this.page = 1;
    this.loadNotas();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadNotas(true);
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadNotas(true);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
      this.uploadMessage = '';
    } else {
      this.selectedFile = null;
      this.uploadMessage = 'Selecione um arquivo CSV válido';
      this.uploadSuccess = false;
    }
  }

  uploadCSV(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadMessage = '';

    this.notasService.uploadCSV(this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadSuccess = true;
        this.uploadMessage = `CSV processado com sucesso! ${response.processados} registros processados (${response.inseridos} inseridos, ${response.atualizados} atualizados)`;
        this.selectedFile = null;
        this.loadAnos();
        this.loadNotas();
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadSuccess = false;
        this.uploadMessage = error.error?.message || 'Erro ao processar CSV';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}