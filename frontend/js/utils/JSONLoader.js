

export async function loadJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Erreur lors du chargement de ${path}`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  
  export async function loadTemplate(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Erreur lors du chargement du template ${path}`);
      const html = await res.text();
  
      // Injecter dans le DOM pour récupérer via document.getElementById
      const templateContainer = document.createElement('div');
      templateContainer.innerHTML = html;
  
      const template = templateContainer.querySelector('template');
      if (template) document.body.appendChild(template);
  
      return template;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  