export async function saveAnswer(surveyId, userId, answer) {
    try {
      const res = await fetch('http://localhost:5000/api/responses/add', {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          userId,
          answers: [answer] 
        })
      });
  
      const data = await res.json();
      console.log('Réponse sauvegardée:', data);
      return data;
    } catch (err) {
      console.error('Erreur sauvegarde réponse:', err);
    }
  }
  
  export async function saveAllResponses(surveyId, userId, answers) {
    try {
      const res = await fetch('http://localhost:5000/api/responses/create', {
        method: 'POST', // Création d'un nouveau document
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, userId, answers })
      });
  
      const data = await res.json();
      console.log('Réponses finales enregistrées :', data);
      return data;
    } catch (err) {
      console.error('Erreur lors de l’enregistrement final :', err);
    }
  }
  