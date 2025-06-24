import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, MapPin, Users, Heart, GraduationCap } from 'lucide-react';
import { countries, educationLevels, incomeRanges } from '@/data/locations';
import { useRegistrationTrends } from '@/lib/useRegistrationTrends';
import { Tooltip as ReactTooltip } from '@/components/ui/tooltip.tsx';

// COLORS for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

// Interface for registration trends data
interface RegistrationTrend {
  date: string;
  [key: string]: number | string;  // Allow dynamic state names as properties
}

// Define a type for stats
interface Stats {
  totalChildren: number;
  totalParents: number;
  citiesCovered: number;
  stateMap: Record<string, { childCount: number; parentCount: number; cities?: Record<string, number> }>;
  topStates: Array<{ state: string; childCount: number; parentCount: number }>;

  ageMap: Record<string, Record<string, number>>;
  eduMap: Record<string, Record<string, number>>;
  incomeMap: Record<string, Record<string, number>>;
  disabilityMap: Record<string, number>;
  stateDisabilityMap: Record<string, { withDisability: number; total: number }>;

}

const StatsView: React.FC = () => {
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('year');
  const [state, setState] = useState('all');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  // Separate state for Disability Data section dropdown
  const [selectedDisabilityStates, setSelectedDisabilityStates] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleDisabilityStateChange = (stateName: string) => {
    setSelectedDisabilityStates(prev =>
      prev.includes(stateName)
        ? prev.filter(s => s !== stateName)
        : [...prev, stateName]
    );
  };
  const handleDisabilitySelectAll = () => setSelectedDisabilityStates([]);
  const handleDropdownToggle = () => setDropdownOpen((open) => !open);
  const handleDropdownBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDropdownOpen(false);
  };

  // Get all states from locations.ts
  const allStates = Object.keys(countries[0].states);

  useEffect(() => {
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 'https://kidolio.onrender.com';
    // Always add /api if not present at the end of API_URL
    const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
    fetch(`${baseUrl}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  // Registration Trends by state
  const { data: registrationTrends, loading: loadingTrends } = useRegistrationTrends(selectedDisabilityStates);

  if (loading) return <div className="text-center py-10">Loading statistics...</div>;
  if (!stats) return <div className="text-center py-10 text-red-500">Failed to load stats.</div>;

  // Prepare dropdown options
  const stateOptions = [
    <SelectItem key="all" value="all">All States</SelectItem>,
    ...allStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
  ];

  // Filtered data for selected state
  const selectedState = state === 'all' ? null : state;
  const stateMap = stats.stateMap || {};
  const topStates = stats.topStates || [];
  const ageMap = stats.ageMap || {};
  const eduMap = stats.eduMap || {};
  const incomeMap = stats.incomeMap || {};

  // Chart data for location tab
  const cityData = Object.entries(stateMap[selectedState || allStates[0]]?.cities || {})
    .map(([name, count]) => ({ name, count }));
  // Show all states, not just topStates
  const filteredStates = selectedDisabilityStates.length > 0 ? selectedDisabilityStates : allStates;
  const filteredStateData = filteredStates.map(stateName => ({
    name: stateName,
    count: stateMap[stateName]?.childCount || 0
  }));

  // Chart data for demographics
  const ageData = Object.entries(ageMap[selectedState || topStates[0]?.state || allStates[0]] || {})
    .map(([name, count]) => ({ name, count }));

  // Chart data for education/income
  const educationData = educationLevels.map(level => ({
    name: level,
    count: (eduMap[selectedState || topStates[0]?.state || allStates[0]] || {})[level] || 0
  }));
  const incomeData = incomeRanges.map(range => ({
    name: range,
    count: (incomeMap[selectedState || topStates[0]?.state || allStates[0]] || {})[range] || 0
  }));

  // Chart data for disability
  const disabilityData = stats.disabilityMap
    ? Object.entries(stats.disabilityMap).map(([name, count]) => ({ name, count }))
    : [];
  const specialNeedsCount = disabilityData.filter(d => d.name !== 'None').reduce((sum, d) => sum + d.count, 0);
  const specialNeedsPercent = stats.totalChildren > 0 ? Math.round((specialNeedsCount / stats.totalChildren) * 100) : 0;

  // For now, use empty arrays for healthData and monthlyRegistrations (static or future dynamic)
  const monthlyRegistrations: { name: string; count: number }[] = [];

  // State-wise disability rate data for pie chart
  const stateDisabilityData = stats.stateDisabilityMap
    ? Object.entries(stats.stateDisabilityMap).map(([state, obj]) => {
        const o = obj as { withDisability: number; total: number };
        return {
          name: state,
          value: o.total > 0 ? Math.round((o.withDisability / o.total) * 100) : 0,
          count: o.withDisability,
          total: o.total
        };
      })
    : [];

  // Filter disability data by selectedDisabilityStates
  const filteredDisabilityData = disabilityData.filter(d => {
    if (selectedDisabilityStates.length === 0) return true;
    // If you want to filter by state, you need state-wise disability data from backend
    // For now, show all if no state filter, or just show if state is in selectedDisabilityStates
    return true;
  });
  // Pie chart: filter stateDisabilityData by selectedDisabilityStates
  const filteredStateDisabilityData = selectedDisabilityStates.length > 0
    ? stateDisabilityData.filter(d => selectedDisabilityStates.includes(d.name))
    : stateDisabilityData;

  // Responsive Bar Chart component
  const responsiveBarChart = (
    data: Array<{ [key: string]: string | number }>,
    dataKey: string,
    nameKey: string,
    color: string,
    tooltipFormatter?: (value: number) => [string, string]
  ) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: window.innerWidth < 640 ? 10 : 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
        <XAxis
          dataKey={nameKey}
          angle={window.innerWidth < 640 ? 0 : -45}
          textAnchor={window.innerWidth < 640 ? 'middle' : 'end'}
          height={window.innerWidth < 640 ? 40 : 60}
          tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
          interval={window.innerWidth < 640 ? 1 : 0}
          tickFormatter={(value) => {
            if (window.innerWidth < 640) {
              return '';  // Hide labels on mobile
            }
            return value;
          }}
        />
        <YAxis 
          tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
          width={window.innerWidth < 640 ? 30 : 40}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.1)' }}
          contentStyle={{
            fontSize: '12px',
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            border: 'none'
          }}
          formatter={tooltipFormatter || ((value: number | string, name: string, props: { payload: { index: number } }) => {
            const originalName = data[props.payload.index]?.[nameKey] || '';
            return [value, originalName];
          })}
        />
        <Bar 
          dataKey={dataKey} 
          fill={color}
          radius={[4, 4, 0, 0]}
          maxBarSize={window.innerWidth < 640 ? 30 : 50}
          label={window.innerWidth < 640 ? {
            position: 'top',
            fill: '#666',
            fontSize: 10,
            formatter: (value) => value
          } : undefined}
        >
          {data.map((entry, index) => (
            <Cell 
              key={index} 
              fill={color}
              fillOpacity={0.8}
              style={{
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                transition: 'fill-opacity 0.2s'
              }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const responsivePieChart = (
    data: Array<{ [key: string]: string | number }>,
    dataKey: string,
    nameKey: string,
    tooltipFormatter?: (value: { [key: string]: string | number }) => React.ReactNode
  ) => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={window.innerWidth < 640 ? 30 : 40}
          outerRadius={window.innerWidth < 640 ? 60 : 80}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
          label={({ name, percent }) => 
            window.innerWidth < 640 ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`
          }
          labelLine={window.innerWidth >= 640}
        >
          {data.map((entry, index) => (
            <Cell 
              key={index} 
              fill={COLORS[index % COLORS.length]}
              style={{
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                transition: 'fill-opacity 0.2s'
              }}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return tooltipFormatter ? tooltipFormatter(payload[0].payload) : (
                <div className="bg-gray-800 text-white p-2 rounded shadow-lg text-xs">
                  <div className="font-medium">{payload[0].name}</div>
                  <div>{payload[0].value}</div>
                </div>
              );
            }
            return null;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-md border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Statistics Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">States</label>
              <div className="relative" ref={dropdownRef} tabIndex={0} onBlur={handleDropdownBlur}>
                <button 
                  type="button" 
                  className="w-full border rounded-lg px-3 py-2.5 text-left bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={handleDropdownToggle}
                >
                  <span className="block truncate">
                    {selectedDisabilityStates.length > 0 
                      ? selectedDisabilityStates.length > 2 
                        ? `${selectedDisabilityStates.slice(0, 2).join(', ')}... +${selectedDisabilityStates.length - 2}`
                        : selectedDisabilityStates.join(', ') 
                      : 'All States'}
                  </span>
                </button>
                <div className={`absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-[60vh] overflow-y-auto ${dropdownOpen ? '' : 'hidden'}`}>
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-2 py-1.5">
                    <div 
                      className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
                      onClick={handleDisabilitySelectAll}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedDisabilityStates.length === 0} 
                        readOnly 
                        className="mr-2 h-4 w-4" 
                      />
                      <span className="text-sm font-medium">All States</span>
                    </div>
                  </div>
                  {allStates.map(stateName => (
                    <div 
                      key={stateName} 
                      className="px-4 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center" 
                      onClick={() => handleDisabilityStateChange(stateName)}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedDisabilityStates.includes(stateName)} 
                        readOnly 
                        className="mr-2 h-4 w-4" 
                      />
                      <span className="text-sm">{stateName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Trend */}
      <Card className="shadow-md border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
            <LineChartIcon className="w-5 h-5 text-blue-600" />
            Registration Trends
          </CardTitle>
        </CardHeader>
        <CardContent >
          <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
          <div className="h-80">
            {loadingTrends ? (
              <div className="text-center py-10">Loading registration trends...</div>
            ) : registrationTrends && registrationTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={registrationTrends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                    tickFormatter={(value) => {
                      // Format date for better display
                      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  {(selectedDisabilityStates.length > 0 
                    ? selectedDisabilityStates 
                    : Object.keys(registrationTrends[0] || {}).filter(k => k !== 'date')
                  ).map((state, idx) => (
                    <Line
                      key={state}
                      type="monotone"
                      dataKey={state}
                      name={state}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                      dot={window.innerWidth >= 640}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10">No registration data available</div>
            )}
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Tabs */}
      <Card className="shadow-md border-0">
        <CardContent className="p-2 sm:p-4">
          <Tabs defaultValue="location">
            <div className="overflow-x-auto -mx-2 px-2">
              <TabsList className="mb-4 w-full min-w-max justify-start space-x-2">
                <TabsTrigger value="location" className="gap-2 whitespace-nowrap py-2 px-3">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Location Data</span>
                </TabsTrigger>
                <TabsTrigger value="demographics" className="gap-2 whitespace-nowrap py-2 px-3">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Demographics</span>
                </TabsTrigger>
                <TabsTrigger value="health" className="gap-2 whitespace-nowrap py-2 px-3">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Disability Data</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="gap-2 whitespace-nowrap py-2 px-3">
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden sm:inline">Education & Income</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="location">
              {/* State Multi-Select Dropdown for Location Data */}
              <div className="mb-4 flex justify-end">
                <div className="relative w-full sm:w-64" ref={dropdownRef} tabIndex={0} onBlur={handleDropdownBlur}>
                  <button 
                    type="button" 
                    className="w-full border rounded-lg px-3 py-2.5 text-left bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleDropdownToggle}
                  >
                    <span className="block truncate">
                      {selectedDisabilityStates.length > 0 
                        ? selectedDisabilityStates.length > 2 
                          ? `${selectedDisabilityStates.slice(0, 2).join(', ')}... +${selectedDisabilityStates.length - 2}`
                          : selectedDisabilityStates.join(', ') 
                        : 'All States'}
                    </span>
                  </button>
                  <div className={`absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-[60vh] overflow-y-auto ${dropdownOpen ? '' : 'hidden'}`}>
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-2 py-1.5">
                      <div 
                        className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
                        onClick={handleDisabilitySelectAll}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedDisabilityStates.length === 0} 
                          readOnly 
                          className="mr-2 h-4 w-4" 
                        />
                        <span className="text-sm font-medium">All States</span>
                      </div>
                    </div>
                    {allStates.map(stateName => (
                      <div 
                        key={stateName} 
                        className="px-4 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center" 
                        onClick={() => handleDisabilityStateChange(stateName)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedDisabilityStates.includes(stateName)} 
                          readOnly 
                          className="mr-2 h-4 w-4" 
                        />
                        <span className="text-sm">{stateName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* State Chart (Children by State) */}
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2 text-center text-sm sm:text-base">Children by State</h3>
                  <div className="h-[250px] sm:h-[300px] md:h-80">
                    {responsiveBarChart(
                      filteredStateData,
                      'count',
                      'name',
                      '#3B82F6',
                      (value) => [`${value} children`, 'State']
                    )}
                  </div>
                </div>

                {/* State Chart (Parents by State) */}
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2 text-center text-sm sm:text-base">Parents by State</h3>
                  <div className="h-[250px] sm:h-[300px] md:h-80">
                    {responsiveBarChart(
                      filteredStates.map(stateName => ({
                        name: stateName,
                        count: stateMap[stateName]?.parentCount || 0
                      })),
                      'count',
                      'name',
                      '#10B981',
                      (value) => [`${value} parents`, 'State']
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="demographics">
              {/* State Multi-Select Dropdown for Demographics */}
              <div className="mb-4 flex justify-end">
                <div className="relative w-full sm:w-64" ref={dropdownRef} tabIndex={0} onBlur={handleDropdownBlur}>
                  <button 
                    type="button" 
                    className="w-full border rounded-lg px-3 py-2.5 text-left bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleDropdownToggle}
                  >
                    <span className="block truncate">
                      {selectedDisabilityStates.length > 0 
                        ? selectedDisabilityStates.length > 2 
                          ? `${selectedDisabilityStates.slice(0, 2).join(', ')}... +${selectedDisabilityStates.length - 2}`
                          : selectedDisabilityStates.join(', ') 
                        : 'All States'}
                    </span>
                  </button>
                  <div className={`absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-[60vh] overflow-y-auto ${dropdownOpen ? '' : 'hidden'}`}>
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-2 py-1.5">
                      <div 
                        className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
                        onClick={handleDisabilitySelectAll}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedDisabilityStates.length === 0} 
                          readOnly 
                          className="mr-2 h-4 w-4" 
                        />
                        <span className="text-sm font-medium">All States</span>
                      </div>
                    </div>
                    {allStates.map(stateName => (
                      <div 
                        key={stateName} 
                        className="px-4 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center" 
                        onClick={() => handleDisabilityStateChange(stateName)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedDisabilityStates.includes(stateName)} 
                          readOnly 
                          className="mr-2 h-4 w-4" 
                        />
                        <span className="text-sm">{stateName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age Distribution */}
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2 text-center text-sm sm:text-base">Age Distribution</h3>
                  <div className="h-[250px] sm:h-[300px] md:h-80">
                    {responsiveBarChart(
                      ageData,
                      'count',
                      'name',
                      '#F59E0B',
                      (value) => [`${value} children`, 'Age Group']
                    )}
                  </div>
                </div>
                
                {/* Region Distribution */}
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2 text-center text-sm sm:text-base">Regional Distribution</h3>
                  <div className="h-[250px] sm:h-[300px] md:h-80">
                    {responsivePieChart(
                      filteredStateData,
                      'count',
                      'name',
                      (data: { name: string; count: number }) => (
                        <div className="bg-gray-800 text-white p-2 rounded shadow-lg text-xs">
                          <div className="font-medium">{data.name}</div>
                          <div>{data.count} children</div>
                          <div>{((data.count / filteredStateData.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}% of total</div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="health">
              {/* State Multi-Select Dropdown for Disability */}
              
              <div className="mb-4 flex justify-end">
                <div className="relative w-full sm:w-64" ref={dropdownRef} tabIndex={0} onBlur={handleDropdownBlur}>
                  <button 
                    type="button" 
                    className="w-full border rounded-lg px-3 py-2.5 text-left bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleDropdownToggle}
                  >
                    <span className="block truncate">
                      {selectedDisabilityStates.length > 0 
                        ? selectedDisabilityStates.length > 2 
                          ? `${selectedDisabilityStates.slice(0, 2).join(', ')}... +${selectedDisabilityStates.length - 2}`
                          : selectedDisabilityStates.join(', ') 
                        : 'All States'}
                    </span>
                  </button>
                  <div className={`absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-[60vh] overflow-y-auto ${dropdownOpen ? '' : 'hidden'}`}>
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-2 py-1.5">
                      <div 
                        className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
                        onClick={handleDisabilitySelectAll}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedDisabilityStates.length === 0} 
                          readOnly 
                          className="mr-2 h-4 w-4" 
                        />
                        <span className="text-sm font-medium">All States</span>
                      </div>
                    </div>
                    {allStates.map(stateName => (
                      <div 
                        key={stateName} 
                        className="px-4 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center" 
                        onClick={() => handleDisabilityStateChange(stateName)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedDisabilityStates.includes(stateName)} 
                          readOnly 
                          className="mr-2 h-4 w-4" 
                        />
                        <span className="text-sm">{stateName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Disability Issues Bar Chart */}
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
                  
                  <h3 className="font-semibold mb-3 text-center">Disability Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredDisabilityData}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="name"
                          tick={false}
                          height={0}
                        />
                        <YAxis 
                          tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                          width={window.innerWidth < 640 ? 30 : 40}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                          contentStyle={{
                            fontSize: '12px',
                            padding: '8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            color: 'white',
                            border: 'none'
                          }}
                          formatter={(value) => [`${value} children`, 'Count']}
                          labelFormatter={(label) => label}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#EF4444"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={window.innerWidth < 640 ? 30 : 50}
                          label={{
                            position: 'top',
                            fill: '#666',
                            fontSize: 10,
                            formatter: (value) => value
                          }}
                        >
                          {filteredDisabilityData.map((entry, index) => (
                            <Cell 
                              key={index} 
                              fill="#EF4444"
                              fillOpacity={0.8}
                              style={{
                                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                                transition: 'fill-opacity 0.2s'
                              }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* State-wise Disability Rate Pie Chart */}
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-3 text-center">State-wise Disability Rate</h3>
                  <div className="h-80 flex flex-col items-center justify-center">
                    {responsivePieChart(filteredStateDisabilityData, 'value', 'name')}
                  </div>
                </div>
              </div>
              {/* Creative summary below charts */}
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-center">
                <div className="bg-blue-900/80 text-white px-4 py-2 rounded shadow">
                  <b>Highest Disability Rate:</b> {filteredStateDisabilityData.length ? filteredStateDisabilityData.reduce((a, b) => (a.value > b.value ? a : b)).name : '-'}
                </div>
                <div className="bg-green-900/80 text-white px-4 py-2 rounded shadow">
                  <b>Lowest Disability Rate:</b> {filteredStateDisabilityData.length ? filteredStateDisabilityData.reduce((a, b) => (a.value < b.value ? a : b)).name : '-'}
                </div>
                <div className="bg-purple-900/80 text-white px-4 py-2 rounded shadow">
                  <b>National Disability Rate:</b> {specialNeedsPercent}%
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="education">
              {/* State Multi-Select Dropdown for Education & Income */}
              <div className="mb-4 flex justify-end">
                <div className="relative w-full sm:w-64" ref={dropdownRef} tabIndex={0} onBlur={handleDropdownBlur}>
                  <button 
                    type="button" 
                    className="w-full border rounded-lg px-3 py-2.5 text-left bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleDropdownToggle}
                  >
                    <span className="block truncate">
                      {selectedDisabilityStates.length > 0 
                        ? selectedDisabilityStates.length > 2 
                          ? `${selectedDisabilityStates.slice(0, 2).join(', ')}... +${selectedDisabilityStates.length - 2}`
                          : selectedDisabilityStates.join(', ') 
                        : 'All States'}
                    </span>
                  </button>
                  <div className={`absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-[60vh] overflow-y-auto ${dropdownOpen ? '' : 'hidden'}`}>
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-2 py-1.5">
                      <div 
                        className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
                        onClick={handleDisabilitySelectAll}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedDisabilityStates.length === 0} 
                          readOnly 
                          className="mr-2 h-4 w-4" 
                        />
                        <span className="text-sm font-medium">All States</span>
                      </div>
                    </div>
                    {allStates.map(stateName => (
                      <div 
                        key={stateName} 
                        className="px-4 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center" 
                        onClick={() => handleDisabilityStateChange(stateName)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedDisabilityStates.includes(stateName)} 
                          readOnly 
                          className="mr-2 h-4 w-4" 
                        />
                        <span className="text-sm">{stateName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Income */}
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-3 text-center">Parent Income Distribution</h3>
                  <div className="h-80">
                    {responsiveBarChart(incomeData, 'count', 'name', '#8B5CF6')}
                  </div>
                </div>
                
                {/* Parent Education */}
                <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-3 text-center">Parent Education Level</h3>
                  <div className="h-80">
                    {responsiveBarChart(educationData, 'count', 'name', '#06B6D4')}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border-0 overflow-hidden relative group">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-800/30 p-2 sm:p-3">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalChildren}</h3>
                <p className="text-xs sm:text-sm text-blue-600/80 dark:text-blue-400/80">Total Children</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 transition-transform duration-1000 transform translate-x-[-200%] group-hover:translate-x-[200%]"></div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 border-0 overflow-hidden relative group">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-800/30 p-2 sm:p-3">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">{stats.totalParents}</h3>
                <p className="text-xs sm:text-sm text-green-600/80 dark:text-green-400/80">Total Parents</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/5 to-green-400/0 transition-transform duration-1000 transform translate-x-[-200%] group-hover:translate-x-[200%]"></div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 dark:from-amber-500/20 dark:to-amber-600/20 border-0 overflow-hidden relative group">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
              <div className="rounded-full bg-amber-100 dark:bg-amber-800/30 p-2 sm:p-3">
                <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.citiesCovered}</h3>
                <p className="text-xs sm:text-sm text-amber-600/80 dark:text-amber-400/80">Cities Covered</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 transition-transform duration-1000 transform translate-x-[-200%] group-hover:translate-x-[200%]"></div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 border-0 overflow-hidden relative group">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
              <div className="rounded-full bg-red-100 dark:bg-red-800/30 p-2 sm:p-3">
                <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-2xl font-bold text-red-700 dark:text-red-300">{specialNeedsCount}</h3>
                <p className="text-xs sm:text-sm text-red-600/80 dark:text-red-400/80">Special Needs</p>
                <p className="text-[10px] sm:text-xs text-red-500/70 dark:text-red-400/70">{specialNeedsPercent}% of total</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/5 to-red-400/0 transition-transform duration-1000 transform translate-x-[-200%] group-hover:translate-x-[200%]"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsView;