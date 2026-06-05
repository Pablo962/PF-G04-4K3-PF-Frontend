import React from 'react'
import { CheckCircle2, XCircle, FlaskConical, Info } from 'lucide-react'
import styles from './PruebasEstadisticas.module.css'

const DESCRIPCIONES = {
  'Prueba de Promedios': {
    desc: 'Verifica que la media de la muestra sea ≈ 0,5000 (media teórica de U(0,1)).',
    formula: '|Z₀| = |(X̄ − 0,5) · √n / √(1/12)|  <  1,96',
  },
  'Prueba de Frecuencia (χ²)': {
    desc: 'Comprueba uniformidad: cada decil [0–0.1, …, 0.9–1.0] debe tener la misma cantidad de números.',
    formula: 'χ² = Σ (fₒ − fₑ)² / fₑ  <  χ²_c(9)',
  },
  'Prueba de Kolmogorov-Smirnov': {
    desc: 'Compara la distribución acumulada empírica Fₙ(x) con la distribución uniforme teórica F(x) = x.',
    formula: 'D = max|Fₙ(xᵢ) − uᵢ|  <  1,36 / √n',
  },
  'Prueba de Corridas': {
    desc: 'Detecta autocorrelación. Compara corridas arriba/abajo de 0,5 con las esperadas por una secuencia independiente.',
    formula: 'χ² sobre frecuencias de corridas por longitud  <  χ²_c(5)',
  },
}

function TarjetaPrueba({ prueba }) {
  const info = DESCRIPCIONES[prueba.nombre] ?? {}
  const ok = prueba.aprueba

  return (
    <div className={`${styles.card} ${ok ? styles.cardOk : styles.cardFail}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          {ok
            ? <CheckCircle2 size={20} color="#22c55e" />
            : <XCircle     size={20} color="#ef4444" />
          }
        </div>
        <div className={styles.cardTitle}>{prueba.nombre}</div>
        <div className={`${styles.badge} ${ok ? styles.badgeOk : styles.badgeFail}`}>
          {ok ? 'APROBADA' : 'REPROBADA'}
        </div>
      </div>

      {info.desc && (
        <p className={styles.desc}>
          <Info size={11} style={{ flexShrink: 0, marginTop: 1 }} />
          {info.desc}
        </p>
      )}

      {info.formula && (
        <div className={styles.formulaBox}>{info.formula}</div>
      )}

      <div className={styles.detalle}>{prueba.detalle}</div>

      {/* Frecuencias observadas (para las pruebas que las exponen) */}
      {prueba.frecuenciasObservadas && (
        <div className={styles.freqRow}>
          {prueba.frecuenciasObservadas.map((f, i) => (
            <div key={i} className={styles.freqCell}>
              <div className={styles.freqVal}>{f}</div>
              <div className={styles.freqLbl}>{i + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const PruebasEstadisticas = ({ pruebasEstadisticas }) => {
  if (!pruebasEstadisticas) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><FlaskConical size={40} color="rgba(255,255,255,0.2)" /></div>
        <div>No hay datos de pruebas estadísticas disponibles.</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Ejecutá la simulación para ver los resultados.
        </div>
      </div>
    )
  }

  if (pruebasEstadisticas.error) {
    return <div className="alert-error">{pruebasEstadisticas.error}</div>
  }

  const { aprobadas, total, n, pruebas } = pruebasEstadisticas
  const pct = Math.round((aprobadas / total) * 100)
  const colorScore = aprobadas === total ? '#22c55e' : aprobadas >= total / 2 ? '#f59e0b' : '#ef4444'

  return (
    <div className={styles.wrapper}>

      {/* Encabezado con score */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FlaskConical size={18} color="var(--teal)" />
          <div>
            <div className={styles.headerTitle}>Reporte de Calidad del Generador</div>
            <div className={styles.headerSub}>
              Muestra analizada: <strong>{n?.toLocaleString('es-AR')}</strong> números pseudoaleatorios · α = 0,05
            </div>
          </div>
        </div>
        <div className={styles.scoreBox}>
          <div className={styles.scoreNum} style={{ color: colorScore }}>{aprobadas}/{total}</div>
          <div className={styles.scoreLbl}>pruebas aprobadas</div>
          <div className={styles.scorePct} style={{ color: colorScore }}>{pct}%</div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${pct}%`, background: colorScore }}
        />
      </div>

      {/* Nota metodológica */}
      <div className={styles.nota}>
        Cada prueba evalúa una propiedad distinta de la secuencia generada. Una secuencia ideal debe aprobar todas.
        Si alguna falla, considerá cambiar los parámetros <span className={styles.mono}>a</span>,{' '}
        <span className={styles.mono}>c</span> o <span className={styles.mono}>m</span> del generador.
      </div>

      {/* Grid de tarjetas */}
      <div className={styles.grid}>
        {pruebas.map(p => <TarjetaPrueba key={p.nombre} prueba={p} />)}
      </div>
    </div>
  )
}

export default PruebasEstadisticas
