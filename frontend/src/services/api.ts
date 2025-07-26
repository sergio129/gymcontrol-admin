import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api',
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor para agregar token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejar errores globalmente
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response) {
          const { status, data } = error.response;

          // Token expirado o inválido
          if (status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('admin');
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // Mostrar mensaje de error
          const message = data?.message || 'Error en la solicitud';
          toast.error(message);
        } else if (error.request) {
          toast.error('Error de conexión. Verifique su internet.');
        } else {
          toast.error('Error inesperado');
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP
  public get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.instance.get(url, { params });
  }

  public post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data);
  }

  public put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data);
  }

  public patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data);
  }

  public delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.instance.delete(url);
  }

  // Método para configurar token
  public setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  // Método para remover token
  public removeAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('admin');
  }
}

export const apiService = new ApiService();
