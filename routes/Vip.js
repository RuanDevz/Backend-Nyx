const express = require('express');
const router = express.Router();
const { Vip } = require('../models');

// Rota para buscar um conteúdo VIP por slug (GET)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const vipContent = await Vip.findOne({ where: { slug } });
    if (!vipContent) {
      return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
    }
    res.status(200).json(vipContent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o conteúdo VIP por slug: ' + error.message });
  }
});

// Rota para contar as views de um conteúdo VIP
router.post('/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    const vipContent = await Vip.findByPk(id);

    if (!vipContent) {
      return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
    }

    // Incrementa o contador de views
    await vipContent.increment('views');

    // Busca novamente o conteúdo atualizado para retornar o número de views
    const updatedVipContent = await Vip.findByPk(id);

    res.status(200).json(updatedVipContent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao contar a visualização: ' + error.message });
  }
});

// Criar (POST) - Adicionar um novo conteúdo VIP ou múltiplos conteúdos com slug fornecido
router.post('/', async (req, res) => {
  try {
    const vipContents = Array.isArray(req.body) ? req.body : [req.body];
    const createdContents = [];

    for (const content of vipContents) {
      // Verifica se o slug foi fornecido na requisição
      if (!content.slug) {
        return res.status(400).json({ error: 'O campo "slug" é obrigatório.' });
      }

      // Verifica se já existe um conteúdo com o slug fornecido
      const existingVip = await Vip.findOne({ where: { slug: content.slug } });
      if (existingVip) {
        return res.status(409).json({ error: `O slug "${content.slug}" já está sendo utilizado.` });
      }

      const createdContent = await Vip.create(content);
      createdContents.push(createdContent);
    }

    res.status(201).json(createdContents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar os conteúdos VIP: ' + error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const vipContents = await Vip.findAll();
    res.status(200).json(vipContents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os conteúdos VIP: ' + error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vipContent = await Vip.findByPk(id);
    if (!vipContent) {
      return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
    }
    res.status(200).json(vipContent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o conteúdo VIP: ' + error.message });
  }
});

// Atualizar (PUT) - Atualizar conteúdo VIP (permitindo a atualização do slug)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link, category, postDate, slug } = req.body;

    const vipContentToUpdate = await Vip.findByPk(id);
    if (!vipContentToUpdate) {
      return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
    }

    vipContentToUpdate.name = name;
    vipContentToUpdate.link = link;
    vipContentToUpdate.category = category || vipContentToUpdate.category;
    vipContentToUpdate.postDate = postDate || vipContentToUpdate.postDate;

    // Se um novo slug foi fornecido
    if (slug && slug !== vipContentToUpdate.slug) {
      const existingVipWithNewSlug = await Vip.findOne({ where: { slug } });
      if (existingVipWithNewSlug) {
        return res.status(409).json({ error: `O slug "${slug}" já está sendo utilizado.` });
      }
      vipContentToUpdate.slug = slug;
    }

    await vipContentToUpdate.save();

    res.status(200).json(vipContentToUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o conteúdo VIP: ' + error.message });
  }
});

// Deletar (DELETE) - Deletar conteúdo VIP
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vipContentToDelete = await Vip.findByPk(id);
    if (!vipContentToDelete) {
      return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
    }

    await vipContentToDelete.destroy();
    res.status(200).json({ message: 'Conteúdo VIP deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar o conteúdo VIP: ' + error.message });
  }
});

module.exports = router;