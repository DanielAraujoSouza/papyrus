const commentForm = document.querySelector("form#new-comment-form");

if (commentForm) {

  window.addEventListener('load', e => {
    const allRemoveCommentButtons = document.querySelectorAll(".delete-commentary-icon");
    allRemoveCommentButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        removeCommentary(btn.id);
      });
    })
  })

  const commentText = document.querySelector("textarea#new-comment");
  const commentButton = document.querySelector("button#new-comment-form-button");
  const commentButtonLabel = document.querySelector("label#comment-button-label");
  const commentButtonIcon = document.querySelector("span#comment-button-icon");
  const commentErro = document.querySelector("span#comment-erro");
  const commentsContainer = document.querySelector("div.comments-container");
  const newCommentContainer = document.querySelector("div.comments-container");
  const noAddedText = document.querySelector("p#no-comments-added-text");

  commentForm.addEventListener("submit", e => {
    e.preventDefault();
    blockCommentForm(true);

    fetch(`${window.location.pathname}/commentary`, {
      method: "PUT",
      body: JSON.stringify({ comment_text: commentText.value }),
      headers: { "Content-Type": "application/json" },
    })
    .then(response => {
      blockCommentForm(false);
      return response.json();
    })
    .then(jsonResponse => {
      const erros = jsonResponse.erros;
      if (erros !== undefined) {
        commentErro.innerHTML = erros.comment_text || "";
      }
      else if (Object.keys(jsonResponse).length) {
        commentForm.reset();
        commentErro.innerHTML = '';
        if (noAddedText) {
          noAddedText.remove();
        }
        insertCommentary(jsonResponse);
      }
      else {
        throw Error;
      }
    })
    .catch(() => {
      commentErro.innerHTML = 'Erro de conexão!';
    });
  });

  function blockCommentForm(blocked) {
    if (blocked) {
      commentButtonIcon.classList.remove("mdi-comment-arrow-right");
      commentButtonIcon.classList.add("mdi-loading");
      commentButtonIcon.classList.add("mdi-spin");
      commentButtonLabel.innerHTML = "Comentando"
    }
    else {
      commentButtonIcon.classList.add("mdi-comment-arrow-right");
      commentButtonIcon.classList.remove("mdi-loading");
      commentButtonIcon.classList.remove("mdi-spin");
      commentButtonLabel.innerHTML = "Comentar"
    }
    commentButton.disabled = blocked;
    commentText.disabled = blocked;
  }

  // Remove mensagem de erro
  commentText.addEventListener('focus', () => {
    commentErro.innerHTML = '';
  });


  function insertCommentary(commentaryInfo) {
    const commentContainer = document.createElement("div");

    if (newCommentContainer && commentaryInfo) {
      
      commentContainer.className = "comment-container";
      commentContainer.id = `container-${commentaryInfo._id}`;
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "comment-user-image-wrapper";

      let avatar = null;
      if (commentaryInfo.user.avatar_path) {
        avatar = document.createElement("img");
        avatar.className = "comment-user-image";
        avatar.src = commentaryInfo.user.avatar_path;
      }
      else {
        avatar = document.createElement("span");
        avatar.classList.add("mdi", "mdi-account-circle", "comment-user-image");
      }

      imageWrapper.appendChild(avatar);
      commentContainer.appendChild(imageWrapper);

      const commentContent = document.createElement("div");
      commentContent.className = "comment-content-container";

      const delIcon = document.createElement("span");
      delIcon.classList.add("mdi", "mdi-delete-forever", "delete-commentary-icon");
      delIcon.id = commentaryInfo._id;
      delIcon.addEventListener('click', e => {
        removeCommentary(delIcon.id);
      });
      commentContent.appendChild(delIcon);

      const username = document.createElement("h3");
      username.innerHTML = commentaryInfo.user.name;

      const date = document.createElement("span");
      const dateFormat = { day: "2-digit", month: "2-digit", year: "numeric", hour: "numeric", minute: "numeric" };
      const dateComment = new Date(commentaryInfo.date)
      .toLocaleDateString('pt-BR', dateFormat);
      const dateAndTime = dateComment.split(" ");
      const dateValues = dateAndTime[0].replace(/\//g,"-");
      date.innerHTML = `${dateValues} as ${dateAndTime[1]}`;
      date.className = "commentDate";
      
      const commentText = document.createElement("p");
      commentText.innerHTML = commentaryInfo.comment_text;

      commentContent.appendChild(username);
      commentContent.appendChild(date);
      commentContent.appendChild(commentText);
      commentContainer.appendChild(commentContent);

      commentsContainer.insertAdjacentElement('afterbegin', commentContainer)
    }
  }

  function removeCommentary(commentID) {
    fetch(`${window.location.pathname}/commentary/${commentID}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    .then(response => {
      if(response.status === 401){
        window.location.href = "/"
      }
      return response.json();
    })
    .then(jsonResponse => {
      const erros = jsonResponse.erros;
      if (erros !== undefined) {
        commentErro.innerHTML = erros.comment_text || "";
      }
      else if (Object.keys(jsonResponse).length) {
        document.querySelector(`div#container-${commentID}`).remove();
      }
      else {
        throw Error;
      }
    })
    .catch(() => {
      commentErro.innerHTML = 'Erro de conexão!';
    });
  }
}

const favoriteButton = document.querySelector("button#favorite-button");
if (favoriteButton) {
  const favoriteIcon = document.querySelector("span#favorite-icon");
  const favoriteText = document.querySelector("label#favorite-label");

  favoriteButton.addEventListener('click', e => {
    favoriteButton.blocked = true;
    const isAdd = favoriteButton.classList.contains("add");

    fetch(`${window.location.pathname}/favorites`, {
      method: isAdd ? "PUT" : "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    .then(response => {
      if(response.status === 401){
        location.reload();
      }
      return response.json();
    })
    .then(jsonResponse => {
      if (Object.keys(jsonResponse).length) {
        favoriteIcon.classList.remove(isAdd ? "mdi-heart-plus" : "mdi-heart-minus");
        favoriteIcon.classList.add(isAdd ? "mdi-heart-minus" : "mdi-heart-plus");
        favoriteButton.classList.remove(isAdd ? "add" : "remove");
        favoriteButton.classList.add(isAdd ? "remove" : "add");
        favoriteText.innerHTML = isAdd ? "Desfavoritar" : "Favoritar";
      }
    })
    .finally(() => {
      favoriteButton.blocked = false;
    });
  });
}