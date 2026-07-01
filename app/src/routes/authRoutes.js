import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import enviarEmail from '../services/emailService.js';

const router = express.Router();

router.post('/registro', async (req, res) => {
    const { nome, email, senha } = req.body;
    const novoUsuario = new Usuario({ nome, email, senha });
    await novoUsuario.save();

    const assunto = 'Bem-vindo à API de Tarefas!';
    const corpo = `<h1>Olá, ${nome}!</h1><p>Seu cadastro foi realizado com sucesso.</p>`;
    await enviarEmail(email, assunto, corpo);

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso!' });
});
/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Rotas para registro e login de usuários
 */

/**
 * @swagger
 * /auth/registro:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoUsuario'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Erro de validação ao registrar usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/registro', async (req, res) => {
    try {
        const novoUsuario = new Usuario(req.body);
        await novoUsuario.save();
        res.status(201).json({ mensagem: "Usuário registrado com sucesso!" });
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro interno ao fazer login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }).select('+senha');

        if (!usuario || !await bcrypt.compare(senha, usuario.senha)) {
            return res.status(401).json({ erro: "Credenciais inválidas." });
        }

        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao fazer login." });
    }
});

export default router;