(function () {
    // O script env-config.js (gerado no build) cria o objeto window.ENV
    const supabaseUrl = window.ENV?.SUPABASE_URL;
    const supabaseKey = window.ENV?.SUPABASE_KEY;
    const supabaseStorageBucket = window.ENV?.SUPABASE_STORAGE_BUCKET || "servix-fotos";

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Configuração do Supabase ausente. Execute npm run build ou configure as variáveis na Vercel.");
    }

    // O CDN expõe o namespace `window.supabase`; o cliente da aplicação fica em uma variável separada.
    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    function formatarNomeArquivo(nomeArquivo) {
        return String(nomeArquivo || "servico")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9._-]/g, "-")
            .toLowerCase();
    }

    function exibirPreviewFoto(url) {
        const preview = document.getElementById("servico-foto-preview");
        const wrapper = document.getElementById("foto-preview-wrapper");

        if (!preview || !wrapper) return;

        if (url) {
            preview.src = url;
            wrapper.hidden = false;
            wrapper.style.display = "block";
        } else {
            preview.src = "";
            wrapper.hidden = true;
            wrapper.style.display = "none";
        }
    }

    async function removerFotoDoStorage(url) {
        if (!url) return;

        try {
            const urlStorage = new URL(url);
            const caminho = decodeURIComponent(urlStorage.pathname).split("/").filter(Boolean);
            const indiceBucket = caminho.findIndex(item => item === supabaseStorageBucket);

            if (indiceBucket < 0 || indiceBucket === caminho.length - 1) return;

            const caminhoArquivo = caminho.slice(indiceBucket + 1).join("/");

            if (!caminhoArquivo || !caminhoArquivo.includes("servicos/")) return;

            await supabaseClient.storage.from(supabaseStorageBucket).remove([caminhoArquivo]);
        } catch (erro) {
            console.warn("Não foi possível remover a foto antiga do storage:", erro);
        }
    }

    async function processarFotoServico({ arquivo, url, fotoAtualUrl }) {
        const inputRemover = document.getElementById("servico-remover-foto");
        const removerFotoAtual = inputRemover ? inputRemover.checked : false;

        if (removerFotoAtual) {
            await removerFotoDoStorage(fotoAtualUrl);
            return { url: null, path: null, bucketMissing: false };
        }

        if (arquivo instanceof File) {
            if (fotoAtualUrl) {
                await removerFotoDoStorage(fotoAtualUrl);
            }

            const nomeArquivo = `${Date.now()}-${formatarNomeArquivo(arquivo.name || "servico")}`;
            const caminhoArquivo = `servicos/${nomeArquivo}`;

            try {
                const { error } = await supabaseClient.storage
                    .from(supabaseStorageBucket)
                    .upload(caminhoArquivo, arquivo, {
                        cacheControl: "3600",
                        upsert: true,
                        contentType: arquivo.type || "image/jpeg"
                    });

                if (error) {
                    if (error.message?.includes("Bucket not found") || error.status === 404 || error.code === "404") {
                        const urlFinal = typeof url === "string" ? url.trim() : "";
                        return {
                            url: urlFinal || fotoAtualUrl || null,
                            path: null,
                            bucketMissing: true
                        };
                    }
                    throw error;
                }

                const { data: publicData } = supabaseClient.storage
                    .from(supabaseStorageBucket)
                    .getPublicUrl(caminhoArquivo);

                return {
                    url: publicData?.publicUrl || null,
                    path: caminhoArquivo,
                    bucketMissing: false
                };
            } catch (erro) {
                if (String(erro?.message || "").includes("Bucket not found") || erro?.status === 404 || erro?.code === "404") {
                    const urlFinal = typeof url === "string" ? url.trim() : "";
                    return {
                        url: urlFinal || fotoAtualUrl || null,
                        path: null,
                        bucketMissing: true
                    };
                }
                throw erro;
            }
        }

        const urlFinal = typeof url === "string" ? url.trim() : "";
        return {
            url: urlFinal || fotoAtualUrl || null,
            path: null,
            bucketMissing: false
        };
    }

    function inicializarFotoPreview() {
        const inputArquivo = document.getElementById("servico-foto-arquivo");
        const inputUrl = document.getElementById("servico-foto");
        const removerFoto = document.getElementById("servico-remover-foto");

        if (!inputArquivo || !inputUrl) return;

        inputArquivo.addEventListener("change", () => {
            const arquivo = inputArquivo.files?.[0];
            if (!arquivo) return;

            const leitor = new FileReader();
            leitor.onload = () => {
                if (typeof leitor.result === "string") {
                    exibirPreviewFoto(leitor.result);
                    inputUrl.value = "";
                    if (removerFoto) removerFoto.checked = false;
                }
            };
            leitor.readAsDataURL(arquivo);
        });

        inputUrl.addEventListener("input", () => {
            const valorUrl = inputUrl.value.trim();
            if (valorUrl) {
                exibirPreviewFoto(valorUrl);
                if (removerFoto) removerFoto.checked = false;
            }
        });

        if (removerFoto) {
            removerFoto.addEventListener("change", () => {
                if (removerFoto.checked) {
                    inputArquivo.value = "";
                    inputUrl.value = "";
                    exibirPreviewFoto("");
                }
            });
        }
    }

    // ==================== CADASTRO DE USUÁRIO ====================

    function formatarCpf(valor) {
        const digits = String(valor || "").replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }

    function formatarTelefone(valor) {
        const digits = String(valor || "").replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 2) return digits;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }

    function inicializarCadastro() {
        const formCadastro = document.getElementById("form-cadastro");

        if (!formCadastro) return;

        const cpfInput = document.getElementById("cpf");
        const telefoneInput = document.getElementById("telefone");
        const avatarArquivoInput = document.getElementById("avatar-arquivo");
        const avatarUrlInput = document.getElementById("avatar-url");
        const avatarPreview = document.getElementById("avatar-preview");
        const avatarPreviewWrapper = document.getElementById("avatar-preview-wrapper");

        cpfInput?.addEventListener("input", (event) => {
            event.target.value = formatarCpf(event.target.value);
        });

        telefoneInput?.addEventListener("input", (event) => {
            event.target.value = formatarTelefone(event.target.value);
        });

        avatarArquivoInput?.addEventListener("change", () => {
            const arquivo = avatarArquivoInput.files?.[0];
            if (!arquivo) return;

            const leitor = new FileReader();
            leitor.onload = () => {
                if (typeof leitor.result === "string") {
                    if (avatarUrlInput) avatarUrlInput.value = "";
                    if (avatarPreview) avatarPreview.src = leitor.result;
                    if (avatarPreviewWrapper) avatarPreviewWrapper.style.display = "block";
                }
            };
            leitor.readAsDataURL(arquivo);
        });

        avatarUrlInput?.addEventListener("input", () => {
            const valor = avatarUrlInput.value.trim();
            if (!valor) {
                if (avatarPreviewWrapper) avatarPreviewWrapper.style.display = "none";
                if (avatarPreview) avatarPreview.src = "";
                return;
            }

            if (avatarPreview) avatarPreview.src = valor;
            if (avatarPreviewWrapper) avatarPreviewWrapper.style.display = "block";
        });

        formCadastro.addEventListener("submit", async function (event) {
            event.preventDefault();

            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("email").value.trim();
            const senha = document.getElementById("senha").value;
            const telefone = document.getElementById("telefone").value.trim();
            const cpf = document.getElementById("cpf").value.trim();
            const endereco = document.getElementById("endereco").value.trim();
            const cidade = document.getElementById("cidade").value.trim();
            const estado = document.getElementById("estado").value.trim().toUpperCase();
            const avatarUrl = document.getElementById("avatar-url").value.trim();
            const avatarArquivo = document.getElementById("avatar-arquivo")?.files?.[0] || null;
            const botaoCadastro = document.getElementById("btn-cadastrar");
            if (botaoCadastro) botaoCadastro.disabled = true;

            try {
                if (!nome || !email || !senha || !telefone || !cpf || !endereco || !cidade || !estado) {
                    throw new Error("Preencha todos os campos obrigatórios.");
                }

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

                let avatarFinalUrl = avatarUrl || null;

                if (avatarArquivo) {
                    const nomeArquivo = `avatars/${Date.now()}-${formatarNomeArquivo(avatarArquivo.name || "avatar")}`;
                    const { data: uploadData, error: uploadError } = await supabaseClient.storage
                        .from(supabaseStorageBucket)
                        .upload(nomeArquivo, avatarArquivo, {
                            cacheControl: "3600",
                            upsert: true,
                            contentType: avatarArquivo.type || "image/jpeg"
                        });

                    if (uploadError) {
                        throw uploadError;
                    }

                    const { data: publicData } = supabaseClient.storage
                        .from(supabaseStorageBucket)
                        .getPublicUrl(uploadData?.path || nomeArquivo);

                    avatarFinalUrl = publicData?.publicUrl || avatarFinalUrl;
                }

                const { error: perfilError } = await supabaseClient
                    .from("usuarios_publico")
                    .upsert({
                        user_id: authData.user.id,
                        nome_completo: nome,
                        email,
                        avatar_url: avatarFinalUrl
                    }, { onConflict: "user_id" });

                if (perfilError) {
                    throw perfilError;
                }

                await salvarPerfilPrivado({
                    userId: authData.user.id,
                    cpf,
                    telefone,
                    endereco,
                    cidade,
                    estado,
                    cep: null
                });

                const mensagem = authData.session
                    ? "Conta criada com sucesso! Você já está conectado."
                    : "Conta criada com sucesso! Confira seu e-mail para confirmar a conta e depois entre.";

                alert(mensagem);
                window.location.href = "compras.html";
            } catch (error) {
                alert("Não foi possível concluir o cadastro: " + error.message);
                if (botaoCadastro) {
                    botaoCadastro.disabled = false;
                }
            }
        });
    }

    async function salvarPerfilPrivado({ userId, cpf, telefone, endereco, cidade, estado, cep }) {
        if (!userId) return;

        const payload = {
            user_id: userId,
            cpf: cpf || null,
            telefone: telefone || null,
            endereco: endereco || null,
            cidade: cidade || null,
            estado: estado || null,
            cep: cep || null
        };

        const { error } = await supabaseClient
            .from("usuarios_privados")
            .upsert(payload, { onConflict: "user_id" });

        if (error) {
            throw error;
        }
    }

    async function obterPerfilPrivado(userId) {
        if (!userId) return null;

        const [{ data: perfilPublico, error: erroPublico }, { data: perfilPrivado, error: erroPrivado }] = await Promise.all([
            supabaseClient
                .from("usuarios_publico")
                .select("id, nome_completo, avatar_url")
                .eq("user_id", userId)
                .maybeSingle(),
            supabaseClient
                .from("usuarios_privados")
                .select("cpf, telefone, endereco, cidade, estado, cep")
                .eq("user_id", userId)
                .maybeSingle()
        ]);

        if (erroPublico && erroPublico.code !== "PGRST116") {
            throw erroPublico;
        }

        if (erroPrivado && erroPrivado.code !== "PGRST116") {
            throw erroPrivado;
        }

        return {
            ...perfilPublico,
            ...perfilPrivado,
            nome_completo: perfilPublico?.nome_completo || "Usuário",
            cpf: perfilPrivado?.cpf || "",
            telefone: perfilPrivado?.telefone || "",
            endereco: perfilPrivado?.endereco || "",
            cidade: perfilPrivado?.cidade || "",
            estado: perfilPrivado?.estado || "",
            cep: perfilPrivado?.cep || ""
        };
    }

    function fecharModalPerfilUsuario() {
        const modal = document.getElementById("perfil-usuario-modal");
        if (!modal) return;
        modal.remove();
    }

    async function abrirModalPerfilUsuario() {
        const { data: sessaoData } = await supabaseClient.auth.getSession();
        const usuario = sessaoData.session?.user;

        if (!usuario) {
            alert("Entre na sua conta para visualizar seu perfil.");
            window.location.href = "Servix.html";
            return;
        }

        try {
            const perfil = await obterPerfilPrivado(usuario.id);

            const modal = document.createElement("div");
            modal.id = "perfil-usuario-modal";
            modal.style.position = "fixed";
            modal.style.top = "0";
            modal.style.left = "0";
            modal.style.width = "100%";
            modal.style.height = "100%";
            modal.style.background = "rgba(15, 23, 42, 0.6)";
            modal.style.display = "flex";
            modal.style.alignItems = "center";
            modal.style.justifyContent = "center";
            modal.style.zIndex = "9999";
            modal.style.padding = "20px";

            modal.innerHTML = `
                <div style="background:#fff; width:min(560px, 100%); border-radius:18px; box-shadow:0 18px 45px rgba(15, 23, 42, 0.25); overflow:hidden; border:1px solid #e5e7eb;">
                    <div style="padding:20px 24px; border-bottom:1px solid #edf2f7; display:flex; align-items:center; justify-content:space-between; gap:12px;">
                        <div>
                            <h2 style="margin:0; font-size:1.2rem; color:#0f172a;">Meu perfil</h2>
                        </div>
                        <button type="button" class="perfil-fechar" aria-label="Fechar" style="border:none; background:#f1f5f9; width:34px; height:34px; border-radius:50%; font-size:1.2rem; cursor:pointer; color:#0f172a;">×</button>
                    </div>

                    <form id="form-perfil-usuario" style="padding:24px; display:grid; gap:16px;">
                        <div>
                            <label for="perfil-nome" style="display:block; margin-bottom:8px; font-weight:600; color:#0f172a;">Nome</label>
                            <input id="perfil-nome" type="text" value="${String(perfil?.nome_completo || "").replace(/"/g, '&quot;')}" style="width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:0.98rem;" required>
                        </div>

                        <div>
                            <label for="perfil-email" style="display:block; margin-bottom:8px; font-weight:600; color:#0f172a;">E-mail</label>
                            <input id="perfil-email" type="email" value="${String(perfil?.email || "").replace(/"/g, '&quot;')}" style="width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:0.98rem; background:#f8fafc;" readonly>
                        </div>

                        <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:16px;">
                            <div>
                                <label for="perfil-cpf" style="display:block; margin-bottom:8px; font-weight:600; color:#0f172a;">CPF</label>
                                <input id="perfil-cpf" type="text" value="${String(perfil?.cpf || "").replace(/"/g, '&quot;')}" maxlength="14" placeholder="000.000.000-00" style="width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:0.98rem;" required>
                            </div>
                            <div>
                                <label for="perfil-telefone" style="display:block; margin-bottom:8px; font-weight:600; color:#0f172a;">Telefone</label>
                                <input id="perfil-telefone" type="tel" value="${String(perfil?.telefone || "").replace(/"/g, '&quot;')}" maxlength="15" placeholder="(11) 99999-9999" style="width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:0.98rem;" required>
                            </div>
                        </div>

                        <div>
                            <label for="perfil-endereco" style="display:block; margin-bottom:8px; font-weight:600; color:#0f172a;">Endereço</label>
                            <input id="perfil-endereco" type="text" value="${String(perfil?.endereco || "").replace(/"/g, '&quot;')}" placeholder="Rua, número e bairro" style="width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:0.98rem;" required>
                        </div>

                        <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:16px;">
                            <div>
                                <label for="perfil-cidade" style="display:block; margin-bottom:8px; font-weight:600; color:#0f172a;">Cidade</label>
                                <input id="perfil-cidade" type="text" value="${String(perfil?.cidade || "").replace(/"/g, '&quot;')}" style="width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:0.98rem;" required>
                            </div>
                            <div>
                                <label for="perfil-estado" style="display:block; margin-bottom:8px; font-weight:600; color:#0f172a;">Estado</label>
                                <input id="perfil-estado" type="text" value="${String(perfil?.estado || "").replace(/"/g, '&quot;')}" maxlength="2" placeholder="SP" style="width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:0.98rem;" required>
                            </div>
                            <div>
                                <label for="perfil-cep" style="display:block; margin-bottom:8px; font-weight:600; color:#0f172a;">CEP</label>
                                <input id="perfil-cep" type="text" value="${String(perfil?.cep || "").replace(/"/g, '&quot;')}" maxlength="9" placeholder="00000-000" style="width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:0.98rem;">
                            </div>
                        </div>

                        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:10px;">
                            <button type="button" class="perfil-cancelar" style="padding:10px 16px; border:1px solid #cbd5e1; background:#fff; border-radius:10px; color:#0f172a; cursor:pointer;">Cancelar</button>
                            <button type="submit" style="padding:10px 18px; border:none; background:#111827; color:#fff; border-radius:10px; cursor:pointer; font-weight:600;">Salvar</button>
                        </div>
                    </form>
                </div>
            `;

            modal.addEventListener("click", (event) => {
                if (event.target === modal) fecharModalPerfilUsuario();
            });

            const fecharBotao = modal.querySelector(".perfil-fechar");
            fecharBotao?.addEventListener("click", fecharModalPerfilUsuario);

            modal.querySelector(".perfil-cancelar")?.addEventListener("click", fecharModalPerfilUsuario);

            const cpfInput = modal.querySelector("#perfil-cpf");
            const telefoneInput = modal.querySelector("#perfil-telefone");
            const cepInput = modal.querySelector("#perfil-cep");

            cpfInput?.addEventListener("input", (event) => {
                event.target.value = formatarCpf(event.target.value);
            });

            telefoneInput?.addEventListener("input", (event) => {
                event.target.value = formatarTelefone(event.target.value);
            });

            cepInput?.addEventListener("input", (event) => {
                const digits = String(event.target.value || "").replace(/\D/g, "").slice(0, 8);
                event.target.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
            });

            const formPerfil = modal.querySelector("#form-perfil-usuario");
            formPerfil?.addEventListener("submit", async (event) => {
                event.preventDefault();

                const nome = modal.querySelector("#perfil-nome")?.value.trim();
                const cpf = modal.querySelector("#perfil-cpf")?.value.trim();
                const telefone = modal.querySelector("#perfil-telefone")?.value.trim();
                const endereco = modal.querySelector("#perfil-endereco")?.value.trim();
                const cidade = modal.querySelector("#perfil-cidade")?.value.trim();
                const estado = modal.querySelector("#perfil-estado")?.value.trim().toUpperCase();
                const cep = modal.querySelector("#perfil-cep")?.value.trim();

                if (!nome || !cpf || !telefone || !endereco || !cidade || !estado) {
                    alert("Preencha os campos obrigatórios do perfil.");
                    return;
                }

                try {
                    const { error: erroPublico } = await supabaseClient
                        .from("usuarios_publico")
                        .upsert({
                            user_id: usuario.id,
                            nome_completo: nome,
                            email: usuario.email
                        }, { onConflict: "user_id" });

                    if (erroPublico) throw erroPublico;

                    await salvarPerfilPrivado({
                        userId: usuario.id,
                        cpf,
                        telefone,
                        endereco,
                        cidade,
                        estado,
                        cep: cep || null
                    });

                    alert("Perfil atualizado com sucesso!");
                    fecharModalPerfilUsuario();
                    await atualizarHeaderUsuario();
                } catch (erro) {
                    alert("Não foi possível salvar o perfil: " + erro.message);
                }
            });

            document.body.appendChild(modal);
        } catch (erro) {
            console.error("Erro ao abrir perfil do usuário:", erro);
            alert("Não foi possível carregar seu perfil: " + erro.message);
        }
    }

    async function inicializarServico() {
        const formServico = document.getElementById("form-servico");

        if (!formServico) return;

        inicializarFotoPreview();

        const { data: sessaoData } = await supabaseClient.auth.getSession();
        if (!sessaoData.session?.user) {
            alert("Entre na sua conta antes de publicar um serviço.");
            window.location.href = "Servix.html";
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const servicoEditandoId = Number(params.get("editar"));
        const fotoAtualUrl = document.getElementById("servico-foto-atual-url");

        if (Number.isFinite(servicoEditandoId) && servicoEditandoId > 0) {
            const { data: servicoAtual, error: erroServico } = await supabaseClient
                .from("serviços")
                .select("id, titulo, descricao, cep, endereco, cidade, estado, categoria, preco_estimado, preço_detalhe, foto_url, whatsapp, criado_por")
                .eq("id", servicoEditandoId)
                .maybeSingle();

            if (!erroServico && servicoAtual) {
                document.getElementById("servico-titulo").value = servicoAtual.titulo || "";
                document.getElementById("servico-descricao").value = servicoAtual.descricao || "";
                document.getElementById("servico-cep").value = servicoAtual.cep || "";
                document.getElementById("servico-endereco").value = servicoAtual.endereco || "";
                document.getElementById("servico-cidade").value = servicoAtual.cidade || "";
                document.getElementById("servico-estado").value = servicoAtual.estado || "";
                document.getElementById("servico-categoria").value = servicoAtual.categoria ? String(servicoAtual.categoria) : "";
                document.getElementById("servico-preco").value = servicoAtual.preco_estimado || "";
                document.getElementById("servico-detalhe").value = servicoAtual["preço_detalhe"] || "";
                document.getElementById("servico-whatsapp").value = servicoAtual.whatsapp || "";
                if (fotoAtualUrl) fotoAtualUrl.value = servicoAtual.foto_url || "";
                if (servicoAtual.foto_url) {
                    document.getElementById("servico-foto").value = servicoAtual.foto_url;
                    exibirPreviewFoto(servicoAtual.foto_url);
                }
                const tituloBotao = document.getElementById("btn-publicar");
                if (tituloBotao) tituloBotao.textContent = "Salvar alterações";
            }
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

                const arquivoFoto = document.getElementById("servico-foto-arquivo")?.files?.[0] || null;
                const fotoUrl = document.getElementById("servico-foto").value.trim();
                const fotoResultado = await processarFotoServico({
                    arquivo: arquivoFoto,
                    url: fotoUrl,
                    fotoAtualUrl: fotoAtualUrl?.value || null
                });

                if (fotoResultado.bucketMissing) {
                    alert("O bucket de imagens do Supabase ainda não foi criado. O serviço será salvo sem foto. Crie o bucket 'servix-fotos' e tente novamente.");
                }

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
                    foto_url: fotoResultado.url || null,
                    criado_por: perfil.id,
                    whatsapp: document.getElementById("servico-whatsapp").value.trim() || null
                };

                const coordenadas = await geocodificarEndereco(servico.endereco, servico.cidade, servico.estado)
                    .catch(() => null);
                servico.latitude = coordenadas?.latitude || null;
                servico.longitude = coordenadas?.longitude || null;

                if (Number.isFinite(servicoEditandoId) && servicoEditandoId > 0) {
                    const { error: servicoError } = await supabaseClient
                        .from("serviços")
                        .update(servico)
                        .eq("id", servicoEditandoId);

                    if (servicoError) throw servicoError;
                    alert("Serviço atualizado com sucesso!");
                } else {
                    const { error: servicoError } = await supabaseClient.from("serviços").insert(servico);
                    if (servicoError) throw servicoError;
                    alert("Serviço publicado com sucesso!");
                }

                window.location.href = "compras.html";
            } catch (error) {
                alert("Não foi possível salvar o serviço: " + error.message);
                botaoPublicar.disabled = false;
            }
        });
    }

    async function atualizarHeaderUsuario() {
        const userHeader = document.getElementById("user-header");
        const userNome = document.getElementById("user-header-nome");
        const userAvatar = document.getElementById("user-header-avatar");
        const botaoLogin = document.querySelector(".btn-login");

        if (!userHeader || !userNome || !userAvatar) return;

        const { data: sessaoData } = await supabaseClient.auth.getSession();
        const usuario = sessaoData.session?.user;

        if (!usuario) {
            userHeader.hidden = true;
            if (botaoLogin) botaoLogin.style.display = "inline-flex";
            return;
        }

        const { data: perfil, error } = await supabaseClient
            .from("usuarios_publico")
            .select("nome_completo, avatar_url")
            .eq("user_id", usuario.id)
            .maybeSingle();

        const nomeExibicao = perfil?.nome_completo || usuario.email?.split("@")[0] || "Usuário";
        userNome.textContent = nomeExibicao;

        const botaoPerfil = document.querySelector(".user-header-trigger");
        if (botaoPerfil) {
            botaoPerfil.onclick = abrirModalPerfilUsuario;
        }

        if (perfil?.avatar_url) {
            userAvatar.src = perfil.avatar_url;
            userAvatar.alt = nomeExibicao;
        } else {
            userAvatar.src = "";
            userAvatar.alt = nomeExibicao;
        }

        userHeader.hidden = false;
        if (botaoLogin) botaoLogin.style.display = "none";
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
                foto_url,
                criado_por,
                    categorias ( categoria ),
                    avaliaçoes ( nota )
            `);

            if (error) throw error;

            const idsAutores = [...new Set((dadosServicos || [])
                .map(item => item.criado_por)
                .filter(item => Number.isFinite(Number(item)) && Number(item) > 0))];

            let autoresMap = {};

            if (idsAutores.length > 0) {
                const { data: perfisAutores, error: erroPerfis } = await supabaseClient
                    .from('usuarios_publico')
                    .select('id, nome_completo, avatar_url')
                    .in('id', idsAutores);

                if (!erroPerfis && perfisAutores) {
                    autoresMap = perfisAutores.reduce((acc, perfil) => {
                        acc[Number(perfil.id)] = {
                            nome: perfil.nome_completo || "Prestador",
                            avatarUrl: perfil.avatar_url || ""
                        };
                        return acc;
                    }, {});
                }
            }

            // Mapeia os dados do banco para o formato que a interface (HTML) espera
            servicos = dadosServicos.map(dbItem => {
                const notas = dbItem.avaliaçoes || [];
                const mediaNotas = notas.length > 0
                    ? notas.reduce((acc, curr) => acc + curr.nota, 0) / notas.length
                    : 0; // 0 se não houver avaliações

                const nomeCategoria = dbItem.categorias?.categoria || "Geral";
                const autor = autoresMap[Number(dbItem.criado_por)] || {};

                return {
                    id: dbItem.id,
                    nome: dbItem.titulo || "Serviço sem título",
                    categoria: normalizarTexto(nomeCategoria), // Ex: "eletrica"
                    categoriaLabel: nomeCategoria,             // Ex: "Elétrica"
                    descricao: dbItem.descricao || "Sem descrição disponível.",
                    fotoUrl: dbItem.foto_url || "",
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
                        : null,
                    criadoPor: dbItem.criado_por,
                    autorNome: autor.nome || "Prestador",
                    autorAvatarUrl: autor.avatarUrl || ""
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
            <div class="card-cover ${servico.cor} ${servico.fotoUrl ? "has-photo" : ""}">
                ${servico.fotoUrl
                    ? `<img src="${servico.fotoUrl}" alt="${escaparHtml(servico.nome)}" class="service-card-image" loading="lazy">`
                    : `<div class="avatar">${servico.avatar}</div>`}
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

    function ajustarCardsDeFoto() {
        document.querySelectorAll('.service-card-image').forEach((imagem) => {
            const card = imagem.closest('.card-cover');
            if (!card || !imagem.complete) {
                return;
            }

            const ratio = imagem.naturalWidth / imagem.naturalHeight;
            card.classList.toggle('card-cover-landscape', ratio >= 1.3);
            card.classList.toggle('card-cover-portrait', ratio < 0.9);
        });
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

        requestAnimationFrame(() => {
            ajustarCardsDeFoto();
        });

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

        const { data: sessaoData } = await supabaseClient.auth.getSession();
        if (sessaoData.session?.user) {
            const { data: perfil } = await supabaseClient
                .from("usuarios_publico")
                .select("id")
                .eq("user_id", sessaoData.session.user.id)
                .maybeSingle();

            if (perfil && Number(perfil.id) === Number(modal.dataset.criadorId)) {
                formulario.innerHTML = "<p class=\"profile-review-empty\">O autor deste serviço não pode avaliá-lo.</p>";
                return;
            }
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

    async function verificarDonoServico(servico) {
        const { data: sessaoData } = await supabaseClient.auth.getSession();
        if (!sessaoData.session?.user) return false;

        const { data: perfil, error } = await supabaseClient
            .from("usuarios_publico")
            .select("id")
            .eq("user_id", sessaoData.session.user.id)
            .maybeSingle();

        if (error || !perfil) return false;
        return Number(perfil.id) === Number(servico.criadoPor);
    }

    function mostrarPerfil(servicoId) {
        const servico = servicos.find(item => item.id === Number(servicoId));
        if (!servico) return;

        const modal = document.createElement("div");
        modal.className = "profile-modal";
        modal.dataset.criadorId = String(servico.criadoPor ?? "");

        const perfilAutorHtml = `
            <div class="profile-owner-avatar-wrap">
                ${servico.autorAvatarUrl ? `
                    <img src="${servico.autorAvatarUrl}" alt="Avatar do prestador" class="profile-owner-avatar">
                ` : `
                    <div class="profile-owner-avatar-fallback">${String(servico.autorNome || servico.nome || "S").charAt(0).toUpperCase()}</div>
                `}
            </div>
        `;

        modal.innerHTML = `
            <div class="profile-modal-content" role="dialog" aria-modal="true" aria-labelledby="perfil-modal-titulo">
                <button type="button" class="profile-modal-close" aria-label="Fechar perfil">&times;</button>
                ${perfilAutorHtml}
                ${servico.fotoUrl ? `
                    <div class="profile-modal-image-wrap">
                        <img src="${servico.fotoUrl}" alt="${escaparHtml(servico.nome)}" class="profile-modal-image">
                    </div>
                ` : ""}
                <span class="profile-modal-kicker">Prestador verificado</span>
                <h2 id="perfil-modal-titulo">${servico.nome}</h2>
                <p class="profile-modal-category">${servico.categoriaLabel} em ${servico.localizacao || "atendimento regional"}</p>
                <p>${servico.descricao}</p>
                <div class="profile-modal-stats">
                    <span>⭐ ${servico.rating.toFixed(1)} (${servico.avaliacoes} avaliações)</span>
                    <span>${servico.experiencia} serviços realizados</span>
                    <strong>A partir de R$ ${servico.precoMin}</strong>
                </div>
                <div class="profile-modal-owner-actions" style="display: none; gap: 12px; margin-top: 18px;">
                    <button type="button" class="btn-outline profile-modal-edit">Editar dados</button>
                    <button type="button" class="btn-outline profile-modal-delete" style="border-color: #d14343; color: #d14343;">Excluir</button>
                </div>
                <form class="profile-edit-form" data-servico-id="${servico.id}">
                    <label>
                        Título
                        <input type="text" name="titulo" value="${escaparHtml(servico.nome)}" required>
                    </label>
                    <label>
                        Descrição
                        <textarea name="descricao" required>${escaparHtml(servico.descricao)}</textarea>
                    </label>
                    <label>
                        Categoria
                        <select name="categoria" required></select>
                    </label>
                    <label>
                        Preço estimado
                        <input type="number" name="preco_estimado" min="0" step="0.01" value="${Number(servico.precoMin || 0).toFixed(2)}" required>
                    </label>
                    <label>
                        Foto do serviço
                        <input type="url" name="foto_url" value="${servico.fotoUrl ? escaparHtml(servico.fotoUrl) : ""}" placeholder="https://...">
                    </label>
                    <div class="profile-edit-actions">
                        <button type="submit" class="btn-primary">Salvar</button>
                        <button type="button" class="btn-outline profile-edit-cancel">Cancelar</button>
                    </div>
                </form>
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

        const areaAcoesDono = modal.querySelector(".profile-modal-owner-actions");
        const botaoEditar = modal.querySelector(".profile-modal-edit");
        const botaoExcluir = modal.querySelector(".profile-modal-delete");
        const formEdit = modal.querySelector(".profile-edit-form");
        const selectCategoria = formEdit?.querySelector("select[name='categoria']");

        if (selectCategoria) {
            selectCategoria.innerHTML = categorias.map(categoria => `
                <option value="${categoria.id}" ${String(categoria.id) === String(servico.categoria) || normalizarTexto(categoria.categoria) === normalizarTexto(servico.categoriaLabel) ? "selected" : ""}>
                    ${categoria.categoria}
                </option>
            `).join("");
        }

        verificarDonoServico(servico).then(ehDono => {
            if (!ehDono || !areaAcoesDono || !botaoEditar || !botaoExcluir || !formEdit) return;

            areaAcoesDono.style.display = "flex";

            botaoEditar.addEventListener("click", () => {
                formEdit.classList.toggle("is-visible");
            });

            formEdit.querySelector(".profile-edit-cancel")?.addEventListener("click", () => {
                formEdit.classList.remove("is-visible");
            });

            formEdit.addEventListener("submit", async event => {
                event.preventDefault();

                const campos = new FormData(formEdit);
                const dadosAtualizados = {
                    titulo: String(campos.get("titulo") || "").trim(),
                    descricao: String(campos.get("descricao") || "").trim(),
                    categoria: Number(campos.get("categoria") || servico.categoria || 0),
                    preco_estimado: Number(campos.get("preco_estimado") || 0),
                    foto_url: String(campos.get("foto_url") || "").trim() || null
                };

                if (!dadosAtualizados.titulo || !dadosAtualizados.descricao || !dadosAtualizados.categoria) {
                    alert("Preencha título, descrição e categoria antes de salvar.");
                    return;
                }

                try {
                    const { error } = await supabaseClient
                        .from("serviços")
                        .update(dadosAtualizados)
                        .eq("id", servico.id);

                    if (error) throw error;

                    const categoriaAtual = categorias.find(item => Number(item.id) === Number(dadosAtualizados.categoria));
                    const categoriaLabel = categoriaAtual?.categoria || servico.categoriaLabel;

                    const idx = servicos.findIndex(item => item.id === servico.id);
                    if (idx >= 0) {
                        servicos[idx] = {
                            ...servicos[idx],
                            nome: dadosAtualizados.titulo,
                            descricao: dadosAtualizados.descricao,
                            categoria: normalizarTexto(categoriaLabel),
                            categoriaLabel,
                            fotoUrl: dadosAtualizados.foto_url || servico.fotoUrl,
                            precoMin: dadosAtualizados.preco_estimado
                        };
                    }

                    formEdit.classList.remove("is-visible");
                    alert("Dados do serviço atualizados com sucesso!");
                    fechar();
                    mostrarPerfil(servico.id);
                } catch (erro) {
                    alert("Não foi possível atualizar os dados do serviço: " + erro.message);
                }
            });

            botaoExcluir.addEventListener("click", async () => {
                const confirmar = window.confirm("Deseja realmente excluir este serviço e remover a foto associada?");
                if (!confirmar) return;

                try {
                    if (servico.fotoUrl) {
                        await removerFotoDoStorage(servico.fotoUrl);
                    }

                    const { error } = await supabaseClient
                        .from("serviços")
                        .delete()
                        .eq("id", servico.id);

                    if (error) throw error;

                    alert("Serviço excluído com sucesso.");
                    fechar();
                    await carregarServicosDoBanco();
                } catch (erro) {
                    alert("Não foi possível excluir o serviço: " + erro.message);
                }
            });
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

        window.addEventListener("load", () => {
            ajustarCardsDeFoto();
        });

        inicializarPaginaPedidos();
        inicializarCheckout();
        atualizarContadorCarrinho();
        inicializarEfeitosModernos();
        inicializarCadastro();
        inicializarServico();
        inicializarCriacaoCategoria();
        inicializarLogin();
        atualizarHeaderUsuario();

        const triggerPerfil = document.querySelector(".user-header-trigger");
        if (triggerPerfil) {
            triggerPerfil.addEventListener("click", abrirModalPerfilUsuario);
        }

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
