import React from 'react'
import { ShoppingCart, Store, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Store className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AlexShop</h1>
              <p className="text-gray-600 text-sm hidden md:block">Tu tienda de confianza</p>
            </div>
          </Link>
          
          {/* Navegación */}
          <div className="flex items-center gap-6">
            {/* Enlace a admin */}
            <Link 
              to="/admin" 
              className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <User size={18} />
              <span>Iniciar sesión</span>
            </Link>
          </div>
        </div>
        
        {/* Enlace a admin móvil */}
        <div className="mt-4 md:hidden">
          <Link 
            to="/admin" 
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full"
          >
            <User size={18} />
            <span>Iniciar sesión</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header