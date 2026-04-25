import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

// Types
export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectsResponse {
  total: number;
  items: Project[];
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: string;
}

// User assignment types
export interface AssignUserToProjectsRequest {
  user_id: string;
  project_ids: string[];
  role_id?: string;
}

export interface UpdateUserProjectsRequest {
  user_id: string;
  project_ids: string[];
  role_id?: string;
}

export interface RemoveUserFromProjectRequest {
  user_id: string;
  project_id: string;
}

export interface ProjectAssignment {
  user_id: string;
  project_id: string;
  role_id: string;
  assigned_at: string;
}

export interface AssignUserResponse {
  assigned: ProjectAssignment[];
  skipped: string[];
}

// Sync types
export interface SyncConfig {
  id: string;
  project_id: string;
  server_address: string;
  port: number;
  username: string;
  file_path: string;
  sync_frequency: string;
  last_sync_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSyncConfigRequest {
  server_address: string;
  port: number;
  username: string;
  password: string;
  file_path: string;
  sync_frequency: string;
}

export interface UpdateSyncConfigRequest {
  server_address?: string;
  port?: number;
  username?: string;
  password?: string;
  file_path?: string;
  sync_frequency?: string;
  is_active?: boolean;
}

export interface TestConnectionRequest {
  server_address: string;
  port: number;
  username: string;
  password: string;
  file_path: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  size_bytes: number;
  uploaded_at: string;
  status?: string;
  url?: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  storage_key: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  progress: number;
  panel_count: number | null;
  error_message: string | null;
  created_at: string;
}

export function useProjects() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getApi } = useAuth();

  // ============ Project CRUD ============
  
  const getProjects = useCallback(async (skip: number = 0, limit: number = 100) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.get<ProjectsResponse>(`/projects?skip=${skip}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch projects';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const getProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.get<Project>(`/projects/${projectId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.status === 404 ? 'Project not found' : 'Failed to fetch project';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const createProject = useCallback(async (projectData: CreateProjectRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.post<Project>('/projects', projectData);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to create project';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const updateProject = useCallback(async (projectId: string, projectData: UpdateProjectRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.put<Project>(`/projects/${projectId}`, projectData);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update project';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const deleteProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      await api.delete(`/projects/${projectId}`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete project';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  // ============ User Assignment Functions ============
  
  // Assign a user to multiple projects
  const assignUserToProjects = useCallback(async (assignData: AssignUserToProjectsRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.post<AssignUserResponse>('/projects/assign-user', assignData);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to assign user to projects';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);


  // Add this to your useProjects.ts file, inside the useProjects function

// ============ Project Stats Functions ============

const getProjectStats = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const api = getApi();
    const response = await api.get('/projects/stats/total');
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Failed to fetch project stats';
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setIsLoading(false);
  }
}, [getApi]);

  // Replace all project assignments for a user
  const updateUserProjects = useCallback(async (updateData: UpdateUserProjectsRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.put<AssignUserResponse>('/projects/update-user-projects', updateData);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update user projects';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

 

const removeUserFromProject = useCallback(async (projectId: string, userId: string) => {
  setIsLoading(true);
  setError(null);
  
  try {
    const api = getApi();
    // New endpoint: DELETE /api/v1/projects/{project_id}/users/{user_id}
    const response = await api.delete(`/projects/${projectId}/users/${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Remove user error:', error);
    let errorMessage = 'Failed to remove user from project';
    
    // Handle validation errors properly
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail.map((d: any) => d.msg).join(', ');
      }
    }
    
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setIsLoading(false);
  }
}, [getApi]);

  // Get users assigned to a project (if endpoint exists)
  const getProjectUsers = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.get(`/projects/${projectId}/users`);
      return { success: true, data: response.data };
    } catch (error: any) {
      // Return empty array if endpoint doesn't exist
      return { success: true, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  // ============ Sync Configuration Functions ============
  
  const getSyncConfig = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.get<SyncConfig>(`/sync/config/${projectId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }
      return { success: false, error: error.response?.data?.detail || 'Failed to fetch sync config' };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const createSyncConfig = useCallback(async (projectId: string, configData: CreateSyncConfigRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.post<SyncConfig>(`/sync/config?project_id=${projectId}`, configData);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to create sync configuration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const updateSyncConfig = useCallback(async (projectId: string, configData: UpdateSyncConfigRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.put<SyncConfig>(`/sync/config/${projectId}`, configData);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update sync configuration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const deleteSyncConfig = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      await api.delete(`/sync/config/${projectId}`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete sync configuration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const testConnection = useCallback(async (testData: TestConnectionRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.post<TestConnectionResponse>('/sync/test-connection', testData);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Connection test failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  // ============ File Management Functions ============
  
  // Get DWG/processed files for a project from the correct backend endpoint
  const getFiles = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const api = getApi();
      const response = await api.get<ProjectFile[]>(`/files/${projectId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.status === 404
        ? 'No files found for this project'
        : error.response?.data?.detail || 'Failed to fetch files';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const getProjectFiles = useCallback(async (projectId: string, fileType: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.get<FileItem[]>(`/projects/${projectId}/files?type=${fileType}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: true, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const uploadProjectFile = useCallback(async (projectId: string, file: File, fileType: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);
      
      const response = await api.post(`/projects/${projectId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to upload file';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  const deleteProjectFile = useCallback(async (projectId: string, fileId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      await api.delete(`/projects/${projectId}/files/${fileId}`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete file';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  return {
    isLoading,
    error,
    // Project CRUD
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectStats,
    // User assignment
    assignUserToProjects,
    updateUserProjects,
    removeUserFromProject,
    getProjectUsers,
    // Sync config
    getSyncConfig,
    createSyncConfig,
    updateSyncConfig,
    deleteSyncConfig,
    testConnection,
    // File management
    getFiles,
    getProjectFiles,
    uploadProjectFile,
    deleteProjectFile,
  };
}