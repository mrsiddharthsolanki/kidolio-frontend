// import { useState, useEffect } from "react";
// import { Settings } from 'lucide-react';

// export type ClockProps = {
//   className?: string;
//   format?: "12" | "24";
//   showSeconds?: boolean;
//   showDate?: boolean;
//   showTimezone?: boolean;
//   timezone?: string;
//   theme?: "dark" | "light";
//   size?: "sm" | "md" | "lg";
// };

// function Clock({
//   className = "",
//   format = "12",
//   showSeconds = true,
//   showDate = true,
//   showTimezone = false,
//   timezone = "local",
//   theme = "dark",
//   size = "md",
// }: ClockProps) {
//   const [time, setTime] = useState(new Date());
//   const [showSettings, setShowSettings] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const formatTime = (date: Date) => {
//     const options: Intl.DateTimeFormatOptions = {
//       hour: "2-digit",
//       minute: "2-digit",
//       ...(showSeconds && { second: "2-digit" }),
//       hour12: format === "12",
//       ...(timezone !== "local" && { timeZone: timezone }),
//     };
    
//     return new Intl.DateTimeFormat("en-US", options).format(date);
//   };

//   const formatDate = (date: Date) => {
//     const options: Intl.DateTimeFormatOptions = {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       ...(timezone !== "local" && { timeZone: timezone }),
//     };
    
//     return new Intl.DateTimeFormat("en-US", options).format(date);
//   };

//   const getTimezone = () => {
//     if (timezone === "local") {
//       return Intl.DateTimeFormat().resolvedOptions().timeZone;
//     }
//     return timezone;
//   };

//   const sizeClasses = {
//     sm: "text-lg",
//     md: "text-3xl",
//     lg: "text-5xl"
//   };

//   const containerClasses = {
//     sm: "p-4",
//     md: "p-6",
//     lg: "p-8"
//   };

//   const themeClasses = theme === "dark" 
//     ? "bg-slate-900 text-white border-slate-700" 
//     : "bg-white text-slate-900 border-slate-300";

//   return (
//     <div className={relative ${containerClasses[size]} ${themeClasses} rounded-lg border shadow-lg ${className}}>
//       {/* Settings Button */}
//       <button
//         onClick={() => setShowSettings(!showSettings)}
//         className={`absolute top-2 right-2 p-2 rounded-md opacity-60 hover:opacity-100 transition-opacity ${
//           theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100"
//         }}
//       >
//         <Settings className="h-4 w-4" />
//       </button>

//       {/* Main Clock Display */}
//       <div className="text-center">
//         <div className="flex items-center justify-center gap-2 mb-2">
//           <Clock className="h-6 w-6" />
//           <span className="text-sm font-medium opacity-80">
//             {format === "12" ? "12 Hour" : "24 Hour"} Format
//           </span>
//         </div>
        
//         <div className={font-mono font-bold ${sizeClasses[size]} mb-2}>
//           {formatTime(time)}
//         </div>
        
//         {showDate && (
//         //   <div className="text-sm opacity-80 mb-2">
//             {formatDate(time)}
//           </div>
//         )}
        
//         {showTimezone && (
//           <div className="text-xs opacity-60">
//             {getTimezone()}
//           </div>
//         )}
//       </div>

//       {/* Analog Clock Visual */}
//       <div className="mt-4 flex justify-center">
//         <div className="relative">
//           <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
//             {/* Clock face */}
//             <circle
//               cx="60"
//               cy="60"
//               r="58"
//               fill="none"
//               stroke={theme === "dark" ? "#475569" : "#e2e8f0"}
//               strokeWidth="2"
//             />
            
//             {/* Hour markers */}
//             {[...Array(12)].map((_, i) => {
//               const angle = (i * 30) * Math.PI / 180;
//               const x1 = 60 + 45 * Math.cos(angle);
//               const y1 = 60 + 45 * Math.sin(angle);
//               const x2 = 60 + 50 * Math.cos(angle);
//               const y2 = 60 + 50 * Math.sin(angle);
              
//               return (
//                 <line
//                   key={i}
//                   x1={x1}
//                   y1={y1}
//                   x2={x2}
//                   y2={y2}
//                   stroke={theme === "dark" ? "#94a3b8" : "#64748b"}
//                   strokeWidth="2"
//                 />
//               );
//             })}
            
//             {/* Hour hand */}
//             <line
//               x1="60"
//               y1="60"
//               x2={60 + 25 * Math.cos(((time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90) * Math.PI / 180)}
//               y2={60 + 25 * Math.sin(((time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90) * Math.PI / 180)}
//               stroke={theme === "dark" ? "#f1f5f9" : "#1e293b"}
//               strokeWidth="4"
//               strokeLinecap="round"
//             />
            
//             {/* Minute hand */}
//             <line
//               x1="60"
//               y1="60"
//               x2={60 + 35 * Math.cos((time.getMinutes() * 6 - 90) * Math.PI / 180)}
//               y2={60 + 35 * Math.sin((time.getMinutes() * 6 - 90) * Math.PI / 180)}
//               stroke={theme === "dark" ? "#f1f5f9" : "#1e293b"}
//               strokeWidth="3"
//               strokeLinecap="round"
//             />
            
//             {/* Second hand */}
//             {showSeconds && (
//               <line
//                 x1="60"
//                 y1="60"
//                 x2={60 + 40 * Math.cos((time.getSeconds() * 6 - 90) * Math.PI / 180)}
//                 y2={60 + 40 * Math.sin((time.getSeconds() * 6 - 90) * Math.PI / 180)}
//                 stroke="#ef4444"
//                 strokeWidth="1"
//                 strokeLinecap="round"
//               />
//             )}
            
//             {/* Center dot */}
//             <circle cx="60" cy="60" r="3" fill={theme === "dark" ? "#f1f5f9" : "#1e293b"} />
//           </svg>
//         </div>
//       </div>

//       {/* Settings Panel */}
//       {showSettings && (
//         <div className={absolute top-12 right-0 ${themeClasses} border rounded-lg p-4 shadow-lg z-10 min-w-48}>
//           <h3 className="font-semibold mb-3">Clock Settings</h3>
          
//           <div className="space-y-3 text-sm">
//             <div className="flex items-center justify-between">
//               <span>12/24 Hour</span>
//               <select 
//                 value={format}
//                 className={`px-2 py-1 rounded border ${
//                   theme === "dark" ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"
//                 }`}
//               >
//                 <option value="12">12 Hour</option>
//                 <option value="24">24 Hour</option>
//               </select>
//             </div>
            
//             <div className="flex items-center justify-between">
//               <span>Show Seconds</span>
//               <input 
//                 type="checkbox" 
//                 checked={showSeconds}
//                 className="w-4 h-4"
//               />
//             </div>
            
//             <div className="flex items-center justify-between">
//               <span>Show Date</span>
//               <input 
//                 type="checkbox" 
//                 checked={showDate}
//                 className="w-4 h-4"
//               />
//             </div>
            
//             <div className="flex items-center justify-between">
//               <span>Theme</span>
//               <select 
//                 value={theme}
//                 className={`px-2 py-1 rounded border ${
//                   theme === "dark" ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"
//                 }`}
//               >
//                 <option value="dark">Dark</option>
//                 <option value="light">Light</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// Clock.displayName = "Clock";

// export { Clock };