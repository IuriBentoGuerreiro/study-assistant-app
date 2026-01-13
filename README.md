# 📚 BrainlyAI

**BrainlyAI** é uma aplicação web que utiliza **inteligência artificial** para transformar materiais de estudo em conteúdos **dinâmicos e personalizados**.  
O usuário envia um prompt, e a IA gera automaticamente **questões simuladas**
 
O objetivo é **acelerar e melhorar o processo de estudo** para concursos públicos, ENEM e certificações.

🚀 Funcionalidades

## 📄 Geração de questões

O usuário pode inserir a **quantidade de questões desejadas** e até mesmo a **banca organizadora** do concurso, para que as questões geradas sejam semelhantes às que aparecem nas provas dessa banca.  

Após isso, basta enviar o **prompt** e as questões serão geradas automaticamente. Você também pode copiar o conteúdo de um **PDF de estudo** e colar no campo de prompt; as questões serão geradas a partir das informações recebidas.

**Exemplo:**
```text
Banca: FGV
Quantidade: 10
Prompt: Regência Verbal e Nominal
```


## 📊 Painel de análise

Mostra informações como:

- Quantidade de questões geradas

- Total de Acertos

- Porcentagem de acertos
 

## 🛠️ Tecnologias Utilizadas

### Frontend:

- React + Next.js

- TailwindCSS

- Shadcn UI (componentes)


### Backend:

- DDD (Domain-Driven Design)

- Java Spring Boot

- JPA

- JWT

- Spring Security

- API REST

- Integração com APIs de IA (Gemini)

- PostgreSQL

 ### IA:

- Criação de questões


## 📤 Fluxo do Usuário

- O usuário cria uma conta ou faz login

- Acessa o chat e cria uma sova sessão

- Manda as informações de banca, quantidade e o prompt

- A IA extrai e analisa o conteúdo

- O sistema gera questões

- A plataforma acompanha o progresso
