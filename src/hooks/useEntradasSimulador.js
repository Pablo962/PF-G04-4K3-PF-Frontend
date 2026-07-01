import { useState, useRef, useEffect } from 'react'

/* ── Módulo fijo del generador (igual al DEFAULT_LCG_PARAMS del backend) ── */
export const M_FIJO = 2_147_483_648 // 2^31

/* ── Único método RNG disponible ── */
export const METODOS = [
  { value: 'mixedCongruential', label: 'Congruencial Mixto (LCG)' },
]

export const isValidNumericInput = (str) =>
  str === '' || /^\d+\.?\d*$/.test(str)

/** Número entero no negativo válido */
const isNonNegativeInt = (str) => {
  if (str === '' || str == null) return false
  const n = Number(str)
  return Number.isFinite(n) && n >= 0 && Math.floor(n) === n
}

export function useEntradasSimulador(onEjecutar) {
  /* Ref estable que siempre apunta a la última onEjecutar */
  const onEjecutarRef = useRef(onEjecutar)
  useEffect(() => { onEjecutarRef.current = onEjecutar }, [onEjecutar])

  const [semilla,      setSemillaState] = useState('')
  const [semillaError, setSemillaError] = useState('')

  // Método fijo: Congruencial Mixto
  const metodo = 'mixedCongruential'

  /* ── Semilla: solo enteros no negativos o vacío (aleatoria al ejecutar) ── */
  const setSemilla = (val) => {
    if (isValidNumericInput(val)) {
      setSemillaState(val)
      setSemillaError('')
    }
  }

  const validate = () => {
    // Si la semilla está vacía → se genera aleatoriamente, siempre válido
    if (semilla === '') {
      setSemillaError('')
      return true
    }

    if (!isNonNegativeInt(semilla)) {
      setSemillaError('La semilla debe ser un número entero no negativo')
      return false
    }

    const seedVal = parseInt(semilla, 10)
    if (seedVal >= M_FIJO) {
      setSemillaError(`La semilla debe ser menor que ${M_FIJO.toLocaleString('es-AR')} (= 2³¹)`)
      return false
    }

    setSemillaError('')
    return true
  }

  const buildPayload = () => {
    const seedWasRandom = semilla === ''

    /* Semilla aleatoria: en [0, M_FIJO) para respetar el espacio de estados */
    const seed = seedWasRandom
      ? Math.floor(Math.random() * M_FIJO)
      : parseInt(semilla, 10)

    // No se envían params: el backend usa DEFAULT_LCG_PARAMS automáticamente
    return { method: metodo, seed, seedWasRandom }
  }

  const handleEjecutar = () => {
    if (!validate()) return
    onEjecutarRef.current(buildPayload())
  }

  return {
    semilla,
    semillaError,
    setSemilla,
    metodo,
    handleEjecutar,
  }
}
