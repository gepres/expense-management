import { useState } from "react";
import { Chip, ChipGroup } from "@components/common/Chip";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Tag, Edit2, Trash2, Plus, Search, Home, ShoppingCart } from "lucide-react";

export function ChipExamples() {
  const [selectedChips, setSelectedChips] = useState<string[]>(["react"]);
  const [multiSelect, setMultiSelect] = useState<string[]>(["comida", "transporte"]);
  const [tags, setTags] = useState([
    { id: "1", label: "Comida" },
    { id: "2", label: "Transporte" },
    { id: "3", label: "Entretenimiento" },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Chip / Tag Component</h2>
        <p className="text-muted-foreground">
          Etiquetas redondeadas para categorías, filtros y tags. Con opción de eliminar y seleccionar.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Chips */}
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
              <Chip label="Error" variant="error" />
            </div>
          </CodePreview>
        </div>

        {/* Removable Chips */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Chips Removibles</h3>
          <CodePreview
            code={`<Chip
  label="Comida"
  removable
  onRemove={() => console.log("Remove")}
  variant="primary"
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
                  setTags([...tags, { id: Date.now().toString(), label: `Tag ${tags.length + 1}` }])
                }
              >
                Agregar
              </Button>
            </div>
          </CodePreview>
        </div>

        {/* With Icons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Con Iconos</h3>
          <CodePreview
            code={`<Chip label="Buscar" icon={Search} />
<Chip label="Etiquetas" icon={Tag} variant="primary" />
<Chip label="Inicio" icon={Home} variant="success" />`}
          >
            <div className="flex flex-wrap gap-2">
              <Chip label="Buscar" icon={Search} />
              <Chip label="Etiquetas" icon={Tag} variant="primary" />
              <Chip label="Inicio" icon={Home} variant="success" />
              <Chip label="Carrito" icon={ShoppingCart} variant="info" />
              <Chip label="Editar" icon={Edit2} variant="warning" removable />
              <Chip label="Eliminar" icon={Trash2} variant="error" removable />
            </div>
          </CodePreview>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Tamaños</h3>
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

        {/* Selected State */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Estado Seleccionado</h3>
          <CodePreview
            code={`<Chip 
  label="React" 
  selected={isSelected}
  onClick={() => setSelected(!isSelected)}
  variant="primary"
/>`}
          >
            <div className="flex flex-wrap gap-2">
              <Chip label="No seleccionado" variant="primary" />
              <Chip label="Seleccionado" variant="primary" selected />
              <Chip label="No seleccionado" variant="success" />
              <Chip label="Seleccionado" variant="success" selected />
            </div>
          </CodePreview>
        </div>

        {/* ChipGroup - Single Select */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">6. ChipGroup (Selección Simple)</h3>
          <CodePreview
            code={`const [selected, setSelected] = useState(["react"]);

<ChipGroup
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

        {/* ChipGroup - Multi Select */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">7. ChipGroup (Selección Múltiple)</h3>
          <CodePreview
            code={`const [selected, setSelected] = useState(["comida"]);

<ChipGroup
  chips={categories}
  selected={selected}
  onSelect={(id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  }}
  variant="success"
/>`}
          >
            <div className="space-y-3">
              <ChipGroup
                chips={[
                  { id: "comida", label: "Comida", icon: ShoppingCart },
                  { id: "transporte", label: "Transporte" },
                  { id: "entretenimiento", label: "Entretenimiento" },
                  { id: "salud", label: "Salud" },
                  { id: "educacion", label: "Educación" },
                ]}
                selected={multiSelect}
                onSelect={(id) => {
                  if (multiSelect.includes(id)) {
                    setMultiSelect(multiSelect.filter((s) => s !== id));
                  } else {
                    setMultiSelect([...multiSelect, id]);
                  }
                }}
                variant="success"
              />
              <p className="text-sm text-muted-foreground">
                Seleccionados: {multiSelect.join(", ") || "Ninguno"}
              </p>
            </div>
          </CodePreview>
        </div>

        {/* Removable ChipGroup */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">8. ChipGroup Removible</h3>
          <CodePreview
            code={`<ChipGroup
  chips={tags}
  removable
  onRemove={(id) => setTags(tags.filter(t => t.id !== id))}
  variant="primary"
/>`}
          >
            <ChipGroup
              chips={tags}
              removable
              onRemove={(id) => setTags(tags.filter((t) => t.id !== id))}
              variant="primary"
            />
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🎯 Selectable</h4>
            <p className="text-sm text-muted-foreground">
              Soporta selección simple y múltiple con ChipGroup.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">❌ Removable</h4>
            <p className="text-sm text-muted-foreground">
              Botón X para eliminar chips dinámicamente.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 6 Variants</h4>
            <p className="text-sm text-muted-foreground">
              Colores semánticos: default, primary, success, warning, error, info.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🔍 With Icons</h4>
            <p className="text-sm text-muted-foreground">
              Añade iconos para mejor identificación visual.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

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
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                <TableCell>'md'</TableCell>
                <TableCell>Tamaño del chip.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Icono opcional.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">removable</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Muestra botón de eliminar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onRemove</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al eliminar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">selected</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Estado seleccionado.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onClick</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al hacer clic.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">ChipGroup Props</h4>
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
                <TableCell className="font-mono text-xs">chips</TableCell>
                <TableCell className="font-mono text-xs">{`Array<{ id, label, icon? }>`}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Array de chips a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">selected</TableCell>
                <TableCell className="font-mono text-xs">string[]</TableCell>
                <TableCell>[]</TableCell>
                <TableCell>IDs de chips seleccionados.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onSelect</TableCell>
                <TableCell className="font-mono text-xs">(id: string) =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al seleccionar un chip.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onRemove</TableCell>
                <TableCell className="font-mono text-xs">(id: string) =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al eliminar un chip.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">removable</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Todos los chips son removibles.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
