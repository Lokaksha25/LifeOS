
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus, Play, Film, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface GalleryItem {
    id: number;
    url: string;
    caption: string;
    type: 'image' | 'video';
}

// --- IndexedDB Helpers ---
const DB_NAME = 'LifeOS_Gallery_DB';
const DB_VERSION = 1;
const STORE_NAME = 'media';

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('month', 'month', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const addItemToDB = async (item: GalleryItem, file: Blob, month: string) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const record = {
            id: item.id,
            caption: item.caption,
            type: item.type,
            month: month,
            file: file,
            timestamp: Date.now()
        };

        const request = store.put(record);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getItemsFromDB = async (month: string): Promise<GalleryItem[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('month');
        const request = index.getAll(month);

        request.onsuccess = () => {
            const results = request.result;
            const sortedResults = results.sort((a: any, b: any) => b.timestamp - a.timestamp);

            const items = sortedResults.map((record: any) => ({
                id: record.id,
                url: URL.createObjectURL(record.file),
                caption: record.caption,
                type: record.type
            }));
            resolve(items);
        };
        request.onerror = () => reject(request.error);
    });
};

const deleteItemFromDB = async (id: number) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};



export const GalleryPage: React.FC = () => {
    const { month } = useParams<{ month: string }>();
    const decodedMonth = decodeURIComponent(month || 'Gallery');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

    // Load Data
    useEffect(() => {
        const loadGallery = async () => {
            setLoading(true);
            try {
                const dbItems = await getItemsFromDB(decodedMonth);
                if (dbItems.length > 0) {
                    setItems(dbItems);
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error("Failed to load gallery:", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        loadGallery();
    }, [decodedMonth]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const isVideo = file.type.startsWith('video/');
            const newId = Date.now();

            const newItem: GalleryItem = {
                id: newId,
                url: URL.createObjectURL(file), // Optimistic update
                caption: "New Memory",
                type: isVideo ? 'video' : 'image'
            };

            try {
                await addItemToDB(newItem, file, decodedMonth);
                const dbItems = await getItemsFromDB(decodedMonth);
                setItems(dbItems);
            } catch (e) {
                console.error("Failed to save upload:", e);
                alert("Could not save to local storage.");
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this memory?")) {
            await deleteItemFromDB(id);
            const dbItems = await getItemsFromDB(decodedMonth);
            setItems(dbItems);
            setSelectedItem(null);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 p-6 md:p-12 transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link to="/timeline" className="p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft size={24} className="text-neutral-800 dark:text-neutral-200" />
                    </Link>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{decodedMonth}</h1>
                </div>

                {/* Upload Button */}
                <button
                    onClick={triggerUpload}
                    className="group flex items-center gap-2 px-5 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-95 shadow-lg shadow-neutral-200 dark:shadow-none"
                >
                    <Plus size={18} />
                    <span className="hidden md:inline">Add Memory</span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                />
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-neutral-300 dark:text-neutral-600" size={32} />
                </div>
            ) : (
                /* Masonry Grid */
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 max-w-7xl mx-auto">
                    {items.map((item) => (
                        <motion.div
                            layoutId={`media-${item.id}`}
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="break-inside-avoid relative group cursor-zoom-in overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                        >
                            {/* Delete Button (On Hover) - Improved Visibility & Hit Area */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                className="absolute top-3 right-3 z-30 p-2.5 bg-black/40 hover:bg-red-500 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg border border-white/10"
                                title="Delete Memory"
                            >
                                <Trash2 size={16} />
                            </button>

                            {item.type === 'video' ? (
                                <div className="relative w-full">
                                    <video
                                        src={item.url}
                                        className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out block"
                                        muted
                                        playsInline
                                        loop
                                        preload="metadata"
                                        onMouseOver={(e) => e.currentTarget.play()}
                                        onMouseOut={(e) => e.currentTarget.pause()}
                                    />
                                    <div className="absolute top-4 left-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white pointer-events-none">
                                        <Film size={16} />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none opacity-100 group-hover:opacity-0">
                                        <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                                            <Play size={20} className="text-white fill-white ml-1" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={item.caption}
                                    className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out block"
                                />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <p className="text-white text-sm font-medium truncate">{item.caption}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-black/95 backdrop-blur-xl p-4 md:p-10"
                        onClick={() => setSelectedItem(null)}
                    >
                        <div className="absolute top-6 right-6 z-50 flex gap-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(selectedItem.id); }}
                                className="p-3 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-500 transition-colors shadow-sm"
                                title="Delete Memory"
                            >
                                <Trash2 size={24} />
                            </button>

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="p-3 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-colors shadow-sm"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div
                            className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden bg-black"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedItem.type === 'video' ? (
                                <video
                                    src={selectedItem.url}
                                    controls
                                    autoPlay
                                    className="w-full h-full max-h-[85vh] object-contain"
                                />
                            ) : (
                                <motion.img
                                    layoutId={`media-${selectedItem.id}`}
                                    src={selectedItem.url}
                                    alt={selectedItem.caption}
                                    className="w-full h-full max-h-[85vh] object-contain"
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
