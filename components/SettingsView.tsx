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
        <h2 className="text-3xl font-bold text-white mb-8 px-2 tracking-tight drop-shadow-md">Configuración</h2>

        {/* General Settings */}
        <section className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-glass">
             <div className="px-6 py-5 border-b border-white/5">
                <h3 className="font-bold text-lg text-white">Objetivos</h3>
            </div>
            <div className="p-6">
                <div className="flex flex-col space-y-4">
                    <label htmlFor="monthlyGoal" className="text-xs font-bold text-textSecondary uppercase tracking-widest">Meta Mensual</label>
                    <div className="flex items-center gap-4 bg-black/20 border border-white/5 p-2 pr-6 rounded-2xl w-fit">
                         <input 
                            type="number" 
                            id="monthlyGoal" 
                            value={monthlyGoal} 
                            onChange={(e) => setMonthlyGoal(Math.max(1, parseInt(e.target.value) || 0))}
                            className="bg-white/5 border-none rounded-xl py-3 px-2 text-white font-bold text-3xl w-24 text-center focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                        />
                        <span className="text-textSecondary font-bold text-lg">horas</span>
                    </div>
                    <p className="text-sm text-textSecondary mt-1 leading-relaxed opacity-80">Este valor se usará para calcular tu progreso.</p>
                </div>
            </div>
        </section>

        {/* Data Management */}
        <section className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-glass">
             <div className="px-6 py-5 border-b border-white/5">
                <h3 className="font-bold text-lg text-white">Copia de Seguridad</h3>
            </div>
            <div className="p-6 space-y-8">
                <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-2xl text-primary-light border border-blue-500/20">
                            <ArchiveBoxArrowDownIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Exportar Datos</h4>
                            <p className="text-sm text-textSecondary mt-1">Descarga un archivo JSON con tu historial.</p>
                        </div>
                     </div>
                     <button 
                        onClick={onExportData}
                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 mt-2 border border-white/10"
                    >
                        Descargar Copia de Seguridad
                    </button>
                </div>

                 <div className="space-y-4 pt-6 border-t border-dashed border-white/10">
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl text-textSecondary border border-white/5">
                            <UploadIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Restaurar</h4>
                            <p className="text-sm text-textSecondary mt-1">Recupera tus datos desde un archivo.</p>
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
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-2xl border border-white/10 transition-all active:scale-95"
                    >
                        Seleccionar Archivo
                    </button>
                    {importStatus && <p className="text-sm text-green-400 font-bold text-center animate-pulse bg-green-900/20 p-3 rounded-xl border border-green-500/20">{importStatus}</p>}
                </div>
            </div>
        </section>
        
        <div className="text-center pt-8 opacity-40 pb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-textSecondary">Asistente v2.0 Pro</p>
        </div>
    </div>
  );
};

export default SettingsView;