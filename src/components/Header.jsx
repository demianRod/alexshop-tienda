import React from 'react'
import { Store, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../assets/loge.jpg'
import 'animate.css'

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {/* <div className="p-2 bg-blue-600 rounded-lg"> */}
              <img src={logo} alt="Logo AlexShop" className="w-12 h-12 rounded-full object-contain animate__animated animate__flip animate__infinite" />
              {/* <Store className="text-white" size={28} /> */}
            {/* </div> */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">AlexShop</h1>
              <p className="text-gray-600 text-sm hidden md:block">Tu tienda de confianza</p>
            </div>
          </Link>
          
          
          <Link 
            to="/admin" 
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors group relative"
            aria-label="Acceso vendedor"
            title="Acceso vendedor / Admin"
          >
            <LogIn size={20} />
            {/* Tooltip en hover (solo desktop) */}
            <span className="hidden md:block absolute top-full right-0 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Acceso vendedor
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header