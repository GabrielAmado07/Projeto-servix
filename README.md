# Servix - Plataforma de Serviços

Uma plataforma estilo **GetNinja** e **e-commerce** onde consumidores podem buscar, comparar e contratar profissionais autônomos e pequenos serviços.

## 🎯 Funcionalidades

### Para Consumidores
- ✅ **Página Inicial** - Hero section com busca rápida e serviços em destaque
- ✅ **Busca Avançada** - Filtros por categoria, preço, avaliação e busca por texto
- ✅ **Detalhes do Serviço** - Informações completas do profissional e serviço
- ✅ **Checkout** - Processo em 3 etapas (confirmar, entregar, pagamento)
- ✅ **Perfil do Usuário** - Visualizar pedidos, avaliações e dados pessoais
- ✅ **Responsivo** - Mobile first design com Tailwind CSS

### Para Profissionais (Em desenvolvimento)
- 🔜 Cadastro de serviços
- 🔜 Dashboard profissional
- 🔜 Gestão de pedidos
- 🔜 Avaliações e estatísticas

## 📦 Dependências

```json
{
  "react": "^19.2.6",
  "react-dom": "^19.2.6",
  "react-router-dom": "^6.x",
  "lucide-react": "^latest",
  "tailwindcss": "^4.2.4",
  "vite": "^8.0.11"
}
```

## 🚀 Como Iniciar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

### 3. Build para Produção
```bash
npm run build
```

### 4. Preview da Build
```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── Header.jsx              # Barra de navegação com busca
│   ├── Footer.jsx              # Rodapé com links e redes sociais
│   ├── ServiceCard.jsx         # Card do serviço (reutilizável)
│   └── CategoryFilter.jsx      # Filtro de categorias
├── pages/
│   ├── Home.jsx                # Página inicial
│   ├── Search.jsx              # Página de busca com filtros
│   ├── ServiceDetail.jsx       # Detalhes do serviço
│   ├── Checkout.jsx            # Processo de compra (3 etapas)
│   ├── Profile.jsx             # Perfil do usuário
│   └── NotFound.jsx            # Página 404
├── context/                    # Context API (para usar no futuro)
├── App.jsx                     # Componente principal com rotas
├── App.css                     # Estilos da aplicação
├── index.css                   # Estilos globais + Tailwind
└── main.jsx                    # Entry point
```

## 🗺️ Rotas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | Home | Página inicial |
| `/search` | Search | Busca de serviços |
| `/search?q=termo` | Search | Busca com termo |
| `/service/:id` | ServiceDetail | Detalhes do serviço |
| `/checkout` | Checkout | Processo de compra |
| `/profile` | Profile | Perfil do usuário |
| `*` | NotFound | Página 404 |

## 🎨 Design

- **Framework CSS**: Tailwind CSS v4
- **Ícones**: Lucide React
- **Paleta de Cores**:
  - Primária: Azul (#0066CC)
  - Sucesso: Verde (#10B981)
  - Erro: Vermelho (#EF4444)
  - Neutro: Cinza (#6B7280)

## 💻 Componentes Principais

### Header
- Logo e nome da plataforma
- Barra de busca responsiva
- Menu de navegação
- Login/Logout
- Menu mobile hamburger

### ServiceCard
- Imagem do serviço
- Categoria em badge
- Nome do profissional
- Avaliação em estrelas
- Localização
- Tempo de resposta
- Preço

### Checkout (3 Etapas)
1. **Confirmar Serviço** - Revisão do serviço selecionado
2. **Entregar** - Dados de contato e endereço
3. **Pagamento** - Cartão de crédito, débito ou PIX

### Search
- Filtro por categoria (dropdown)
- Filtro por preço (slider)
- Ordenação (popular, avaliação, preço)
- Grid responsivo
- Busca por texto

## 🔄 Fluxo da Aplicação

```
Home 
  ↓
Buscar Serviço (Search)
  ↓
Selecionar Serviço (ServiceDetail)
  ↓
Contratar (Checkout em 3 etapas)
  ↓
Perfil (Ver pedidos)
```

## 📊 Dados Mock

Atualmente, a aplicação usa dados mock (simulados). Para integração com API real:

1. Criar context com Redux ou Context API
2. Conectar endpoints da API
3. Implementar autenticação (JWT)
4. Sistema de pagamento (Stripe, PayPal, PIX)

## 🔐 Próximas Funcionalidades

- [ ] Autenticação de usuários
- [ ] Dashboard para profissionais
- [ ] Sistema de avaliações
- [ ] Chat entre profissionais e clientes
- [ ] Notificações em tempo real
- [ ] Wishlist/Favoritos
- [ ] Histórico de buscas
- [ ] Integração com APIs de pagamento

## 📱 Responsividade

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

Todos os componentes são otimizados para dispositivos mobile com menu hamburger, busca responsiva e grid adaptativo.

## 🛠️ Configuração do Ambiente

### Arquivo: vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Arquivo: tailwind.config.js
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 📄 Licença

ISC

## 👨‍💻 Autor

Desenvolvido como um projeto de e-commerce de serviços.

---

**Pronto para usar! Comece personalizando os dados mock com sua API real.** 🚀
