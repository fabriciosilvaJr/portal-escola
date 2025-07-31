export interface Usuario {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: 'admin' | 'aluno';
  created_at: Date;
  updated_at: Date;
}

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
}

export interface LoginRequest {
  matricula: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    matricula: string;
    nome: string;
    email: string;
    tipo_usuario: string;
  };
}

export interface AuthRequest extends Request {
  usuario?: Usuario;
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