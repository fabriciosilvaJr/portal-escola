import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { Usuario } from '../types';

interface AuthRequest extends Request {
  usuario?: Usuario;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.usuario = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.usuario?.tipo_usuario !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }
  next();
};