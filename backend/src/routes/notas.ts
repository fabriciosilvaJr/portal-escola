import { Router, Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import pool from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { NotasAluno, NotasComAnalise } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

interface AuthRequest extends Request {
  usuario?: any;
}

// Disciplinas disponíveis
const disciplinas = [
  'portugues', 'matematica', 'historia', 'geografia', 'biologia',
  'fisica', 'quimica', 'filosofia', 'sociologia', 'educacao_fisica',
  'arte', 'ingles'
];

const nomesDisciplinas: { [key: string]: string } = {
  portugues: 'Português',
  matematica: 'Matemática',
  historia: 'História',
  geografia: 'Geografia',
  biologia: 'Biologia',
  fisica: 'Física',
  quimica: 'Química',
  filosofia: 'Filosofia',
  sociologia: 'Sociologia',
  educacao_fisica: 'Educação Física',
  arte: 'Arte',
  ingles: 'Inglês'
};

// Upload de CSV (apenas admin)
router.post('/upload', authenticateToken, requireAdmin, upload.single('csv'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo CSV é obrigatório' });
    }

    const results: any[] = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let processados = 0;
          let atualizados = 0;
          let inseridos = 0;

          for (const row of results) {
            const { matricula, ano, ...notas } = row;

            if (!matricula || !ano) {
              continue;
            }

            // Verificar se já existe
            const existeResult = await pool.query(
              'SELECT id FROM notas_alunos WHERE matricula = $1 AND ano = $2',
              [matricula, parseInt(ano)]
            );

            const notasValidas: any = {};
            disciplinas.forEach(disc => {
              if (row[disc] && !isNaN(parseFloat(row[disc]))) {
                notasValidas[disc] = parseFloat(row[disc]);
              }
            });

            if (existeResult.rows.length > 0) {
              // Update
              const setClauses = Object.keys(notasValidas).map((key, index) => 
                `${key} = $${index + 3}`
              ).join(', ');

              if (setClauses) {
                await pool.query(
                  `UPDATE notas_alunos SET ${setClauses} WHERE matricula = $1 AND ano = $2`,
                  [matricula, parseInt(ano), ...Object.values(notasValidas)]
                );
                atualizados++;
              }
            } else {
              // Insert
              const columns = ['matricula', 'ano', ...Object.keys(notasValidas)];
              const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
              
              await pool.query(
                `INSERT INTO notas_alunos (${columns.join(', ')}) VALUES (${placeholders})`,
                [matricula, parseInt(ano), ...Object.values(notasValidas)]
              );
              inseridos++;
            }
            processados++;
          }

          res.json({
            message: 'CSV processado com sucesso',
            processados,
            inseridos,
            atualizados
          });
        } catch (error) {
          console.error('Erro ao processar CSV:', error);
          res.status(500).json({ message: 'Erro ao processar dados do CSV' });
        }
      });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar todas as notas (admin)
router.get('/admin/todas', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT n.*, u.nome 
      FROM notas_alunos n
      LEFT JOIN usuarios u ON n.matricula = u.matricula
      ORDER BY n.ano DESC, n.matricula
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar notas do aluno logado
router.get('/minhas', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notas_alunos WHERE matricula = $1 ORDER BY ano DESC',
      [req.usuario.matricula]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nenhuma nota encontrada' });
    }

    // Processar dados para análise
    const notasComAnalise: NotasComAnalise[] = result.rows.map((nota: NotasAluno) => {
      const disciplinasComNotas = disciplinas
        .map(disc => ({
          nome: nomesDisciplinas[disc],
          nota: nota[disc as keyof NotasAluno] as number
        }))
        .filter(d => d.nota !== null && d.nota !== undefined);

      let melhorDisciplina = disciplinasComNotas[0];
      let piorDisciplina = disciplinasComNotas[0];

      disciplinasComNotas.forEach(disc => {
        if (disc.nota > melhorDisciplina.nota) {
          melhorDisciplina = disc;
        }
        if (disc.nota < piorDisciplina.nota) {
          piorDisciplina = disc;
        }
      });

      return {
        notas: nota,
        melhorDisciplina,
        piorDisciplina,
        disciplinas: disciplinasComNotas
      };
    });

    res.json(notasComAnalise);
  } catch (error) {
    console.error('Erro ao buscar notas do aluno:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;