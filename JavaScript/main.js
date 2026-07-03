// =====================================================
// SERVIX - SCRIPT PRINCIPAL
// Filtros, busca, ordenação, carrinho, pedidos e checkout
// =====================================================

// ==================== DADOS DOS SERVIÇOS ====================

const servicos = [
    {
        id: 1,
        nome: "Serviço Elétrico Residencial",
        categoria: "eletrica",
        categoriaLabel: "Elétrica",
        descricao: "Instalação, manutenção, troca de tomadas, disjuntores e reparos elétricos residenciais.",
        rating: 4.9,
        avaliacoes: 127,
        experiencia: 456,
        precoMin: 150,
        precoMax: 300,
        disponibilidade: ["atendimento-rapido"],
        cor: "purple",
        avatar: "EL"
    },
    {
        id: 2,
        nome: "Limpeza Residencial Completa",
        categoria: "limpeza",
        categoriaLabel: "Limpeza",
        descricao: "Limpeza profissional de casas, apartamentos, salas comerciais e ambientes pós-obra.",
        rating: 4.8,
        avaliacoes: 284,
        experiencia: 892,
        precoMin: 100,
        precoMax: 200,
        disponibilidade: ["disponivel-hoje", "atendimento-rapido"],
        cor: "pink",
        avatar: "LP"
    },
    {
        id: 3,
        nome: "Pintura Interna e Externa",
        categoria: "pintura",
        categoriaLabel: "Pintura",
        descricao: "Pintura de ambientes internos e externos com acabamento profissional e organização.",
        rating: 5.0,
        avaliacoes: 356,
        experiencia: 634,
        precoMin: 200,
        precoMax: 500,
        disponibilidade: ["visita-tecnica"],
        cor: "blue",
        avatar: "PT"
    },
    {
        id: 4,
        nome: "Reparo de Encanamento",
        categoria: "encanamento",
        categoriaLabel: "Encanamento",
        descricao: "Consertos, vazamentos, instalação e manutenção de sistemas hidráulicos.",
        rating: 4.7,
        avaliacoes: 178,
        experiencia: 523,
        precoMin: 120,
        precoMax: 280,
        disponibilidade: ["atendimento-rapido", "visita-tecnica"],
        cor: "green",
        avatar: "EN"
    },
    {
        id: 5,
        nome: "Reparos Eletrônicos",
        categoria: "eletronica",
        categoriaLabel: "Eletrônica",
        descricao: "Manutenção de equipamentos eletrônicos, diagnóstico técnico e pequenos reparos.",
        rating: 4.9,
        avaliacoes: 412,
        experiencia: 748,
        precoMin: 100,
        precoMax: 800,
        disponibilidade: ["visita-tecnica"],
        cor: "orange",
        avatar: "ET"
    },
    {
        id: 6,
        nome: "Reparos Gerais e Manutenção",
        categoria: "reparos",
        categoriaLabel: "Reparos",
        descricao: "Pequenos reparos residenciais e comerciais, montagem e manutenção geral.",
        rating: 5.0,
        avaliacoes: 501,
        experiencia: 1023,
        precoMin: 100,
        precoMax: 350,
        disponibilidade: ["disponivel-hoje", "atendimento-rapido"],
        cor: "soft",
        avatar: "RG"
    }
];

// ==================== FUNÇÕES GERAIS ====================

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function formatarMoeda(valor) {
    return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
}

