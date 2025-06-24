import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Info, ChevronLeft, ChevronRight, Loader2, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  fetchLeaderboardData, 
  LeaderboardStudent, 
  LeaderboardFilters, 
  LeaderboardError,
  LeaderboardPagination,
  SubjectScore
} from '@/lib/leaderboardApi';
import { countries } from '@/data/locations';

const DEFAULT_PAGINATION: LeaderboardPagination = {
  total: 0,
  page: 1,
  totalPages: 0,
  hasMore: false
};

// Helper to get all cities from locations.ts
const getCitiesFromCountries = () => {
  try {
    const states = countries?.[0]?.states || {};
    const cities = [];
    for (const state of Object.keys(states)) {
      const districts = states[state].districts || {};
      for (const district of Object.keys(districts)) {
        cities.push(...districts[district]);
      }
    }
    return cities;
  } catch (error) {
    console.error('Error loading cities:', error);
    return [];
  }
};

interface StudentSubjectsProps {
  subjects: SubjectScore[];
}

const StudentSubjects: React.FC<StudentSubjectsProps> = React.memo(({ subjects }) => {
  if (!Array.isArray(subjects) || subjects.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {subjects.map(subj => {
        if (!subj?.name) return null;
        return (
          <Tooltip key={subj.name}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl 
                  bg-gradient-to-r from-amber-100 to-orange-100 
                  dark:from-amber-900/30 dark:to-orange-900/30 
                  hover:from-amber-200 hover:to-orange-200 
                  dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 
                  border border-amber-200/50 dark:border-amber-700/30
                  shadow-sm hover:shadow-md
                  transform hover:scale-105
                  transition-all duration-300"
                aria-label={`${subj.name}: ${subj.score?.toFixed(1) ?? '0.0'}%, ${subj.testCount} tests`}
              >
                <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  {subj.name}: {subj.score?.toFixed(1) ?? '0.0'}%
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
              <p className="text-sm">{subj.testCount} tests in {subj.name}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
});

StudentSubjects.displayName = 'StudentSubjects';

interface StudentCardProps {
  student: LeaderboardStudent;
  getRankBadge: (rank: number) => React.ReactNode;
  getGradeColor: (grade: string) => string;
}

const StudentCard: React.FC<StudentCardProps> = React.memo(({ student, getRankBadge, getGradeColor }) => {
  // Ensure student data is valid
  if (!student?.id || !student?.name) return null;

  const rankDisplay = getRankBadge(student.rank || 0);
  const gradeClass = getGradeColor(student.grade);
  const scoreDisplay = typeof student.score === 'number' ? student.score.toFixed(1) : '0.0';
  const testCount = student.totalTests || 0;

  return (
    <div
      className={`group relative overflow-hidden p-4 rounded-2xl border transition-all duration-500 transform hover:scale-[1.02] hover:shadow-lg ${
        student.outOfRange
          ? 'border-amber-400/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-orange-600/30 dark:from-orange-900/30 dark:to-amber-900/30'
          : 'border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'
      }`}
      role="article"
      aria-label={`${student.name}'s academic performance`}
    >
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 shadow-sm group-hover:shadow-md transition-all duration-300"
            aria-label={`Rank ${student.rank || 'unranked'}`}
          >
            <span className="text-lg font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {rankDisplay}
            </span>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{student.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {student.city || 'No city'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-gray-900 dark:text-white">
              {scoreDisplay}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {testCount} {testCount === 1 ? 'test' : 'tests'}
            </div>
          </div>
          <Badge className={`${gradeClass} text-white shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-110`}>
            {student.grade || 'N/A'}
          </Badge>
          {student.outOfRange && (
            <div className="relative z-50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button" 
                    className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                    aria-label={`View rank details - Percentile: ${student.percentile ?? 0}%, Overall Rank: ${student.rank || 'unranked'}`}
                  >
                    <Info className="h-4 w-4 text-white" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="left" 
                  align="center" 
                  className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 shadow-xl p-3 z-[60] rounded-xl"
                  sideOffset={5}
                >
                  <div className="text-sm space-y-2 min-w-[200px]">
                    
                    <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-800 pb-2">
                      <span className="text-amber-700 dark:text-amber-300">Overall Rank:</span>
                      <span className="font-medium">#{student.rank || 'unranked'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-amber-700 dark:text-amber-300">Total Score:</span>
                      <span className="font-medium">{scoreDisplay}%</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
      <StudentSubjects subjects={student.subjects || []} />
    </div>
  );
});

StudentCard.displayName = 'StudentCard';

// Helper type for pagination
type PaginationItem = number | 'ellipsis';

const usePagination = (currentPage: number, totalPages: number): PaginationItem[] => {
  return useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: PaginationItem[] = [1];
    
    if (currentPage > 3) {
      pages.push('ellipsis');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(currentPage + 1, totalPages - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);
};

const ChildLeaderboard: React.FC = () => {
  const { toast } = useToast();
  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardStudent[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [pagination, setPagination] = useState<LeaderboardPagination>(DEFAULT_PAGINATION);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Safe state update function
  const safeSetState = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    if (mountedRef.current) {
      setter(value);
    }
  }, []);

  // Memoize cities to avoid recalculation
  const CITIES = useMemo(() => getCitiesFromCountries(), []);

  // Function to get rank badge
  const getRankBadge = useCallback((rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" aria-hidden="true" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" aria-hidden="true" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" aria-hidden="true" />;
    return rank;
  }, []);
  // Function to get grade color
  const getGradeColor = useCallback((grade: string = '') => {
    switch (grade.toUpperCase()) {
      case 'A+': return 'bg-green-500';
      case 'A': return 'bg-green-400';
      case 'A-': return 'bg-green-300';
      case 'B+': return 'bg-blue-400';
      case 'B': return 'bg-blue-300';
      default: return 'bg-gray-400';
    }
  }, []);
  // Helper function to handle errors consistently
  const handleError = useCallback((error: unknown) => {
    let errorMessage = 'Failed to fetch leaderboard data';
    
    if (error instanceof LeaderboardError) {
      switch (error.code) {
        case 'TIMEOUT':
          errorMessage = 'Request timed out. Please try again.';
          break;
        case 'NETWORK_ERROR':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'UNAUTHORIZED':
          errorMessage = 'Please log in to view the leaderboard.';
          break;
        case 'NO_RECORDS':
          errorMessage = 'No academic records found. Add some test scores to see the leaderboard.';
          break;
        case 'VALIDATION_ERROR':
          errorMessage = 'Invalid data format. Please try again.';
          break;
        default:
          errorMessage = error.message || 'Error loading leaderboard data';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    safeSetState(setError, errorMessage);
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    });
    
    // Reset data on error
    safeSetState(setLeaderboardData, []);
    safeSetState(setPagination, DEFAULT_PAGINATION);
  }, [toast, safeSetState]);

  // Fetch initial data and available subjects
  useEffect(() => {
    const initializeLeaderboard = async () => {
      try {      safeSetState(setLoading, true);
      safeSetState(setError, null);
      
      const response = await fetchLeaderboardData({ 
        page: 1, 
        limit: itemsPerPage 
      });

      if (!mountedRef.current) return;

      // Always update subjects list, even if empty
      safeSetState(setAvailableSubjects, response?.subjects || []);

      if (response?.data) {
        safeSetState(setLeaderboardData, response.data);
        safeSetState(setPagination, response.pagination || DEFAULT_PAGINATION);
      }

      // Reset subject filter if current subject is not in the list
      if (subjectFilter !== 'all' && !response?.subjects?.includes(subjectFilter)) {
        safeSetState(setSubjectFilter, 'all');
      }
      } catch (error) {
        if (!mountedRef.current) return;
        console.error('Error initializing leaderboard:', error);
        handleError(error);
      } finally {
        if (mountedRef.current) {
          safeSetState(setLoading, false);
        }
      }
    };

    void initializeLeaderboard();
  }, [safeSetState, itemsPerPage, handleError, subjectFilter]);

  const fetchData = useCallback(async () => {
    try {
      safeSetState(setLoading, true);
      safeSetState(setError, null);

      const filters: LeaderboardFilters = {
        page: currentPage,
        limit: itemsPerPage,
        subject: subjectFilter === 'all' ? undefined : subjectFilter,
        city: cityFilter === 'all' ? undefined : cityFilter
      };

      const response = await fetchLeaderboardData(filters);
      
      if (!mountedRef.current) return;

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      safeSetState(setLeaderboardData, response.data);
      safeSetState(setPagination, response.pagination || DEFAULT_PAGINATION);
      safeSetState(setAvailableSubjects, response.subjects || []);
    } catch (error) {
      if (!mountedRef.current) return;      let errorMessage = 'Failed to fetch leaderboard data';
      
      if (error instanceof LeaderboardError) {
        switch (error.code) {
          case 'TIMEOUT':
            errorMessage = 'Request timed out. Please try again.';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'UNAUTHORIZED':
            errorMessage = 'Please log in to view the leaderboard.';
            break;
          case 'NO_RECORDS':
            errorMessage = 'No academic records found. Please add some test scores first.';
            break;
          default:
            errorMessage = error.message || 'Error loading leaderboard data';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      safeSetState(setError, errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Reset data on error
      safeSetState(setLeaderboardData, []);
      safeSetState(setPagination, DEFAULT_PAGINATION);
    } finally {
      safeSetState(setLoading, false);
    }
  }, [currentPage, subjectFilter, cityFilter, toast, itemsPerPage, safeSetState]);

  useEffect(() => {
    mountedRef.current = true;
    void fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  }, [pagination.totalPages]);

  const handleSubjectChange = useCallback((value: string) => {
    setSubjectFilter(value);
    setCurrentPage(1);
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setCityFilter(value);
    setCurrentPage(1);
  }, []);

  const paginationPages = usePagination(currentPage, pagination.totalPages);

  return (
    <TooltipProvider>
      <div className="relative">
        <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800">
          <CardHeader className="relative">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                  <Trophy className="w-8 h-8 text-white" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl opacity-30 blur group-hover:opacity-40 transition-all duration-300"></div>
                </div>
              </div>
              
              <CardTitle className="text-3xl font-black bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Academic Leaderboard
              </CardTitle>
              
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <div className="flex gap-4 flex-wrap justify-center">
                  <div className="relative">
                    <Select 
                      value={subjectFilter} 
                      onValueChange={handleSubjectChange}
                      aria-label="Filter by subject"
                    >
                      <SelectTrigger className="w-[200px] bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <SelectValue placeholder="Select Subject" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 rounded-lg shadow-xl z-50">
                        <SelectItem value="all" className="hover:bg-amber-50 dark:hover:bg-amber-900/20">All Subjects</SelectItem>
                        {availableSubjects.map(subject => (
                          <SelectItem 
                            key={subject} 
                            value={subject}
                            className="hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          >
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <Select 
                      value={cityFilter} 
                      onValueChange={handleCityChange}
                      aria-label="Filter by city"
                    >
                      <SelectTrigger className="w-[200px] bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 21C16.4183 21 20 17.4183 20 13C20 10.9361 19.0741 9.0939 17.5835 7.84856C16.9491 7.31062 16 6.34717 16 5.5C16 4.11929 14.8807 3 13.5 3H10.5C9.11929 3 8 4.11929 8 5.5C8 6.34717 7.05093 7.31062 6.41652 7.84856C4.92589 9.0939 4 10.9361 4 13C4 17.4183 7.58172 21 12 21Z" />
                          </svg>
                          <SelectValue placeholder="Select City" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 rounded-lg shadow-xl z-50">
                        <SelectItem value="all" className="hover:bg-amber-50 dark:hover:bg-amber-900/20">All Cities</SelectItem>
                        {CITIES.map(city => (
                          <SelectItem 
                            key={city} 
                            value={city}
                            className="hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          >
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4" role="status" aria-label="Loading">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse"></div>
                  <Loader2 className="absolute inset-0 h-16 w-16 text-white animate-spin" />
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400 animate-pulse">Loading leaderboard data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4" role="alert">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <Info className="h-8 w-8 text-white" />
                </div>
                <p className="text-center text-gray-600 dark:text-gray-400 max-w-md">
                  {error}
                </p>
                {error.includes('No academic records') && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md text-center">
                    Add test scores in your child's academic records to see them on the leaderboard.
                  </p>
                )}
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4" role="status">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center opacity-50">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  No students found for the selected criteria
                </p>
                {subjectFilter !== 'all' && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Try selecting a different subject or viewing all subjects
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {leaderboardData.map(student => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      getRankBadge={getRankBadge}
                      getGradeColor={getGradeColor}
                    />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-2">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              handlePageChange(currentPage - 1);
                            }
                          }}
                          aria-disabled={currentPage === 1}
                          aria-label="Previous page"
                          className={cn(
                            "hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors",
                            currentPage === 1 && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>
                      
                      {paginationPages.map((page, index) => (
                        <React.Fragment key={index}>
                          {page === 'ellipsis' ? (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page as number);
                                }}
                                isActive={page === currentPage}
                                aria-label={`Page ${page}`}
                                aria-current={page === currentPage ? 'page' : undefined}
                                className={cn(
                                  "hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors",
                                  page === currentPage && "bg-amber-200 dark:bg-amber-800/50"
                                )}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )}
                        </React.Fragment>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < pagination.totalPages) {
                              handlePageChange(currentPage + 1);
                            }
                          }}
                          aria-disabled={currentPage >= pagination.totalPages}
                          aria-label="Next page"
                          className={cn(
                            "hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors",
                            currentPage >= pagination.totalPages && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default ChildLeaderboard;
