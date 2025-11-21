/**
 * Servicio de integración con Anthropic API para el asistente IA
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  MensajeChat,
  ContextoUsuario,
  Gasto,
  EstadisticasPeriodo,
  Presupuesto,
  CategoriaGasto,
} from '@app-types';
import { CATEGORIA_LABELS } from '@app-types';
import { formatearMoneda } from '@utils/formatters';

// ============================================================================
// Configuración
// ============================================================================

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Solo para desarrollo, usar backend en producción
});

// ============================================================================
// Utilidades
// ============================================================================

/**
 * Genera un contexto detallado del usuario para enviar a Claude
 */
function generarContextoUsuario(contexto: ContextoUsuario): string {
  const { gastosRecientes, estadisticasMes, presupuestos, tendencias } = contexto;

  let texto = '## Contexto del Usuario\n\n';

  // Estadísticas del mes actual
  if (estadisticasMes) {
    texto += '### Resumen del Mes Actual:\n';
    texto += `- Total gastado: ${formatearMoneda(estadisticasMes.totalGastado)}\n`;
    texto += `- Promedio por gasto: ${formatearMoneda(estadisticasMes.promedioGasto)}\n`;
    texto += `- Número de gastos: ${estadisticasMes.numeroGastos}\n`;
    texto += `- Gasto máximo: ${formatearMoneda(estadisticasMes.gastoMaximo)}\n`;
    texto += `- Gasto mínimo: ${formatearMoneda(estadisticasMes.gastoMinimo)}\n\n`;

    texto += '### Gastos por Categoría:\n';
    Object.entries(estadisticasMes.gastosPorCategoria)
      .filter(([_, monto]) => monto > 0)
      .sort(([_, a], [__, b]) => b - a)
      .forEach(([cat, monto]) => {
        texto += `- ${CATEGORIA_LABELS[cat as CategoriaGasto]}: ${formatearMoneda(monto)}\n`;
      });
    texto += '\n';
  }

  // Presupuestos
  if (presupuestos.length > 0) {
    texto += '### Presupuestos Activos:\n';
    presupuestos.forEach(p => {
      const porcentaje = (p.gastado / p.limite) * 100;
      const categoriaLabel = p.categoria === 'general' ? 'General' : CATEGORIA_LABELS[p.categoria as CategoriaGasto];
      texto += `- ${categoriaLabel}: ${formatearMoneda(p.gastado)} / ${formatearMoneda(p.limite)} (${porcentaje.toFixed(1)}%)\n`;
    });
    texto += '\n';
  }

  // Tendencias
  if (tendencias.length > 0) {
    texto += '### Tendencias Detectadas:\n';
    tendencias.forEach(t => {
      const emoji = t.tendencia === 'creciente' ? '📈' : t.tendencia === 'decreciente' ? '📉' : '➡️';
      texto += `- ${emoji} ${CATEGORIA_LABELS[t.categoria]}: ${t.tendencia} (${t.porcentajeCambio.toFixed(1)}%)\n`;
    });
    texto += '\n';
  }

  // Gastos recientes
  if (gastosRecientes.length > 0) {
    texto += '### Últimos Gastos:\n';
    gastosRecientes.slice(0, 10).forEach(gasto => {
      const fecha = gasto.fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      });
      texto += `- ${fecha}: ${formatearMoneda(gasto.monto)} - ${gasto.descripcion} (${CATEGORIA_LABELS[gasto.categoria]})\n`;
    });
  }

  return texto;
}

/**
 * Genera el mensaje del sistema con instrucciones para Claude
 */
function generarMensajeSistema(): string {
  return `Eres un asistente financiero personal experto y amigable. Tu función es ayudar al usuario a gestionar sus gastos personales de manera efectiva.

Capacidades:
- Analizar patrones de gastos y tendencias
- Ofrecer consejos personalizados de ahorro
- Responder preguntas sobre finanzas personales
- Ayudar a crear y ajustar presupuestos
- Identificar gastos innecesarios o excesivos
- Explicar estadísticas y gráficos de manera clara

Pautas:
1. Sé claro, conciso y específico en tus respuestas
2. Usa números y porcentajes para respaldar tus análisis
3. Ofrece consejos prácticos y accionables
4. Mantén un tono amigable pero profesional
5. Adapta tu lenguaje según la complejidad de la pregunta
6. Si no tienes información suficiente, pide aclaraciones
7. Cuando menciones cantidades monetarias, usa el formato apropiado
8. Prioriza la educación financiera del usuario

Recuerda: Tu objetivo es empoderar al usuario para que tome mejores decisiones financieras.`;
}

