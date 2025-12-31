
import React from 'react';
import { ContainerScroll } from '../components/ui/ContainerScroll';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:20px_20px] transition-colors duration-300">
      <div className="flex flex-col overflow-hidden">
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center justify-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                  <h1 className="text-7xl md:text-[10rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-400 dark:from-white dark:via-neutral-200 dark:to-neutral-500 leading-none tracking-tighter mb-6">
                    LifeOS
                  </h1>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-xl md:text-3xl text-neutral-500 dark:text-neutral-400 font-medium tracking-tight"
              >
                 Digital Diary 2026
              </motion.p>
            </div>
          }
        >
          {/* Notebook Page Simulation */}
          <div className="h-full w-full bg-white dark:bg-neutral-900 relative flex flex-col items-center justify-center p-8 md:p-20 overflow-hidden rounded-[2rem] transition-colors duration-300">
             {/* Refined Paper texture */}
             <div className="absolute inset-0 bg-[linear-gradient(#f5f5f5_1px,transparent_1px)] dark:bg-[linear-gradient(#171717_1px,transparent_1px)] [background-size:100%_2rem] pointer-events-none" />
             <div className="absolute left-10 md:left-24 top-0 bottom-0 w-[1px] bg-red-200 dark:bg-red-900/50" />
             
             <div className="relative z-10 flex flex-col items-center text-center space-y-12 max-w-4xl mx-auto">
                <motion.h2 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-7xl font-serif italic text-neutral-800 dark:text-neutral-200 leading-tight"
                >
                  "Journal the <span className="text-neutral-900 dark:text-white font-semibold not-italic decoration-slice">You</span> on the Journey of Life"
                </motion.h2>
                
                <Link to="/timeline">
                    <motion.button
                        whileHover={{ scale: 1.05, gap: '1rem' }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative flex items-center gap-2 px-10 py-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-lg font-medium shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] transition-all duration-300"
                    >
                      <span>Start Journaling</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </Link>
             </div>
          </div>
        </ContainerScroll>
      </div>
    </div>
  );
};
