export async function loadTemplate(path) {
    const response = await fetch(path);
    const htmlText = await response.text();
    const templateWrapper = document.createElement('div');
    templateWrapper.innerHTML = htmlText;
    const template = templateWrapper.querySelector('template');
    if(template) document.body.appendChild(template); // injecter dans le DOM
    return template;
  }
  