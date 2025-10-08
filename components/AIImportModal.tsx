import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { MinistryActivity, Shift } from '../types';
import { XIcon, SparklesIcon } from './icons';

type ParsedActivity = Omit<MinistryActivity, 'id' | 'description' | 'reminder'>;

interface AIImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (activities: ParsedActivity[]) => void;
}

type Step = 'paste' | 'loading' | 'review' | 'error';

const AIImportModal: React.FC<AIImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [step, setStep] = useState<Step>('paste');
    const [pastedText, setPastedText] = useState('');
    const [parsedActivities, setParsedActivities] = useState<ParsedActivity[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setStep('paste');
            setPastedText('');
            setParsedActivities([]);
            setSelectedIndices(new Set());
            setErrorMessage('');
        }
    }, [isOpen]);

    const handleProcessText = async () => {
        if (!pastedText.trim()) {
            setErrorMessage("Por favor, pega algún texto para procesar.");
            setStep('error');
            return;
        }

        setStep('loading');
        setErrorMessage('');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: {
                            type: Type.STRING,
                            description: "La fecha de la actividad en formato AAAA-MM-DD.",
                        },
                        territory: {
                            type: Type.STRING,
                            description: "El nombre o número del territorio.",
                        },
                        leader: {
                            type: Type.STRING,
                            description: "El nombre de la persona que dirige el grupo.",
                        },
                        shift: {
                            type: Type.STRING,
                            description: "El turno de la actividad. Debe ser 'MORNING' para la mañana o 'AFTERNOON' para la tarde.",
                        },
                    },
                     required: ["date", "territory", "leader", "shift"],
                },
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Analiza el siguiente texto, que son datos de una hoja de cálculo sobre horarios de predicación. Extrae cada fila como un objeto JSON separado con los campos: "date", "territory", "leader" y "shift". Asegúrate de que la fecha esté en formato YYYY-MM-DD. Para el campo "shift", usa 'MORNING' para turnos de mañana y 'AFTERNOON' para turnos de tarde. Si no puedes determinar un campo, omítelo. Texto a analizar:\n\n---\n${pastedText}\n---`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });
            
            const resultText = response.text.trim();
            const parsed = JSON.parse(resultText) as ParsedActivity[];

            if (Array.isArray(parsed) && parsed.length > 0) {
                setParsedActivities(parsed);
                setSelectedIndices(new Set(parsed.map((_, index) => index)));
                setStep('review');
            } else {
                 setErrorMessage("No se pudieron encontrar actividades válidas en el texto proporcionado. Asegúrate de que los datos incluyan columnas claras para fecha, territorio, dirigente y turno.");
                 setStep('error');
            }

        } catch (error) {
            console.error("Error al procesar con Gemini:", error);
            setErrorMessage("Ocurrió un error al procesar tu solicitud. Por favor, revisa el formato de tu texto o inténtalo de nuevo más tarde.");
            setStep('error');
        }
    };

    const handleToggleSelection = (index: number) => {
        const newSelection = new Set(selectedIndices);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedIndices(newSelection);
    };

    const handleToggleSelectAll = () => {
        if (selectedIndices.size === parsedActivities.length) {
            setSelectedIndices(new Set());
        } else {
            setSelectedIndices(new Set(parsedActivities.map((_, i) => i)));
        }
    };
    
    const handleConfirmImport = () => {
        const activitiesToImport = parsedActivities.filter((_, index) => selectedIndices.has(index));
        onImport(activitiesToImport);
        onClose();
    };

    const renderContent = () => {
        switch (step) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center h-64">
                        <SparklesIcon className="h-12 w-12 text-primary animate-pulse" />
                        <p className="mt-4 text-textSecondary dark:text-darkTextSecondary font-medium">Procesando información...</p>
                    </div>
                );

            case 'error':
                return (
                    <div className="p-4 text-center">
                        <h3 className="text-xl font-bold text-red-500">Error</h3>
                        <p className="mt-2 mb-6 text-textSecondary dark:text-darkTextSecondary">{errorMessage}</p>
                        <button onClick={() => setStep('paste')} className="bg-primary text-white font-bold py-3 px-6 rounded-full transition-transform active:scale-95">
                            Intentar de Nuevo
                        </button>
                    </div>
                );

            case 'review':
                return (
                    <div className="p-1">
                        <h3 className="text-xl font-bold mb-4 text-textPrimary dark:text-darkTextPrimary px-3">Verificar Actividades</h3>
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto px-3 pb-2">
                           <div className="flex items-center justify-between py-2 border-b border-separator dark:border-darkSeparator mb-2">
                                <label className="flex items-center text-sm font-medium text-textSecondary dark:text-darkTextSecondary">
                                <input
                                    type="checkbox"
                                    checked={selectedIndices.size === parsedActivities.length}
                                    onChange={handleToggleSelectAll}
                                    className="h-5 w-5 rounded text-primary focus:ring-primary mr-3"
                                />
                                {selectedIndices.size === parsedActivities.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                </label>
                                <span className="text-sm font-semibold">{selectedIndices.size} de {parsedActivities.length}</span>
                           </div>
                            {parsedActivities.map((activity, index) => (
                                <div key={index} className={`flex items-start p-3 rounded-xl transition-colors ${selectedIndices.has(index) ? 'bg-primary/10' : 'bg-background dark:bg-darkBackground'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIndices.has(index)}
                                        onChange={() => handleToggleSelection(index)}
                                        className="h-5 w-5 rounded text-primary focus:ring-primary mr-4 mt-1"
                                    />
                                    <div className="flex-grow">
                                        <p className="font-bold text-textPrimary dark:text-darkTextPrimary">{activity.territory}</p>
                                        <p className="text-sm text-textSecondary dark:text-darkTextSecondary">Dirige: {activity.leader}</p>
                                        <div className="flex items-center text-xs mt-1.5 gap-2">
                                          <span className="font-semibold bg-gray-500/10 px-2 py-0.5 rounded-full">{new Date(activity.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                          <span className={`font-semibold px-2 py-0.5 rounded-full ${activity.shift === Shift.MORNING ? 'bg-blue-500/15 text-blue-600' : 'bg-orange-500/15 text-orange-600'}`}>
                                            {activity.shift === Shift.MORNING ? 'Mañana' : 'Tarde'}
                                          </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-3 mt-4 px-3">
                           <button onClick={handleConfirmImport} disabled={selectedIndices.size === 0} className="w-full bg-primary text-white font-bold py-3 px-5 rounded-full transition-transform active:scale-95 disabled:bg-gray-400 disabled:opacity-70">
                                Añadir {selectedIndices.size} seleccionadas
                           </button>
                           <button onClick={() => setStep('paste')} className="w-full bg-gray-500/15 text-textPrimary dark:text-darkTextPrimary font-bold py-3 px-5 rounded-full hover:bg-gray-500/25">
                                Atrás
                           </button>
                        </div>
                    </div>
                );
            
            case 'paste':
            default:
                return (
                    <div className="p-4">
                        <h3 className="text-xl font-bold mb-2 text-textPrimary dark:text-darkTextPrimary">Importar Horario con IA</h3>
                        <p className="text-sm text-textSecondary dark:text-darkTextSecondary mb-4">Pega aquí los datos de tu hoja de cálculo. La IA identificará la fecha, territorio, dirigente y turno de cada actividad.</p>
                        <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Ej: 15/07/2024, Territorio 23, Juan Pérez, Mañana..."
                            className="w-full h-48 p-3 border border-separator dark:border-darkSeparator rounded-xl bg-background dark:bg-darkBackground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            aria-label="Área de texto para pegar el horario"
                        />
                        <button onClick={handleProcessText} className="w-full mt-4 bg-primary text-white font-bold py-3 px-5 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95">
                            <SparklesIcon className="h-5 w-5" />
                            Procesar con IA
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div
                className={`bg-surface dark:bg-darkSurface shadow-xl rounded-3xl w-full max-w-md m-4 transform transition-all duration-300 ease-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-import-title"
            >
              <div className="p-3 flex justify-between items-center border-b border-separator dark:border-darkSeparator">
                <h2 id="ai-import-title" className="text-lg font-bold text-textPrimary dark:text-darkTextPrimary pl-2">Asistente de Importación</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Cerrar">
                    <XIcon className="h-6 w-6 text-textSecondary dark:text-darkTextSecondary" />
                </button>
              </div>
              <div className="py-4">
                {renderContent()}
              </div>
            </div>
        </div>
    );
};

export default AIImportModal;
