import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X, User, LogOut } from 'lucide-react'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isLogged, setIsLogged] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
            setSearchQuery('')
        }
    }

    const handleLogout = () => {
        setIsLogged(false)
        setIsMenuOpen(false)
    }

    return (
        <header className="bg-white shadow-md border-b-4 border-primary-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/IMG-20260416-WA0658.jpg"
                            alt="Servix"
                            className="logo-img"
                        />
                        <span className="hidden sm:inline text-xl font-bold text-primary-600">
                            Servix
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-md mx-8"
                    >
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Buscar serviços, profissionais..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-lightgray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-2.5 text-lightgray-400 hover:text-primary-600"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </form>

                    {/* Right Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {!isLogged ? (
                            <>
                                <Link
                                    to="/login"
                                    className="text-lightgray-700 hover:text-primary-600 transition font-semibold"
                                >
                                    Entrar
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-semibold"
                                >
                                    Cadastrar
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-lightgray-700 hover:text-primary-600 transition"
                                >
                                    <User size={20} />
                                    Perfil
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-lightgray-700 hover:text-accent-600 transition"
                                >
                                    <LogOut size={20} />
                                    Sair
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-lightgray-700"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="md:hidden pb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar serviços..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-lightgray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-2.5 text-lightgray-400"
                        >
                            <Search size={20} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-lightgray-50 border-t border-lightgray-200 p-4 space-y-3">
                    {!isLogged ? (
                        <>
                            <Link
                                to="/login"
                                className="block text-primary-600 hover:text-primary-700 py-2 font-semibold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Entrar
                            </Link>
                            <Link
                                to="/register"
                                className="block bg-primary-600 text-white px-4 py-2 rounded-lg text-center hover:bg-primary-700 font-semibold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Cadastrar
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/profile"
                                className="block text-primary-600 hover:text-primary-700 py-2 font-semibold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Perfil
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left text-accent-600 hover:text-accent-700 py-2 font-semibold"
                            >
                                Sair
                            </button>
                        </>
                    )}
                </div>
            )}
        </header>
    )
}
