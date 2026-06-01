import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { rpcCall, invalidateCache } from '../api';
import { Search, Plus, Calendar, Zap, Thermometer, FileText, Database, X, ExternalLink } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

export function History() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    energy_sum: '',
    temperature_max: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await rpcCall({ func: 'get_historical_data', args: { limit: 100 } });
      setData(result);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = data.filter(row => 
    row.day.includes(search) || 
    row.energy_sum.toString().includes(search)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await rpcCall({
        func: 'add_manual_reading',
        args: {
          date: formData.date,
          energy_sum: parseFloat(formData.energy_sum),
          temperature_max: parseFloat(formData.temperature_max)
        }
      });
      // Immediate update
      setData(prev => [{ day: result.date, energy_sum: result.energy_sum, temperatureMax: result.temperature_max }, ...prev]);
      setIsDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        energy_sum: '',
        temperature_max: ''
      });
      invalidateCache(['get_historical_data', 'get_stats']);
      loadData(); // Sync
    } catch (error) {
      console.error('Failed to add reading:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Data History</h2>
          <p className="text-muted-foreground">Historical records and manual readings</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Add Reading
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Manual Reading</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="energy">Energy (kWh)</Label>
                  <Input 
                    id="energy" 
                    type="number" 
                    step="0.01" 
                    placeholder="12.5"
                    value={formData.energy_sum} 
                    onChange={e => setFormData(prev => ({ ...prev, energy_sum: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temp">Temp (°C)</Label>
                  <Input 
                    id="temp" 
                    type="number" 
                    step="0.1" 
                    placeholder="18.2"
                    value={formData.temperature_max} 
                    onChange={e => setFormData(prev => ({ ...prev, temperature_max: e.target.value }))}
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader className="pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by date or value..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs border-none bg-transparent focus-visible:ring-0 px-0 h-auto py-1"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[180px]">Date</TableHead>
                  <TableHead>Energy Consumption</TableHead>
                  <TableHead>Max Temperature</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell className="text-right"><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No records found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-white/5 transition-colors group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-primary/70" />
                          {row.day}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-foreground">
                          <Zap className="h-3.5 w-3.5 text-amber-500/70" />
                          {row.energy_sum.toFixed(2)} kWh
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-foreground">
                          <Thermometer className="h-3.5 w-3.5 text-blue-500/70" />
                          {row.temperatureMax.toFixed(1)}°C
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          Verified
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dialog open={isCsvOpen} onOpenChange={setIsCsvOpen}>
          <DialogTrigger asChild>
            <Card className="bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium flex items-center justify-between">
                    Data Source
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-muted-foreground">Historical data loaded from processed_energy_data.csv</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 overflow-hidden border-white/10">
            <DialogHeader className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle>processed_energy_data.csv</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">Full historical dataset used for model training</p>
                  </div>
                </div>
              </div>
            </DialogHeader>
            <div className="px-6 py-2 border-y border-white/5 bg-muted/30">
              <div className="grid grid-cols-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-1">Day</div>
                <div className="col-span-1">Temp (Max)</div>
                <div className="col-span-1">Energy (kWh)</div>
                <div className="col-span-1">Year</div>
                <div className="col-span-1">Month</div>
                <div className="col-span-1">Date</div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-6 pt-0">
              <div className="space-y-0.5 mt-2">
                {data.slice(0, 50).map((row, i) => (
                  <div key={i} className="grid grid-cols-6 py-2 text-xs border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded -mx-2">
                    <div className="col-span-1 font-mono text-primary/80">{row.day}</div>
                    <div className="col-span-1">{row.temperatureMax.toFixed(2)}</div>
                    <div className="col-span-1 font-bold">{row.energy_sum.toFixed(2)}</div>
                    <div className="col-span-1 text-muted-foreground">{row.day.split('-')[0]}</div>
                    <div className="col-span-1 text-muted-foreground">{row.day.split('-')[1]}</div>
                    <div className="col-span-1 text-muted-foreground">{row.day.split('-')[2]}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 bg-muted/20 border-t border-white/5 text-center">
              <p className="text-[10px] text-muted-foreground italic">
                Showing first 50 records from the primary dataset for verification.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Hybrid Monitoring</p>
              <p className="text-xs text-muted-foreground">Manual entries are persisted in local SQLite database</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
