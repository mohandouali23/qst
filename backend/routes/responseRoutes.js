import express from 'express';
import Response from '../models/Response.js';

const router = express.Router();

// POST : enregistrer une réponse
router.post('/', async (req, res) => {
    try {
        const { surveyId, userId, answers } = req.body;
        const response = new Response({ surveyId, userId, answers });
        await response.save();
        res.status(201).json({ message: 'Réponses enregistrées', response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET : récupérer toutes les réponses
router.get('/', async (req, res) => {
    try {
        const responses = await Response.find();
        res.status(200).json(responses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
