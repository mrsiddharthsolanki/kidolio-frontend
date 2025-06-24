import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Heart, Book, Award, Activity, FileText } from 'lucide-react';
import HealthRecords from '@/components/records/HealthRecords';
import AcademicRecords from '@/components/records/AcademicRecords';
import Achievements from '@/components/records/Achievements';
import Extracurricular from '@/components/records/Extracurricular';
import DocumentManager from './DocumentManager';
import { useSearchParams } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChildRecordsManagerProps {
  childId: string;
  childName: string;
}

const ChildRecordsManager: React.FC<ChildRecordsManagerProps> = ({ childId, childName }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('recordTab') || 'health');

  // Advanced tab routing for records tabs
  React.useEffect(() => {
    const tab = searchParams.get('recordTab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab && activeTab !== 'health') {
      setActiveTab('health');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  React.useEffect(() => {
    if (activeTab && activeTab !== searchParams.get('recordTab')) {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), recordTab: activeTab }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  return (    
    <div className="min-h-screen space-y-6 p-1 sm:p-6">
      <style>{`
        @keyframes rotateRight {
          from { transform: rotate(0deg); } to { transform: rotate(360deg); }
        }
        @keyframes rotateLeft {
          from { transform: rotate(360deg); } to { transform: rotate(0deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.3; filter: blur(20px); }
          50% { opacity: 0.6; filter: blur(25px); }
          100% { opacity: 0.3; filter: blur(20px); }
        }
        .animate-corner-gradient-right { animation: rotateRight 12s linear infinite, pulse 4s ease-in-out infinite; }
        .animate-corner-gradient-left { animation: rotateLeft 12s linear infinite, pulse 4s ease-in-out infinite; }
        .tab-content-bg::before {
          content: '';
          position: absolute;
          inset: -50%;
          border-radius: 100%;
          background: radial-gradient(circle, var(--gradient-start) 0%, transparent 70%);
          opacity: 0.15;
        }
      `}</style>
      <Card className="relative overflow-hidden border-0 shadow-2xl group hover:shadow-3xl transition-all duration-700">
        <div className="absolute inset-0 transition-all duration-500 pointer-events-none">
          {/* Health gradients */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'health' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-rose-500/30 to-red-600/30 rounded-full -mr-[200px] -mt-[200px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tl from-red-600/30 to-rose-500/30 rounded-full -ml-[200px] -mb-[200px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-600/5" />
          </div>
          
          {/* Academic gradients */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'academic' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full -mr-[200px] -mt-[200px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tl from-indigo-600/30 to-blue-500/30 rounded-full -ml-[200px] -mb-[200px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5" />
          </div>
          
          {/* Achievements gradients */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'achievements' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full -mr-[200px] -mt-[200px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tl from-orange-600/30 to-amber-500/30 rounded-full -ml-[200px] -mb-[200px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5" />
          </div>
          
          {/* Extracurricular gradients */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'extracurricular' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-500/30 to-green-600/30 rounded-full -mr-[200px] -mt-[200px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tl from-green-600/30 to-emerald-500/30 rounded-full -ml-[200px] -mb-[200px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5" />
          </div>
          
          {/* Documents gradients */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'documents' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-full -mr-[200px] -mt-[200px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tl from-pink-600/30 to-purple-500/30 rounded-full -ml-[200px] -mb-[200px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5" />
          </div>
        </div>
        <CardHeader className="relative backdrop-blur-sm px-2 py-4 sm:px-6 sm:py-6">
          <CardTitle className="text-center text-base sm:text-2xl font-bold text-white break-words">
           {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Records Management for {childName}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="relative overflow-hidden border-0 shadow-2xl w-full max-w-none"
      >
        <div className="absolute inset-0 transition-all duration-500 pointer-events-none">
          {/* Health gradients */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'health' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-rose-500/30 to-red-600/30 rounded-full -mr-[400px] -mt-[400px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tl from-red-600/30 to-rose-500/30 rounded-full -ml-[400px] -mb-[400px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-600/5" />
          </div>
          
          {/* Academic gradients */}
           {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5" /> */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'academic' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full -mr-[400px] -mt-[400px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tl from-indigo-600/30 to-blue-500/30 rounded-full -ml-[400px] -mb-[400px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5" />
          </div>
          
          
          {/* Achievements gradients */}
           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5" />
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'achievements' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full -mr-[400px] -mt-[400px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tl from-orange-600/30 to-amber-500/30 rounded-full -ml-[400px] -mb-[400px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5" />
          </div>
          
          {/* Extracurricular gradients */}
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5" />
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'extracurricular' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/30 to-green-600/30 rounded-full -mr-[400px] -mt-[400px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tl from-green-600/30 to-emerald-500/30 rounded-full -ml-[400px] -mb-[400px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5" />
          </div>
          
          {/* Documents gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5" />
          <div className={`absolute inset-0 transition-opacity duration-500 ${activeTab === 'documents' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-full -mr-[400px] -mt-[400px] animate-corner-gradient-right" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tl from-pink-600/30 to-purple-500/30 rounded-full -ml-[400px] -mb-[400px] animate-corner-gradient-left" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5" />
          </div>
        </div>
        <CardContent className="p-0 sm:p-6 relative backdrop-blur-sm w-full max-w-none">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="w-full overflow-x-auto pb-2">
              <TabsList className="flex w-max min-w-full gap-1 sm:gap-2 rounded-xl bg-muted/20 p-1 backdrop-blur-sm mb-3 sm:mb-8">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="health" 
                      className="group relative overflow-hidden rounded-xl min-w-[48px] h-12 sm:w-[180px] flex flex-col items-center justify-center
                        bg-gradient-to-br from-rose-500/80 to-red-600/80 data-[state=active]:ring-2 data-[state=active]:ring-rose-500/60
                        text-white transition-all duration-500"
                    >
                      <div className="flex items-center justify-center gap-2 w-full h-full">
                        <Heart className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline font-medium">Health</span>
                      </div>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="sm:hidden">Health</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="academic" 
                      className="group relative overflow-hidden rounded-xl min-w-[48px] h-12 sm:w-[180px] flex flex-col items-center justify-center
                        bg-gradient-to-br from-blue-500/80 to-indigo-600/80 data-[state=active]:ring-2 data-[state=active]:ring-blue-500/60
                        text-white transition-all duration-500"
                    >
                      <div className="flex items-center justify-center gap-2 w-full h-full">
                        <Book className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline font-medium">Academic</span>
                      </div>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="sm:hidden">Academic</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="achievements" 
                      className="group relative overflow-hidden rounded-xl min-w-[48px] h-12 sm:w-[180px] flex flex-col items-center justify-center
                        bg-gradient-to-br from-amber-500/80 to-orange-600/80 data-[state=active]:ring-2 data-[state=active]:ring-amber-500/60
                        text-white transition-all duration-500"
                    >
                      <div className="flex items-center justify-center gap-2 w-full h-full">
                        <Award className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline font-medium">Achievements</span>
                      </div>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="sm:hidden">Achievements</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="extracurricular" 
                      className="group relative overflow-hidden rounded-xl min-w-[48px] h-12 sm:w-[180px] flex flex-col items-center justify-center
                        bg-gradient-to-br from-emerald-500/80 to-green-600/80 data-[state=active]:ring-2 data-[state=active]:ring-emerald-500/60
                        text-white transition-all duration-500"
                    >
                      <div className="flex items-center justify-center gap-2 w-full h-full">
                        <Activity className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline font-medium">Extracurricular</span>
                      </div>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="sm:hidden">Extracurricular</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="documents" 
                      className="group relative overflow-hidden rounded-xl min-w-[48px] h-12 sm:w-[180px] flex flex-col items-center justify-center
                        bg-gradient-to-br from-purple-500/80 to-pink-600/80 data-[state=active]:ring-2 data-[state=active]:ring-purple-500/60
                        text-white transition-all duration-500"
                    >
                      <div className="flex items-center justify-center gap-2 w-full h-full">
                        <FileText className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline font-medium">Documents</span>
                      </div>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="sm:hidden">Documents</TooltipContent>
                </Tooltip>
              </TabsList>
            </div>
            <div className="relative w-full max-w-none rounded-none sm:rounded-xl sm:max-w-3xl sm:mx-auto p-0 sm:p-6">
              <TabsContent 
                value="health" 
                className="mt-0 relative overflow-hidden rounded-none sm:rounded-xl transition-all duration-300"
                style={{ "--gradient-start": "rgb(244 63 94)" } as React.CSSProperties}
              >
                <div className="relative z-10">
                  <HealthRecords childId={childId} />
                </div>
              </TabsContent>
              <TabsContent 
                value="academic" 
                className="mt-0 relative overflow-hidden rounded-none sm:rounded-xl transition-all duration-300"
                style={{ "--gradient-start": "rgb(59 130 246)" } as React.CSSProperties}
              >
                <div className="relative z-10">
                  <AcademicRecords childId={childId} />
                </div>
              </TabsContent>
              <TabsContent 
                value="achievements" 
                className="mt-0 relative overflow-hidden rounded-none sm:rounded-xl transition-all duration-300"
                style={{ "--gradient-start": "rgb(245 158 11)" } as React.CSSProperties}
              >
                <div className="relative z-10">
                  <Achievements childId={childId} />
                </div>
              </TabsContent>
              <TabsContent 
                value="extracurricular" 
                className="mt-0 relative overflow-hidden rounded-none sm:rounded-xl transition-all duration-300"
                style={{ "--gradient-start": "rgb(16 185 129)" } as React.CSSProperties}
              >
                <div className="relative z-10">
                  <Extracurricular childId={childId} />
                </div>
              </TabsContent>
              <TabsContent 
                value="documents" 
                className="mt-0 relative overflow-hidden rounded-none sm:rounded-xl transition-all duration-300"
                style={{ "--gradient-start": "rgb(168 85 247)" } as React.CSSProperties}
              >
                <div className="relative z-10">
                  <DocumentManager childId={childId} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildRecordsManager;
