/**
 * Hook utilitario que marca con un anillo verde los campos del formulario
 * que fueron rellenados por la IA. Se desactivan automáticamente tras 2s.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const DURATION_MS = 2000;

export function useExtractedHighlight() {
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markExtracted = useCallback((fields: string[]) => {
    if (fields.length === 0) return;
    setHighlighted(new Set(fields));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setHighlighted(new Set());
      timerRef.current = null;
    }, DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  /** Clases Tailwind para aplicar al contenedor del campo (ring inset). */
  const ringClass = useCallback(
    (field: string): string =>
      highlighted.has(field)
        ? 'ring-2 ring-inset ring-emerald-400/80 bg-emerald-50/40 dark:bg-emerald-900/15 transition-all duration-500'
        : 'transition-all duration-500',
    [highlighted],
  );

  return { highlighted, markExtracted, ringClass };
}
