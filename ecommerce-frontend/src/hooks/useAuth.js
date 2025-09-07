// src/hooks/useAuth.js
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logout } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
 const isAdmin = () => user?.role?.toLowerCase() === 'admin';

  const login = useCallback(
    async ({ username, password }) => {
      const response = await dispatch(loginUser({ username, password })).unwrap();

      if (response.user.role?.toLowerCase() === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
      return response;
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async ({ username, password, role }) => {
      const response = await dispatch(registerUser({ username, password, role })).unwrap();
      navigate('/');
      return response;
    },
    [dispatch, navigate]
  );

  const signOut = useCallback(() => {
    dispatch(logout());
    navigate('/');
  }, [dispatch, navigate]);

  return {
    user,
    role: user?.role || 'null',
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    signOut,
    isAdmin
  };
};
