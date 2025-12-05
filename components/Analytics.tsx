import React from 'react';
import { FuelLog, Vehicle } from '../types';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement } from 'chart.js/auto';

// Ensure ChartJS registers components. 
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface AnalyticsProps {
  logs: FuelLog[];
  vehicles: Vehicle[];
  currency: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ logs, vehicles, currency }) => {
  if (logs.length === 0) {
    return <div className="p-12 text-center text-gray-500">Not enough data to generate analytics. Log some fuel entries first.</div>;
  }

  // 1. Spending Over Time
  const sortedLogs = [...logs].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  const spendingData = {
    labels: sortedLogs.map(l => new Date(l.ts).toLocaleDateString()),
    datasets: [
      {
        label: `Cumulative Cost (${currency})`,
        data: sortedLogs.map((_, i, arr) => arr.slice(0, i + 1).reduce((sum, item) => sum + item.total_cost, 0)),
        borderColor: '#F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // 2. Cost per Vehicle
  const vehicleCosts: Record<string, number> = {};
  logs.forEach(log => {
    vehicleCosts[log.vehicle_name || 'Unknown'] = (vehicleCosts[log.vehicle_name || 'Unknown'] || 0) + log.total_cost;
  });

  const costDistributionData = {
    labels: Object.keys(vehicleCosts),
    datasets: [
      {
        data: Object.values(vehicleCosts),
        backgroundColor: [
          'rgba(249, 115, 22, 0.8)',
          'rgba(34, 211, 238, 0.8)',
          'rgba(217, 70, 239, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 0,
      }
    ]
  };

  // 3. Efficiency (MPG/KML) Trend - Simplified per entry
  const efficiencyPoints: {date: string, eff: number}[] = [];
  
  // Group logs by vehicle first
  const logsByVehicle: Record<string, FuelLog[]> = {};
  logs.forEach(l => {
    if (!logsByVehicle[l.vehicle_id]) logsByVehicle[l.vehicle_id] = [];
    logsByVehicle[l.vehicle_id].push(l);
  });

  // Calculate segments
  Object.values(logsByVehicle).forEach(vLogs => {
    vLogs.sort((a,b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    for(let i=1; i<vLogs.length; i++) {
       const dist = vLogs[i].odometer - vLogs[i-1].odometer;
       const fuel = vLogs[i].litres; // Fuel used to cover that distance
       if(fuel > 0) {
         efficiencyPoints.push({
           date: new Date(vLogs[i].ts).toLocaleDateString(),
           eff: dist / fuel
         });
       }
    }
  });
  
  efficiencyPoints.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const efficiencyData = {
    labels: efficiencyPoints.map(p => p.date),
    datasets: [
      {
         label: 'Efficiency (km/L)',
         data: efficiencyPoints.map(p => p.eff),
         backgroundColor: '#22d3ee',
         borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#888' }
      },
      title: { display: false }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up pb-10">
      {/* Spending Trend */}
      <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-black/40 border border-gray-100 dark:border-glass-border shadow-soft dark:shadow-none">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cumulative Spending</h3>
        <div className="h-64">
           <Line data={spendingData} options={chartOptions} />
        </div>
      </div>

      {/* Cost Distribution */}
      <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-black/40 border border-gray-100 dark:border-glass-border shadow-soft dark:shadow-none">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cost by Vehicle</h3>
        <div className="h-64 flex items-center justify-center">
           <div className="w-full h-full flex justify-center">
             <Doughnut data={costDistributionData} options={chartOptions} />
           </div>
        </div>
      </div>

      {/* Efficiency Bar Chart */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl bg-white dark:bg-black/40 border border-gray-100 dark:border-glass-border shadow-soft dark:shadow-none">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Fuel Efficiency Trend (Last Fills)</h3>
        <div className="h-64">
           <Bar data={efficiencyData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};