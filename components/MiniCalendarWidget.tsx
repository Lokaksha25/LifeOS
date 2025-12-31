
import React from 'react';

interface MiniCalendarProps {
  month: string; // e.g. "January 2026"
}

export const MiniCalendarWidget: React.FC<MiniCalendarProps> = ({ month }) => {
  // Safe date parsing
  const [monthName, yearStr] = month.split(' ');
  const year = parseInt(yearStr);
  const monthIndex = new Date(`${month} 1`).getMonth(); 

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDay = new Date(year, monthIndex, 1).getDay(); // 0 (Sun) - 6 (Sat)

  const today = new Date();
  const isCurrentMonth = today.getMonth() === monthIndex && today.getFullYear() === year;
  const currentDay = today.getDate();

  // Generate grid cells
  const cells = [];
  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }
  // Days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }

  return (
    <div className="w-full h-full flex flex-col items-center pt-2">
      {/* Classic Paper Header */}
      <div className="text-center mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-2 w-full max-w-[80%] mx-auto">
        <h3 className="font-serif text-lg text-neutral-900 dark:text-neutral-100 uppercase tracking-[0.3em] font-semibold leading-none">
          {monthName}
        </h3>
      </div>

      {/* Grid Container */}
      <div className="w-full px-4">
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-neutral-400 dark:text-neutral-500 font-sans font-medium">
                    {d}
                </div>
            ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-3">
            {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                
                const isToday = isCurrentMonth && day === currentDay;
                
                return (
                    <div key={idx} className="flex flex-col items-center relative group">
                        <span className={`font-serif text-sm leading-none transition-colors ${
                            isToday ? 'text-neutral-900 dark:text-white font-bold' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200'
                        }`}>
                            {day}
                        </span>
                        {isToday && (
                            <div className="absolute -bottom-1.5 w-1 h-1 bg-red-500 rounded-full" />
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
