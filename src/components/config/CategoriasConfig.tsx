import { useState, useEffect } from 'react';
import { ConfigService, type Category, type Subcategory } from '../../services/config';
import { useConfig } from '@context/ConfigContext';
import { Plus, Edit2, Trash2, Save, X, ChevronRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import Modal, { ModalFooterActions, ModalButton } from '@components/common/Modal';
import LoadingScreen from '@components/common/LoadingScreen';
import { ContainerLoadingButton } from '../common/Button';

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
  const [subSuggestionInput, setSubSuggestionInput] = useState('');
  const [subSuggestions, setSubSuggestions] = useState<string[]>([]);
  const [editingSubcatId, setEditingSubcatId] = useState<string | null>(null);

  // Delete confirmation states
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<string | null>(null);

  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [loadingSubSave, setLoadingSubSave] = useState(false);
  const [loadingSubDelete, setLoadingSubDelete] = useState(false);

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
    setSubSuggestionInput('');
    setSubSuggestions([]);
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

  const handleSaveCategory = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!catNombre.trim()) return;
    if (!editingCategory && !catId.trim()) {
      toast.error('El ID es obligatorio para nuevas categorías');
      return;
    }

    try {
      setLoadingSave(true);
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
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setLoadingDelete(true);
      await ConfigService.deleteCategory(categoryToDelete);
      toast.success('Categoría eliminada');
      setCategoryToDelete(null);
      loadCategories();
    } catch {
      toast.error('Error al eliminar categoría');
    } finally {
      setLoadingDelete(false);
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
      setLoadingSubSave(true);
      if (editingSubcatId) {
        // Update
        await ConfigService.updateSubcategory(editingCategory.id, editingSubcatId, {
          nombre: subNombre,
          descripcion: subDescripcion,
          suggestions_ideas: subSuggestions.length > 0 ? subSuggestions : undefined
        });

        const updatedSubs = editingCategory.subcategorias?.map(sub =>
          sub.id === editingSubcatId ? { ...sub, nombre: subNombre, descripcion: subDescripcion, suggestions_ideas: subSuggestions } : sub
        );
        setEditingCategory({ ...editingCategory, subcategorias: updatedSubs });
        toast.success('Subcategoría actualizada');
      } else {
        // Create
        const newSub = await ConfigService.createSubcategory(editingCategory.id, {
          id: subId,
          nombre: subNombre,
          descripcion: subDescripcion,
          suggestions_ideas: subSuggestions.length > 0 ? subSuggestions : undefined
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
      setSubSuggestionInput('');
      setSubSuggestions([]);
      setEditingSubcatId(null);

      loadCategories();
    } catch {
      toast.error('Error al guardar subcategoría');
    } finally {
      setLoadingSubSave(false);
    }
  };

  const handleEditSubcategory = (sub: Subcategory) => {
    setEditingSubcatId(sub.id);
    setSubId(sub.id);
    setSubNombre(sub.nombre);
    setSubDescripcion(sub.descripcion || '');
    setSubSuggestions(sub.suggestions_ideas || []);
    setSubSuggestionInput('');
  };

  const handleCancelEditSub = () => {
    setEditingSubcatId(null);
    setSubId('');
    setSubNombre('');
    setSubDescripcion('');
    setSubSuggestionInput('');
    setSubSuggestions([]);
  };

  // Handlers para sugerencias
  const handleAddSuggestion = () => {
    const trimmed = subSuggestionInput.trim();
    if (trimmed && !subSuggestions.includes(trimmed)) {
      setSubSuggestions([...subSuggestions, trimmed]);
      setSubSuggestionInput('');
    }
  };

  const handleRemoveSuggestion = (suggestion: string) => {
    setSubSuggestions(subSuggestions.filter(s => s !== suggestion));
  };

  const handleSuggestionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSuggestion();
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!editingCategory || !subcategoryToDelete) return;

    try {
      setLoadingSubDelete(true);
      await ConfigService.deleteSubcategory(editingCategory.id, subcategoryToDelete);

      const updatedSubs = editingCategory.subcategorias?.filter(sub => sub.id !== subcategoryToDelete);
      setEditingCategory({ ...editingCategory, subcategorias: updatedSubs });
      toast.success('Subcategoría eliminada');
      setSubcategoryToDelete(null);
      loadCategories();
    } catch {
      toast.error('Error al eliminar subcategoría');
    } finally {
      setLoadingSubDelete(false);
    }
  };

  if (loading) return <LoadingScreen message="Cargando categorías..." />;

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
                  onClick={() => setCategoryToDelete(category.id)}
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
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        size="lg"
        footer={
          <ModalButton
            type="submit"
            variant="primary"
            onClick={handleSaveCategory}
            disabled={loadingSave}
            className="w-full"
          >
           <ContainerLoadingButton isLoading={loadingSave} loadingText="Guardando..." text="Guardar Cambios"/>
          </ModalButton>
        }
      >
        <div className="space-y-6">
          {/* Category Form - iOS Style */}
          <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border/50">
            {/* ID */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                ID (Identificador único)
              </label>
              <input
                type="text"
                value={catId}
                onChange={handleIdChange}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base disabled:opacity-50"
                placeholder="Ej: alimentacion"
                required
                disabled={!!editingCategory}
              />
              <p className="text-xs text-muted-foreground mt-1">Solo minúsculas, números y guiones bajos.</p>
            </div>

            {/* Nombre */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre</label>
              <input
                type="text"
                value={catNombre}
                onChange={(e) => setCatNombre(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                placeholder="Ej: Alimentación"
                required
              />
            </div>

            {/* Icono */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icono</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="bg-transparent border-0 focus:outline-none text-left flex items-center gap-2"
                >
                  <span className="text-3xl">{catIcono || '😊'}</span>
                  <span className="text-muted-foreground text-sm">Seleccionar</span>
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

            {/* Color */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Color</label>
              <div className="flex gap-3 items-center">
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
                  className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-base uppercase"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descripción</label>
              <textarea
                value={catDescripcion}
                onChange={(e) => setCatDescripcion(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base resize-none min-h-[60px]"
                placeholder="Descripción opcional de la categoría..."
              />
            </div>
          </div>

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

                      {/* Sugerencias */}
                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Sugerencias de descripción</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={subSuggestionInput}
                            onChange={(e) => setSubSuggestionInput(e.target.value)}
                            onKeyDown={handleSuggestionKeyDown}
                            placeholder="Agregar sugerencia..."
                            className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleAddSuggestion}
                            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        {subSuggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {subSuggestions.map((suggestion, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {suggestion}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSuggestion(suggestion)}
                                  className="hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
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
                        {/* {editingSubcatId ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {editingSubcatId ? 'Actualizar' : 'Agregar'} */}

                        <ContainerLoadingButton
                          isLoading={loadingSubSave}
                          loadingText={editingSubcatId ? 'Actualizando...' : 'Guardando...'}
                          text={editingSubcatId ? <div className="flex items-center justify-center gap-2"><Save className="h-3.5 w-3.5" /> Actualizar</div> : <div className="flex items-center justify-center gap-2"><Plus className="h-3.5 w-3.5" /> Agregar</div>}
                        />
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
                            onClick={() => setSubcategoryToDelete(sub.id)}
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
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <Modal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="¿Eliminar categoría?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setCategoryToDelete(null)}
            onConfirm={handleDeleteCategory}
            confirmVariant="destructive"
            confirmText={<ContainerLoadingButton isLoading={loadingDelete} loadingText="Eliminando..." text="Confirmar" />}
          />
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. La categoría y todas sus subcategorías serán eliminadas permanentemente.
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Subcategory Confirmation Modal */}
      <Modal
        isOpen={!!subcategoryToDelete}
        onClose={() => setSubcategoryToDelete(null)}
        title="¿Eliminar subcategoría?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setSubcategoryToDelete(null)}
            onConfirm={handleDeleteSubcategory}
            confirmVariant="destructive"
            confirmText={<ContainerLoadingButton isLoading={loadingSubDelete} loadingText="Eliminando..." text="Confirmar" />}
          />
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. La subcategoría será eliminada permanentemente.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
