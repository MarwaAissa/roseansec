import React, { useState } from 'react';
import { LogEvent } from '../types';
import { 
  Search, 
  ShieldAlert, 
  BadgeCheck, 
  Filter, 
  ArrowLeft, 
  ArrowRight, 
  UploadCloud, 
  FileSpreadsheet, 
  Sliders, 
  PlusCircle, 
  Trash2, 
  CheckCircle2,
  Download
} from 'lucide-react';

interface LogViewerProps {
  logs: LogEvent[];
  totalLogs: number;
  detectionConfig: {
    maxAttempts: number;
    windowMinutes: number;
    whitelistedIps: string[];
  } | null;
  onUpdateConfig: (config: any) => Promise<any>;
  onImportLogs: (importedLogs: any[]) => Promise<any>;
  onGenerateLogs: (count: number) => Promise<any>;
}

export default function LogViewer({ 
  logs, 
  totalLogs, 
  detectionConfig, 
  onUpdateConfig, 
  onImportLogs,
  onGenerateLogs
}: LogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Configuration States
  const [maxAttempts, setMaxAttempts] = useState(detectionConfig?.maxAttempts || 5);
  const [windowMinutes, setWindowMinutes] = useState(detectionConfig?.windowMinutes || 5);
  const [newWhiteIp, setNewWhiteIp] = useState('');
  const [whitelist, setWhitelist] = useState<string[]>(detectionConfig?.whitelistedIps || ['192.168.1.10', '196.200.128.5']);
  
  // Generation & Upload States
  const [genCount, setGenCount] = useState<number>(10000);
  const [isUpdating, setIsUpdating] = useState(false);
  const [importNotice, setImportNotice] = useState<{ text: string; isError: boolean } | null>(null);

  // Filter logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await onUpdateConfig({
        maxAttempts: Number(maxAttempts),
        windowMinutes: Number(windowMinutes),
        whitelistedIps: whitelist
      });
      if (res.success) {
        setImportNotice({ text: 'Configuration mise à jour avec succès.', isError: false });
        setTimeout(() => setImportNotice(null), 4000);
      }
    } catch (err: any) {
      setImportNotice({ text: `Erreur : ${err.message}`, isError: true });
    }
  };

  const handleAddWhitelistIp = () => {
    const ip = newWhiteIp.trim();
    if (ip && !whitelist.includes(ip)) {
      const updated = [...whitelist, ip];
      setWhitelist(updated);
      setNewWhiteIp('');
    }
  };

  const handleRemoveWhitelistIp = (ipToRemove: string) => {
    const updated = whitelist.filter(ip => ip !== ipToRemove);
    setWhitelist(updated);
  };

  // CSV Parsing logic
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportNotice(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          setImportNotice({ text: "Fichier CSV trop court ou vide.", isError: true });
          return;
        }

        // Detect columns from first header row
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const ipIdx = headers.findIndex(h => h.includes('ip') || h.includes('adresse'));
        const userIdx = headers.findIndex(h => h.includes('user') || h.includes('util') || h.includes('compte') || h.includes('name'));
        const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('success') || h.includes('statut') || h.includes('etat'));
        const countryIdx = headers.findIndex(h => h.includes('country') || h.includes('pays') || h.includes('pos'));
        const uaIdx = headers.findIndex(h => h.includes('agent') || h.includes('browser') || h.includes('ua'));
        const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('date') || h.includes('horodatage'));

        const importedLogsList: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
          if (cols.length < 2) continue;

          // Build valid trace log event
          importedLogsList.push({
            ip: ipIdx !== -1 && cols[ipIdx] ? cols[ipIdx] : '185.220.101.1',
            username: userIdx !== -1 && cols[userIdx] ? cols[userIdx] : 'admin',
            status: statusIdx !== -1 && cols[statusIdx] 
              ? (['SUCCESS', 'SUCCES', 'SAY'].includes(cols[statusIdx].toUpperCase()) ? 'SUCCESS' : 'FAILURE')
              : 'FAILURE',
            country: countryIdx !== -1 && cols[countryIdx] ? cols[countryIdx] : 'Russie',
            userAgent: uaIdx !== -1 && cols[uaIdx] ? cols[uaIdx] : 'Mozilla/5.0 SSH-Bruter/v4',
            timestamp: timeIdx !== -1 && cols[timeIdx] ? cols[timeIdx] : new Date().toISOString()
          });
        }

        if (importedLogsList.length === 0) {
          setImportNotice({ text: "Aucune ligne valide trouvée dans votre CSV.", isError: true });
          return;
        }

        const res = await onImportLogs(importedLogsList);
        if (res.success) {
          setImportNotice({ text: res.message, isError: false });
        } else {
          setImportNotice({ text: "Erreur pendant le traitement des lignes du CSV.", isError: true });
        }
      } catch (err: any) {
        setImportNotice({ text: `Erreur critique de parsing CSV : ${err.message}`, isError: true });
      }
    };
    reader.readAsText(file);
  };

  const downloadCsvTemplate = () => {
    const csvContent = `timestamp,ip,country,username,status,userAgent
2026-05-28T02:11:00Z,185.220.101.1,Russie,admin,FAILURE,Hydra/8.6
2026-05-28T02:11:15Z,185.220.101.1,Russie,admin,FAILURE,Hydra/8.6
2026-05-28T02:11:32Z,185.220.101.1,Russie,admin,FAILURE,Hydra/8.6
2026-05-28T02:11:45Z,185.220.101.1,Russie,admin,FAILURE,Hydra/8.6
2026-05-28T02:12:02Z,185.220.101.1,Russie,admin,FAILURE,Hydra/8.6
2026-05-28T03:40:00Z,41.142.12.45,Maroc,yassine,SUCCESS,Mozilla/5.0 Chrome
2026-05-28T04:15:00Z,45.33.22.19,Chine,root,FAILURE,Python-urllib/3.11`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "roseansec-bruteforce-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerGeneration = async () => {
    setIsUpdating(true);
    setImportNotice(null);
    try {
      const res = await onGenerateLogs(genCount);
      if (res.success) {
        setImportNotice({ 
          text: `Générateur : ${res.summary.total.toLocaleString()} logs chargés ! (${res.summary.alertsCritical} attaques critiques détectées)`, 
          isError: false 
        });
      }
    } catch (err: any) {
      setImportNotice({ text: `Échec génération : ${err.message}`, isError: true });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      {/* Left side: Parametric Adjustments and Import Widgets */}
      <div className="xl:col-span-4 flex flex-col gap-5">
        
        {/* Detection Parameters Panel */}
        <div className="bg-brand-card p-4 rounded-xl border border-brand-border flex flex-col gap-4 font-mono select-none">
          <h4 className="font-display font-medium text-brand-rose text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-brand-border/40">
            <Sliders className="w-4 h-4 text-brand-rose" />
            PARAMÈTRES DE DÉTECTION (COURS)
          </h4>

          <div className="space-y-4 text-xs">
            {/* Limit sliding attempts slider */}
            <div>
              <div className="flex justify-between text-gray-400 mb-1 text-[11px]">
                <span>Tentatives max manquées :</span>
                <span className="text-brand-rose font-bold">{maxAttempts} échecs</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="20" 
                value={maxAttempts} 
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1E131D] accent-[#800020] rounded-lg cursor-pointer"
              />
            </div>

            {/* Interval Minutes window slider */}
            <div>
              <div className="flex justify-between text-gray-400 mb-1 text-[11px]">
                <span>Fenêtre de calcul (Minutes) :</span>
                <span className="text-brand-rose font-bold">{windowMinutes} min</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={windowMinutes} 
                onChange={(e) => setWindowMinutes(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1E131D] accent-[#800020] rounded-lg cursor-pointer"
              />
            </div>

            {/* IP Whitelisting input control */}
            <div className="pt-2 border-t border-brand-border/30">
              <label className="text-[10px] uppercase text-gray-400 block mb-1">
                Liste Blanche d'IPs de confiance (Whitelistées) :
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Ex : 192.168.1.50"
                  value={newWhiteIp}
                  onChange={(e) => setNewWhiteIp(e.target.value)}
                  className="bg-[#1E131D] text-xs font-mono text-white p-2 rounded border border-brand-border flex-1 focus:border-brand-rose outline-none"
                />
                <button 
                  onClick={handleAddWhitelistIp}
                  className="bg-brand-burgundy hover:bg-brand-rose p-2 rounded text-white transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              {/* IP Labels list */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {whitelist.length === 0 ? (
                  <span className="text-[10px] text-gray-500 italic">Aucune IP de confiance.</span>
                ) : (
                  whitelist.map(ip => (
                    <span key={ip} className="inline-flex items-center gap-1 bg-[#2D1623] hover:bg-[#3C1B2E] border border-[#FFB6C1]/20 px-2 py-0.5 rounded text-[10px] text-brand-rose">
                      {ip}
                      <button 
                        onClick={() => handleRemoveWhitelistIp(ip)}
                        className="hover:text-red-400 font-bold ml-1 text-[9px] cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              className="w-full bg-brand-burgundy hover:bg-[#960F34] text-white py-2 rounded-lg font-mono text-[11px] font-semibold transition-all shadow border border-brand-border cursor-pointer mt-2"
            >
              Appliquer la Configuration de Sécurité
            </button>
          </div>
        </div>

        {/* Big Data Logistics generator Controls */}
        <div className="bg-brand-card p-4 rounded-xl border border-brand-border flex flex-col gap-4 font-mono select-none">
          <h4 className="font-display font-medium text-brand-rose text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-brand-border/40">
            Volume de Logs
          </h4>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Configurez la taille du jeu de logs (jusqu'à 100 000 logs d'enregistrements).
          </p>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-3 gap-2">
              {[1000, 10000, 100000].map(val => (
                <button
                  key={val}
                  onClick={() => setGenCount(val)}
                  className={`py-1.5 rounded text-[11px] transition-all border font-semibold cursor-pointer ${
                    genCount === val 
                      ? 'bg-brand-burgundy text-white border-brand-rose'
                      : 'bg-[#1E131D] text-gray-400 border-brand-border hover:text-white'
                  }`}
                >
                  {val.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={triggerGeneration}
              disabled={isUpdating}
              className="w-full bg-[#1A1118] hover:bg-[#341F2E] text-brand-rose py-2 rounded-lg font-mono text-[11px] border border-brand-rose/30 font-semibold cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              Générer {genCount.toLocaleString()} Logs
            </button>
          </div>
        </div>

        {/* Real-time CSV Security Logs Importer */}
        <div className="bg-brand-card p-4 rounded-xl border border-brand-border flex flex-col gap-3 font-mono">
          <h4 className="font-display font-medium text-brand-rose text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-brand-border/40">
            <UploadCloud className="w-4 h-4 text-brand-rose" />
            IMPORT DE LOGS REELS (CSV)
          </h4>
          <p className="text-[11px] text-gray-400 leading-normal">
            Téléversez un fichier CSV de logs d'audit externe de vos firewalls pour les soumettre au moteur de détection RoseanSec.
          </p>

          <div className="space-y-3 text-xs">
            {/* Custom file inputs widget */}
            <div className="border border-dashed border-brand-border/80 hover:border-brand-rose duration-200 transition-all rounded-lg p-3.5 text-center relative cursor-pointer group bg-[#150D14]">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleCsvImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-7 h-7 mx-auto text-gray-500 group-hover:text-brand-rose duration-200 mb-2" />
              <span className="text-[11px] block text-gray-300 font-semibold">Déposer votre fichier CSV</span>
              <span className="text-[9px] text-gray-500 font-mono mt-0.5 block">ou cliquer pour parcourir</span>
            </div>

            {/* Template generator buttons */}
            <button
              onClick={downloadCsvTemplate}
              className="w-full bg-black/30 hover:bg-[#1E131D] text-gray-400 hover:text-white py-1.5 rounded text-[10px] font-mono border border-brand-border/60 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger un gabarit CSV de test
            </button>
          </div>
        </div>

        {/* Notices box alerts */}
        {importNotice && (
          <div className={`p-3 rounded-lg border font-mono text-[11px] leading-relaxed flex items-start gap-2 ${
            importNotice.isError 
              ? 'bg-red-950/20 border-red-500/25 text-red-300' 
              : 'bg-green-950/20 border-green-500/25 text-green-300'
          }`}>
            <span className="font-bold">{importNotice.isError ? '[!]' : '[OK]'}</span>
            <div>{importNotice.text}</div>
          </div>
        )}

      </div>

      {/* Right side: Real Logs Feed with Filters */}
      <div className="xl:col-span-8 bg-brand-card p-5 rounded-xl border border-brand-border flex flex-col gap-4">
        
        {/* Header toolbar stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h3 className="font-display font-medium text-white text-sm uppercase flex items-center gap-2">
              EXTRAITS ET ANALYSES DES INCIDENTS BRUTS
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Filtre actif : {filteredLogs.length} affichés sur {totalLogs.toLocaleString()} enregistrements.
            </p>
          </div>

          {/* Filters Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status buttons */}
            <div className="flex bg-[#1E131D] p-1 rounded-lg border border-brand-border text-[11px] font-mono">
              <button
                onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-brand-burgundy text-white font-semibold'
                    : 'text-gray-400 hover:text-[#FFB6C1]'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => { setStatusFilter('SUCCESS'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded transition-all flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'SUCCESS'
                    ? 'bg-green-800/60 text-white font-semibold'
                    : 'text-gray-400 hover:text-green-300'
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5 text-green-400" />
                Réussis
              </button>
              <button
                onClick={() => { setStatusFilter('FAILURE'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded transition-all flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'FAILURE'
                    ? 'bg-rose-950 text-rose-300 font-semibold'
                    : 'text-gray-400 hover:text-rose-400'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Échecs
              </button>
            </div>

            {/* Search box */}
            <div className="relative">
              <input
                type="text"
                placeholder="IP, compte, pays..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-[#1E131D] text-xs font-mono text-white pl-8 pr-3 py-1.5 rounded-lg border border-brand-border focus:border-brand-rose outline-none w-[170px] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto border border-brand-border/60 rounded-lg">
          <table className="w-full text-left border-collapse text-[11px] font-mono">
            <thead>
              <tr className="bg-[#1E131D] border-b border-brand-border select-none text-[10px] text-[#FFB6C1] uppercase tracking-wider font-semibold">
                <th className="p-3">Horodatage</th>
                <th className="p-3">Adresse IP Source</th>
                <th className="p-3">Position</th>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Statut</th>
                <th className="p-3 max-w-[200px] truncate">User-Agent</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 italic">
                    Aucun log ne correspond à votre filtre.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isThreat = ['185.220.101.1', '45.33.22.19', '203.0.113.5'].includes(log.ip);
                  return (
                    <tr
                      key={log.id}
                      className={`border-b border-brand-border/40 transition-colors ${
                        isThreat && log.status === 'FAILURE'
                          ? 'bg-red-950/20 text-red-100 hover:bg-[#38111B]'
                          : 'hover:bg-[#1E131D]/40'
                      }`}
                    >
                      <td className="p-3 text-gray-400">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </td>
                      <td className={`p-3 font-semibold ${isThreat ? 'text-rose-400' : 'text-blue-400'}`}>
                        {log.ip}
                      </td>
                      <td className="p-3 text-gray-300">
                        {log.country}
                      </td>
                      <td className="p-3 text-white font-medium select-all">
                        {log.username}
                      </td>
                      <td className="p-3">
                        {log.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1.5 text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-1.5 py-0.2 rounded text-[9px] uppercase">
                            Succès
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded text-[9px] uppercase animate-pulse">
                            Échec
                          </span>
                        )}
                      </td>
                      <td className="p-3 max-w-[200px] truncate text-gray-400 text-[10px]" title={log.userAgent}>
                        {log.userAgent}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination control */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-border/40 pt-4 text-[11px] font-mono select-none">
            <span className="text-gray-400">
              Extraction <strong className="text-white">{startIndex + 1}</strong> à{' '}
              <strong className="text-white">
                {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
              </strong>{' '}
              sur <strong className="text-brand-rose">{filteredLogs.length}</strong> lignes.
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-brand-border hover:border-brand-rose text-[#FFB6C1] disabled:opacity-30 disabled:hover:border-brand-border transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-semibold rounded-lg bg-[#1E131D] border border-brand-border text-white text-xs">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-brand-border hover:border-brand-rose text-[#FFB6C1] disabled:opacity-30 disabled:hover:border-brand-border transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
