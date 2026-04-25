import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  profile_image_url?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface UsersResponse {
  total: number;
  items: User[];
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  password: string;
  role_id?: string;
  is_superuser?: boolean;
  profile_image?: File;
}

export interface UpdateUserRequest {
  user_id: string;
  email?: string;
  full_name?: string;
  password?: string;
  role_id?: string;
  is_superuser?: boolean;
  profile_image?: File;
  is_active?: boolean;
}

export interface UpdateOwnProfileRequest {
  full_name?: string;
  email?: string;
  profile_image?: File;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AssignRoleRequest {
  user_id: string;
  role_id: string;
}

export interface RemoveRoleRequest {
  user_id: string;
  role_id: string;
}

export function useUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getApi } = useAuth();

  // 1. Get all users (admin only)
  const getUsers = useCallback(async (skip: number = 0, limit: number = 100) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.get<UsersResponse>(`/users?skip=${skip}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get users error:', error.response?.data);
      
      let errorMessage = 'Failed to fetch users';
      if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : error.response.data.detail[0]?.msg || 'Failed to fetch users';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  // 2. Get current authenticated user
  const getCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.get<User>('/users/me');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data);
      let errorMessage = 'Failed to fetch current user';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : error.response.data.detail[0]?.msg || 'Failed to fetch user';
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  // 3. Update own profile (full_name, email and/or profile image)
  const updateOwnProfile = useCallback(async (profileData: UpdateOwnProfileRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      let response;
      
      // Use multipart/form-data if there's a file
      if (profileData.profile_image) {
        const formData = new FormData();
        if (profileData.full_name) formData.append('full_name', profileData.full_name);
        if (profileData.email) formData.append('email', profileData.email);
        formData.append('profile_image', profileData.profile_image);
        
        response = await api.put<User>('/users/me', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Regular JSON request
        const payload: any = {};
        if (profileData.full_name) payload.full_name = profileData.full_name;
        if (profileData.email) payload.email = profileData.email;
        
        response = await api.put<User>('/users/me', payload);
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Update own profile error:', error.response?.data);
      
      let errorMessage = 'Failed to update profile';
      if (error.response?.status === 422) {
        errorMessage = 'Invalid data provided';
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
  }, [getApi]);

  // 4. Change own password
  const changeOwnPassword = useCallback(async (passwordData: ChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      await api.put('/users/me/password', passwordData);
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error.response?.data);
      
      let errorMessage = 'Failed to change password';
      if (error.response?.status === 401) {
        errorMessage = 'Current password is incorrect';
      } else if (error.response?.status === 422) {
        errorMessage = 'Password does not meet requirements';
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
  }, [getApi]);

  // 5. Create new user (admin only)
  const createUser = useCallback(async (userData: CreateUserRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      let response;
      
      // Check if we need to use multipart/form-data for file upload
      if (userData.profile_image) {
        const formData = new FormData();
        formData.append('email', userData.email);
        formData.append('full_name', userData.full_name);
        formData.append('password', userData.password);
        if (userData.role_id) formData.append('role_id', userData.role_id);
        formData.append('is_superuser', String(userData.is_superuser || false));
        formData.append('profile_image', userData.profile_image);
        
        response = await api.post<User>('/users', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post<User>('/users', userData);
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Create user error:', error.response?.data);
      
      let errorMessage = 'Failed to create user';
      if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.status === 409) {
        errorMessage = 'User with this email already exists.';
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
  }, [getApi]);

  // 6. Update any user (admin only)
  const updateUser = useCallback(async (userData: UpdateUserRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      let response;
      
      // Build update payload (only include fields that are provided)
      const updatePayload: any = {};
      if (userData.email !== undefined) updatePayload.email = userData.email;
      if (userData.full_name !== undefined) updatePayload.full_name = userData.full_name;
      if (userData.password) updatePayload.password = userData.password;
      if (userData.role_id !== undefined) updatePayload.role_id = userData.role_id;
      if (userData.is_superuser !== undefined) updatePayload.is_superuser = userData.is_superuser;
      if (userData.is_active !== undefined) updatePayload.is_active = userData.is_active;
      
      // Handle file upload separately
      if (userData.profile_image) {
        const formData = new FormData();
        Object.keys(updatePayload).forEach(key => {
          formData.append(key, updatePayload[key]);
        });
        formData.append('profile_image', userData.profile_image);
        
        response = await api.put<User>(`/users/${userData.user_id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.put<User>(`/users/${userData.user_id}`, updatePayload);
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Update user error:', error.response?.data);
      
      let errorMessage = 'Failed to update user';
      if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found.';
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
  }, [getApi]);

  // 7. Get all roles
  const getRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.get<Role[]>('/roles');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get roles error:', error.response?.data);
      
      let errorMessage = 'Failed to fetch roles';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : error.response.data.detail[0]?.msg || 'Failed to fetch roles';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  // 8. Assign role to user (admin only)
  const assignRole = useCallback(async (user_id: string, role_id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      const response = await api.post<User>('/users/assign-role', { user_id, role_id });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Assign role error:', error.response?.data);
      
      let errorMessage = 'Failed to assign role';
      if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User or role not found.';
      } else if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : error.response.data.detail[0]?.msg || 'Failed to assign role';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  
const updateUserRole = useCallback(async (user_id: string, role_id: string) => {
  setIsLoading(true);
  setError(null);
  
  try {
    const api = getApi();
    const response = await api.put<User>(`/users/${user_id}/role`, { role_id });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Update user role error:', error.response?.data);
    
    let errorMessage = 'Failed to update user role';
    if (error.response?.status === 403) {
      errorMessage = 'Forbidden. You don\'t have admin access.';
    } else if (error.response?.status === 404) {
      errorMessage = 'User or role not found.';
    } else if (error.response?.status === 422) {
      errorMessage = 'Invalid role data provided.';
    } else if (error.response?.data?.detail) {
      errorMessage = typeof error.response.data.detail === 'string'
        ? error.response.data.detail
        : error.response.data.detail[0]?.msg || 'Failed to update role';
    }
    
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setIsLoading(false);
  }
}, [getApi]);

  // 9. Remove role from user (admin only)
  const removeRole = useCallback(async (user_id: string, role_id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const api = getApi();
      await api.delete('/users/remove-role', { data: { user_id, role_id } });
      return { success: true };
    } catch (error: any) {
      console.error('Remove role error:', error.response?.data);
      
      let errorMessage = 'Failed to remove role';
      if (error.response?.status === 403) {
        errorMessage = 'Forbidden. You don\'t have admin access.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User or role not found.';
      } else if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : error.response.data.detail[0]?.msg || 'Failed to remove role';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  // 10. Deactivate user (admin only) — backend has no DELETE /users, so soft-delete via is_active=false
  const deleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const api = getApi();
      await api.put<User>(`/users/${userId}`, { is_active: false });
      return { success: true };
    } catch (error: any) {
      console.error('Delete user error:', error.response?.data);
      let errorMessage = 'Failed to deactivate user';
      if (error.response?.status === 403) {
        errorMessage = 'Forbidden. Admin access required.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found.';
      } else if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : error.response.data.detail[0]?.msg || errorMessage;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getApi]);

  return {
    isLoading,
    error,
    // User management
    getUsers,
    getCurrentUser,
    createUser,
    updateUser,
    deleteUser,
    // Own profile management
    updateOwnProfile,
    changeOwnPassword,
    // Role management
    getRoles,
    assignRole,
    removeRole,
    updateUserRole,
  };
}