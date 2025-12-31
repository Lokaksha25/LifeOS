
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Image as ImageIcon, Activity } from 'lucide-react';
import { MiniCalendarWidget } from './MiniCalendarWidget';

interface MonthBentoGridProps {
  month: string;
}

const Card = ({ 
  children, 
  to, 
  className, 
  delay = 0,
  noPadding = false
}: { 
  children?: React.ReactNode; 
  to: string; 
  className?: string; 
  delay?: number;
  noPadding?: boolean;
}) => {
  return (
    <Link to={to} className={`block h-full ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.02 }}
        className="group relative h-full w-full overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-all hover:shadow-md"
      >
        <div className="absolute inset-0 bg-white dark:bg-neutral-900 transition-opacity duration-500 group-hover:opacity-10" />
        
        {/* Background Image Reveal (Only if not using MiniCalendar to keep it clean) */}
        {!noPadding && (
            <>
                <div 
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://picsum.photos/800/600?random=${Math.random()}')` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-white/80 dark:from-neutral-900/90 dark:via-neutral-900/50 dark:to-neutral-900/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </>
        )}
        
        <div className={`relative z-10 flex h-full flex-col ${noPadding ? 'p-0' : 'p-6'}`}>
          {children}
        </div>
      </motion.div>
    </Link>
  );
};

export const MonthBentoGrid: React.FC<MonthBentoGridProps> = ({ month }) => {
  const encodedMonth = encodeURIComponent(month);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-[600px] md:h-[500px]">
      
      {/* Journal Card - Large */}
      <div className="md:row-span-2">
        <Card to={`/journal/${encodedMonth}`} className="h-full">
            <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                        <BookOpen size={20} />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Journal</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Reflect on your days.</p>
                </div>
                <div className="mt-8">
                    <div className="text-4xl font-light text-neutral-900 dark:text-neutral-100">12</div>
                    <div className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Entries this month</div>
                </div>
            </div>
        </Card>
      </div>

      {/* Gallery Card */}
      <Card to={`/gallery/${encodedMonth}`} delay={0.1}>
         <div className="flex items-start justify-between">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Gallery</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Memories captured.</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                <ImageIcon size={16} className="text-neutral-600 dark:text-neutral-300"/>
            </div>
         </div>
         <div className="mt-4 flex -space-x-3 overflow-hidden py-2">
            {[1,2,3].map(i => (
                <div key={i} className="h-12 w-12 rounded-lg border-2 border-white dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-700 shadow-sm overflow-hidden">
                    <img src={`https://picsum.photos/100/100?random=${i}`} alt="mini" className="h-full w-full object-cover" />
                </div>
            ))}
         </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Level Up */}
        <Card to={`/levelup/${encodedMonth}`} delay={0.2}>
             <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <Activity size={18} className="text-neutral-400"/>
                </div>
                <div>
                     <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Level Up</h4>
                     <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Habits & Code</p>
                </div>
                {/* Micro Chart visual */}
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-neutral-800 dark:bg-neutral-200 h-full w-[75%]" />
                </div>
             </div>
        </Card>

        {/* Planner - Using Widget */}
        <Card to={`/planner/${encodedMonth}`} delay={0.3} noPadding={true}>
            <MiniCalendarWidget month={month} />
        </Card>
      </div>

    </div>
  );
};