function obterCarrinho() {
    const carrinho = localStorage.getItem("carrinho");
    return carrinho ? JSON.parse(carrinho) : [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function atualizarContadorCarrinho() {
    const cartCountEl = document.getElementById("cart-count");

    if (!cartCountEl) return;

    const carrinho = obterCarrinho();
    const total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    cartCountEl.textContent = total;
    cartCountEl.style.display = total > 0 ? "grid" : "none";
}

// ==================== CARRINHO ====================

function adicionarAoCarrinho(servicoId, preco) {
    let idFinal = Number(servicoId);

    // Caso o botão chame onclick="adicionarAoCarrinho()" sem parâmetro
    if (!idFinal) {
        const botaoClicado = document.activeElement;
        const card = botaoClicado ? botaoClicado.closest(".worker-card") : null;

        if (card && card.dataset.id) {
            idFinal = Number(card.dataset.id);
        }
    }

    const servico = servicos.find(item => item.id === idFinal);

    if (!servico) {
        alert("Não foi possível identificar esse serviço.");
        return;
    }

    const carrinho = obterCarrinho();

    const itemExistente = carrinho.find(item => item.id === servico.id);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            id: servico.id,
            nome: servico.nome,
            categoria: servico.categoriaLabel,
            preco: preco || servico.precoMin,
            quantidade: 1
        });
    }

    salvarCarrinho(carrinho);
    atualizarContadorCarrinho();

    alert(`${servico.nome} adicionado ao carrinho!`);
}

function removerDoCarrinho(servicoId) {
    let carrinho = obterCarrinho();
    carrinho = carrinho.filter(item => item.id !== Number(servicoId));
    salvarCarrinho(carrinho);
    atualizarContadorCarrinho();
}

function irParaCheckout() {
    const carrinho = obterCarrinho();

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio! Adicione serviços primeiro.");
        return;
    }

    window.location.href = "checkout.html";
}

// ==================== PÁGINA COMPRAS ====================

