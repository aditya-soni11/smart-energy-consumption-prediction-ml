import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Brain, 
  History as HistoryIcon, 
  Menu, 
  Zap, 
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info as InfoIcon,
  Clock,
  X
} from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import { Overview } from './features/Overview';
import { Forecasting } from './features/Forecasting';
import { History } from './features/History';

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("RENDER_SUCCESS");
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Real-time analytics' },
    { id: 'forecasting', label: 'Forecasting', icon: Brain, description: 'AI forecasting' },
    { id: 'history', label: 'History', icon: HistoryIcon, description: 'Data logs' },
  ];

  const notifications = [
    {
      id: 1,
      title: "Model Retrained",
      description: "Random Forest model updated with latest historical data.",
      time: "2 mins ago",
      type: "success",
      icon: CheckCircle2
    },
    {
      id: 2,
      title: "Peak Usage Alert",
      description: "Predicted consumption exceeds normal range for tomorrow.",
      time: "1 hour ago",
      type: "warning",
      icon: AlertTriangle
    },
    {
      id: 3,
      title: "System Update",
      description: "SKIT Energy Tracker v1.0.2 is now live.",
      time: "5 hours ago",
      type: "info",
      icon: InfoIcon
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return <Overview />;
      case 'forecasting': return <Forecasting />;
      case 'history': return <History />;
      default: return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Desktop Sidebar (Fixed on Desktop, Hidden on Mobile) */}
      <aside className={cn(
        "hidden md:flex fixed inset-y-0 left-0 z-50 w-72 bg-card/30 backdrop-blur-xl border-r border-white/5 flex-col",
        "relative translate-x-0"
      )}>
        <div className="p-6 flex flex-col items-center bg-white dark:bg-card/30 border-b border-border/10">
          <div className="flex items-center justify-center w-full mb-4">
            <img src="./assets/app-logo.png" alt="App Logo" className="h-20 w-auto object-contain" />
          </div>
          <div className="text-center">
            <p className="text-[12px] font-bold text-primary uppercase tracking-wide">Machine Learning Lab</p>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium italic uppercase tracking-tighter">SKIT Jaipur</p>
            <p className="text-[10px] text-primary/80 font-bold uppercase tracking-widest mt-0.5">6CSA-G1</p>
          </div>
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto space-y-1">
          <div className="px-4 py-4 mb-6 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl shadow-sm">
            <div className="flex flex-col items-start">
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest mb-1 w-full text-center">SKIT Machine Learning Project</p>
              <div className="h-0.5 w-12 bg-amber-500/30 mb-3 self-center" />
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mb-1">Submitted By:</p>
              <div className="space-y-1 ml-1">
                <p className="text-[12px] font-semibold text-foreground leading-tight">1.Aditya Soni</p>
                <p className="text-[12px] font-semibold text-foreground leading-tight">2.Akshat Kumawat</p>
                <p className="text-[12px] font-semibold text-foreground leading-tight">3.Amanjeet Singh</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-4 mb-1">Submitted To:</p>
              <p className="text-[12px] font-semibold text-foreground ml-1">Mrs. Karuna Sharma</p>
            </div>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                activeView === item.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", activeView === item.id ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors")} />
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-sm tracking-tight">{item.label}</span>
                <span className={cn("text-[10px] opacity-70", activeView === item.id ? "text-white/80" : "text-muted-foreground")}>{item.description}</span>
              </div>
              {activeView === item.id && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 bg-muted/5 text-center">
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-bold">
            SKIT Project v1.0
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer Pattern) */}
      <div className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300",
        isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsSidebarOpen(false)}>
        <aside className={cn(
          "w-64 h-full bg-card border-r border-white/5 flex flex-col transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )} onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-widest text-primary">Details</span>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
             <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
               <div>
                 <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Section</p>
                 <p className="text-sm font-bold">6CSA-G1</p>
               </div>
               <div>
                 <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Submitted By</p>
                 <p className="text-xs font-semibold">1. Aditya Soni</p>
                 <p className="text-xs font-semibold">2. Akshat Kumawat</p>
                 <p className="text-xs font-semibold">3. Amanjeet Singh</p>
               </div>
             </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-mesh bg-cover bg-fixed relative pb-20 md:pb-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span className="hidden sm:inline">Smart Home</span>
              <ChevronRight className="h-3 w-3 hidden sm:inline" />
              <span className="text-foreground">{activeView}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative" ref={notificationRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("relative group transition-all duration-200", isNotificationsOpen && "bg-muted")}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
               <Bell className={cn("h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors", isNotificationsOpen && "text-primary")} />
               <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-rose-500 border border-background animate-pulse" />
            </Button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute top-12 right-0 w-[280px] sm:w-80 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">3 New</Badge>
                </div>
                <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar text-left">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group/item">
                      <div className="flex gap-3 text-left">
                        <div className={cn(
                          "mt-1 p-2 rounded-lg shrink-0",
                          n.type === 'success' ? "bg-emerald-500/10 text-emerald-500" :
                          n.type === 'warning' ? "bg-amber-500/10 text-amber-500" :
                          "bg-blue-500/10 text-blue-500"
                        )}>
                          <n.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-bold group-hover/item:text-primary transition-colors text-left">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-tight text-left">{n.description}</p>
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 pt-1 text-left">
                            <Clock className="h-2.5 w-2.5" />
                            {n.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-white/5">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">System Live</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Hero Section (Only on Overview) */}
          {activeView === 'overview' && (
            <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
               <img 
                 src="./assets/smart-grid-hero.jpg" 
                 alt="Smart Energy Grid at Night" 
                 className="absolute inset-0 w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
               <div className="relative h-full flex flex-col justify-end max-w-7xl mx-auto px-4 md:px-6 pb-8 md:pb-12">
                  <Badge variant="outline" className="w-fit mb-3 bg-black/40 text-white/70 border-white/10 backdrop-blur-sm">
                    SKIT Machine Learning Project
                  </Badge>
                  <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-xl leading-tight">
                    Smart Energy Consumption Prediction
                  </h1>
               </div>
            </div>
          )}

          <div className={cn(
            "max-w-7xl mx-auto px-4 md:px-6 py-8 pb-24",
            activeView !== 'overview' && "pt-8"
          )}>
            {renderContent()}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Hidden on Desktop) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-50">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-300",
                activeView === item.id ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", activeView === item.id && "scale-110")} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: string, className?: string }) {
  const variants: any = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-border text-foreground",
    secondary: "bg-secondary text-secondary-foreground"
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest", variants[variant], className)}>
      {children}
    </span>
  );
}
