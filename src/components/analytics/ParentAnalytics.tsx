import React, { useEffect, useRef, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { 
  ArrowLeft, ArrowRight, BarChart3, Download, FileQuestion,
  Info, TrendingUp, XCircle 
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

// Types for jspdf-autotable
interface AutoTableStyles {
  fontSize?: number;
  cellPadding?: number;
  lineColor?: number[];
  lineWidth?: number;
  fontStyle?: string;
  fillColor?: number[];
  textColor?: number | number[];
  halign?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  fillStyle?: 'F' | 'FD' | 'DF';
  minCellWidth?: number;
  minCellHeight?: number;
}

interface AutoTableColumnStyles {
  [key: string]: Partial<AutoTableStyles>;
}

interface AutoTableOptions {
  startY?: number;
  margin?: { left: number; right: number };
  head?: string[][];
  body?: string[][];
  foot?: string[][];
  styles?: AutoTableStyles;
  headStyles?: AutoTableStyles;
  bodyStyles?: AutoTableStyles;
  footStyles?: AutoTableStyles;
  columnStyles?: AutoTableColumnStyles;
  theme?: 'striped' | 'grid' | 'plain';
}

// Extend jsPDF type declaration
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Types for child, academic record, chart data
interface ChildSummary { id: string; name: string; }
interface AcademicRecord {
  id: string;
  subject: string;
  grade: string;
  year: string;
  teacher: string;
  school: string;
  notes: string;
  examType: string;
  score: number | null;
  createdAt: string;
}
interface PerformanceChartRow {
  month: string;
  [subject: string]: string | number | undefined;
}
interface SubjectComparisonRow {
  subject: string;
  childScore: number | null;
  cityAvg: number | null;
  stateAvg: number | null;
}

// Chart data helpers (move above component to avoid TDZ)
const getScore = (record: AcademicRecord): number | null => {
  if (typeof record.score === 'number') return record.score;
  if (typeof record.grade === 'string') {
    const g = record.grade.trim().toUpperCase();
    if (g.endsWith('%')) return parseFloat(g);
    if (g.startsWith('A+')) return 95;
    if (g.startsWith('A')) return 90;
    if (g.startsWith('B+')) return 85;
    if (g.startsWith('B')) return 80;
    if (g.startsWith('C+')) return 75;
    if (g.startsWith('C')) return 70;
    if (g.startsWith('D')) return 65;
  }
  return null;
};
const getMonthsForRange = (range: string): { year: string; month: string; label: string }[] => {
  const now = new Date();
  let count = 6;
  if (range === '1year') count = 12;
  if (range === '2years') count = 24;
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear().toString(),
      month: (d.getMonth() + 1).toString().padStart(2, '0'),
      label: d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear(),
    });
  }
  return months;
};
const generatePerformanceData = (records: AcademicRecord[], timeRange: string, subjects: string[]): PerformanceChartRow[] => {
  const months = getMonthsForRange(timeRange);
  return months.map(month => {
    const monthRecords = records.filter(r => r.year === month.year);
    const entry: PerformanceChartRow = { month: month.label };
    subjects.forEach(subject => {
      const subjectRecords = monthRecords.filter(r => r.subject === subject);
      if (subjectRecords.length > 0) {
        const avg = subjectRecords.reduce((sum, r) => sum + (getScore(r) ?? 0), 0) / subjectRecords.length;
        entry[subject] = Math.round(avg);
      }
    });
    return entry;
  });
};
const generateSubjectComparison = (records: AcademicRecord[], subjects: string[]): SubjectComparisonRow[] => {
  return subjects.map(subject => {
    const subjectRecords = records.filter(r => r.subject === subject);
    const avg = subjectRecords.length > 0 ? subjectRecords.reduce((sum, r) => sum + (getScore(r) ?? 0), 0) / subjectRecords.length : null;
    return {
      subject,
      childScore: avg ? Math.round(avg) : null,
      cityAvg: null,
      stateAvg: null,
    };
  });
};

interface ParentAnalyticsProps {
  parentId: string;
}

