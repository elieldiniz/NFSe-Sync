import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThemeStore } from '@/store/theme.store'
import { useSyncStore } from '@/store/sync.store'
import { useCertStore } from '@/store/cert.store'
import { useAppStore } from '@/store/app.store'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useThemeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should have default theme as light', () => {
    const { result } = renderHook(() => useThemeStore())
    expect(result.current.theme).toBe('light')
  })

  it('should toggle theme', () => {
    const { result } = renderHook(() => useThemeStore())
    
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('nfse-theme', 'dark')
  })

  it('should set theme explicitly', () => {
    const { result } = renderHook(() => useThemeStore())
    
    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('nfse-theme', 'dark')
  })
})

describe('useSyncStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have initial state', () => {
    const { result } = renderHook(() => useSyncStore())
    
    expect(result.current.isSyncing).toBe(false)
    expect(result.current.queue).toEqual([])
    expect(result.current.currentCompany).toBeNull()
    expect(result.current.currentNsu).toBe(0)
    expect(result.current.documentosProcessados).toBe(0)
    expect(result.current.progress).toBe(0)
  })

  it('should set syncing state', () => {
    const { result } = renderHook(() => useSyncStore())
    
    act(() => {
      result.current.setSyncing(true)
    })

    expect(result.current.isSyncing).toBe(true)
  })

  it('should set queue', () => {
    const { result } = renderHook(() => useSyncStore())
    const queue = [
      { id: '1', empresa: 'Empresa 1', cnpj: '12345678000190', status: 'aguardando' as const },
      { id: '2', empresa: 'Empresa 2', cnpj: '98765432000190', status: 'processando' as const }
    ]
    
    act(() => {
      result.current.setQueue(queue)
    })

    expect(result.current.queue).toEqual(queue)
  })

  it('should set current company', () => {
    const { result } = renderHook(() => useSyncStore())
    
    act(() => {
      result.current.setCurrentCompany('Empresa Teste')
    })

    expect(result.current.currentCompany).toBe('Empresa Teste')
  })

  it('should set current NSU', () => {
    const { result } = renderHook(() => useSyncStore())
    
    act(() => {
      result.current.setCurrentNsu(12345)
    })

    expect(result.current.currentNsu).toBe(12345)
  })

  it('should set documentos processados', () => {
    const { result } = renderHook(() => useSyncStore())
    
    act(() => {
      result.current.setDocumentosProcessados(100)
    })

    expect(result.current.documentosProcessados).toBe(100)
  })

  it('should reset state', () => {
    const { result } = renderHook(() => useSyncStore())
    
    act(() => {
      result.current.setSyncing(true)
      result.current.setQueue([{ id: '1', empresa: 'Test', cnpj: '123', status: 'aguardando' }])
      result.current.setCurrentCompany('Test Company')
      result.current.setCurrentNsu(12345)
      result.current.setDocumentosProcessados(100)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.queue).toEqual([])
    expect(result.current.currentCompany).toBeNull()
    expect(result.current.currentNsu).toBe(0)
    expect(result.current.documentosProcessados).toBe(0)
  })
})

describe('useCertStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have initial state', () => {
    const { result } = renderHook(() => useCertStore())
    
    expect(result.current.certificados).toEqual([])
  })

  it('should set certificados', () => {
    const { result } = renderHook(() => useCertStore())
    const certs = [
      { id: '1', razao_social: 'Empresa 1', cnpj: '12345678000190' }
    ]
    
    act(() => {
      result.current.setCertificados(certs as any)
    })

    expect(result.current.certificados).toEqual(certs)
  })
})

describe('useAppStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have initial state', () => {
    const { result } = renderHook(() => useAppStore())
    
    expect(result.current.currentPage).toBe('dashboard')
  })

  it('should set page', () => {
    const { result } = renderHook(() => useAppStore())
    
    act(() => {
      result.current.setPage('config')
    })

    expect(result.current.currentPage).toBe('config')
  })
})
