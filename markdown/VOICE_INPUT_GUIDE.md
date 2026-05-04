# Guía de Implementación - Entrada de Voz para Gastos

## Resumen
Se ha implementado la funcionalidad de entrada de voz en el formulario de nuevo gasto. El usuario puede describir un gasto verbalmente y la IA lo procesará para autocompletar el formulario.

## Frontend (Implementado ✅)

### Archivos Creados:
1. **`src/hooks/useVoiceInput.ts`** - Hook personalizado para Web Speech API
2. **`src/services/voice.ts`** - Servicio para comunicarse con el backend
3. **Modificado: `src/components/gastos/FormularioGasto.tsx`** - Integración de UI y lógica

### Características:
- ✅ Botón de micrófono en el header del formulario (solo en modo "Nuevo Gasto")
- ✅ Modal visual mientras escucha con ejemplos de uso
- ✅ Modal de procesamiento con loader mientras la IA analiza
- ✅ Autocompletado del formulario con los datos extraídos
- ✅ Validación de confianza (>60% para autocompletar)
- ✅ Manejo de errores y feedback al usuario
- ✅ Soporte solo en navegadores compatibles (Chrome, Edge)

## Backend (Pendiente de Implementar ⚠️)

### Endpoint Requerido:

```typescript
POST /api/voice/process-expense
Authorization: Bearer {firebase_token}
Content-Type: application/json

Body:
{
  "transcript": "Gasté 50 soles en almuerzo en el restaurante"
}

Response:
{
  "monto": 50,
  "moneda": "PEN",
  "categoria": "alimentacion",
  "subcategoria": "restaurantes",
  "descripcion": "Almuerzo en restaurante",
  "metodoPago": "efectivo",  // opcional
  "fecha": "2025-11-20",     // opcional (formato YYYY-MM-DD)
  "confidence": 0.95         // 0-1
}
```

### Implementación Sugerida (NestJS + Anthropic):

#### 1. Crear el Módulo de Voz

```bash
nest g module voice
nest g controller voice
nest g service voice
```

#### 2. Instalar Dependencias

```bash
npm install @anthropic-ai/sdk
```

#### 3. Configurar Variables de Entorno

```env
ANTHROPIC_API_KEY=tu_api_key_aqui
```

#### 4. Implementar el Servicio

```typescript
// src/voice/voice.service.ts
import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

interface ExpenseData {
  monto: number;
  moneda: 'PEN' | 'USD';
  categoria: string;
  subcategoria?: string;
  descripcion: string;
  metodoPago?: string;
  fecha?: string;
  confidence: number;
}

@Injectable()
export class VoiceService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async extractExpenseData(transcript: string): Promise<ExpenseData> {
    const prompt = `Eres un asistente que extrae información de gastos desde texto hablado en español.

Categorías válidas: alimentacion, transporte, entretenimiento, salud, servicios, compras, educacion, vivienda, otros

Métodos de pago válidos: efectivo, tarjeta_debito, tarjeta_credito, transferencia, yape, plin, otros

Monedas válidas: PEN (soles), USD (dólares)

Texto del usuario: "${transcript}"

Extrae la siguiente información y devuélvela en formato JSON:
{
  "monto": número (sin símbolos),
  "moneda": "PEN" o "USD",
  "categoria": una de las categorías válidas,
  "subcategoria": si se menciona (opcional),
  "descripcion": descripción del gasto,
  "metodoPago": uno de los métodos válidos (opcional),
  "fecha": fecha en formato YYYY-MM-DD si se menciona (opcional, por defecto hoy),
  "confidence": número entre 0 y 1 indicando tu confianza en la extracción
}

Reglas:
- Si no se menciona la moneda, asume PEN
- Si el monto tiene decimales, úsalos
- La descripción debe ser clara y concisa
- Si falta información crítica (monto o categoría), pon confidence bajo (< 0.6)
- Infiere la categoría del contexto si no se menciona explícitamente
- Para métodos de pago peruanos comunes: "yape", "plin", "transferencia"

