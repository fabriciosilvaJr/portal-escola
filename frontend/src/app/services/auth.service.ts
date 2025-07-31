import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface Usuario {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  tipo_usuario: 'admin' | 'aluno';
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(matricula: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { matricula, senha })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.usuario));
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.usuario);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.tipo_usuario === 'admin';
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  verifyToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify`);
  }
}