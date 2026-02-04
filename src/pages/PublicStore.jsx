import React, { useState, useEffect } from 'react'
import { Search, Package, ShoppingCart, MessageCircle, Phone } from 'lucide-react'
import supabase from '../lib/supabase'
import Header from '../components/Header'
import { Link } from 'react-router-dom'

const PublicStore = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // WhatsApp del vendedor (cambia este número)
  const sellerWhatsApp = '5545572154'

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Buscar productos
  useEffect(() => {
    const searchLower = searchTerm.toLowerCase().trim()
    
    if (!searchLower) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    )
    
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  // Función para WhatsApp
  const handleWhatsAppClick = (product) => {
    const message = `¡Hola! Vi en AlexShop el producto: "${product.name}" por $${product.price}. ¿Todavía está disponible? Me interesa.`
    const url = `https://wa.me/${sellerWhatsApp}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Bienvenido a <span className="text-blue-600">AlexShop</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubre los mejores productos al mejor precio. 
            ¡Encuentra lo que necesitas!
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
            <input
              type="text"
              placeholder="Buscar productos por nombre, categoría o descripción..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contador de productos */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Productos disponibles
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} productos encontrados
            </p>
          </div>
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 mt-4 text-lg">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Package className="mx-auto text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mt-4">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Pronto tendremos nuevos productos disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                  {/* Imagen del producto */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-gray-400" size={48} />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {/* {product.stock === 0 && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          AGOTADO
                        </span>
                      )} */}
                      {/* {product.stock > 0 && product.stock <= 5 && (
                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          ÚLTIMAS {product.stock}
                        </span>
                      )} */}
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {product.category || 'General'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Información del producto */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-blue-600 font-bold text-xl">
                          ${product.price.toLocaleString()}
                        </span>
                        {/* <span className={`text-sm font-medium ${product.stock > 5 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {product.stock > 5 ? `${product.stock} disponibles` : '¡Pocas unidades!'}
                        </span> */}
                      </div>
                      
                      {/* Botón de WhatsApp */}
                      <button
                        onClick={() => handleWhatsAppClick(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                          product.stock === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        <MessageCircle size={20} />
                        <span>ME INTERESA</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer de la tienda */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">¿Cómo comprar?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Encuentra el producto</h4>
                <p className="text-gray-600 text-sm">Busca y selecciona lo que te gusta</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Presiona "Me interesa"</h4>
                <p className="text-gray-600 text-sm">Se abrirá WhatsApp automáticamente</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Coordina la compra</h4>
                <p className="text-gray-600 text-sm">Habla directamente con el vendedor</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">AlexShop</h2>
              <p className="text-gray-400">Tu tienda de confianza</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mt-2">Horario: Lunes a Viernes 9am - 6pm</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
            <p>© 2024 AlexShop. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicStore