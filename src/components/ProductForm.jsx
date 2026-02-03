import React, { useState, useEffect } from 'react'
import { Upload, X, Save, Package } from 'lucide-react'
import supabase from '../lib/supabase'

const ProductForm = ({ onProductAdded, onCancel, product, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: ''
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Si estamos editando, cargar los datos del producto
  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        stock: product.stock || '',
        image_url: product.image_url || ''
      })
    }
  }, [isEditing, product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return

      setUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, image_url: publicUrl }))
      alert('Imagen subida exitosamente')
    } catch (error) {
      alert('Error subiendo imagen: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      }

      let result
      
      if (isEditing) {
        // Actualizar producto existente
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
      } else {
        // Crear nuevo producto
        result = await supabase
          .from('products')
          .insert([productData])
      }

      if (result.error) throw result.error

      alert(isEditing ? '✅ Producto actualizado exitosamente' : '✅ Producto creado exitosamente')
      
      // Limpiar formulario si no es edición
      if (!isEditing) {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          image_url: ''
        })
      }
      
      onProductAdded()
    } catch (error) {
      alert(`Error ${isEditing ? 'actualizando' : 'creando'} producto: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? '✏️ Editar Producto' : '➕ Agregar Nuevo Producto'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isEditing ? 'Modifica la información del producto' : 'Completa los detalles del nuevo producto'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Cancelar"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: iPhone 15 Pro 256GB"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar categoría</option>
              <option value="Electrónica">📱 Electrónica</option>
              <option value="Ropa">👕 Ropa</option>
              <option value="Hogar">🏠 Hogar</option>
              <option value="Deportes">⚽ Deportes</option>
              <option value="Libros">📚 Libros</option>
              <option value="Juguetes">🧸 Juguetes</option>
              <option value="Herramientas">🔧 Herramientas</option>
              <option value="Otros">📦 Otros</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe el producto detalladamente..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio ($) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad en Stock *
            </label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Producto
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer block">
                <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                <span className="text-sm text-gray-600 font-medium">
                  {uploading ? 'Subiendo...' : formData.image_url ? 'Cambiar imagen' : 'Subir imagen'}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG o WebP (max 5MB)
                </p>
              </label>
            </div>
          </div>
        </div>

        {formData.image_url && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2 font-medium">Vista previa:</p>
            <div className="flex items-center gap-4">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
              <div className="text-sm text-gray-600">
                <p>Imagen cargada correctamente</p>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
                >
                  Eliminar imagen
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEditing ? 'Actualizar Producto' : 'Publicar Producto'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm