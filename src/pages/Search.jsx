import { useSearchParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { Sliders } from 'lucide-react'
import ServiceCard from '../components/ServiceCard'
import CategoryFilter from '../components/CategoryFilter'

export default function Search() {
    const [searchParams] = useSearchParams()
    const [selectedCategory, setSelectedCategory] = useState('')
    const [priceRange, setPriceRange] = useState([0, 1000])
    const [sortBy, setSortBy] = useState('popular')
    const [showFilters, setShowFilters] = useState(false)

    const query = searchParams.get('q') || ''

    // Mock data - in real app, this would come from an API
    const allServices = [
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
        {
            id: 7,
            title: 'Pintura de Sala e Cozinha',
            category: 'Pintura',
            price: 400,
            image: 'https://images.unsplash.com/photo-1581578731548-c64695c952952?w=400&h=300&fit=crop',
            rating: 4.5,
            reviews: 98,
            professionalName: 'Roberto Pintor',
            location: 'Belo Horizonte, MG',
            responseTime: '3 horas',
        },
        {
            id: 8,
            title: 'Eletricista para Reforma',
            category: 'Eletricista',
            price: 250,
            image: 'https://images.unsplash.com/photo-1581092162562-40038e57e0ee?w=400&h=300&fit=crop',
            rating: 4.7,
            reviews: 167,
            professionalName: 'Fernando Eletricista',
            location: 'Curitiba, PR',
            responseTime: '45 min',
        },
    ]

    // Filter and sort
    const filteredServices = useMemo(() => {
        let results = allServices

        // Filter by search query
        if (query) {
            results = results.filter(
                (s) =>
                    s.title.toLowerCase().includes(query.toLowerCase()) ||
                    s.category.toLowerCase().includes(query.toLowerCase()) ||
                    s.professionalName.toLowerCase().includes(query.toLowerCase())
            )
        }

        // Filter by category
        if (selectedCategory) {
            results = results.filter((s) => s.category === selectedCategory)
        }

        // Filter by price
        results = results.filter((s) => s.price >= priceRange[0] && s.price <= priceRange[1])

        // Sort
        if (sortBy === 'popular') {
            results.sort((a, b) => b.reviews - a.reviews)
        } else if (sortBy === 'rating') {
            results.sort((a, b) => b.rating - a.rating)
        } else if (sortBy === 'price-low') {
            results.sort((a, b) => a.price - b.price)
        } else if (sortBy === 'price-high') {
            results.sort((a, b) => b.price - a.price)
        }

        return results
    }, [query, selectedCategory, priceRange, sortBy])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {query ? `Resultados para: ${query}` : 'Buscar Serviços'}
                    </h1>
                    <p className="text-gray-600">
                        {filteredServices.length} serviços encontrados
                    </p>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar - Desktop */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">
                                Filtros
                            </h3>

                            {/* Category */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Categoria
                                </label>
                                <CategoryFilter
                                    onCategoryChange={setSelectedCategory}
                                    selectedCategory={selectedCategory}
                                />
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Preço
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={priceRange[1]}
                                        onChange={(e) =>
                                            setPriceRange([priceRange[0], parseInt(e.target.value)])
                                        }
                                        className="w-full"
                                    />
                                    <p className="text-sm text-gray-600">
                                        R$ 0 - R${' '}
                                        {priceRange[1].toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Ordenar por
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="popular">Mais Popular</option>
                                    <option value="rating">Melhor Avaliado</option>
                                    <option value="price-low">Menor Preço</option>
                                    <option value="price-high">Maior Preço</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden mb-6 flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 w-full justify-center"
                        >
                            <Sliders size={20} />
                            Filtros
                        </button>

                        {/* Mobile Filters */}
                        {showFilters && (
                            <div className="lg:hidden bg-white rounded-lg shadow p-6 mb-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Categoria
                                    </label>
                                    <CategoryFilter
                                        onCategoryChange={setSelectedCategory}
                                        selectedCategory={selectedCategory}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Ordenar por
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="popular">Mais Popular</option>
                                        <option value="rating">Melhor Avaliado</option>
                                        <option value="price-low">Menor Preço</option>
                                        <option value="price-high">Maior Preço</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Results Grid */}
                        {filteredServices.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {filteredServices.map((service) => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">
                                    Nenhum serviço encontrado com os filtros selecionados.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
