const uploadBtn = document.querySelector("button#upload-btn");
const uploadInput = document.querySelector("input#upload-input");
const prevImage = document.querySelector("img#prev-image");
const prevIcon = document.querySelector("svg#prev-icon");
const alertSuccess = document.querySelector("div#alertSuccess");

const title = document.querySelector("input#title");
const spanTitle = document.querySelector("span#title-erro");
const genre = document.querySelector("textarea#genre");
const spanGenre = document.querySelector("span#genre-erro");
const author = document.querySelector("select#author");
const spanAuthor = document.querySelector("span#author-erro");
const description = document.querySelector("textarea#description");
const spanDescription = document.querySelector("span#description-erro");
const spanPoster = document.querySelector("span#poster-erro");

const dateDeath = document.querySelector("input#date-of-death");
const spanDateDeath = document.querySelector("span#date-death-erro");
const dateBirth = document.querySelector("input#date-of-birth");
const spanDateBirth = document.querySelector("span#date-birth-erro");

const subBtn = document.querySelector("button#subBtn");
const loadSub = document.querySelector("img#loadSubIcon");
const btnSubText = document.querySelector("span#btnSubText");

const titleForm = document.querySelector("form#titleForm");

// Enviar o formulario de forma assincrona
titleForm.addEventListener('submit', e => {
  e.preventDefault();
  
  const data = new FormData(titleForm);
  blockTitleForm(true);

  fetch(titleForm.action, {
    method: "POST",
    body: data
  })
  .then(response => {
    if (response.status === 401){
      window.location.href = "/";
    }
    return response.json();
  })
  .then(jsonResponse => {
    const erros = jsonResponse.erros;
    if (erros !== undefined) {
      spanTitle.innerHTML = erros.title !== undefined ? erros.title: "";
      if (genre && author) {
        spanGenre.innerHTML = erros.genre !== undefined ? erros.genre: "";
        spanAuthor.innerHTML = erros.author !== undefined ? erros.author: "";
      }
      if (dateDeath && dateBirth){
        spanDateBirth.innerHTML = erros.date_of_birth !== undefined ? erros.date_of_birth: "";
        spanDateDeath.innerHTML = erros.date_of_death !== undefined ? erros.date_of_death: "";
      }      
      spanDescription.innerHTML = erros.description !== undefined ? erros.description: "";
      spanPoster.innerHTML = erros.poster !== undefined ? erros.poster: "";
      blockTitleForm(false);
    }
    else {
      // Reseta o formulario
      titleForm.reset();

      // Remove a pre-visualiação
      prevImage.style.display = "none";
      prevIcon.style.display = "block";

      // Notificação de sucesso
      alertSuccess.style.visibility = 'visible';
      alertSuccess.style.maxHeight = '40px';

      // Remove a Notificação de sucesso
      window.setTimeout(() => {
        alertSuccess.style.maxHeight = '0';
        alertSuccess.style.visibility = 'hidden';
      },5000);
      blockTitleForm(false);
    }
  })
  .catch(e => {
    blockTitleForm(false);
    spanTitle.innerHTML = 'Erro de conexão!';
  });
});

function blockTitleForm(blocked) {
  loadSub.style.width = blocked ? "auto" : 0;
  loadSub.style.height = blocked ? "auto" : 0;
  loadSub.style.visibility = blocked ? "visible" : 'hidden';
  btnSubText.innerHTML = blocked ? "" : "Enviar";

  title.disabled = blocked;
  description.disabled = blocked;
  if (genre && author) {
    genre.disabled = blocked;
    author.disabled = blocked;
  }
  if (dateDeath && dateBirth){
    dateBirth.disabled = blocked;
    dateDeath.disabled = blocked;
  }  
}

// Remove as mensagens de erro
if (genre && author) {
  genre.addEventListener('focus', () => {
    spanGenre.innerHTML = '';
  });
  
  author.addEventListener('focus', () => {
    spanAuthor.innerHTML = '';
  });
}
if (dateDeath && dateBirth){
  dateBirth.addEventListener('focus', () => {
    spanDateBirth.innerHTML = '';
  });
  
  dateDeath.addEventListener('focus', () => {
    spanDateDeath.innerHTML = '';
  });
}

title.addEventListener('focus', () => {
  spanTitle.innerHTML = '';
});

description.addEventListener('focus', () => {
  spanDescription.innerHTML = '';
});

uploadBtn.addEventListener('click', e => {
  spanPoster.innerHTML = "";
  uploadInput.click();
});

uploadInput.addEventListener("change", function(){
  const file = this.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = function(){
      prevImage.src = reader.result;
      prevImage.style.display = "block";
      prevIcon.style.display = "none";
    }
    reader.readAsDataURL(file);
  }
});