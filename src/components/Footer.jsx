import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-lightgray-900 text-lightgray-400 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Servix</h3>
                        <p className="text-sm text-lightgray-400">
                            A plataforma que conecta você com os melhores profissionais autônomos e pequenos serviços da sua região.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Para Consumidores</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="hover:text-white transition">
                                    Buscar Serviços
                                </Link>
                            </li>
                            <li>
                                <Link to="/how-it-works" className="hover:text-white transition">
                                    Como Funciona
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Categorias
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Para Profissionais</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Cadastrar Serviço
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Suporte
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Nos Siga</h4>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="text-lightgray-400 hover:text-primary-400 transition text-xl"
                            >
                                f
                            </a>
                            <a
                                href="#"
                                className="text-lightgray-400 hover:text-accent-400 transition text-xl"
                            >
                                📷
                            </a>
                            <a
                                href="#"
                                className="text-lightgray-400 hover:text-primary-300 transition text-xl"
                            >
                                𝕏
                            </a>
                            <a
                                href="#"
                                className="text-lightgray-400 hover:text-accent-500 transition text-xl"
                            >
                                ✉
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-lightgray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-lightgray-500">
                        &copy; 2024 Servix. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6 mt-4 md:mt-0 text-sm">
                        <a href="#" className="text-lightgray-400 hover:text-white transition">
                            Termos de Serviço
                        </a>
                        <a href="#" className="text-lightgray-400 hover:text-white transition">
                            Privacidade
                        </a>
                        <a href="#" className="text-lightgray-400 hover:text-white transition">
                            Contato
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
