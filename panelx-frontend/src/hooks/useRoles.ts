import { useState, useCallback } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';

// Types
export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface UpdateRolePermissionsRequest {
  permission_ids: string[];
}

export function useRoles() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.error('No access token found in localStorage');
      return {};
    }
    
    return {
      ...API_CONFIG.HEADERS,
      'Authorization': `Bearer ${token}`,
    };
  };

  // Get all roles with their permissions
  const getRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      const response = await axios.get<Role[]>(
        `${API_CONFIG.BASE_URL}/roles`,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get roles error:', error.response?.data);
      let errorMessage = 'Failed to fetch roles';
      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get a specific role by ID
  const getRole = useCallback(async (roleId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      const response = await axios.get<Role>(
        `${API_CONFIG.BASE_URL}/roles/${roleId}`,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get role error:', error.response?.data);
      let errorMessage = 'Failed to fetch role';
      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Role not found';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get all available permissions
  const getPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      const response = await axios.get<Permission[]>(
        `${API_CONFIG.BASE_URL}/roles/permissions`,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get permissions error:', error.response?.data);
      let errorMessage = 'Failed to fetch permissions';
      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new role (admin only)
  const createRole = useCallback(async (roleData: CreateRoleRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      const response = await axios.post<Role>(
        `${API_CONFIG.BASE_URL}/roles`,
        roleData,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Create role error:', error.response?.data);
      let errorMessage = 'Failed to create role';
      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0].msg;
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a role's name or description (admin only)
  const updateRole = useCallback(async (roleId: string, roleData: UpdateRoleRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      const response = await axios.put<Role>(
        `${API_CONFIG.BASE_URL}/roles/${roleId}`,
        roleData,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Update role error:', error.response?.data);
      let errorMessage = 'Failed to update role';
      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Role not found';
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0].msg;
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a role (admin only)
  const deleteRole = useCallback(async (roleId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      await axios.delete(
        `${API_CONFIG.BASE_URL}/roles/${roleId}`,
        { headers }
      );
      return { success: true };
    } catch (error: any) {
      console.error('Delete role error:', error.response?.data);
      let errorMessage = 'Failed to delete role';
      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Role not found';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Replace a role's full permission set (admin only)
  const updateRolePermissions = useCallback(async (roleId: string, permissionIds: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = getAuthHeaders();
      const response = await axios.put<Role>(
        `${API_CONFIG.BASE_URL}/roles/${roleId}/permissions`,
        { permission_ids: permissionIds },
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Update role permissions error:', error.response?.data);
      let errorMessage = 'Failed to update role permissions';
      if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Role not found';
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0].msg;
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getRoles,
    getRole,
    getPermissions,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
  };
}