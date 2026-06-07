import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShieldCheck, Crosshair, RefreshCw, Zap, Eye, EyeOff, Radio, Terminal, Award, Globe, Shield, Activity, ListOrdered, Server } from 'lucide-react';
import L from 'leaflet';

interface MapLocation {
  ip: string;
  country: string;
  lat: number;
  lng: number;
  isMalicious: boolean;
  count: number;
}

interface WorldMapProps {
  locations: MapLocation[];
}

// Map projection helpers
const getX = (lng: number) => ((lng + 180) / 360) * 800;
const getY = (lat: number) => ((90 - lat) / 180) * 400;

// High fidelity simplified continental SVG outlines matching equirectangular projection
const CONTINENT_PATHS = {
  greenland: "M 235,25 L 290,20 L 280,50 L 225,45 Z",
  northAmerica: "M 35,65 L 75,55 L 120,40 L 190,45 L 255,42 L 245,85 L 260,120 L 210,155 L 180,185 L 175,235 L 160,240 L 155,195 L 130,175 L 105,135 L 65,115 L 30,80 Z",
  southAmerica: "M 205,185 L 230,180 L 255,200 L 295,235 L 290,285 L 240,345 L 225,375 L 220,375 L 210,325 L 195,265 L 200,225 Z",
  africa: "M 342,122 L 360,120 L 410,125 L 480,145 L 493,175 L 470,230 L 440,285 L 430,305 L 415,345 L 395,355 L 390,315 L 365,275 L 345,235 L 342,175 L 340,145 Z",
  eurasia: "M 360,122 L 375,95 L 405,70 L 455,60 L 515,35 L 575,30 L 685,32 L 765,42 L 780,70 L 745,120 L 765,140 L 745,180 L 715,170 L 700,220 L 665,245 L 615,220 L 585,240 L 560,235 L 545,190 L 520,183 L 515,220 L 500,230 L 475,200 L 445,185 L 410,180 L 380,145 Z",
  australia: "M 635,255 L 695,245 L 725,285 L 720,325 L 675,345 L 635,295 Z",
  antarctica: "M 100,380 L 700,380 L 650,395 L 150,395 Z"
};

