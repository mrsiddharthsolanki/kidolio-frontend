import api, { ApiResponse, ApiError } from './api';
import { AxiosError } from 'axios';

export interface LeaderboardFilters {
  subject?: string;
  grade?: string;
  region?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export interface SubjectScore {
  name: string;
  score: number;
  testCount: number;
}

export interface LeaderboardStudent {
  id: string;
  name: string;
  photo?: string;
  region?: string;
  city?: string;
  score: number;
  totalTests: number;
  subjects: SubjectScore[];
  grade: string;
  rank: number;
  percentile: number;
  outOfRange?: boolean;  // For parent's children that are not in top rankings
}

export interface LeaderboardPagination {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface LeaderboardResponse {
  data: LeaderboardStudent[];
  subjects: string[];
  pagination: LeaderboardPagination;
}

export type LeaderboardErrorCode = 
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'INVALID_RESPONSE'
  | 'UNAUTHORIZED'
  | 'NO_RECORDS'
  | 'VALIDATION_ERROR'
  | 'NO_RECORDS'
  | 'VALIDATION_ERROR'
  | 'OPERATION_NOT_SUPPORTED'
  | 'UNKNOWN_ERROR';

export class LeaderboardError extends Error {
  constructor(
    message: string,
    public code: LeaderboardErrorCode,
    public status: number
  ) {
    super(message);
    this.name = 'LeaderboardError';
    // Needed for instanceof to work correctly with TypeScript
    Object.setPrototypeOf(this, LeaderboardError.prototype);
  }
}

const FETCH_TIMEOUT = 15000; // 15 seconds

export async function fetchLeaderboardData(
  filters: LeaderboardFilters = {}
): Promise<LeaderboardResponse> {
  try {
    const response = await api.get<LeaderboardResponse>('/leaderboard', {
      params: {
        ...filters,
        limit: filters.limit || 10  // Ensure we always have a limit
      },
      timeout: FETCH_TIMEOUT
    });

    // Validate response structure
    if (!response?.data?.data || !Array.isArray(response.data.data)) {
      throw new LeaderboardError(
        'Invalid response format from server',
        'INVALID_RESPONSE',
        500
      );
    }

    if (!response.data.pagination || typeof response.data.pagination.total !== 'number') {
      throw new LeaderboardError(
        'Invalid pagination data from server',
        'INVALID_RESPONSE',
        500
      );
    }

    if (!Array.isArray(response.data.subjects)) {
      response.data.subjects = []; // Ensure subjects is always an array
    }

    // Ensure all required fields are present in student data
    response.data.data = response.data.data.map(student => ({
      ...student,
      subjects: student.subjects || [],
      totalTests: student.totalTests || 0,
      score: typeof student.score === 'number' ? student.score : 0,
      percentile: typeof student.percentile === 'number' ? student.percentile : 0
    }));

    return response.data;
  } catch (error) {
    if (error instanceof LeaderboardError) {
      throw error;
    }

    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        throw new LeaderboardError(
          'Request timed out',
          'TIMEOUT',
          408
        );
      }

      if (!error.response) {
        throw new LeaderboardError(
          'Network error',
          'NETWORK_ERROR',
          0
        );
      }

      const status = error.response.status;
      if (status === 401) {
        throw new LeaderboardError(
          'Unauthorized access',
          'UNAUTHORIZED',
          status
        );
      }

      const apiError = error.response.data as ApiError;
      throw new LeaderboardError(
        apiError.message || 'Server error',
        'SERVER_ERROR',
        status
      );
    }

    throw new LeaderboardError(
      'Unknown error occurred',
      'UNKNOWN_ERROR',
      500
    );
  }
}
