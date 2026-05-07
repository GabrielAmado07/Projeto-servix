import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
    const [user, setUser] = useState(null)
    const [cart, setCart] = useState([])
    const [favorites, setFavorites] = useState([])

    // User Management
    const login = (userData) => {
        setUser(userData)
    }

    const logout = () => {
        setUser(null)
        setCart([])
    }

    // Cart Management
    const addToCart = (service) => {
        setCart([...cart, service])
    }

    const removeFromCart = (serviceId) => {
        setCart(cart.filter((item) => item.id !== serviceId))
    }

    const clearCart = () => {
        setCart([])
    }

    // Favorites Management
    const addToFavorites = (serviceId) => {
        if (!favorites.includes(serviceId)) {
            setFavorites([...favorites, serviceId])
        }
    }

    const removeFromFavorites = (serviceId) => {
        setFavorites(favorites.filter((id) => id !== serviceId))
    }

    const isFavorited = (serviceId) => {
        return favorites.includes(serviceId)
    }

    const value = {
        user,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorited,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook para usar o contexto
export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp deve ser usado dentro de AppProvider')
    }
    return context
}
