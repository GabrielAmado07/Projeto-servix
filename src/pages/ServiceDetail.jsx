import { useParams, useNavigate } from 'react-router-dom'
import { Star, MapPin, Clock, Heart, Share2, ChevronLeft } from 'lucide-react'
import { useState } from 'react'

export default function ServiceDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('about')

    // Mock data - in real app, fetch from API
    const service = {
        id: id,
        title: 'Limpeza Profissional de Apartamento',
        category: 'Limpeza',
        price: 150,
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
        rating: 4.8,
        reviews: 245,
        professionalName: 'João Silva',
        professionalImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        location: 'São Paulo, SP',
        responseTime: '1 hora',
        description:
            'Serviço profissional de limpeza com equipe treinada e equipamentos de qualidade. Oferecemos limpeza completa de apartamentos, incluindo varredura, aspiração, limpeza de banheiros, cozinha e vidros.',
        services: ['Varredura', 'Aspiração', 'Limpeza de Banheiros', 'Limpeza de Cozinha', 'Limpeza de Vidros'],
        availability: 'Seg-Sex 08:00 - 18:00, Sáb 08:00 - 14:00',
        minOrder: 'Mínimo R$150',
    }

    const handleAddToCart = () => {
        navigate('/checkout', { state: { service, quantity } })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with back button */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                        <ChevronLeft size={20} />
                        Voltar
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Image Gallery */}
                        <div className="mb-8">
                            <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-96 object-cover rounded-lg"
                            />
                        </div>

                        {/* Professional Info */}
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={service.professionalImage}
                                        alt={service.professionalName}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {service.professionalName}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={`${i < Math.floor(service.rating)
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-semibold">
                                                {service.rating}
                                            </span>
                                            <span className="text-gray-500">
                                                ({service.reviews} avaliações)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                                        <Heart size={20} />
                                    </button>
                                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-500" />
                                    <span>{service.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-gray-500" />
                                    <span>Responde em {service.responseTime}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-lg shadow mb-6">
                            <div className="flex border-b">
                                {['about', 'reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-4 text-center font-semibold transition ${activeTab === tab
                                                ? 'border-b-2 border-blue-600 text-blue-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab === 'about' ? 'Sobre' : 'Avaliações'}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                {activeTab === 'about' && (
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4 text-gray-900">
                                            Descrição do Serviço
                                        </h3>
                                        <p className="text-gray-600 mb-6">{service.description}</p>

                                        <h4 className="font-semibold mb-3 text-gray-900">
                                            Incluso no Serviço:
                                        </h4>
                                        <ul className="grid grid-cols-2 gap-3 mb-6">
                                            {service.services.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center gap-2 text-gray-700"
                                                >
                                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm text-gray-700">
                                                <strong>Disponibilidade:</strong>{' '}
                                                {service.availability}
                                            </p>
                                            <p className="text-sm text-gray-700 mt-2">
                                                <strong>Pedido Mínimo:</strong> {service.minOrder}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div>
                                        <p className="text-gray-600">
                                            Avaliações serão exibidas aqui...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Pricing and Checkout */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                R${' '}
                                {service.price.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </h3>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Quantidade
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="border border-gray-300 rounded px-3 py-2 hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                                        }
                                        className="border border-gray-300 rounded px-3 py-2 w-16 text-center"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="border border-gray-300 rounded px-3 py-2 hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="space-y-3 mb-6 pb-6 border-b">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>
                                        R${' '}
                                        {(service.price * quantity).toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Taxa de Serviço</span>
                                    <span>
                                        R${' '}
                                        {(service.price * quantity * 0.1).toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>
                                        R${' '}
                                        {(service.price * quantity * 1.1).toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
                            >
                                Contratar Agora
                            </button>

                            <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                                Fazer Pergunta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
