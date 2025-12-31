
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  ChevronRight, 
  X, 
  Mic, 
  Sparkles, 
  Loader2, 
  Square, 
  Calendar,
  Save,
  PenTool,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeJournalEntry, transcribeAudio } from '../services/geminiService';
import { JournalEntry } from '../types';

export const JournalPage: React.FC = () => {
  const { month } = useParams<{ month: string }>();
  const decodedMonth = decodeURIComponent(month || 'Journal');
  
  // State
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [monthlyReview, setMonthlyReview] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // UI State for Review Save
  const [reviewSaved, setReviewSaved] = useState(false); 
  
  // Modal / Editor State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorDate, setEditorDate] = useState(""); 
  const [editorReflection, setEditorReflection] = useState<string | null>(null);
  
  // AI/Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Helper: Get today's ordinal date (e.g., "12th")
  const getOrdinalDate = () => {
    const d = new Date().getDate();
    const suffix = ["st","nd","rd"][((d+90)%100-10)%10-1]||"th";
    return `${d}${suffix}`;
  };

  // --- Persistence ---
  
  // 1. Load Data
  useEffect(() => {
    const entryStorageKey = `journal_entries_${decodedMonth}`;
    const reviewStorageKey = `journal_review_${decodedMonth}`;
    
    const savedEntries = localStorage.getItem(entryStorageKey);
    const savedReview = localStorage.getItem(reviewStorageKey);
    
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    } else {
      // Mock Data
      const initialData: JournalEntry[] = [
        {
          id: '1',
          title: 'Morning Reflections',
          content: 'Woke up feeling refreshed. The sun was hitting the window just right.',
          date: '1st',
          timestamp: 1767254400000, // Jan 1 2026
          aiReflection: 'Cherish these quiet mornings.'
        },
        {
          id: '2',
          title: 'Project Kickoff',
          content: 'Started the new design system today. It feels clean and organized.',
          date: '3rd',
          timestamp: 1767427200000, // Jan 3 2026
        }
      ];
      setEntries(initialData);
    }
    
    if (savedReview) {
        setMonthlyReview(savedReview);
    } else {
        setMonthlyReview("");
    }
  }, [decodedMonth]);

  // 2. Save Entries
  useEffect(() => {
    const storageKey = `journal_entries_${decodedMonth}`;
    if (entries.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }
  }, [entries, decodedMonth]);
  
  // 3. Save Monthly Review (Auto-save)
  useEffect(() => {
    const storageKey = `journal_review_${decodedMonth}`;
    localStorage.setItem(storageKey, monthlyReview);
  }, [monthlyReview, decodedMonth]);

  // --- Handlers ---
  
  // Manual Save Handler for Monthly Review
  const handleSaveReview = () => {
    const storageKey = `journal_review_${decodedMonth}`;
    localStorage.setItem(storageKey, monthlyReview);
    setReviewSaved(true);
    setTimeout(() => setReviewSaved(false), 2000);
  };

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.timestamp - b.timestamp); 

  const openNewEntry = () => {
    setCurrentId(null);
    setEditorTitle("");
    setEditorContent("");
    setEditorDate(getOrdinalDate()); 
    setEditorReflection(null);
    setIsModalOpen(true);
  };

  const openEditEntry = (entry: JournalEntry) => {
    setCurrentId(entry.id);
    setEditorTitle(entry.title);
    setEditorContent(entry.content);
    setEditorDate(entry.date); 
    setEditorReflection(entry.aiReflection || null);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editorTitle.trim() && !editorContent.trim()) return;

    if (currentId) {
      // Update existing
      setEntries(prev => prev.map(e => e.id === currentId ? {
        ...e,
        title: editorTitle,
        content: editorContent,
        date: editorDate, 
        aiReflection: editorReflection || undefined
      } : e));
    } else {
      // Create new
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: editorTitle || "Untitled",
        content: editorContent,
        date: editorDate, 
        timestamp: Date.now(),
        aiReflection: editorReflection || undefined
      };
      setEntries(prev => [...prev, newEntry]);
    }
    setIsModalOpen(false);
  };

  // ... Audio Logic ... (same as before)
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        } else {
            reject(new Error("Failed to read blob"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
           if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
           setIsTranscribing(true);
           try {
             const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
             const base64 = await blobToBase64(audioBlob);
             const text = await transcribeAudio(base64, 'audio/webm');
             if (text) setEditorContent(prev => prev + (prev ? " " : "") + text);
           } catch (e) {
             console.error(e);
             alert("Transcription failed");
           } finally {
             setIsTranscribing(false);
           }
           stream.getTracks().forEach(t => t.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied");
      }
    }
  };

  const handleReflect = async () => {
    if (!editorContent) return;
    setIsAnalyzing(true);
    const result = await analyzeJournalEntry(editorContent);
    setEditorReflection(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-100 dark:selection:bg-neutral-800 transition-colors duration-300">
      
      {/* --- Main Dashboard --- */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link to="/timeline" className="p-2 rounded-full bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 transition-colors">
              <ArrowLeft size={20} className="text-neutral-600 dark:text-neutral-400" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{decodedMonth}</h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text" 
                placeholder="Search memories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-sm outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            
            {/* New Entry Button */}
            <button 
              onClick={openNewEntry}
              className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-3 rounded-xl text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-95 shadow-lg shadow-neutral-200/50 dark:shadow-none"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Entry</span>
            </button>
          </div>
        </div>

        {/* --- Monthly Review Section --- */}
        <div className="mb-8">
            <motion.div 
                layout
                className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
                        <PenTool size={18} />
                        <h2 className="text-sm font-bold uppercase tracking-widest">Monthly Review</h2>
                    </div>
                    
                    <button 
                        onClick={handleSaveReview}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${reviewSaved ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300'}`}
                    >
                        {reviewSaved ? <Check size={14} /> : <Save size={14} />}
                        <span>{reviewSaved ? 'Saved!' : 'Save Review'}</span>
                    </button>
                </div>
                
                <textarea 
                    value={monthlyReview}
                    onChange={(e) => setMonthlyReview(e.target.value)}
                    placeholder={`Reflect on ${decodedMonth}... What went well? What did you learn?`}
                    className="w-full bg-transparent outline-none resize-none text-neutral-700 dark:text-neutral-300 font-serif text-lg leading-relaxed placeholder:text-neutral-300 dark:placeholder:text-neutral-600 min-h-[120px] focus:min-h-[200px] transition-all duration-300"
                />
            </motion.div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <motion.div 
                key={entry.id}
                layoutId={`card-${entry.id}`}
                onClick={() => openEditEntry(entry)}
                className="group flex items-center justify-between p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-6 overflow-hidden">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 font-semibold text-sm border border-neutral-100 dark:border-neutral-700">
                    <span className="text-xs text-neutral-400 uppercase">{entry.date.replace(/[^a-zA-Z]/g, '')}</span>
                    <span className="text-lg leading-none">{entry.date.replace(/[^0-9]/g, '')}</span>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate pr-4">{entry.title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate pr-4 max-w-md">{entry.content}</p>
                  </div>
                </div>
                <div className="text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-neutral-300 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                <Calendar className="text-neutral-300 dark:text-neutral-600" size={24} />
              </div>
              <p className="text-neutral-400 dark:text-neutral-500 font-medium">No memories found.</p>
              {searchQuery && <p className="text-sm text-neutral-300 mt-1">Try adjusting your search.</p>}
            </div>
          )}
        </div>
      </div>

      {/* --- Editor Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-neutral-900/20 dark:bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors">
                  <X size={20} />
                </button>
                <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
                  {currentId ? 'Edit Entry' : 'New Entry'}
                </span>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
              </div>

              {/* Editor Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                 {/* Date Input */}
                 <input 
                    type="text" 
                    value={editorDate}
                    onChange={(e) => setEditorDate(e.target.value)}
                    className="w-full text-sm font-bold text-neutral-400 dark:text-neutral-500 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 outline-none border-none bg-transparent mb-2"
                    placeholder="Date (e.g. 12th)"
                 />

                 <input 
                    type="text" 
                    placeholder="Title your day..."
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="w-full text-3xl font-bold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 outline-none border-none bg-transparent mb-6"
                 />
                 
                 <div className="relative min-h-[200px]">
                    <textarea 
                        placeholder="What's on your mind?"
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        className="w-full h-full min-h-[300px] text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 resize-none outline-none border-none bg-transparent font-serif"
                    />
                    
                    {/* Transcription Overlay */}
                    {isTranscribing && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="flex items-center gap-2 text-neutral-500 font-medium animate-pulse">
                                <Loader2 size={18} className="animate-spin" />
                                <span>Transcribing audio...</span>
                            </div>
                        </div>
                    )}
                 </div>

                 {/* Reflection Block */}
                 {editorReflection && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-5 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl"
                    >
                         <div className="flex items-center gap-2 mb-2 text-indigo-500 dark:text-indigo-400">
                            <Sparkles size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">AI Reflection</span>
                        </div>
                        <p className="text-indigo-900/80 dark:text-indigo-200 italic text-sm leading-relaxed">
                            "{editorReflection}"
                        </p>
                    </motion.div>
                 )}
              </div>

              {/* Modal Toolbar (Bottom) */}
              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={toggleRecording}
                        disabled={isTranscribing}
                        className={`p-3 rounded-full transition-all flex items-center gap-2 ${isRecording ? 'bg-red-500 text-white' : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'}`}
                    >
                        {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                        {isRecording && <span className="text-xs font-medium pr-1">Recording...</span>}
                    </button>
                    
                    {editorContent.length > 10 && !editorReflection && (
                        <button 
                            onClick={handleReflect}
                            disabled={isAnalyzing}
                            className="p-3 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-indigo-500 dark:text-indigo-400 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                            title="Get Reflection"
                        >
                            {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        </button>
                    )}
                 </div>
                 <div className="text-xs text-neutral-400 dark:text-neutral-500">
                    {editorContent.length} chars
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
