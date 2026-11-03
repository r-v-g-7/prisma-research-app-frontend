import React, { useState, useEffect } from "react";
import { getZoteroCollections, getZoteroItems } from "@/services/integrations";
import { importZoteroToWorkspace } from "@/services/discovery";
import { Button } from "@/components/ui/button";
import {
    Library,
    FolderKanban,
    Check,
    X,
    FileText,
    BookOpen,
    AlertCircle,
    Loader2
} from "lucide-react";

export default function ZoteroImportModal({ workspaceId, isOpen, onClose, onImportSuccess }) {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState("");
    const [items, setItems] = useState([]);
    const [selectedItemKeys, setSelectedItemKeys] = useState({});
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setLoadingCollections(true);
            setError("");
            getZoteroCollections()
                .then(res => {
                    const list = res.data || [];
                    setCollections(list);
                    if (list.length > 0) {
                        setSelectedCollection(list[0].key);
                    } else {
                        // Load library root items
                        loadItems("");
                    }
                })
                .catch(err => {
                    setError(err.message || "Could not fetch Zotero collections. Is Zotero connected in Settings?");
                })
                .finally(() => setLoadingCollections(false));
        }
    }, [isOpen]);

    const loadItems = async (collectionKey) => {
        setLoadingItems(true);
        setError("");
        try {
            const res = await getZoteroItems(collectionKey);
            const itemList = res.data || [];
            setItems(itemList);
            // Default select all items
            const initialMap = {};
            itemList.forEach(item => { initialMap[item.zoteroKey] = true; });
            setSelectedItemKeys(initialMap);
        } catch (err) {
            setError(err.message || "Failed to load Zotero items");
        } finally {
            setLoadingItems(false);
        }
    };

    useEffect(() => {
        if (selectedCollection) {
            loadItems(selectedCollection);
        }
    }, [selectedCollection]);

    const toggleItem = (key) => {
        setSelectedItemKeys(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleImportSubmit = async () => {
        const selectedItems = items.filter(item => selectedItemKeys[item.zoteroKey]);
        if (selectedItems.length === 0) {
            alert("Please select at least one reference to import.");
            return;
        }

        setImporting(true);
        setError("");
        try {
            const res = await importZoteroToWorkspace(workspaceId, selectedItems);
            if (res.success) {
                if (onImportSuccess) onImportSuccess(res.message);
                onClose();
            }
        } catch (err) {
            setError(err.message || "Failed to import Zotero references.");
        } finally {
            setImporting(false);
        }
    };

    if (!isOpen) return null;

    const selectedCount = Object.values(selectedItemKeys).filter(Boolean).length;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                    <div className="flex items-center gap-2">
                        <Library className="w-5 h-5 text-rose-400" />
                        <h3 className="text-sm sm:text-base font-bold text-white">
                            Import from Zotero Library
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Collection Selector */}
                    {collections.length > 0 && (
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 shrink-0">
                                <FolderKanban className="w-4 h-4 text-indigo-400" />
                                <span>Collection:</span>
                            </label>
                            <select
                                value={selectedCollection}
                                onChange={(e) => setSelectedCollection(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-indigo-500"
                            >
                                {collections.map(col => (
                                    <option key={col.key} value={col.key}>
                                        {col.name} ({col.numItems} items)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Items List */}
                    {loadingItems ? (
                        <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                            <span>Loading bibliographic references...</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-500">
                            No bibliographic items found in this collection.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs text-slate-400 pb-1">
                                <span>Found {items.length} references</span>
                                <span>{selectedCount} selected</span>
                            </div>

                            {items.map(item => {
                                const isSelected = Boolean(selectedItemKeys[item.zoteroKey]);
                                return (
                                    <div
                                        key={item.zoteroKey}
                                        onClick={() => toggleItem(item.zoteroKey)}
                                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-3 ${
                                            isSelected
                                                ? 'bg-indigo-950/20 border-indigo-500/40 text-white'
                                                : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-900'
                                        }`}>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </div>

                                        <div className="space-y-0.5 min-w-0">
                                            <p className="font-semibold text-white truncate">{item.title}</p>
                                            {item.authors && <p className="text-[11px] text-slate-400 truncate">{item.authors}</p>}
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                {item.publicationTitle && <span>{item.publicationTitle}</span>}
                                                {item.year && <span>({item.year})</span>}
                                                {item.doi && <span className="font-mono">DOI: {item.doi}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="bg-slate-900 border-slate-800 text-slate-300 text-xs h-9"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleImportSubmit}
                        disabled={importing || selectedCount === 0}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-9 px-4"
                    >
                        {importing ? "Importing..." : `Import ${selectedCount} References`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