// ============================================================================
// Servicio Principal
// ============================================================================

export const anthropicService = {
  /**
   * Enviar un mensaje a Claude y obtener respuesta
   */
  async enviarMensaje(
    mensaje: string,
    contextoUsuario: ContextoUsuario,
    historial: MensajeChat[] = []
  ): Promise<string> {
    try {
      // Construir contexto
      const contextoTexto = generarContextoUsuario(contextoUsuario);

      // Convertir historial a formato de Anthropic
      const mensajesAnthropic: Anthropic.MessageParam[] = historial
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Agregar mensaje actual
      mensajesAnthropic.push({
        role: 'user',
        content: `${contextoTexto}\n\nPregunta del usuario: ${mensaje}`,
      });

      // Llamar a la API de Anthropic
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: generarMensajeSistema(),
        messages: mensajesAnthropic,
      });

      // Extraer respuesta
      const contenido = response.content[0];
      if (contenido.type === 'text') {
        return contenido.text;
      }

      throw new Error('Respuesta inesperada de la API');
    } catch (error) {
      console.error('Error al comunicarse con Anthropic:', error);
      throw new Error('No se pudo obtener respuesta del asistente IA');
    }
  },

  /**
   * Analizar gastos y generar recomendaciones
   */
  async analizarGastos(
    gastos: Gasto[],
    estadisticas: EstadisticasPeriodo,
    presupuestos: Presupuesto[]
  ): Promise<string> {
    const contexto: ContextoUsuario = {
      gastosRecientes: gastos,
      estadisticasMes: estadisticas,
      presupuestos,
      tendencias: [],
      recomendaciones: [],
    };

    const prompt = `Analiza mis gastos y proporciona:
1. Un resumen de mis hábitos de gasto
2. Las categorías donde más gasto
3. 3-5 recomendaciones concretas para ahorrar dinero
4. Evaluación del cumplimiento de presupuestos

Por favor, sé específico con números y porcentajes.`;

    return this.enviarMensaje(prompt, contexto);
  },

  /**
   * Obtener consejos de ahorro para una categoría específica
   */
  async consejosAhorro(
    categoria: CategoriaGasto,
    montoActual: number,
    contexto: ContextoUsuario
  ): Promise<string> {
    const prompt = `He gastado ${formatearMoneda(montoActual)} en ${CATEGORIA_LABELS[categoria]} este mes.
¿Qué consejos específicos me darías para reducir estos gastos? Dame 3-5 recomendaciones prácticas.`;

    return this.enviarMensaje(prompt, contexto);
  },

  /**
   * Explicar una tendencia detectada
   */
  async explicarTendencia(
    categoria: CategoriaGasto,
    tendencia: 'creciente' | 'decreciente' | 'estable',
    porcentajeCambio: number,
    contexto: ContextoUsuario
  ): Promise<string> {
    const prompt = `He notado que mis gastos en ${CATEGORIA_LABELS[categoria]} tienen una tendencia ${tendencia}
con un cambio del ${porcentajeCambio.toFixed(1)}%. ¿Qué significa esto y qué debería hacer al respecto?`;

    return this.enviarMensaje(prompt, contexto);
  },

  /**
   * Ayudar a crear un presupuesto
   */
  async ayudarConPresupuesto(
    ingresosMensuales: number,
    contexto: ContextoUsuario
  ): Promise<string> {
    const prompt = `Mis ingresos mensuales son de ${formatearMoneda(ingresosMensuales)}.
Basándote en mis gastos históricos, ¿puedes ayudarme a crear un presupuesto mensual realista por categoría?
Usa la regla 50/30/20 como referencia si es apropiado.`;

    return this.enviarMensaje(prompt, contexto);
  },

  /**
   * Comparar con meses anteriores
   */
  async compararPeriodos(
    mesActual: EstadisticasPeriodo,
    mesAnterior: EstadisticasPeriodo,
    contexto: ContextoUsuario
  ): Promise<string> {
    const diferencia = mesActual.totalGastado - mesAnterior.totalGastado;
    const porcentaje = ((diferencia / mesAnterior.totalGastado) * 100).toFixed(1);

    const prompt = `Compara mis gastos:
- Mes actual: ${formatearMoneda(mesActual.totalGastado)}
- Mes anterior: ${formatearMoneda(mesAnterior.totalGastado)}
- Diferencia: ${formatearMoneda(Math.abs(diferencia))} (${porcentaje}%)

¿Qué observaciones y recomendaciones tienes?`;

    return this.enviarMensaje(prompt, contexto);
  },
};

export default anthropicService;