function criarCardServico(servico) {
    return `
        <article class="worker-card" data-id="${servico.id}" data-categoria="${servico.categoria}">
            <div class="card-cover ${servico.cor}">
                <div class="avatar">${servico.avatar}</div>
            </div>

            <div class="card-content">
                <span class="provider-badge">👤 Prestador verificado</span>

                <h3>${servico.nome}</h3>

                <p class="category-badge">${servico.categoriaLabel}</p>

                <p class="worker-description">
                    ${servico.descricao}
                </p>

                <div class="worker-stats">
                    <span>⭐ ${servico.rating.toFixed(1)}</span>
                    <span>${servico.avaliacoes} avaliações</span>
                    <span>${servico.experiencia} serviços</span>
                </div>

                <div class="worker-footer">
                    <div class="price-box">
                        <small>A partir de</small>
                        <strong>R$ ${servico.precoMin}</strong>
                    </div>

                    <div class="card-actions">
                        <a href="#" class="btn-outline">Ver perfil</a>
                        <button class="btn-primary btn-solicitar" data-id="${servico.id}">
                            Solicitar
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function obterValorBusca() {
    const inputBusca = document.querySelector(".search-panel input[type='text']");
    return inputBusca ? normalizarTexto(inputBusca.value) : "";
}

function obterLocalizacaoBusca() {
    const inputs = document.querySelectorAll(".search-panel input[type='text']");
    const inputLocalizacao = inputs[1];
    return inputLocalizacao ? normalizarTexto(inputLocalizacao.value) : "";
}

function obterCategoriaHero() {
    const selectCategoria = document.querySelector(".search-panel select");

    if (!selectCategoria) return "todas";

    return normalizarTexto(selectCategoria.value)
        .replace("todas as categorias", "todas")
        .replace("eletrica", "eletrica")
        .replace("eletronica", "eletronica");
}

function obterCategoriasMarcadas() {
    const checkboxes = document.querySelectorAll(".filter-group input[type='checkbox']");
    const categoriasMarcadas = [];
    const disponibilidadesMarcadas = [];

    checkboxes.forEach(checkbox => {
        const texto = normalizarTexto(checkbox.parentElement.innerText);

        if (!checkbox.checked) return;

        if (texto.includes("todos os servicos")) categoriasMarcadas.push("todas");
        if (texto.includes("reparos")) categoriasMarcadas.push("reparos");
        if (texto.includes("limpeza")) categoriasMarcadas.push("limpeza");
        if (texto.includes("pintura")) categoriasMarcadas.push("pintura");
        if (texto.includes("eletrica")) categoriasMarcadas.push("eletrica");
        if (texto.includes("encanamento")) categoriasMarcadas.push("encanamento");

        if (texto.includes("disponivel hoje")) disponibilidadesMarcadas.push("disponivel-hoje");
        if (texto.includes("atendimento rapido")) disponibilidadesMarcadas.push("atendimento-rapido");
        if (texto.includes("visita tecnica")) disponibilidadesMarcadas.push("visita-tecnica");
    });

    return {
        categoriasMarcadas,
        disponibilidadesMarcadas
    };
}

function obterAvaliacaoMinima() {
    const selects = document.querySelectorAll(".filter-group select");
    const selectAvaliacao = selects[0];

    if (!selectAvaliacao) return 0;

    const valor = normalizarTexto(selectAvaliacao.value);

    if (valor.includes("4.5")) return 4.5;
    if (valor.includes("4 estrelas")) return 4;
    if (valor.includes("5 estrelas")) return 5;

    return 0;
}

function obterFaixaPreco() {
    const selects = document.querySelectorAll(".filter-group select");
    const selectPreco = selects[1];

    if (!selectPreco) return "qualquer";

    return normalizarTexto(selectPreco.value);
}

function precoDentroDaFaixa(servico, faixa) {
    if (!faixa || faixa.includes("qualquer")) return true;

    if (faixa.includes("ate r$ 100")) {
        return servico.precoMin <= 100;
    }

    if (faixa.includes("r$ 100 a r$ 250")) {
        return servico.precoMin >= 100 && servico.precoMin <= 250;
    }

    if (faixa.includes("r$ 250 a r$ 500")) {
        return servico.precoMin >= 250 && servico.precoMin <= 500;
    }

    if (faixa.includes("acima de r$ 500")) {
        return servico.precoMin > 500 || servico.precoMax > 500;
    }

    return true;
}

function obterOrdenacao() {
    const selectOrdenacao = document.querySelector(".sort-box select");
    return selectOrdenacao ? normalizarTexto(selectOrdenacao.value) : "melhor avaliacao";
}

function aplicarOrdenacao(lista) {
    const ordenacao = obterOrdenacao();
    const listaOrdenada = [...lista];

    if (ordenacao.includes("melhor avaliacao")) {
        listaOrdenada.sort((a, b) => b.rating - a.rating);
    }

    if (ordenacao.includes("menor preco")) {
        listaOrdenada.sort((a, b) => a.precoMin - b.precoMin);
    }

    if (ordenacao.includes("mais contratados")) {
        listaOrdenada.sort((a, b) => b.experiencia - a.experiencia);
    }

    // Como ainda não existe distância real, "mais próximos" mantém a lista atual
    return listaOrdenada;
}

function filtrarServicos() {
    const grid = document.querySelector(".workers-grid");

    if (!grid) return;

    const termoBusca = obterValorBusca();
    const localizacao = obterLocalizacaoBusca();
    const categoriaHero = obterCategoriaHero();

    const {
        categoriasMarcadas,
        disponibilidadesMarcadas
    } = obterCategoriasMarcadas();

    const avaliacaoMinima = obterAvaliacaoMinima();
    const faixaPreco = obterFaixaPreco();

    let servicosFiltrados = servicos.filter(servico => {
        const textoServico = normalizarTexto(`
            ${servico.nome}
            ${servico.categoriaLabel}
            ${servico.descricao}
        `);

        const passaBusca = !termoBusca || textoServico.includes(termoBusca);

        const passaLocalizacao = !localizacao || true;

        const passaCategoriaHero =
            categoriaHero === "todas" ||
            !categoriaHero ||
            normalizarTexto(servico.categoriaLabel).includes(categoriaHero) ||
            servico.categoria.includes(categoriaHero);

        const temFiltroCategoria =
            categoriasMarcadas.length > 0 &&
            !categoriasMarcadas.includes("todas");

        const passaCategoriaLateral =
            !temFiltroCategoria ||
            categoriasMarcadas.includes(servico.categoria);

        const passaDisponibilidade =
            disponibilidadesMarcadas.length === 0 ||
            disponibilidadesMarcadas.some(item => servico.disponibilidade.includes(item));

        const passaAvaliacao = servico.rating >= avaliacaoMinima;

        const passaPreco = precoDentroDaFaixa(servico, faixaPreco);

        return (
            passaBusca &&
            passaLocalizacao &&
            passaCategoriaHero &&
            passaCategoriaLateral &&
            passaDisponibilidade &&
            passaAvaliacao &&
            passaPreco
        );
    });

    servicosFiltrados = aplicarOrdenacao(servicosFiltrados);

    if (servicosFiltrados.length === 0) {
        grid.innerHTML = `
            <div class="empty-results" style="
                grid-column: 1 / -1;
                background: white;
                border-radius: 22px;
                padding: 34px;
                text-align: center;
                box-shadow: 0 14px 35px rgba(15, 34, 56, 0.10);
                color: #5c6b80;
            ">
                <h3 style="color: #0f2f60; margin-bottom: 8px;">
                    Nenhum prestador encontrado
                </h3>
                <p>
                    Tente limpar alguns filtros ou buscar por outra categoria.
                </p>
            </div>
        `;
        return;
    }

    grid.innerHTML = servicosFiltrados.map(criarCardServico).join("");

    ativarBotoesSolicitar();
}

function ativarBotoesSolicitar() {
    const botoes = document.querySelectorAll(".btn-solicitar");

    botoes.forEach(botao => {
        botao.addEventListener("click", function () {
            const servicoId = Number(this.dataset.id);
            adicionarAoCarrinho(servicoId);
        });
    });
}

function inicializarPaginaCompras() {
    const grid = document.querySelector(".workers-grid");

    if (!grid) return;

    filtrarServicos();

    const camposBusca = document.querySelectorAll(".search-panel input");
    const selectsBusca = document.querySelectorAll(".search-panel select");
    const filtrosCheckbox = document.querySelectorAll(".filter-group input[type='checkbox']");
    const filtrosSelect = document.querySelectorAll(".filter-group select");
    const selectOrdenacao = document.querySelector(".sort-box select");
    const botaoBuscar = document.querySelector(".btn-search");

    camposBusca.forEach(input => {
        input.addEventListener("input", filtrarServicos);
    });

    selectsBusca.forEach(select => {
        select.addEventListener("change", filtrarServicos);
    });

    filtrosCheckbox.forEach(checkbox => {
        checkbox.addEventListener("change", filtrarServicos);
    });

    filtrosSelect.forEach(select => {
        select.addEventListener("change", filtrarServicos);
    });

    if (selectOrdenacao) {
        selectOrdenacao.addEventListener("change", filtrarServicos);
    }

    if (botaoBuscar) {
        botaoBuscar.addEventListener("click", filtrarServicos);
    }
}

// ==================== PÁGINA DE PEDIDOS ====================

function carregarPedidos() {
    const ordersList = document.getElementById("orders-list");
    const emptyState = document.getElementById("empty-state");

    if (!ordersList) return;

    const pedidosSalvos = JSON.parse(localStorage.getItem("pedidos") || "[]");

    if (pedidosSalvos.length === 0) {
        ordersList.style.display = "none";

        if (emptyState) {
            emptyState.style.display = "block";
        }

        return;
    }

    ordersList.innerHTML = "";
    ordersList.style.display = "block";

    if (emptyState) {
        emptyState.style.display = "none";
    }

    pedidosSalvos.forEach(pedido => {
        const orderCard = document.createElement("div");
        orderCard.className = "order-card";

        const statusClass = `status-${pedido.status}`;

        const statusTexto = {
            pendente: "Pendente",
            confirmado: "Confirmado",
            concluido: "Concluído",
            cancelado: "Cancelado"
        }[pedido.status] || "Pendente";

        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-id">Pedido #${pedido.id}</span>
                <span class="order-status ${statusClass}">${statusTexto}</span>
            </div>

            <div class="order-info">
                <h3>${pedido.itens[0]?.nome || "Serviço"}</h3>

                <div class="order-details">
                    <div class="order-detail-item">
                        <strong>Data:</strong> ${new Date(pedido.data).toLocaleDateString("pt-BR")}
                    </div>

                    <div class="order-detail-item">
                        <strong>Cliente:</strong> ${pedido.cliente.nome}
                    </div>
                </div>
            </div>

            <div class="order-price">
                Total: ${formatarMoeda(pedido.total)}
            </div>

            <div class="order-actions">
                <button class="btn-action btn-details" onclick="verDetalhes('${pedido.id}')">
                    Ver Detalhes
                </button>

                ${pedido.status === "pendente"
                ? `<button class="btn-action btn-cancelar" onclick="cancelarPedido('${pedido.id}')">Cancelar</button>`
                : ""
            }
            </div>
        `;

        ordersList.appendChild(orderCard);
    });
}

