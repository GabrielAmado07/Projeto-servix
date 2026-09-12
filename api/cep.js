module.exports = async function handler(request, response) {
    if (request.method === "OPTIONS") {
        response.setHeader("Allow", "GET, OPTIONS");
        return response.status(204).end();
    }

    if (request.method !== "GET") {
        response.setHeader("Allow", "GET, OPTIONS");
        return response.status(405).json({ erro: "Método não permitido" });
    }

    const cep = String(request.query.cep || "").replace(/\D/g, "");

    if (!/^\d{8}$/.test(cep)) {
        return response.status(400).json({ erro: "CEP inválido" });
    }

    try {
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await viaCepResponse.json();

        if (!viaCepResponse.ok || data.erro) {
            return response.status(404).json({ erro: "CEP não encontrado" });
        }

        response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
        return response.status(200).json(data);
    } catch (error) {
        console.error("Erro ao consultar ViaCEP:", error);
        return response.status(502).json({ erro: "Serviço de CEP indisponível" });
    }
};
