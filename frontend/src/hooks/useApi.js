import { useState, useEffect, useCallback } from 'react'

// Hook para llamadas que cargan datos al montar
export function useApi(fn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fn()
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}

// Hook para mutaciones (POST / PATCH / DELETE)
export function useMutation(fn) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const mutate = async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fn(...args)
      return res
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
