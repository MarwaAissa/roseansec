import { useState } from 'react';
import { Alert, AlertSeverity } from '../types';
import { AlertTriangle, ShieldCheck, Mail, CheckCircle, Clock, ShieldAlert, Cpu } from 'lucide-react';

interface AlertListProps {
  alerts: Alert[];
  onResolve: (id: string) => void;
  onSendEmail: (alertId: string, toEmail: string) => Promise<{ success: boolean; message: string; smtpLog?: string[] }>;
  onSimulateAttack?: () => Promise<any>;
  simulating?: boolean;
}

export default function AlertList({ alerts, onResolve, onSendEmail, onSimulateAttack, simulating }: AlertListProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [emailLoadingId, setEmailLoadingId] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<{ id: string; message: string; isError: boolean } | null>(null);
  const [smtpLogs, setSmtpLogs] = useState<string[] | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('marwa.aissa06@gmail.com');

  const handleSendEmail = async (alertId: string) => {
    setEmailLoadingId(alertId);
    setEmailStatus(null);
    setSmtpLogs(null);
    try {
      const res = await onSendEmail(alertId, recipientEmail);
      if (res.success) {
        setEmailStatus({ id: alertId, message: res.message, isError: false });
        if (res.smtpLog) {
          setSmtpLogs(res.smtpLog);
        }
      } else {
        setEmailStatus({ id: alertId, message: res.message || 'Échec de transmission.', isError: true });
      }
    } catch (err: any) {
      setEmailStatus({ id: alertId, message: `Erreur : ${err.message}`, isError: true });
    } finally {
      setEmailLoadingId(null);
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            CRITIQUE (FORCE BRUTE)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            MOYEN
          </span>
        );
      case 'LOW':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            FAIBLE
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Alert List Block */}
      <div className="bg-brand-card p-5 rounded-xl border border-brand-border lg:col-span-7 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div>
            <h3 className="font-display font-medium text-brand-rose flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              ALERTES VISUELLES DE SÉCURITÉ
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Événements de connexion suspicieux regroupés en temps réel d'après le moteur d'analyse.
            </p>
          </div>
          <span className="text-xs font-mono bg-red-950/40 text-rose-300 border border-rose-900/40 px-2 py-0.5 rounded">
            {alerts.filter(a => !a.resolved).length} En cours
          </span>
        </div>

        {/* Action interactive de simulation d'attaque en direct */}
        {onSimulateAttack && (
          <div className="bg-[#800020]/10 border border-[#FFB6C1]/20 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="font-mono text-[11px] text-gray-300">
                Démo Soutenance : Injecter une attaque brute-force brute en direct
              </span>
            </div>
            <button
              onClick={async () => {
                const res = await onSimulateAttack();
                if (res && res.success && res.alert) {
                  setSelectedAlert(res.alert);
                }
              }}
              disabled={simulating}
              className="bg-brand-burgundy hover:bg-brand-rose px-3.5 py-1.5 rounded-lg text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shrink-0 border border-brand-rose/25 shadow-lg active:scale-95"
            >
              {simulating ? 'Injection...' : '⚠️ GENERER L\'ATTAQUE'}
            </button>
          </div>
        )}

        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-500 font-mono text-xs border border-dashed border-brand-border rounded-lg flex flex-col items-center justify-center gap-4">
              <span>Aucune anomalie active détectée. Le pare-feu est en veille passive.</span>
              {onSimulateAttack && (
                <button
                  onClick={async () => {
                    const res = await onSimulateAttack();
                    if (res && res.success && res.alert) {
                      setSelectedAlert(res.alert);
                    }
                  }}
                  disabled={simulating}
                  className="bg-brand-burgundy hover:bg-brand-rose px-4 py-2 rounded-lg text-white font-semibold transition-all cursor-pointer border border-[#FFB6C1]/20 shadow active:scale-95 text-[11px]"
                >
                  {simulating ? 'Simulation en cours...' : '⚡ Lancer le stress-test d\'attaque (Demo)'}
                </button>
              )}
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedAlert?.id === alert.id
                    ? 'border-[#FFB6C1] bg-[#3B2234]'
                    : alert.resolved
                    ? 'border-brand-border/40 bg-[#1E131D] opacity-75 hover:opacity-100'
                    : 'border-brand-border bg-[#211420] hover:border-brand-rose/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(alert.severity)}
                    {alert.resolved && (
                      <span className="flex items-center gap-1 text-[10px] text-green-400 font-mono bg-green-500/10 border border-green-500/20 px-1.5 py-0.2 rounded">
                        RÉSOLUE
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.timestamp).toLocaleTimeString('fr-FR')}
                  </span>
                </div>

                <div className="mt-2.5">
                  <p className="text-xs text-gray-300 font-mono">
                    Compte : <strong className="text-brand-rose">{alert.username}</strong> | IP : <strong className="text-gray-200">{alert.ip}</strong> ({alert.country})
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">
                    {alert.details}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-brand-border/40 pt-2 text-[11px] font-mono leading-none">
                  <span className="text-gray-400">
                    Calcul : {alert.attemptsCount} essais en {alert.durationSeconds}s
                  </span>
                  <span className="text-[#FFB6C1] hover:underline hover:text-white">
                    Inspecter la menace &rarr;
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inspect Detail Panel */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {selectedAlert ? (
          <div className="bg-brand-card p-5 rounded-xl border border-brand-rose/40 h-full flex flex-col gap-4 relative overflow-hidden">
            {/* Background absolute glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl pointer-events-none rounded-full"></div>

            <div className="border-b border-brand-border pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-brand-rose tracking-wider">SEC-INSPECTOR v1.2</span>
                <span className="text-[10px] text-gray-400 font-mono">{selectedAlert.id}</span>
              </div>
              <h4 className="font-display font-medium text-lg text-white mt-1">
                Fiche de Menace : {selectedAlert.severity === 'CRITICAL' ? 'Brute-force (Glissant)' : selectedAlert.severity === 'MEDIUM' ? 'Scan de Ports Suspect' : 'Anomalie Faible / Balayage'}
              </h4>
            </div>

            <div className="space-y-3.5 flex-1 text-xs">
              <div className="bg-[#1E131D] p-3 rounded-lg border border-brand-border font-mono space-y-1.5">
                <p className="text-gray-400"><span className="text-brand-rose">&gt;</span> IP source : <span className="text-white font-semibold">{selectedAlert.ip}</span></p>
                <p className="text-gray-400"><span className="text-brand-rose">&gt;</span> Localisation : <span className="text-white">{selectedAlert.country}</span></p>
                <p className="text-gray-400"><span className="text-brand-rose">&gt;</span> Cible locale : <span className="text-white font-semibold">{selectedAlert.username}</span></p>
                <p className="text-gray-400"><span className="text-brand-rose">&gt;</span> User-Agent : <span className="text-gray-300 select-all block mt-1 p-1 bg-[#150B14] rounded leading-normal break-all text-[10px]">{selectedAlert.userAgent || selectedAlert.user_agent}</span></p>
              </div>

              <div>
                <p className="font-semibold text-brand-rose flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Description du Comportement :
                </p>
                <p className="text-gray-300 leading-relaxed bg-[#190E18] p-3 rounded-lg border border-brand-border text-xs">
                  {selectedAlert.details}
                </p>
              </div>

              <div>
                <p className="font-semibold text-green-400 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                   Actions Correctives (Playbook) :
                </p>
                <ul className="space-y-1.5 pl-4 list-disc text-gray-300">
                  {selectedAlert.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-normal">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Email send alerts notification, and block triggers */}
            <div className="border-t border-brand-border pt-4 flex flex-col gap-2">
              <div className="mb-2 font-mono text-xs">
                <label className="block text-[10px] uppercase text-gray-400 mb-1">
                  Destinataire de l'alerte SMTP :
                </label>
                <input 
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-[#1A1118] text-xs text-white p-2.5 rounded-lg border border-brand-border focus:border-[#FFB6C1] outline-none"
                  placeholder="marwa.aissa06@gmail.com"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSendEmail(selectedAlert.id)}
                  disabled={emailLoadingId === selectedAlert.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#800020] hover:bg-[#A31639] active:translate-y-0.5 text-white font-mono text-xs py-2.5 px-3 rounded-lg transition-all border border-[#B0284D]/30 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  {emailLoadingId === selectedAlert.id ? 'Log SMTP...' : 'Alerte Admin (Email)'}
                </button>

                {!selectedAlert.resolved && (
                  <button
                    onClick={() => onResolve(selectedAlert.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#2D4539]/40 hover:bg-[#345946]/70 text-green-300 font-mono text-xs py-2.5 px-3 rounded-lg transition-all border border-green-800/20 active:translate-y-0.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Valider / Résoudre
                  </button>
                )}
              </div>

              {/* SMTP transmission and log feedbacks */}
              {emailStatus && emailStatus.id === selectedAlert.id && (
                <div className={`p-2.5 rounded-md text-[11px] font-mono leading-relaxed border ${
                  emailStatus.isError ? 'bg-red-950/20 border-red-500/20 text-red-300' : 'bg-green-950/20 border-green-500/20 text-green-300'
                }`}>
                  {emailStatus.message}
                </div>
              )}

              {smtpLogs && (
                <div className="mt-2 text-[10px] font-mono bg-[#11050F] p-2.5 rounded border border-brand-border max-h-[140px] overflow-y-auto space-y-0.5 text-gray-400">
                  <p className="text-brand-rose border-b border-brand-border/40 pb-1 mb-1.5 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    TRANSMISSION SMTP
                  </p>
                  {smtpLogs.map((logLine, idx) => (
                    <div key={idx} className="leading-none whitespace-pre-wrap py-0.5 border-b border-[#251823]/30">
                      <span className="text-[#A88B9E]">{`>`}</span> {logLine}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#1C121A] p-6 rounded-xl border border-brand-border h-full flex flex-col items-center justify-center text-center text-gray-500 py-16">
            <ShieldAlert className="w-10 h-10 text-[#4D2D3E] mb-2.5" />
            <p className="font-display font-medium text-sm text-gray-400">Filtre d'Inspection Vide</p>
            <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
              Sélectionnez une alerte de sécurité à gauche pour analyser la menace, lancer une notification email et appliquer des remédiations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
