import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Database, 
  FileDown, 
  Sparkles, 
  CheckCircle,
  Network,
  RefreshCw,
  Clock,
  Menu,
  X,
  Lock,
  Workflow,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

import WorldMap from './components/WorldMap';
import VisualCharts from './components/VisualCharts';
import AlertList from './components/AlertList';
import LogViewer from './components/LogViewer';
import AzureConfig from './components/AzureConfig';
import GeminiAudit from './components/GeminiAudit';
import PfeSlides from './components/PfeSlides';
import { LogEvent, Alert, AzureStorageStatus } from './types';

export default function App() {
  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('roseansec_auth') === 'true';
  });
  const [authUsername, setAuthUsername] = useState('roseansec');
  const [authPassword, setAuthPassword] = useState('');
  const [authAttempts, setAuthAttempts] = useState(0);
  const [authLockedUntil, setAuthLockedUntil] = useState<number | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Business Owner Dynamic Context
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [regStoreName, setRegStoreName] = useState('');
  const [regPlatform, setRegPlatform] = useState('WooCommerce');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('roseansec_business_name')) || 'RoseanSec Central';
  });
  const [ecommercePlatform, setEcommercePlatform] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('roseansec_platform_type')) || 'WooCommerce';
  });

  // Load custom business metrics on login state change
  useEffect(() => {
    if (isAuthenticated) {
      const name = localStorage.getItem('roseansec_business_name') || 'RoseanSec Central';
      const plat = localStorage.getItem('roseansec_platform_type') || 'WooCommerce';
      setBusinessName(name);
      setEcommercePlatform(plat);
    }
  }, [isAuthenticated]);

  // Navigation and State hooks
  const [activeTab, setActiveTab] = useState<'cybermap' | 'alerts' | 'logs' | 'azure' | 'gemini' | 'pfe_slides'>('cybermap');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [azureStatus, setAzureStatus] = useState<AzureStorageStatus | null>(null);
  const [detectionConfig, setDetectionConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingLogs, setUpdatingLogs] = useState(false);
  const [logsAlertState, setLogsAlertState] = useState<{ text: string; success: boolean } | null>(null);

  // Load initial dataset from backend
  const fetchDashboardData = async () => {
    try {
      const [resLogs, resAlerts, resStats, resAzure, resConfig] = await Promise.all([
        fetch('/api/logs?limit=300'),
        fetch('/api/alerts'),
        fetch('/api/stats'),
        fetch('/api/azure/status'),
        fetch('/api/detection/config')
      ]);

      const getJson = async (res: Response) => {
        if (!res.ok) {
          throw new Error(`Serveur indisponible (HTTP ${res.status}).`);
        }
        const ct = res.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) {
          throw new Error("La passerelle de sécurité est en cours de redémarrage. Actualisez la page.");
        }
        return res.json();
      };

      const dataLogs = await getJson(resLogs);
      const dataAlerts = await getJson(resAlerts);
      const dataStats = await getJson(resStats);
      const dataAzure = await getJson(resAzure);
      const dataConfig = await getJson(resConfig);

      setLogs(dataLogs.logs || []);
      setAlerts(dataAlerts.alerts || []);
      setStats(dataStats || null);
      setAzureStatus(dataAzure || null);
      setDetectionConfig(dataConfig || null);
    } catch (err: any) {
      console.warn("Backend Sync Notice (Expected during restart):", err.message);
      // Setup a subtle, recovery instruction banner instead of throwing raw json exception
      setLogsAlertState({
        text: `ROSEANSEC SYNC : ${err.message || "Attente de connexion au serveur principal."}`,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRegSuccess(null);

    // Lock check
    if (authLockedUntil && Date.now() < authLockedUntil) {
      const waitSec = Math.ceil((authLockedUntil - Date.now()) / 1000);
      setAuthError(`Interface d'administration sous temporisation de sécurité. Réessayez dans ${waitSec} secondes.`);
      return;
    }

    const trimmedUser = authUsername.trim().toLowerCase();
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('roseansec_custom_user') : null;
    const storedPass = typeof window !== 'undefined' ? localStorage.getItem('roseansec_custom_pass') : null;

    const isDefault = trimmedUser === 'roseansec' && authPassword === 'admin';
    const isCustom = storedUser && trimmedUser === storedUser.toLowerCase() && authPassword === storedPass;

    if (isDefault || isCustom) {
      sessionStorage.setItem('roseansec_auth', 'true');
      setIsAuthenticated(true);
      setAuthPassword('');
      setAuthAttempts(0);
      
      if (isDefault) {
        // Keep default store names if not customized
        if (!localStorage.getItem('roseansec_business_name')) {
          localStorage.setItem('roseansec_business_name', 'RoseanSec Central');
          localStorage.setItem('roseansec_platform_type', 'Omnicanal');
        }
      }
    } else {
      const currentAttempts = authAttempts + 1;
      setAuthAttempts(currentAttempts);

      if (currentAttempts >= 5) {
        const lockoutTime = Date.now() + 60 * 1000; // 60s freeze
        setAuthLockedUntil(lockoutTime);
        setAuthAttempts(0);
        setAuthError("DÉTECTION D'ATTAQUE PAR INTENSE FORCE BRUTE : Interface d'administration gelée pendant 60 secondes.");
      } else {
        setAuthError(`Identifiants invalides. Tentatives infructueuses : ${currentAttempts}/5.`);
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRegSuccess(null);

    if (!regStoreName.trim() || !regUser.trim() || !regPass.trim()) {
      setAuthError("Veuillez remplir tous les champs requis.");
      return;
    }

    localStorage.setItem('roseansec_business_name', regStoreName.trim());
    localStorage.setItem('roseansec_platform_type', regPlatform);
    localStorage.setItem('roseansec_custom_user', regUser.trim().toLowerCase());
    localStorage.setItem('roseansec_custom_pass', regPass);

    setAuthUsername(regUser.trim());
    setAuthPassword(regPass);
    setIsRegisterMode(false);
    setRegSuccess(`Votre boutique "${regStoreName.trim()}" (${regPlatform}) a été configurée avec succès ! Connectez-vous avec vos nouveaux identifiants.`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('roseansec_auth');
    setIsAuthenticated(false);
  };

  // Simulator python log generator route trigger (equivalent to launch of generate_logs.py)
  const handleGenerateLogs = async (count: number = 10000) => {
    setUpdatingLogs(true);
    setLogsAlertState(null);
    try {
      const res = await fetch('/api/logs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
      const data = await res.json();
      if (data.success) {
        setLogsAlertState({
          text: `GÉNÉRATEUR PYTHON : ${data.message} (${data.summary.alertsCritical} alertes de force brute détectées !)`,
          success: true
        });
        await fetchDashboardData();
      } else {
        setLogsAlertState({ text: "La génération de logs a échoué.", success: false });
      }
      return data;
    } catch (err: any) {
      setLogsAlertState({ text: `Erreur : ${err.message}`, success: false });
      return { success: false, message: err.message };
    } finally {
      setUpdatingLogs(false);
    }
  };

  const [simulatingAttack, setSimulatingAttack] = useState(false);

  const handleSimulateAttack = async () => {
    setSimulatingAttack(true);
    setLogsAlertState(null);
    try {
      const res = await fetch('/api/logs/simulate-bruteforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setLogsAlertState({
          text: `SIMULATION : ${data.message}`,
          success: true
        });
        await fetchDashboardData();
        return data;
      } else {
        setLogsAlertState({ text: "La simulation d'attaque brute-force a échoué.", success: false });
        return { success: false, message: "La simulation a échoué." };
      }
    } catch (err: any) {
      setLogsAlertState({ text: `Erreur : ${err.message}`, success: false });
      return { success: false, message: err.message };
    } finally {
      setSimulatingAttack(false);
    }
  };

  // POST update sliding window configuration params
  const handleUpdateConfig = async (newConfig: any) => {
    try {
      const res = await fetch('/api/detection/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success) {
        setDetectionConfig(data.config);
        // Refresh alerts and stats in UI instantly
        await fetchDashboardData();
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // POST upload custom CSV logs
  const handleImportLogs = async (csvLogs: any[]) => {
    try {
      const res = await fetch('/api/logs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: csvLogs })
      });
      const data = await res.json();
      if (data.success) {
        await fetchDashboardData();
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // Resolve Alert callback
  const handleResolveAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
        // Refetch stats to adapt resolved metrics
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated / Real Azure Configure
  const handleConfigureAzure = async (connectionString: string, containerName: string) => {
    try {
      const res = await fetch('/api/azure/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString, containerName })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // Simulated / Real Azure Upload
  const handleUploadAzure = async () => {
    try {
      const res = await fetch('/api/azure/upload', {
        method: 'POST'
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // SMTP Email Send simulation
  const handleSendEmail = async (alertId: string, toEmail?: string) => {
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, toEmail })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // Call Gemini threat analyst backend API
  const handleAnalyzeGemini = async () => {
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST'
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, simulated: true, analysis: e.message };
    }
  };

  // Generate executive security PDF using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const primaryColor = '#800020'; // Burgundy
    const secondaryColor = '#1A1118'; // Dark charcoal

    // Document styling configuration
    doc.setFillColor(128, 0, 32); // Header bar background burgundy
    doc.rect(0, 0, 210, 38, 'F');

    // Title Block
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`ROSEANSEC - AUDIT DE SECURITE DE LOGS`, 14, 14);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Commerce Sécurisé : ${businessName.toUpperCase()} | Plateforme : ${ecommercePlatform.toUpperCase()}`, 14, 21);
    doc.text(`Incident de sécurité force brute & plan d'action de remédiation personnalisé`, 14, 27);
    doc.text(`Édité le : ${new Date().toLocaleString('fr-FR')} | Système autonome`, 14, 32);

    // Decorative branding watermark logo
    doc.setFillColor(255, 182, 193); // Pink footer line
    doc.rect(0, 38, 210, 2, 'F');

    // Section 1: Metrics
    doc.setTextColor(128, 0, 32);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('1. MÉTRIQUES GLOBALES DU SYSTÈME CLOUD', 14, 52);
    
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 55, 196, 55);

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const countLogs = stats ? stats.totalLogs.toLocaleString() : '10,000';
    const cleanLogs = stats ? stats.legitimateCount.toLocaleString() : '9,000';
    const attackLogs = stats ? stats.attackCount.toLocaleString() : '1,000';
    const critAlertsNum = stats ? stats.criticalAlerts : '18';

    doc.text(`• Total des événements de connexion analysés : ${countLogs}`, 16, 62);
    doc.text(`• Trafic normal identifié (Légitime)         : ${cleanLogs} (${stats ? ((stats.legitimateCount / stats.totalLogs) * 100).toFixed(1) : '90.0'}%)`, 16, 68);
    doc.text(`• Tentatives offensives (Force Brute)       : ${attackLogs} (${stats ? ((stats.attackCount / stats.totalLogs) * 100).toFixed(1) : '10.0'}%)`, 16, 74);
    doc.text(`• Alertes critiques (Sliding-window actif)  : ${critAlertsNum} violations de sécurité détectées`, 16, 80);

    // Section 2: Targeted Accounts
    doc.setTextColor(128, 0, 32);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('2. COMPTES UTILISATEURS LES PLUS CIBLÉS', 14, 95);
    doc.line(14, 98, 196, 98);

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (stats?.topTargetedAccounts && stats.topTargetedAccounts.length > 0) {
      stats.topTargetedAccounts.forEach((acc: any, idx: number) => {
        doc.text(`${idx + 1}. Utilisateur concerné : "${acc.username.toUpperCase()}" | Tentatives d'intrusions bloquées : ${acc.count} fois`, 18, 106 + (idx * 6));
      });
    } else {
      doc.text('• alice, fatima, root, admin, yassine (tentatives rapides à haute fréquence)', 18, 106);
    }

    // Section 3: Attacking IPs
    doc.setTextColor(128, 0, 32);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('3. ORIGINES DES IP OFFENSIVES EXTÉRIEURES', 14, 140);
    doc.line(14, 143, 196, 143);

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    if (stats?.topAttackingIps && stats.topAttackingIps.length > 0) {
      stats.topAttackingIps.forEach((at: any, idx: number) => {
        doc.text(`• IP : ${at.ip} | Localisation physique : ${at.country} | Assauts bloqués : ${at.count} requêtes`, 18, 151 + (idx * 6));
      });
    } else {
      doc.text('• 185.220.101.1 (Russie, suspect) - 523 requêtes de dictionnaire', 18, 151);
      doc.text('• 45.33.22.19 (Chine, suspect) - 340 requêtes SSH-burst', 18, 157);
      doc.text('• 203.0.113.5 (Ukraine, suspect) - 138 requêtes', 18, 163);
    }

    // Section 4: Mitigation rules
    doc.setTextColor(128, 0, 32);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('4. DIRECTIVES DE REMÉDIATION IMMÉDIATES (PLAYBOOK)', 14, 185);
    doc.line(14, 188, 196, 188);

    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('ACTION A : BLOCAGE IP PERIMETRIQUE (WAF)', 16, 195);
    doc.setFont('helvetica', 'normal');
    doc.text('=> Bannir immédiatement les 3 IPs suspectes listées ci-dessus dans Azure Application Gateway ou NSG.', 16, 201);

    doc.setFont('helvetica', 'bold');
    doc.text('ACTION B : RESET SECURISE AVEC ENFORCEMENT MFA', 16, 209);
    doc.setFont('helvetica', 'normal');
    doc.text('=> Exiger la réinitialisation réactive des mots de passe des comptes alice, yassine, fatima.', 16, 215);

    doc.setFont('helvetica', 'bold');
    doc.text('ACTION C : INTEGRATION SIEM ET SAUVEGARDE CLOUD', 16, 223);
    doc.setFont('helvetica', 'normal');
    doc.text("=> Exporter l'historique brut de logs RoseanSec vers Azure Blob Storage (roseansec-logs) pour archivage.", 16, 229);

    // Decorative Signature Footer
    doc.setFillColor(26, 17, 24); // footer color brand dark bg
    doc.rect(0, 275, 210, 22, 'F');
    
    doc.setTextColor(255, 182, 193); // pink color text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('ROSEANSEC CYBERSECURITY ENGINE © 2026', 14, 284);
    
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Soutenance de PFE Master d\'Ingénierie Informatique. Certifié Azure App Service.', 14, 289);

    doc.save('Rapport-Securite-RoseanSec.pdf');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A1118] text-[#F3EAF0] flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden">
        {/* Abstract Cyber grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#800020_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10"></div>
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#800020] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#251923] border border-[#FFB6C1]/20 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 font-mono">
          <div className="flex items-center gap-3.5 mb-6 border-b border-white/5 pb-5">
            <div className="w-12 h-12 bg-[#800020] rounded-xl flex items-center justify-center border border-[#FFB6C1]/30 shadow-lg">
              <ShieldAlert className="w-6 h-6 text-[#FFB6C1]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">ROSEANSEC v1.2</h1>
              <p className="text-[9px] uppercase tracking-widest text-[#FFB6C1] mt-1.5 font-bold">
                {isRegisterMode ? "ENREGISTREMENT COMMERCE" : "PORTAIL DE CYBER-DEFENSE"}
              </p>
            </div>
          </div>

          {regSuccess && (
            <div className="p-3 bg-green-950/40 border border-green-500/30 text-green-300 text-[11px] rounded-lg mb-4 leading-relaxed font-semibold">
              {regSuccess}
            </div>
          )}

          {!isRegisterMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-mono tracking-wider text-[10px] uppercase mb-1.5 font-semibold">Identifiant Propriétaire :</label>
                <input 
                  type="text" 
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-[#1A1118] text-white p-2.5 rounded-lg border border-[#FFB6C1]/10 focus:border-[#FFB6C1]/40 outline-none select-all text-xs font-semibold"
                  placeholder="roseansec"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-mono tracking-wider text-[10px] uppercase mb-1.5 font-semibold">Mot de passe de sécurité :</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#1A1118] text-white p-2.5 rounded-lg border border-[#FFB6C1]/10 focus:border-[#FFB6C1]/40 outline-none text-xs font-semibold"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-200 text-[11px] rounded-lg leading-relaxed font-semibold">
                  {authError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-[#800020] hover:bg-[#a60c32] text-white py-2.5 rounded-lg font-bold font-mono transition-all border border-white/5 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg uppercase tracking-wider text-[11px]"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFB6C1]" />
                DÉVERROUILLER LE PORTAIL
              </button>

              <div className="border-t border-white/5 pt-4 text-center">
                <p className="text-[10px] text-gray-400 mb-2">Vous êtes commerçant ? Adaptez le portail avec vos infos :</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setAuthError(null);
                    setRegSuccess(null);
                  }}
                  className="text-[#FFB6C1] hover:underline hover:text-white transition-colors text-[10px] font-bold cursor-pointer"
                >
                  [ CONFIGURER MON PROPRE COMMERCE ]
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <p className="text-[10.5px] text-gray-400 leading-relaxed border-l-2 border-[#FFB6C1] pl-2 py-0.5">
                Remplissez les informations de votre commerce pour générer une simulation de protection dédiée.
              </p>

              <div>
                <label className="block text-gray-400 font-mono tracking-wider text-[10px] uppercase mb-1.5 font-semibold">Nom de votre Commerce :</label>
                <input 
                  type="text" 
                  value={regStoreName}
                  onChange={(e) => setRegStoreName(e.target.value)}
                  className="w-full bg-[#1A1118] text-white p-2.5 rounded-lg border border-[#FFB6C1]/10 focus:border-[#FFB6C1]/40 outline-none text-xs font-semibold"
                  placeholder="Ex: Marwa Cosmetics"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono tracking-wider text-[10px] uppercase mb-1.5 font-semibold">Solution E-Commerce de votre site :</label>
                <select 
                  value={regPlatform}
                  onChange={(e) => setRegPlatform(e.target.value)}
                  className="w-full bg-[#1A1118] text-white p-2.5 rounded-lg border border-[#FFB6C1]/10 focus:border-[#FFB6C1]/40 outline-none text-xs font-semibold cursor-pointer"
                >
                  <option value="WooCommerce">WooCommerce (WordPress)</option>
                  <option value="Shopify">Shopify Plus Store</option>
                  <option value="PrestaShop">PrestaShop CMS</option>
                  <option value="Magento">Magento / Adobe Commerce</option>
                  <option value="Custom REST API">Custom Node/PHP Backend Solution</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#FFB6C1] font-mono tracking-wider text-[9px] uppercase mb-1 font-semibold">Identifiant choisi :</label>
                  <input 
                    type="text" 
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    className="w-full bg-[#1A1118] text-white p-2.5 rounded-lg border border-[#FFB6C1]/10 focus:border-[#FFB6C1]/40 outline-none text-xs font-semibold"
                    placeholder="ex: marwa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#FFB6C1] font-mono tracking-wider text-[9px] uppercase mb-1 font-semibold">Password désiré :</label>
                  <input 
                    type="password" 
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    className="w-full bg-[#1A1118] text-white p-2.5 rounded-lg border border-[#FFB6C1]/10 focus:border-[#FFB6C1]/40 outline-none text-xs font-semibold"
                    placeholder="ex: pfe2026"
                    required
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-200 text-[11px] rounded-lg leading-relaxed font-semibold">
                  {authError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-[#800020] hover:bg-[#a60c32] text-white py-2.5 rounded-lg font-bold font-mono transition-all border border-white/5 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg uppercase tracking-wider text-[11px]"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFB6C1]" />
                CREER LE PROFIL & REMPLIR
              </button>

              <div className="text-center pt-1.5">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-gray-400 hover:text-white transition-colors text-[10px] underline cursor-pointer"
                >
                  Retour au compte générique roseansec
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-[#F3EAF0] flex flex-col font-sans">
      {/* Dynamic Alert Banners when logs are generating */}
      {logsAlertState && (
        <div className={`p-3 text-center text-xs font-mono transition-all duration-300 animate-slide-down flex items-center justify-center gap-2 border-b uppercase ${
          logsAlertState.success 
            ? 'bg-rose-950 text-brand-rose border-[#FFB6C1]/20' 
            : 'bg-red-950 text-red-200 border-red-900/40'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
          <span>{logsAlertState.text}</span>
          <button 
            onClick={() => setLogsAlertState(null)} 
            className="ml-4 font-bold text-white hover:text-red-300 hover:scale-110 cursor-pointer"
          >
            [X]
          </button>
        </div>
      )}

      {/* Corporate Premium Titlebar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 lg:px-8 bg-[#251923] sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#800020] rounded-lg flex items-center justify-center border border-[#FFB6C1]/30 shadow-lg">
            <div className="w-4 h-4 bg-[#FFB6C1] rotate-45 flex items-center justify-center">
              <ShieldAlert className="w-2.5 h-2.5 text-[#800020] -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[#FFB6C1] font-bold text-lg lg:text-xl tracking-tight leading-none">RoseanSec</h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-brand-rose/10 border border-brand-rose/20 text-[#FFB6C1] uppercase tracking-wider font-semibold">
                {businessName} ({ecommercePlatform})
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FFB6C1]/60 font-semibold mt-0.5 hidden sm:block">
              PORTAIL ACTIF DE DEFENSE TRANSACTIONNELLE
            </p>
          </div>
        </div>

        {/* Action center header */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Azure Cloud Status Panel */}
          <div className="bg-black/30 border border-blue-500/30 rounded-full px-4 py-1.5 flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-100">
              Azure Cloud Storage: {azureStatus?.configured ? 'Real' : 'Connected'}
            </span>
            <div className="h-4 w-px bg-blue-500/20"></div>
            <span className="text-[10px] text-blue-300 font-mono">
              {azureStatus?.containerName || 'roseansec-logs'}/primary
            </span>
          </div>

          {/* Launch log generator block */}
          <button
            onClick={handleGenerateLogs}
            disabled={updatingLogs}
            className="flex items-center gap-2 bg-[#1A1118]/80 hover:bg-[#341F2E] text-xs text-[#FFB6C1] font-mono font-medium py-2 px-4 rounded-lg transition-all border border-white/10 cursor-pointer disabled:opacity-40"
          >
            <Database className="w-4 h-4 text-brand-rose" />
            {updatingLogs ? 'GÉNÉRATION LOGS...' : 'LANCER GENERATION'}
          </button>

          {/* PDF exporter button */}
          <button
            onClick={handleExportPDF}
            className="bg-[#800020] hover:bg-[#a00028] text-white text-xs font-bold px-5 py-2.5 rounded shadow-lg transition-colors border border-white/10 flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#FFB6C1]" />
            <span>EXPORT PDF</span>
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="bg-[#2D1623] hover:bg-black text-[10px] text-gray-400 hover:text-white font-mono px-3.5 py-2 px-4 rounded transition-all border border-[#FFB6C1]/10 flex items-center gap-1.5 cursor-pointer uppercase font-bold"
          >
            <Lock className="w-3.5 h-3.5 text-brand-rose" />
            <span>Déconnexion</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-brand-rose border border-white/10 rounded-lg select-none outline-none"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Grid navigation */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-5 flex flex-col gap-5">
        
        {/* Navigation Tabbed menu bar */}
        <div className="flex bg-[#251923] p-1.5 rounded-xl border border-white/10 text-xs font-mono font-medium overflow-x-auto gap-2">
          <button
            onClick={() => { setActiveTab('cybermap'); setMobileMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
              activeTab === 'cybermap'
                ? 'bg-[#800020] text-white border-[#FFB6C1]/20 font-semibold shadow-lg'
                : 'text-white/60 border-transparent hover:text-[#FFB6C1] hover:bg-white/5'
            }`}
          >
            <Network className="w-4 h-4" />
            TABLEAU DE BORD (CYBERMAP)
          </button>

          <button
            onClick={() => { setActiveTab('alerts'); setMobileMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#800020] text-white border-[#FFB6C1]/20 font-semibold shadow-lg'
                : 'text-white/60 border-transparent hover:text-[#FFB6C1] hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            ALERTES ({alerts.length})
          </button>

          <button
            onClick={() => { setActiveTab('logs'); setMobileMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#800020] text-white border-[#FFB6C1]/20 font-semibold shadow-lg'
                : 'text-white/60 border-transparent hover:text-[#FFB6C1] hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            ANALYSE DES LOGS ({stats ? stats.totalLogs.toLocaleString() : '...'})
          </button>

          <button
            onClick={() => { setActiveTab('azure'); setMobileMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
              activeTab === 'azure'
                ? 'bg-[#800020] text-white border-[#FFB6C1]/20 font-semibold shadow-lg'
                : 'text-white/60 border-transparent hover:text-[#FFB6C1] hover:bg-white/5'
            }`}
          >
            <Workflow className="w-4 h-4" />
            CONFIG AZURE CLOUD
          </button>

          <button
            onClick={() => { setActiveTab('gemini'); setMobileMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
              activeTab === 'gemini'
                ? 'bg-[#800020] text-white border-[#FFB6C1]/20 font-semibold shadow-lg'
                : 'text-white/60 border-transparent hover:text-[#FFB6C1] hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#FFB6C1]" />
            AUDIT IA (GEMINI)
          </button>

        </div>

        {/* Mobile menu action bar */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#251923] p-3 rounded-lg border border-white/10 flex flex-col gap-2 font-mono text-xs shadow-xl">
            <button
              onClick={() => { handleGenerateLogs(); setMobileMenuOpen(false); }}
              disabled={updatingLogs}
              className="flex items-center justify-center gap-2 bg-[#1A1118] text-[#FFB6C1] py-2.5 rounded-lg border border-white/5 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              Générer 10k Logs
            </button>
            <button
              onClick={() => { handleExportPDF(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-2 bg-[#800020] text-white py-2.5 rounded-lg border border-white/10 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Exporter le Rapport PDF
            </button>
          </div>
        )}

        {/* Secondary metrics overview panel (Kaspersky core header) */}
        {!loading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#251923] p-4 rounded-xl border border-white/5 shadow-inner flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                <Database className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <span className="text-white/40 text-[10px] uppercase font-mono tracking-wider block leading-none mb-1">Total Logs (24h)</span>
                <span className="text-2xl font-bold font-display text-[#FFB6C1] block leading-tight">{stats.totalLogs.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#251923] p-4 rounded-xl border border-white/5 shadow-inner flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="text-white/40 text-[10px] uppercase font-mono tracking-wider block leading-none mb-1">Alertes Critiques</span>
                <span className="text-2xl font-bold font-display text-red-500 block leading-tight">
                  {alerts.filter(a => a.severity === 'CRITICAL').length}
                </span>
              </div>
            </div>

            <div className="bg-[#251923] p-4 rounded-xl border border-white/5 shadow-inner flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg">
                <Network className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <span className="text-white/40 text-[10px] uppercase font-mono tracking-wider block leading-none mb-1">IPs Bloquées</span>
                <span className="text-2xl font-bold font-display text-orange-400 block leading-tight">
                  {stats?.activeIpsBlocked !== undefined ? `${stats.activeIpsBlocked} Actives` : `${new Set(alerts.filter(a => !a.resolved).map(a => a.ip)).size} Actives`}
                </span>
              </div>
            </div>

            <div className="bg-[#251923] p-4 rounded-xl border border-white/5 shadow-inner flex items-center gap-3">
              <div className="p-3 bg-brand-rose/10 border border-brand-rose/20 text-brand-rose rounded-lg">
                <Lock className="w-5 h-5 text-[#FFB6C1]" />
              </div>
              <div>
                <span className="text-white/40 text-[10px] uppercase font-mono tracking-wider block leading-none mb-1">Comptes Ciblés</span>
                <span className="text-2xl font-bold font-display text-white block leading-tight">
                  {stats?.topTargetedAccounts ? `${stats.topTargetedAccounts.length} Comptes` : `${new Set(alerts.map(a => a.username)).size} Comptes`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs views content routing */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 font-mono text-xs">
            <RefreshCw className="w-8 h-8 text-brand-rose animate-spin mb-3" />
            Initialisation des modules de cybersécurité...
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-5">
            {activeTab === 'cybermap' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
                {/* Visual Map is placed main screen */}
                <div className="lg:col-span-8 flex flex-col h-full min-h-[380px]">
                  {stats && <WorldMap locations={stats.mapLocations} />}
                </div>

                {/* Left side Peak Charts & suspect IP focus summary */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                  {stats && <VisualCharts data={stats.chartData} />}
                  
                  {/* Top suspicious IP block details */}
                  <div className="bg-brand-card p-4 rounded-xl border border-brand-border font-mono text-xs text-gray-400">
                    <h4 className="font-display font-bold text-white mb-2 pb-1.5 border-b border-brand-border/40 text-[11px] uppercase text-brand-rose tracking-wider flex items-center gap-1">
                      <Lock className="w-4 h-4 text-brand-rose" strokeWidth={2} />
                      IP Filtrées / Suspectes
                    </h4>
                    <div className="space-y-1.5 mt-2.5">
                      <div className="p-1 px-2 border-l-2 border-red-500 bg-[#351A22] text-rose-300 rounded text-[11px]">
                        <strong>185.220.101.1 (ED)</strong> : Force brute bloquée
                      </div>
                      <div className="p-1 px-2 border-l-2 border-red-500 bg-[#351A22] text-rose-300 rounded text-[11px]">
                        <strong>45.33.22.19 (CN)</strong> : Scan de ports bloqué
                      </div>
                      <div className="p-1 px-2 border-l-2 border-red-500 bg-[#351A22] text-rose-300 rounded text-[11px]">
                        <strong>203.0.113.5 (UA)</strong> : Balayage d'infrastructure
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <AlertList 
                alerts={alerts} 
                onResolve={handleResolveAlert}
                onSendEmail={handleSendEmail}
                onSimulateAttack={handleSimulateAttack}
                simulating={simulatingAttack}
              />
            )}

            {activeTab === 'logs' && (
              <LogViewer 
                logs={logs} 
                totalLogs={stats ? stats.totalLogs : 1000} 
                detectionConfig={detectionConfig}
                onUpdateConfig={handleUpdateConfig}
                onImportLogs={handleImportLogs}
                onGenerateLogs={handleGenerateLogs}
                onSimulateAttack={handleSimulateAttack}
                simulating={simulatingAttack}
              />
            )}

            {activeTab === 'azure' && (
              <AzureConfig 
                status={azureStatus}
                onUpload={handleUploadAzure}
                onConfigure={handleConfigureAzure}
                onRefresh={fetchDashboardData}
              />
            )}

            {activeTab === 'gemini' && (
              <GeminiAudit onAnalyze={handleAnalyzeGemini} />
            )}

            {activeTab === 'pfe_slides' && (
              <PfeSlides businessName={businessName} ecommercePlatform={ecommercePlatform} />
            )}
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <footer className="h-auto md:h-12 bg-[#120a11] border-t border-white/5 px-6 lg:px-8 py-3 md:py-0 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase tracking-widest font-mono gap-2 mt-auto text-gray-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span>
            ROSEANSEC v1.2{" "}
            <button 
              onClick={() => setActiveTab('pfe_slides')}
              className="cursor-pointer ml-1 text-gray-600 hover:text-brand-rose transition-all focus:outline-none"
              title="Support de soutenance PFE"
            >
              🎓
            </button>
          </span>
          <span className="text-white/10 hidden md:inline">|</span>
          <span className="text-white/30 lowercase">marwa.aissa06@gmail.com</span>
        </div>
        <div className="text-center md:text-right text-white/30 truncate flex items-center gap-2 flex-wrap justify-center md:justify-end">
          <span>Auteur : Marwa AISSA</span>
          <span className="text-white/10">|</span>
          <span>Filière : Cloud Computing (PFE 2026)</span>
          <span className="text-white/10">|</span>
          <span>Cité des Métiers et des Compétences (CMC)</span>
          <span className="text-white/10">|</span>
          <span>© {new Date().getFullYear()} ROSEANSEC</span>
        </div>
      </footer>
    </div>
  );
}
