import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-white mb-4">404</h1>
                <h2 className="text-4xl font-bold text-white mb-2">Página não encontrada</h2>
                <p className="text-blue-100 text-lg mb-8">
                    Desculpe, a página que você está procurando não existe.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                    <Home size={20} />
                    Voltar para Home
                </Link>
            </div>
        </div>
    )
}
