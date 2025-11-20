import { useState, useEffect } from 'react';
import { ConfigService, type Category, type Subcategory } from '../../services/config';
import { useConfig } from '@context/ConfigContext';
import { Plus, Edit2, Trash2, Save, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';

export default function CategoriasConfig() {
  const { reloadCategories } = useConfig();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Form states for Category
  const [catId, setCatId] = useState('');
  const [catNombre, setCatNombre] = useState('');
  const [catIcono, setCatIcono] = useState('');
  const [catColor, setCatColor] = useState('#000000');
  const [catDescripcion, setCatDescripcion] = useState('');

  // Form states for Subcategory
  const [subId, setSubId] = useState('');
  const [subNombre, setSubNombre] = useState('');
  const [subDescripcion, setSubDescripcion] = useState('');
  const [editingSubcatId, setEditingSubcatId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await ConfigService.getCategories();
      setCategories(data);
      // Sincronizar con el contexto global
      await reloadCategories();
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCatId(category.id);
      setCatNombre(category.nombre);
      setCatIcono(category.icono || '');
      setCatColor(category.color || '#000000');
      setCatDescripcion(category.descripcion || '');
    } else {
      setEditingCategory(null);
      setCatId('');
      setCatNombre('');
      setCatIcono('');
      setCatColor('#000000');
      setCatDescripcion('');
    }
    // Reset subcategory form
    setSubId('');
    setSubNombre('');
    setSubDescripcion('');
    setEditingSubcatId(null);
    
    setIsModalOpen(true);
    setShowEmojiPicker(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setEditingSubcatId(null);
    setShowEmojiPicker(false);
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setCatId(value);
  };

  const handleSubIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setSubId(value);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNombre.trim()) return;
    if (!editingCategory && !catId.trim()) {
      toast.error('El ID es obligatorio para nuevas categorías');
      return;
    }

    try {
      if (editingCategory) {
        await ConfigService.updateCategory(editingCategory.id, {
          nombre: catNombre,
          icono: catIcono,
          color: catColor,
          descripcion: catDescripcion
        });
        toast.success('Categoría actualizada');
      } else {
        await ConfigService.createCategory({
          id: catId,
          nombre: catNombre,
          icono: catIcono,
          color: catColor,
          descripcion: catDescripcion
        });
        toast.success('Categoría creada');
      }
      loadCategories();
      closeModal();
    } catch {
      toast.error('Error al guardar categoría');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Se eliminarán también sus subcategorías.')) return;

    try {
      await ConfigService.deleteCategory(id);
      toast.success('Categoría eliminada');
      loadCategories();
    } catch {
      toast.error('Error al eliminar categoría');
    }
  };

  // Subcategories Handlers
  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!subNombre.trim()) return;
    
    if (!editingSubcatId && !subId.trim()) {
      toast.error('El ID es obligatorio para nuevas subcategorías');
      return;
    }

    try {
      if (editingSubcatId) {
        // Update
        await ConfigService.updateSubcategory(editingCategory.id, editingSubcatId, { 
          nombre: subNombre,
          descripcion: subDescripcion
        });
        
        const updatedSubs = editingCategory.subcategorias?.map(sub => 
          sub.id === editingSubcatId ? { ...sub, nombre: subNombre, descripcion: subDescripcion } : sub
        );
        setEditingCategory({ ...editingCategory, subcategorias: updatedSubs });
        toast.success('Subcategoría actualizada');
      } else {
        // Create
        const newSub = await ConfigService.createSubcategory(editingCategory.id, { 
          id: subId,
          nombre: subNombre,
          descripcion: subDescripcion
        });
        
        const updatedCategory = {
          ...editingCategory,
          subcategorias: [...(editingCategory.subcategorias || []), newSub]
        };
        setEditingCategory(updatedCategory);
        toast.success('Subcategoría agregada');
      }
      
      // Reset form
      setSubId('');
      setSubNombre('');
      setSubDescripcion('');
      setEditingSubcatId(null);
      
      loadCategories();
    } catch {
      toast.error('Error al guardar subcategoría');
    }
  };

  const handleEditSubcategory = (sub: Subcategory) => {
    setEditingSubcatId(sub.id);
    setSubId(sub.id);
    setSubNombre(sub.nombre);
    setSubDescripcion(sub.descripcion || '');
  };

  const handleCancelEditSub = () => {
    setEditingSubcatId(null);
    setSubId('');
    setSubNombre('');
    setSubDescripcion('');
  };

  const handleDeleteSubcategory = async (subId: string) => {
    if (!editingCategory || !confirm('¿Eliminar subcategoría?')) return;

    try {
      await ConfigService.deleteSubcategory(editingCategory.id, subId);
      
      const updatedSubs = editingCategory.subcategorias?.filter(sub => sub.id !== subId);
      setEditingCategory({ ...editingCategory, subcategorias: updatedSubs });
      toast.success('Subcategoría eliminada');
      loadCategories();
    } catch {
      toast.error('Error al eliminar subcategoría');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  {category.icono || '📁'}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{category.nombre}</h3>
                  <p className="text-xs text-muted-foreground">
                    {category.subcategorias?.length || 0} subcategorías
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openModal(category)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Preview of subcategories */}
            <div className="flex flex-wrap gap-1">
              {category.subcategorias?.slice(0, 3).map(sub => (
                <span key={sub.id} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                  {sub.nombre}
                </span>
              ))}
              {(category.subcategorias?.length || 0) > 3 && (
                <span className="text-xs px-2 py-1 text-muted-foreground">
                  +{category.subcategorias!.length - 3} más
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Category Form */}
              <form id="cat-form" onSubmit={handleSaveCategory} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ID (Identificador único)</label>
                    <input
                      type="text"
                      value={catId}
                      onChange={handleIdChange}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background disabled:opacity-50"
                      placeholder="Ej: alimentacion"
                      required
                      disabled={!!editingCategory}
                    />
                    <p className="text-xs text-muted-foreground">Solo minúsculas, números y guiones bajos.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <input
                      type="text"
                      value={catNombre}
                      onChange={(e) => setCatNombre(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                      placeholder="Ej: Alimentación"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Icono</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-full px-3 py-2 text-left rounded-md border border-border bg-background flex items-center gap-2"
                      >
                        <span className="text-xl">{catIcono || '😊'}</span>
                        <span className="text-muted-foreground text-sm">Seleccionar icono</span>
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute z-20 top-full left-0 mt-2">
                          <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                          <div className="relative z-20">
                            <EmojiPicker
                              theme={Theme.AUTO}
                              onEmojiClick={(emojiData) => {
                                setCatIcono(emojiData.emoji);
                                setShowEmojiPicker(false);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={catColor}
                        onChange={(e) => setCatColor(e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={catColor}
                        onChange={(e) => setCatColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-md border border-border bg-background uppercase"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                      value={catDescripcion}
                      onChange={(e) => setCatDescripcion(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background min-h-[80px]"
                      placeholder="Descripción opcional de la categoría..."
                    />
                  </div>
                </div>
              </form>

              {/* Subcategories Section (Only in Edit Mode) */}
              {editingCategory && (
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ChevronRight className="h-5 w-5" />
                    Subcategorías
                  </h3>
                  
                  {/* Subcategory Form */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                    <h4 className="text-sm font-medium">
                      {editingSubcatId ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={subId}
                          onChange={handleSubIdChange}
                          placeholder="ID (ej: lacteos)"
                          className="w-full px-3 py-2 rounded-md border border-border bg-background disabled:opacity-50"
                          disabled={!!editingSubcatId}
                        />
                        <p className="text-xs text-muted-foreground">Solo minúsculas, números y guiones bajos.</p>
                      </div>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={subNombre}
                          onChange={(e) => setSubNombre(e.target.value)}
                          placeholder="Nombre (ej: Lácteos)"
                          className="w-full px-3 py-2 rounded-md border border-border bg-background"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <input
                          type="text"
                          value={subDescripcion}
                          onChange={(e) => setSubDescripcion(e.target.value)}
                          placeholder="Descripción opcional..."
                          className="w-full px-3 py-2 rounded-md border border-border bg-background"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      {editingSubcatId && (
                        <button
                          type="button"
                          onClick={handleCancelEditSub}
                          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveSubcategory}
                        className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-2 text-sm"
                      >
                        {editingSubcatId ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {editingSubcatId ? 'Actualizar' : 'Agregar'}
                      </button>
                    </div>
                  </div>

                  {/* Subcategories List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {editingCategory.subcategorias?.map((sub) => (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between p-3 rounded-md border ${
                          editingSubcatId === sub.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/50'
                        } group`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{sub.nombre}</span>
                            <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                              {sub.id}
                            </span>
                          </div>
                          {sub.descripcion && (
                            <p className="text-xs text-muted-foreground mt-0.5">{sub.descripcion}</p>
                          )}
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditSubcategory(sub)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-background rounded"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategory(sub.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-background rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!editingCategory.subcategorias || editingCategory.subcategorias.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay subcategorías registradas
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-4 bg-muted/20 rounded-b-xl">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="cat-form"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
