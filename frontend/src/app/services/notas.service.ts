import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotasAluno {
  id: number;
  matricula: string;
  ano: number;
  portugues?: number;
  matematica?: number;
  historia?: number;
  geografia?: number;
  biologia?: number;
  fisica?: number;
  quimica?: number;
  filosofia?: number;
  sociologia?: number;
  educacao_fisica?: number;
  arte?: number;
  ingles?: number;
  created_at: Date;
  updated_at: Date;
  nome?: string;
}

export interface PaginatedNotas {
  data: NotasAluno[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NotasComAnalise {
  notas: NotasAluno;
  melhorDisciplina: {
    nome: string;
    nota: number;
  };
  piorDisciplina: {
    nome: string;
    nota: number;
  };
  disciplinas: Array<{
    nome: string;
    nota: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class NotasService {
  private apiUrl = 'http://localhost:3000/api/notas';

  constructor(private http: HttpClient) {}

  uploadCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('csv', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getTodasNotas(page: number, pageSize: number, ano?: number, matricula?: string): Observable<PaginatedNotas> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (ano !== undefined && ano !== null) {
      params = params.set('ano', ano.toString());
    }
    
    if (matricula && matricula.trim().length > 0) {
      params = params.set('matricula', matricula.trim());
    }
    
    return this.http.get<PaginatedNotas>(`${this.apiUrl}/admin/todas`, { params });
  }

  getAnosDisponiveis(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/admin/anos`);
  }

  getMinhasNotas(): Observable<NotasComAnalise[]> {
    return this.http.get<NotasComAnalise[]>(`${this.apiUrl}/minhas`);
  }
}