import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import responseRoutes from './routes/responseRoutes.js';

dotenv.config();

console.log('ENV OK:', process.env.MONGO_URI);


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`REQ GLOBAL: ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/responses', responseRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connecté'))
.catch(err => console.error('Erreur MongoDB:', err));

// Démarrer le serveur
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
