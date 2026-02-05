import React, { useState } from 'react'
import { ShoppingCart, Tag, Package, MessageCircle, Phone } from 'lucide-react'

const ProductCard = ({ product, onWhatsAppClick }) => {
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = () => {
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="text-gray-400" size={48} />
          </div>
        )}
        
        {/* Badge de estado - CORREGIDO */}
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            product.status === 'disponible' 
              ? 'bg-green-500 text-white' 
              : product.status === 'apartado'
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {product.status === 'disponible' ? 'DISPONIBLE' : 
             product.status === 'apartado' ? 'APARTADO' : 'VENDIDO'}
          </span>
        </div>
        
        <span className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
          {product.category || 'General'}
        </span>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg text-gray-800 flex-1 pr-2 line-clamp-1">
            {product.name}
          </h3>
          <span className="text-blue-600 font-bold text-xl whitespace-nowrap">
            ${product.price.toLocaleString()}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
          {product.description}
        </p>
        
        {/* Info adicional */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-5">
          <div className="flex items-center gap-1">
            <Tag size={14} />
            <span>{product.category || 'General'}</span>
          </div>
          <div className={`font-medium ${product.stock > 5 ? 'text-green-600' : 'text-yellow-600'}`}>
            {product.stock > 5 ? `${product.stock} disponibles` : 'Pocas unidades'}
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={onWhatsAppClick}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
            title="Contactar por WhatsApp"
            disabled={product.status !== 'disponible'} // Solo disponible se puede contactar
          >
            <MessageCircle size={18} />
            <span>
              {product.status === 'disponible' ? 'Me interesa' : 
               product.status === 'apartado' ? 'Apartado' : 'Vendido'}
            </span>
          </button>
          
          {/* Botón de favoritos solo si está disponible */}
          {product.status === 'disponible' && (
            <button
              onClick={handleAddToCart}
              disabled={addedToCart}
              className={`px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium ${
                addedToCart
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
              title="Agregar a favoritos"
            >
              <ShoppingCart size={18} />
              {addedToCart ? '✓' : '+'}
            </button>
          )}
        </div>
        
        {/* WhatsApp directo solo si está disponible */}
        {product.status === 'disponible' && (
          <div className="mt-3 text-center">
            <a
              href={`https://wa.me/5211234567890?text=¡Hola! Me interesa el producto: ${encodeURIComponent(product.name)} - $${product.price}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center gap-1"
            >
              <Phone size={14} />
              Contactar directamente por WhatsApp
            </a>
          </div>
        )}
        
        {/* Mensaje si no está disponible */}
        {product.status !== 'disponible' && (
          <div className="mt-3 p-2 text-center">
            <p className="text-sm text-gray-500">
              {product.status === 'apartado' 
                ? '⚠️ Este producto está apartado temporalmente' 
                : '❌ Este producto ya fue vendido'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard