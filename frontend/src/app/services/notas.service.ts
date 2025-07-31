import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getTodasNotas(): Observable<NotasAluno[]> {
    return this.http.get<NotasAluno[]>(`${this.apiUrl}/admin/todas`);
  }

  getMinhasNotas(): Observable<NotasComAnalise[]> {
    return this.http.get<NotasComAnalise[]>(`${this.apiUrl}/minhas`);
  }
}