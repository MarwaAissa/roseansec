import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShieldCheck, Crosshair, RefreshCw, Zap, Eye, EyeOff, Radio, Terminal, Settings } from 'lucide-react';

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

// Fixed coordinates map projection
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
  const [hoveredNode, setHoveredNode] = useState<MapLocation | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapLocation | null>(null);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [radarActive, setRadarActive] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'MALICIOUS' | 'LEGITIMATE'>('ALL');
  
  // Custom interactive scanner line coordinates for HUD
  const [scannerCoord, setScannerCoord] = useState({ lat: 31.7917, lng: -7.0926 });
  const [trafficTicker, setTrafficTicker] = useState<string[]>([]);
  const tickerContainerRef = useRef<HTMLDivElement>(null);

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

  // Combine real locations from database/state with high-quality pre-populated nodes to keep dashboard beautifully alive
  const activeLocations = useMemo(() => {
    const list = [...locations];
    
    // If no locations are provided by parent, fallback to high-quality default set
    if (list.length === 0) {
      list.push(
        { ip: '185.220.101.1', country: 'Russia (Moscow)', lat: 55.7558, lng: 37.6173, isMalicious: true, count: 840 },
        { ip: '45.33.22.19', country: 'China (Beijing)', lat: 39.9042, lng: 116.4074, isMalicious: true, count: 312 },
        { ip: '203.0.113.5', country: 'Ukraine (Kyiv)', lat: 50.4501, lng: 30.5234, isMalicious: true, count: 250 },
        { ip: '195.154.122.99', country: 'France (Paris)', lat: 48.8566, lng: 2.3522, isMalicious: false, count: 5120 },
        { ip: '8.8.8.8', country: 'United States (Washington)', lat: 38.9072, lng: -77.0369, isMalicious: false, count: 3410 }
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

  // Effect to drive dynamic threat log stream matching Kaspersky Cybermap ticker
  useEffect(() => {
    const attackTypes = [
      'Brute Force SSH Login Attempt',
      'Port Scanning TCP/UDP Syn',
      'Unauthorized RDP Connection',
      'MFA Bypass Exhaustion Push',
      'DDoS NTP Amplification Stream',
      'Sec-IA Auto Blocked Payload'
    ];

    const generateLogTicker = () => {
      const randomNode = activeLocations[Math.floor(Math.random() * activeLocations.length)];
      if (!randomNode) return;
      
      const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const action = randomNode.isMalicious 
        ? `\u001b[31m[BLOQUÉ]\u001b[0m IP ${randomNode.ip} (${randomNode.country}) → ${attackTypes[Math.floor(Math.random() * attackTypes.length)]}`
        : `\u001b[32m[PASS]\u001b[0m IP ${randomNode.ip} (${randomNode.country}) au tunnel VPN sécurisé`;

      // Update scanner coordinates to represent actual dynamic tracking
      setScannerCoord({ lat: randomNode.lat, lng: randomNode.lng });

      setTrafficTicker(prev => {
        const next = [...prev, `[${timeStr}] ${action}`];
        if (next.length > 25) next.shift();
        return next;
      });
    };

    const interval = setInterval(generateLogTicker, simulationActive ? 1400 : 5000);
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
    <div className="relative w-full bg-[#1A1118] rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl selection:bg-rose-900/40">
      
      {/* Map Header Toolbar */}
      <div className="px-5 py-3.5 bg-[#251923] border-b border-white/10 flex flex-col xl:flex-row gap-3 xl:items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#800020]/40 border border-[#FFB6C1]/30 flex items-center justify-center relative">
            <Radio className="w-4 h-4 text-[#FFB6C1]" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-[#FFB6C1] tracking-wider uppercase flex items-center gap-2">
              CARTE DE TRAFIC CYBER
            </h3>
            <p className="text-[10px] text-white/50 font-mono tracking-wider mt-0.5">
              Surveillance du trafic actif
            </p>
          </div>
        </div>

        {/* Quick controls panel */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Severity selector */}
          <div className="bg-black/30 border border-white/5 p-1 rounded-lg flex items-center gap-1">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all uppercase cursor-pointer ${
                filterSeverity === 'ALL' ? 'bg-[#800020] text-white font-semibold' : 'text-white/40 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterSeverity('MALICIOUS')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all uppercase cursor-pointer ${
                filterSeverity === 'MALICIOUS' ? 'bg-red-900/60 text-red-300 font-semibold' : 'text-white/40 hover:text-white'
              }`}
            >
              Menaces
            </button>
            <button
              onClick={() => setFilterSeverity('LEGITIMATE')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all uppercase cursor-pointer ${
                filterSeverity === 'LEGITIMATE' ? 'bg-blue-900/60 text-blue-300 font-semibold' : 'text-white/40 hover:text-white'
              }`}
            >
              VPN/Sains
            </button>
          </div>

          {/* Interactive features togglers */}
          <button
            onClick={() => setRadarActive(!radarActive)}
            title="Toggle Radar Sweep Effect"
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              radarActive ? 'bg-[#800020]/30 text-[#FFB6C1] border-[#FFB6C1]/30' : 'bg-transparent text-white/30 border-white/5 hover:text-white/60'
            }`}
          >
            {radarActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setSimulationActive(!simulationActive)}
            title="Toggle Real-time Attack Simulation Stream"
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              simulationActive ? 'bg-[#800020]/30 text-emerald-400 border-emerald-500/20' : 'bg-transparent text-white/30 border-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Body Display */}
      <div className="relative flex-1 w-full min-h-[380px] lg:min-h-[440px] bg-[#120a11] overflow-hidden flex flex-col">
        
        {/* Subtle background tech scanner details, lines & coordinate overlay */}
        <div className="absolute inset-x-0 top-4 px-6 flex justify-between select-none pointer-events-none text-[9px] font-mono text-white/25">
          <span>LAT TRACKER: {scannerCoord.lat.toFixed(4)}° N</span>
          <span>LNG TRACKER: {scannerCoord.lng.toFixed(4)}° E</span>
          <span className="hidden sm:inline">CYBERMAP RESOLUTION: 800x400 VECTOR ENGINE</span>
        </div>

        {/* Floating tactical coordinates HUD lock */}
        <div className="absolute left-4 bottom-4 bg-black/50 border border-white/10 p-3 rounded-lg backdrop-blur-sm z-10 max-w-[200px] hidden md:block select-none font-mono text-[9px] space-y-1.5 text-white/70">
          <div className="flex items-center gap-1 text-[#FFB6C1] font-semibold">
            <Crosshair className="w-3.5 h-3.5" />
            <span>CENTRAL HUD LOCK</span>
          </div>
          <p className="text-white/40 border-b border-white/5 pb-1 uppercase">Morocco Core Fireall</p>
          <p>Node IP: <span className="text-white font-semibold">196.115.12.9</span></p>
          <p>Region: <span className="text-white">Casablanca</span></p>
          <p>Defense status: <span className="text-green-400 font-semibold uppercase animate-pulse">Actif Shield</span></p>
        </div>

        {/* Dynamic Hover Tooltip */}
        {(hoveredNode || selectedNode) && (
          <div 
            className="absolute rounded-xl bg-[#251923]/95 border border-[#FFB6C1]/30 p-3.5 shadow-2xl z-20 max-w-[280px] backdrop-blur text-xs select-text font-mono transition-all duration-150"
            style={{ 
              top: '20px', 
              right: '20px'
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <span className={`font-semibold tracking-wide uppercase flex items-center gap-1.5 ${
                (hoveredNode || selectedNode)?.isMalicious ? 'text-red-400' : 'text-blue-400'
              }`}>
                <span>●</span> {(hoveredNode || selectedNode)?.isMalicious ? 'INTRUSION DIRECTE' : 'Trafic de Confiance'}
              </span>
              <button 
                onClick={() => setSelectedNode(null)} 
                className="text-white/40 hover:text-white/100 text-[10px]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-white/80">
              <p><strong className="text-white/40">IP Source:</strong> {(hoveredNode || selectedNode)?.ip}</p>
              <p><strong className="text-white/40">Pays d'Origine:</strong> {(hoveredNode || selectedNode)?.country}</p>
              <p><strong className="text-white/40">Requêtes bloquées:</strong> {(hoveredNode || selectedNode)?.count.toLocaleString()}</p>
              <p className="pt-1.5 mt-1 border-t border-white/5 flex items-center gap-1">
                <strong className="text-white/40">Action Sec-IA:</strong>
                {(hoveredNode || selectedNode)?.isMalicious ? (
                  <span className="text-orange-400 font-semibold bg-orange-950/40 px-1.5 py-0.2 rounded border border-orange-500/20 text-[9px]">IP BLACKLISTÉE</span>
                ) : (
                  <span className="text-green-400 font-semibold bg-green-950/40 px-1.5 py-0.2 rounded border border-green-500/20 text-[9px]">TUNNEL AUTORISÉ</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Vector SVG World Projection Stage Container */}
        <div className="flex-1 w-full h-full flex items-center justify-center p-4">
          <svg 
            viewBox="0 0 800 400" 
            className="w-full max-w-[800px] aspect-[2/1] bg-black/10 rounded-xl relative overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            
            {/* 1. Definitions for Grid Patterns and Continent Matrix Mesh Masks */}
            <defs>
              {/* World Dot Grid overall pattern */}
              <pattern id="dotPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.1" fill="#FFB6C1" opacity="0.06" />
              </pattern>

              {/* High-intensity glowing green/rose security grid representing landmass matrices */}
              <pattern id="landMeshPattern" width="7" height="7" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="0.9" fill="#FFB6C1" opacity="0.25" />
              </pattern>

              {/* Combined continent mask */}
              <mask id="worldContinentsMask">
                <rect width="800" height="400" fill="black" />
                {Object.values(CONTINENT_PATHS).map((path, idx) => (
                  <path key={idx} d={path} fill="white" />
                ))}
              </mask>

              {/* Parabolic Glow filters */}
              <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 2. Main Ambient Graphic Layers */}
            {/* Overall dot-grid background representing cyberspace matrix */}
            <rect width="800" height="400" fill="url(#dotPattern)" className="pointer-events-none" />

            {/* Radial cyber-rings representing threat monitoring scope centered around Morocco */}
            <circle cx={moroccoX} cy={moroccoY} r="80" fill="none" stroke="red" strokeWidth="0.5" strokeDasharray="4,8" className="opacity-15" />
            <circle cx={moroccoX} cy={moroccoY} r="160" fill="none" stroke="red" strokeWidth="0.4" strokeDasharray="2,6" className="opacity-10" />
            <circle cx={moroccoX} cy={moroccoY} r="250" fill="none" stroke="red" strokeWidth="0.3" strokeDasharray="1,5" className="opacity-5" />

            {/* 3. Render Solid Continents base for rich high contrast */}
            <g className="opacity-95 pointer-events-none">
              {Object.entries(CONTINENT_PATHS).map(([name, path]) => (
                <path 
                  key={name}
                  d={path} 
                  fill="#1B0C16" 
                  stroke="rgba(255,182,193,0.12)" 
                  strokeWidth="0.8"
                />
              ))}
            </g>

            {/* 4. Render Kaspersky-style Land Dotted Matrix Layer (Extremely beautiful outline projection!) */}
            <rect 
              width="800" 
              height="400" 
              fill="url(#landMeshPattern)" 
              mask="url(#worldContinentsMask)" 
              className="pointer-events-none"
            />

            {/* 5. Animated radar sweep line centering Morocco */}
            {radarActive && (
              <g className="radar-sweep-line pointer-events-none">
                <line 
                  x1={moroccoX} 
                  y1={moroccoY} 
                  x2={800} 
                  y2={200} 
                  stroke="rgba(255, 182, 193, 0.45)" 
                  strokeWidth="1.2"
                  filter="url(#cyberGlow)"
                  className="origin-center"
                />
                <circle 
                  cx={moroccoX} 
                  cy={moroccoY} 
                  r="140" 
                  fill="url(#radarGradient)" 
                  className="opacity-10"
                />
              </g>
            )}

            {/* 6. Draw glowing attack arcs cascaded to Casablanca target location */}
            {activeLocations.map((loc, idx) => {
              // Convert coord to flat X and Y
              const locX = getX(loc.lng);
              const locY = getY(loc.lat);

              // Don't draw curves to Morocco on itself
              if (loc.country.includes('Morocco')) return null;

              const bezierD = getBezierCurve(locX, locY, moroccoX, moroccoY);

              // Dynamic duration based on query count
              const durationSeconds = Math.max(1.5, Math.min(4.5, 6 - (loc.count / 400)));

              return (
                <g key={`arc-${idx}`} className="transition-all duration-300">
                  {/* Outer atmospheric glowing shadow arc */}
                  <path 
                    d={bezierD} 
                    fill="none" 
                    stroke={loc.isMalicious ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)'} 
                    strokeWidth="3.5" 
                    className="pointer-events-none"
                  />
                  {/* Glowing thin connector core */}
                  <path 
                    d={bezierD} 
                    fill="none" 
                    stroke={loc.isMalicious ? 'rgba(239, 68, 68, 0.65)' : 'rgba(59, 130, 246, 0.55)'} 
                    strokeWidth="0.95" 
                    strokeDasharray="4,4"
                    className="pointer-events-none"
                  />

                  {/* High-speed sliding photon packets riding down the parabolic cyber curve */}
                  {simulationActive && (
                    <circle r="3.2" fill={loc.isMalicious ? '#ef4444' : '#60a5fa'} className="shadow-2xl">
                      <animateMotion 
                        dur={`${durationSeconds}s`} 
                        repeatCount="indefinite" 
                        path={bezierD} 
                      />
                    </circle>
                  )}
                  {simulationActive && (
                    <circle r="1.5" fill="#ffffff" opacity="0.9">
                      <animateMotion 
                        dur={`${durationSeconds}s`} 
                        repeatCount="indefinite" 
                        path={bezierD} 
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* 7. Plotting main coordinate nodes & visual tooltips indicators */}
            {/* Central Defensive Shield in Morocco */}
            <g className="cursor-pointer">
              {/* Outer pulsing defense rings */}
              <circle cx={moroccoX} cy={moroccoY} r="15" fill="none" stroke="#FFB6C1" strokeWidth="1" className="animate-ping opacity-25" />
              <circle cx={moroccoX} cy={moroccoY} r="7" fill="none" stroke="#FFB6C1" strokeWidth="1.5" className="animate-pulse" />
              
              {/* Core Hub point */}
              <circle 
                cx={moroccoX} 
                cy={moroccoY} 
                r="4.5" 
                fill="#ffffff" 
                stroke="#FFB6C1" 
                strokeWidth="2.5" 
                filter="url(#cyberGlow)"
                onMouseEnter={() => setHoveredNode(moroccoTarget)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(moroccoTarget)}
              />
            </g>

            {/* Plot attacking / client terminals */}
            {activeLocations.map((loc, idx) => {
              const locX = getX(loc.lng);
              const locY = getY(loc.lat);

              if (loc.country.includes('Morocco')) return null;

              const particleColor = loc.isMalicious ? '#ef4444' : '#3b82f6';
              const ringColor = loc.isMalicious ? 'rgba(239,68,68,0.45)' : 'rgba(59,130,246,0.45)';

              const isFocused = hoveredNode?.ip === loc.ip || selectedNode?.ip === loc.ip;

              return (
                <g 
                  key={`node-${idx}`} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(loc)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(loc)}
                >
                  {/* Glowing alert aura */}
                  <circle 
                    cx={locX} 
                    cy={locY} 
                    r={isFocused ? 14 : 9} 
                    fill="none" 
                    stroke={ringColor} 
                    strokeWidth={isFocused ? 2 : 1.2} 
                    className="transition-all duration-200 animate-pulse" 
                  />
                  {/* Central Node Dot Core */}
                  <circle 
                    cx={locX} 
                    cy={locY} 
                    r={isFocused ? 5 : 3.5} 
                    fill={particleColor} 
                    stroke="#ffffff" 
                    strokeWidth="1" 
                    className="transition-all duration-200 shadow-md"
                    filter={isFocused ? "url(#cyberGlow)" : ""}
                  />

                  {/* Elegant coordinate indicator line overlay */}
                  {isFocused && (
                    <g className="opacity-60 pointer-events-none">
                      <line x1={locX} y1={locY} x2={locX} y2={locY + 25} stroke={particleColor} strokeWidth="0.8" />
                      <circle cx={locX} cy={locY + 25} r="2" fill={particleColor} />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic sub-map cyber ticker terminal log panel */}
        <div className="h-28 bg-[#251923]/60 border-t border-white/5 p-3 font-mono flex flex-col justify-end">
          <div className="flex items-center gap-1.5 text-[9px] text-[#FFB6C1]/50 mb-1.5 font-bold uppercase tracking-wider select-none">
            <Terminal className="w-3.5 h-3.5" />
            <span>FLUX DE TRAFIC ACTIF</span>
            <span className="ml-auto flex items-center gap-1 text-[8px] bg-red-950/40 text-[#FFB6C1] px-1.5 py-0.2 rounded border border-red-500/10">
              {activeLocations.length} sources surveillées
            </span>
          </div>

          <div 
            ref={tickerContainerRef}
            className="flex-1 overflow-y-auto text-[9px] text-zinc-300 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800 pr-2 leading-relaxed"
          >
            {trafficTicker.length === 0 ? (
              <p className="text-zinc-500 select-none">{"[SYSTEM]"} Initialisation du flux cybermap, attente de paquets...</p>
            ) : (
              trafficTicker.map((tick, i) => {
                // Quick terminal color formatting codes
                const renderedText = tick
                  .replace('\u001b[31m[BLOQUÉ]\u001b[0m', '[-] BLOQUÉ')
                  .replace('\u001b[32m[PASS]\u001b[0m', '[+] ACCÈS');

                return (
                  <p key={i} className="font-mono text-[9px] border-l border-white/5 pl-2 select-text">
                    <span className="text-[#FFB6C1]/30 mr-1.5">{"$"}</span>
                    {renderedText}
                  </p>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Embedded CSS for keyframes radar sweeps to render independently of bundler limitations */}
      <style>{`
        @keyframes sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .radar-sweep-line {
          transform-origin: 384.2px 129.3px;
          animation: sweep 12s linear infinite;
        }
      `}</style>

    </div>
  );
}
