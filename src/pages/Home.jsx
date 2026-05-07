import { Link } from 'react-router-dom'
import { ChevronRight, Star, Zap } from 'lucide-react'
import ServiceCard from '../components/ServiceCard'

export default function Home() {
    // Mock data
    const featuredServices = [
        {
            id: 1,
            title: 'Limpeza Profissional de Apartamento',
            category: 'Limpeza',
            price: 150,
            image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop',
            rating: 4.8,
            reviews: 245,
            professionalName: 'João Silva',
            location: 'São Paulo, SP',
            responseTime: '1 hora',
        },
        {
            id: 2,
            title: 'Reparo de Vazamento no Banheiro',
            category: 'Encanamento',
            price: 200,
            image: 'https://images.unsplash.com/photo-1578902607414-ff3a5342ba52?w=400&h=300&fit=crop',
            rating: 4.9,
            reviews: 189,
            professionalName: 'Carlos Pereira',
            location: 'São Paulo, SP',
            responseTime: '30 min',
        },
        {
            id: 3,
            title: 'Design de Logo e Branding',
            category: 'Design',
            price: 500,
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
            rating: 4.7,
            reviews: 156,
            professionalName: 'Maria Designer',
            location: 'São Paulo, SP',
            responseTime: '2 horas',
        },
        {
            id: 4,
            title: 'Aulas de Inglês Online',
            category: 'Aulas',
            price: 80,
            image: 'https://images.unsplash.com/photo-1516321318423-f06f70db4397?w=400&h=300&fit=crop',
            rating: 4.6,
            reviews: 312,
            professionalName: 'Ana English',
            location: 'Brasília, DF',
            responseTime: '15 min',
        },
        {
            id: 5,
            title: 'Fotografia de Eventos',
            category: 'Fotografia',
            price: 800,
            image: 'https://images.unsplash.com/photo-1502164980535-c067b3acd4d7?w=400&h=300&fit=crop',
            rating: 4.9,
            reviews: 87,
            professionalName: 'Lucas Fotógrafo',
            location: 'Rio de Janeiro, RJ',
            responseTime: '1 dia',
        },
        {
            id: 6,
            title: 'Desenvolvimento Web - React',
            category: 'Programação',
            price: 150,
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
            rating: 4.8,
            reviews: 234,
            professionalName: 'Pedro Dev',
            location: 'São Paulo, SP',
            responseTime: '2 horas',
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            Encontre o Profissional Perfeito
                        </h1>
                        <p className="text-xl text-primary-100 mb-8">
                            Contrate os melhores profissionais autônomos para seus projetos e
                            pequenos serviços
                        </p>

                        {/* Search Box */}
                        <div className="max-w-2xl mx-auto">
                            <div className="flex gap-2 flex-col sm:flex-row">
                                <input
                                    type="text"
                                    placeholder="O que você procura?"
                                    className="flex-1 px-4 py-3 rounded-lg text-lightgray-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
                                />
                                <button className="bg-accent-500 text-lightgray-900 px-8 py-3 rounded-lg font-semibold hover:bg-accent-600 transition">
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Categories */}
                    <div className="mt-12 flex flex-wrap gap-3 justify-center">
                        {[
                            'Limpeza',
                            'Reparos',
                            'Pintura',
                            'Encanamento',
                            'Design',
                            'Programação',
                        ].map((cat) => (
                            <Link
                                key={cat}
                                to={`/search?q=${cat}`}
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm transition"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12 text-lightgray-900">
                        Como Funciona
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                title: 'Busque',
                                description: 'Procure pelo serviço que você precisa na nossa plataforma',
                                icon: '🔍',
                            },
                            {
                                step: '2',
                                title: 'Compare',
                                description: 'Compare preços, avaliações e disponibilidade',
                                icon: '⭐',
                            },
                            {
                                step: '3',
                                title: 'Contrate',
                                description: 'Escolha o profissional ideal e feche o negócio',
                                icon: '✅',
                            },
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="text-5xl mb-4">{item.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 text-lightgray-900">
                                    {item.title}
                                </h3>
                                <p className="text-lightgray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Services */}
            <section className="py-16 bg-lightgray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl font-bold text-lightgray-900">
                            Serviços em Destaque
                        </h2>
                        <Link
                            to="/search"
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1 transition font-semibold"
                        >
                            Ver Mais
                            <ChevronRight size={20} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredServices.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-accent-500 to-accent-600 text-lightgray-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Você é um Profissional?</h2>
                    <p className="text-lg text-lightgray-800 mb-8">
                        Ganhe dinheiro oferecendo seus serviços na Servix
                    </p>
                    <Link
                        to="/register"
                        className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition inline-block"
                    >
                        Cadastre-se Como Profissional
                    </Link>
                </div>
            </section>
        </div>
    )
}
