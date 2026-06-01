import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { rpcCall } from '../api';
import { Thermometer, Zap, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export function ScenarioSimulator() {
  const [temp, setTemp] = useState(20);
  const [estimation, setEstimation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simulate = useCallback(async (currentTemp: number) => {
    setLoading(true);
    try {
      const result = await rpcCall({
        func: 'simulate_scenario',
        args: { temp: currentTemp }
      });
      setEstimation(result);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      simulate(temp);
    }, 300); // Debounce slider movement
    return () => clearTimeout(timer);
  }, [temp, simulate]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 shadow-xl overflow-hidden group">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-white to-rose-500" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-primary font-heading">
              <Thermometer className="h-5 w-5" /> Scenario Simulator
            </CardTitle>
            <CardDescription className="text-xs">"What-If" Temperature Analysis</CardDescription>
          </div>
          <div className="p-2 rounded bg-primary/10">
            <Info className="h-4 w-4 text-primary opacity-60" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Slider Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selected Outdoor Temp</span>
              <p className={cn(
                "text-4xl font-bold font-heading transition-colors duration-500",
                temp < 10 ? "text-blue-500" : temp > 25 ? "text-rose-500" : "text-white"
              )}>
                {temp}°C
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Climate Condition</span>
              <p className="text-xs font-semibold capitalize">
                {temp < 10 ? 'Cold (High Heating)' : temp > 25 ? 'Hot (Cooling Demand)' : 'Moderate (Standard)'}
              </p>
            </div>
          </div>
          
          <input 
            type="range" 
            min="-5" 
            max="40" 
            step="1"
            value={temp} 
            onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold font-mono">
            <span>-5°C</span>
            <span>40°C</span>
          </div>
        </div>

        {/* Result Section */}
        <div className={cn(
          "p-6 rounded-2xl border transition-all duration-500",
          loading ? "opacity-50 blur-sm" : "opacity-100",
          estimation?.is_peak ? "bg-rose-500/10 border-rose-500/30" : "bg-emerald-500/10 border-emerald-500/30"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded",
                estimation?.is_peak ? "bg-rose-500/20" : "bg-emerald-500/20"
              )}>
                <Zap className={cn(
                  "h-4 w-4",
                  estimation?.is_peak ? "text-rose-500" : "text-emerald-500"
                )} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Estimated Load</span>
            </div>
            {estimation?.is_peak && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 animate-pulse">
                <AlertTriangle className="h-3 w-3 text-rose-500" />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Peak Warning</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
             <h3 className="text-3xl font-bold font-heading tracking-tight">
               {estimation?.estimated_energy || '0.00'} <span className="text-sm font-medium text-muted-foreground tracking-normal">kWh</span>
             </h3>
             <p className="text-xs text-muted-foreground italic leading-relaxed">
               Estimated daily consumption based on a linear correlation baseline of historical Smart Meter data.
             </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-muted/5 flex items-start gap-3">
           <Info className="h-4 w-4 text-primary mt-0.5" />
           <p className="text-[11px] text-muted-foreground leading-relaxed">
             <strong>Simulation Logic:</strong> This tool uses a Linear Regression model derived from your dataset (Correlation: -0.90) to simulate demand patterns under specific environmental conditions.
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
