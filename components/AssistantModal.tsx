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
                { role: 'model', text: '¡Hola! Soy tu asistente teocrático. ¿En qué puedo ayudarte hoy? Puedes pedirme el texto diario, técnicas de predicación o pautas basadas en principios bíblicos.' }
            ]);
        }
    }, [isOpen]);

    const callGemini = async (prompt: string) => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: "Eres un asistente servicial para Testigos de Jehová, llamado Asistente Teocrático. Tu propósito es proporcionar información útil y alentadora basada en los principios de la Biblia y las publicaciones que se encuentran en jw.org. Sé siempre positivo, respetuoso y práctico. Nunca expreses opiniones personales. Cuando te pidan el texto diario, usa la herramienta de búsqueda para encontrar el de 'Examinando las Escrituras Diariamente' del día actual y preséntalo claramente con la cita y el comentario.",
                    tools: [{ googleSearch: {} }],
                },
            });

            setMessages(prev => [...prev, { role: 'model', text: response.text }]);
        } catch (error) {
            console.error("Error al llamar a la API de Gemini:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, he tenido un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.' }]);
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
        setMessages(prev => [...prev, { role: 'user', text: suggestion }]);
        callGemini(suggestion);
    };

    const suggestions = [
        "Texto Diario de Hoy",
        "Técnica de predicación",
        "Cómo iniciar una conversación",
    ];

    return (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div 
              className={`bg-surface dark:bg-darkSurface shadow-xl w-full max-w-md h-[85vh] flex flex-col rounded-t-3xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} 
              onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-separator dark:border-darkSeparator flex-shrink-0">
                    <h2 className="text-xl font-bold text-textPrimary dark:text-darkTextPrimary">Asistente Teocrático</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <XIcon className="h-6 w-6 text-textSecondary dark:text-darkTextSecondary" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white rounded-br-lg' : 'bg-background dark:bg-darkBackground text-textPrimary dark:text-darkTextPrimary rounded-bl-lg'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] p-3 rounded-2xl bg-background dark:bg-darkBackground text-textPrimary dark:text-darkTextPrimary rounded-bl-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-textSecondary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-textSecondary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-textSecondary rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                
                {/* Suggestions */}
                <div className="p-4 border-t border-separator dark:border-darkSeparator flex-shrink-0">
                     <div className="flex gap-2 overflow-x-auto pb-2">
                        {suggestions.map(suggestion => (
                            <button 
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="p-4 bg-background dark:bg-darkBackground flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe tu pregunta..."
                            className="flex-grow appearance-none border border-separator dark:border-darkSeparator rounded-full w-full py-3 px-5 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || userInput.trim() === ''}
                            className="bg-primary text-white rounded-full p-3.5 shadow-lg shadow-primary/40 disabled:bg-gray-400 disabled:shadow-none transition-all duration-200 active:scale-95 transform hover:scale-105"
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