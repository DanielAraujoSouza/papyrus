# Papyrus
> Aplicação WEB distribuída, simples, utilizando arquitetura de microsserviços, para gestão do catálogo de livros de uma biblioteca.

<div align="center">
  <img src= ".images/papyrus-logo.svg" width="50%" loading="lazy">
</div>

Papyrus é uma aplicação WEB desenvolvida como projeto final da disciplina de Desenvolvimento de Sistemas Distribuídos do curso de Engenharia de Computação da Universidade Federal do Ceará (TI0161 - DETi/UFC, 2020.1).

## Aplicação

Essa aplicação foi desenvolvida para ser executada de forma distribuída, onde cada serviço e banco de dados será instaciado individualemte dentro de um ambiente de nuvem. Para esse projeto os ambientes de nuvem utilizado foram:

* [Microsoft Azure](https://azure.microsoft.com/pt-br/), para intanciar os microsserviços, realizar o armazenamento de arquivos estáticos (uploads) e armazenar os bancos de dados mais simples (sessão e usuários);

* [MongoDB Cloud](https://www.mongodb.com/cloud), responsável por armazenar os bancos de busca em index de texto (livros e autores).

### Tecnologias de Desenvolvimento

Para o desenvolvimento do back-end foi utilizado [Node.js V12](https://nodejs.org/) e o framework [Express 4](https://www.npmjs.com/package/express) para o servidor.

Para o desenvolvimento do front-end foi utilizado HTML5, CSS e JavaScript.

### Arquitetura de Micro Serviços

<div align="center">
  <img src= ".images/arquitetura-serviços.png" width="50%" loading="lazy">
</div>

Como pode ser visto na imagem acima, a aplicação foi subdividida nos seguintes serviços:

* **API GATEWAY** - serviço que fica entre as requisições dos clientes e os demais serviços da aplicação. É na API Gateway que encontra-se o controle de rotas de entrada e o controle de autorização, garantindo que apenas usuarios com os devidos privilégios tenham acesso a algumas funcionalidades, por exemplo funções de administração e funcionalidade de usuários cadastrados na plataforma.

* **WEB UI** - responsável por renderizar as páginas HTML, disponibilizar as folhas de estilo (CSS) e os scripts (JS) da aplicação.

* **USERS** - responsável por todas as regras de negócio (CRUD) referentes a usuários, bem como acesso ao banco de dados de usuários. 

* **SEARCH** - responsável pela orquestração de buscas nos serviços de autores e livros. 

* **AUTHORS** - responsável por todas as regras de negócio (CRUD) referentes a autores, bem como acesso ao banco de dados de autores. 

* **BOOKS** - responsável por todas as regras de negócio (CRUD) referentes a livros, bem como acesso ao banco de dados de autores. 

### Arquitetura de Nuvem

<div align="center">
  <img src= ".images/arquitetura-nuvem.png" width="80%" loading="lazy">
</div>

Cada serviço foi instanciado utilizando o [Serviço de Aplicativos](https://azure.microsoft.com/pt-br/services/app-service/) da nuvem Azure. Essas instâncias consistem em um contêiner [Docker](https://www.docker.com/) com uma versão genérica do sistema operacional [Debian 9](https://www.debian.org/).

Para a persistência de dados estáticos (uploads) foi utlizando o serviço [Armazenamento de Blob](https://azure.microsoft.com/pt-br/services/storage/blobs/) da nuvem Azure. A integração com a aplicação foi realizada utilizando o SDK para Node.JS.

A persistência de dados dinâmicos foi realizada em bancos de dados [MongoDB](https://www.mongodb.com/). Os seguintes serviços foram utlizados:
* [CosmosDB](https://azure.microsoft.com/pt-br/services/cosmos-db/), da nuvem azure, para os bancos dados de sessão (api gateway) e de usuários.
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), da nuvem MongoDB, para os bancos de dados de livros e autores. Esse serviço foi utilizado pois o CosmosDB, por ser uma abstração do banco de dados MongoDB, não permite pesquisas em índices de texto, já o MongoDB Atlas executa MongoDB nativo e permite tais pesquisas.

## Implantação

Para o implantação dos microsserviços por meio do código é recomendavel a utlização da [extensão do Serviço de Aplicativo do Azure](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice) para [Visual Studio Code](https://code.visualstudio.com/). Também é possivel utlizar FTP ou GIT, para mais informações veja a documentação do GIT.

Para clonar o repositorio utilizando [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) execute o seguinte comando:

```sh
git clone https://github.com/DanielAraujoSouza/papyrus.git
```

## Serviço Autores e Livros

Dentro do diretório de cada um desses serviços (`papyrus/author-service` e `papyrus/book-service`) haverá um arquivo `.env.example` contendo as variaveis de ambiente que são necessarias para o funcionamento do serviço. Copie esse arquivo para `.env` e preencha as variávies:
* **`PORT=`** com a porta onde o servidor da API irá executar;
* **`MONGO_CONNECTION=`** URI de conexão com o banco de dados;
* **`MONGO_DB=`** nome do banco de dados.
> Por exemplo:
> ```
> # .env, not committed to repo
> PORT=3000
> 
> # Data base
> MONGO_CONNECTION=mongodb://username:password@host:port/authorsdb
> MONGO_DB=authorsdb
> ```

> **OBS.:** Após a criação dos bancos de dados desses serviços, dependendo do plataforma MongoDB, pode ser necessário criar os indices de pesquisa em texto. Para isso, a partir da CLI do banco de dados, execute os comando abaixo, substituindo `CollectionName` pelo nome da coleção utilizada.
> 
> Para Autores:
> ```
> db.CollectionName.createIndex({ 
>     "name": "text", 
>     "description": "text"
> });
> ```
> Para Livros:
> ```
> db.CollectionName.createIndex({
>   "title": "text", 
>   "authors.name": "text", 
>   "summary": "text", 
>   "genre": "text",
>   "type": "text"
> });
> ```

## Serviço Pesquisa
Dentro do diretório `papyrus/search-service` copie ou renomeie o arquivo `.env.example` para `.env`. Em seguida preencha as variávies:
* **`PORT=`** com a porta onde o servidor da API irá executar;
* **`BOOK_SERVICE=`** endereço de acesso a API **book-service**;
* **`AUTHOR_SERVICE=`** endereço de acesso a API **author-service**.
> Exemplo:
> ```
> # .env, not committed to repo
> PORT=3000
> 
> # Microservices Proxy
> BOOK_SERVICE=https://book.azurewebsites.net/books
> AUTHOR_SERVICE=https://author.azurewebsites.net/authors
> ```

## Serviço Interface de Usuários
Dentro do diretório `papyrus/web-ui-service` copie ou renomeie o arquivo `.env.example` para `.env`. Em seguida preencha as variávies:
* **`PORT=`** com a porta onde o servidor da API irá executar;
* **`USER_SERVICE=`** endereço de acesso a API **user-service**;
* **`SEARCH_SERVICE=`** endereço de acesso a API **search-service**;
* **`BOOK_SERVICE=`** endereço de acesso a API **book-service**;
* **`AUTHOR_SERVICE=`** endereço de acesso a API **author-service**.
> Exemplo:
> ```
> # .env, not committed to repo
> PORT=3000
> 
> # Microservices Proxy
> USER_SERVICE=https://user.azurewebsites.net/users
> SEARCH_SERVICE=https://search.azurewebsites.net/search
> BOOK_SERVICE=https://book.azurewebsites.net/books
> AUTHOR_SERVICE=https://author.azurewebsites.net/authors
> ```

## Serviço API Gateway
Dentro do diretório `papyrus/api-gateway` copie ou renomeie o arquivo `.env.example` para `.env`. Em seguida preencha as variávies:
* **`PORT=`** com a porta onde o servidor da API irá executar;
* **`MONGO_CONNECTION=`** URI de conexão com o banco de dados;
* **`MONGO_DB=`** nome do banco de dados.
* **`SESSION_SECRET=`** qualquer string. Será utilizada na criptográfia de sessão.
* **`USER_SERVICE=`** endereço de acesso a API **user-service**;
* **`WEB_UI_SERVICE=`** endereço de acesso a API **web-ui-service**;
* **`BOOK_SERVICE=`** endereço de acesso a API **book-service**;
* **`AUTHOR_SERVICE=`** endereço de acesso a API **author-service**;
* **`AZURE_STORAGE_CONNECTION_STRING=`** cadeia de conexão com sua conta de armazenamento Azure (**Blob Storage**).
> Exemplo:
> ```
> # .env, not committed to repo
> PORT=3000
> 
> # Data base
> MONGO_CONNECTION=mongodb://username:password@host:port/authorsdb
> MONGO_DB=authorsdb
> 
> # Session
> SESSION_SECRET=79437f5edda13f9c0669b978dd7a9066dd2059f1
> 
> # Microservices Proxy
> USER_SERVICE=https://user.azurewebsites.net/users
> WEB_UI_SERVICE=https://webui.azurewebsites.net/web-ui
> BOOK_SERVICE=https://book.azurewebsites.net/books
> AUTHOR_SERVICE=https://author.azurewebsites.net/authors
> 
> # Azure - Access key
> AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=exemplo;AccountKey=826c8ed54a4b34788ca8152071a725f4;EndpointSuffix=core.windows.net
> ```