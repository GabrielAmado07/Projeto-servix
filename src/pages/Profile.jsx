import { Link } from 'react-router-dom'
import { User, Package, Star, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'

export default function Profile() {
    const [activeTab, setActiveTab] = useState('overview')

    // Mock user data
    const user = {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '(11) 99999-9999',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        memberSince: 'Janeiro de 2023',
        rating: 4.8,
        reviews: 245,
    }

    const orders = [
        {
            id: 1,
            service: 'Limpeza Profissional de Apartamento',
            professional: 'João Silva',
            date: '15/05/2024',
            total: 165,
            status: 'Concluído',
        },
        {
            id: 2,
            service: 'Design de Logo',
            professional: 'Maria Designer',
            date: '10/05/2024',
            total: 550,
            status: 'Em Progresso',
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <img
                                src={user.image}
                                alt={user.name}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {user.name}
                                </h1>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-sm text-gray-500">
                                    Membro desde {user.memberSince}
                                </p>
                            </div>
                        </div>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                            <Settings size={20} />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{user.rating}</p>
                            <p className="text-sm text-gray-600">Avaliação</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{user.reviews}</p>
                            <p className="text-sm text-gray-600">Avaliações</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {orders.length}
                            </p>
                            <p className="text-sm text-gray-600">Pedidos</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="flex border-b">
                        {[
                            { id: 'overview', label: 'Visão Geral', icon: User },
                            { id: 'orders', label: 'Meus Pedidos', icon: Package },
                            { id: 'reviews', label: 'Avaliações', icon: Star },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div>
                                <h3 className="font-semibold text-lg mb-4 text-gray-900">
                                    Informações Pessoais
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Email
                                        </label>
                                        <p className="text-gray-900">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Telefone
                                        </label>
                                        <p className="text-gray-900">{user.phone}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                                            Membro desde
                                        </label>
                                        <p className="text-gray-900">{user.memberSince}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h3 className="font-semibold text-lg mb-4 text-gray-900">
                                    Histórico de Pedidos
                                </h3>
                                <div className="space-y-3">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {order.service}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {order.professional}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`text-xs font-semibold px-3 py-1 rounded ${order.status === 'Concluído'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>{order.date}</span>
                                                <span className="font-semibold text-gray-900">
                                                    R$ {order.total}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <h3 className="font-semibold text-lg mb-4 text-gray-900">
                                    Suas Avaliações
                                </h3>
                                <p className="text-gray-600">
                                    Você ainda não tem avaliações. Termine um pedido para deixar
                                    uma avaliação.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout */}
                <div className="mt-8 flex justify-end">
                    <button className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
                        <LogOut size={20} />
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    )
}