function filtrarPorStatus(status, botaoClicado) {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(btn => btn.classList.remove("active"));

    if (botaoClicado) {
        botaoClicado.classList.add("active");
    }

    const pedidosSalvos = JSON.parse(localStorage.getItem("pedidos") || "[]");

    let pedidosFiltrados = pedidosSalvos;

    if (status !== "todos") {
        pedidosFiltrados = pedidosSalvos.filter(pedido => pedido.status === status);
    }

    const ordersList = document.getElementById("orders-list");

    if (!ordersList) return;

    ordersList.innerHTML = "";

    if (pedidosFiltrados.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state" style="display: block;">
                <p>Nenhum pedido neste status.</p>
            </div>
        `;
        return;
    }

    pedidosFiltrados.forEach(pedido => {
        const orderCard = document.createElement("div");
        orderCard.className = "order-card";

        const statusClass = `status-${pedido.status}`;

        const statusTexto = {
            pendente: "Pendente",
            confirmado: "Confirmado",
            concluido: "Concluído",
            cancelado: "Cancelado"
        }[pedido.status] || "Pendente";

        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-id">Pedido #${pedido.id}</span>
                <span class="order-status ${statusClass}">${statusTexto}</span>
            </div>

            <div class="order-info">
                <h3>${pedido.itens[0]?.nome || "Serviço"}</h3>

                <div class="order-details">
                    <div class="order-detail-item">
                        <strong>Data:</strong> ${new Date(pedido.data).toLocaleDateString("pt-BR")}
                    </div>

                    <div class="order-detail-item">
                        <strong>Cliente:</strong> ${pedido.cliente.nome}
                    </div>
                </div>
            </div>

            <div class="order-price">
                Total: ${formatarMoeda(pedido.total)}
            </div>

            <div class="order-actions">
                <button class="btn-action btn-details" onclick="verDetalhes('${pedido.id}')">
                    Ver Detalhes
                </button>

                ${pedido.status === "pendente"
                ? `<button class="btn-action btn-cancelar" onclick="cancelarPedido('${pedido.id}')">Cancelar</button>`
                : ""
            }
            </div>
        `;

        ordersList.appendChild(orderCard);
    });
}