Responde SOLO con el JSON, sin texto adicional.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      try {
        // Extraer JSON del texto
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const expenseData = JSON.parse(jsonMatch[0]);
          return expenseData;
        }
      } catch (error) {
        throw new Error('Error parsing AI response');
      }
    }

    throw new Error('No valid expense data extracted');
  }
}
```

#### 5. Implementar el Controlador

```typescript
// src/voice/voice.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('voice')
@UseGuards(FirebaseAuthGuard)
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('process-expense')
  async processExpenseFromVoice(@Body() body: { transcript: string }) {
    if (!body.transcript || body.transcript.trim().length === 0) {
      throw new Error('Transcript is required');
    }

    return this.voiceService.extractExpenseData(body.transcript);
  }
}
```

#### 6. Registrar el Módulo

```typescript
// src/voice/voice.module.ts
import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';

@Module({
  controllers: [VoiceController],
  providers: [VoiceService],
})
export class VoiceModule {}
```

```typescript
// src/app.module.ts
import { VoiceModule } from './voice/voice.module';

@Module({
  imports: [
    // ... otros módulos
    VoiceModule,
  ],
})
export class AppModule {}
```

## Uso

### Para el Usuario:

1. Ir a "Nuevo Gasto"
2. Hacer clic en el botón del micrófono (🎤)
3. Describir el gasto naturalmente:
   - "Gasté 50 soles en almuerzo"
   - "Compré gasolina por 100 soles con yape"
   - "Pagué 30 dólares de Netflix con tarjeta"
4. El formulario se autocompleta automáticamente
5. Revisar y ajustar si es necesario
6. Guardar

### Ejemplos de Frases:

- ✅ "Gasté 50 soles en almuerzo en el restaurante"
- ✅ "Compré gasolina por 100 con yape"
- ✅ "Pagué 30 dólares de Netflix con tarjeta de crédito"
- ✅ "Transporte en taxi 15 soles"
- ✅ "Cena con amigos 80 soles"

## Mejoras Futuras

1. **Soporte para más idiomas** (inglés, etc.)
2. **Historial de transcripciones** para debugging
3. **Confirmación antes de guardar** para gastos de baja confianza
4. **Entrenamiento del modelo** con datos reales de usuarios
5. **Soporte offline** con modelos locales
6. **Reconocimiento de voz continuo** para múltiples gastos

## Notas Importantes

- ⚠️ **Requiere HTTPS** en producción (Web Speech API)
- ⚠️ **Solo funciona en Chrome/Edge** (Web Speech API)
- ⚠️ **Requiere permisos de micrófono** del navegador
- ⚠️ **Costos de API** de Anthropic por cada procesamiento
- ✅ **Privacidad**: El audio no se graba, solo se transcribe localmente

## Testing

### Frontend:
```bash
# Asegúrate de que el servidor de desarrollo esté corriendo
npm run dev

# Navega a /gastos/nuevo
# Haz clic en el botón del micrófono
# Prueba con diferentes frases
```

### Backend (cuando esté implementado):
```bash
# Test con curl
curl -X POST http://localhost:3000/api/voice/process-expense \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{"transcript": "Gasté 50 soles en almuerzo"}'
```

## Troubleshooting

### "El reconocimiento de voz no está soportado"
- Usa Chrome o Edge
- Asegúrate de estar en HTTPS (en producción)

### "Error: No hay sesión activa"
- Inicia sesión primero
- Verifica que el token de Firebase sea válido

### "No pude entender bien el gasto"
- Habla más claro y despacio
- Menciona explícitamente el monto y la categoría
- Intenta de nuevo o completa manualmente

### El backend no responde
- Verifica que el endpoint esté implementado
- Revisa los logs del servidor
- Confirma que ANTHROPIC_API_KEY esté configurada
