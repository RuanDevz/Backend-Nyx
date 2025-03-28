const express = require('express');
const router = express.Router();
const { Free } = require('../models');

// Rota para contar as views de um conteúdo gratuito
router.post('/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    const freeContent = await Free.findByPk(id);

    if (!freeContent) {
      return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
    }

    // Incrementa o contador de views
    await freeContent.increment('views');

    // Busca novamente o conteúdo atualizado para retornar o número de views
    const updatedFreeContent = await Free.findByPk(id);

    res.status(200).json(updatedFreeContent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao contar a visualização: ' + error.message });
  }
});

// Criar (POST) - Adicionar um novo conteúdo gratuito ou múltiplos conteúdos
router.post('/', async (req, res) => {
  try {
    const freeContents = req.body; // Pode ser um único objeto ou um array de objetos

    let createdContents;
    if (Array.isArray(freeContents)) {
      // Caso seja um array, use bulkCreate
      createdContents = await Free.bulkCreate(freeContents);
    } else {
      // Caso seja um único objeto, use create
      createdContents = await Free.create(freeContents);
    }

    res.status(201).json(createdContents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar os conteúdos gratuitos: ' + error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const freeContents = await Free.findAll();
    res.status(200).json(freeContents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os conteúdos gratuitos: ' + error });
  }
});

// Buscar um conteúdo gratuito por ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const freeContent = await Free.findByPk(id);
    if (!freeContent) {
      return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
    }
    res.status(200).json(freeContent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o conteúdo gratuito' });
  }
});

// Atualizar (PUT) - Atualizar conteúdo gratuito
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link, category, postDate } = req.body;

    const freeContentToUpdate = await Free.findByPk(id);
    if (!freeContentToUpdate) {
      return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
    }

    freeContentToUpdate.name = name;
    freeContentToUpdate.link = link;
    freeContentToUpdate.category = category;
    freeContentToUpdate.postDate = postDate || freeContentToUpdate.postDate;

    await freeContentToUpdate.save();

    res.status(200).json(freeContentToUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o conteúdo gratuito' });
  }
});

// Deletar (DELETE) - Deletar conteúdo gratuito
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const freeContentToDelete = await Free.findByPk(id);
    if (!freeContentToDelete) {
      return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
    }

    await freeContentToDelete.destroy();
    res.status(200).json({ message: 'Conteúdo gratuito deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar o conteúdo gratuito' });
  }
});

module.exports = router;