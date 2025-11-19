/**
 * Componente de Importación de Gastos
 *
 * Permite importar gastos desde archivos Excel/CSV
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  validateFileFormat,
  validateImportFile,
  importGastos,
  downloadTemplate,
  SUPPORTED_FORMATS,
  REQUIRED_COLUMNS,
  OPTIONAL_COLUMNS,
  type ImportResult,
  type FileValidationResult,
} from '@services/import';
import { toast } from 'react-hot-toast';
import { FileText, Download, Check, CheckCircle2, AlertTriangle, X as XCircle } from 'lucide-react';

type Step = 'upload' | 'preview' | 'importing' | 'results';

export default function ImportarExcel() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  /**
   * Manejar selección de archivo
   */
  const handleFileSelect = (file: File) => {
    // Validar formato
    const validation = validateFileFormat(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Archivo inválido');
      return;
    }

    setSelectedFile(file);
    setStep('preview');
    validateFile(file);
  };

  /**
   * Validar archivo con el backend
   */
  const validateFile = async (file: File) => {
    setIsProcessing(true);

    try {
      const result = await validateImportFile(file);
      setValidationResult(result);

      if (!result.valid) {
        toast.error('El archivo contiene errores. Revisa los detalles.');
      } else if (result.warnings && result.warnings.length > 0) {
        toast.success('Archivo validado con advertencias');
      } else {
        toast.success(`Archivo válido con ${result.rowCount} filas`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al validar el archivo');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Importar los gastos
   */
  const handleImport = async () => {
    if (!selectedFile) return;

    setStep('importing');
    setIsProcessing(true);

    try {
      const result = await importGastos(selectedFile);
      setImportResult(result);
      setStep('results');

      if (result.success && result.errorCount === 0) {
        toast.success(`${result.successCount} gastos importados correctamente`);
      } else {
        toast.success(`${result.successCount} gastos importados, ${result.errorCount} errores`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al importar gastos');
      setStep('preview');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Descargar plantilla de Excel
   */
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_gastos.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Plantilla descargada');
    } catch (error: any) {
      toast.error(error.message || 'Error al descargar la plantilla');
    }
  };

  /**
   * Reiniciar el proceso
   */
  const handleReset = () => {
    setStep('upload');
    setSelectedFile(null);
    setValidationResult(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Manejar drag & drop
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Importar Gastos</h1>
        <p className="text-muted-foreground mt-1">
          Importa tus gastos desde un archivo Excel o CSV
        </p>
      </div>

      {/* Pasos del proceso */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          {(['upload', 'preview', 'importing', 'results'] as Step[]).map((s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : index < (['upload', 'preview', 'importing', 'results'] as Step[]).indexOf(step)
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <div
                  className={`h-0.5 w-24 mx-2 ${
                    index < (['upload', 'preview', 'importing', 'results'] as Step[]).indexOf(step)
                      ? 'bg-primary'
                      : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-2">
          <span className="text-sm">Subir</span>
          <span className="text-sm">Vista Previa</span>
          <span className="text-sm">Importando</span>
          <span className="text-sm">Resultados</span>
        </div>
      </div>

      {/* Paso 1: Subir archivo */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Instrucciones */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 Antes de importar
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>El archivo debe ser Excel (.xlsx, .xls) o CSV (.csv)</li>
              <li>Tamaño máximo: 5MB</li>
              <li>Primera fila debe contener los nombres de las columnas</li>
              <li>
                Columnas requeridas: <strong>{REQUIRED_COLUMNS.join(', ')}</strong>
              </li>
              <li>
                Columnas opcionales: {OPTIONAL_COLUMNS.join(', ')}
              </li>
            </ul>
          </div>

          {/* Área de drop */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="max-w-md mx-auto">
              <div className="mb-4 flex justify-center">
                <FileText className="h-24 w-24 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Arrastra tu archivo aquí
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                o haz clic para seleccionarlo
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_FORMATS.ALL.join(',')}
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />

              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Seleccionar Archivo
              </label>

              <p className="text-xs text-muted-foreground mt-4">
                Formatos: .xlsx, .xls, .csv
              </p>
            </div>
          </div>

          {/* Botón de plantilla */}
          <div className="text-center">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Descargar Plantilla de Excel</span>
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Usa esta plantilla como guía para formatear tus datos
            </p>
          </div>
        </div>
      )}

      {/* Paso 2: Vista previa */}
      {step === 'preview' && (
        <div className="space-y-6">
          {/* Info del archivo */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Archivo Seleccionado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{selectedFile?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tamaño</p>
                <p className="font-medium">
                  {selectedFile ? (selectedFile.size / 1024).toFixed(2) : 0} KB
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filas detectadas</p>
                <p className="font-medium">
                  {isProcessing ? '...' : validationResult?.rowCount || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Resultado de validación */}
          {validationResult && !isProcessing && (
            <>
              {/* Errores */}
              {validationResult.errors && validationResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    <span>Errores encontrados ({validationResult.errors.length})</span>
                  </h4>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside max-h-40 overflow-y-auto">
                    {validationResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {validationResult.errors.length > 10 && (
                      <li className="font-semibold">
                        ... y {validationResult.errors.length - 10} errores más
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Advertencias */}
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    ⚠️ Advertencias ({validationResult.warnings.length})
                  </h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside max-h-40 overflow-y-auto">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview de datos */}
              {validationResult.preview && validationResult.preview.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Vista Previa (primeras 5 filas)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2 text-muted-foreground">#</th>
                          <th className="text-left p-2 text-muted-foreground">Fecha</th>
                          <th className="text-left p-2 text-muted-foreground">Categoría</th>
                          <th className="text-left p-2 text-muted-foreground">Monto</th>
                          <th className="text-left p-2 text-muted-foreground">Descripción</th>
                          <th className="text-left p-2 text-muted-foreground">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationResult.preview.slice(0, 5).map((row) => (
                          <tr key={row.rowNumber} className="border-b border-border">
                            <td className="p-2 text-muted-foreground">{row.rowNumber}</td>
                            <td className="p-2">{row.fecha}</td>
                            <td className="p-2">{row.categoria}</td>
                            <td className="p-2">
                              {row.moneda} {row.monto}
                            </td>
                            <td className="p-2 max-w-xs truncate">{row.descripcion}</td>
                            <td className="p-2">
                              {row.valid ? (
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Loading */}
          {isProcessing && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Validando archivo...</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={!validationResult?.valid || isProcessing}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Validando...' : 'Importar Gastos'}
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Importando */}
      {step === 'importing' && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Importando Gastos...
            </h3>
            <p className="text-muted-foreground mb-6">
              Por favor espera mientras procesamos tu archivo
            </p>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                No cierres esta página hasta que termine el proceso
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Paso 4: Resultados */}
      {step === 'results' && importResult && (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                {importResult.errorCount === 0 ? (
                  <CheckCircle2 className="h-24 w-24 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-24 w-24 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Importación Completada
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-foreground">
                  {importResult.totalRows}
                </p>
                <p className="text-sm text-muted-foreground">Total Filas</p>
              </div>
              <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {importResult.successCount}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Importados</p>
              </div>
              <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {importResult.errorCount}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">Errores</p>
              </div>
            </div>
          </div>

          {/* Errores detallados */}
          {importResult.errors && importResult.errors.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Errores Detallados
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {importResult.errors.map((error, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm"
                  >
                    <p className="font-semibold text-red-900 dark:text-red-100">
                      Fila {error.row}
                      {error.field && ` - Campo: ${error.field}`}
                    </p>
                    <p className="text-red-800 dark:text-red-200">{error.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg transition-colors"
            >
              Importar Otro Archivo
            </button>
            <button
              onClick={() => navigate('/gastos')}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
            >
              Ver Gastos Importados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
