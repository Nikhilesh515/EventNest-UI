import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { env } from '@/lib/env'
import { attachRequestInterceptors, attachResponseInterceptors } from './interceptors'

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 20_000,
  withCredentials: false,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

attachRequestInterceptors(apiClient)
attachResponseInterceptors(apiClient)
