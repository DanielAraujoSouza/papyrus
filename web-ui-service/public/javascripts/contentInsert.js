const uploadBtn = document.querySelector("button#upload-btn");
const uploadInput = document.querySelector("input#upload-input");
const prevImage = document.querySelector("img#prev-image");
const prevIcon = document.querySelector("svg#prev-icon");

const alertContainer = document.querySelector("div#alert");
const alertIcon = document.querySelector("span#alert-icon");
const alertText = document.querySelector("span#alert-text");

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
const loadSub = document.querySelector("span#loadSubIcon");
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
      spanTitle.innerHTML = erros.title || "";
      if (genre && author) {
        spanGenre.innerHTML = erros.genre || "";
        spanAuthor.innerHTML = erros.author || "";
      }
      if (dateDeath && dateBirth){
        spanDateBirth.innerHTML = erros.date_of_birth || "";
        spanDateDeath.innerHTML = erros.date_of_death || "";
      }      
      spanDescription.innerHTML = erros.description || "";
      spanPoster.innerHTML = erros.poster || "";
      blockTitleForm(false);
    }
    else {
      // Reseta o formulario
      titleForm.reset();

      // Remove a pre-visualiação
      prevImage.style.display = "none";
      prevIcon.style.display = "block";

      // Notificação de sucesso
      showAlert('success', 'Adicionado com sucesso!');

      blockTitleForm(false);
    }
  })
  .catch(e => {
    blockTitleForm(false);
    showAlert('danger', 'Erro de conexão!');
  });
});

function blockTitleForm(blocked) {
  subBtn.disabled = blocked;
  uploadBtn.disabled = blocked;
  
  if(blocked) {
    loadSub.classList.remove("mdi-check");
    loadSub.classList.add("mdi-loading");
    loadSub.classList.add("mdi-spin");
    btnSubText.innerHTML = "Adicionando...";
  }
  else {
    loadSub.classList.add("mdi-check");
    loadSub.classList.remove("mdi-loading");
    loadSub.classList.remove("mdi-spin");
    btnSubText.innerHTML = "Adicionar";
  }
  
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

function showAlert (type, txt) {
  // Notificação de sucesso
  alertContainer.style.visibility = 'visible';
  alertContainer.style.maxHeight = '40px';
  alertContainer.classList = "";
  alertContainer.classList.add("alert");
  alertIcon.classList = "";
  alertIcon.classList.add("mdi");

  alertText.innerHTML = txt;

  if (type === "success") {
    alertIcon.classList.add("mdi-check-circle");
    alertContainer.classList.add("alert-success");
  }
  else if (type === "danger") {
    alertIcon.classList.add("mdi-close-octagon");
    alertContainer.classList.add("alert-danger");
  }
  else if (type === "warning") {
    alertIcon.classList.add("mdi-alert");
    alertContainer.classList.add("alert-warning");
  }

  // Remove a Notificação de sucesso
  window.setTimeout(() => {
    alertContainer.style.maxHeight = '0';
    alertContainer.style.visibility = 'hidden';
  },5000);
}