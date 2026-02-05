import React, { useState, useEffect } from 'react'
import supabase from '../lib/supabase'
import { 
  LogOut, Package, Plus, Edit, Trash2, Search, 
  Download, Eye, BarChart3, CheckCircle, Clock, DollarSign 
} from 'lucide-react'
import ProductForm from '../components/ProductForm'
import Login from '../components/Login'

const AdminPanel = () => {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    disponible: 0,
    apartado: 0,
    vendido: 0,
    totalValue: 0
  })
  const [activeTab, setActiveTab] = useState('disponible') // 'disponible', 'apartado', 'vendido', 'todos'

  // Verificar sesión
  useEffect(() => {
    checkUser()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )
    
    return () => authListener.subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

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
      calculateStats(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (productsList) => {
    const total = productsList.length
    const disponible = productsList.filter(p => p.status === 'disponible').length
    const apartado = productsList.filter(p => p.status === 'apartado').length
    const vendido = productsList.filter(p => p.status === 'vendido').length
    const totalValue = productsList.reduce((sum, p) => sum + (p.price * p.stock), 0)
    
    setStats({ total, disponible, apartado, vendido, totalValue })
    
    // Filtrar según la pestaña activa
    filterProductsByTab(productsList, activeTab)
  }

  const filterProductsByTab = (productsList, tab) => {
    let filtered = productsList
    
    if (tab === 'disponible') {
      filtered = productsList.filter(p => p.status === 'disponible')
    } else if (tab === 'apartado') {
      filtered = productsList.filter(p => p.status === 'apartado')
    } else if (tab === 'vendido') {
      filtered = productsList.filter(p => p.status === 'vendido')
    }
    // 'todos' muestra todos los productos
    
    setFilteredProducts(filtered)
  }

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  // Actualizar estado del producto
  const updateProductStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      
      alert(`✅ Producto marcado como ${newStatus}`)
      fetchProducts()
    } catch (error) {
      alert('❌ Error actualizando estado: ' + error.message)
    }
  }

  // Cambiar pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    filterProductsByTab(products, tab)
  }

  // Buscar productos
  useEffect(() => {
    const searchLower = searchTerm.toLowerCase().trim()
    
    if (!searchLower) {
      filterProductsByTab(products, activeTab)
      return
    }

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    )
    
    // Aplicar filtro de pestaña después de la búsqueda
    filterProductsByTab(filtered, activeTab)
  }, [searchTerm, products, activeTab])

  // Eliminar producto
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto permanentemente?')) return
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      alert('✅ Producto eliminado exitosamente')
      fetchProducts()
    } catch (error) {
      alert('❌ Error al eliminar: ' + error.message)
    }
  }

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowForm(false)
    setEditingProduct(null)
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <Login onLogin={() => checkUser()} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del admin */}
      <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Package size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-gray-300 text-sm">Gestiona tu tienda AlexShop</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="font-bold">{user.email?.[0]?.toUpperCase() || 'A'}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{user.email}</p>
                  <p className="text-gray-400 text-xs">Administrador</p>
                </div>
              </div>
              
              <button
                onClick={() => window.open('/', '_blank')}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                title="Ver tienda pública"
              >
                <Eye size={18} />
                Ver tienda
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Productos</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Disponibles</p>
                <p className="text-3xl font-bold text-green-600">{stats.disponible}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Apartados</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.apartado}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Vendidos</p>
                <p className="text-3xl font-bold text-red-600">{stats.vendido}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <DollarSign className="text-red-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Valor total</p>
                <p className="text-3xl font-bold text-purple-600">${stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de estado */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleTabChange('todos')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'todos' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => handleTabChange('disponible')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'disponible' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Disponibles ({stats.disponible})
          </button>
          <button
            onClick={() => handleTabChange('apartado')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'apartado' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Apartados ({stats.apartado})
          </button>
          <button
            onClick={() => handleTabChange('vendido')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'vendido' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Vendidos ({stats.vendido})
          </button>
        </div>

        {/* Barra de acciones */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex-1 w-full">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingProduct(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Formulario de producto */}
        {showForm && (
          <div className="mb-8">
            <ProductForm 
              onProductAdded={() => {
                fetchProducts()
                setShowForm(false)
                setEditingProduct(null)
              }} 
              onCancel={() => {
                setShowForm(false)
                setEditingProduct(null)
              }}
              product={editingProduct}
              isEditing={!!editingProduct}
            />
          </div>
        )}

        {/* Lista de productos */}
        {!showForm && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {activeTab === 'disponible' && '📦 Productos Disponibles'}
                {activeTab === 'apartado' && '⏳ Productos Apartados'}
                {activeTab === 'vendido' && '💰 Productos Vendidos'}
                {activeTab === 'todos' && '📋 Todos los Productos'}
                ({filteredProducts.length})
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 mt-4">Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mt-4">
                  No hay productos
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm ? 'No se encontraron productos' : `No hay productos ${activeTab === 'todos' ? '' : activeTab}`}
                </p>
                {!searchTerm && activeTab === 'disponible' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    Agregar primer producto
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cambiar Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Package size={16} className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            ${product.price.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.stock} unidades
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            product.status === 'disponible' 
                              ? 'bg-green-100 text-green-800' 
                              : product.status === 'apartado'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status === 'disponible' ? '🟢 Disponible' : 
                             product.status === 'apartado' ? '🟡 Apartado' : '🔴 Vendido'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateProductStatus(product.id, 'disponible')}
                              className={`px-2 py-1 text-xs rounded ${
                                product.status === 'disponible' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                              title="Marcar como disponible"
                            >
                              Disp
                            </button>
                            <button
                              onClick={() => updateProductStatus(product.id, 'apartado')}
                              className={`px-2 py-1 text-xs rounded ${
                                product.status === 'apartado' 
                                  ? 'bg-yellow-500 text-white' 
                                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              }`}
                              title="Marcar como apartado"
                            >
                              Apart
                            </button>
                            <button
                              onClick={() => updateProductStatus(product.id, 'vendido')}
                              className={`px-2 py-1 text-xs rounded ${
                                product.status === 'vendido' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              title="Marcar como vendido"
                            >
                              Vend
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product)
                                setShowForm(true)
                              }}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 AlexShop Admin Panel. Uso exclusivo del administrador.</p>
        </div>
      </footer>
    </div>
  )
}

export default AdminPanel