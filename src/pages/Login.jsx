import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Por favor, preencha todos os campos')
            return
        }
        // Simulando login bem-sucedido
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-lightgray-50 to-lightgray-100 flex items-center justify-center px-4 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="w-full max-w-md hover:shadow-lg transition rounded-lg p-6 color-blue">
                {/* Logo */}
                <Link to="/" className="flex justify-center mb-8 bg-white p-3 shadow ">
                    <img
                        src="/IMG-20260416-WA0658.jpg"
                        alt="Servix"
                        className="h-16 w-16 rounded-lg object-cover"
                        style={{ clipPath: 'inset(0 0 8% 0)' }}
                    />
                </Link>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-primary-600 mb-2 bg-yellow-300 p-3  shadow ">Bem-vindo</h1>
                    <p className="text-lightgray-600 mb-6 bg-yellow-300 m-3  shadow ">Faça login na sua conta Servix</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-lightgray-900 mb-2 bg-yellow-300 p-3  shadow ">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-lightgray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                                placeholder="seu@email.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-lightgray-900 mb-2, bg-yellow-300 p-3 shadow">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-lightgray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-lightgray-600 hover:text-lightgray-900"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center justify-between , bg-yellow-300 p-3  shadow">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-primary-600 rounded"
                                />
                                <span className="text-sm text-lightgray-600">
                                    Lembrar de mim
                                </span>
                            </label>
                            <a
                                href="#"
                                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                Esqueceu a senha?
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition mt-6"
                        >
                            Entrar
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-lightgray-300"></div>
                        <span className="text-sm text-lightgray-600">ou</span>
                        <div className="flex-1 h-px bg-lightgray-300"></div>
                    </div>

                    {/* Social Login */}
                    <button className="w-full border-2 border-lightgray-300 text-lightgray-900 py-2 rounded-lg font-semibold hover:bg-lightgray-50 transition mb-4">
                        Continuar com Google
                    </button>

                    {/* Register Link */}
                    <p className="text-center text-lightgray-600 mt-6">
                        Não tem uma conta?{' '}
                        <Link
                            to="/register"
                            className="text-primary-600 hover:text-primary-700 font-semibold"
                        >
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
