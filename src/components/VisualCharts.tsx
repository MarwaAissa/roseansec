import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

interface ChartHourData {
  hour: string;
  hourNum: number;
  success: number;
  attacks: number;
  failures: number;
}

interface VisualChartsProps {
  data: ChartHourData[];
}

export default function VisualCharts({ data }: VisualChartsProps) {
  // Sort by hour sequence 0h to 23h
  const sortedData = [...data].sort((a, b) => a.hourNum - b.hourNum);

  return (
    <div className="bg-brand-card p-5 rounded-xl border border-brand-border flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-brand-border pb-3">
        <div>
          <h3 className="font-display font-medium text-brand-rose flex items-center gap-2">
            ÉVOLUTION DES ACCÈS (24H)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Évolution horaire des connexions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-[#1E131D] px-2.5 py-1 rounded border border-brand-border text-[#FFB6C1]">
          <span>FENÊTRE ANALYTIQUE : ACTIVE</span>
        </div>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" h="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4D2D3E" opacity={0.3} />
            <XAxis 
              dataKey="hour" 
              stroke="#A88B9E" 
              fontSize={10}
              tickLine={false} 
            />
            <YAxis 
              stroke="#A88B9E" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#251823',
                borderColor: '#4D2D3E',
                color: '#F3EAF0',
                fontFamily: 'monospace',
                fontSize: '11px',
                borderRadius: '8px',
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#A88B9E' }}
            />
            {/* Success connections - light purple-blue tone */}
            <Bar 
              name="Connexions Légitimes" 
              dataKey="success" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
            />
            {/* Brute force peak attacks - critical red/rose tone */}
            <Bar 
              name="Attaques Force Brute" 
              dataKey="attacks" 
              fill="#EF4444" 
              radius={[4, 4, 0, 0]} 
            />
            {/* Standard failures - standard purple orange */}
            <Bar 
              name="Échecs Communs" 
              dataKey="failures" 
              fill="#F59E0B" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1 text-xs">
        <div className="p-3 rounded-lg bg-[#2E1524] border border-[#800020]/30">
          <p className="text-[#A88B9E] font-medium">Pic d'activité</p>
          <p className="text-xl font-display font-bold text-red-400 mt-1">02:00 — 05:00</p>
          <p className="text-[10px] text-gray-400 mt-1">Concentration principale des anomalies.</p>
        </div>
        <div className="p-3 rounded-lg bg-[#1E131D] border border-brand-border">
          <p className="text-[#A88B9E] font-medium">Flux Légitime Global</p>
          <p className="text-xl font-display font-bold text-[#FFB6C1] mt-1">~90%</p>
          <p className="text-[10px] text-gray-400 mt-1">Activité régulière d'accès.</p>
        </div>
        <div className="p-3 rounded-lg bg-[#1E131D] border border-brand-border">
          <p className="text-[#A88B9E] font-medium">Efficacité de Détection</p>
          <p className="text-xl font-display font-bold text-green-400 mt-1">100%</p>
          <p className="text-[10px] text-gray-400 mt-1">Filtrage actif en temps réel.</p>
        </div>
      </div>
    </div>
  );
}
