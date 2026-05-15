// ============ GERENCIAMENTO DE DADOS ============

// Serviços disponíveis
const servicos = [
    {
        id: 1,
        nome: "Serviço Elétrico Residencial",
        categoria: "eletrica",
        descricao: "Instalação e reparo de circuitos elétricos",
        rating: 5,
        avaliacoes: 127,
        experiencia: 456,
        precoMin: 150,
        precoMax: 300,
        imagem: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
        id: 2,
        nome: "Limpeza Residencial Completa",
        categoria: "limpeza",
        descricao: "Limpeza profissional de casas e apartamentos",
        rating: 4,
        avaliacoes: 284,
        experiencia: 892,
        precoMin: 100,
        precoMax: 200,
        imagem: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
        id: 3,
        nome: "Pintura Interna e Externa",
        categoria: "pintura",
        descricao: "Pintura de ambientes com acabamento profissional",
        rating: 5,
        avaliacoes: 356,
        experiencia: 634,
        precoMin: 200,
        precoMax: 500,
        imagem: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
        id: 4,
        nome: "Reparo de Encanamento",
        categoria: "encanamento",
        descricao: "Consertos e manutenção de sistemas hidráulicos",
        rating: 4,
        avaliacoes: 178,
        experiencia: 523,
        precoMin: 120,
        precoMax: 280,
        imagem: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    {
        id: 5,
        nome: "Trabalhos em Madeira",
        categoria: "carpintaria",
        descricao: "Marcenaria, móveis planejados e reformas",
        rating: 5,
        avaliacoes: 412,
        experiencia: 748,
        precoMin: 180,
        precoMax: 450,
        imagem: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    {
        id: 6,
        nome: "Reparos Gerais e Manutenção",
        categoria: "reparo",
        descricao: "Diversos reparos residenciais e comerciais",
        rating: 5,
        avaliacoes: 501,
        experiencia: 1023,
        precoMin: 100,
        precoMax: 350,
        imagem: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
    }
];

// ============ GERENCIAMENTO DE CARRINHO ============

function obterCarrinho() {
    const carrinho = localStorage.getItem('carrinho');
    return carrinho ? JSON.parse(carrinho) : [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function adicionarAoCarrinho(servicoId, preco) {
    const carrinho = obterCarrinho();
    const servico = servicos.find(s => s.id === servicoId);

    if (!servico) return;

    // Verificar se já existe no carrinho
    const itemExistente = carrinho.find(item => item.id === servicoId);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            id: servicoId,
            nome: servico.nome,
            categoria: servico.categoria,
            preco: preco,
            quantidade: 1
        });
    }

    salvarCarrinho(carrinho);
    alert(`${servico.nome} adicionado ao carrinho!`);
    console.log('Carrinho atualizado:', carrinho);
}

function removerDoCarrinho(servicoId) {
    let carrinho = obterCarrinho();
    carrinho = carrinho.filter(item => item.id !== servicoId);
    salvarCarrinho(carrinho);
}

// ============ PÁGINA DE SERVIÇOS (compras.html) ============

// Buscar e filtrar serviços
function filtrarServicos() {
    const searchInput = document.querySelector('.search-input');
    const categoryFilter = document.querySelector('.category-filter');

    if (!searchInput || !categoryFilter) return;

    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        const titulo = card.querySelector('h3').textContent.toLowerCase();
        const descricao = card.querySelector('.product-description').textContent.toLowerCase();
        const categoriaBadge = card.querySelector('.category-badge').textContent.toLowerCase();

        const matchSearch = titulo.includes(searchTerm) || descricao.includes(searchTerm);
        const matchCategory = !category || categoriaBadge.includes(category);

        card.style.display = (matchSearch && matchCategory) ? 'flex' : 'none';
    });
}

// Atualizar contador de carrinho
function atualizarContadorCarrinho() {
    const cartCountEl = document.getElementById('cart-count');
    if (!cartCountEl) return;

    const carrinho = obterCarrinho();
    const total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    cartCountEl.textContent = total;
    cartCountEl.style.display = total > 0 ? 'flex' : 'none';
}

