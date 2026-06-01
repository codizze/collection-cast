# Escopo — Controle de Amostras PHP + MySQL

## Objetivo

Criar um sistema web simples para controle interno de amostras de uma fábrica de bolsas private label.

O sistema deve acompanhar cada amostra desde o recebimento do briefing até envio, aprovação, reprovação ou cancelamento.

## Fora do escopo

Este sistema não deve ser tratado como ERP ou PCP completo.

Não faz parte desta versão:

- pedidos de produção em escala;
- faturamento;
- remessas;
- facções;
- controle financeiro;
- integração com Gmax;
- estoque completo;
- consumo real de material;
- MRP;
- planejamento industrial avançado.

## Stack proposta

- PHP 8+
- MySQL/MariaDB
- PDO para conexão com banco
- Bootstrap 5 via CDN ou Tailwind via CDN
- JavaScript simples para filtros, kanban e interações
- Estrutura simples, fácil de hospedar em servidor comum

## Módulos

### 1. Dashboard

Indicadores principais:

- total de amostras abertas;
- amostras atrasadas;
- amostras entregues no mês;
- amostras aguardando aprovação;
- amostras por cliente;
- amostras por etapa/status;
- carga por modelista;
- prazo médio de desenvolvimento.

### 2. Clientes

Cadastro básico de clientes:

- nome;
- CNPJ opcional;
- contato;
- e-mail;
- telefone;
- cidade;
- estado;
- observações;
- ativo/inativo.

### 3. Coleções

Coleções vinculadas a clientes:

- cliente;
- nome da coleção;
- temporada;
- data inicial;
- data final prevista;
- status;
- observações.

### 4. Modelistas

Cadastro de responsáveis técnicos/modelistas:

- nome;
- e-mail;
- telefone;
- ativo/inativo.

### 5. Amostras

Módulo central do sistema.

Campos principais:

- código interno;
- nome/modelo;
- cliente;
- coleção;
- modelista responsável;
- data de entrada;
- data prevista de entrega;
- data real de entrega;
- prioridade;
- status;
- foto principal;
- observações;
- tipo: nova amostra, alteração, reposição ou mostruário;
- resultado: aguardando, aprovada, reprovada ou cancelada.

### 6. Kanban de Amostras

Quadro visual por status/etapa.

Status sugeridos:

1. Nova
2. Briefing recebido
3. Em modelagem
4. Aguardando material
5. Em corte
6. Em costura / pilotagem
7. Em revisão
8. Enviada ao cliente
9. Aguardando aprovação
10. Aprovada
11. Reprovada / ajustar
12. Cancelada

O card da amostra deve exibir:

- foto;
- código;
- modelo;
- cliente;
- coleção;
- prazo previsto;
- modelista;
- prioridade;
- indicador de atraso.

### 7. Comentários e histórico

Cada amostra deve permitir:

- comentários internos;
- registro de data/hora;
- autor do comentário;
- histórico de troca de status;
- histórico de alteração de prazo;
- observações do cliente.

### 8. Anexos

Permitir anexos por amostra:

- fotos;
- PDFs;
- desenhos;
- briefing;
- referências;
- arquivos diversos.

### 9. Consulta

Tela de busca com filtros:

- cliente;
- coleção;
- status;
- modelista;
- prioridade;
- período de entrada;
- período de entrega;
- atrasadas;
- aprovadas;
- aguardando aprovação.

### 10. Relatórios simples

Relatórios iniciais:

- amostras por cliente;
- amostras por status;
- amostras atrasadas;
- amostras entregues por mês;
- performance por modelista;
- amostras aguardando aprovação.

## Estrutura sugerida

```text
controle-amostras-php/
├── config/
│   └── database.php
├── public/
│   ├── index.php
│   └── uploads/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   └── helpers/
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
├── database/
│   └── schema.sql
└── README.md
```

## Tabelas iniciais

- usuarios
- clientes
- colecoes
- modelistas
- amostras
- comentarios_amostra
- anexos_amostra
- historico_amostra

## Diretriz de produto

O sistema deve ser simples, rápido e visual.

Priorizar:

- cadastro rápido de amostra;
- acompanhamento visual;
- filtros úteis;
- histórico claro;
- facilidade de implantação;
- baixa complexidade técnica.

Evitar:

- excesso de módulos;
- regras industriais complexas;
- dependências pesadas;
- frameworks grandes na primeira versão;
- telas muito burocráticas.
