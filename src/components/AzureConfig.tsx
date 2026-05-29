import React, { useState, useEffect } from 'react';
import { Cloud, ShieldCheck, Cpu, UploadCloud, AlertCircle, Copy, Check, RotateCw } from 'lucide-react';
import { AzureStorageStatus } from '../types';

interface AzureConfigProps {
  status: AzureStorageStatus | null;
  onUpload: () => Promise<{ success: boolean; realCloud: boolean; fileName: string; size: number; message: string }>;
  onConfigure: (connectionString: string, containerName: string) => Promise<{ success: boolean; message: string }>;
  onRefresh: () => void;
}

export default function AzureConfig({ status, onUpload, onConfigure, onRefresh }: AzureConfigProps) {
  const [connString, setConnString] = useState('');
  const [containerName, setContainerName] = useState('roseansec-logs');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize from status
  useEffect(() => {
    if (status) {
      setContainerName(status.containerName || 'roseansec-logs');
    }
  }, [status]);

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connString) {
      setMessage({ text: 'Chaîne de connexion requise.', isError: true });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await onConfigure(connString, containerName);
      if (res.success) {
        setMessage({ text: res.message, isError: false });
        setConnString('');
        onRefresh();
      } else {
        setMessage({ text: 'Erreur lors de la configuration.', isError: true });
      }
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerUpload = async () => {
    setUploadLoading(true);
    setUploadMessage(null);
    try {
      const res = await onUpload();
      if (res.success) {
        setUploadMessage(res.message);
        onRefresh();
      } else {
        setUploadMessage("Échec de l'envoi des logs vers Azure.");
      }
    } catch (err: any) {
      setUploadMessage(`Erreur d'envoi : ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const copyEnvSnippet = () => {
    const snippet = `AZURE_STORAGE_CONNECTION_STRING="${connString || 'VOTRE_CHAINE_DE_CONNEXION_AZURE'}"`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* Configuration Form */}
      <form onSubmit={handleUpdateConfig} className="bg-brand-card p-5 rounded-xl border border-brand-border md:col-span-5 flex flex-col gap-4">
        <div>
          <h3 className="font-display font-medium text-brand-rose flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#FFB6C1]" />
            CONFIGURATION CLOUD AZURE
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configurez votre stockage Azure Blob.
          </p>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-gray-300 font-mono mb-1.5 uppercase tracking-wider text-[10px]">
              Azure Blob Storage Connection String / SAS Token :
            </label>
            <input
              type="password"
              placeholder="BlobEndpoint=https://...;SharedAccessSignature=..."
              value={connString}
              onChange={(e) => setConnString(e.target.value)}
              className="w-full bg-[#1E131D] text-xs font-mono text-white p-2.5 rounded-lg border border-brand-border focus:border-brand-rose focus:ring-1 focus:ring-brand-rose outline-none select-all font-semibold"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-mono mb-1.5 uppercase tracking-wider text-[10px]">
              Nom de conteneur de logs (Azure Blob Container Name) :
            </label>
            <input
              type="text"
              placeholder="roseansec-logs"
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              className="w-full bg-[#1E131D] text-xs font-mono text-white p-2.5 rounded-lg border border-brand-border focus:border-brand-rose outline-none font-semibold"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-burgundy hover:bg-[#9E1A3C] text-white py-2 rounded-lg font-mono text-xs transition-all border border-rose-900/30 font-semibold disabled:opacity-50"
            >
              {loading ? 'Connexion en cours...' : 'Mettre à Jour le Cloud'}
            </button>

            <button
              type="button"
              onClick={copyEnvSnippet}
              className="w-full flex items-center justify-center gap-1.5 bg-[#251823] hover:bg-[#321F2F] text-gray-400 hover:text-white py-1.5 rounded-lg font-mono text-[10px] transition-all border border-brand-border/60"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copié !' : 'Copier de snippet d\'environnement .env'}
            </button>
          </div>

          {message && (
            <div className={`p-2.5 rounded-md text-xs font-mono leading-relaxed border ${
              message.isError ? 'bg-red-950/20 border-red-500/20 text-red-300' : 'bg-green-950/20 border-green-500/20 text-green-300'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </form>

      {/* Cloud Monitor & Action Block */}
      <div className="bg-brand-card p-5 rounded-xl border border-brand-border md:col-span-7 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div>
            <h4 className="font-display font-medium text-white text-sm">MONITEUR DU CONTAINER AZURE BLOB STORAGE</h4>
            <p className="text-xs text-gray-400">Suivi et état des exportations de logs.</p>
          </div>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-brand-border text-brand-rose hover:bg-[#251823] transition-all cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {status ? (
          <div className="space-y-4 text-xs font-mono">
            {/* Status dashboard line */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3 bg-[#1E131D] rounded-lg border border-brand-border">
                <span className="text-gray-400 block text-[10px] uppercase">Réseau Cloud Azure</span>
                <span className="text-sm font-bold flex items-center gap-1.5 mt-1.5 text-green-400">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  {status.configured ? 'CONNECTÉ (CLOUD REEL)' : 'CONNECTÉ (SIMULÉ)'}
                </span>
              </div>
              <div className="p-3 bg-[#1E131D] rounded-lg border border-brand-border">
                <span className="text-gray-400 block text-[10px] uppercase">Conteneur Actif</span>
                <span className="text-sm font-bold text-brand-rose block mt-1.5 truncate">
                  {status.containerName}
                </span>
              </div>
            </div>

            {/* Upload block */}
            <div className="p-4 bg-[#231221] border border-brand-rose/30 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-semibold text-white flex items-center gap-1">
                    <UploadCloud className="w-4 h-4 text-brand-rose" />
                    Téléverser le rapport d'incident vers Azure
                  </h5>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Exportez le snapshot crypté des 10,000 logs et alertes vers Azure Blob Storage en temps réel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTriggerUpload}
                  disabled={uploadLoading}
                  className="bg-brand-rose hover:bg-white text-brand-bg hover:scale-[1.02] active:scale-[0.98] py-2 px-4 rounded-lg font-semibold transition-all shadow-md self-start sm:self-center uppercase leading-none text-xs"
                >
                  {uploadLoading ? 'Exportation...' : 'UPLOADER CLOUD'}
                </button>
              </div>

              {uploadMessage && (
                <div className="mt-3 p-2.5 rounded bg-[#10040E] border border-brand-border/40 text-[10px] text-brand-rose leading-relaxed">
                  <span className="text-green-400 font-bold">&gt;</span> {uploadMessage}
                </div>
              )}
            </div>

            {/* List of blobs stored in cloud folder */}
            <div>
              <p className="font-semibold text-gray-300 font-display mb-2 flex items-center gap-1 text-xs">
                <Cpu className="w-4 h-4 text-brand-rose" />
                Derniers fichiers persistés dans "roseansec-logs" :
              </p>
              
              <div className="bg-[#110B10] border border-brand-border/50 rounded-lg overflow-hidden divide-y divide-[#251823]">
                {status.recentBlobs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-xs">Aucun fichier cloud stocké.</div>
                ) : (
                  status.recentBlobs.map((blob, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-[#1C111C]/40 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-300 truncate max-w-[240px]" title={blob.name}>
                          {blob.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 text-[10px]">
                        <span>{(blob.size / 1024).toFixed(1)} KB</span>
                        <span>{new Date(blob.date).toLocaleTimeString('fr-FR')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 font-mono">Chargement des données Azure...</div>
        )}
      </div>
    </div>
  );
}
