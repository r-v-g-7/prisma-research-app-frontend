import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, DOIs, researchers..."
                className="w-full pl-9 pr-14 py-1.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none transition"
            />
            <button
                type="submit"
                className="absolute right-1 top-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium rounded-md shadow-2xs transition"
            >
                Search
            </button>
        </form>
    );
};

export default SearchBar;