export default function WorldMap({ locations }: WorldMapProps) {
  const [mapMode, setMapMode] = useState<'global' | 'morocco'>('global');
  const [hoveredNode, setHoveredNode] = useState<MapLocation | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapLocation | null>(null);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [radarActive, setRadarActive] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'MALICIOUS' | 'LEGITIMATE'>('ALL');
  
  // Tactical scanner details
  const [scannerCoord, setScannerCoord] = useState({ lat: 31.7917, lng: -7.0926 });
  const [trafficTicker, setTrafficTicker] = useState<string[]>([]);
  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Real-time incremental attack simulation counters inspired by Norse & Kaspersky HUDs
  const [attackerLeaderboard, setAttackerLeaderboard] = useState([
    { country: 'Russie', code: 'RU', count: 18452, ip: '185.220.101.1', color: 'text-red-500' },
    { country: 'Chine', code: 'CN', count: 14210, ip: '45.33.22.19', color: 'text-orange-500' },
    { country: 'Ukraine', code: 'UA', count: 9112, ip: '203.0.113.5', color: 'text-rose-500' },
    { country: 'Pays-Bas', code: 'NL', count: 5410, ip: '109.112.4.99', color: 'text-blue-400' },
    { country: 'États-Unis', code: 'US', count: 4890, ip: '8.8.8.8', color: 'text-amber-400' }
  ]);

  const [targetPorts, setTargetPorts] = useState([
    { port: '22', name: 'SSH (BruteForce)', count: 24501, pct: 48 },
    { port: '80', name: 'HTTP (ModSec Check)', count: 12102, pct: 24 },
    { port: '443', name: 'HTTPS (SSL Flood)', count: 8900, pct: 18 },
    { port: '3389', name: 'RDP (Exploit)', count: 3201, pct: 6 },
    { port: '8080', name: 'API Router (Bypass)', count: 1980, pct: 4 }
  ]);

  const [secIaActions, setSecIaActions] = useState({
    nsgBlocks: 840,
    azureWafBlocks: 1240,
    smtpAlerts: 432,
    geminiAudits: 284,
    unjustifiedExfiltrations: 0
  });

  // Initialize and update Leaflet Map focused on Moroccan economic hubs
  useEffect(() => {
    if (mapMode !== 'morocco') {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      return;
    }

    if (typeof window === 'undefined') return;

    // Brief timeout to ensure DOM container is fully painted
    const timer = setTimeout(() => {
      const container = document.getElementById('leaflet-morocco-map');
      if (!container) return;

      // Reset any previous map container
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      // Create Leaflet instance centered on Morocco
      const map = L.map('leaflet-morocco-map', {
        center: [31.5, -7.5],
        zoom: 6,
        zoomControl: true,
        attributionControl: true
      });

      leafletMapRef.current = map;

      // Stunning dark neon tiles (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18
      }).addTo(map);

      // Cities in Morocco with active RoseanSec nodes for the presentation
      const MOROCCO_CITIES = [
        {
          name: 'Casablanca Headquarters Node',
          desc: 'Réseau Host Principal de Production & Reverse-Proxy local',
          platform: 'WooCommerce Active Gateway',
          lat: 33.5731,
          lng: -7.5898,
          status: 'BLINDÉ',
          ip: '196.115.12.9',
          protection: '99.8%',
          hasAlert: false
        },
        {
          name: 'Rabat Admin Firewall',
          desc: 'Passerelle Cloud de répartition de charge & WAF',
          platform: 'CMS Multi-boutique',
          lat: 34.0208,
          lng: -6.8416,
          status: 'OPTIMAL',
          ip: '196.115.12.24',
          protection: '99.9%',
          hasAlert: false
        },
        {
          name: 'Marrakech Active Storefront',
          desc: 'Instance active e-commerce, filtrage actif IP Geo-Fencing',
          platform: 'PrestaShop API Node V3',
          lat: 31.6295,
          lng: -7.9811,
          status: 'STRESS-TEST SOUTENANCE',
          ip: '196.115.42.102',
          protection: '99.7%',
          hasAlert: true // Highlighting this node specifically for active attack simulations
        },
        {
          name: 'Tanger Port Gateway',
          desc: 'Boutique Front-end, CDN régional & filtrage GeoIP',
          platform: 'Shopify Custom Middleware',
          lat: 35.7595,
          lng: -5.8340,
          status: 'SÉCURISÉ',
          ip: '196.115.90.3',
          protection: '99.9%',
          hasAlert: false
        },
        {
          name: 'Fès Stock Synchronization',
          desc: 'Index de synchronisation chiffré des stocks',
          platform: 'Magento Module Secure',
          lat: 34.0181,
          lng: -5.0078,
          status: 'DORMANT',
          ip: '196.115.18.55',
          protection: '99.4%',
          hasAlert: false
        },
        {
          name: 'Agadir Transaction Node',
          desc: "Réseau privé d'administration et d'archivage des transactions d'achats",
          platform: 'Custom Laravel Portal',
          lat: 30.4278,
          lng: -9.5981,
          status: 'BLINDÉ',
          ip: '196.115.101.8',
          protection: '99.9%',
          hasAlert: false
        }
      ];

      MOROCCO_CITIES.forEach((city) => {
        // Render custom animated HTML markers
        const iconHtml = city.hasAlert 
          ? `<div class="relative w-6 h-6 flex items-center justify-center">
              <div class="animate-ping absolute w-6 h-6 rounded-full bg-rose-500 opacity-60"></div>
              <div class="w-3.5 h-3.5 rounded-full bg-[#ef4444] border-2 border-[#FFC1C1] shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
             </div>`
          : `<div class="relative w-6 h-6 flex items-center justify-center">
              <div class="animate-ping absolute w-4 h-4 rounded-full bg-emerald-400 opacity-30"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white shadow"></div>
             </div>`;

        const customIcon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const popupContent = `
          <div class="font-mono text-xs p-1 select-none min-w-[220px] text-gray-200">
            <div class="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
              <span class="font-bold text-[#FFB6C1] uppercase tracking-wide text-[10px]">${city.name}</span>
              <span class="px-1.5 py-0.2 rounded text-[8px] font-bold ${
                city.hasAlert ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              }">${city.status}</span>
            </div>
            <div class="space-y-1 text-[10px]">
              <p><strong class="text-white/40">IP d'écoute :</strong> <span class="text-white font-semibold">${city.ip}</span></p>
              <p><strong class="text-white/40">Solution active :</strong> <span class="text-slate-300">${city.platform}</span></p>
              <p><strong class="text-white/40">Diagnostic :</strong> <span class="text-green-400">${city.protection} de Sécurité Active</span></p>
              <p class="text-[9.5px] leading-normal border-t border-white/5 pt-1.5 mt-1.5 text-zinc-400 italic">${city.desc}</p>
            </div>
          </div>
        `;

        const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent);

        // Open active attack nodes dynamically
        if (city.hasAlert) {
          marker.openPopup();
        }
      });

    }, 200);

    return () => {
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapMode]);

  // Morocco Central Target
  const moroccoTarget: MapLocation = {
    ip: '196.115.12.9',
    country: 'Morocco (Rabat)',
    lat: 31.7917,
    lng: -7.0926,
    isMalicious: false,
    count: 14022
  };

  const moroccoX = getX(moroccoTarget.lng);
  const moroccoY = getY(moroccoTarget.lat);

  // Combine parent inputs with Norse telemetry defaults coordinates list
  const activeLocations = useMemo(() => {
    const list = [...locations];
    
    // Injected famous threat points
    if (list.length === 0) {
      list.push(
        { ip: '185.220.101.1', country: 'Russie (Moscou)', lat: 55.7558, lng: 37.6173, isMalicious: true, count: 840 },
        { ip: '45.33.22.19', country: 'Chine (Pékin)', lat: 39.9042, lng: 116.4074, isMalicious: true, count: 312 },
        { ip: '203.0.113.5', country: 'Ukraine (Kyiv)', lat: 50.4501, lng: 30.5234, isMalicious: true, count: 250 },
        { ip: '109.112.4.99', country: 'Pays-Bas (Amsterdam)', lat: 52.3676, lng: 4.9041, isMalicious: true, count: 182 },
        { ip: '195.154.122.99', country: 'France (Paris)', lat: 48.8566, lng: 2.3522, isMalicious: false, count: 5120 },
        { ip: '8.8.8.8', country: 'États-Unis (Washington)', lat: 38.9072, lng: -77.0369, isMalicious: false, count: 3410 }
      );
    }

    // Filter by user selection
    if (filterSeverity === 'MALICIOUS') {
      return list.filter(l => l.isMalicious);
    }
    if (filterSeverity === 'LEGITIMATE') {
      return list.filter(l => !l.isMalicious);
    }
    return list;
  }, [locations, filterSeverity]);

  // Effect to drive dynamic threat log stream matching Kaspersky/Norse real-time tickers and increase leaderboard counts
  useEffect(() => {
    const attackTypes = [
      'Brute Force SSH (Port 22)',
      'Port Scanning TCP Syn (Port 80)',
      'Unauthorized SSL (Port 443)',
      'MFA Exhaustion Attempt',
      'RDP Tunnel Attack (Port 3389)',
      'Sec-IA API Security Filter Bypass'
    ];

    const generateLogTicker = () => {
      const randomNode = activeLocations[Math.floor(Math.random() * activeLocations.length)];
      if (!randomNode) return;
      
      const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const currentAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      
      const formattedLog = randomNode.isMalicious 
        ? `[BLOQUÉ] IP ${randomNode.ip} (${randomNode.country}) → Target morocco-gateway:${currentAttack}`
        : `[PASS] IP ${randomNode.ip} (${randomNode.country}) au tunnel d'administration sécurisé IPsec`;

      // Update coordinate locator
      setScannerCoord({ lat: randomNode.lat, lng: randomNode.lng });

      // Append to SIEM log
      setTrafficTicker(prev => {
        const next = [...prev, `[${timeStr}] ${formattedLog}`];
        if (next.length > 25) next.shift();
        return next;
      });

      // Increment live leaderboard metric at random to make dashboard dynamically "glowing" and active
      if (randomNode.isMalicious) {
        setAttackerLeaderboard(prev => {
          return prev.map(item => {
            if (randomNode.country.includes(item.country)) {
              return { ...item, count: item.count + Math.floor(Math.random() * 5) + 1 };
            }
            return item;
          }).sort((a, b) => b.count - a.count);
        });

        // Increment target port count
        setTargetPorts(prev => {
          const rngIndex = Math.floor(Math.random() * prev.length);
          return prev.map((item, idx) => {
            if (idx === rngIndex) {
              const newCount = item.count + Math.floor(Math.random() * 4) + 1;
              return { ...item, count: newCount };
            }
            return item;
          });
        });

        // Increment automated actions metrics
        setSecIaActions(prev => {
          const rngNum = Math.random();
          return {
            ...prev,
            nsgBlocks: prev.nsgBlocks + (rngNum > 0.6 ? 1 : 0),
            azureWafBlocks: prev.azureWafBlocks + (rngNum > 0.4 ? 1 : 0),
            smtpAlerts: prev.smtpAlerts + (rngNum > 0.8 ? 1 : 0),
            geminiAudits: prev.geminiAudits + (rngNum > 0.9 ? 1 : 0)
          };
        });
      }
    };

    const interval = setInterval(generateLogTicker, simulationActive ? 1200 : 4000);
    return () => clearInterval(interval);
  }, [activeLocations, simulationActive]);

  // Handle auto scrolling for the cyber log screen
  useEffect(() => {
    if (tickerContainerRef.current) {
      tickerContainerRef.current.scrollTop = tickerContainerRef.current.scrollHeight;
    }
  }, [trafficTicker]);

  // Generate curved path between two points (standard Parabolic Bezier arc)
  const getBezierCurve = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Compute nice control points pushing upwards/perpendicularly
    const cx = (x1 + x2) / 2 - dy * 0.15;
    const cy = (y1 + y2) / 2 - Math.abs(dx) * 0.22 - 30; // Raise control point for high-arching trajectories
    
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  };

  return (
    <div className="relative w-full bg-[#08020a] rounded-2xl border border-[#a855f7]/30 overflow-hidden flex flex-col shadow-2xl selection:bg-rose-900/40">
      
      {/* 1. Global Header: Authentic Norse Threat Map look */}
      <div className="px-5 py-4 bg-[#14061a] border-b border-[#a855f7]/20 flex flex-col lg:flex-row gap-4 items-center justify-between z-10">
        
        {/* Left Badge with Blinking Active Pulse */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#a855f7]/15 border border-[#a855f7]/40 flex items-center justify-center relative">
            <Radio className="w-5 h-5 text-[#d8b4fe] animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-xs text-[#ebd5ff] tracking-widest uppercase">
                ROSEANSEC CYBER SPECTRE™ ENGINE
              </h3>
              <span className="bg-[#a855f7]/20 text-[#ebd5ff] border border-[#a855f7]/40 px-1.5 py-0.2 rounded text-[8px] font-mono uppercase tracking-widest">
                Kaspersky-Norse Real-Time Mode
              </span>
            </div>
            <p className="text-[10px] text-purple-300/40 font-mono tracking-wider mt-0.5">
              Supervision de l'infrastructure transactionnelle e-commerce Marocain
            </p>
          </div>
        </div>

        {/* HUD control and toggles segment */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Quick HUD Presets */}
          <div className="bg-[#1f0b2a] border border-[#a855f7]/20 p-1 rounded-lg flex items-center gap-1">
            <button
              onClick={() => setMapMode('global')}
              className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all uppercase cursor-pointer flex items-center gap-1 ${
                mapMode === 'global' ? 'bg-[#a855f7]/30 text-white font-bold border border-[#a855f7]/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'text-purple-300/40 hover:text-purple-200'
              }`}
            >
              🌐 Global HUD (Norse Concept)
            </button>
            <button
              onClick={() => setMapMode('morocco')}
              className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all uppercase cursor-pointer flex items-center gap-1 ${
                mapMode === 'morocco' ? 'bg-[#a855f7]/30 text-white font-bold border border-[#a855f7]/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'text-purple-300/40 hover:text-purple-200'
              }`}
            >
              🇲🇦 Zoom Maroc (Leaflet local)
            </button>
          </div>

          {/* Quick Filters */}
          {mapMode === 'global' && (
            <div className="bg-black/40 border border-white/5 p-1 rounded-lg flex items-center gap-1">
              <button
                onClick={() => setFilterSeverity('ALL')}
                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase cursor-pointer ${
                  filterSeverity === 'ALL' ? 'bg-purple-950 text-purple-200 border border-purple-500/30' : 'text-purple-300/30 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterSeverity('MALICIOUS')}
                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase cursor-pointer ${
                  filterSeverity === 'MALICIOUS' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'text-purple-300/30 hover:text-white'
                }`}
              >
                Agressions
              </button>
              <button
                onClick={() => setFilterSeverity('LEGITIMATE')}
                className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase cursor-pointer ${
                  filterSeverity === 'LEGITIMATE' ? 'bg-blue-950 text-blue-300 border border-blue-500/30' : 'text-purple-300/30 hover:text-white'
                }`}
              >
                Sains
              </button>
            </div>
          )}

          {/* Map utilities */}
          {mapMode === 'global' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRadarActive(!radarActive)}
                title="Activer/Désactiver le faisceau de balayage Radar"
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  radarActive ? 'bg-purple-950/40 text-purple-300 border-[#a855f7]/30 shadow-[0_0_6px_rgba(168,85,247,0.2)]' : 'bg-transparent text-purple-300/20 border-white/5'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSimulationActive(!simulationActive)}
                title="Activer/Désactiver le générateur de menaces en temps réel"
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  simulationActive ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_6px_rgba(16,185,129,0.2)]' : 'bg-transparent text-purple-300/20 border-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Map Dashboard Area */}
      <div className="relative w-full flex flex-col md:grid md:grid-cols-12 bg-[#0c0410] min-h-[420px] lg:min-h-[480px]">
        
        {mapMode === 'morocco' ? (
          /* REGIONAL ZOOM VIEW */
          <div className="col-span-12 w-full h-full min-h-[420px] lg:min-h-[480px] relative z-0">
            <h4 className="absolute left-4 top-4 bg-[#14061a]/90 backdrop-blur-sm px-2.5 py-1 rounded text-[9.5px] font-mono text-[#d8b4fe] border border-[#a855f7]/30 uppercase tracking-widest z-[1000] font-bold select-none pointer-events-none shadow-md">
              📡 Radar Régional Maroc (GIS Active Defense)
            </h4>
            <div id="leaflet-morocco-map" className="w-full h-full min-h-[420px] lg:min-h-[480px] z-0"></div>
          </div>
        ) : (
          /* GLOBAL GLOWING THREAT SPECTRE VIEW */
          <>
            {/* Global Visual Display Section (Col-span 9) */}
            <div className="col-span-12 lg:col-span-9 relative flex flex-col border-r border-[#a855f7]/10 p-4">
              
              {/* Tactical system coordinate header */}
              <div className="absolute inset-x-4 top-3 flex justify-between select-none pointer-events-none text-[8.5px] font-mono text-purple-300/30">
                <span>COORD LOCK: {scannerCoord.lat.toFixed(4)}° N, {scannerCoord.lng.toFixed(4)}° E</span>
                <span className="hidden sm:inline">MATRIX ENGINE: VIRTUAL VECTOR SPECTRE 800x400</span>
                <span>STATUS: ACTIVE DEFENSE STABLE</span>
              </div>

              {/* Central Shield Hologram Info Overlay */}
              <div className="absolute left-4 bottom-4 bg-[#110517]/85 border border-[#a855f7]/30 p-2.5 rounded-lg backdrop-blur-md z-15 min-w-[210px] hidden sm:block select-none font-mono text-[9px] space-y-1.5 text-purple-200/80">
                <div className="flex items-center gap-1.5 text-[#e5c7ff] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c084fc]" />
                  <span>SHIELD HOLO-LOCK : ACTIVE</span>
                </div>
                <div className="space-y-1 border-t border-[#a855f7]/20 pt-1 text-purple-300/60 font-mono">
                  <p>Passerelle : <span className="text-white font-semibold">196.115.12.9</span></p>
                  <p>Région : <span className="text-white">Casablanca Hub</span></p>
                  <p>Algorithme : <span className="text-emerald-400 font-semibold uppercase font-display select-none">FEST (Fenêtre O(1))</span></p>
                  <p className="text-[8px] italic leading-tight text-purple-400/50">Surveillance active contre brute-force robotique</p>
                </div>
              </div>

              {/* Vector SVG World Projection Stage Container */}
              <div className="flex-1 w-full h-full flex items-center justify-center py-6">
                <svg 
                  viewBox="0 0 800 400" 
                  className="w-full aspect-[2/1] bg-[#07010a] rounded-xl relative overflow-visible"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  
                  {/* Holographic grid and gradients markers definitions */}
                  <defs>
                    {/* Background cyberspace matrix pattern */}
                    <pattern id="glowingDotPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.1" fill="#c084fc" opacity="0.05" />
                    </pattern>

                    {/* Cyber grids landmass matrix pattern representation */}
                    <pattern id="cyanMeshPattern" width="8" height="8" patternUnits="userSpaceOnUse">
                      <circle cx="2.5" cy="2.5" r="0.95" fill="#a855f7" opacity="0.18" />
                    </pattern>

                    {/* Combined continent mask */}
                    <mask id="worldMatrixBounds">
                      <rect width="800" height="400" fill="black" />
                      {Object.values(CONTINENT_PATHS).map((path, idx) => (
                        <path key={idx} d={path} fill="white" />
                      ))}
                    </mask>

                    {/* Laser intense neon blur filters */}
                    <filter id="neonAttackGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Matrix background layer */}
                  <rect width="800" height="400" fill="url(#glowingDotPattern)" className="pointer-events-none" />

                  {/* Fine tactical cyber rings around Casablanca Central Firewall node */}
                  <circle cx={moroccoX} cy={moroccoY} r="70" fill="none" stroke="#a855f7" strokeWidth="0.45" strokeDasharray="3,6" className="opacity-15 animate-pulse" />
                  <circle cx={moroccoX} cy={moroccoY} r="140" fill="none" stroke="#a855f7" strokeWidth="0.3" strokeDasharray="1,4" className="opacity-10" />
                  <circle cx={moroccoX} cy={moroccoY} r="220" fill="none" stroke="#c084fc" strokeWidth="0.2" strokeDasharray="5,8" className="opacity-5" />

                  {/* Draw fine coordinate grid lines (military/tactical airspace) */}
                  <path d="M 0 100 L 800 100 M 0 200 L 800 200 M 0 300 L 800 300" stroke="#a855f7" strokeWidth="0.25" strokeDasharray="4,15" className="opacity-10 pointer-events-none" />
                  <path d="M 200 0 L 200 400 M 400 0 L 400 400 M 600 0 L 600 400" stroke="#a855f7" strokeWidth="0.25" strokeDasharray="4,15" className="opacity-10 pointer-events-none" />

                  {/* Solid high-fidelity continental backgrounds */}
                  <g className="opacity-95 pointer-events-none">
                    {Object.entries(CONTINENT_PATHS).map(([name, path]) => (
                      <path 
                        key={name}
                        d={path} 
                        fill="#120619" 
                        stroke="rgba(168,85,247,0.18)" 
                        strokeWidth="0.85"
                      />
                    ))}
                  </g>

                  {/* Landmass Glowing Dotted matrix mesh layer (True cyber threat design style) */}
                  <rect 
                    width="800" 
                    height="400" 
                    fill="url(#cyanMeshPattern)" 
                    mask="url(#worldMatrixBounds)" 
                    className="pointer-events-none"
                  />

                  {/* Dynamic Sweep Radar Laser Line */}
                  {radarActive && (
                    <g className="radar-laser-sweep pointer-events-none">
                      <line 
                        x1={moroccoX} 
                        y1={moroccoY} 
                        x2={800} 
                        y2={150} 
                        stroke="rgba(192, 132, 252, 0.4)" 
                        strokeWidth="1.1"
                        filter="url(#neonAttackGlow)"
                        className="origin-center"
                      />
                    </g>
                  )}

                  {/* PARABOLIC ATTACK LASER TRAJECTORIES (From simulated origins to Morocco) */}
                  {activeLocations.map((loc, idx) => {
                    const locX = getX(loc.lng);
                    const locY = getY(loc.lat);

                    // Skip drawing arcs from Morocco to itself
                    if (loc.country.includes('Maroc') || loc.country.includes('Morocco')) return null;

                    const bezierPathCode = getBezierCurve(locX, locY, moroccoX, moroccoY);

                    // Slower speed for harmless/safe connections, mega high speed for malicious packets
                    const speed = loc.isMalicious ? Math.max(1.2, 5 - (loc.count / 400)) : 4.5;

                    return (
                      <g key={`cyber-laser-${idx}`} className="transition-all duration-300">
                        {/* Core vector arc path trailing glow shadow */}
                        <path 
                          d={bezierPathCode} 
                          fill="none" 
                          stroke={loc.isMalicious ? 'rgba(239, 68, 68, 0.16)' : 'rgba(59, 130, 246, 0.15)'} 
                          strokeWidth="3.2" 
                          className="pointer-events-none"
                        />
                        {/* Thin vector core line */}
                        <path 
                          d={bezierPathCode} 
                          fill="none" 
                          stroke={loc.isMalicious ? 'rgba(244, 63, 94, 0.65)' : 'rgba(6, 182, 212, 0.5)'} 
                          strokeWidth="0.9" 
                          strokeDasharray="5,6"
                          className="pointer-events-none"
                        />

                        {/* Animated sliding digital packet particles (Kaspersky style) */}
                        {simulationActive && (
                          <>
                            {/* Outer bright pulsing neon envelope */}
                            <circle r="3.5" fill={loc.isMalicious ? '#f43f5e' : '#06b6d4'} className="shadow-2xl">
                              <animateMotion 
                                dur={`${speed}s`} 
                                repeatCount="indefinite" 
                                path={bezierPathCode} 
                              />
                            </circle>
                            {/* Inner white high energy spark */}
                            <circle r="1.3" fill="#ffffff">
                              <animateMotion 
                                dur={`${speed}s`} 
                                repeatCount="indefinite" 
                                path={bezierPathCode} 
                              />
                            </circle>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* MOROCCO DEFENSIVE CORE CENTRE SHIELD INDICATOR */}
                  <g className="cursor-pointer">
                    <circle cx={moroccoX} cy={moroccoY} r="18" fill="none" stroke="#22c55e" strokeWidth="0.8" className="animate-ping opacity-25" />
                    <circle cx={moroccoX} cy={moroccoY} r="9" fill="none" stroke="#22c55e" strokeWidth="1.5" className="animate-pulse" />
                    <circle 
                      cx={moroccoX} 
                      cy={moroccoY} 
                      r="4.5" 
                      fill="#ffffff" 
                      stroke="#22c55e" 
                      strokeWidth="2" 
                      filter="url(#neonAttackGlow)"
                      onMouseEnter={() => setHoveredNode(moroccoTarget)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => setSelectedNode(moroccoTarget)}
                    />
                  </g>

                  {/* ATTACKING SOURCE COORDINATE TERMINALS */}
                  {activeLocations.map((loc, idx) => {
                    const locX = getX(loc.lng);
                    const locY = getY(loc.lat);

                    if (loc.country.includes('Maroc') || loc.country.includes('Morocco')) return null;

                    const pointColor = loc.isMalicious ? '#f43f5e' : '#06b6d4';
                    const haloCircleColor = loc.isMalicious ? 'rgba(244,63,94,0.45)' : 'rgba(6,182,212,0.45)';
                    const isTargeted = hoveredNode?.ip === loc.ip || selectedNode?.ip === loc.ip;

                    return (
                      <g 
                        key={`vector-node-${idx}`} 
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredNode(loc)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => setSelectedNode(loc)}
                      >
                        {/* Dynamic threat area glow */}
                        <circle 
                          cx={locX} 
                          cy={locY} 
                          r={isTargeted ? 13 : 8.5} 
                          fill="none" 
                          stroke={haloCircleColor} 
                          strokeWidth={isTargeted ? 2 : 1.1} 
                          className="animate-pulse" 
                        />
                        {/* Solid coordinate core point */}
                        <circle 
                          cx={locX} 
                          cy={locY} 
                          r={isTargeted ? 4.5 : 3.2} 
                          fill={pointColor} 
                          stroke="#ffffff" 
                          strokeWidth="1" 
                          filter={isTargeted ? "url(#neonAttackGlow)" : ""}
                        />

                        {/* Projection vertical scanner coordinate track */}
                        {isTargeted && (
                          <g className="opacity-70 pointer-events-none">
                            <line x1={locX} y1={locY} x2={locX} y2={locY + 20} stroke={pointColor} strokeWidth="0.8" />
                            <circle cx={locX} cy={locY + 20} r="1.5" fill={pointColor} />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Dynamic Interactive Node Details Tooltip Overlay */}
              {(hoveredNode || selectedNode) && (
                <div className="absolute top-4 right-4 bg-[#14061a]/95 border border-[#a855f7]/40 p-3.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] min-w-[240px] font-mono text-xs text-purple-100 z-50 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-[#a855f7]/30 pb-2 mb-2">
                    <span className={`font-semibold tracking-wider flex items-center gap-1.5 ${
                      (hoveredNode || selectedNode)?.isMalicious ? 'text-rose-400' : 'text-cyan-400'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                      {(hoveredNode || selectedNode)?.isMalicious ? 'ATTENTION: INTRUSION ACTIVE' : 'LIAISON SÉCURISÉE'}
                    </span>
                    <button onClick={() => setSelectedNode(null)} className="text-purple-300/60 hover:text-white transition-colors cursor-pointer font-bold">✕</button>
                  </div>
                  <div className="space-y-1 text-[10.5px] leading-relaxed text-purple-200/90">
                    <p><strong className="text-purple-300/40">Adresse IP :</strong> {(hoveredNode || selectedNode)?.ip}</p>
                    <p><strong className="text-purple-300/40">Localisation :</strong> {(hoveredNode || selectedNode)?.country}</p>
                    <p><strong className="text-purple-300/40">Volumétrie Log :</strong> {(hoveredNode || selectedNode)?.count.toLocaleString()} requêtes</p>
                    <p className="pt-2 border-t border-[#a855f7]/15 mt-1.5 flex items-center justify-between">
                      <strong className="text-purple-300/40">Statut CNDP Maroc:</strong>
                      {(hoveredNode || selectedNode)?.isMalicious ? (
                        <span className="text-red-400 text-[9px] font-bold bg-red-950/40 border border-red-500/20 px-1.5 py-0.2 rounded uppercase tracking-wider">
                          IP BLACKLISTÉE
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[9px] font-bold bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase tracking-wider">
                          FILTRÉ RGPD OK
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Norse Real-time Side HUD Attack statistics Panel (Col-span 3) */}
            <div className="col-span-12 lg:col-span-3 flex flex-col bg-[#0e0413] border-t lg:border-t-0 border-[#a855f7]/10 divide-y divide-[#a855f7]/10 select-none">
              
              {/* Box 1: Sources / Leaderboard with tiny country flags representation */}
              <div className="p-4 flex flex-col flex-1 min-h-[160px]">
                <div className="flex items-center gap-1 text-[10px] text-[#ebd5ff] tracking-widest font-bold uppercase mb-3.5">
                  <Globe className="w-3.5 h-3.5 text-rose-400" />
                  <span>ORIGINES AGRESSIONS CRITIQUÉS</span>
                </div>
                <div className="space-y-2.5 flex-1 overflow-visible">
                  {attackerLeaderboard.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                        <span className="flex items-center gap-2">
                          <span className="text-purple-300/40 text-[9px] w-3 font-semibold">#{idx+1}</span>
                          <span className="font-bold text-slate-300">{item.country}</span>
                          <span className="text-[8px] bg-[#1d0a23] text-purple-300 border border-[#a855f7]/30 px-1 rounded uppercase font-semibold">{item.code}</span>
                        </span>
                        <span className={`font-bold font-mono ${item.color} tracking-wider`}>{item.count.toLocaleString()}</span>
                      </div>
                      {/* Interactive dynamic visual progress bar */}
                      <div className="w-full h-1 bg-[#180a22] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-800 to-rose-600 transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (item.count / attackerLeaderboard[0].count) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Target Protocols / Ports */}
              <div className="p-4 flex flex-col flex-1 min-h-[160px]">
                <div className="flex items-center gap-1 text-[10px] text-[#ebd5ff] tracking-widest font-bold uppercase mb-3.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PORT/PROTOCOLE CIBLE (TCP)</span>
                </div>
                <div className="space-y-2.5 flex-1">
                  {targetPorts.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                        <span className="flex items-center gap-1">
                          <span className="text-[#a855f7] font-semibold tracking-wider font-display shrink-0 w-8">P.{item.port}</span>
                          <span className="text-zinc-400 text-[9.5px] truncate max-w-[120px]">{item.name}</span>
                        </span>
                        <span className="text-[#ebd5ff] font-bold text-[9.5px]">{item.count.toLocaleString()} req</span>
                      </div>
                      {/* Cyan progress bar matching Kaspersky HUDs */}
                      <div className="w-full h-1 bg-[#180a22] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#06b6d4] transition-all duration-700" 
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Automated Actions Counters */}
              <div className="p-4 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-[#ebd5ff] tracking-widest font-bold uppercase mb-3 text-purple-200">
                  <Activity className="w-3.5 h-3.5 text-[#39ff14] animate-pulse" />
                  <span>FONCTIONS SECURITE SEC-IA</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-[#14061a] border border-[#a855f7]/25 p-2 rounded-lg text-center">
                    <span className="text-purple-300/40 text-[8px] block uppercase truncate mb-0.5">Pare-feu (NSG)</span>
                    <strong className="text-[#39ff14] text-xs font-semibold">{secIaActions.nsgBlocks}</strong>
                  </div>
                  <div className="bg-[#14061a] border border-[#a855f7]/25 p-2 rounded-lg text-center">
                    <span className="text-purple-300/40 text-[8px] block uppercase truncate mb-0.5">Azure WAF</span>
                    <strong className="text-cyan-400 text-xs font-semibold">{secIaActions.azureWafBlocks}</strong>
                  </div>
                  <div className="bg-[#14061a] border border-[#a855f7]/25 p-2 rounded-lg text-center">
                    <span className="text-purple-300/40 text-[8px] block uppercase truncate mb-0.5">SMTP Dispatched</span>
                    <strong className="text-amber-400 text-xs font-semibold">{secIaActions.smtpAlerts}</strong>
                  </div>
                  <div className="bg-[#14061a] border border-[#a855f7]/25 p-2 rounded-lg text-center">
                    <span className="text-purple-300/40 text-[8px] block uppercase truncate mb-0.5">Gemini Audits</span>
                    <strong className="text-purple-300 text-xs font-semibold">{secIaActions.geminiAudits}</strong>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* 3. Bottom Layer: SIEM Active Cyber-threat Log Ticker Bar */}
      <div className="h-32 bg-[#0a030d] border-t border-[#a855f7]/20 p-3 font-mono flex flex-col justify-end relative z-10">
        <div className="flex items-center gap-1.5 text-[9px] text-[#c084fc] mb-2 font-bold uppercase tracking-wider select-none border-b border-[#a855f7]/10 pb-1.5">
          <Terminal className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          <span>SOC SIEM INTRUSION FEED STATUS : ACTIVE_MONITORING_DAEMON</span>
          <span className="ml-auto flex items-center gap-1 text-[8.5px] bg-red-950/40 text-[#f43f5e] px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-widest font-bold">
            {activeLocations.length} sources surveillées en temps réel
          </span>
        </div>

        <div 
          ref={tickerContainerRef}
          className="flex-1 overflow-y-auto text-[9px] text-[#ebd5ff]/80 space-y-1.5 scrollbar-thin scrollbar-thumb-[#1e0728] pr-2 leading-relaxed"
        >
          {trafficTicker.length === 0 ? (
            <p className="text-purple-300/40 select-none">{"[DAEMON]"} Établissement de la liaison réseau sécurisée... Flux inactif en attente d'événements.</p>
          ) : (
            trafficTicker.map((tick, i) => {
              // Format colors elegantly for terminal inspection
              const isBlocked = tick.includes('[BLOQUÉ]');
              const formattedLine = tick
                .replace('[BLOQUÉ]', '[-] BLOQUÉ')
                .replace('[PASS]', '[+] AUTORISE INITIATED');

              return (
                <p key={i} className="font-mono text-[9.5px] border-l-2 border-[#a855f7]/30 pl-2 select-text leading-none flex items-center gap-1.5">
                  <span className="text-purple-400/40 select-none">#</span>
                  <span className={isBlocked ? 'text-rose-400 font-semibold' : 'text-cyan-400 font-semibold'}>
                    {formattedLine.split(" IP ")[0]}
                  </span>
                  <span className="text-zinc-300">
                    {formattedLine.includes(" IP ") ? `IP ${formattedLine.split(" IP ")[1]}` : formattedLine}
                  </span>
                </p>
              );
            })
          )}
        </div>
      </div>

      {/* CSS Keyframes injected here for the radial sweep and vectors trajectories */}
      <style>{`
        @keyframes radarLineSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .radar-laser-sweep {
          transform-origin: 384.2px 129.3px;
          animation: radarLineSweep 14s linear infinite;
        }
      `}</style>

    </div>
  );
}
