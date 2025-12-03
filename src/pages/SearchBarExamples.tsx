import { useState } from "react";
import { SearchBar, CompactSearchBar } from "@components/common/SearchBar";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";

export function SearchBarExamples() {
  const [searchValue, setSearchValue] = useState("");
  const [compactSearch, setCompactSearch] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">SearchBar Component</h2>
        <p className="text-muted-foreground">
          Barra de búsqueda estilo iOS con animación de expansión/contracción y botón cancelar.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic SearchBar */}
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

        {/* Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Variantes</h3>
          <CodePreview
            code={`<SearchBar variant="filled" />
<SearchBar variant="default" />`}
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Filled (default)</p>
                <SearchBar
                  value={searchValue}
                  onChange={setSearchValue}
                  variant="filled"
                  placeholder="Filled variant"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Default (with border)</p>
                <SearchBar
                  value={searchValue}
                  onChange={setSearchValue}
                  variant="default"
                  placeholder="Default variant"
                />
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Tamaños</h3>
          <CodePreview
            code={`<SearchBar size="sm" />
<SearchBar size="md" />
<SearchBar size="lg" />`}
          >
            <div className="space-y-3">
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                size="sm"
                placeholder="Small"
              />
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                size="md"
                placeholder="Medium (default)"
              />
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                size="lg"
                placeholder="Large"
              />
            </div>
          </CodePreview>
        </div>

        {/* Compact SearchBar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Compact SearchBar</h3>
          <p className="text-sm text-muted-foreground">
            Se expande al hacer clic, ideal para barras de navegación.
          </p>
          <CodePreview
            code={`<CompactSearchBar
  value={search}
  onChange={setSearch}
  expandOnFocus
  placeholder="Buscar..."
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

        {/* Without Cancel Button */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Sin Botón Cancelar</h3>
          <CodePreview
            code={`<SearchBar
  showCancelButton={false}
  value={search}
  onChange={setSearch}
/>`}
          >
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              showCancelButton={false}
              placeholder="Sin botón cancelar"
            />
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🔍 Auto-clear</h4>
            <p className="text-sm text-muted-foreground">
              Botón X aparece automáticamente cuando hay texto para limpiar rápidamente.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">📱 iOS Cancel Button</h4>
            <p className="text-sm text-muted-foreground">
              Botón "Cancelar" aparece al enfocar, igual que en iOS nativo.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 Smooth Animations</h4>
            <p className="text-sm text-muted-foreground">
              Transiciones suaves al expandir/contraer y mostrar/ocultar botones.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">⚡ Compact Mode</h4>
            <p className="text-sm text-muted-foreground">
              Modo compacto que se expande solo cuando se necesita, ahorrando espacio.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

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
                <TableCell>Valor del input de búsqueda.</TableCell>
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
                <TableCell className="font-mono text-xs">placeholder</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>'Buscar...'</TableCell>
                <TableCell>Texto placeholder del input.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">showCancelButton</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>true</TableCell>
                <TableCell>Mostrar botón "Cancelar" estilo iOS.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">cancelLabel</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>'Cancelar'</TableCell>
                <TableCell>Texto del botón cancelar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">autoFocus</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Auto-enfocar el input al montar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onClear</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al limpiar el input.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">CompactSearchBar Props</h4>
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
                <TableCell className="font-mono text-xs">expandOnFocus</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>true</TableCell>
                <TableCell>Expandir al enfocar, contraer al desenfocar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">...SearchBarProps</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Hereda todas las props de SearchBar (excepto showCancelButton).</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
