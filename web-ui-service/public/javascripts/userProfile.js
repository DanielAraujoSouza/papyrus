const uploadInput = document.querySelector("input#upload-input");
const prevImage = document.querySelector("img#prev-image");
const prevIcon = document.querySelector("span#prev-icon");
const removeImageBtn = document.querySelector("button#reset-btn");
const removeImg = document.querySelector("input#remove-img");

const alertContainer = document.querySelector("div#alert");
const alertIcon = document.querySelector("span#alert-icon");
const alertText = document.querySelector("span#alert-text");

const name = document.querySelector("input#name");
const email = document.querySelector("input#email");
const password = document.querySelector("input#password");
const passwordConfirmation = document.querySelector("input#password-confirmation");

const uploadBtn = document.querySelector("button#upload-btn");
const updateBtn = document.querySelector("button#update-btn");
const updateBtnIcon = document.querySelector("span#update-btn-icon");
const updateBtnText = document.querySelector("label#update-btn-text");

const spanName = document.querySelector("span#name-erro");
const spanEmail = document.querySelector("span#email-erro");
const spanPassword = document.querySelector("span#password-erro");
const spanPasswordConfirmation = document.querySelector("span#password-confirmation-erro");
const spanAvatar= document.querySelector("span#avatar-erro");

const form = document.querySelector("form#user-form");

// Enviar o formulario de forma assincrona
form.addEventListener('submit', e => {
  e.preventDefault();
  
  const data = new FormData(form);
  blockForm(true);

  fetch(form.action, {
    method: "PUT",
    body: data
  })
  .then(response => {
    if (response.status === 401){
      window.location.href = "/";
    }
    else if (response.status === 304){
      showAlert('warning', 'Nenhuma modificação identificada!');
    }
    else {
      return response.json();
    }
  })
  .then(jsonResponse => {

    if (jsonResponse !== undefined) {
      const erros = jsonResponse.erros || "";
      if (erros) {
        spanName.innerHTML = erros.name || "";  
        spanEmail.innerHTML = erros.email || "";  
        spanPassword.innerHTML = erros.password || "";  
        spanPasswordConfirmation.innerHTML = erros.password_confirmation || "";  
        spanAvatar.innerHTML = erros.avatar || "";  
      }
      else {
        // Notificação de sucesso
        showAlert('success', 'Atualizado com sucesso!');
      }
    }
  })
  .catch(e => {
    showAlert('danger', 'Erro de conexão!');
  })
  .finally(() => {
    blockForm(false);
  });
});


uploadBtn.addEventListener('click', e => {
  spanAvatar.innerHTML = "";
  uploadInput.click();
});

uploadInput.addEventListener("change", function(){
  const file = this.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = function(){
      prevImage.src = reader.result;
      prevImage.classList.remove("hidden");
      prevIcon.classList.add("hidden");
      removeImageBtn.classList.remove("hidden");
      removeImg.value = "";
    }
    reader.readAsDataURL(file);
  }
});

removeImageBtn.addEventListener("click", function(){
  prevImage.src = "";
  prevImage.classList.add("hidden");
  prevIcon.classList.remove("hidden");
  removeImageBtn.classList.add("hidden");
  removeImg.value = "remove";
  uploadInput.value = "";
});

function blockForm(blocked) {
  name.disabled = blocked;
  email.disabled = blocked;
  password.disabled = blocked;
  passwordConfirmation.disabled = blocked;
  uploadBtn.disabled = blocked;
  updateBtn.disabled = blocked;
  removeImageBtn.disabled = blocked;

  if(blocked) {
    updateBtnIcon.classList.remove("mdi-check");
    updateBtnIcon.classList.add("mdi-loading");
    updateBtnIcon.classList.add("mdi-spin");
    updateBtnText.innerHTML = "Atualizando...";
  }
  else {
    updateBtnIcon.classList.add("mdi-check");
    updateBtnIcon.classList.remove("mdi-loading");
    updateBtnIcon.classList.remove("mdi-spin");
    updateBtnText.innerHTML = "Atualizar";
  }
}

name.addEventListener('focus', () => {
  spanName.innerHTML = '';
});

email.addEventListener('focus', () => {
  spanEmail.innerHTML = '';
});

passwordConfirmation.addEventListener('focus', () => {
  spanPasswordConfirmation.innerHTML = '';
});

password.addEventListener('focus', () => {
  spanPassword.innerHTML = '';
});

uploadBtn.addEventListener('focus', () => {
  spanAvatar.innerHTML = '';
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