# COWDOL - Plataforma de Gestão de Investimentos

## Visão Geral

COWDOL é uma plataforma de gestão de investimentos open-source projetada para ajudá-lo a tomar decisões financeiras informadas. O sistema permite que você carregue seus dados de investimento e gera dashboards abrangentes que fornecem um entendimento claro do seu desempenho financeiro.

### Funcionalidades Principais

- **Dashboard de Investimentos**: Visualize e acompanhe o desempenho do seu portfólio de investimentos
- **Análise Financeira**: Métricas detalhadas sobre seus retornos de investimento, incluindo lucro/prejuízo total
- **Calculadora de Juros Compostos**: Simule vários cenários de investimento
- **Recomendador de Fundos de Investimento**: Obtenha recomendações baseadas em dados para potenciais investimentos

## Filosofia do Projeto

COWDOL é construído com um compromisso com:

- **Desenvolvimento Open Source**: Permitindo contribuição e transparência da comunidade
- **Educação**: Servindo como implementação de referência para práticas modernas de engenharia de software
- **Capacitação Financeira**: Fornecendo ferramentas que ajudam as pessoas a tomar melhores decisões de investimento

## Arquitetura Técnica

O projeto é estruturado com microsserviços em containers, separando as preocupações de frontend e backend:

- **Frontend**: Interface moderna construída com princípios de design responsivo
- **Backend**: Arquitetura de API escalável servindo dados financeiros e análises
- **Containerização**: Garantindo ambientes de desenvolvimento e implantação consistentes

Esta separação fornece diversos benefícios:
- Escalabilidade independente dos componentes
- Flexibilidade tecnológica
- Colaboração mais fácil para contribuidores
- Testes e implantação simplificados

## Roadmap de Desenvolvimento

Prioridades atuais:

- Corrigir problemas do frontend
- Adicionar soma total de valores na análise de portfólio
- Implementar cálculo de lucro/prejuízo total
- Adicionar análise de desempenho dos "5 Melhores" e "5 Piores" investimentos

## Primeiros Passos

### Configuração do Backend

```sh
cd backend/
```

### Install the required libraries:
```sh
pip install -r requirements.txt
```

### Run the script:
```sh
fastapi run server.py --host 127.0.0.1
```

### Configuração do Frontend

```sh
cd frontend/
```

### Install the required libraries:
```sh
npm install
```

### Run the script:
```sh
npm run start
```

## Contribuindo

Obrigado pelo seu interesse em contribuir com o COWDOL! Recebemos contribuições de desenvolvedores de todos os níveis de experiência.

Para contribuir:
1. Crie um issue descrevendo o que você planeja trabalhar
2. Faça um fork do repositório
3. Crie uma branch referenciando o número do seu issue (ex: `feature/issue-42`)
4. Faça suas alterações seguindo nossos padrões de qualidade de código
5. Submeta um pull request para a branch main

Nos esforçamos para manter uma alta qualidade de código através de:
- Padrões de codificação consistentes
- Cobertura abrangente de testes
- Princípios de arquitetura limpa
- Documentação detalhada

Este projeto é focado em investimentos nacionais brasileiros, priorizando as necessidades específicas do mercado financeiro brasileiro e suas particularidades regulatórias.

Para mais detalhes, consulte nossas [Diretrizes de Contribuição](./CONTRIBUTING.md).

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](./LICENSE) para detalhes.

## Contato

Para quaisquer dúvidas ou informações, entre em contato com [douglassermarini@gmail.com] ou outro colaborador.


