import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { rpcCall } from '../api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell, LineChart, Line
} from 'recharts';
import { 
  Zap, Thermometer, TrendingUp, Calendar, 
  ArrowUpRight, ArrowDownRight, Activity, ZapOff 
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        rpcCall({ func: 'get_stats' }),
        rpcCall({ func: 'get_historical_data', args: { limit: 30 } })
      ]);
      setStats(statsRes);
      // Reverse history for chart display (chronological)
      setHistoricalData([...historyRes].reverse());
    } catch (error) {
      console.error('Failed to load overview data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statCards = [
    { 
      label: 'Avg Consumption', 
      value: `${stats?.avg_consumption || 0} kWh`, 
      icon: Zap, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      description: 'Daily average usage'
    },
    { 
      label: 'Peak Load', 
      value: `${stats?.peak_consumption || 0} kWh`, 
      icon: TrendingUp, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10',
      description: 'Historical maximum'
    },
    { 
      label: 'Temp Correlation', 
      value: stats?.temp_correlation || '0.0', 
      icon: Thermometer, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      description: 'Weather impact factor'
    },
    { 
      label: 'Total Records', 
      value: stats?.total_records || 0, 
      icon: Activity, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      description: 'Data points'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl" />
          ))}
        </div>
        <div className="h-[400px] bg-muted/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-muted/50 rounded-xl" />
          <div className="h-64 bg-muted/50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-white/10 overflow-hidden relative group">
            <div className={cn("absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500", stat.color)}>
              <stat.icon className="h-16 w-16" />
            </div>
            <CardHeader className="pb-2">
               <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
               </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Trend Chart */}
      <Card className="bg-card/40 backdrop-blur-md border-white/10 relative overflow-hidden bg-dot-grid">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-heading flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Multi-Axis Consumption Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">Correlation between daily energy and outdoor temperature (Last 30 days)</p>
            </div>
            <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Energy (kWh)
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Temp (°C)
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--rose-500))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--rose-500))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--white)/0.05)" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))" 
                  label={{ value: 'kWh', angle: -90, position: 'insideLeft', fontSize: 10 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: '°C', angle: 90, position: 'insideRight', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="energy_sum" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEnergy)" 
                  name="Energy (kWh)"
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="temperatureMax" 
                  stroke="hsl(var(--rose-500))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorTemp)" 
                  name="Temp (°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Efficiency Bar Chart */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-base font-heading">Daily Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData.slice(-7)}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={d => d.slice(-2)} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--white)/0.05)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Bar dataKey="energy_sum" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {historicalData.slice(-7).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.energy_sum > 15 ? 'hsl(var(--rose-500))' : 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Objectives & Observations */}
        <Card className="bg-card/50 border-white/10 overflow-hidden group">
          <CardHeader>
            <CardTitle className="text-base font-heading text-primary">Key Observations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 group-hover:bg-primary/10 transition-colors">
                <div className="mt-1 p-2 rounded bg-primary/10">
                   <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                   <p className="font-bold text-sm">Temperature Effect</p>
                   <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Our analysis confirms that energy usage is highly dependent on climate. A correlation of {stats?.temp_correlation} shows that as temperature decreases, usage goes up.
                   </p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 group-hover:bg-emerald-500/10 transition-colors">
                <div className="mt-1 p-2 rounded bg-emerald-500/10">
                   <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                   <p className="font-bold text-sm">Data Collection (London Smart Meter Dataset)</p>
                   <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      We utilized the <b>London Smart Meter Dataset</b>, comprising {stats?.total_records} daily readings spanning 24 months. The data includes aggregated grid consumption (kWh) paired with high-resolution meteorological features such as maximum temperature, humidity, and visibility. Pre-processing involved outlier removal, timestamp normalization, and ensuring data continuity for model training.
                   </p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
