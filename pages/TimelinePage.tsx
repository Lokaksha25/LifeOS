
import React from 'react';
import { Timeline } from '../components/ui/Timeline';
import { MonthBentoGrid } from '../components/MonthBentoGrid';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TimelinePage: React.FC = () => {
  const months2026 = [
    "January 2026",
    "February 2026",
    "March 2026",
    "April 2026",
    "May 2026",
    "June 2026",
    "July 2026",
    "August 2026",
    "September 2026",
    "October 2026",
    "November 2026",
    "December 2026"
  ];

  const timelineData = months2026.map(month => ({
    title: month,
    content: <MonthBentoGrid month={month} />
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
      <div className="fixed top-6 left-6 z-50">
        <Link to="/" className="p-2 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors shadow-sm">
            <ArrowLeft size={20} />
        </Link>
      </div>
      <Timeline data={timelineData} />
    </div>
  );
};
