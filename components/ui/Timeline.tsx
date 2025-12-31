
import React from 'react';
import { motion } from 'framer-motion';

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
}

export const Timeline: React.FC<TimelineProps> = ({ data }) => {
  return (
    <div className="w-full bg-white dark:bg-neutral-950 font-sans md:px-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 max-w-4xl">
          Your Journey
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base max-w-sm">
          A collection of moments, thoughts, and progress.
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
            {/* Sticky Date/Title Section */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 shadow-sm transition-colors duration-300">
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-300 dark:text-neutral-700">
                {item.title}
              </h3>
            </div>

            {/* Content Section */}
            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-400">
                {item.title}
              </h3>
              <div>{item.content}</div>
            </div>
          </div>
        ))}
        
        {/* Vertical Line */}
        <div
          style={{ height: "100%" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-800 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
        </div>
      </div>
    </div>
  );
};
