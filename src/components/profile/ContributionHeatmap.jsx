import React, { useState, useMemo } from "react";
import {
    Calendar,
    FileText,
    MessageSquare,
    Layers,
    FlaskConical
} from "lucide-react";

export default function ContributionHeatmap({ heatmapData }) {
    const [hoveredDay, setHoveredDay] = useState(null);

    const dailyMap = heatmapData?.dailyMap || {};
    const typeBreakdown = heatmapData?.typeBreakdown || {};
    const totalContributions = heatmapData?.totalContributions || 0;

    const { calendarWeeks } = useMemo(() => {
        const weeks = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const totalDays = 52 * 7;
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (totalDays - 1));

        let currentDay = new Date(startDate);
        let currentWeek = [];

        for (let i = 0; i < totalDays; i++) {
            const dateStr = currentDay.toISOString().split("T")[0];
            const count = dailyMap[dateStr] || 0;
            const dayOfWeek = currentDay.getDay();

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

        return { calendarWeeks: weeks };
    }, [dailyMap]);

    const getIntensityClass = (count) => {
        if (!count || count === 0) return "bg-slate-100 border border-[#E2E8F0]";
        if (count === 1) return "bg-emerald-200 border border-emerald-300";
        if (count <= 3) return "bg-emerald-400 border border-emerald-500";
        if (count <= 5) return "bg-emerald-600 border border-emerald-700";
        return "bg-[#15803D] border border-emerald-800";
    };

    return (
        <div className="prism-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#4F46E5]" />
                    <h3 className="text-sm font-semibold text-[#172033]">
                        Research Activity
                    </h3>
                </div>
                <div className="text-xs text-[#64748B]">
                    <span className="text-[#172033] font-semibold">{totalContributions} contributions</span> in the past year
                </div>
            </div>

            <div className="overflow-x-auto pb-1">
                <div className="min-w-[680px]">
                    <div className="flex text-[10px] text-[#64748B] mb-1.5 pl-6 gap-[28px]">
                        {["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((m, idx) => (
                            <span key={idx} className="w-6 text-center">{m}</span>
                        ))}
                    </div>

                    <div className="flex gap-1.5 items-start">
                        <div className="flex flex-col justify-between text-[10px] text-[#64748B] h-[88px] pr-1 select-none">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>

                        <div className="flex gap-1">
                            {calendarWeeks.map((week, wIdx) => (
                                <div key={wIdx} className="flex flex-col gap-1">
                                    {week.map((day) => (
                                        <div
                                            key={day.dateStr}
                                            onMouseEnter={() => setHoveredDay(day)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            className={`w-2.5 h-2.5 rounded-[2px] transition-colors cursor-pointer ${getIntensityClass(day.count)}`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 text-xs text-[#64748B]">
                        <div className="h-4 flex items-center">
                            {hoveredDay ? (
                                <span className="text-[#172033]">
                                    <strong>{hoveredDay.count} contribution{hoveredDay.count === 1 ? "" : "s"}</strong> on {hoveredDay.date.toLocaleDateString(undefined, { dateStyle: "medium" })}
                                </span>
                            ) : (
                                <span className="text-[11px]">Hover over a day to inspect activity</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px]">
                            <span>Less</span>
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 border border-[#E2E8F0]" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 border border-emerald-300" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-500" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 border border-emerald-700" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#15803D] border border-emerald-800" />
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
                        <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span>Discussions</span>
                    </div>
                    <p className="text-base font-semibold text-[#172033] mt-1">
                        {typeBreakdown["post_created"] || 0}
                    </p>
                </div>

                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
                        <MessageSquare className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span>Peer Comments</span>
                    </div>
                    <p className="text-base font-semibold text-[#172033] mt-1">
                        {(typeBreakdown["comment_created"] || 0) + (typeBreakdown["comment_replied"] || 0)}
                    </p>
                </div>

                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
                        <Layers className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span>Research Labs</span>
                    </div>
                    <p className="text-base font-semibold text-[#172033] mt-1">
                        {(typeBreakdown["workspace_created"] || 0) + (typeBreakdown["workspace_joined"] || 0)}
                    </p>
                </div>

                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5 text-[#64748B] text-xs">
                        <FlaskConical className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span>Lab Artifacts</span>
                    </div>
                    <p className="text-base font-semibold text-[#172033] mt-1">
                        {(typeBreakdown["evidence_added"] || 0) + (typeBreakdown["decision_logged"] || 0) + (typeBreakdown["task_completed"] || 0)}
                    </p>
                </div>
            </div>
        </div>
    );
}
