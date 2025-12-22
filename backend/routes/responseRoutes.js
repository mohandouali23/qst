import express from 'express';
import Response from '../models/Response.js';

const router = express.Router();

// Middleware pour log toutes les requêtes
router.use((req, res, next) => {
    console.log(`Requête ${req.method} sur ${req.url}`);
    console.log('Body:', req.body);
    next();
});

// POST : créer un nouveau document de réponses
// URL : /api/responses/create
router.post('/create', async (req, res) => {
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
// URL : /api/responses/all
router.get('/all', async (req, res) => {
    try {
        const responses = await Response.find();
        res.status(200).json(responses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT : remplacer complètement les réponses d'un utilisateur
// URL : /api/responses/update
router.put('/update', async (req, res) => {
    try {
        const { surveyId, userId, answers } = req.body;

        if (!surveyId || !userId || !answers) {
            return res.status(400).json({ error: 'surveyId, userId et answers sont requis' });
        }

        const updatedResponse = await Response.findOneAndUpdate(
            { surveyId, userId },
            { $set: { answers, createdAt: new Date() } },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: 'Réponses mises à jour avec succès',
            response: updatedResponse
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT : ajouter de nouvelles réponses sans supprimer les anciennes
// URL : /api/responses/add
router.put('/add', async (req, res) => {
    try {
        const { surveyId, userId, answers } = req.body;

        if (!surveyId || !userId || !answers) {
            return res.status(400).json({ error: 'surveyId, userId et answers sont requis' });
        }

        const updatedResponse = await Response.findOneAndUpdate(
            { surveyId, userId },
            { 
                $push: { answers: { $each: answers } },
                $set: { createdAt: new Date() }
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: 'Nouvelles réponses ajoutées avec succès',
            response: updatedResponse
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
