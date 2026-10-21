# 📈 Bolsa de Valores — Simulador Multiplayer

Simulador de Bolsa de Valores Multiplayer desenvolvido como projeto acadêmico da disciplina de **Sistemas Distribuídos**, da Universidade Federal de Sergipe (UFS).

O sistema tem como objetivo simular um mercado financeiro virtual, permitindo que múltiplos investidores realizem operações de compra e venda de ativos simultaneamente, acompanhando as movimentações e alterações do mercado em tempo real.

## 📌 Sobre o projeto

O projeto busca aplicar conceitos fundamentais de Sistemas Distribuídos por meio da implementação de um ambiente virtual de negociação de ativos financeiros.

Cada participante assume o papel de um investidor, recebendo um capital virtual inicial para realizar operações no mercado. As ordens enviadas pelos investidores são processadas pelo sistema, que deve garantir a consistência das negociações e a sincronização das informações entre os participantes.

O desenvolvimento envolve desafios como:

- Comunicação entre clientes e servidores.
- Processamento concorrente de operações.
- Consistência e sincronização de dados.
- Ordenação e execução de ordens de negociação.
- Persistência e integridade das informações.
- Tolerância a falhas e recuperação de estado.
- Escalabilidade e monitoramento dos serviços.

> **Nota:** O sistema possui finalidade exclusivamente acadêmica e utiliza ativos e recursos financeiros virtuais, sem realizar negociações reais.

## 🎯 Objetivos

- Desenvolver uma aplicação distribuída de simulação financeira.
- Permitir a participação simultânea de múltiplos investidores.
- Implementar um mecanismo de processamento e execução de ordens.
- Garantir a consistência das operações realizadas concorrentemente.
- Disponibilizar informações do mercado em tempo real.
- Implementar mecanismos de persistência, autenticação e recuperação de estado.
- Avaliar o comportamento da aplicação sob diferentes condições de carga e falhas.

## ⚙️ Funcionalidades do sistema

### 👤 Gerenciamento de investidores
- Cadastro e autenticação de usuários.
- Gerenciamento de sessões.
- Identificação dos investidores conectados.
- Reconexão e recuperação das informações do usuário.

### 📊 Home Broker
Interface utilizada pelos investidores para acompanhar e interagir com o mercado.

- Consulta de saldo e patrimônio.
- Visualização da carteira de investimentos.
- Consulta de ativos, preços e variações.
- Acompanhamento do livro de ofertas.
- Envio de ordens de compra e venda.
- Consulta de ordens e histórico de negociações.
- Recebimento de atualizações do mercado em tempo real.

### 💱 Sistema de negociação
- Recebimento e validação de ordens.
- Manutenção das ofertas de compra e venda.
- Processamento de ordens por meio de um **Matching Engine**.
- Execução de negociações entre ordens compatíveis.
- Atualização de saldos, posições e informações de mercado.
- Registro das operações realizadas.

### 🤖 Investidores automatizados
- Participação de investidores virtuais (NPCs).
- Geração automatizada de ordens de compra e venda.
- Simulação de comportamentos e estratégias de negociação.

## 🌐 Sistemas Distribuídos

A aplicação deverá permitir a comunicação entre múltiplos clientes e os serviços responsáveis pelo funcionamento do mercado.

Os principais aspectos distribuídos abordados são:

**Concorrência e consistência:** tratamento de operações simultâneas, prevenção de condições de corrida e preservação da integridade das negociações.

**Sincronização:** atualização das informações compartilhadas entre os investidores, garantindo a coerência do estado observado pelos clientes.

**Tolerância a falhas:** tratamento de desconexões, recuperação de sessões e definição do comportamento do sistema diante de falhas.

**Escalabilidade:** avaliação da capacidade de processamento do sistema com diferentes quantidades de usuários conectados.

**Observabilidade:** utilização de logs e métricas para acompanhar o processamento das ordens e o comportamento dos serviços.

## 🏗️ Arquitetura do sistema

A arquitetura distribuída será documentada de acordo com os componentes, serviços e protocolos de comunicação definidos durante o desenvolvimento.

**Informações a documentar:**
- Componentes e responsabilidades.
- Protocolos de comunicação.
- Comunicação entre clientes e serviços.
- Estratégias de consistência e sincronização.
- Persistência e recuperação de estado.
- Implantação em contêineres.

*Diagrama de arquitetura: a adicionar.*

## 🗃️ Persistência e banco de dados

O sistema deverá armazenar as informações necessárias ao funcionamento do mercado, incluindo:

- Usuários e dados de autenticação.
- Saldos dos investidores.
- Carteiras e posições.
- Ativos negociáveis.
- Ordens de compra e venda.
- Negociações executadas.
- Histórico de operações.

A modelagem e a tecnologia de persistência serão documentadas conforme as decisões de implementação.

## 🛠️ Tecnologias utilizadas

*Seção a atualizar com as linguagens, frameworks, banco de dados, protocolos e ferramentas efetivamente adotados pelo grupo.*

