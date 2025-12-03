import { useState } from "react";
import { SearchBar, CompactSearchBar } from "@components/common/SearchBar";
import { SwipeableListItem } from "@components/common/SwipeableListItem";
import { EmptyState } from "@components/common/EmptyState";
import { Chip, ChipGroup } from "@components/common/Chip";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Search, Edit2, Trash2, Archive, ShoppingCart, Plus, Tag, Inbox, FileText } from "lucide-react";

export function Phase3ComponentsExamples() {
  const [searchValue, setSearchValue] = useState("");
  const [compactSearch, setCompactSearch] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>(["react"]);
  const [tags, setTags] = useState([
    { id: "1", label: "Comida" },
    { id: "2", label: "Transporte" },
    { id: "3", label: "Entretenimiento" },
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-2">Phase 3: Secondary Components</h2>
        <p className="text-muted-foreground">
          Componentes adicionales para mejorar la experiencia de usuario: SearchBar, SwipeableListItem, EmptyState, y Chip/Tag.
        </p>
      </div>

      {/* ========== SEARCHBAR ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">SearchBar</h2>
          <p className="text-muted-foreground">
            Barra de búsqueda estilo iOS con animación de expansión/contracción y botón cancelar.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. SearchBar Básico</h3>
          <CodePreview
            code={`const [search, setSearch] = useState("");

<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Buscar gastos..."
/>`}
          >
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Buscar gastos..."
            />
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Variantes y Tamaños</h3>
          <CodePreview
            code={`<SearchBar variant="filled" size="sm" />
<SearchBar variant="default" size="md" />
<SearchBar variant="filled" size="lg" />`}
          >
            <div className="space-y-3">
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                variant="filled"
                size="sm"
                placeholder="Small filled"
              />
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                variant="default"
                size="md"
                placeholder="Medium default"
              />
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                variant="filled"
                size="lg"
                placeholder="Large filled"
              />
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Compact SearchBar</h3>
          <CodePreview
            code={`<CompactSearchBar
  value={search}
  onChange={setSearch}
  expandOnFocus
/>`}
          >
            <div className="flex justify-end">
              <CompactSearchBar
                value={compactSearch}
                onChange={setCompactSearch}
                placeholder="Buscar..."
                expandOnFocus
              />
            </div>
          </CodePreview>
        </div>
      </section>

      {/* ========== SWIPEABLE LIST ITEM ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">SwipeableListItem</h2>
          <p className="text-muted-foreground">
            Item de lista con acciones al deslizar (swipe). Perfecto para listas de gastos, tareas, etc.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. Con Acciones a la Derecha</h3>
          <CodePreview
            code={`<SwipeableListItem
  rightActions={[
    { label: "Editar", icon: Edit2, color: "primary", onClick: ... },
    { label: "Eliminar", icon: Trash2, color: "error", onClick: ... }
  ]}
>
  <div className="p-4">Desliza hacia la izquierda</div>
</SwipeableListItem>`}
          >
            <div className="space-y-2">
              <SwipeableListItem
                rightActions={[
                  { label: "Editar", icon: Edit2, color: "primary", onClick: () => alert("Editar") },
                  { label: "Eliminar", icon: Trash2, color: "error", onClick: () => alert("Eliminar") },
                ]}
              >
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="font-medium">Gasto en supermercado</p>
                  <p className="text-sm text-muted-foreground">S/ 150.00</p>
                </div>
              </SwipeableListItem>

              <SwipeableListItem
                rightActions={[
                  { label: "Archivar", icon: Archive, color: "warning", onClick: () => alert("Archivar") },
                ]}
              >
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="font-medium">Transporte</p>
                  <p className="text-sm text-muted-foreground">S/ 25.00</p>
                </div>
              </SwipeableListItem>
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Con Acciones a Ambos Lados</h3>
          <CodePreview
            code={`<SwipeableListItem
  leftActions={[
    { label: "Completar", icon: Check, color: "success", onClick: ... }
  ]}
  rightActions={[
    { label: "Eliminar", icon: Trash2, color: "error", onClick: ... }
  ]}
>
  ...
</SwipeableListItem>`}
          >
            <SwipeableListItem
              leftActions={[
                { label: "Marcar", icon: Archive, color: "success", onClick: () => alert("Marcado") },
              ]}
              rightActions={[
                { label: "Eliminar", icon: Trash2, color: "error", onClick: () => alert("Eliminar") },
              ]}
            >
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="font-medium">Desliza en ambas direcciones</p>
                <p className="text-sm text-muted-foreground">← Marcar | Eliminar →</p>
              </div>
            </SwipeableListItem>
          </CodePreview>
        </div>
      </section>

      {/* ========== EMPTY STATE ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">EmptyState</h2>
          <p className="text-muted-foreground">
            Estado vacío con ilustración y mensaje. Ideal para cuando no hay datos que mostrar.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. EmptyState Básico</h3>
          <CodePreview
            code={`<EmptyState
  icon={Inbox}
  title="No hay gastos"
  description="Comienza agregando tu primer gasto"
  action={{
    label: "Agregar Gasto",
    onClick: () => console.log("Add"),
    icon: Plus
  }}
/>`}
          >
            <Card className="bg-muted/30">
              <EmptyState
                icon={Inbox}
                title="No hay gastos este mes"
                description="Comienza agregando tu primer gasto para llevar un control de tus finanzas"
                action={{
                  label: "Agregar Gasto",
                  onClick: () => alert("Agregar gasto"),
                  icon: Plus,
                }}
              />
            </Card>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Tamaños</h3>
          <CodePreview
            code={`<EmptyState size="sm" ... />
<EmptyState size="md" ... />
<EmptyState size="lg" ... />`}
          >
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-muted/30">
                <EmptyState
                  icon={FileText}
                  title="Sin resultados"
                  size="sm"
                />
              </Card>
              <Card className="bg-muted/30">
                <EmptyState
                  icon={ShoppingCart}
                  title="Carrito vacío"
                  description="Agrega productos"
                  size="md"
                />
              </Card>
              <Card className="bg-muted/30">
                <EmptyState
                  icon={Inbox}
                  title="Sin mensajes"
                  description="No tienes mensajes nuevos"
                  size="lg"
                />
              </Card>
            </div>
          </CodePreview>
        </div>
      </section>

      {/* ========== CHIP/TAG ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Chip / Tag</h2>
          <p className="text-muted-foreground">
            Etiquetas redondeadas para categorías, filtros y tags. Con opción de eliminar y seleccionar.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. Chips Básicos</h3>
          <CodePreview
            code={`<Chip label="React" />
<Chip label="TypeScript" variant="primary" />
<Chip label="Tailwind" variant="success" />
<Chip label="Vite" variant="info" />`}
          >
            <div className="flex flex-wrap gap-2">
              <Chip label="React" />
              <Chip label="TypeScript" variant="primary" />
              <Chip label="Tailwind" variant="success" />
              <Chip label="Vite" variant="info" />
              <Chip label="Node.js" variant="warning" />
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Chips Removibles</h3>
          <CodePreview
            code={`<Chip
  label="Comida"
  removable
  onRemove={() => console.log("Remove")}
/>`}
          >
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.label}
                  removable
                  onRemove={() => setTags(tags.filter((t) => t.id !== tag.id))}
                  variant="primary"
                />
              ))}
              <Button
                size="sm"
                variant="ghost"
                icon={Plus}
                onClick={() =>
                  setTags([...tags, { id: Date.now().toString(), label: "Nueva" }])
                }
              >
                Agregar
              </Button>
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. ChipGroup (Seleccionables)</h3>
          <CodePreview
            code={`<ChipGroup
  chips={[
    { id: "react", label: "React" },
    { id: "vue", label: "Vue" },
    { id: "angular", label: "Angular" }
  ]}
  selected={selected}
  onSelect={(id) => setSelected([id])}
  variant="primary"
/>`}
          >
            <ChipGroup
              chips={[
                { id: "react", label: "React" },
                { id: "vue", label: "Vue" },
                { id: "angular", label: "Angular" },
                { id: "svelte", label: "Svelte" },
              ]}
              selected={selectedChips}
              onSelect={(id) => setSelectedChips([id])}
              variant="primary"
            />
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Con Iconos</h3>
          <CodePreview
            code={`<Chip label="Buscar" icon={Search} />
<Chip label="Etiquetas" icon={Tag} variant="primary" />`}
          >
            <div className="flex flex-wrap gap-2">
              <Chip label="Buscar" icon={Search} />
              <Chip label="Etiquetas" icon={Tag} variant="primary" />
              <Chip label="Editar" icon={Edit2} variant="success" />
              <Chip label="Eliminar" icon={Trash2} variant="error" removable />
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Tamaños</h3>
          <CodePreview
            code={`<Chip size="sm" label="Small" />
<Chip size="md" label="Medium" />
<Chip size="lg" label="Large" />`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Chip size="sm" label="Small" variant="primary" />
              <Chip size="md" label="Medium" variant="primary" />
              <Chip size="lg" label="Large" variant="primary" />
            </div>
          </CodePreview>
        </div>
      </section>

      {/* Props Reference */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Props Reference</h2>

        {/* SearchBar Props */}
        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">SearchBar Props</h4>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">value</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Valor del input.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onChange</TableCell>
                <TableCell className="font-mono text-xs">(value: string) =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al cambiar el valor.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'filled'</TableCell>
                <TableCell>'filled'</TableCell>
                <TableCell>Estilo visual del SearchBar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                <TableCell>'md'</TableCell>
                <TableCell>Tamaño del SearchBar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">showCancelButton</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>true</TableCell>
                <TableCell>Mostrar botón "Cancelar" estilo iOS.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* Chip Props */}
        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">Chip Props</h4>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">label</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Texto del chip.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'</TableCell>
                <TableCell>'default'</TableCell>
                <TableCell>Variante de color.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">removable</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Muestra botón de eliminar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">selected</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Estado seleccionado.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
