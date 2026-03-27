import { useState, useRef } from "react";
import { Download, Upload, Settings } from "lucide-react";
import { useTracker } from "@/hooks/use-tracker";

export function BackupRestore() {
  const { exportData, importData, resetAll } = useTracker();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        alert("Data restored successfully!");
        setIsOpen(false);
      } else {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-card border border-border shadow-xl rounded-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 pb-3 border-b border-border/50 mb-2">
            <h3 className="font-semibold text-sm">System Settings</h3>
          </div>
          
          <button
            onClick={exportData}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Download Backup
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-sm flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            Restore Backup
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          
          <div className="mt-2 pt-2 border-t border-border/50">
            <button
              onClick={resetAll}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm flex items-center gap-2 text-destructive transition-colors"
            >
              Reset All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
