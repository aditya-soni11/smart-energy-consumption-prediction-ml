import React from 'react';
import { SiPandas, SiScikitlearn, SiReact, SiSqlite } from 'react-icons/si';

export function TechStack() {
  const stack = [
    { name: 'Pandas', icon: SiPandas, label: 'Data Processing' },
    { name: 'Scikit-learn', icon: SiScikitlearn, label: 'ML Forecasting' },
    { name: 'React', icon: SiReact, label: 'Frontend' },
    { name: 'SQLite', icon: SiSqlite, label: 'Data Persistence' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 py-8 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
      {stack.map((tech) => (
        <div key={tech.name} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default group">
          <tech.icon className="h-5 w-5 group-hover:text-primary transition-colors" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold font-heading">{tech.name}</span>
            <span className="text-[8px] text-muted-foreground">{tech.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
