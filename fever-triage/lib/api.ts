// API client for communicating with the FastAPI backend

import { TriageInput, TriageOutput, HealthStatus } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout - please try again');
    }
    throw error;
  }
}

export async function triageAssessment(data: TriageInput): Promise<TriageOutput> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/triage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      API_TIMEOUT
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP error ${response.status}`;
      throw new ApiError(response.status, errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(500, `Unable to connect to AI service: ${error.message}`);
    }
    throw new ApiError(500, 'An unexpected error occurred');
  }
}

export async function healthCheck(): Promise<HealthStatus> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/health`,
      { method: 'GET' },
      5000
    );

    if (!response.ok) {
      throw new ApiError(response.status, 'Health check failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Unable to check service health');
  }
}
