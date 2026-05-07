import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const CATEGORIES = [
    'Limpeza',
    'Reparos',
    'Pintura',
    'Encanamento',
    'Eletricista',
    'Mecânico',
    'Design',
    'Programação',
    'Fotografia',
    'Aulas',
    'Jardinagem',
    'Mudança',
]

export default function CategoryFilter({ onCategoryChange, selectedCategory }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between hover:border-gray-400 transition"
            >
                <span className="text-gray-700">
                    {selectedCategory || 'Todas as Categorias'}
                </span>
                <ChevronDown
                    size={20}
                    className={`text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-12 left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <button
                        onClick={() => {
                            onCategoryChange('')
                            setIsOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition border-b"
                    >
                        Todas as Categorias
                    </button>
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                onCategoryChange(category)
                                setIsOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${selectedCategory === category ? 'bg-blue-50 text-blue-600' : ''
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
