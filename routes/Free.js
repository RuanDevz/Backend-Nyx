const express = require('express');
const router = express.Router();
const { Free } = require('../models');

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
        const { name, link, createdAt } = req.body; // Incluindo 'createdAt' no corpo da requisição

        const freeContentToUpdate = await Free.findByPk(id);
        if (!freeContentToUpdate) {
            return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
        }

        freeContentToUpdate.name = name;
        freeContentToUpdate.link = link;
        freeContentToUpdate.createdAt = createdAt || freeContentToUpdate.createdAt; // Atualiza a data se passada, senão mantém a existente

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
