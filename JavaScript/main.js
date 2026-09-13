(function () {
    // O script env-config.js (gerado no build) cria o objeto window.ENV
    const supabaseUrl = window.ENV?.SUPABASE_URL;
    const supabaseKey = window.ENV?.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Configuração do Supabase ausente. Execute npm run build ou configure as variáveis na Vercel.");
    }

    // O CDN expõe o namespace `window.supabase`; o cliente da aplicação fica em uma variável separada.
    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    // ==================== CADASTRO DE USUÁRIO ====================

    function inicializarCadastro() {
        const formCadastro = document.getElementById("form-cadastro");

        if (!formCadastro) return;

        formCadastro.addEventListener("submit", async function (event) {
            event.preventDefault();

            const nome = document.getElementById("nome").value;
            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;
            const botaoCadastro = document.getElementById("btn-cadastrar");
            if (botaoCadastro) botaoCadastro.disabled = true;

            try {
                const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                    email: email,
                    password: senha,
                    options: {
                        data: {
                            nome_completo: nome
                        }
                    }
                });

                if (authError) {
                    throw authError;
                }

                if (!authData.user) {
                    throw new Error("O Supabase não retornou o usuário criado.");
                }

                const mensagem = authData.session
                    ? "Conta criada com sucesso! Você já está conectado."
                    : "Conta criada com sucesso! Confira seu e-mail para confirmar a conta e depois entre.";

                alert(mensagem);
                window.location.href = "Servix.html";
            } catch (error) {
                alert("Não foi possível concluir o cadastro: " + error.message);
                if (botaoCadastro) {
                    botaoCadastro.disabled = false;
                }
            }
        });
    }

    async function inicializarServico() {
        const formServico = document.getElementById("form-servico");

        if (!formServico) return;

        const { data: sessaoData } = await supabaseClient.auth.getSession();
        if (!sessaoData.session?.user) {
            alert("Entre na sua conta antes de publicar um serviço.");
            window.location.href = "Servix.html";
            return;
        }

        document.getElementById("servico-cep")?.addEventListener("blur", () => verificarCep("servico-cep", "servico-"));

        formServico.addEventListener("submit", async event => {
            event.preventDefault();
            const botaoPublicar = document.getElementById("btn-publicar");
            botaoPublicar.disabled = true;

            try {
                const { data: perfil, error: perfilError } = await supabaseClient
                    .from("usuarios_publico")
                    .select("id")
                    .eq("user_id", sessaoData.session.user.id)
                    .single();

                if (perfilError) throw perfilError;

                const servico = {
                    titulo: document.getElementById("servico-titulo").value.trim(),
                    descricao: document.getElementById("servico-descricao").value.trim(),
                    cep: document.getElementById("servico-cep").value.trim(),
                    endereco: document.getElementById("servico-endereco").value.trim(),
                    cidade: document.getElementById("servico-cidade").value.trim(),
                    estado: document.getElementById("servico-estado").value.trim().toUpperCase(),
                    categoria: Number(document.getElementById("servico-categoria").value),
                    preco_estimado: Number(document.getElementById("servico-preco").value),
                    preço_detalhe: document.getElementById("servico-detalhe").value.trim() || null,
                    foto_url: document.getElementById("servico-foto").value.trim() || null,
                    criado_por: perfil.id,
                    whatsapp: document.getElementById("servico-whatsapp").value.trim() || null
                };

                const coordenadas = await geocodificarEndereco(servico.endereco, servico.cidade, servico.estado)
                    .catch(() => null);
                servico.latitude = coordenadas?.latitude || null;
                servico.longitude = coordenadas?.longitude || null;

                const { error: servicoError } = await supabaseClient.from("serviços").insert(servico);
                if (servicoError) throw servicoError;

                alert("Serviço publicado com sucesso!");
                window.location.href = "compras.html";
            } catch (error) {
                alert("Não foi possível publicar o serviço: " + error.message);
                botaoPublicar.disabled = false;
            }
        });
    }

    function inicializarLogin() {
        const formLogin = document.getElementById("form-login");

        if (!formLogin) return;

        formLogin.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const senha = document.getElementById("senha").value;
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

            if (error) {
                alert("Não foi possível entrar: " + error.message);
                return;
            }

            window.location.href = "compras.html";
        });
    }

    // ==================== DADOS DOS SERVIÇOS ====================

    let servicos = [];
    let categorias = [];
    // ==================== INTEGRAÇÃO SUPABASE ====================

    async function carregarCategoriasDoBanco() {
        const { data, error } = await supabaseClient
            .from("categorias")
            .select("id, categoria")
            .order("categoria");

        if (error) {
            console.error("Erro ao carregar categorias do Supabase:", error.message);
            categorias = [];

            const selectCadastro = document.getElementById("servico-categoria");
            if (selectCadastro) selectCadastro.innerHTML = "<option value=\"\">Erro ao carregar categorias</option>";

            const selectHero = document.getElementById("categoria-hero");
            if (selectHero) selectHero.innerHTML = "<option value=\"todas\">Não foi possível carregar categorias</option>";

            const filtros = document.getElementById("categorias-filtro");
            if (filtros) filtros.innerHTML = "<p>Não foi possível carregar as categorias. Atualize a página.</p>";

            renderizarTabelaCategorias();
            return;
        }

        categorias = (data || [])
            .map(item => ({ ...item, categoria: String(item.categoria || "").trim() }))
            .filter(item => item.categoria);

        const selectCadastro = document.getElementById("servico-categoria");
        if (selectCadastro) {
            selectCadastro.innerHTML = categorias.length
                ? `<option value="">Selecione uma categoria</option>${categorias.map(categoria =>
                    `<option value="${categoria.id}">${categoria.categoria}</option>`
                ).join("")}`
                : `<option value="">Nenhuma categoria disponível</option>`;
        }

        const selectHero = document.getElementById("categoria-hero");
        if (selectHero) {
            selectHero.innerHTML = `<option value="todas">Todas as categorias</option>${categorias.map(categoria =>
                `<option value="${normalizarTexto(categoria.categoria)}">${categoria.categoria}</option>`
            ).join("")}`;
        }

        const filtros = document.getElementById("categorias-filtro");
        if (filtros) {
            filtros.innerHTML = `
            <label>
                <input type="checkbox" data-categoria="todas" checked>
                <span>Todos os serviços</span>
            </label>
            ${categorias.map(categoria => `
                <label>
                    <input type="checkbox" data-categoria="${normalizarTexto(categoria.categoria)}">
                    <span>${categoria.categoria}</span>
                </label>
            `).join("")}
        `;
        }

        renderizarTabelaCategorias();
    }

    function inicializarCriacaoCategoria() {
        const botaoMostrar = document.getElementById("mostrar-nova-categoria");
        const areaNovaCategoria = document.getElementById("nova-categoria");
        const botaoCriar = document.getElementById("criar-categoria");
        const inputNovaCategoria = document.getElementById("servico-nova-categoria");
        const selectCategoria = document.getElementById("servico-categoria");
        const statusCategoria = document.getElementById("categoria-status");

        if (!botaoMostrar || !areaNovaCategoria || !botaoCriar || !inputNovaCategoria || !selectCategoria) return;

        const atualizarStatusCategoria = (mensagem, erro = false) => {
            if (!statusCategoria) return;
            statusCategoria.textContent = mensagem;
            statusCategoria.classList.toggle("erro", erro);
        };

        botaoMostrar.addEventListener("click", () => {
            const deveAbrir = areaNovaCategoria.classList.toggle("aberta");
            areaNovaCategoria.hidden = !deveAbrir;
            areaNovaCategoria.style.display = deveAbrir ? "block" : "none";
            botaoMostrar.setAttribute("aria-expanded", String(deveAbrir));
            atualizarStatusCategoria("");
            if (deveAbrir) inputNovaCategoria.focus();
        });

        if (window.location.hash === "#nova-categoria") {
            botaoMostrar.click();
        }

        const criarCategoria = async () => {
            const nomeCategoria = inputNovaCategoria.value.trim();

            if (!nomeCategoria) {
                atualizarStatusCategoria("Informe o nome da categoria.", true);
                inputNovaCategoria.focus();
                return;
            }

            const categoriaExistente = categorias.find(item =>
                normalizarTexto(item.categoria) === normalizarTexto(nomeCategoria)
            );

            if (categoriaExistente) {
                selectCategoria.value = categoriaExistente.id;
                atualizarStatusCategoria("Categoria já existente e selecionada.");
                areaNovaCategoria.hidden = true;
                areaNovaCategoria.classList.remove("aberta");
                areaNovaCategoria.style.display = "none";
                inputNovaCategoria.value = "";
                return;
            }

            const { data: sessaoData } = await supabaseClient.auth.getSession();
            if (!sessaoData.session?.user) {
                atualizarStatusCategoria("Entre na sua conta para criar uma categoria.", true);
                window.location.href = "Servix.html";
                return;
            }

            botaoCriar.disabled = true;
            atualizarStatusCategoria("Salvando categoria...");

            try {
                const { data: novaCategoria, error } = await supabaseClient
                    .from("categorias")
                    .insert({ categoria: nomeCategoria.trim() })
                    .select("id, categoria")
                    .single();

                if (error) {
                    if (error.code === "42501") {
                        throw new Error("o Supabase bloqueou a criação por RLS. Aplique a policy de INSERT autenticado.");
                    }
                    throw error;
                }

                categorias.push(novaCategoria);
                categorias.sort((a, b) => a.categoria.localeCompare(b.categoria, "pt-BR"));
                selectCategoria.innerHTML = `<option value="">Selecione uma categoria</option>${categorias.map(categoria =>
                    `<option value="${categoria.id}">${categoria.categoria}</option>`
                ).join("")}`;
                selectCategoria.value = novaCategoria.id;
                inputNovaCategoria.value = "";
                areaNovaCategoria.hidden = true;
                areaNovaCategoria.classList.remove("aberta");
                areaNovaCategoria.style.display = "none";
                atualizarStatusCategoria("");
                alert("Categoria criada e selecionada.");
            } catch (error) {
                console.error("Erro ao criar categoria:", error);
                atualizarStatusCategoria("Não foi possível criar a categoria: " + error.message, true);
            } finally {
                botaoCriar.disabled = false;
            }
        };

        botaoCriar.addEventListener("click", criarCategoria);
        inputNovaCategoria.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                criarCategoria();
            }
        });
    }

    function renderizarTabelaCategorias() {
        const listaCategorias = document.getElementById("categorias-lista");

        if (!listaCategorias) return;

        if (categorias.length === 0) {
            listaCategorias.innerHTML = `
            <p class="categories-state">
                Nenhuma categoria encontrada. <a href="publicar-servico.html#nova-categoria">Adicionar nova categoria</a>
            </p>
        `;
            return;
        }

        const quantidadePorCategoria = servicos.reduce((contagem, servico) => {
            contagem[servico.categoria] = (contagem[servico.categoria] || 0) + 1;
            return contagem;
        }, {});

        listaCategorias.innerHTML = categorias.map(categoria => {
            const chaveCategoria = normalizarTexto(categoria.categoria);
            const quantidade = quantidadePorCategoria[chaveCategoria] || 0;

            return `
            <div class="category-card" data-categoria="${chaveCategoria}">
                <div class="category-icon">🔧</div>
                <h3>${categoria.categoria}</h3>
                <p>${quantidade} ${quantidade === 1 ? "serviço publicado" : "serviços publicados"}</p>
            </div>
        `;
        }).join("");
    }

    async function carregarServicosDoBanco() {
        try {
            // Busca os serviços com categoria e avaliações relacionadas.
            const { data: dadosServicos, error } = await supabaseClient
                .from('serviços')
                .select(`
                id,
                titulo,
                descricao,
                preco_estimado,
                cep,
                endereco,
                cidade,
                estado,
                latitude,
                longitude,
                    categorias ( categoria ),
                    avaliaçoes ( nota )
            `);

            if (error) throw error;

            // Mapeia os dados do banco para o formato que a interface (HTML) espera
            servicos = dadosServicos.map(dbItem => {
                const notas = dbItem.avaliaçoes || [];
                const mediaNotas = notas.length > 0
                    ? notas.reduce((acc, curr) => acc + curr.nota, 0) / notas.length
                    : 0; // 0 se não houver avaliações

                const nomeCategoria = dbItem.categorias?.categoria || "Geral";

                return {
                    id: dbItem.id,
                    nome: dbItem.titulo || "Serviço sem título",
                    categoria: normalizarTexto(nomeCategoria), // Ex: "eletrica"
                    categoriaLabel: nomeCategoria,             // Ex: "Elétrica"
                    descricao: dbItem.descricao || "Sem descrição disponível.",
                    rating: mediaNotas,
                    avaliacoes: notas.length,
                    experiencia: 0, // Campo fictício mantido para não quebrar a UI
                    precoMin: dbItem.preco_estimado || 0,
                    precoMax: (dbItem.preco_estimado || 0) + 100, // Estimativa de margem
                    disponibilidade: ["atendimento-rapido"], // Mock para filtros
                    cor: "blue", // Pode ser dinâmico no futuro
                    avatar: nomeCategoria.substring(0, 2).toUpperCase(),
                    localizacao: [dbItem.cidade, dbItem.estado].filter(Boolean).join(" - "),
                    latitude: dbItem.latitude !== null && Number.isFinite(Number(dbItem.latitude))
                        ? Number(dbItem.latitude)
                        : null,
                    longitude: dbItem.longitude !== null && Number.isFinite(Number(dbItem.longitude))
                        ? Number(dbItem.longitude)
                        : null
                };
            });

            renderizarTabelaCategorias();

            // Após carregar os dados reais, inicializa a visualização
            inicializarPaginaCompras();
            renderizarMarcadoresServicos();

        } catch (err) {
            console.error("Erro ao carregar serviços do Supabase:", err.message);
        }
    }

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
                        <button type="button" class="btn-outline btn-perfil" data-id="${servico.id}">Ver perfil</button>
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

    let mapaServix = null;
    let marcadorLocalizacao = null;
    let coordenadasBusca = null;
    let camadaServicos = null;

    function atualizarStatusMapa(mensagem) {
        const status = document.getElementById("map-status");
        if (status) status.textContent = mensagem;
    }

    function inicializarMapa() {
        const elementoMapa = document.getElementById("mapa-servix");

        if (!elementoMapa || !window.L) return;

        mapaServix = L.map(elementoMapa).setView([-22.82, -43.28], 9);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(mapaServix);

        atualizarStatusMapa("Pesquise uma cidade ou use sua localização para posicionar o mapa.");

        document.getElementById("usar-localizacao")?.addEventListener("click", usarLocalizacaoAtual);
    }

    function renderizarMarcadoresServicos() {
        if (!mapaServix || !window.L) return;

        if (camadaServicos) camadaServicos.remove();
        camadaServicos = L.layerGroup().addTo(mapaServix);

        servicos
            .filter(servico => Number.isFinite(servico.latitude) && Number.isFinite(servico.longitude))
            .forEach(servico => {
                L.marker([servico.latitude, servico.longitude])
                    .bindPopup(`<strong>${servico.nome}</strong><br>${servico.categoriaLabel}<br>${servico.localizacao || "Localização cadastrada"}`)
                    .addTo(camadaServicos);
            });
    }

    async function geocodificarEndereco(endereco, cidade, estado) {
        const parametros = new URLSearchParams({
            q: `${endereco}, ${cidade}, ${estado}, Brasil`,
            format: "jsonv2",
            limit: "1",
            countrycodes: "br"
        });

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${parametros}`);
        if (!response.ok) return null;

        const resultado = (await response.json())[0];
        return resultado
            ? { latitude: Number(resultado.lat), longitude: Number(resultado.lon) }
            : null;
    }

    function mostrarLocalizacaoNoMapa(latitude, longitude, titulo, zoom = 13) {
        if (!mapaServix) return;

        coordenadasBusca = { latitude, longitude };

        if (marcadorLocalizacao) marcadorLocalizacao.remove();

        marcadorLocalizacao = L.marker([latitude, longitude])
            .addTo(mapaServix)
            .bindPopup(titulo)
            .openPopup();

        mapaServix.setView([latitude, longitude], zoom);
    }

    async function buscarLocalizacaoNoMapa() {
        const localizacao = obterLocalizacaoBusca();

        if (!localizacao) {
            atualizarStatusMapa("Digite uma cidade ou endereço no campo de localização.");
            return;
        }

        atualizarStatusMapa("Buscando localização...");

        try {
            const parametros = new URLSearchParams({
                q: localizacao,
                format: "jsonv2",
                limit: "1",
                countrycodes: "br"
            });
            const response = await fetch(`https://nominatim.openstreetmap.org/search?${parametros}`);
            if (!response.ok) throw new Error("Falha na busca");

            const resultados = await response.json();
            const resultado = resultados[0];
            if (!resultado) throw new Error("Localização não encontrada");

            mostrarLocalizacaoNoMapa(Number(resultado.lat), Number(resultado.lon), resultado.display_name);
            atualizarStatusMapa(`Mapa centralizado em ${resultado.display_name}.`);
        } catch (error) {
            atualizarStatusMapa("Não foi possível encontrar essa localização. Tente informar uma cidade ou estado.");
        }
    }

    function usarLocalizacaoAtual() {
        if (!navigator.geolocation) {
            atualizarStatusMapa("Seu navegador não oferece geolocalização.");
            return;
        }

        atualizarStatusMapa("Obtendo sua localização...");
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                mostrarLocalizacaoNoMapa(coords.latitude, coords.longitude, "Sua localização");
                atualizarStatusMapa("Mapa centralizado na sua localização atual.");
            },
            () => atualizarStatusMapa("Não foi possível obter sua localização. Verifique a permissão do navegador.")
        );
    }

    function obterCategoriaHero() {
        const selectCategoria = document.querySelector(".search-panel select");

        if (!selectCategoria) return "todas";

        return normalizarTexto(selectCategoria.value) || "todas";
    }

    function obterCategoriasMarcadas() {
        const checkboxes = document.querySelectorAll(".filter-group input[type='checkbox']");
        const categoriasMarcadas = [];
        const disponibilidadesMarcadas = [];

        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) return;

            const categoria = checkbox.dataset.categoria;
            if (categoria) categoriasMarcadas.push(categoria);

            const texto = normalizarTexto(checkbox.parentElement.innerText);

            if (texto.includes("disponivel hoje")) disponibilidadesMarcadas.push("disponivel-hoje");
            if (texto.includes("atendimento rapido")) disponibilidadesMarcadas.push("atendimento-rapido");
            if (texto.includes("visita tecnica")) disponibilidadesMarcadas.push("visita-tecnica");
        });

        return {
            categoriasMarcadas: categoriasMarcadas.filter(categoria => categoria !== "todas"),
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

    function calcularDistanciaKm(latitudeInicial, longitudeInicial, latitudeFinal, longitudeFinal) {
        const raioTerraKm = 6371;
        const latitudeEmRadianos = (latitudeFinal - latitudeInicial) * Math.PI / 180;
        const longitudeEmRadianos = (longitudeFinal - longitudeInicial) * Math.PI / 180;
        const latitudeInicialRad = latitudeInicial * Math.PI / 180;
        const latitudeFinalRad = latitudeFinal * Math.PI / 180;
        const haversine = Math.sin(latitudeEmRadianos / 2) ** 2
            + Math.cos(latitudeInicialRad) * Math.cos(latitudeFinalRad)
            * Math.sin(longitudeEmRadianos / 2) ** 2;

        return 2 * raioTerraKm * Math.asin(Math.sqrt(haversine));
    }

    function obterDistanciaDoServico(servico) {
        if (!coordenadasBusca || servico.latitude === null || servico.longitude === null) {
            return Number.POSITIVE_INFINITY;
        }

        return calcularDistanciaKm(
            coordenadasBusca.latitude,
            coordenadasBusca.longitude,
            servico.latitude,
            servico.longitude
        );
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

        if (ordenacao.includes("mais proximos")) {
            listaOrdenada.sort((a, b) => obterDistanciaDoServico(a) - obterDistanciaDoServico(b));
        }

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
            ${servico.localizacao}
        `);

            const passaBusca = !termoBusca || textoServico.includes(termoBusca);

            const passaLocalizacao = !localizacao || normalizarTexto(servico.localizacao).includes(localizacao);

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
        ativarBotoesPerfil();
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

    function escaparHtml(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async function carregarAvaliacoesPerfil(modal, servicoId) {
        const lista = modal.querySelector(".profile-reviews-list");
        const formulario = modal.querySelector(".profile-review-form");

        const { data: avaliacoes, error } = await supabaseClient
            .from("avaliaçoes")
            .select("nota, comentario, created_at")
            .eq("serviço_id", servicoId)
            .order("created_at", { ascending: false });

        if (error) {
            lista.innerHTML = "<p class=\"profile-review-empty\">Não foi possível carregar as avaliações.</p>";
        } else if (!avaliacoes?.length) {
            lista.innerHTML = "<p class=\"profile-review-empty\">Ainda não há avaliações para este serviço.</p>";
        } else {
            lista.innerHTML = avaliacoes.map(avaliacao => `
                <article class="profile-review">
                    <strong>${"★".repeat(Math.max(0, Math.min(5, Number(avaliacao.nota))))}</strong>
                    <p>${escaparHtml(avaliacao.comentario || "Sem comentário.")}</p>
                    <small>${new Date(avaliacao.created_at).toLocaleDateString("pt-BR")}</small>
                </article>
            `).join("");
        }

        formulario.addEventListener("submit", async event => {
            event.preventDefault();

            const { data: sessaoData } = await supabaseClient.auth.getSession();
            if (!sessaoData.session?.user) {
                alert("Entre na sua conta para avaliar este serviço.");
                window.location.href = "Servix.html";
                return;
            }

            const nota = Number(formulario.querySelector("[name='nota']").value);
            const comentario = formulario.querySelector("[name='comentario']").value.trim();
            const botao = formulario.querySelector("button[type='submit']");

            if (nota < 1 || nota > 5) {
                alert("Escolha uma nota de 1 a 5.");
                return;
            }

            botao.disabled = true;

            try {
                const { data: perfil, error: perfilError } = await supabaseClient
                    .from("usuarios_publico")
                    .select("id")
                    .eq("user_id", sessaoData.session.user.id)
                    .single();

                if (perfilError) throw perfilError;

                const { error: avaliacaoError } = await supabaseClient
                    .from("avaliaçoes")
                    .insert({
                        "serviço_id": servicoId,
                        autor_id: perfil.id,
                        nota,
                        comentario: comentario || null
                    });

                if (avaliacaoError) throw avaliacaoError;

                formulario.reset();
                await carregarAvaliacoesPerfil(modal, servicoId);
                alert("Avaliação enviada com sucesso.");
            } catch (avaliacaoError) {
                alert("Não foi possível enviar a avaliação: " + avaliacaoError.message);
            } finally {
                botao.disabled = false;
            }
        }, { once: true });
    }

    function mostrarPerfil(servicoId) {
        const servico = servicos.find(item => item.id === Number(servicoId));
        if (!servico) return;

        const modal = document.createElement("div");
        modal.className = "profile-modal";
        modal.innerHTML = `
            <div class="profile-modal-content" role="dialog" aria-modal="true" aria-labelledby="perfil-modal-titulo">
                <button type="button" class="profile-modal-close" aria-label="Fechar perfil">&times;</button>
                <span class="profile-modal-kicker">Prestador verificado</span>
                <h2 id="perfil-modal-titulo">${servico.nome}</h2>
                <p class="profile-modal-category">${servico.categoriaLabel} em ${servico.localizacao || "atendimento regional"}</p>
                <p>${servico.descricao}</p>
                <div class="profile-modal-stats">
                    <span>⭐ ${servico.rating.toFixed(1)} (${servico.avaliacoes} avaliações)</span>
                    <span>${servico.experiencia} serviços realizados</span>
                    <strong>A partir de R$ ${servico.precoMin}</strong>
                </div>
                <section class="profile-reviews" aria-labelledby="avaliacoes-titulo">
                    <h3 id="avaliacoes-titulo">Avaliações</h3>
                    <div class="profile-reviews-list"><p class="profile-review-empty">Carregando avaliações...</p></div>
                    <form class="profile-review-form">
                        <label>Nota
                            <select name="nota" required>
                                <option value="">Escolha uma nota</option>
                                <option value="5">5 estrelas</option>
                                <option value="4">4 estrelas</option>
                                <option value="3">3 estrelas</option>
                                <option value="2">2 estrelas</option>
                                <option value="1">1 estrela</option>
                            </select>
                        </label>
                        <label>Comentário
                            <textarea name="comentario" rows="3" maxlength="500" placeholder="Conte como foi sua experiência"></textarea>
                        </label>
                        <button type="submit" class="btn-outline">Enviar avaliação</button>
                    </form>
                </section>
                <button type="button" class="btn-primary profile-modal-action">Solicitar serviço</button>
            </div>
        `;
        document.body.appendChild(modal);

        const fechar = () => modal.remove();
        modal.addEventListener("click", event => {
            if (event.target === modal || event.target.closest(".profile-modal-close")) fechar();
        });
        modal.querySelector(".profile-modal-action").addEventListener("click", () => {
            adicionarAoCarrinho(servico.id);
            fechar();
        });
        carregarAvaliacoesPerfil(modal, servico.id);
    }

    function ativarBotoesPerfil() {
        document.querySelectorAll(".btn-perfil").forEach(botao => {
            botao.addEventListener("click", () => mostrarPerfil(botao.dataset.id));
        });
    }

    function inicializarPaginaCompras() {
        const grid = document.querySelector(".workers-grid");

        if (!grid) return;

        inicializarMapa();
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
            botaoBuscar.addEventListener("click", () => {
                filtrarServicos();
                buscarLocalizacaoNoMapa();
            });
        }
    }

    // ==================== PÁGINA DE PEDIDOS ====================

    function formatarStatusPedido(status) {
        return {
            pendente: "Pendente",
            aprovado: "Aprovado",
            recusado: "Recusado",
            cancelado: "Cancelado"
        }[status] || "Pendente";
    }

    function renderizarPedidos(pedidos) {
        const ordersList = document.getElementById("orders-list");
        const emptyState = document.getElementById("empty-state");

        if (!ordersList) return;

        if (pedidos.length === 0) {
            ordersList.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        ordersList.innerHTML = "";
        ordersList.style.display = "block";
        if (emptyState) emptyState.style.display = "none";

        pedidos.forEach(pedido => {
            const primeiroItem = pedido.itens?.[0] || {};
            const orderCard = document.createElement("div");
            orderCard.className = "order-card";
            orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-id">Pedido #${pedido.id}</span>
                <span class="order-status status-${pedido.status_pagamento}">${formatarStatusPedido(pedido.status_pagamento)}</span>
            </div>
            <div class="order-info">
                <h3>${primeiroItem.nome || "Serviço"}</h3>
                <div class="order-details">
                    <div class="order-detail-item"><strong>Data:</strong> ${new Date(pedido.created_at).toLocaleDateString("pt-BR")}</div>
                    <div class="order-detail-item"><strong>Cliente:</strong> ${pedido.nome_completo}</div>
                </div>
            </div>
            <div class="order-price">Total: ${formatarMoeda(pedido.total)}</div>
            <div class="order-actions">
                <button class="btn-action btn-details" onclick="verDetalhes('${pedido.id}')">Ver Detalhes</button>
                ${pedido.status_pagamento === "pendente" ? `<button class="btn-action btn-cancelar" onclick="cancelarPedido('${pedido.id}')">Cancelar</button>` : ""}
            </div>
        `;
            ordersList.appendChild(orderCard);
        });
    }

    async function carregarPedidos() {
        const ordersList = document.getElementById("orders-list");
        if (!ordersList) return;

        let consulta = supabaseClient
            .from("pedidos")
            .select("id, created_at, nome_completo, itens, total, status_pagamento")
            .order("created_at", { ascending: false });
        const { data: sessaoData } = await supabaseClient.auth.getSession();
        const usuario = sessaoData.session?.user;

        if (!usuario) {
            ordersList.innerHTML = "<p>Entre na sua conta para visualizar seus pedidos.</p>";
            return;
        }

        consulta = consulta.eq("user_id", usuario.id);

        const { data: pedidos, error } = await consulta;
        if (error) {
            console.error("Erro ao carregar pedidos:", error.message);
            ordersList.innerHTML = "<p>Não foi possível carregar seus pedidos.</p>";
            return;
        }

        window.pedidosServix = pedidos || [];
        renderizarPedidos(window.pedidosServix);
    }

    function filtrarPorStatus(status, botaoClicado) {
        document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
        if (botaoClicado) botaoClicado.classList.add("active");

        const pedidos = window.pedidosServix || [];
        renderizarPedidos(status === "todos"
            ? pedidos
            : pedidos.filter(pedido => pedido.status_pagamento === status));
    }

    function verDetalhes(pedidoId) {
        alert(`Detalhes do pedido #${pedidoId}\n\nEste recurso pode ser expandido depois com uma tela própria.`);
    }

    async function cancelarPedido(pedidoId) {
        if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;

        const { error } = await supabaseClient
            .from("pedidos")
            .update({ status_pagamento: "cancelado" })
            .eq("id", pedidoId);

        if (error) {
            alert("Não foi possível cancelar o pedido: " + error.message);
            return;
        }

        const pedido = (window.pedidosServix || []).find(item => String(item.id) === String(pedidoId));
        if (pedido) pedido.status_pagamento = "cancelado";
        renderizarPedidos(window.pedidosServix || []);
        alert("Pedido cancelado com sucesso!");
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

    async function sairDaConta() {
        await supabaseClient.auth.signOut();
        window.location.href = "index.html";
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

    async function verificarCep(idCep = "cep", prefixo = "") {
        const cepInput = document.getElementById(idCep);

        if (!cepInput) return;

        const cep = cepInput.value.replace(/\D/g, "");

        if (cep.length !== 8) return;

        cepInput.value = `${cep.slice(0, 5)}-${cep.slice(5)}`;
        cepInput.setCustomValidity("");

        try {
            const response = await fetch(`/api/cep?cep=${cep}`);
            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.erro) {
                throw new Error(data.erro || "CEP não encontrado");
            }

            const enderecoInput = document.getElementById(`${prefixo}endereco`);
            const cidadeInput = document.getElementById(`${prefixo}cidade`);
            const estadoInput = document.getElementById(`${prefixo}estado`);

            if (enderecoInput) {
                enderecoInput.value = `${data.logradouro || ""} ${data.complemento || ""}`.trim();
            }

            if (cidadeInput) cidadeInput.value = data.localidade || "";
            if (estadoInput) estadoInput.value = data.uf || "";
        } catch (error) {
            cepInput.setCustomValidity(error.message);
            alert("Não foi possível encontrar o CEP informado. Verifique e tente novamente.");
            setTimeout(() => cepInput.focus(), 0);
        }
    }

    async function finalizarPedido() {
        const { data: sessaoData } = await supabaseClient.auth.getSession();
        const usuario = sessaoData.session?.user;

        if (!usuario) {
            alert("Entre na sua conta antes de confirmar o pedido.");
            window.location.href = "Servix.html?redirect=checkout.html";
            return;
        }

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

        const pedido = {
            user_id: usuario.id,
            nome_completo: nome,
            email,
            telefone,
            endereco,
            cidade,
            estado: estado.toUpperCase(),
            cep,
            itens: carrinho,
            subtotal,
            taxa_servico: taxa,
            total,
            metodo_pagamento: paymentMethod,
            status_pagamento: "pendente"
        };

        const { data: novoPedido, error } = await supabaseClient
            .from("pedidos")
            .insert(pedido)
            .select("id")
            .single();

        if (error) {
            alert("Não foi possível salvar o pedido: " + error.message);
            return;
        }

        localStorage.removeItem("carrinho");

        const modal = document.getElementById("modal-confirmacao");
        const pedidoId = document.getElementById("pedido-id");

        if (pedidoId) {
            pedidoId.textContent = `Seu pedido foi registrado com sucesso! Número do pedido: #${novoPedido.id}`;
        }

        if (modal) {
            modal.style.display = "flex";
        } else {
            alert(`Pedido registrado com sucesso! Número do pedido: #${novoPedido.id}`);
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
        // As categorias precisam estar disponíveis antes dos filtros e do formulário de serviço.
        carregarCategoriasDoBanco().finally(() => carregarServicosDoBanco());

        inicializarPaginaPedidos();
        inicializarCheckout();
        atualizarContadorCarrinho();
        inicializarEfeitosModernos();
        inicializarCadastro();
        inicializarServico();
        inicializarCriacaoCategoria();
        inicializarLogin();

        document.querySelectorAll("[data-logout]").forEach(link => {
            link.addEventListener("click", event => {
                event.preventDefault();
                sairDaConta();
            });
        });
    });

    // Mantém disponíveis as ações usadas pelos atributos onclick dos arquivos HTML.
    Object.assign(window, {
        finalizarPedido,
        irParaCheckout,
        irParaPedidos,
        verDetalhes,
        cancelarPedido,
        sairDaConta
    });
})();
