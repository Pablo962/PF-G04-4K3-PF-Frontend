import { useState, useMemo } from 'react'

const TABS = [
  { id: 'resumen',   label: 'Resumen' },
  { id: 'desglose',  label: 'Desglose diario' },
  { id: 'grilla',    label: 'Grilla de eventos' },
  { id: 'decisiones',label: 'Decisiones' },
  { id: 'generador', label: 'Generador' },
  { id: 'pruebas',   label: 'Pruebas Estadísticas' },
]


export function useResultados(datos) {
  const [tabActivo, setTabActivo] = useState('resumen')

  const fmt = (n, dec = 0) =>
    typeof n === 'number'
      ? n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
      : '—'

  const pctOk = datos
    ? 100 * (datos.resumen.TEP - datos.resumen.PE) / Math.max(datos.resumen.TEP, 1)
    : 0

  const pctIncid = datos
    ? 100 * datos.resumen.PE / Math.max(datos.resumen.TEP, 1)
    : 0

  return {
    tabActivo,
    setTabActivo,
    tabs: TABS,
    fmt,
    pctOk,
    pctIncid,
  }
}
