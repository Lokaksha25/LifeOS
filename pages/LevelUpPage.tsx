
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Dumbbell, 
  Code, 
  Cpu, 
  Footprints, 
  Plus, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Trophy,
  TrendingUp,
  X,
  Target,
  Hash,
  Flame,
  Activity
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressRing } from '../components/ui/ProgressRing';

// --- Types ---
interface LeetCodeProblem {
  id: string;
  link: string;
  title: string;
  notes: string;
  date: string;
}

interface ActivityStats {
    steps: number;
    stepsGoal: number;
    calories: number;
    caloriesGoal: number;
}

interface FitnessStats {
  weight: number;
  weightHistory: { date: string; weight: number }[];
  bench: number;
  squat: number;
  deadlift: number;
  runDistance: number;
  activity: ActivityStats;
}

interface CodingStats {
  problems: LeetCodeProblem[];
  skills: string[];
}

export const LevelUpPage: React.FC = () => {
  const { month } = useParams<{ month: string }>();
  const decodedMonth = decodeURIComponent(month || 'Level Up');
  const storageKey = `levelup_data_${decodedMonth}`;

  // --- State Initialization ---
  const [fitness, setFitness] = useState<FitnessStats>({
    weight: 72.5,
    weightHistory: [
      { date: '1st', weight: 73.2 },
      { date: '5th', weight: 73.0 },
      { date: '10th', weight: 72.8 },
      { date: '15th', weight: 72.5 }
    ],
    bench: 85,
    squat: 110,
    deadlift: 140,
    runDistance: 24,
    activity: {
        steps: 6430,
        stepsGoal: 10000,
        calories: 450,
        caloriesGoal: 800
    }
  });

  const [coding, setCoding] = useState<CodingStats>({
    problems: [
      {
        id: '1',
        link: 'https://leetcode.com/problems/two-sum/',
        title: 'Two Sum',
        notes: 'Used a hash map for O(n) time complexity.',
        date: new Date().toLocaleDateString()
      }
    ],
    skills: ['React', 'TypeScript', 'System Design']
  });

  // UI State
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  
  const [editingPR, setEditingPR] = useState<{key: 'bench' | 'squat' | 'deadlift', label: string} | null>(null);
  const [prValue, setPrValue] = useState("");

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityInputType, setActivityInputType] = useState<'steps' | 'calories'>('steps');
  const [activityValue, setActivityValue] = useState("");

  const [problemLink, setProblemLink] = useState("");
  const [problemNotes, setProblemNotes] = useState("");
  const [skillInput, setSkillInput] = useState("");
  
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.fitness) {
          // Merge with default structure to ensure new fields (activity) exist if loading old data
          setFitness(prev => ({ ...prev, ...parsed.fitness, activity: parsed.fitness.activity || prev.activity }));
      }
      if (parsed.coding) setCoding(parsed.coding);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ fitness, coding }));
  }, [fitness, coding, storageKey]);

  // --- Handlers: Fitness ---
  const handleUpdateWeight = () => {
    const w = parseFloat(newWeight);
    if (w) {
      setFitness(prev => ({
        ...prev,
        weight: w,
        weightHistory: [...prev.weightHistory, { date: new Date().getDate() + 'th', weight: w }]
      }));
      setNewWeight("");
      setIsWeightModalOpen(false);
    }
  };

  const handleUpdatePR = () => {
    const val = parseFloat(prValue);
    if (editingPR && val) {
      setFitness(prev => ({ ...prev, [editingPR.key]: val }));
      setEditingPR(null);
      setPrValue("");
    }
  };

  const handleLogActivity = () => {
      const val = parseInt(activityValue);
      if (!val) return;

      setFitness(prev => ({
          ...prev,
          activity: {
              ...prev.activity,
              [activityInputType]: prev.activity[activityInputType] + val
          }
      }));
      setActivityValue("");
      setIsActivityModalOpen(false);
  };

  // --- Handlers: Coding ---
  const handleAddProblem = () => {
    if (!problemLink) return;
    
    // Simple mock title extraction
    let title = "LeetCode Problem";
    try {
        const urlObj = new URL(problemLink);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        // Usually /problems/two-sum/
        if (pathSegments.includes('problems')) {
            const idx = pathSegments.indexOf('problems');
            if (pathSegments[idx + 1]) {
                title = pathSegments[idx + 1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }
        }
    } catch (e) {}

    const newProblem: LeetCodeProblem = {
      id: Date.now().toString(),
      link: problemLink,
      title: title,
      notes: problemNotes,
      date: new Date().toLocaleDateString()
    };

    setCoding(prev => ({ ...prev, problems: [newProblem, ...prev.problems] }));
    setProblemLink("");
    setProblemNotes("");
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      if (!coding.skills.includes(skillInput.trim())) {
        setCoding(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setCoding(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 md:p-12 transition-colors duration-300">
       {/* Header */}
       <div className="max-w-7xl mx-auto flex items-center gap-4 mb-12">
          <Link to="/timeline" className="p-3 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm">
            <ArrowLeft size={20} className="text-neutral-800 dark:text-neutral-200" />
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{decodedMonth}</h1>
       </div>

       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- COLUMN 1: THE BODY (Fitness) --- */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                    <Dumbbell size={20} />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Physical Stats</h2>
            </div>

            {/* Weight Tracker */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden transition-colors">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider">Current Weight</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-5xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tighter">{fitness.weight}</span>
                            <span className="text-xl text-neutral-400 dark:text-neutral-500 font-medium">kg</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsWeightModalOpen(true)}
                        className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-orange-500 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Sparkline Chart */}
                <div className="h-24 w-full -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={fitness.weightHistory}>
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--tw-colors-neutral-900)', borderRadius: '8px', border: '1px solid #404040', color: '#fff' }}
                                itemStyle={{ color: '#f97316', fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="#f97316" 
                                strokeWidth={3} 
                                dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }} 
                                activeDot={{ r: 6 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Daily Goals / Activity Rings */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Activity size={18} className="text-neutral-400" />
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Daily Goals</h3>
                    </div>
                    <button 
                        onClick={() => setIsActivityModalOpen(true)}
                        className="text-xs font-medium px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                        Log Activity
                    </button>
                </div>

                <div className="flex justify-around items-end pb-2">
                    {/* Steps Ring */}
                    <div className="flex flex-col items-center gap-4">
                        <ProgressRing 
                            radius={70} 
                            stroke={4} 
                            progress={(fitness.activity.steps / fitness.activity.stepsGoal) * 100} 
                            color="text-orange-500" 
                            trackColor="text-neutral-100 dark:text-neutral-800"
                        >
                            <div className="flex flex-col items-center">
                                <Footprints size={20} className="text-orange-500 mb-1 opacity-80" />
                                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                                    {(fitness.activity.steps / 1000).toFixed(1)}k
                                </span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-medium">Steps</span>
                            </div>
                        </ProgressRing>
                    </div>

                    {/* Calories Ring */}
                    <div className="flex flex-col items-center gap-4">
                        <ProgressRing 
                            radius={50} 
                            stroke={3} 
                            progress={(fitness.activity.calories / fitness.activity.caloriesGoal) * 100} 
                            color="text-red-400" 
                            trackColor="text-neutral-100 dark:text-neutral-800"
                        >
                            <div className="flex flex-col items-center">
                                <Flame size={16} className="text-red-400 mb-0.5 opacity-80" />
                                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                                    {fitness.activity.calories}
                                </span>
                                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase font-medium">Cals</span>
                            </div>
                        </ProgressRing>
                    </div>
                </div>
            </div>

            {/* PR Tracker (The Big 3) */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { key: 'bench', label: 'Bench Press' },
                    { key: 'squat', label: 'Squat' },
                    { key: 'deadlift', label: 'Deadlift' }
                ].map((lift) => (
                    <motion.div 
                        key={lift.key}
                        whileHover={{ y: -2 }}
                        onClick={() => setEditingPR({ key: lift.key as any, label: lift.label })}
                        className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm cursor-pointer hover:border-orange-200 dark:hover:border-orange-800 transition-colors"
                    >
                        <p className="text-[10px] md:text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold mb-2">{lift.label}</p>
                        <p className="text-xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                            {fitness[lift.key as keyof FitnessStats] as number}
                            <span className="text-xs md:text-sm text-neutral-400 dark:text-neutral-500 font-normal ml-1">kg</span>
                        </p>
                    </motion.div>
                ))}
            </div>
          </div>


          {/* --- COLUMN 2: THE MIND (Coding) --- */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Code size={20} />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Technical Growth</h2>
            </div>

            {/* LeetCode Log */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm h-full max-h-[600px] flex flex-col transition-colors">
                <div className="flex items-center gap-2 mb-6">
                    <Cpu size={18} className="text-indigo-500" />
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">LeetCode Log</h3>
                </div>

                {/* Input Area */}
                <div className="space-y-3 mb-8 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                    <input 
                        type="text" 
                        placeholder="Problem Link..."
                        value={problemLink}
                        onChange={(e) => setProblemLink(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm outline-none focus:border-indigo-300 dark:focus:border-indigo-600 text-neutral-900 dark:text-white transition-colors"
                    />
                    <div className="flex gap-2">
                        <textarea 
                            placeholder="Notes on approach..."
                            value={problemNotes}
                            onChange={(e) => setProblemNotes(e.target.value)}
                            className="flex-1 bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm outline-none focus:border-indigo-300 dark:focus:border-indigo-600 text-neutral-900 dark:text-white transition-colors resize-none h-20"
                        />
                        <button 
                            onClick={handleAddProblem}
                            disabled={!problemLink}
                            className="w-12 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Problem List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {coding.problems.map((prob) => (
                        <div key={prob.id} className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500 dark:text-indigo-400 shrink-0">
                                        <Hash size={16} />
                                    </div>
                                    <div className="truncate">
                                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">{prob.title}</h4>
                                        <p className="text-xs text-neutral-400 dark:text-neutral-500">{prob.date}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <a 
                                        href={prob.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-neutral-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                    {prob.notes && (
                                        <button 
                                            onClick={() => setExpandedProblemId(expandedProblemId === prob.id ? null : prob.id)}
                                            className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                                        >
                                            {expandedProblemId === prob.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {expandedProblemId === prob.id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                            {prob.notes}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skill Stack */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-indigo-500" />
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Skill Stack</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {coding.skills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-full flex items-center gap-1 group">
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="hover:text-red-500 hidden group-hover:inline-block">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
                <input 
                    type="text" 
                    placeholder="Add skill (Press Enter)..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 rounded-xl border-none text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-indigo-300"
                />
            </div>
          </div>
       </div>

       {/* --- Modals --- */}
       
       {/* Weight Modal */}
       <AnimatePresence>
            {isWeightModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/20 dark:bg-black/50 backdrop-blur-sm" onClick={() => setIsWeightModalOpen(false)}>
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-neutral-100 dark:border-neutral-800"
                    >
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Update Weight</h3>
                        <input 
                            type="number" 
                            autoFocus
                            placeholder="70.0" 
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            className="w-full text-center text-4xl font-bold text-orange-500 outline-none placeholder:text-neutral-200 dark:placeholder:text-neutral-700 bg-transparent mb-6"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsWeightModalOpen(false)} className="flex-1 py-3 text-neutral-500 dark:text-neutral-400 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleUpdateWeight} className="flex-1 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">Update</button>
                        </div>
                    </motion.div>
                </div>
            )}
       </AnimatePresence>

       {/* PR Modal */}
       <AnimatePresence>
            {editingPR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/20 dark:bg-black/50 backdrop-blur-sm" onClick={() => setEditingPR(null)}>
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-neutral-100 dark:border-neutral-800"
                    >
                        <div className="flex items-center gap-2 mb-4 text-orange-500">
                            <Trophy size={20} />
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{editingPR.label} PR</h3>
                        </div>
                        <input 
                            type="number" 
                            autoFocus
                            placeholder="100" 
                            value={prValue}
                            onChange={(e) => setPrValue(e.target.value)}
                            className="w-full text-center text-4xl font-bold text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-200 dark:placeholder:text-neutral-700 bg-transparent mb-6"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setEditingPR(null)} className="flex-1 py-3 text-neutral-500 dark:text-neutral-400 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleUpdatePR} className="flex-1 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">Save PR</button>
                        </div>
                    </motion.div>
                </div>
            )}
       </AnimatePresence>

       {/* Activity Modal */}
       <AnimatePresence>
           {isActivityModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/20 dark:bg-black/50 backdrop-blur-sm" onClick={() => setIsActivityModalOpen(false)}>
                   <motion.div 
                       initial={{ scale: 0.95, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       exit={{ scale: 0.95, opacity: 0 }}
                       onClick={(e) => e.stopPropagation()}
                       className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-neutral-100 dark:border-neutral-800"
                   >
                       <div className="flex justify-between items-center mb-6">
                           <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Log Activity</h3>
                           <button onClick={() => setIsActivityModalOpen(false)}><X size={20} className="text-neutral-400" /></button>
                       </div>
                       
                       <div className="flex gap-2 mb-6 bg-neutral-50 dark:bg-neutral-800 p-1 rounded-xl">
                           <button 
                               onClick={() => setActivityInputType('steps')}
                               className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activityInputType === 'steps' ? 'bg-white dark:bg-neutral-700 text-orange-500 shadow-sm' : 'text-neutral-400'}`}
                           >
                               Steps
                           </button>
                           <button 
                               onClick={() => setActivityInputType('calories')}
                               className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activityInputType === 'calories' ? 'bg-white dark:bg-neutral-700 text-red-400 shadow-sm' : 'text-neutral-400'}`}
                           >
                               Calories
                           </button>
                       </div>

                       <div className="relative mb-6">
                            <input 
                                type="number" 
                                autoFocus
                                placeholder={activityInputType === 'steps' ? "e.g. 5000" : "e.g. 300"} 
                                value={activityValue}
                                onChange={(e) => setActivityValue(e.target.value)}
                                className={`w-full text-center text-4xl font-bold outline-none placeholder:text-neutral-200 dark:placeholder:text-neutral-700 bg-transparent ${activityInputType === 'steps' ? 'text-orange-500' : 'text-red-400'}`}
                            />
                            <p className="text-center text-xs text-neutral-400 font-medium uppercase mt-2">
                                {activityInputType === 'steps' ? 'Steps to add' : 'Calories to add'}
                            </p>
                       </div>
                       
                       <button 
                            onClick={handleLogActivity} 
                            className={`w-full py-3 text-white font-medium rounded-xl transition-colors ${activityInputType === 'steps' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-400 hover:bg-red-500'}`}
                        >
                           Add to Daily Total
                       </button>
                   </motion.div>
               </div>
           )}
       </AnimatePresence>

    </div>
  );
};
