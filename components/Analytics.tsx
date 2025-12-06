import React, { useMemo, useState, useEffect } from 'react';
import { FuelLog, Vehicle } from '../types';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, BarElement, ArcElement, Filler, ScatterController
} from 'chart.js/auto';
import { TrendingUp, AlertTriangle, Calendar, DollarSign, Droplet, Gauge, Map, ShieldAlert } from 'lucide-react';
declare const d3: any;

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

/* --- D3 Components (premium, animated, responsive) --- */
const useIsDark = () => {
  try { return document.documentElement.classList.contains('dark'); } catch { return false; }
};

const D3MonthlySpend: React.FC<{ labels: string[]; values: number[]; ready: boolean; }> = ({ labels, values, ready }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isDark = useIsDark();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!ready || typeof d3 === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const rect = el.getBoundingClientRect();
    const width = rect.width || 640;
    const height = rect.height || 256;
    const margin = { top: 12, right: 12, bottom: 28, left: 36 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(el)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand().domain(labels).range([0, w]).padding(0.45);
    const y = d3.scaleLinear().domain([0, d3.max(values) || 1]).nice().range([h, 0]);

    // Grid
    g.append('g')
      .attr('stroke', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
      .selectAll('line')
      .data(y.ticks(4))
      .enter()
      .append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d));

    // Gradient
    const gradId = `grad-monthly-${Math.random().toString(36).slice(2)}`;
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0').attr('x2', '0').attr('y1', '1').attr('y2', '0');
    grad.append('stop').attr('offset', '0%').attr('stop-color', isDark ? 'rgba(34,211,238,0.25)' : 'rgba(249,115,22,0.20)');
    grad.append('stop').attr('offset', '100%').attr('stop-color', isDark ? 'rgba(59,130,246,0.70)' : 'rgba(234,88,12,0.70)');

    // Bars
    const bars = g.selectAll('rect.bar')
      .data(values)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (_, i) => x(labels[i]) || 0)
      .attr('width', x.bandwidth())
      .attr('rx', 6)
      .attr('fill', `url(#${gradId})`)
      .attr('y', h)
      .attr('height', 0);

    if (!reduced) {
      bars.transition().duration(800).delay((_, i) => i * 60)
        .attr('y', (d) => y(d))
        .attr('height', (d) => h - y(d))
        .ease(d3.easeCubicOut);
    } else {
      bars.attr('y', (d) => y(d)).attr('height', (d) => h - y(d));
    }

    // Axes (minimal)
    const ax = d3.axisBottom(x).tickSize(0).tickPadding(8);
    const ay = d3.axisLeft(y).ticks(4).tickSize(-w).tickFormat(d => `${d}`);
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(ax as any)
      .call(g => g.selectAll('text').attr('fill', isDark ? '#9ca3af' : '#6b7280').attr('font-size', 10))
      .call(g => g.selectAll('path').attr('stroke', 'transparent'));
    g.append('g')
      .call(ay as any)
      .call(g => g.selectAll('text').attr('fill', isDark ? '#9ca3af' : '#6b7280').attr('font-size', 10))
      .call(g => g.selectAll('.tick line').attr('stroke', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'))
      .call(g => g.select('.domain').attr('stroke', 'transparent'));
  }, [labels.join('|'), values.join('|'), ready]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const D3Gauge: React.FC<{ value: number; max: number; ready: boolean; }> = ({ value, max, ready }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isDark = useIsDark();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!ready || typeof d3 === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const rect = el.getBoundingClientRect();
    const width = rect.width || 280;
    const height = rect.height || 220;
    const margin = { top: 8, right: 8, bottom: 8, left: 8 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const radius = Math.min(w, h) / 1.2;

    const svg = d3.select(el)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%').attr('height', '100%');

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height * 0.9})`);

    const start = -Math.PI;
    const end = 0;
    const scale = d3.scaleLinear().domain([0, max]).range([start, end]);

    const bgArc = d3.arc().innerRadius(radius * 0.7).outerRadius(radius).startAngle(start).endAngle(end);
    g.append('path')
      .attr('d', bgArc as any)
      .attr('fill', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)');

    const fgArc = d3.arc().innerRadius(radius * 0.7).outerRadius(radius).startAngle(start);
    const path = g.append('path')
      .attr('fill', isDark ? '#22d3ee' : '#EA580C');

    const target = Math.max(0, Math.min(max, value));
    if (!reduced) {
      path.transition().duration(900).attrTween('d', () => {
        const i = d3.interpolate(start, scale(target));
        return (t: number) => (fgArc as any).endAngle(i(t))();
      }).ease(d3.easeCubicOut);
    } else {
      (fgArc as any).endAngle(scale(target));
      path.attr('d', fgArc as any);
    }

    // Text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -radius * 0.15)
      .attr('fill', isDark ? '#e5e7eb' : '#111827')
      .attr('font-size', 18)
      .attr('font-weight', 700)
      .text(`${value.toFixed(1)} km/L`);
  }, [value, max, ready]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const D3StepLine: React.FC<{ dates: Date[]; values: number[]; ready: boolean; }> = ({ dates, values, ready }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isDark = useIsDark();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!ready || typeof d3 === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const rect = el.getBoundingClientRect();
    const width = rect.width || 640;
    const height = rect.height || 256;
    const margin = { top: 12, right: 16, bottom: 28, left: 40 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(el).append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%').attr('height', '100%');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleUtc().domain(d3.extent(dates) as [Date, Date]).range([0, w]);
    const y = d3.scaleLinear().domain([0, d3.max(values) || 1]).nice().range([h, 0]);

    // Grid
    g.append('g')
      .attr('stroke', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
      .selectAll('line')
      .data(y.ticks(4))
      .enter()
      .append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d));

    // Line
    const line = d3.line()
      .x((d: Date, i: number) => x(d))
      .y((_: Date, i: number) => y(values[i]))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = g.append('path')
      .attr('fill', 'none')
      .attr('stroke', isDark ? '#22d3ee' : '#EA580C')
      .attr('stroke-width', 2)
      .attr('d', line(dates) as any)
      .attr('stroke-dasharray', function () {
        const len = (this as SVGPathElement).getTotalLength();
        return `${len} ${len}`;
      } as any)
      .attr('stroke-dashoffset', function () {
        const len = (this as SVGPathElement).getTotalLength();
        return reduced ? 0 : len;
      });

    if (!reduced) {
      path.transition().duration(900).attr('stroke-dashoffset', 0).ease(d3.easeCubicOut);
    }

    // Points
    const pts = g.selectAll('circle')
      .data(dates)
      .enter()
      .append('circle')
      .attr('cx', (_, i) => x(dates[i]))
      .attr('cy', (_, i) => y(values[i]))
      .attr('r', 0)
      .attr('fill', isDark ? '#22d3ee' : '#EA580C')
      .attr('opacity', 0.9);

    if (!reduced) {
      pts.transition().duration(600).delay((_, i) => 150 + i * 40).attr('r', 3).ease(d3.easeBackOut);
    } else {
      pts.attr('r', 3);
    }

    // Axes
    const ax = d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(8);
    const ay = d3.axisLeft(y).ticks(4).tickSize(-w);
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(ax as any)
      .call(g => g.selectAll('text').attr('fill', isDark ? '#9ca3af' : '#6b7280').attr('font-size', 10))
      .call(g => g.selectAll('path').attr('stroke', 'transparent'));
    g.append('g')
      .call(ay as any)
      .call(g => g.selectAll('text').attr('fill', isDark ? '#9ca3af' : '#6b7280').attr('font-size', 10))
      .call(g => g.selectAll('.tick line').attr('stroke', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'))
      .call(g => g.select('.domain').attr('stroke', 'transparent'));
  }, [dates.map(d => d.toISOString()).join('|'), values.join('|'), ready]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export const Analytics: React.FC<AnalyticsProps> = ({ logs, vehicles, currency }) => {
  // Ensure D3 is available in browser (UMD) without npm install
  const [d3Ready, setD3Ready] = useState<boolean>(typeof (window as any).d3 !== 'undefined');
  useEffect(() => {
    if (!d3Ready) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
      s.async = true;
      s.onload = () => setD3Ready(true);
      document.head.appendChild(s);
    }
  }, [d3Ready]);

  // Lightweight UI-only loading to stage chart entrance animations (no data logic change)
  const [chartsReady, setChartsReady] = useState(false);
  useEffect(() => {
    setChartsReady(false);
    const t = setTimeout(() => setChartsReady(true), 300);
    return () => clearTimeout(t);
  }, [logs, vehicles]);

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

  // staged entrance delay (per render lifecycle)
  let delayed = false;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: prefersReducedMotion ? 0 : 700,
      easing: 'easeOutQuart' as const,
      onComplete: () => { delayed = true; },
      delay: (ctx: any) => {
        if (prefersReducedMotion) return 0;
        const { dataIndex, datasetIndex } = ctx;
        // stagger bars/points
        return ctx.type === 'data' ? (dataIndex * 40) + (datasetIndex * 60) : 0;
      }
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
        hoverRadius: 6,
      },
      line: {
        tension: 0.4,
      }
    },
    animations: {
      y: {
        // bars grow from baseline
        from: (ctx: any) => (prefersReducedMotion ? undefined : (ctx.chart.scales?.y?.getPixelForValue(0) || 0))
      }
    }
  } as const;

  const spendChartData = {
    labels: stats.cumulativeSpendData.map(d => d.x),
    datasets: [{
      label: 'Cumulative Spend',
      data: stats.cumulativeSpendData.map(d => d.y),
      fill: true,
      borderColor: '#F97316',
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart;
        const { ctx: canvasCtx, chartArea } = chart;
        if (!chartArea) return 'rgba(249,115,22,0.10)';
        const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(249,115,22,0.05)');
        gradient.addColorStop(1, 'rgba(249,115,22,0.30)');
        return gradient;
      },
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
      order: 2,
      categoryPercentage: 0.55,
      barPercentage: 0.7
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
      borderRadius: 4,
      maxBarThickness: 14,
      categoryPercentage: 0.6,
      barPercentage: 0.7
    }]
  };

  const stationData = {
    labels: stats.sortedStations.map(s => s.name),
    datasets: [{
      label: 'Spend',
      data: stats.sortedStations.map(s => s.spend),
      backgroundColor: '#F97316',
      borderRadius: 4,
      maxBarThickness: 14,
      categoryPercentage: 0.6,
      barPercentage: 0.7
    }]
  };

  // Monthly Petrol Spend (YYYY-MM buckets)
  const monthlySpendLabels = stats.monthlySeries.map(([ym]) => {
    const d = new Date(`${ym}-01T00:00:00`);
    return d.toLocaleString(undefined, { month: 'short', year: '2-digit' });
  });
  const monthlySpendValues = stats.monthlySeries.map(([, v]) => v);
  const monthlySpendData = {
    labels: monthlySpendLabels,
    datasets: [{
      label: 'Monthly Spend',
      data: monthlySpendValues,
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'rgba(249,115,22,0.30)';
        const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        g.addColorStop(0, 'rgba(249,115,22,0.20)'); // brand orange low
        g.addColorStop(1, 'rgba(234,88,12,0.65)');  // darker orange
        return g;
      },
      borderRadius: 6
    }]
  };

  // Average Mileage Gauge (semi-doughnut)
  const effVals = stats.efficiencyPoints.map(p => p.value);
  const gaugeMax = effVals.length ? Math.max(10, Math.ceil(Math.max(...effVals, 30))) : 30;
  const avgMileageGaugeData = {
    labels: ['Avg km/L', 'Remaining'],
    datasets: [{
      data: [Math.min(stats.avgEfficiency, gaugeMax), Math.max(0, gaugeMax - stats.avgEfficiency)],
      backgroundColor: ['#22d3ee', 'rgba(128,128,128,0.15)'],
      borderWidth: 0,
      hoverOffset: 0
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
             {chartsReady ? (
               <Line data={spendChartData} options={commonOptions} />
             ) : (
               <div className="w-full h-full rounded-xl shimmer bg-gray-100 dark:bg-white/5"></div>
             )}
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

      {/* 3. Monthly Petrol Spend and Average Mileage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glow-panel p-6 card-hover reveal-on-scroll">
          <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Monthly Petrol Spend</h3>
          <div className="h-64">
            {chartsReady && d3Ready ? (
              <D3MonthlySpend labels={monthlySpendLabels} values={monthlySpendValues} ready={chartsReady && d3Ready} />
            ) : (
              <div className="w-full h-full rounded-xl shimmer bg-gray-100 dark:bg-white/5"></div>
            )}
          </div>
        </div>
        <div className="glow-panel p-6 card-hover reveal-on-scroll" style={{transitionDelay: '80ms'}}>
          <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Average Mileage</h3>
          <div className="h-64 flex items-center justify-center">
            {chartsReady && d3Ready ? (
              <D3Gauge value={stats.avgEfficiency} max={gaugeMax} ready={chartsReady && d3Ready} />
            ) : (
              <div className="w-full h-full rounded-xl shimmer bg-gray-100 dark:bg-white/5"></div>
            )}
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">Avg: {stats.avgEfficiency.toFixed(1)} km/L</div>
        </div>
      </div>

      {/* 4. Efficiency & Price Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glow-panel p-6 card-hover reveal-on-scroll">
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Mileage Between Refuels (Rolling Avg)</h3>
           <div className="h-64">
             {chartsReady && d3Ready ? (
               <D3StepLine
                 dates={stats.efficiencyPoints.sort((a,b) => a.timestamp - b.timestamp).map(d => new Date(d.date))}
                 values={stats.efficiencyPoints.sort((a,b) => a.timestamp - b.timestamp).map(d => d.value)}
                 ready={chartsReady && d3Ready}
               />
             ) : (
               <div className="w-full h-full rounded-xl shimmer bg-gray-100 dark:bg-white/5"></div>
             )}
           </div>
        </div>
        <div className="glow-panel p-6 card-hover reveal-on-scroll" style={{transitionDelay: '100ms'}}>
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Fuel Price Fluctuation</h3>
           <div className="h-64">
             {chartsReady ? (
               <Line data={priceTrendChartData} options={commonOptions} />
             ) : (
               <div className="w-full h-full rounded-xl shimmer bg-gray-100 dark:bg-white/5"></div>
             )}
           </div>
        </div>
      </div>

      {/* 4. Vehicle Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glow-panel p-6 card-hover reveal-on-scroll">
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Spend Distribution by Vehicle</h3>
           <div className="h-64 flex items-center justify-center">
             <div className="w-64">
               {chartsReady ? (
                 <Doughnut data={vehicleCostData} options={{
                   ...commonOptions,
                   animation: {
                     ...((commonOptions as any).animation),
                     animateRotate: !prefersReducedMotion,
                     animateScale: !prefersReducedMotion,
                   },
                   plugins: { legend: { display: true, position: 'right', labels: { color: '#888', boxWidth: 10 } } },
                   maintainAspectRatio: false
                 }} />
               ) : (
                 <div className="w-full h-64 rounded-xl shimmer bg-gray-100 dark:bg-white/5"></div>
               )}
             </div>
           </div>
        </div>
        <div className="glow-panel p-6 card-hover reveal-on-scroll" style={{transitionDelay: '100ms'}}>
           <h3 className="text-sm font-bold uppercase text-gray-500 mb-6">Total Distance by Vehicle</h3>
           <div className="h-64">
             {chartsReady ? (
               <Bar data={vehicleDistData} options={{
                 ...commonOptions,
                 indexAxis: 'y' as const,
                 animations: {
                   ...((commonOptions as any).animations),
                   y: {
                     from: (ctx: any) => (prefersReducedMotion ? undefined : (ctx.chart.scales?.y?.getPixelForValue(0) || 0)),
                     delay: (ctx: any) => (prefersReducedMotion ? 0 : ctx.dataIndex * 40)
                   }
                 }
               }} />
             ) : (
               <div className="w-full h-full rounded-xl shimmer bg-gray-100 dark:bg-white/5"></div>
             )}
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
             {chartsReady ? (
               <Bar data={stationData} options={{
                 ...commonOptions,
                 indexAxis: 'y' as const,
                 animations: {
                   ...((commonOptions as any).animations),
                   y: {
                     from: (ctx: any) => (prefersReducedMotion ? undefined : (ctx.chart.scales?.y?.getPixelForValue(0) || 0)),
                     delay: (ctx: any) => (prefersReducedMotion ? 0 : ctx.dataIndex * 50)
                   }
                 }
               }} />
             ) : (
               <div className="w-full h-full rounded-xl shimmer bg-gray-100 dark:bg-white/5"></div>
             )}
           </div>
        </div>
        
        <div className="glow-panel p-6 card-hover reveal-on-scroll" style={{transitionDelay: '100ms'}}>
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase text-gray-500">Price vs Efficiency Correlation</h3>
              <AlertTriangle size={14} className="text-yellow-500" />
           </div>
           <div className="h-64">
             {chartsReady ? (
               <Scatter data={correlationData} options={{
                 ...commonOptions,
                 animations: {
                   radius: {
                     duration: prefersReducedMotion ? 0 : 600,
                     easing: 'easeOutBack',
                     from: 0
                   }
                 },
                 scales: {
                   x: { ...commonOptions.scales.x, title: { display: true, text: 'Price / L' } },
                   y: { ...commonOptions.scales.y, title: { display: true, text: 'Efficiency (km/L)' } }
                 }
               }} />
             ) : (
               <div className="w-full h-full rounded-xl shimmer bg-gray-100 dark:bg-white/5"></div>
             )}
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