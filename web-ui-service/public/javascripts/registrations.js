const registrationForm = document.querySelector('form#registrationForm');
const name = document.querySelector("input#name");
const spanName = document.querySelector("span#name-erro");
const password = document.querySelector("input#password");
const spanPassword = document.querySelector("span#password-erro");
const passwordConfirm = document.querySelector("input#password-confirm");
const spanPasswordConfirm = document.querySelector("span#password-confirm-erro")
const email = document.querySelector("input#email");
const spanEmail = document.querySelector("span#email-erro")
const loadReg = document.querySelector("span#loadRegIcon");
const btnRegText = document.querySelector("span#btnRegText");
const regBtn = document.querySelector("button#regBtn")
const btnModal = document.querySelector("button#btnModal");
const notificationModal = document.querySelector("div#notificationModal");
const modalWrapper = document.querySelector("div.modal-wrapper");

// Valida o formulário antes de enviar
registrationForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if(nameValidator() && passwordValidator() && passwordConfirmValidator() && emailValidator()){
    const data = new URLSearchParams(new FormData(registrationForm));
    blockRegistrationForm(true);
    fetch("/user/registration", {
      method: "POST",
      body: data,
    })
    .then(response => {
      if(!response.ok) {
        blockRegistrationForm(false);
      }
      return response.json();
    })
    .then(jsonResponse => {
      const erros = jsonResponse.erros;
      if (erros !== undefined) {
        spanName.innerHTML = erros.name || "";
        spanPassword.innerHTML = erros.password || "";
        spanPasswordConfirm.innerHTML = erros.password_confirm || "";
        spanEmail.innerHTML = erros.email || "";
      }
      else if (jsonResponse.id != undefined) {
        blockRegistrationForm(true);
        notificationModal.style.display = "block";
        window.setTimeout(() => {
          modalWrapper.style.maxHeight = "300px";
        },300);
      }
    })
    .catch(() => {
      // Desbloqueia o formulario
      blockRegistrationForm(false);
      spanEmail.innerHTML = 'Erro de conexão!';
    });
  }
});

function blockRegistrationForm(blocked) {
  loadReg.style.display = blocked ? "block" : 'none';
  btnRegText.innerHTML = blocked ? "Registrando..." : "Registrar";
  regBtn.disabled = blocked;
  name.disabled = blocked;
  password.disabled = blocked;
  passwordConfirm.disabled = blocked;
  email.disabled = blocked;
}
// Verificação o campo name
name.addEventListener('blur', () => {
  nameValidator();
});
// Remove mensagem de erro
name.addEventListener('focus', () => {
  spanName.innerHTML = '';
});

// Verificação o campo password
password.addEventListener('blur', () => {
  passwordValidator();
  passwordConfirmValidator();
});
// Remove mensagem de erro
password.addEventListener('focus', () => {
  spanPassword.innerHTML = '';
});

// Valida a senha de confirmação
passwordConfirm.addEventListener('blur', () => {
  passwordValidator();
  passwordConfirmValidator();
});
// Remove mensagem de erro
passwordConfirm.addEventListener('focus', () => {
  spanPasswordConfirm.innerHTML = '';
});

// Verificação o campo de e-mail
email.addEventListener('blur', () => {
  if (emailValidator()){
    // Verificação de forma assincrona se o email está disponível
    fetch(`/users/${email.value}/available`, {
      method: 'GET'
    })
    .then(response => {
      if(!response.ok) {
        throw new Error('Erro de conexão!');
      }
      return response.json();
    })
    .then(jsonResponse => {
      if(jsonResponse.available === 'false'){
        spanEmail.innerHTML = 'Endereço de e-mail já cadastrado';
      }
    });
  }
});
// Remove mensagem de erro
email.addEventListener('focus', () => {
  spanEmail.innerHTML = '';
});

function nameValidator() {
  if (name.value.length < 4){
    spanName.innerHTML = 'Nome deve conter pelo menos 4 caractéres!';
    return false;
  }
  else {
    return true;
  }
}

function emailValidator() {
  const emailRegexp = new RegExp("^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$");
  if (emailRegexp.test(email.value)) {
    return true;
  }
  else {
    spanEmail.innerHTML = 'Endereço de e-mail inválido!';
    return false;
  }
}

function passwordValidator() {
  const passwordRegexp = new RegExp("^[-!#$@%&'*+/0-9=?A-Z^_`a-z{|}~\(\)]{8,}$");
  if (!passwordRegexp.test(password.value)){
    spanPassword.innerHTML = 'A senha deve conter pelo menos 8 caractéres sem espaçamento!';
    return false;
  }
  else {
    return true;
  }
}

function passwordConfirmValidator() {
  if (passwordConfirm.value != password.value){
    spanPasswordConfirm.innerHTML = 'As senhas não são iguais!';
    return false;
  }
  else {
    spanPasswordConfirm.innerHTML = '';
    return true;
  }
}

// Modal
btnModal.addEventListener("click", () => {
  window.location.href = "/";
})