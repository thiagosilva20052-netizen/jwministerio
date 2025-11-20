import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { MinistryActivity, Shift } from '../types';
import { XIcon, SparklesIcon, PencilIcon, AlertTriangleIcon, CheckIcon } from './icons';

// Add tempId for keys, and optional fields for review process
type ParsedActivity = Omit<MinistryActivity, 'id' | 'description' | 'reminder'> & {
    tempId: string;
    needsReview?: boolean;
    notes?: string;
};

interface AIImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (activities: Omit<MinistryActivity, 'id'>[]) => void;
}

type Step = 'upload' | 'loading' | 'review' | 'error';

const InlineEditor: React.FC<{
    activity: ParsedActivity;
    onSave: (activity: ParsedActivity) => void;
    onCancel: () => void;
}> = ({ activity, onSave, onCancel }) => {
    const [editedActivity, setEditedActivity] = useState(activity);

    const handleFieldChange = (field: keyof Omit<ParsedActivity, 'tempId'>, value: string) => {
        setEditedActivity(prev => ({ ...prev, [field]: value }));
    };
    
    const isValidDate = (dateString: string): boolean => {
        return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !isNaN(new Date(dateString).getTime());
    };

    const canSave = editedActivity.territory && editedActivity.leader && isValidDate(editedActivity.date);

    return (
        <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 space-y-3 animate-[fade-in_0.3s_ease-out]">
            <h4 className="font-bold text-textPrimary dark:text-darkTextPrimary">Corregir Actividad</h4>
            <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-medium mb-1" htmlFor={`date-${activity.tempId}`}>Fecha (AAAA-MM-DD)</label>
                    <input id={`date-${activity.tempId}`} type="date" value={editedActivity.date} onChange={e => handleFieldChange('date', e.target.value)} required className="appearance-none border border-separator dark:border-darkSeparator rounded-lg w-full py-2 px-3 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                 </div>
                 <div>
                    <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-medium mb-1" htmlFor={`shift-${activity.tempId}`}>Turno</label>
                    <select id={`shift-${activity.tempId}`} value={editedActivity.shift} onChange={e => handleFieldChange('shift', e.target.value as Shift)} className="appearance-none border border-separator dark:border-darkSeparator rounded-lg w-full py-2 px-3 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                        <option value={Shift.MORNING}>Mañana</option>
                        <option value={Shift.AFTERNOON}>Tarde</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-medium mb-1" htmlFor={`territory-${activity.tempId}`}>Territorio</label>
                <input id={`territory-${activity.tempId}`} type="text" value={editedActivity.territory} onChange={e => handleFieldChange('territory', e.target.value)} required className="appearance-none border border-separator dark:border-darkSeparator rounded-lg w-full py-2 px-3 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
                <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-medium mb-1" htmlFor={`leader-${activity.tempId}`}>Dirige</label>
                <input id={`leader-${activity.tempId}`} type="text" value={editedActivity.leader} onChange={e => handleFieldChange('leader', e.target.value)} required className="appearance-none border border-separator dark:border-darkSeparator rounded-lg w-full py-2 px-3 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div className="flex justify-end items-center gap-3 pt-2">
                <button type="button" onClick={onCancel} className="bg-gray-500/15 text-textSecondary dark:text-darkTextSecondary font-bold py-2 px-4 rounded-xl hover:bg-gray-500/25 text-sm transition-colors">Cancelar</button>
                <button type="button" onClick={() => onSave(editedActivity)} disabled={!canSave} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-transform active:scale-95 text-sm disabled:bg-gray-400 disabled:opacity-70 flex items-center gap-1.5">
                    <CheckIcon className="h-4 w-4" /> Guardar
                </button>
            </div>
        </div>
    );
};