## 🧪 Testes e validação

O projeto prevê testes para verificar tanto o funcionamento das operações quanto o comportamento distribuído da aplicação.

- Testes funcionais.
- Testes de processamento concorrente de ordens.
- Testes de carga e escalabilidade.
- Testes de comunicação e sincronização.
- Testes de desconexão e recuperação.
- Análise de logs e métricas de desempenho.

## 🚀 Instalação e execução

## 🚀 Instalação e execução

O projeto encontra-se atualmente em sua **primeira etapa de desenvolvimento**, correspondente à construção do protótipo inicial. Dessa forma, algumas funcionalidades ainda estão em implementação, integração e testes, podendo sofrer alterações ao longo do desenvolvimento.

Para executar a versão atual do sistema, siga as instruções abaixo.

### 📋 Pré-requisitos

É necessário possuir as seguintes ferramentas instaladas:

- **Docker** (Docker Desktop ou Docker Engine) — para executar os serviços da aplicação em contêineres.
- **Docker Compose** — para gerenciar os contêineres do projeto.
- **Node.js e npm** — para instalar as dependências e executar o frontend.
- **Visual Studio Code** (opcional) — ambiente de desenvolvimento recomendado.

> **Observação:** Caso esteja utilizando o VS Code, é possível instalar a extensão **Docker/Container Tools** para facilitar a visualização e o gerenciamento dos contêineres. A extensão é opcional e não substitui a instalação do Docker.

### 1. Clonar o repositório

Clone o projeto utilizando o Git:

```bash
git clone <URL_DO_REPOSITORIO>
```

Acesse a pasta do projeto:

```bash
cd Bolsa-de-Valores
```

### 2. Inicializar o Docker

Certifique-se de que o Docker esteja instalado e em execução.

Caso esteja utilizando o Docker Desktop, abra a aplicação e aguarde a inicialização do serviço.

No Linux, utilizando Docker Engine, caso o serviço ainda não esteja iniciado:

```bash
sudo systemctl start docker
```

Para verificar se o Docker está funcionando:

```bash
docker --version
docker compose version
```

### 3. Inicializar os contêineres

No diretório que contém o arquivo `docker-compose.yml` ou `compose.yaml`, execute:

```bash
docker compose up -d --build
```

Esse comando construirá as imagens necessárias e inicializará os serviços definidos na configuração do Docker Compose.

Para verificar os contêineres em execução:

```bash
docker ps
```

### 4. Executar o frontend

Em outro terminal, acesse o diretório do frontend:

```bash
cd frontend
```

Instale as dependências, caso ainda não estejam instaladas:

```bash
npm install
```

Em seguida, inicialize o servidor de desenvolvimento:

```bash
npm run dev
```

### 5. Acessar a aplicação

Após a inicialização, o terminal exibirá o endereço local disponibilizado pelo servidor de desenvolvimento.

Por exemplo, em projetos que utilizam Vite, o endereço padrão costuma ser:

```text
http://localhost:5173/
```

Abra no navegador o endereço **Local** informado no terminal para acessar a interface do sistema.

> **Importante:** A porta poderá variar de acordo com a configuração do projeto ou com a disponibilidade de portas na máquina.

### 6. Encerrar a execução

Para interromper o servidor de desenvolvimento do frontend, pressione `Ctrl + C` no terminal em que ele está sendo executado.

Para encerrar os contêineres, execute no diretório do Docker Compose:

```bash
docker compose down
```

## 🚧 Estado atual do desenvolvimento

O projeto está em sua **fase inicial de implementação e testes**, com foco na construção e validação do protótipo, incluindo a comunicação entre os componentes e as funcionalidades básicas da aplicação.

As próximas etapas contemplam o desenvolvimento e a integração dos mecanismos de negociação, sincronização, consistência, tolerância a falhas e demais requisitos de Sistemas Distribuídos.

Por se tratar de uma versão em desenvolvimento, algumas funcionalidades podem estar incompletas, indisponíveis ou sujeitas a modificações.

A documentação será atualizada conforme o avanço da implementação.

## 📅 Desenvolvimento

O projeto será desenvolvido em etapas, contemplando:

1. **Proposta e planejamento:** definição das regras de mercado, arquitetura, tecnologias e estratégias distribuídas.
2. **Protótipo inicial:** implementação da comunicação entre clientes, autenticação e funcionalidades básicas do Home Broker.
3. **Implementação avançada:** desenvolvimento do Matching Engine, persistência, sincronização, agentes automatizados e tolerância a falhas.
4. **Testes e validação:** avaliação funcional, de concorrência, desempenho e recuperação.

## 🎓 Contexto acadêmico

**Instituição:** Universidade Federal de Sergipe (UFS)  
**Disciplina:** Sistemas Distribuídos  
**Projeto:** Simulador de Bolsa de Valores Multiplayer

O projeto tem como finalidade aplicar, de maneira prática, conceitos de computação distribuída em um cenário de operações financeiras concorrentes.