const ParentAnalytics: React.FC<ParentAnalyticsProps> = ({ parentId }) => {
  const { toast } = useToast();
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceChartRow[]>([]);
  const [subjectComparison, setSubjectComparison] = useState<SubjectComparisonRow[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [errorChildren, setErrorChildren] = useState<string|null>(null);
  const [errorRecords, setErrorRecords] = useState<string|null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch children on mount
  useEffect(() => {
    (async () => {
      setIsLoadingChildren(true);
      setErrorChildren(null);
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/child');
        const normalized: ChildSummary[] = (res.data || []).map((c: { _id?: string; id?: string; name: string }) => ({ id: c._id || c.id || '', name: c.name }));
        setChildren(normalized);
        if (normalized.length > 0) setSelectedChild(normalized[0].id);
      } catch (error) {
        setErrorChildren(error && typeof error === 'object' && 'response' in error && (error as { response?: { data?: { message?: string } } }).response?.data?.message ? (error as { response: { data: { message: string } } }).response.data.message : 'Failed to load children.');
      } finally {
        setIsLoadingChildren(false);
      }
    })();
  }, []);

  // Fetch academic records when selectedChild or timeRange changes
  useEffect(() => {
    if (!selectedChild) return;
    (async () => {
      setIsLoadingRecords(true);
      setErrorRecords(null);
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get(`/record?childId=${selectedChild}&type=academic`);
        // Normalize records
        const normalized: AcademicRecord[] = (res.data || []).map((r: { [key: string]: unknown; data?: { [key: string]: unknown } }) => {
          const data = (r["data"] ?? {}) as Record<string, unknown>;
          return {
            id: (r["_id"] as string) || (r["id"] as string) || '',
            subject: (r["subject"] as string) ?? (data["subject"] as string) ?? '',
            grade: (r["grade"] as string) ?? (data["grade"] as string) ?? '',
            year: (r["year"] as string) ?? (data["year"] as string) ?? '',
            teacher: (r["teacher"] as string) ?? (data["teacher"] as string) ?? '',
            school: (r["school"] as string) ?? (data["school"] as string) ?? '',
            notes: (r["notes"] as string) ?? (data["notes"] as string) ?? '',
            examType: (r["examType"] as string) ?? (data["examType"] as string) ?? '',
            score: typeof r["score"] === 'number' ? (r["score"] as number) : typeof data["score"] === 'number' ? (data["score"] as number) : null,
            createdAt: (r["createdAt"] as string) ?? '',
          };
        });
        setRecords(normalized);
        // Extract unique subjects
        const uniqueSubjects = Array.from(new Set(normalized.map(r => r.subject).filter((s): s is string => !!s)));
        setSubjects(uniqueSubjects);
        // Transform for charts
        setPerformanceData(generatePerformanceData(normalized, timeRange, uniqueSubjects));
        setSubjectComparison(generateSubjectComparison(normalized, uniqueSubjects));
      } catch (error) {
        setErrorRecords(error && typeof error === 'object' && 'response' in error && (error as { response?: { data?: { message?: string } } }).response?.data?.message ? (error as { response: { data: { message: string } } }).response.data.message : 'Failed to load academic records.');
        setRecords([]);
        setSubjects([]);
        setPerformanceData([]);
        setSubjectComparison([]);
      } finally {
        setIsLoadingRecords(false);
      }
    })();
  }, [selectedChild, timeRange]);

  // Child navigation
  const handlePreviousChild = () => {
    const currentIndex = children.findIndex(child => child.id === selectedChild);
    if (currentIndex > 0) {
      setSelectedChild(children[currentIndex - 1].id);
    }
  };
  const handleNextChild = () => {
    const currentIndex = children.findIndex(child => child.id === selectedChild);
    if (currentIndex < children.length - 1) {
      setSelectedChild(children[currentIndex + 1].id);
    }
  };
  const currentChild = children.find(child => child.id === selectedChild);
  const currentIndex = children.findIndex(child => child.id === selectedChild);

  // Filtered chart data
  const filteredPerformanceData = selectedSubject === 'all' ? performanceData : performanceData.map(row => ({ month: row.month, [selectedSubject]: row[selectedSubject] }));
  const filteredSubjectComparison = selectedSubject === 'all' ? subjectComparison : subjectComparison.filter(s => s.subject === selectedSubject);  // PDF Download Handler
  const handleDownloadReport = async () => {
    try {
      // Create new jsPDF instance
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      // Verify that autoTable is available
      if (typeof pdf.autoTable !== 'function') {
        throw new Error('PDF AutoTable plugin is not properly initialized');
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      let yOffset = margin;

      // Add report title
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text('Academic Performance Report', margin, yOffset);

      // Add child information
      yOffset += 30;
      pdf.setFontSize(14);
      pdf.setTextColor(75, 85, 99); // Gray color
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (currentChild?.name) {
        pdf.text(`Student: ${currentChild.name}`, margin, yOffset);
        yOffset += 20;
      }
      
      pdf.text(`Report Generated: ${currentDate}`, margin, yOffset);
      yOffset += 20;
      pdf.text(`Time Range: ${timeRange === '6months' ? 'Last 6 Months' : timeRange === '1year' ? 'Last 1 Year' : 'Last 2 Years'}`, margin, yOffset);

      // Add performance summary
      yOffset += 40;
      pdf.setFontSize(18);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Performance Summary', margin, yOffset);

      // Create performance table
      yOffset += 30;
      const performanceTable = filteredSubjectComparison.map(row => [
        row.subject,
        row.childScore?.toString() || 'N/A',
        row.cityAvg?.toString() || 'N/A',
        row.stateAvg?.toString() || 'N/A'
      ]);

      // Add the table using autoTable
      try {
        pdf.autoTable({
          startY: yOffset,
          head: [['Subject', 'Student Score', 'City Average', 'State Average']],
          body: performanceTable,
          theme: 'grid',
          styles: {
            fontSize: 12,
            cellPadding: 8,
            lineColor: [229, 231, 235],
            lineWidth: 1,
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          margin: { left: margin, right: margin },
        });
      } catch (tableError) {
        console.error('Error creating table:', tableError);
        throw new Error('Failed to generate performance table');
      }

      // Add performance trend chart
      yOffset = pdf.lastAutoTable.finalY + 40;
      pdf.setFontSize(18);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Performance Trends', margin, yOffset);      try {
        // Find the chart element
        const performanceChart = document.querySelector('.recharts-wrapper');
        if (!performanceChart) {
          throw new Error('Chart element not found');
        }

        // Wait for any animations to complete and ensure chart is fully rendered
        await new Promise(resolve => setTimeout(resolve, 500));

        // Convert chart to canvas with better settings
        const canvas = await html2canvas(performanceChart as HTMLElement, { 
          scale: 2,
          backgroundColor: '#FFFFFF',
          logging: false,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
          removeContainer: true,
          imageTimeout: 0,
        });

        // Validate the canvas
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error('Chart capture failed: Invalid canvas');
        }

        // Convert to image
        const chartImg = canvas.toDataURL('image/png', 1.0);
        if (!chartImg || chartImg === 'data:,') {
          throw new Error('Chart capture failed: Invalid image data');
        }

        // Calculate dimensions while maintaining aspect ratio
        yOffset += 30;
        const chartWidth = pageWidth - (margin * 2);
        const chartHeight = Math.min(
          (canvas.height * chartWidth) / canvas.width,
          pageHeight - yOffset - margin // Ensure it fits on the page
        );

        // Add chart to PDF
        pdf.addImage(chartImg, 'PNG', margin, yOffset, chartWidth, chartHeight);
      } catch (chartError) {        console.error('Failed to add chart to PDF:', chartError);
        // Add a note instead of the chart
        pdf.setFontSize(12);
        pdf.setTextColor(75, 85, 99);
        pdf.text('(Performance chart could not be included - Please try again)', margin, yOffset + 30);
        
        toast({
          variant: "warning",
          title: "Notice",
          description: "Chart could not be included in the PDF"
        });
      }

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(156, 163, 175);
      pdf.text('© Kidolio Education Analytics', margin, pageHeight - margin);
      const pageStr = '1 of 1';
      pdf.text(pageStr, pageWidth - margin - pdf.getTextWidth(pageStr), pageHeight - margin);      try {
        // Validate PDF content
        if (pdf.internal.pages.length === 0) {
          throw new Error('PDF generation failed: No pages created');
        }

        // Save the PDF with safe filename
        const safeChildName = currentChild?.name?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'student';
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${safeChildName}-academic-report-${timestamp}.pdf`;
        
        pdf.save(filename);
          toast({
          variant: "default",
          title: "Success",
          description: "PDF report has been generated and downloaded",
        });
      } catch (saveError) {
        console.error('Error saving PDF:', saveError);
        throw new Error('Failed to save PDF. Please ensure you have enough disk space and try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to generate PDF report. ";
      if (error instanceof Error) {
        if (error.message.includes('disk space')) {
          errorMessage += "Please check your available disk space and try again.";
        } else if (error.message.includes('chart')) {
          errorMessage += "There was an issue capturing the chart. Please try again in a few moments.";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Please try again.";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  // Define chart colors and gradients
  const chartColors = {
    default: '#3b82f6',
    subjects: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
    background: {
      light: 'rgba(255, 255, 255, 0.9)',
      dark: 'rgba(31, 41, 55, 0.9)'
    }
  };

  const renderLoadingState = () => (
    <div className="text-center py-12">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-blue-600 animate-pulse">Loading academic records...</p>
    </div>
  );

  const renderErrorState = (error: string) => (
    <div className="text-center py-12 text-red-600 space-y-2">
      <XCircle className="w-12 h-12 mx-auto text-red-500" />
      <p>{error}</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12 text-gray-600 space-y-2">
      <FileQuestion className="w-12 h-12 mx-auto text-gray-400" />
      <p>No academic records found for this child.</p>
    </div>
  );

  const renderPerformanceChart = () => (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredPerformanceData}>
            <defs>
              {subjects.map((subject, idx) => (
                <linearGradient key={subject} id={`color-${subject}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.subjects[idx % 5]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColors.subjects[idx % 5]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280' }} 
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              domain={[60, 100]} 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />            <Tooltip 
              cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '12px'
              }}
              itemStyle={{
                color: '#fff',
                fontSize: '14px',
                padding: '4px 0'
              }}
              labelStyle={{
                color: '#9CA3AF',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            {selectedSubject === 'all'
              ? subjects.map((subject, idx) => (
                  <Line 
                    key={subject} 
                    type="monotone" 
                    dataKey={subject} 
                    stroke={chartColors.subjects[idx % 5]} 
                    strokeWidth={3}
                    dot={{ r: 6, strokeWidth: 3 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    fill={`url(#color-${subject})`}
                  />
                ))
              : <Line 
                  type="monotone" 
                  dataKey={selectedSubject} 
                  stroke={chartColors.default} 
                  strokeWidth={3}
                  dot={{ r: 6, strokeWidth: 3 }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  fill="url(#color-selectedSubject)"
                />
            }
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderComparisonChart = () => (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={filteredSubjectComparison}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="subject" 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              domain={[60, 100]} 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              contentStyle={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '12px'
              }}
              itemStyle={{
                color: '#fff',
                fontSize: '14px',
                padding: '4px 0'
              }}
              labelStyle={{
                color: '#9CA3AF',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{
                padding: '20px 0'
              }}
            />
            <Bar 
              dataKey="childScore" 
              fill="url(#barGradient)" 
              name={`${currentChild?.name}'s Score`}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Loading and error states
  if (isLoadingChildren) return <div className="text-center py-12 text-blue-600">Loading children...</div>;
  if (errorChildren) return <div className="text-center py-12 text-red-600">{errorChildren}</div>;
  if (children.length === 0) return <div className="text-center py-12 text-gray-600">No children found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-700 ease-in-out relative overflow-hidden">
      {/* Animated Background Elements */}
      {/* Removed the fixed background gradient for a cleaner mobile look */}
      {/* <div className="fixed inset-0 pointer-events-none"> ... </div> */}

      <div className="relative min-h-screen p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-6 w-full px-0 sm:px-2">
          {/* Analytics Content */}
          <div ref={reportRef} className="printable-report space-y-6">
            {/* Header Card */}
            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Analytics Dashboard</span>
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {currentChild?.name}
                      </h2>
                    </div>
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={handlePreviousChild}
                      disabled={currentIndex === 0}
                      className="w-full sm:w-auto flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 min-w-0 text-sm sm:text-base py-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden xs:hidden sm:inline">Previous Child</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextChild}
                      disabled={currentIndex === children.length - 1}
                      className="w-full sm:w-auto flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 min-w-0 text-sm sm:text-base py-2"
                    >
                      <span className="hidden xs:hidden sm:inline">Next Child</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 mt-4 sm:mt-6">
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                    <label className="text-xs sm:text-sm font-medium mb-2 block text-gray-600 dark:text-gray-300">Child</label>
                    <Select value={selectedChild} onValueChange={setSelectedChild}>
                      <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-0 shadow-sm text-xs sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map(child => (
                          <SelectItem key={child.id} value={child.id} className="text-xs sm:text-base">
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                    <label className="text-xs sm:text-sm font-medium mb-2 block text-gray-600 dark:text-gray-300">Time Range</label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-0 shadow-sm text-xs sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months" className="text-xs sm:text-base">Last 6 Months</SelectItem>
                        <SelectItem value="1year" className="text-xs sm:text-base">Last 1 Year</SelectItem>
                        <SelectItem value="2years" className="text-xs sm:text-base">Last 2 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                    <label className="text-xs sm:text-sm font-medium mb-2 block text-gray-600 dark:text-gray-300">Subject</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 border-0 shadow-sm text-xs sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs sm:text-base">All Subjects</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject} className="text-xs sm:text-base">{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <Tabs defaultValue="performance" className="w-full mt-2 sm:mt-0">
              <TabsList className="flex w-full bg-white/70 dark:bg-gray-800/70 rounded-2xl p-1 backdrop-blur-sm gap-2">
                <TabsTrigger value="performance" className="flex-1 text-xs sm:text-base py-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
                  Performance Trends
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex-1 text-xs sm:text-base py-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
                  Subject Comparison
                </TabsTrigger>
              </TabsList>
              <TabsContent value="performance" className="space-y-4 mt-4 sm:mt-6">
                <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Academic Performance Over Time
                      <UITooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p><strong>X-axis:</strong> Time period (months)</p>
                            <p><strong>Y-axis:</strong> Academic scores (0-100)</p>
                            <p>Compare your child's performance with city and state averages</p>
                          </div>
                        </TooltipContent>
                      </UITooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRecords ? renderLoadingState()
                      : errorRecords ? renderErrorState(errorRecords)
                      : filteredPerformanceData.length === 0 ? renderEmptyState()
                      : renderPerformanceChart()
                    }
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="comparison" className="space-y-4 mt-4 sm:mt-6">
                <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Subject-wise Performance Comparison
                      <UITooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p><strong>X-axis:</strong> Academic subjects</p>
                            <p><strong>Y-axis:</strong> Performance scores (0-100)</p>
                            <p>Compare your child's performance across subjects with regional averages</p>
                          </div>
                        </TooltipContent>
                      </UITooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRecords ? renderLoadingState()
                      : errorRecords ? renderErrorState(errorRecords)
                      : filteredSubjectComparison.length === 0 ? renderEmptyState()
                      : renderComparisonChart()
                    }
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

         
        </div>
      </div>

      {/* Detailed Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detailed Analytics Report</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="absolute right-2 top-2">Close</Button>
            </DialogClose>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] p-2">
            {/* Reuse the analytics content for the modal */}
            <div>
              {/* Header */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-blue-500" />
                      Analytics Dashboard - {currentChild?.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePreviousChild}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous Child
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextChild}
                        disabled={currentIndex === children.length - 1}
                        className="flex items-center gap-2"
                      >
                        Next Child
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Child</label>
                      <Select value={selectedChild} onValueChange={setSelectedChild}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {children.map(child => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Time Range</label>
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6months">Last 6 Months</SelectItem>
                          <SelectItem value="1year">Last 1 Year</SelectItem>
                          <SelectItem value="2years">Last 2 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject</label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subjects</SelectItem>
                          {subjects.map(subject => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="performance">Performance Trends</TabsTrigger>
                  <TabsTrigger value="comparison">Subject Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-4">
                  <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Academic Performance Over Time
                        <UITooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p><strong>X-axis:</strong> Time period (months)</p>
                              <p><strong>Y-axis:</strong> Academic scores (0-100)</p>
                              <p>Compare your child's performance with city and state averages</p>
                            </div>
                          </TooltipContent>
                        </UITooltip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingRecords ? (
                        <div className="text-center py-12 text-blue-600">Loading academic records...</div>
                      ) : errorRecords ? (
                        <div className="text-center py-12 text-red-600">{errorRecords}</div>
                      ) : filteredPerformanceData.length === 0 ? (
                        <div className="text-center py-12 text-gray-600">No academic records found for this child.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={filteredPerformanceData}>
                            <defs>
                              {subjects.map((subject, idx) => (
                                <linearGradient key={subject} id={`color-${subject}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={chartColors.subjects[idx % 5]} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={chartColors.subjects[idx % 5]} stopOpacity={0}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fill: '#6b7280' }} 
                              axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis 
                              domain={[60, 100]} 
                              tick={{ fill: '#6b7280' }}
                              axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(8px)'
                              }} 
                            />
                            <Legend 
                              wrapperStyle={{
                                paddingTop: '20px'
                              }}
                            />
                            {selectedSubject === 'all'
                              ? subjects.map((subject, idx) => (
                                  <Line 
                                    key={subject} 
                                    type="monotone" 
                                    dataKey={subject} 
                                    stroke={chartColors.subjects[idx % 5]} 
                                    strokeWidth={3}
                                    dot={{ r: 6, strokeWidth: 3 }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                    fill={`url(#color-${subject})`}
                                  />
                                ))
                              : <Line 
                                  type="monotone" 
                                  dataKey={selectedSubject} 
                                  stroke={chartColors.default} 
                                  strokeWidth={3}
                                  dot={{ r: 6, strokeWidth: 3 }}
                                  activeDot={{ r: 8, strokeWidth: 0 }}
                                  fill="url(#color-selectedSubject)"
                                />
                            }
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                  <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Subject-wise Performance Comparison
                        <UITooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p><strong>X-axis:</strong> Academic subjects</p>
                              <p><strong>Y-axis:</strong> Performance scores (0-100)</p>
                              <p>Compare your child's performance across subjects with regional averages</p>
                            </div>
                          </TooltipContent>
                        </UITooltip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingRecords ? (
                        <div className="text-center py-12 text-blue-600">Loading academic records...</div>
                      ) : errorRecords ? (
                        <div className="text-center py-12 text-red-600">{errorRecords}</div>
                      ) : filteredSubjectComparison.length === 0 ? (
                        <div className="text-center py-12 text-gray-600">No academic records found for this child.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={filteredSubjectComparison}>
                            <defs>
                              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.8}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="subject" 
                              tick={{ fill: '#6b7280' }}
                              axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis 
                              domain={[60, 100]} 
                              tick={{ fill: '#6b7280' }}
                              axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip 
                              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                              contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff',
                                padding: '12px'
                              }}
                              itemStyle={{
                                color: '#fff',
                                fontSize: '14px',
                                padding: '4px 0'
                              }}
                              labelStyle={{
                                color: '#9CA3AF',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginBottom: '8px'
                              }}
                            />
                            <Legend 
                              wrapperStyle={{
                                padding: '20px 0'
                              }}
                            />
                            <Bar 
                              dataKey="childScore" 
                              fill="url(#barGradient)" 
                              name={`${currentChild?.name}'s Score`}
                              radius={[4, 4, 0, 0]}
                              animationDuration={1500}
                              animationEasing="ease-out"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentAnalytics;
