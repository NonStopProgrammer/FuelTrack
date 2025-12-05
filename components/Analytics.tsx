import React, { useMemo } from 'react';
import { FuelLog, Vehicle } from '../types';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, BarElement, ArcElement, Filler, ScatterController
} from 'chart.js/auto';
import { TrendingUp, AlertTriangle, Calendar, DollarSign, Droplet, Gauge, Map, ShieldAlert } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend, Filler, ScatterController
);

interface AnalyticsProps {
  logs: FuelLog[];
  vehicles: Vehicle[];
  currency: string;
}

// --- Helper Types ---
interface EfficiencyPoint {
  date: string;
  timestamp: number;
  value: number; // km/L
  vehicleId: string;
}

interface StationStat {
  name: string;
  spend: number;
  visits: number;
  avgPrice: number;
}

interface Anomaly {
  type: 'Odometer' | 'Efficiency';
  date: string;
  vehicle: string;
  details: string;
  severity: 'high' | 'medium';
}

export const Analytics: React.FC<AnalyticsProps> = ({ logs, vehicles, currency }) => {
  
  // --- Data Processing Hook ---
  const stats = useMemo(() => {
    if (!logs.length) return null;

    // Sort logs chronologically
    const sortedLogs = [...logs].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    
    // 1. KPIs
    const totalSpend = sortedLogs.reduce((acc, l) => acc + l.total_cost, 0);
    const totalLitres = sortedLogs.reduce((acc, l) => acc + l.litres, 0);
    const avgPrice = totalLitres > 0 ? totalSpend / totalLitres : 0;

    // 2. Efficiency Calculation & Anomalies
    const efficiencyPoints: EfficiencyPoint[] = [];
    const efficiencyByVehicle: Record<string, { totalDist: number, totalFuel: number, points: number[] }> = {};
    const outlierPoints: { x: number, y: number, label: string }[] = []; 
    const anomalies: Anomaly[] = [];

    vehicles.forEach(v => {
      const vLogs = sortedLogs.filter(l => l.vehicle_id === v.id);
      let vDist = 0;
      let vFuel = 0;
      const vEfficiencies: number[] = [];

      for (let i = 1; i < vLogs.length; i++) {
        const curr = vLogs[i];
        const prev = vLogs[i-1];
        const dist = curr.odometer - prev.odometer;
        
        // Check for Odometer Rollback/Error
        if (dist <= 0) {
           anomalies.push({
             type: 'Odometer',
             date: curr.ts,
             vehicle: v.name,
             details: `Reading ${curr.odometer} <= Previous ${prev.odometer}`,
             severity: 'high'
           });
        }

        // Efficiency Calc
        if (dist > 0 && curr.fill_type === 'full') {
          const kmpl = dist / curr.litres;
          
          // Detect Efficiency Anomalies
          if (kmpl > 50 || kmpl < 2) {
             anomalies.push({
               type: 'Efficiency',
               date: curr.ts,
               vehicle: v.name,
               details: `Suspiciously ${kmpl > 50 ? 'high' : 'low'} efficiency: ${kmpl.toFixed(1)} km/L`,
               severity: 'medium'
             });
          }

          if (kmpl > 0.5 && kmpl < 60) { 
            efficiencyPoints.push({
              date: curr.ts,
              timestamp: new Date(curr.ts).getTime(),
              value: kmpl,
              vehicleId: v.id
            });
            vDist += dist;
            vFuel += curr.litres;
            vEfficiencies.push(kmpl);
            outlierPoints.push({ x: curr.price_per_l, y: kmpl, label: v.name });
          }
        }
      }
      efficiencyByVehicle[v.id] = { totalDist: vDist, totalFuel: vFuel, points: vEfficiencies };
    });

    const avgEfficiency = efficiencyPoints.length 
      ? efficiencyPoints.reduce((acc, p) => acc + p.value, 0) / efficiencyPoints.length
      : 0;

    // 3. Time Trends (Cumulative Spend & Price)
    const dailySpend: Record<string, number> = {};
    const priceTrend: { date: string, timestamp: number, value: number }[] = [];
    
    sortedLogs.forEach(l => {
      const dateKey = new Date(l.ts).toLocaleDateString();
      dailySpend[dateKey] = (dailySpend[dateKey] || 0) + l.total_cost;
      priceTrend.push({ date: dateKey, timestamp: new Date(l.ts).getTime(), value: l.price_per_l });
    });

    const cumulativeSpendData = Object.entries(dailySpend)
      .sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .reduce((acc, [date, cost], i) => {
        const prev = acc.length > 0 ? acc[i-1].y : 0;
        acc.push({ x: date, y: prev + cost });
        return acc;
      }, [] as {x: string, y: number}[]);

    // 4. Forecast
    const monthlySpend: Record<string, number> = {};
    sortedLogs.forEach(l => {
      const mKey = l.ts.substring(0, 7); // YYYY-MM
      monthlySpend[mKey] = (monthlySpend[mKey] || 0) + l.total_cost;
    });
    
    const monthlySeries = Object.entries(monthlySpend).sort();
    let forecastMsg = "Data pending";
    let nextMonthForecast = 0;
    
    if (monthlySeries.length >= 2) {
      const n = monthlySeries.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      monthlySeries.forEach(([, y], x) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      });
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
      const intercept = (sumY - slope * sumX) / n;
      nextMonthForecast = slope * n + intercept;
      forecastMsg = `${currency}${Math.max(0, nextMonthForecast).toFixed(0)}`;
    }

    // 5. Heatmap Data
    const heatmapGrid = Array(7).fill(0).map(() => Array(24).fill(0));
    sortedLogs.forEach(l => {
      const d = new Date(l.ts);
      const day = d.getDay();
      const hour = d.getHours();
      heatmapGrid[day][hour]++;
    });

    // 6. Stations
    const stations: Record<string, StationStat> = {};
    sortedLogs.forEach(l => {
      const name = l.station_name || 'Unknown';
      if (!stations[name]) stations[name] = { name, spend: 0, visits: 0, avgPrice: 0 };
      stations[name].spend += l.total_cost;
      stations[name].visits += 1;
      stations[name].avgPrice = (stations[name].avgPrice * (stations[name].visits - 1) + l.price_per_l) / stations[name].visits;
    });
    const sortedStations = Object.values(stations).sort((a,b) => b.spend - a.spend).slice(0, 5);

    // 7. Vehicle Stats (Cost & Distance)
    const vehicleStats = vehicles.map(v => ({
      name: v.name,
      spend: sortedLogs.filter(l => l.vehicle_id === v.id).reduce((sum, l) => sum + l.total_cost, 0),
      distance: efficiencyByVehicle[v.id]?.totalDist || 0,
      efficiency: efficiencyByVehicle[v.id]?.totalFuel > 0 
        ? efficiencyByVehicle[v.id].totalDist / efficiencyByVehicle[v.id].totalFuel 
        : 0
    }));

    return {
      totalSpend, totalLitres, avgPrice, avgEfficiency,
      cumulativeSpendData, efficiencyPoints,
      monthlySeries, nextMonthForecast, forecastMsg,
      heatmapGrid,
      sortedStations,
      vehicleStats,
      outlierPoints,
      priceTrend,
      anomalies
    };
  }, [logs, vehicles, currency]);

  if (!stats) return <div className="p-12 text-center text-gray-500">Log more data to unlock analytics.</div>;

  // --- Chart Configs with Animation Tokens ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: prefersReducedMotion ? 0 : 500, // Respect reduced motion
      easing: 'easeOutQuart' as const,
    },
    transitions: {
      active: {
        animation: {
          duration: prefersReducedMotion ? 0 : 300,
        }
      }
    },
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { color: '#888', font: { size: 10 } } },
      y: { grid: { color: 'rgba(128,128,128,0.1)' }, ticks: { color: '#888', font: { size: 10 } } }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6, // Scale up on hover
      },
      line: {
        tension: 0.4, // Smooth curves
      }
    }
  };

  const spendChartData = {
    labels: stats.cumulativeSpendData.map(d => d.x),
    datasets: [{
      label: 'Cumulative Spend',
      data: stats.cumulativeSpendData.map(d => d.y),
      fill: true,
      borderColor: '#F97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      tension: 0.4,
      pointRadius: 0
    }]
  };

  const priceTrendChartData = {
    labels: stats.priceTrend.map(d => d.date),
    datasets: [{
      label: 'Price per Litre',
      data: stats.priceTrend.map(d => d.value),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.2,
      pointRadius: 2
    }]
  };

  const efficiencyChartData = {
    labels: stats.efficiencyPoints.sort((a,b) => a.timestamp - b.timestamp).map(d => new Date(d.date).toLocaleDateString()),
    datasets: [{
      label: 'Efficiency (km/L)',
      data: stats.efficiencyPoints.map(d => d.value),
      borderColor: '#22d3ee',
      backgroundColor: 'rgba(34, 211, 238, 0.5)',
      type: 'bar' as const,
      order: 2
    }, {
      label: 'Trend',
      data: stats.efficiencyPoints.map((_, i, arr) => {
        const start = Math.max(0, i - 4);
        const subset = arr.slice(start, i + 1);
        return subset.reduce((sum, item) => sum + item.value, 0) / subset.length;
      }),
      borderColor: '#d946ef',
      borderWidth: 2,
      pointRadius: 0,
      type: 'line' as const,
      order: 1,
      tension: 0.4
    }]
  };

  const vehicleCostData = {
    labels: stats.vehicleStats.map(v => v.name),
    datasets: [{
      data: stats.vehicleStats.map(v => v.spend),
      backgroundColor: ['#F97316', '#22d3ee', '#d946ef', '#10b981', '#6366f1'],
      borderWidth: 0,
      hoverOffset: 15 // Doughnut specific animation
    }]
  };
  
  const vehicleDistData = {
    labels: stats.vehicleStats.map(v => v.name),
    datasets: [{
      label: 'Distance (km)',
      data: stats.vehicleStats.map(v => v.distance),
      backgroundColor: '#6366f1',
      borderRadius: 4
    }]
  };

  const stationData = {
    labels: stats.sortedStations.map(s => s.name),
    datasets: [{
      label: 'Spend',
      data: stats.sortedStations.map(s => s.spend),
      backgroundColor: '#F97316',
      borderRadius: 4
    }]
  };

  const correlationData = {
    datasets: [{
      label: 'Price vs Efficiency',
      data: stats.outlierPoints,
      backgroundColor: 'rgba(34, 211, 238, 0.6)',
      borderColor: 'transparent',
      pointHoverRadius: 8
    }]
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend', value: `${currency} ${stats.totalSpend.toLocaleString(undefined, {maximumFractionDigits:0})}`, icon: <DollarSign size={16}/>, color: 'text-green-500' },
          { label: 'Total Fuel', value: `${stats.totalLitres.toFixed(0)} L`, icon: <Droplet size={16}/>, color: 'text-blue-500' },
          { label: 'Avg Price/L', value: `${currency} ${stats.avgPrice.toFixed(2)}`, icon: <TrendingUp size={16}/>, color: 'text-orange-500' },
          { label: 'Fleet Efficiency', value: `${stats.avgEfficiency.toFixed(1)} km/L`, icon: <Gauge size={16}/>, color: 'text-purple-500' },
        ].map((kpi, i) => (
          <div key={i} className="glow-panel p-5 card-hover icon-halo-anim reveal-on-scroll" style={{transitionDelay: `${i*60}ms`}}>
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{kpi.label}</span>
               <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] icon-halo ${kpi.color}`}>{kpi.icon}</div>
             </div>
             <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* 2. Forecast & Cumulative Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 glow-panel p-6 card-hover reveal-on-scroll">
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Cumulative Spend Trend</h3>
           <div className="h-64">
             <Line data={spendChartData} options={commonOptions} />
           </div>
         </div>
         
         <div className="glow-panel p-6 flex flex-col justify-center card-hover reveal-on-scroll" style={{transitionDelay: '100ms'}}>
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Next Month Forecast</h3>
            <div className="text-4xl font-bold text-gray-900 dark:text-white font-mono mb-2">{stats.forecastMsg}</div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Based on linear regression of your last {stats.monthlySeries.length} months of activity.
              Estimated spend for next month.
            </p>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Confidence</span>
                <span className="text-xs font-bold text-green-500">{stats.monthlySeries.length > 2 ? 'High' : 'Low'}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full bg-green-500 transition-all duration-500`} style={{ width: stats.monthlySeries.length > 2 ? '85%' : '30%' }}></div>
              </div>
            </div>
         </div>
      </div>

      {/* 3. Efficiency & Price Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glow-panel p-6 card-hover reveal-on-scroll">
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Efficiency Trend (Rolling Avg)</h3>
           <div className="h-64">
             {/* Using 'any' cast to allow mixed chart types (Line in Bar chart) */}
             <Bar data={efficiencyChartData as any} options={commonOptions} />
           </div>
        </div>
        <div className="glow-panel p-6 card-hover reveal-on-scroll" style={{transitionDelay: '100ms'}}>
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Fuel Price Fluctuation</h3>
           <div className="h-64">
             <Line data={priceTrendChartData} options={commonOptions} />
           </div>
        </div>
      </div>

      {/* 4. Vehicle Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glow-panel p-6 card-hover reveal-on-scroll">
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Spend Distribution by Vehicle</h3>
           <div className="h-64 flex items-center justify-center">
             <div className="w-64">
                <Doughnut data={vehicleCostData} options={{
                  ...commonOptions,
                  plugins: { legend: { display: true, position: 'right', labels: { color: '#888', boxWidth: 10 } } },
                  maintainAspectRatio: false
                }} />
             </div>
           </div>
        </div>
        <div className="glow-panel p-6 card-hover reveal-on-scroll" style={{transitionDelay: '100ms'}}>
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Total Distance by Vehicle</h3>
           <div className="h-64">
             <Bar data={vehicleDistData} options={{...commonOptions, indexAxis: 'y' as const}} />
           </div>
        </div>
      </div>

      {/* 5. Behavioral Heatmap (Custom CSS Grid) */}
      <div className="glow-panel p-6 card-hover reveal-on-scroll">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase text-gray-500">Fill-up Time Heatmap</h3>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">Darker = More Frequent</span>
         </div>
         <div className="overflow-x-auto">
            <div className="min-w-[600px]">
               <div className="flex">
                  <div className="w-10"></div> {/* Y-Axis Label Spacer */}
                  {Array.from({length: 24}).map((_, h) => (
                    <div key={h} className="flex-1 text-[10px] text-center text-gray-400">{h}</div>
                  ))}
               </div>
               {daysOfWeek.map((day, dIndex) => (
                 <div key={day} className="flex items-center mb-1">
                    <div className="w-10 text-[10px] font-bold text-gray-400">{day}</div>
                    {stats.heatmapGrid[dIndex].map((count, hIndex) => {
                       // Calculate opacity based on max count in grid
                       const max = Math.max(...stats.heatmapGrid.flat());
                       const opacity = max > 0 ? (count / max) : 0;
                       return (
                         <div key={hIndex} className="flex-1 h-8 mx-[1px] rounded-sm bg-brand-orange dark:bg-neural-cyan transition-all hover:scale-110" style={{ opacity: Math.max(0.1, opacity) }} title={`${count} fills`}></div>
                       )
                    })}
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 6. Stations & Correlations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glow-panel p-6 card-hover reveal-on-scroll">
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Top Stations by Spend</h3>
           <div className="h-64">
              <Bar data={stationData} options={{...commonOptions, indexAxis: 'y' as const}} />
           </div>
        </div>
        
        <div className="glow-panel p-6 card-hover reveal-on-scroll" style={{transitionDelay: '100ms'}}>
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase text-gray-500">Price vs Efficiency Correlation</h3>
              <AlertTriangle size={14} className="text-yellow-500" />
           </div>
           <div className="h-64">
              <Scatter data={correlationData} options={{
                 ...commonOptions,
                 scales: {
                    x: { ...commonOptions.scales.x, title: { display: true, text: 'Price / L' } },
                    y: { ...commonOptions.scales.y, title: { display: true, text: 'Efficiency (km/L)' } }
                 }
              }} />
           </div>
        </div>
      </div>

      {/* 7. Data Quality & Anomalies */}
      {stats.anomalies.length > 0 && (
        <div className="glow-panel p-6 border-red-100 dark:border-red-900/30 card-hover reveal-on-scroll">
           <div className="flex items-center gap-2 mb-6">
              <ShieldAlert size={20} className="text-red-500" />
              <h3 className="text-sm font-bold uppercase text-red-500">Data Quality Alerts</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Vehicle</th>
                    <th className="px-4 py-2">Issue</th>
                    <th className="px-4 py-2">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.anomalies.map((a, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-white/5 row-hover">
                      <td className="px-4 py-3 font-mono text-xs">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium">{a.vehicle}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.details}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${a.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {a.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      )}

    </div>
  );
};