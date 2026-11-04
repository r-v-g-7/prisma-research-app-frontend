import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar = ({ onSubmitted }) => {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        if (onSubmitted) onSubmitted();
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search discussions, papers, labs, or scholars..."
                className="w-full h-9 pl-9 pr-16 bg-[#F8FAFC] hover:bg-slate-100/70 focus:bg-white border border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 rounded-lg text-sm text-[#172033] placeholder:text-[#64748B] outline-none transition-colors"
            />
            {query.trim() && (
                <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 px-2 bg-white hover:bg-[#EEF2FF] text-[#4F46E5] border border-[#E2E8F0] text-xs font-medium rounded transition-colors"
                >
                    Search
                </button>
            )}
        </form>
    );
};

export default SearchBar;
