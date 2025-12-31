
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Plus, X, ChevronRight, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface PlannerEvent {
  id: string;
  date: string; // ISO String for key YYYY-MM-DD
  title: string;
  time: string;
  color: string; // Tailwind class
}

interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
  date: string; // ISO String
}

export const PlannerPage: React.FC = () => {
  const { month } = useParams<{ month: string }>();
  const decodedMonth = decodeURIComponent(month || 'Planner');
  
  // Basic Date Parsing
  const [monthName, yearStr] = decodedMonth.split(' ');
  const year = parseInt(yearStr);
  const monthIndex = new Date(`${decodedMonth} 1`).getMonth();
  
  // State
  const [events, setEvents] = useState<Record<string, PlannerEvent[]>>({});
  const [tasks, setTasks] = useState<ToDoItem[]>([]);
  const [newTaskInput, setNewTaskInput] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Event Editor State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventColor, setNewEventColor] = useState("bg-neutral-900");

  // Constants
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const formattedToday = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // --- Persistence ---
  useEffect(() => {
    const savedEvents = localStorage.getItem('planner_events');
    const savedTasks = localStorage.getItem('planner_tasks');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    
    // Mock Data if empty
    if (!savedTasks) {
        setTasks([
            { id: '1', text: "Review quarterly goals", completed: false, date: todayKey },
            { id: '2', text: "Buy groceries", completed: true, date: todayKey }
        ]);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(events).length > 0) localStorage.setItem('planner_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem('planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- Calendar Generation ---
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDay = new Date(year, monthIndex, 1).getDay(); // 0 (Sun)
  
  const calendarCells = [];
  for (let i = 0; i < startDay; i++) calendarCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);

  // --- Handlers ---

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEventId(null);
    setNewEventTitle("");
    setNewEventTime("");
    setNewEventColor("bg-neutral-900");
  };

  const handleSaveEvent = () => {
    if (!selectedDate || !newEventTitle) return;

    if (editingEventId) {
        // Edit Existing
        setEvents(prev => ({
            ...prev,
            [selectedDate]: prev[selectedDate].map(ev => 
                ev.id === editingEventId 
                ? { ...ev, title: newEventTitle, time: newEventTime, color: newEventColor }
                : ev
            )
        }));
    } else {
        // Create New
        const newEvent: PlannerEvent = {
            id: Date.now().toString(),
            date: selectedDate,
            title: newEventTitle,
            time: newEventTime || "All Day",
            color: newEventColor
        };
        
        setEvents(prev => ({
            ...prev,
            [selectedDate]: [...(prev[selectedDate] || []), newEvent]
        }));
    }
    
    closeModal();
  };

  const handleDeleteEvent = () => {
    if (editingEventId && selectedDate) {
        if(confirm("Are you sure you want to delete this event?")) {
            setEvents(prev => ({
                ...prev,
                [selectedDate]: prev[selectedDate].filter(ev => ev.id !== editingEventId)
            }));
            closeModal();
        }
    }
  };

  const handleAddTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskInput.trim()) {
        const newTask: ToDoItem = {
            id: Date.now().toString(),
            text: newTaskInput,
            completed: false,
            date: todayKey
        };
        setTasks(prev => [newTask, ...prev]);
        setNewTaskInput("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const openNewEventModal = (day: number) => {
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateKey);
    setEditingEventId(null);
    setNewEventTitle("");
    setNewEventTime("");
    setNewEventColor("bg-neutral-900");
    setIsModalOpen(true);
  };

  const openEditEventModal = (e: React.MouseEvent, event: PlannerEvent) => {
    e.stopPropagation(); // Prevent opening the "New Event" modal from the cell click
    setSelectedDate(event.date);
    setEditingEventId(event.id);
    setNewEventTitle(event.title);
    setNewEventTime(event.time);
    setNewEventColor(event.color);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col md:flex-row transition-colors duration-300">
       
       {/* --- Left: The Calendar (2/3) --- */}
       <div className="flex-1 p-6 md:p-12 flex flex-col h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-6 mb-8">
            <Link to="/timeline" className="p-3 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm">
                <ArrowLeft size={20} className="text-neutral-600 dark:text-neutral-300" />
            </Link>
            <h1 className="text-4xl font-serif font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{monthName} <span className="text-neutral-300 dark:text-neutral-600 font-sans font-light tracking-normal">{year}</span></h1>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[600px] transition-colors">
             {/* Days Header */}
             <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                    <div key={d} className="py-4 text-center text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-widest">
                        {d}
                    </div>
                ))}
             </div>
             
             {/* Days Grid */}
             <div className="grid grid-cols-7 grid-rows-5 flex-1 divide-x divide-y divide-neutral-100 dark:divide-neutral-800">
                {calendarCells.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="bg-neutral-50/30 dark:bg-neutral-800/30" />;
                    
                    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = events[dateKey] || [];
                    const isToday = dateKey === todayKey;

                    return (
                        <div 
                            key={day} 
                            onClick={() => openNewEventModal(day)}
                            className={`relative p-2 group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer flex flex-col ${isToday ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                        >
                            <span className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full mb-1 ${isToday ? 'bg-red-500 text-white' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200'}`}>
                                {day}
                            </span>
                            
                            {/* Event Pills */}
                            <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                {dayEvents.map(ev => (
                                    <div 
                                        key={ev.id} 
                                        onClick={(e) => openEditEventModal(e, ev)}
                                        className={`text-[10px] px-2 py-1 rounded md:rounded-md truncate font-medium cursor-pointer hover:opacity-80 transition-opacity ${ev.color.includes('neutral') ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-200'}`}
                                    >
                                        {ev.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>
       </div>

       {/* --- Right: The Sidebar (1/3) --- */}
       <div className="w-full md:w-[400px] bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 p-8 flex flex-col h-auto md:h-screen shadow-[0_0_40px_rgba(0,0,0,0.03)] z-10 transition-colors">
          <div className="mb-8">
             <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">Today's Focus</h2>
             <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">{formattedToday}</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            
            {/* Schedule Section */}
            <div>
                 <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock size={12} />
                    Schedule
                 </h3>
                 <div className="space-y-2">
                    {(events[todayKey] || []).length > 0 ? (
                        (events[todayKey] || []).map(ev => (
                            <div 
                                key={ev.id}
                                onClick={(e) => openEditEventModal(e, ev)}
                                className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group border border-transparent hover:border-neutral-200 dark:hover:border-neutral-600"
                            >
                                <div className={`w-2 h-2 rounded-full ${ev.color} ring-2 ring-white dark:ring-neutral-900 shadow-sm`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{ev.title}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{ev.time}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 text-neutral-400 transition-opacity">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-neutral-300 dark:text-neutral-600 italic pl-1">No events scheduled.</p>
                    )}
                 </div>
            </div>

            {/* Tasks Section */}
            <div>
                 <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Check size={12} />
                    To-Do
                 </h3>
                 
                 {/* Quick Add */}
                 <div className="relative mb-4">
                    <input 
                        type="text" 
                        placeholder="Add a task..." 
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value)}
                        onKeyDown={handleAddTask}
                        className="w-full pl-4 pr-10 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:ring-1 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-all border border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-200 dark:focus:border-neutral-700"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-neutral-600">
                        <Plus size={16} />
                    </div>
                 </div>

                 {/* Task List */}
                 <div className="space-y-2">
                    {tasks.filter(t => t.date === todayKey || !t.completed).map(task => (
                        <motion.div 
                            key={task.id}
                            layout
                            className="flex items-center justify-between gap-3 group py-1 pr-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                        >
                            <div className="flex items-start gap-3 flex-1">
                                <button 
                                    onClick={() => toggleTask(task.id)}
                                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                        task.completed 
                                        ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900' 
                                        : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600 text-transparent hover:border-neutral-400 dark:hover:border-neutral-500'
                                    }`}
                                >
                                    <Check size={12} />
                                </button>
                                <span className={`text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed transition-all ${task.completed ? 'line-through text-neutral-300 dark:text-neutral-600' : ''}`}>
                                    {task.text}
                                </span>
                            </div>
                            
                            <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-red-500 transition-all"
                                title="Delete task"
                            >
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    ))}
                    
                    {tasks.length === 0 && (
                        <div className="text-sm text-neutral-300 dark:text-neutral-600 italic pl-1">
                            No tasks for today.
                        </div>
                    )}
                 </div>
            </div>
          </div>
       </div>

       {/* --- Event Modal --- */}
       <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/10 dark:bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-neutral-100 dark:border-neutral-800"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {editingEventId ? 'Edit Event' : 'Add Event'}
                            </h3>
                            <button onClick={closeModal}><X size={20} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Title</label>
                                <input 
                                    autoFocus
                                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-neutral-200 dark:focus:ring-neutral-700"
                                    placeholder="Meeting, Gym, etc."
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Time</label>
                                <input 
                                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-neutral-200 dark:focus:ring-neutral-700"
                                    placeholder="10:00 AM"
                                    value={newEventTime}
                                    onChange={(e) => setNewEventTime(e.target.value)}
                                />
                            </div>
                            
                            {/* Color Selection */}
                            <div className="flex gap-2 pt-2">
                                {[
                                    { bg: 'bg-neutral-900', label: 'Black' },
                                    { bg: 'bg-red-500', label: 'Red' },
                                    { bg: 'bg-blue-600', label: 'Blue' },
                                    { bg: 'bg-orange-500', label: 'Orange' },
                                ].map(c => (
                                    <button 
                                        key={c.bg}
                                        onClick={() => setNewEventColor(c.bg)}
                                        className={`w-8 h-8 rounded-full ${c.bg === 'bg-neutral-900' ? 'bg-neutral-900 dark:bg-white' : c.bg} ${newEventColor === c.bg ? 'ring-2 ring-offset-2 ring-neutral-300 dark:ring-neutral-600' : ''}`}
                                    />
                                ))}
                            </div>
                            
                            <div className="pt-2 flex flex-col gap-3">
                                <button 
                                    onClick={handleSaveEvent}
                                    className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                                >
                                    {editingEventId ? 'Save Changes' : 'Add Event'}
                                </button>
                                
                                {editingEventId && (
                                    <button 
                                        onClick={handleDeleteEvent}
                                        className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        Delete Event
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
       </AnimatePresence>

    </div>
  );
};
