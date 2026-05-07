import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Clock, User } from 'lucide-react'
import { useState } from 'react'

export default function Checkout() {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeStep, setActiveStep] = useState(1)
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phone: '',
        street: '',
        number: '',
        complement: '',
        city: '',
        state: '',
        zip: '',
        paymentMethod: 'credit-card',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCVC: '',
    })

    const service = location.state?.service || {}
    const quantity = location.state?.quantity || 1
    const subtotal = service.price ? service.price * quantity : 0
    const fee = subtotal * 0.1
    const total = subtotal + fee

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleNextStep = () => {
        if (activeStep < 3) {
            setActiveStep(activeStep + 1)
        }
    }

    const handlePrevStep = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1)
        }
    }

    const handlePlaceOrder = () => {
        // In a real app, this would process the payment
        alert('Pedido realizado com sucesso!')
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                        {/* Steps */}
                        <div className="mb-8 flex gap-4">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className={`flex-1 py-3 text-center font-semibold rounded-lg transition ${step === activeStep
                                            ? 'bg-blue-600 text-white'
                                            : step < activeStep
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    Etapa {step}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Service Confirmation */}
                        {activeStep === 1 && (
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-xl font-bold mb-6 text-gray-900">
                                    1. Confirmar Serviço
                                </h2>

                                <div className="flex gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            {service.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Profissional: {service.professionalName}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                <span>{service.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                <span>{service.responseTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Resumo</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Quantidade:</span>
                                            <span>{quantity}x</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Preço Unitário:</span>
                                            <span>
                                                R${' '}
                                                {service.price?.toLocaleString('pt-BR', {
                                                    minimumFractionDigits: 2,
                                                }) || '0.00'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleNextStep}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                    Próxima Etapa
                                </button>
                            </div>
                        )}

                        {/* Step 2: Delivery Information */}
                        {activeStep === 2 && (
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-xl font-bold mb-6 text-gray-900">
                                    2. Informações de Entrega
                                </h2>

                                <div className="space-y-4 mb-6">
                                    {/* Contact Info */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            placeholder="seu@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            placeholder="Seu Nome"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Telefone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Rua
                                            </label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={formData.street}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                                placeholder="Rua"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Número
                                            </label>
                                            <input
                                                type="text"
                                                name="number"
                                                value={formData.number}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                                placeholder="123"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Complemento
                                        </label>
                                        <input
                                            type="text"
                                            name="complement"
                                            value={formData.complement}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            placeholder="Apto 45"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Cidade
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                                placeholder="São Paulo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Estado
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                                placeholder="SP"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                CEP
                                            </label>
                                            <input
                                                type="text"
                                                name="zip"
                                                value={formData.zip}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                                placeholder="01234-567"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handlePrevStep}
                                        className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        onClick={handleNextStep}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                                    >
                                        Próxima Etapa
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {activeStep === 3 && (
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-xl font-bold mb-6 text-gray-900">
                                    3. Pagamento
                                </h2>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        Método de Pagamento
                                    </label>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'credit-card', label: 'Cartão de Crédito' },
                                            { id: 'debit-card', label: 'Cartão de Débito' },
                                            { id: 'pix', label: 'PIX' },
                                        ].map((method) => (
                                            <label key={method.id} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.id}
                                                    checked={formData.paymentMethod === method.id}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4"
                                                />
                                                <span>{method.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {formData.paymentMethod !== 'pix' && (
                                    <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Número do Cartão
                                            </label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={formData.cardNumber}
                                                onChange={handleInputChange}
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Nome no Cartão
                                            </label>
                                            <input
                                                type="text"
                                                name="cardName"
                                                value={formData.cardName}
                                                onChange={handleInputChange}
                                                placeholder="Nome Completo"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Validade
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cardExpiry"
                                                    value={formData.cardExpiry}
                                                    onChange={handleInputChange}
                                                    placeholder="MM/AA"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    CVC
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cardCVC"
                                                    value={formData.cardCVC}
                                                    onChange={handleInputChange}
                                                    placeholder="123"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.paymentMethod === 'pix' && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                                        <p className="text-sm text-gray-600">
                                            Após confirmar o pedido, você receberá um código PIX
                                            para realizar o pagamento.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={handlePrevStep}
                                        className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                                    >
                                        Confirmar Pedido
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                            <h3 className="font-bold text-lg mb-4 text-gray-900">
                                Resumo do Pedido
                            </h3>

                            {/* Service Info */}
                            <div className="mb-6 pb-6 border-b">
                                <div className="flex gap-3">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                            {service.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {service.professionalName}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        R$ {service.price?.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                        }) || '0.00'} x {quantity}
                                    </span>
                                    <span className="font-semibold">
                                        R$ {subtotal.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Taxa de Serviço (10%)</span>
                                    <span className="font-semibold">
                                        R$ {fee.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="pb-6 border-b flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>
                                    R$ {total.toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                            <div className="mt-6 text-xs text-gray-500 space-y-2">
                                <p>✓ Pagamento Seguro</p>
                                <p>✓ Satisfação Garantida</p>
                                <p>✓ Suporte 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