// Adicionar event listeners para busca e filtro
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');
    const categoryFilter = document.querySelector('.category-filter');

    if (searchInput) {
        searchInput.addEventListener('input', filtrarServicos);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filtrarServicos);
    }

    // Adicionar evento aos botões de contratar
    const btnsContratar = document.querySelectorAll('.btn-comprar');
    btnsContratar.forEach((btn, index) => {
        btn.addEventListener('click', function () {
            const card = btn.closest('.product-card');
            const servicoId = index + 1; // IDs começam em 1
            const precoText = card.querySelector('.price').textContent;
            const precoMin = parseInt(precoText.split('-')[0].replace(/\D/g, ''));

            adicionarAoCarrinho(servicoId, precoMin);
            atualizarContadorCarrinho();
        });
    });

    // Atualizar contador do carrinho na página de serviços
    atualizarContadorCarrinho();
});

// ============ PÁGINA DE PEDIDOS (pedidos.html) ============

function carregarPedidos() {
    const ordersList = document.getElementById('orders-list');
    const emptyState = document.getElementById('empty-state');

    if (!ordersList) return;

    const pedidosSalvos = JSON.parse(localStorage.getItem('pedidos') || '[]');

    if (pedidosSalvos.length === 0) {
        ordersList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    ordersList.innerHTML = '';
    emptyState.style.display = 'none';

    pedidosSalvos.forEach(pedido => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';

        const statusClass = `status-${pedido.status}`;
        const statusTexto = {
            pendente: 'Pendente',
            confirmado: 'Confirmado',
            concluido: 'Concluído',
            cancelado: 'Cancelado'
        }[pedido.status];

        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-id">Pedido #${pedido.id}</span>
                <span class="order-status ${statusClass}">${statusTexto}</span>
            </div>
            <div class="order-info">
                <h3>${pedido.itens[0].nome}</h3>
                <div class="order-details">
                    <div class="order-detail-item">
                        <strong>Data:</strong> ${new Date(pedido.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div class="order-detail-item">
                        <strong>Cliente:</strong> ${pedido.cliente.nome}
                    </div>
                </div>
            </div>
            <div class="order-price">Total: R$ ${pedido.total.toFixed(2).replace('.', ',')}</div>
            <div class="order-actions">
                <button class="btn-action btn-details" onclick="verDetalhes('${pedido.id}')">Ver Detalhes</button>
                ${pedido.status === 'pendente' ? `<button class="btn-action btn-cancelar" onclick="cancelarPedido('${pedido.id}')">Cancelar</button>` : ''}
            </div>
        `;

        ordersList.appendChild(orderCard);
    });
}

function filtrarPorStatus(status) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const pedidosSalvos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    let pedidosFiltrados = pedidosSalvos;

    if (status !== 'todos') {
        pedidosFiltrados = pedidosSalvos.filter(p => p.status === status);
    }

    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';

    if (pedidosFiltrados.length === 0) {
        ordersList.innerHTML = '<div class="empty-state" style="display: block;"><p>Nenhum pedido neste status.</p></div>';
        return;
    }

    pedidosFiltrados.forEach(pedido => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';

        const statusClass = `status-${pedido.status}`;
        const statusTexto = {
            pendente: 'Pendente',
            confirmado: 'Confirmado',
            concluido: 'Concluído',
            cancelado: 'Cancelado'
        }[pedido.status];

        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-id">Pedido #${pedido.id}</span>
                <span class="order-status ${statusClass}">${statusTexto}</span>
            </div>
            <div class="order-info">
                <h3>${pedido.itens[0].nome}</h3>
                <div class="order-details">
                    <div class="order-detail-item">
                        <strong>Data:</strong> ${new Date(pedido.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div class="order-detail-item">
                        <strong>Cliente:</strong> ${pedido.cliente.nome}
                    </div>
                </div>
            </div>
            <div class="order-price">Total: R$ ${pedido.total.toFixed(2).replace('.', ',')}</div>
            <div class="order-actions">
                <button class="btn-action btn-details" onclick="verDetalhes('${pedido.id}')">Ver Detalhes</button>
                ${pedido.status === 'pendente' ? `<button class="btn-action btn-cancelar" onclick="cancelarPedido('${pedido.id}')">Cancelar</button>` : ''}
            </div>
        `;

        ordersList.appendChild(orderCard);
    });
}

function verDetalhes(pedidoId) {
    alert(`Detalhes do pedido #${pedidoId}\n\nEste recurso será implementado em breve.`);
}

function cancelarPedido(pedidoId) {
    if (confirm('Tem certeza que deseja cancelar este pedido?')) {
        let pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (pedido) {
            pedido.status = 'cancelado';
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            carregarPedidos();
            alert('Pedido cancelado com sucesso!');
        }
    }
}

// Adicionar filtros de status
document.addEventListener('DOMContentLoaded', function () {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const status = this.getAttribute('data-filter');
            filtrarPorStatus(status);
        });
    });

    carregarPedidos();
});

