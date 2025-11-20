
import React, { useRef, useState } from 'react';
import { ArchiveBoxArrowDownIcon, UploadIcon } from './icons';

interface SettingsViewProps {
  monthlyGoal: number;
  setMonthlyGoal: (goal: number) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ monthlyGoal, setMonthlyGoal, onExportData, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setImportStatus('');
      if(e.target.files && e.target.files.length > 0) {
          onImportData(e);
          setImportStatus('Datos importados correctamente. La app se recargará...');
      }
  };

  return (
    <div className="px-4 py-2 space-y-6 animate-fade-in pb-32">
        <h2 className="text-3xl font-bold text-textPrimary dark:text-darkTextPrimary mb-8 px-2 tracking-tight">Configuración</h2>

        {/* General Settings */}
        <section className="bg-white dark:bg-[#1C1C1E] shadow-soft dark:shadow-none border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden">
             <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
                <h3 className="font-bold text-lg text-textPrimary dark:text-darkTextPrimary">Objetivos</h3>
            </div>
            <div className="p-6">
                <div className="flex flex-col space-y-4">
                    <label htmlFor="monthlyGoal" className="text-xs font-bold text-textSecondary dark:text-darkTextSecondary uppercase tracking-widest">Meta Mensual</label>
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-black/20 p-2 pr-6 rounded-2xl w-fit">
                         <input 
                            type="number" 
                            id="monthlyGoal" 
                            value={monthlyGoal} 
                            onChange={(e) => setMonthlyGoal(Math.max(1, parseInt(e.target.value) || 0))}
                            className="bg-white dark:bg-white/5 border-none rounded-xl py-3 px-2 text-textPrimary dark:text-darkTextPrimary font-bold text-3xl w-24 text-center focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                        <span className="text-textSecondary dark:text-darkTextSecondary font-bold text-lg">horas</span>
                    </div>
                    <p className="text-sm text-textSecondary dark:text-darkTextSecondary mt-1 leading-relaxed">Este valor se usará para calcular tu progreso en el Registro de Servicio.</p>
                </div>
            </div>
        </section>

        {/* Data Management */}
        <section className="bg-white dark:bg-[#1C1C1E] shadow-soft dark:shadow-none border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden">
             <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
                <h3 className="font-bold text-lg text-textPrimary dark:text-darkTextPrimary">Copia de Seguridad</h3>
            </div>
            <div className="p-6 space-y-8">
                <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-primary">
                            <ArchiveBoxArrowDownIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-textPrimary dark:text-darkTextPrimary text-lg">Exportar Datos</h4>
                            <p className="text-sm text-textSecondary dark:text-darkTextSecondary mt-1">Descarga un archivo JSON con todo tu historial.</p>
                        </div>
                     </div>
                     <button 
                        onClick={onExportData}
                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 mt-2"
                    >
                        Descargar Copia de Seguridad
                    </button>
                </div>

                 <div className="space-y-4 pt-6 border-t border-dashed border-gray-200 dark:border-white/10">
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-100 dark:bg-white/10 rounded-2xl text-textSecondary dark:text-darkTextSecondary">
                            <UploadIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-textPrimary dark:text-darkTextPrimary text-lg">Restaurar</h4>
                            <p className="text-sm text-textSecondary dark:text-darkTextSecondary mt-1">Recupera tus datos desde un archivo.</p>
                        </div>
                     </div>
                     
                     <input 
                        type="file" 
                        accept=".json" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                     <button 
                        onClick={handleImportClick}
                        className="w-full bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-textPrimary dark:text-darkTextPrimary font-bold py-4 px-6 rounded-2xl border border-gray-200 dark:border-white/10 transition-all active:scale-95"
                    >
                        Seleccionar Archivo
                    </button>
                    {importStatus && <p className="text-sm text-green-600 font-bold text-center animate-pulse bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">{importStatus}</p>}
                </div>
            </div>
        </section>
        
        <div className="text-center pt-8 opacity-40 pb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-textSecondary dark:text-darkTextSecondary">Asistente del Ministerio v2.0</p>
        </div>
    </div>
  );
};

export default SettingsView;
