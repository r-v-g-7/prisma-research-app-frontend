import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getZoteroCollections, getZoteroItems } from "@/services/integrations";
import { importZoteroToWorkspace } from "@/services/discovery";
import { Button } from "@/components/ui/button";
import {
    Library,
    FolderKanban,
    Check,
    X,
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
                .then((res) => {
                    const list = res.data || [];
                    setCollections(list);
                    if (list.length > 0) {
                        setSelectedCollection(list[0].key);
                    } else {
                        loadItems("");
                    }
                })
                .catch((err) => {
                    setError(
                        err.message || "Could not fetch Zotero collections. Connect Zotero in Integrations first."
                    );
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
            const initialMap = {};
            itemList.forEach((item) => {
                initialMap[item.zoteroKey] = true;
            });
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
        setSelectedItemKeys((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleImportSubmit = async () => {
        const selectedItems = items.filter((item) => selectedItemKeys[item.zoteroKey]);
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
        <div className="fixed inset-0 !mt-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                    <div className="flex items-center gap-2">
                        <Library className="w-4 h-4 text-[#4F46E5]" />
                        <h3 className="text-base font-semibold text-[#172033]">
                            Import from Zotero Library
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[#DC2626] text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {collections.length > 0 && (
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-medium text-[#172033] flex items-center gap-1.5 shrink-0">
                                <FolderKanban className="w-4 h-4 text-[#4F46E5]" />
                                <span>Collection</span>
                            </label>
                            <select
                                value={selectedCollection}
                                onChange={(e) => setSelectedCollection(e.target.value)}
                                className="h-9 bg-white border border-[#E2E8F0] text-sm text-[#172033] rounded-lg px-3 flex-1 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                            >
                                {collections.map((col) => (
                                    <option key={col.key} value={col.key}>
                                        {col.name} ({col.numItems} items)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {loadingCollections || loadingItems ? (
                        <div className="py-12 text-center text-sm text-[#64748B] flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5]" />
                            <span>Loading bibliographic references...</span>
                        </div>
                    ) : error && items.length === 0 ? (
                        <div className="py-10 text-center space-y-2.5">
                            <p className="text-sm text-[#64748B]">
                                Connect your Zotero User ID and API Key to browse and sync collections directly into this lab.
                            </p>
                            <Link
                                to="/settings"
                                onClick={onClose}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline"
                            >
                                <span>Configure Zotero in Integrations →</span>
                            </Link>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-12 text-center text-sm text-[#64748B]">
                            No bibliographic items found in this collection.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs text-[#64748B] pb-1">
                                <span>Found {items.length} references</span>
                                <span className="font-medium text-[#172033]">{selectedCount} selected</span>
                            </div>

                            {items.map((item) => {
                                const isSelected = Boolean(selectedItemKeys[item.zoteroKey]);
                                return (
                                    <div
                                        key={item.zoteroKey}
                                        onClick={() => toggleItem(item.zoteroKey)}
                                        className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-start gap-3 ${
                                            isSelected
                                                ? "bg-[#EEF2FF]/70 border-indigo-200 text-[#172033]"
                                                : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-slate-300"
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                                                isSelected
                                                    ? "bg-[#4F46E5] border-[#4F46E5] text-white"
                                                    : "border-slate-300 bg-white"
                                            }`}
                                        >
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </div>

                                        <div className="space-y-0.5 min-w-0">
                                            <p className="font-semibold text-[#172033] truncate">{item.title}</p>
                                            {item.authors && (
                                                <p className="text-xs text-[#64748B] truncate">{item.authors}</p>
                                            )}
                                            <div className="flex items-center gap-2 text-[11px] text-[#64748B] flex-wrap">
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
                <div className="px-5 py-3.5 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5 bg-[#F8FAFC]">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImportSubmit}
                        disabled={importing || selectedCount === 0}
                    >
                        {importing ? "Importing..." : `Import ${selectedCount} References`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
