import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceInputReturn {
  isListening: boolean;
  /** Audio grabado, listo para enviar al backend (Whisper). */
  audioBlob: Blob | null;
  startListening: () => void;
  stopListening: () => void;
  resetRecording: () => void;
  isSupported: boolean;
  error: string | null;
}

/**
 * Graba audio del micrófono con MediaRecorder y expone el `Blob`.
 *
 * NO usa la Web Speech API del navegador (que dependía de los servidores
 * de Google y fallaba con `network`). La transcripción ocurre
 * **server-side** (Whisper, vía `POST /api/voice/process-audio`),
 * homologado con el bot de WhatsApp.
 */
export const useVoiceInput = (): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== 'undefined';

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('La grabación de audio no está soportada en este navegador');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // webm/opus es lo que produce Chrome por defecto; el backend
      // (OpenAI) acepta webm/ogg/mp4/wav. Si el navegador no soporta el
      // type pedido, MediaRecorder usa su default (mimeType vacío → ok).
      const preferred = 'audio/webm';
      const recorder =
        typeof MediaRecorder.isTypeSupported === 'function' &&
        MediaRecorder.isTypeSupported(preferred)
          ? new MediaRecorder(stream, { mimeType: preferred })
          : new MediaRecorder(stream);

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        stopStream();
        setIsListening(false);
        if (blob.size > 0) {
          setAudioBlob(blob);
        } else {
          setError('No se grabó audio. Intenta de nuevo.');
        }
      };

      recorder.onerror = () => {
        setError('Error durante la grabación de audio');
        setIsListening(false);
        stopStream();
      };

      recorderRef.current = recorder;
      recorder.start();
      setError(null);
      setIsListening(true);
    } catch (err) {
      // getUserMedia: permiso denegado / sin micrófono.
      const name = err instanceof DOMException ? err.name : '';
      const msg =
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'Permiso de micrófono denegado. Habilítalo en el navegador.'
          : name === 'NotFoundError'
            ? 'No se encontró un micrófono.'
            : 'No se pudo acceder al micrófono.';
      setError(msg);
      setIsListening(false);
      stopStream();
    }
  }, [isSupported, stopStream]);

  const stopListening = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stop(); // dispara onstop → arma el Blob
    }
  }, []);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setError(null);
  }, []);

  // Cleanup en unmount: detener grabación y liberar el micrófono.
  useEffect(() => {
    return () => {
      const rec = recorderRef.current;
      if (rec && rec.state !== 'inactive') rec.stop();
      stopStream();
    };
  }, [stopStream]);

  return {
    isListening,
    audioBlob,
    startListening,
    stopListening,
    resetRecording,
    isSupported,
    error,
  };
};
