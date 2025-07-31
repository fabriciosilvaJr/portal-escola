import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { LoginRequest, LoginResponse } from '../types';

const router = Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { matricula, senha }: LoginRequest = req.body;

    if (!matricula || !senha) {
      return res.status(400).json({ message: 'Matrícula e senha são obrigatórios' });
    }

    // Buscar usuário
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE matricula = $1',
      [matricula]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const usuario = result.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: usuario.id, matricula: usuario.matricula, tipo: usuario.tipo_usuario },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const response: LoginResponse = {
      token,
      usuario: {
        id: usuario.id,
        matricula: usuario.matricula,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const result = await pool.query(
      'SELECT id, matricula, nome, email, tipo_usuario FROM usuarios WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    res.json({ usuario: result.rows[0] });
  } catch (error) {
    res.status(403).json({ message: 'Token inválido' });
  }
});

export default router;