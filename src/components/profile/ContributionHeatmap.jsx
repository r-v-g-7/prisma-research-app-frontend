import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Layers, 
  FlaskConical, 
  Scale, 
  CheckCircle2, 
  Bookmark 
} from "lucide-react";

export default function ContributionHeatmap({ heatmapData, userName }) {
    const [hoveredDay, setHoveredDay] = useState(null);

    const dailyMap = heatmapData?.dailyMap || {};
    const typeBreakdown = heatmapData?.typeBreakdown || {};
    const totalContributions = heatmapData?.totalContributions || 0;

    // Generate 52 weeks (364 days) leading up to today
    const { calendarWeeks, monthLabels } = useMemo(() => {
        const weeks = [];
        const today = new Date();
        // Set to end of day
        today.setHours(23, 59, 59, 999);

        // Calculate days to fill exactly 52 weeks (364 days)
        const totalDays = 52 * 7;
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (totalDays - 1));

        let currentDay = new Date(startDate);
        let currentWeek = [];
        const months = [];
        let lastMonth = -1;

        for (let i = 0; i < totalDays; i++) {
            const dateStr = currentDay.toISOString().split("T")[0];
            const count = dailyMap[dateStr] || 0;
            const dayOfWeek = currentDay.getDay(); // 0 is Sun, 1 is Mon...
            const month = currentDay.getMonth();

            // Track month label at the start of a new month
            if (month !== lastMonth && currentWeek.length === 0) {
                months.push({
                    name: currentDay.toLocaleString("default", { month: "short" }),
                    weekIndex: weeks.length
                });
                lastMonth = month;
            }

            currentWeek.push({
                dateStr,
                date: new Date(currentDay),
                count,
                dayOfWeek
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentDay.setDate(currentDay.getDate() + 1);
        }

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return { calendarWeeks: weeks, monthLabels: months };
    }, [dailyMap]);

    const getIntensityClass = (count) => {
        if (!count || count === 0) return "bg-slate-100 border border-slate-200/70";
        if (count === 1) return "bg-emerald-200 border border-emerald-300";
        if (count <= 3) return "bg-emerald-400 border border-emerald-500";
        if (count <= 5) return "bg-emerald-600 border border-emerald-700";
        return "bg-emerald-800 border border-emerald-900";
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
            {/* Header / Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        Research Contributions & Activity
                    </h3>
                </div>
                <div className="text-xs font-semibold text-slate-700">
                    <span className="text-emerald-700 font-bold">{totalContributions} contributions</span> in the last year
                </div>
            </div>

            {/* Heatmap Grid Viewport */}
            <div className="overflow-x-auto pb-2 scrollbar-thin">
                <div className="min-w-[680px]">
                    {/* Month Labels */}
                    <div className="flex text-[10px] font-mono text-slate-400 mb-1 pl-6 gap-[28px]">
                        {["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((m, idx) => (
                            <span key={idx} className="w-6 text-center">{m}</span>
                        ))}
                    </div>

                    <div className="flex gap-1.5 items-start">
                        {/* Day of Week Labels (Mon, Wed, Fri) */}
                        <div className="flex flex-col justify-between text-[9px] font-mono text-slate-400 h-[88px] pr-1 select-none">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>

                        {/* 52 Columns Grid */}
                        <div className="flex gap-1">
                            {calendarWeeks.map((week, wIdx) => (
                                <div key={wIdx} className="flex flex-col gap-1">
                                    {week.map((day) => (
                                        <div
                                            key={day.dateStr}
                                            onMouseEnter={() => setHoveredDay(day)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            className={`w-2.5 h-2.5 rounded-[2px] transition duration-100 cursor-pointer ${getIntensityClass(day.count)}`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Legend & Tooltip feedback */}
                    <div className="flex items-center justify-between pt-3 text-[11px] text-slate-500">
                        <div className="h-4 flex items-center">
                            {hoveredDay ? (
                                <span className="font-medium text-slate-800">
                                    <strong>{hoveredDay.count} contribution{hoveredDay.count === 1 ? "" : "s"}</strong> on {hoveredDay.date.toLocaleDateString(undefined, { dateStyle: "medium" })}
                                </span>
                            ) : (
                                <span className="text-slate-400 text-[10px]">Hover over any cell to inspect daily research activity</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <span>Less</span>
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 border border-slate-200" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 border border-emerald-300" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-500" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 border border-emerald-700" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800 border border-emerald-900" />
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contribution Breakdown by Activity Type */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Discussions</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 mt-1">
                        {typeBreakdown["post_created"] || 0}
                    </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                        <span>Peer Comments</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 mt-1">
                        {(typeBreakdown["comment_created"] || 0) + (typeBreakdown["comment_replied"] || 0)}
                    </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        <span>Research Labs</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 mt-1">
                        {(typeBreakdown["workspace_created"] || 0) + (typeBreakdown["workspace_joined"] || 0)}
                    </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Evidence & Decisions</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 mt-1">
                        {(typeBreakdown["evidence_added"] || 0) + (typeBreakdown["decision_logged"] || 0) + (typeBreakdown["task_completed"] || 0)}
                    </p>
                </div>
            </div>
        </div>
    );
}
