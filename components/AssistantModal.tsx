
import React, { useState, useRef, useEffect } from 'react';
import { XIcon, PaperAirplaneIcon } from './icons';
import { GoogleGenAI } from "@google/genai";

interface AssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([
                { role: 'model', text: '¡Hola! Soy tu asistente teocrático personal. ¿En qué tema bíblico o asignación puedo ayudarte a razonar hoy? Mi base de conocimiento son las Escrituras y jw.org.' }
            ]);
        }
    }, [isOpen, messages.length]);

    const callGemini = async (prompt: string) => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            // Using standard model WITHOUT search tool to prevent mobile errors
            // and ensure high-quality reasoning based on internal knowledge.
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: "Actúa como un Asistente Teocrático, amable y respetuoso, diseñado para ayudar a Testigos de Jehová. Tu ÚNICA fuente de autoridad es la Biblia y el sitio web jw.org. \n\nREGLAS:\n1. Razona sobre los textos bíblicos y explícalos con lógica y sencillez.\n2. Usa ilustraciones prácticas como lo haría un maestro experimentado.\n3. NO inventes información ni uses fuentes externas.\n4. Si te preguntan por el texto diario, explica el tema basándote en el versículo, pero no inventes el comentario exacto si no lo tienes.\n5. Sé animador y positivo.\n6. NO uses herramientas externas (como Google Search), usa tu vasto conocimiento interno sobre la Biblia y las publicaciones.\n\nTu objetivo es ayudar al usuario a entender profundamente la información.",
                },
            });

            setMessages(prev => [...prev, { role: 'model', text: response.text || "Disculpa, no pude generar una respuesta en este momento." }]);
        } catch (error) {
            console.error("Error al llamar a la API de Gemini:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, hubo un error de conexión. Por favor, verifica tu internet o inténtalo de nuevo.' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSend = () => {
        const trimmedInput = userInput.trim();
        if (trimmedInput && !isLoading) {
            const newMessages: Message[] = [...messages, { role: 'user', text: trimmedInput }];
            setMessages(newMessages);
            setUserInput('');
            callGemini(trimmedInput);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        if (isLoading) return;
        setMessages(prev => [...prev, { role: 'user', text: suggestion }]);
        callGemini(suggestion);
    };

    const suggestions = [
        "Ayúdame con una introducción para predicar",
        "Explícame la parábola del hijo pródigo",
        "¿Cómo mostrar empatía en el ministerio?",
    ];

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div 
              className={`bg-surface dark:bg-darkSurface shadow-2xl w-full max-w-md h-[85vh] flex flex-col rounded-t-3xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} 
              onClick={e => e.stopPropagation()}
              aria-modal="true"
              role="dialog"
              aria-labelledby="assistant-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-separator dark:border-darkSeparator flex-shrink-0">
                    <h2 id="assistant-title" className="text-xl font-bold text-textPrimary dark:text-darkTextPrimary ml-2">Asistente Teocrático</h2>
                    <button onClick={onClose} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="Cerrar asistente">
                        <XIcon className="h-6 w-6 text-textSecondary dark:text-darkTextSecondary" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto">
                    <div className="space-y-6">
                        {messages.map((msg, index) => (
                           <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-white/5 text-textPrimary dark:text-darkTextPrimary rounded-bl-none border border-gray-100 dark:border-white/5'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] p-4 rounded-2xl bg-white dark:bg-white/5 text-textPrimary dark:text-darkTextPrimary rounded-bl-none shadow-sm border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                
                {messages.length < 3 && (
                  <div className="p-4 border-t border-separator dark:border-darkSeparator flex-shrink-0 bg-gray-50/50 dark:bg-black/20">
                       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {suggestions.map(suggestion => (
                              <button 
                                  key={suggestion}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  disabled={isLoading}
                                  className="bg-white dark:bg-white/5 text-primary dark:text-primary-light border border-primary/10 dark:border-white/10 text-sm font-medium px-4 py-2.5 rounded-2xl whitespace-nowrap hover:bg-primary/5 dark:hover:bg-white/10 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                              >
                                  {suggestion}
                              </button>
                          ))}
                      </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 bg-surface dark:bg-darkSurface flex-shrink-0 pb-safe">
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Pregunta sobre un tema bíblico..."
                            className="flex-grow appearance-none border border-separator dark:border-darkSeparator bg-gray-50 dark:bg-black/20 rounded-2xl w-full py-3.5 px-5 text-textPrimary dark:text-darkTextPrimary leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            disabled={isLoading}
                            aria-label="Escribe tu pregunta"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || userInput.trim() === ''}
                            className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-3.5 shadow-lg shadow-blue-500/30 disabled:bg-none disabled:bg-gray-300 disabled:shadow-none transition-all duration-200 active:scale-90 transform hover:scale-105 disabled:transform-none"
                            aria-label="Enviar mensaje"
                        >
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssistantModal;
