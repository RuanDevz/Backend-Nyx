const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');
const Authmiddleware = require('../Middleware/Auth');
const isAdmin = require('../Middleware/isAdmin'); // Importando o middleware de admin
const dotenv = require('dotenv');
dotenv.config();

// Rota para buscar todos os usuários (apenas admins podem acessar)
router.get('/', Authmiddleware, isAdmin, async (req, res) => {
    try {
        const getallusers = await User.findAll();
        res.status(200).json(getallusers);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuários." });
    }
});

router.post('/cancel-subscription', async (req, res) => {
    const { userId } = req.body;
  
    try {
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Remove o stripeSubscriptionId para cancelar cobranças futuras
      await user.update({
        stripeSubscriptionId: null, // Cancela a assinatura no Stripe
      });
  
      res.status(200).json({ 
        message: 'Subscription canceled successfully. You will retain VIP access until the end of the current billing period.',
        vipExpirationDate: user.vipExpirationDate, // Retorna a data de expiração para o frontend
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

router.get('/status', Authmiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        const status = {
            isAdmin: user.isAdmin,
            isVip: user.isVip
        };

        res.status(200).json(status);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao verificar status do usuário" });
    }
});

router.get('/is-admin/:email', async (req, res) => {
    const { email } = req.params;
  
    try {
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
      }
  
      res.status(200).json({ isAdmin: user.isAdmin });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao verificar status de admin' });
    }
  });
  

// Rota para verificar o status VIP de um usuário pelo email
router.get('/is-vip/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        res.status(200).json({ isVip: user.isVip });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao verificar status VIP' });
    }
});

// Rota para registrar um novo usuário
router.post('/register', async (req, res) => {
    const { password, email, ...users } = req.body;

    const hashpassword = await bcrypt.hash(password, 10);

    const existingemail = await User.findOne({ where: { email } });

    if (existingemail) {
        return res.status(409).json({ error: 'Email já cadastrado!' });
    }

    const createnewuser = await User.create({
        ...users,
        email,
        password: hashpassword,
    });

    res.status(201).json(createnewuser);
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Credenciais incorretas!" });
    }

    const accesstoken = sign({ email: user.email, id: user.id }, process.env.TOKEN_VERIFY_ACCESS);

    res.json({ token: accesstoken, name: user.name });
});

// Rota para o dashboard do usuário
router.get('/dashboard', Authmiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findByPk(userId);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// Rota para pegar dados do usuário logado
router.get('/user-data', Authmiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        const benefits = user.isVip ? [
            "Access to 3 years of content with no ads.",
            "Access to all content before it's posted for free users.",
            "VIP badge on our Discord community.",
            "Early access to exclusive content and special newsletters.",
            "Priority support for viewing and accessing all content.",
            "Exclusive Q&A sessions, webinars, and personalized content."
        ] : [];

        res.status(200).json({
            name: user.name,
            email: user.email,
            isVip: user.isVip,
            benefits: benefits,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

module.exports = router;