function verDetalhes(pedidoId) {
    alert(`Detalhes do pedido #${pedidoId}\n\nEste recurso pode ser expandido depois com uma tela própria.`);
}

function cancelarPedido(pedidoId) {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;

    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
    const pedido = pedidos.find(item => item.id === pedidoId);

    if (pedido) {
        pedido.status = "cancelado";
        localStorage.setItem("pedidos", JSON.stringify(pedidos));
        carregarPedidos();
        alert("Pedido cancelado com sucesso!");
    }
}

function inicializarPaginaPedidos() {
    const filterBtns = document.querySelectorAll(".filter-btn");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const status = this.getAttribute("data-filter");
            filtrarPorStatus(status, this);
        });
    });

    carregarPedidos();
}

// ==================== CHECKOUT ====================

function carregarCarrinhoCheckout() {
    const cartItems = document.getElementById("cart-items");

    if (!cartItems) return;

    const carrinho = obterCarrinho();

    if (carrinho.length === 0) {
        cartItems.innerHTML = `
            <p style="color: #888;">
                Seu carrinho está vazio.
                <a href="compras.html">Volte aos serviços</a>
            </p>
        `;
        atualizarTotaisCheckout();
        return;
    }

    cartItems.innerHTML = "";

    carrinho.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div class="item-info">
                <h3>${item.nome}</h3>
                <p>${item.categoria}</p>
                <small>Quantidade: ${item.quantidade}</small>
            </div>

            <div class="item-price">
                ${formatarMoeda(item.preco * item.quantidade)}
            </div>
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

    const taxa = subtotal * 0.05;
    const total = subtotal + taxa;

    const subtotalEl = document.getElementById("subtotal");
    const taxaEl = document.getElementById("taxa");
    const totalEl = document.getElementById("total");

    if (subtotalEl) subtotalEl.textContent = formatarMoeda(subtotal);
    if (taxaEl) taxaEl.textContent = formatarMoeda(taxa);
    if (totalEl) totalEl.textContent = formatarMoeda(total);
}

