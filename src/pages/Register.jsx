import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [userType, setUserType] = useState('consumer')
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
    })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (
            !formData.fullName ||
            !formData.email ||
            !formData.phone ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError('Por favor, preencha todos os campos')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        if (!formData.agreeTerms) {
            setError('Você deve concordar com os termos de serviço')
            return
        }

        // Simulando cadastro bem-sucedido
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-lightgray-50 to-lightgray-100 py-8">
            <div className="max-w-md mx-auto px-4">
                {/* Logo */}
                <Link to="/" className="flex justify-center mb-8">
                    <img
                        src="/IMG-20260416-WA0658.jpg"
                        alt="Servix"
                        className="h-16 w-16 rounded-lg object-cover"
                        style={{ clipPath: 'inset(0 0 8% 0)' }}
                    />
                </Link>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-primary-600 mb-2">
                        Criar Conta
                    </h1>
                    <p className="text-lightgray-600 mb-6">
                        Junte-se à comunidade Servix
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {/* User Type Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setUserType('consumer')}
                            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${userType === 'consumer'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-lightgray-100 text-lightgray-700 hover:bg-lightgray-200'
                                }`}
                        >
                            Consumidor
                        </button>
                        <button
                            onClick={() => setUserType('professional')}
                            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${userType === 'professional'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-lightgray-100 text-lightgray-700 hover:bg-lightgray-200'
                                }`}
                        >
                            Profissional
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-lightgray-900 mb-2">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-lightgray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                                placeholder="Seu nome completo"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-lightgray-900 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-lightgray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                                placeholder="seu@email.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-lightgray-900 mb-2">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-lightgray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-lightgray-900 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-lightgray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-lightgray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-lightgray-900 mb-2">
                                Confirmar Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-lightgray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-3 top-2.5 text-lightgray-600"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleChange}
                                className="w-5 h-5 text-primary-600 rounded mt-0.5"
                            />
                            <span className="text-sm text-lightgray-600">
                                Concordo com os{' '}
                                <a href="#" className="text-primary-600 hover:underline">
                                    Termos de Serviço
                                </a>{' '}
                                e{' '}
                                <a href="#" className="text-primary-600 hover:underline">
                                    Política de Privacidade
                                </a>
                            </span>
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition mt-6"
                        >
                            Criar Conta
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-lightgray-600 mt-6">
                        Já tem uma conta?{' '}
                        <Link
                            to="/login"
                            className="text-primary-600 hover:text-primary-700 font-semibold"
                        >
                            Faça login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
