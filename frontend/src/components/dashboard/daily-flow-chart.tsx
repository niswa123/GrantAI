"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const MOCK_DATA = [
  { date: "Mon", value: 1200 },
  { date: "Tue", value: 2500 },
  { date: "Wed", value: 3100 },
  { date: "Thu", value: 4800 },
  { date: "Fri", value: 6200 },
  { date: "Sat", value: 6500 },
  { date: "Sun", value: 8430 },
];

export function DailyFlowChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="w-full h-[300px] md:h-[400px] bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 relative overflow-hidden"
    >
      <div className="mb-6 flex justify-between items-center relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Daily R&D Value Flow</h3>
          <p className="text-sm text-slate-400">Cumulative value generation over time</p>
        </div>
      </div>

      <div className="absolute inset-0 z-0 bg-gradient-to-t from-cyan-900/10 to-transparent pointer-events-none" />

      <div className="w-full h-[calc(100%-4rem)] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(val) => `€${val}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl shadow-xl backdrop-blur-sm">
                      <p className="text-slate-400 text-sm mb-1">{label}</p>
                      <p className="text-cyan-400 font-bold text-lg">
                        €{payload[0].value?.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#06b6d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