function formatarCartao(input) {
    let value = input.value.replace(/\s+/g, "");
    let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
    input.value = formattedValue;
}

function formatarValidade(input) {
    let value = input.value.replace(/\D/g, "");

    if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }

    input.value = value;
}

function validarFormatoCep(cep) {
    return /^\d{5}-?\d{3}$/.test(cep.trim());
}

async function verificarCep() {
    const cepInput = document.getElementById("cep");

    if (!cepInput) return;

    const cep = cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            throw new Error("CEP não encontrado");
        }

        const enderecoInput = document.getElementById("endereco");
        const cidadeInput = document.getElementById("cidade");
        const estadoInput = document.getElementById("estado");

        if (enderecoInput) {
            enderecoInput.value = `${data.logradouro || ""} ${data.complemento || ""}`.trim();
        }

        if (cidadeInput) cidadeInput.value = data.localidade || "";
        if (estadoInput) estadoInput.value = data.uf || "";
    } catch (error) {
        alert("Não foi possível encontrar o CEP informado. Verifique e tente novamente.");
        setTimeout(() => cepInput.focus(), 0);
    }
}

function finalizarPedido() {
    const nome = document.getElementById("nome")?.value;
    const email = document.getElementById("email")?.value;
    const telefone = document.getElementById("telefone")?.value;
    const endereco = document.getElementById("endereco")?.value;
    const cidade = document.getElementById("cidade")?.value;
    const estado = document.getElementById("estado")?.value;
    const cep = document.getElementById("cep")?.value;

    if (!nome || !email || !telefone || !endereco || !cidade || !estado || !cep) {
        alert("Por favor, preencha todos os dados do cliente!");
        return;
    }

    if (!validarFormatoCep(cep)) {
        alert("Por favor, informe um CEP válido no formato 00000-000.");
        return;
    }

    const paymentSelected = document.querySelector('input[name="payment"]:checked');

    if (!paymentSelected) {
        alert("Selecione uma forma de pagamento.");
        return;
    }

    const paymentMethod = paymentSelected.value;

    if (["credito", "debito"].includes(paymentMethod)) {
        const cardNumber = document.getElementById("card-number")?.value;
        const cardHolder = document.getElementById("card-holder")?.value;
        const cardExpiry = document.getElementById("card-expiry")?.value;
        const cardCvc = document.getElementById("card-cvc")?.value;

        if (!cardNumber || !cardHolder || !cardExpiry || !cardCvc) {
            alert("Por favor, preencha todos os dados do cartão!");
            return;
        }
    }

    const carrinho = obterCarrinho();

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
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
        status: "confirmado",
        cliente: {
            nome,
            email,
            telefone,
            endereco,
            cidade,
            estado,
            cep
        },
        itens: carrinho,
        subtotal,
        taxa,
        total,
        metodo_pagamento: paymentMethod
    };

    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");

    pedidos.push(novoPedido);

    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    localStorage.removeItem("carrinho");

    const modal = document.getElementById("modal-confirmacao");
    const pedidoId = document.getElementById("pedido-id");

    if (pedidoId) {
        pedidoId.textContent = `Seu pedido foi confirmado com sucesso! Número do pedido: #${novoPedido.id}`;
    }

    if (modal) {
        modal.style.display = "flex";
    } else {
        alert(`Pedido confirmado com sucesso! Número do pedido: #${novoPedido.id}`);
        window.location.href = "pedidos.html";
    }
}