const AIImportModal: React.FC<AIImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [step, setStep] = useState<Step>('upload');
    const [inputText, setInputText] = useState('');
    const [parsedActivities, setParsedActivities] = useState<ParsedActivity[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [errorMessage, setErrorMessage] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStep('upload');
            setInputText('');
            setParsedActivities([]);
            setSelectedIndices(new Set());
            setErrorMessage('');
            setEditingIndex(null);
        }
    }, [isOpen]);

    const handleProcessText = async () => {
        if (!inputText.trim()) {
            setErrorMessage("Por favor, pega el texto de tu horario para procesarlo.");
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
                        date: { type: Type.STRING, description: "La fecha de la actividad. Intenta convertir a formato AAAA-MM-DD. Si es ambiguo (ej. 'Martes'), déjalo como está." },
                        territory: { type: Type.STRING, description: "El nombre o número del territorio." },
                        leader: { type: Type.STRING, description: "El nombre de la persona que dirige el grupo." },
                        shift: { type: Type.STRING, description: "El turno. Intenta normalizar a 'MORNING' o 'AFTERNOON'. Si no es claro, déjalo como está (ej. '8am')." },
                        needsReview: { type: Type.BOOLEAN, description: "Establecer en true si la 'date' o el 'shift' no se pudieron normalizar con certeza o si falta algún campo requerido." },
                        notes: { type: Type.STRING, description: "Una breve nota explicando por qué el elemento necesita revisión (ej. 'Formato de fecha no estándar')." },
                    },
                     required: ["date", "territory", "leader", "shift"],
                },
            };

            const prompt = `Analiza el siguiente texto de un horario de predicación. Extrae cada actividad como un objeto JSON.
- **date**: Intenta convertir la fecha al formato AAAA-MM-DD. Si la fecha es ambigua (ej. 'próximo martes'), déjala como está.
- **territory**: El nombre/número del territorio.
- **leader**: El nombre del dirigente.
- **shift**: Intenta normalizar el turno a 'MORNING' o 'AFTERNOON'. Si no es claro (ej. '8am'), déjalo como está.
- **needsReview**: Pon 'true' si no estás seguro de la fecha o el turno, o si falta algún dato.
- **notes**: Si 'needsReview' es true, explica brevemente por qué (ej. 'Fecha ambigua', 'Turno no reconocido').
Ignora cualquier texto que no sea una actividad de predicación. Texto del horario:\n\n${inputText}`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: responseSchema },
            });
            
            const resultText = response.text.trim();
            const parsed = JSON.parse(resultText) as Omit<ParsedActivity, 'tempId'>[];

            if (Array.isArray(parsed) && parsed.length > 0) {
                const activitiesWithIds = parsed.map(p => ({ ...p, tempId: crypto.randomUUID() }));
                setParsedActivities(activitiesWithIds);
                setSelectedIndices(new Set(activitiesWithIds.map((_, index) => index)));
                setStep('review');
            } else {
                 setErrorMessage("No se pudieron encontrar actividades válidas en el texto. Asegúrate de que el formato contenga una tabla o lista clara con fecha, territorio, dirigente y turno.");
                 setStep('error');
            }

        } catch (error) {
            console.error("Error al procesar con Gemini:", error);
            setErrorMessage("Ocurrió un error al procesar tu texto. Por favor, asegúrate de que el formato sea correcto o inténtalo de nuevo más tarde.");
            setStep('error');
        }
    };

    const handleToggleSelection = (index: number) => {
        if (editingIndex === index) return;
        const newSelection = new Set(selectedIndices);
        newSelection.has(index) ? newSelection.delete(index) : newSelection.add(index);
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
        const activitiesToImport = parsedActivities
            .filter((_, index) => selectedIndices.has(index))
            .map(({ tempId, needsReview, notes, ...rest }) => rest);
        onImport(activitiesToImport);
        onClose();
    };
    
    const handleSaveEdit = (index: number, updatedActivity: ParsedActivity) => {
        const newActivities = [...parsedActivities];
        newActivities[index] = { ...updatedActivity, needsReview: false, notes: undefined };
        setParsedActivities(newActivities);
        setEditingIndex(null);
    };

    const renderContent = () => {
        switch (step) {
            case 'loading': return (
                <div className="flex flex-col items-center justify-center h-64"><SparklesIcon className="h-12 w-12 text-primary animate-pulse" /><p className="mt-4 text-textSecondary dark:text-darkTextSecondary font-medium">Procesando texto...</p></div>
            );
            case 'error': return (
                <div className="p-4 text-center"><h3 className="text-xl font-bold text-red-500">Error</h3><p className="mt-2 mb-6 text-textSecondary dark:text-darkTextSecondary">{errorMessage}</p><button onClick={() => setStep('upload')} className="bg-primary text-white font-bold py-3.5 px-6 rounded-2xl transition-transform active:scale-95">Intentar de Nuevo</button></div>
            );
            case 'review':
                const isAnySelectedNeedReview = parsedActivities.some((activity, index) => selectedIndices.has(index) && activity.needsReview);
                return (
                    <div className="p-1">
                        <h3 className="text-xl font-bold mb-2 text-textPrimary dark:text-darkTextPrimary px-3">Verificar Actividades</h3>
                        <p className="text-sm text-textSecondary dark:text-darkTextSecondary mb-4 px-3">Selecciona las actividades para importar. Edita las que necesiten corrección.</p>
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto px-3 pb-2">
                           <div className="flex items-center justify-between py-2 border-b border-separator dark:border-darkSeparator mb-2">
                                <label className="flex items-center text-sm font-medium text-textSecondary dark:text-darkTextSecondary"><input type="checkbox" checked={selectedIndices.size === parsedActivities.length && parsedActivities.length > 0} onChange={handleToggleSelectAll} className="h-5 w-5 rounded text-primary focus:ring-primary mr-3" />{selectedIndices.size === parsedActivities.length ? 'Deseleccionar todo' : 'Seleccionar todo'}</label><span className="text-sm font-semibold">{selectedIndices.size} de {parsedActivities.length}</span>
                           </div>
                            {parsedActivities.map((activity, index) => editingIndex === index ? (
                                <InlineEditor key={activity.tempId} activity={activity} onSave={(updated) => handleSaveEdit(index, updated)} onCancel={() => setEditingIndex(null)} />
                            ) : (
                                <div key={activity.tempId}>
                                    <div className={`p-3 rounded-2xl transition-colors ${activity.needsReview ? 'bg-amber-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                        <div className="flex items-start" onClick={() => handleToggleSelection(index)}>
                                            <input type="checkbox" readOnly checked={selectedIndices.has(index)} className={`h-5 w-5 rounded text-primary focus:ring-primary mr-4 mt-1 pointer-events-none ${editingIndex === index ? 'opacity-50' : ''}`} />
                                            <div className="flex-grow">
                                                <p className="font-bold text-textPrimary dark:text-darkTextPrimary">{activity.territory}</p>
                                                <p className="text-sm text-textSecondary dark:text-darkTextSecondary">Dirige: {activity.leader}</p>
                                                <div className="flex items-center text-xs mt-1.5 gap-2 flex-wrap">
                                                    <span className={`font-semibold px-2 py-0.5 rounded-full ${activity.needsReview ? 'bg-amber-500/20 text-amber-700' : 'bg-gray-100 dark:bg-white/10 text-textSecondary'}`}>{activity.date}</span>
                                                    <span className={`font-semibold px-2 py-0.5 rounded-full ${activity.shift === Shift.MORNING ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-orange-500/15 text-orange-600 dark:text-orange-400'}`}>{activity.shift === Shift.MORNING ? 'Mañana' : activity.shift === Shift.AFTERNOON ? 'Tarde' : activity.shift}</span>
                                                </div>
                                            </div>
                                            {activity.needsReview && (
                                                <button onClick={(e) => { e.stopPropagation(); setEditingIndex(index); }} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ml-2 flex-shrink-0"><PencilIcon className="h-5 w-5 text-amber-600" /></button>
                                            )}
                                        </div>
                                    </div>
                                    {activity.needsReview && activity.notes && (
                                        <div className="ml-9 mt-1 flex items-start gap-2 bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-medium p-2 rounded-lg">
                                            <AlertTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" /><span>{activity.notes}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-3 mt-4 px-3">
                           <div className="relative w-full">
                                <button 
                                    onClick={handleConfirmImport} 
                                    disabled={selectedIndices.size === 0 || isAnySelectedNeedReview} 
                                    className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:bg-none disabled:bg-gray-300 disabled:shadow-none disabled:opacity-70"
                                >
                                    Añadir {selectedIndices.size} seleccionadas
                                </button>
                                {isAnySelectedNeedReview && <p className="text-xs text-center mt-2 text-amber-600 font-medium">Corrige los elementos marcados antes de importar.</p>}
                           </div>
                           <button onClick={() => setStep('upload')} className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-textPrimary dark:text-darkTextPrimary font-bold py-3.5 px-5 rounded-2xl transition-all active:scale-95">Atrás</button>
                        </div>
                    </div>
                );
            case 'upload':
            default: return (
                <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 text-textPrimary dark:text-darkTextPrimary">Importar Horario con IA</h3>
                    <p className="text-sm text-textSecondary dark:text-darkTextSecondary mb-6">Pega el texto de tu horario (desde Excel, un mensaje, etc.) y la IA extraerá las actividades.</p>
                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} rows={8} className="appearance-none border border-transparent bg-gray-50 dark:bg-black/20 rounded-2xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Pega tu horario aquí..." />
                    <button 
                        onClick={handleProcessText} 
                        disabled={!inputText.trim()} 
                        className="w-full mt-6 bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-none disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <SparklesIcon className="h-5 w-5" />Procesar Texto
                    </button>
                </div>
            );
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div className={`bg-surface dark:bg-darkSurface shadow-2xl rounded-3xl w-full max-w-md m-4 transform transition-all duration-300 ease-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="ai-import-title">
              <div className="p-4 flex justify-between items-center border-b border-separator dark:border-darkSeparator">
                <h2 id="ai-import-title" className="text-lg font-bold text-textPrimary dark:text-darkTextPrimary pl-1">Asistente de Importación</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="Cerrar"><XIcon className="h-6 w-6 text-textSecondary dark:text-darkTextSecondary" /></button>
              </div>
              <div className="py-2 pb-6">{renderContent()}</div>
            </div>
        </div>
    );
};

export default AIImportModal;