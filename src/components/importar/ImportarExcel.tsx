/**
 * Componente de Importación de Gastos - Flujo de 3 Pasos
 *
 * Paso 1: Validar archivo
 * Paso 2: Analizar con opciones
 * Paso 3: Confirmar e importar
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfig } from '@context/ConfigContext';
import { useAuth } from '@context/AuthContext';
import { useAccountsContext } from '@context/AccountsContext';
import SelectorCuenta from '@components/cuentas/SelectorCuenta';
import {
  validateFile,
  analyzeExpenses,
  uploadExpenses,
  validateFileFormat,
  downloadTemplate,
  SUPPORTED_FORMATS,
  type ValidateResponse,
  type AnalyzeResponse,
  type UploadResponse,
  type ValidatedExpense,
  type EnhancedExpense,
  type AnalyzeOptions,
} from '@services/import';
import { toast } from 'react-hot-toast';
import {
  Upload, FileText, Check, Settings,
  Brain, ArrowLeft, Sparkles, FileSpreadsheet,
  AlertCircle, ChevronDown, ChevronUp, Filter, Zap,
  CheckCircle2, XCircle, RefreshCw, Eye, Database, Crown, Wallet
} from 'lucide-react';
import CustomLoader from '@components/common/CustomLoader';
import Button from '@components/common/Button';

type Step = 'upload' | 'validating' | 'preview-valid' | 'analyzing' | 'preview-enhanced' | 'uploading' | 'results';

export default function ImportarExcel() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getCategoryLabel } = useConfig();
  const { isPro } = useAuth();
  const { activeAccounts, defaultAccount } = useAccountsContext();

  // Cuenta destino de TODOS los gastos importados (multi-cuenta, Opción B).
  const [accountId, setAccountId] = useState<string>('');

  // Autoselecciona la cuenta default (o la única) si aún no hay elección.
  useEffect(() => {
    if (accountId) return;
    if (defaultAccount) setAccountId(defaultAccount.id);
    else if (activeAccounts.length === 1) setAccountId(activeAccounts[0].id);
  }, [defaultAccount, activeAccounts, accountId]);

  // Estado del flujo
  const [step, setStep] = useState<Step>('upload');
  const [direction, setDirection] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Datos de cada paso
  const [validateResult, setValidateResult] = useState<ValidateResponse | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  // Datos almacenados entre pasos
  const [validatedData, setValidatedData] = useState<ValidatedExpense[]>([]);
  const [enhancedData, setEnhancedData] = useState<EnhancedExpense[]>([]);

  // Opciones de análisis
  const [options, setOptions] = useState<AnalyzeOptions>({
    skipDuplicates: true,
    autoCategorizate: true,
    batchSize: 100,
  });

  // UI state
  const [showAllPreview, setShowAllPreview] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState(false);

  // Animaciones
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 })
  };

  const navigateStep = (newStep: Step, dir: number) => {
    setDirection(dir);
    setStep(newStep);
  };

  // ============================================================================
  // PASO 1: Subir y Validar
  // ============================================================================

  const handleFileSelect = async (file: File) => {
    const validation = validateFileFormat(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Archivo inválido');
      return;
    }

    navigateStep('validating', 1);

    try {
      const result = await validateFile(file);
      setValidateResult(result);
      setValidatedData(result.data);

      setTimeout(() => {
        navigateStep('preview-valid', 1);
        if (result.invalidCount > 0) {
          toast.error(`${result.invalidCount} registros con errores`);
        } else {
          toast.success(`${result.validCount} registros válidos`);
        }
      }, 800);
    } catch (error: any) {
      toast.error(error.message || 'Error al validar');
      navigateStep('upload', -1);
    }
  };

  // ============================================================================
  // PASO 2: Analizar con IA
  // ============================================================================

  const handleAnalyze = async () => {
    if (validatedData.length === 0) return;

    navigateStep('analyzing', 1);

    try {
      const result = await analyzeExpenses(validatedData, options);
      setAnalyzeResult(result);
      setEnhancedData(result.data);

      setTimeout(() => {
        navigateStep('preview-enhanced', 1);

        const messages = [];
        if (result.duplicatesRemoved > 0) {
          messages.push(`${result.duplicatesRemoved} duplicados removidos`);
        }
        if (result.categorized > 0) {
          messages.push(`${result.categorized} categorizados con IA`);
        }
        if (messages.length > 0) {
          toast.success(messages.join(', '));
        }
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Error al analizar');
      navigateStep('preview-valid', -1);
    }
  };

  // ============================================================================
  // PASO 3: Importar
  // ============================================================================

  const handleUpload = async () => {
    if (enhancedData.length === 0) return;
    if (!accountId) {
      toast.error('Selecciona la cuenta destino antes de importar');
      return;
    }

    navigateStep('uploading', 1);

    try {
      const result = await uploadExpenses(enhancedData, accountId, options.batchSize);
      setUploadResult(result);

      setTimeout(() => {
        navigateStep('results', 1);
        if (result.success) {
          toast.success(`${result.imported} gastos importados`);
        }
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Error al importar');
      navigateStep('preview-enhanced', -1);
    }
  };

  // ============================================================================
  // Utilidades
  // ============================================================================

  const handleDownloadTemplate = async (format: 'excel' | 'json') => {
    try {
      const blob = await downloadTemplate(format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'excel' ? 'plantilla_gastos.xlsx' : 'plantilla_gastos.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Plantilla descargada');
    } catch {
      toast.error('Error al descargar');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const resetFlow = () => {
    setStep('upload');
    setValidateResult(null);
    setAnalyzeResult(null);
    setUploadResult(null);
    setValidatedData([]);
    setEnhancedData([]);
    setShowAllPreview(false);
  };

  const getCurrentStep = () => {
    if (['upload', 'validating'].includes(step)) return 1;
    if (['preview-valid', 'analyzing'].includes(step)) return 2;
    return 3;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Importar Gastos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sube tu archivo y procesa tus gastos en 3 simples pasos
        </p>
      </div>

      {!isPro ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <Crown className="h-10 w-10 text-amber-600 dark:text-amber-500" />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-bold text-foreground">Función Exclusiva PRO</h2>
            <p className="text-muted-foreground">
              La importación masiva de gastos desde Excel, CSV o JSON está disponible solo para usuarios PRO.
              Ahorra tiempo y mantén tus finanzas al día.
            </p>
          </div>
          <Button
            onClick={() => navigate('/configuracion?tab=perfil')}
            variant="pro"
            icon={Crown}
            className="px-6 py-3"
          >
            Actualizar a PRO
          </Button>
        </div>
      ) : (
        <>
          {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[
            { num: 1, label: 'Validar', icon: FileText },
            { num: 2, label: 'Analizar', icon: Brain },
            { num: 3, label: 'Importar', icon: Database }
          ].map((s, i) => {
            const Icon = s.icon;
            const current = getCurrentStep();
            const isActive = current === s.num;
            const isPast = current > s.num;

            return (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30' : ''}
                    ${isPast ? 'bg-green-500 text-white' : ''}
                    ${!isActive && !isPast ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {isPast ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-12 md:w-20 h-0.5 mx-2 mb-5 transition-colors ${isPast ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative min-h-[450px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">

          {/* PASO 1: UPLOAD */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-5"
            >
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative overflow-hidden group cursor-pointer
                  border-2 border-dashed rounded-2xl p-8 md:p-10 text-center transition-all duration-300
                  ${dragActive
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">
                      Arrastra o toca para subir
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Excel, CSV o JSON (máx 5MB)
                    </p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={SUPPORTED_FORMATS.ALL.join(',')}
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownloadTemplate('excel')}
                  className="flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors group"
                >
                  <FileSpreadsheet className="h-4 w-4 md:h-5 md:w-5 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-xs md:text-sm">Plantilla Excel</span>
                </button>
                <button
                  onClick={() => handleDownloadTemplate('json')}
                  className="flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors group"
                >
                  <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-xs md:text-sm">Guía JSON</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* VALIDATING */}
          {step === 'validating' && (
            <motion.div
              key="validating"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center justify-center py-16 text-center space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <div className="relative bg-background p-5 rounded-full shadow-xl border border-border">
                  <FileText className="h-10 w-10 text-primary animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Validando archivo...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Verificando estructura y datos
                </p>
              </div>
            </motion.div>
          )}

          {/* PREVIEW VALIDADOS */}
          {step === 'preview-valid' && validateResult && (
            <motion.div
              key="preview-valid"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border border-border p-3 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold">{validateResult.totalRows}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Total</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold text-green-600">{validateResult.validCount}</p>
                  <p className="text-[10px] md:text-xs text-green-700/70 uppercase">Válidos</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold text-red-600">{validateResult.invalidCount}</p>
                  <p className="text-[10px] md:text-xs text-red-700/70 uppercase">Errores</p>
                </div>
              </div>

              {/* Warnings */}
              {validateResult.warnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Advertencias</span>
                  </div>
                  <ul className="text-xs text-amber-700/80 dark:text-amber-300/80 space-y-1">
                    {validateResult.warnings.map((w, i) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Vista Previa</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {showAllPreview ? validatedData.length : Math.min(5, validatedData.length)} de {validatedData.length}
                  </span>
                </div>

                <div className={`overflow-y-auto ${showAllPreview ? 'max-h-[400px]' : 'max-h-[250px]'}`}>
                  {validatedData.slice(0, showAllPreview ? undefined : 5).map((row, i) => (
                    <div
                      key={i}
                      className="p-3 border-b border-border last:border-0 flex items-center gap-3 hover:bg-muted/20 transition-colors"
                    >
                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${row.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}
                      `}>
                        {row.valid ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{row.descripcion}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {row.fecha} • {getCategoryLabel(row.categoria)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm">{row.moneda} {row.monto}</p>
                        {!row.valid && row.errors?.length > 0 && (
                          <p className="text-[10px] text-red-500 truncate max-w-[100px]">{row.errors[0]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {validatedData.length > 5 && (
                  <button
                    onClick={() => setShowAllPreview(!showAllPreview)}
                    className="w-full p-2 text-xs font-medium text-primary hover:bg-muted/30 transition-colors flex items-center justify-center gap-1"
                  >
                    {showAllPreview ? (
                      <>Ver menos <ChevronUp className="h-3 w-3" /></>
                    ) : (
                      <>Ver todos ({validatedData.length}) <ChevronDown className="h-3 w-3" /></>
                    )}
                  </button>
                )}
              </div>

              {/* Options Panel */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedOptions(!expandedOptions)}
                  className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Opciones de Análisis</span>
                  </div>
                  {expandedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <AnimatePresence>
                  {expandedOptions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 space-y-3">
                        {/* Skip Duplicates */}
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Omitir duplicados</p>
                            <p className="text-[10px] text-muted-foreground">Compara con gastos existentes</p>
                          </div>
                          <button
                            onClick={() => setOptions(p => ({ ...p, skipDuplicates: !p.skipDuplicates }))}
                            className={`w-11 h-6 rounded-full transition-colors relative ${options.skipDuplicates ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                          >
                            <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${options.skipDuplicates ? 'translate-x-5' : ''}`} />
                          </button>
                        </div>

                        {/* Auto Categorize */}
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <div className="flex-1">
                            <p className="font-medium text-sm flex items-center gap-1">
                              Auto-categorizar <Sparkles className="h-3 w-3 text-amber-500" />
                            </p>
                            <p className="text-[10px] text-muted-foreground">Usa IA para clasificar</p>
                          </div>
                          <button
                            onClick={() => setOptions(p => ({ ...p, autoCategorizate: !p.autoCategorizate }))}
                            className={`w-11 h-6 rounded-full transition-colors relative ${options.autoCategorizate ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                          >
                            <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${options.autoCategorizate ? 'translate-x-5' : ''}`} />
                          </button>
                        </div>

                        {/* Batch Size */}
                        <div className="p-3 bg-muted/30 rounded-xl">
                          <div className="flex justify-between mb-2">
                            <p className="font-medium text-sm">Tamaño del lote</p>
                            <span className="text-xs font-mono bg-background px-2 py-0.5 rounded">{options.batchSize}</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="500"
                            step="50"
                            value={options.batchSize}
                            onChange={(e) => setOptions(p => ({ ...p, batchSize: parseInt(e.target.value) }))}
                            className="w-full accent-primary h-1.5"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">50-500 registros por lote</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigateStep('upload', -1)}
                  className="px-4 py-3 rounded-xl font-medium text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={validateResult.validCount === 0}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Analizar con IA
                </button>
              </div>
            </motion.div>
          )}

          {/* ANALYZING */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center justify-center py-16 text-center space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                <div className="relative bg-background p-5 rounded-full shadow-xl border border-border">
                  <Brain className="h-10 w-10 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Analizando con IA...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {options.autoCategorizate && 'Categorizando automáticamente'}
                  {options.skipDuplicates && options.autoCategorizate && ' y '}
                  {options.skipDuplicates && 'detectando duplicados'}
                </p>
              </div>
            </motion.div>
          )}

          {/* PREVIEW MEJORADOS */}
          {step === 'preview-enhanced' && analyzeResult && (
            <motion.div
              key="preview-enhanced"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* AI Summary */}
              {analyzeResult.summary && (
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-indigo-600" />
                    <span className="font-semibold text-sm text-indigo-700 dark:text-indigo-300">Análisis IA</span>
                  </div>
                  <p className="text-sm text-foreground/80">{analyzeResult.summary}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border border-border p-3 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold">{analyzeResult.totalProcessed}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Procesados</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-3 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold text-purple-600">{analyzeResult.categorized}</p>
                  <p className="text-[10px] md:text-xs text-purple-700/70 uppercase">Categorizados</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold text-amber-600">{analyzeResult.duplicatesRemoved}</p>
                  <p className="text-[10px] md:text-xs text-amber-700/70 uppercase">Duplicados</p>
                </div>
              </div>

              {/* AI Suggestions */}
              {analyzeResult.aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  {analyzeResult.aiSuggestions.slice(0, 3).map((sug, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl">
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="text-muted-foreground">{sug.message}</p>
                        <p className="font-medium text-foreground">{sug.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced Preview */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Datos Mejorados</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">{enhancedData.length} registros</span>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {enhancedData.slice(0, 8).map((row, i) => (
                    <div key={i} className="p-3 border-b border-border last:border-0 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{row.descripcion}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span>{row.fecha}</span>
                          <span>•</span>
                          <span className={row.categoriaSugerida ? 'text-purple-600 font-medium' : ''}>
                            {getCategoryLabel(row.categoria)}
                          </span>
                          {row.categoriaSugerida && (
                            <Sparkles className="h-2.5 w-2.5 text-purple-500" />
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm">{row.moneda} {row.monto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cuenta destino */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Cuenta destino</h3>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Todos los gastos se importarán a esta cuenta, adoptarán su
                  moneda y su saldo se descontará automáticamente.
                </p>
                <SelectorCuenta
                  value={accountId}
                  onChange={(id) => setAccountId(id)}
                  placeholder="Seleccionar cuenta"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigateStep('preview-valid', -1)}
                  className="px-4 py-3 rounded-xl font-medium text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!accountId}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Importar {enhancedData.length} gastos
                </button>
              </div>
            </motion.div>
          )}

          {/* UPLOADING */}
          {step === 'uploading' && (
            <motion.div
              key="uploading"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center justify-center py-16 text-center space-y-6"
            >
              <div className="relative h-24 w-24">
                <CustomLoader />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Guardando gastos...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Importando {enhancedData.length} registros
                </p>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {step === 'results' && uploadResult && (
            <motion.div
              key="results"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-1">Importación Completada</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Tus gastos han sido guardados correctamente
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="text-xl font-bold">{uploadResult.totalRows}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-xl font-bold text-green-600">{uploadResult.imported}</p>
                    <p className="text-[10px] text-green-700/70 uppercase">Importados</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <p className="text-xl font-bold text-red-600">{uploadResult.failed}</p>
                    <p className="text-[10px] text-red-700/70 uppercase">Fallidos</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/gastos')}
                    className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Ver Mis Gastos
                  </button>
                  <button
                    onClick={resetFlow}
                    className="w-full px-4 py-3 rounded-xl font-medium text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Importar Otro Archivo
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
        </div>
      </>
      )}
    </div>
  );
}