function irParaPedidos() {
    window.location.href = "pedidos.html";
}

function inicializarCheckout() {
    carregarCarrinhoCheckout();

    const cardNumberInput = document.getElementById("card-number");

    if (cardNumberInput) {
        cardNumberInput.addEventListener("input", function () {
            formatarCartao(this);
        });
    }

    const cardExpiryInput = document.getElementById("card-expiry");

    if (cardExpiryInput) {
        cardExpiryInput.addEventListener("input", function () {
            formatarValidade(this);
        });
    }

    const cepInput = document.getElementById("cep");

    if (cepInput) {
        cepInput.addEventListener("blur", verificarCep);
    }

    const paymentRadios = document.querySelectorAll('input[name="payment"]');

    paymentRadios.forEach(radio => {
        radio.addEventListener("change", function () {
            const cardDetails = document.getElementById("card-details");

            if (!cardDetails) return;

            if (["credito", "debito"].includes(this.value)) {
                cardDetails.style.display = "block";
            } else {
                cardDetails.style.display = "none";
            }
        });
    });
}

// ==================== EFEITOS MODERNOS ====================

function inicializarEfeitosModernos() {
    if (!document.body || document.querySelector(".site-progress")) return;

    const progressBar = document.createElement("div");
    progressBar.className = "site-progress";
    document.body.prepend(progressBar);

    const revealSelectors = [
        ".hero",
        ".hero-content",
        ".hero-stats",
        ".about",
        ".about-container",
        ".about-text",
        ".about-features",
        ".how-it-works",
        ".steps-container",
        ".services-section",
        ".services-grid",
        ".benefits",
        ".benefits-grid",
        ".cta-section",
        ".marketplace-hero",
        ".search-panel",
        ".marketplace-layout",
        ".filters-sidebar",
        ".filter-card",
        ".services-area",
        ".workers-grid",
        ".worker-card",
        ".request-card",
        ".categories-section",
        ".category-card",
        ".checkout-container",
        ".checkout-section",
        ".summary-card",
        ".orders-container",
        ".order-card",
        ".cadastro-container",
        ".cadastro-cover",
        ".cadastro-card",
        ".feature-box",
        ".step",
        ".service-card",
        ".benefit-item",
        ".cart-item"
    ];

    const revealTargets = Array.from(
        new Set(
            revealSelectors.flatMap(selector => Array.from(document.querySelectorAll(selector)))
        )
    );

    revealTargets.forEach(element => element.classList.add("scroll-reveal"));

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        revealTargets.forEach(element => element.classList.add("is-visible"));
    } else {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.14,
            rootMargin: "0px 0px -8% 0px"
        });

        revealTargets.forEach(element => observer.observe(element));
    }

    const updateScrollState = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0;

        progressBar.style.setProperty("--scroll-progress", `${progress}%`);
        document.body.classList.toggle("has-scrolled", scrollTop > 18);
    };

    let scrollRaf = null;

    const onScroll = () => {
        if (scrollRaf !== null) return;

        scrollRaf = window.requestAnimationFrame(() => {
            scrollRaf = null;
            updateScrollState();
        });
    };

    updateScrollState();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);
}

// ==================== INICIALIZAÇÃO GERAL ====================

document.addEventListener("DOMContentLoaded", function () {
    inicializarPaginaCompras();
    inicializarPaginaPedidos();
    inicializarCheckout();
    atualizarContadorCarrinho();
    inicializarEfeitosModernos();
});