// ============ PÁGINA DE CHECKOUT (checkout.html) ============

function carregarCarrinhoCheckout() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;

    const carrinho = obterCarrinho();
    let subtotal = 0;

    if (carrinho.length === 0) {
        cartItems.innerHTML = '<p style="color: #888;">Seu carrinho está vazio. <a href="compras.html">Volte aos serviços</a></p>';
        return;
    }

    cartItems.innerHTML = '';

    carrinho.forEach(item => {
        subtotal += item.preco * item.quantidade;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-info">
                <h3>${item.nome}</h3>
                <p>${item.categoria}</p>
            </div>
            <div class="item-price">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</div>
        `;

        cartItems.appendChild(cartItem);
    });

    atualizarTotaisCheckout();
}

function atualizarTotaisCheckout() {
    const carrinho = obterCarrinho();
    let subtotal = 0;

    carrinho.forEach(item => {
        subtotal += item.preco * item.quantidade;
    });

    const taxa = subtotal * 0.05; // 5% de taxa
    const total = subtotal + taxa;

    const subtotalEl = document.getElementById('subtotal');
    const taxaEl = document.getElementById('taxa');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (taxaEl) taxaEl.textContent = `R$ ${taxa.toFixed(2).replace('.', ',')}`;
    if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function formatarCartao(input) {
    let value = input.value.replace(/\s+/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formattedValue;
}

function formatarValidade(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    input.value = value;
}

function finalizarPedido() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    const cep = document.getElementById('cep').value;

    if (!nome || !email || !telefone || !endereco || !cidade || !estado || !cep) {
        alert('Por favor, preencha todos os dados do cliente!');
        return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // Validar cartão se método for crédito/débito
    if (['credito', 'debito'].includes(paymentMethod)) {
        const cardNumber = document.getElementById('card-number').value;
        const cardHolder = document.getElementById('card-holder').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvc = document.getElementById('card-cvc').value;

        if (!cardNumber || !cardHolder || !cardExpiry || !cardCvc) {
            alert('Por favor, preencha todos os dados do cartão!');
            return;
        }
    }

    // Criar pedido
    const carrinho = obterCarrinho();
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    let subtotal = 0;
    carrinho.forEach(item => {
        subtotal += item.preco * item.quantidade;
    });
    const taxa = subtotal * 0.05;
    const total = subtotal + taxa;

    const novoPedido = {
        id: Date.now().toString(),
        data: new Date().toISOString(),
        status: 'confirmado',
        cliente: {
            nome: nome,
            email: email,
            telefone: telefone,
            endereco: endereco,
            cidade: cidade,
            estado: estado,
            cep: cep
        },
        itens: carrinho,
        subtotal: subtotal,
        taxa: taxa,
        total: total,
        metodo_pagamento: paymentMethod
    };

    // Salvar pedido
    let pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.push(novoPedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    // Limpar carrinho
    localStorage.removeItem('carrinho');

    // Mostrar modal de confirmação
    const modal = document.getElementById('modal-confirmacao');
    const pedidoId = document.getElementById('pedido-id');
    pedidoId.textContent = `Seu pedido foi confirmado com sucesso! Número do pedido: #${novoPedido.id}`;
    modal.style.display = 'flex';
}

function irParaPedidos() {
    window.location.href = 'pedidos.html';
}

// Event listeners para checkout
document.addEventListener('DOMContentLoaded', function () {
    carregarCarrinhoCheckout();

    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function () {
            formatarCartao(this);
        });
    }

    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function () {
            formatarValidade(this);
        });
    }

    // Mostrar/ocultar detalhes do cartão
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            const cardDetails = document.getElementById('card-details');
            if (['credito', 'debito'].includes(this.value)) {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
});

// Criar botão "Ir ao Checkout"
function irParaCheckout() {
    const carrinho = obterCarrinho();
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio! Adicione serviços primeiro.');
        return;
    }
    window.location.href = 'checkout.html';
}
