import React from 'react'
import ParametrosAvanzados from './ParametrosAvanzados'
import styles from './EntradasSimulador.module.css'
import { useEntradasSimulador } from '../../hooks/useEntradasSimulador'

import {
  Server, Network, Laptop,
  Recycle, Wrench, Trash2,
  CheckCircle, AlertTriangle,
  Monitor, RefreshCcw, Play,
  Cpu, Zap,
} from 'lucide-react'

/* ── Fórmula del Congruencial Mixto (única disponible) ── */
const FORMULA = {
  expr: 'Xₙ₊₁ = ( a · Xₙ + c ) mod m',
  vars: [
    { key: 'a',  desc: 'Multiplicador' },
    { key: 'c',  desc: 'Incremento' },
    { key: 'm',  desc: 'Módulo' },
    { key: 'X₀', desc: 'Semilla: 0 ≤ X₀ < m' },
    { key: 'Uₙ', desc: 'Número aleatorio: Uₙ = Xₙ / m' },
  ],
  note: 'Período máximo garantizado (Teorema de Hull-Dobell). Parámetros fijos validados estadísticamente.',
}

/* ── Parámetros fijos del generador (glibc LCG, período = 2³¹) ── */
const PARAMS_FIJOS = [
  { key: 'a', label: 'Multiplicador', value: '1.103.515.245' },
  { key: 'c', label: 'Incremento',   value: '12.345' },
  { key: 'm', label: 'Módulo',       value: '2³¹ = 2.147.483.648' },
]

const blockInvalidKeys = (e) => {
  const ctrl = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Enter']
  if (ctrl.includes(e.key) || e.ctrlKey || e.metaKey || e.key === '.') return
  if (!/^\d$/.test(e.key)) e.preventDefault()
}

const EntradasSimulador = ({ onEjecutar, onReiniciar, cargando, error }) => {
  const {
    semilla, semillaError, setSemilla,
    handleEjecutar,
  } = useEntradasSimulador(onEjecutar)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      <div className="page-header" style={{ flexShrink: 0 }}>
        <div className="breadcrumb">
          <span>Inicio</span><span>›</span>
          <span style={{ color: 'var(--text)' }}>Configuración</span>
        </div>
        <h1 className="page-title">Configuración de la Simulación</h1>
      </div>

      <div className="page-body fade-in">
        <div className={styles.configGrid}>

          {/* ══ Columna izquierda: General + Distribución de Tipos ══ */}
          <div className={styles.configLeft}>

            <div className="card">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'rgba(0,212,200,0.12)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00d4c8" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4"/>
                  </svg>
                </div>
                General
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div className="input-group">
                    <label className="input-label">Días de Simulación</label>
                    <input type="number" value={30} readOnly />
                    <span className="input-hint">Fijo: 30 días laborables (8 hs/día)</span>
                  </div>
                </div>
                <div>
                  <div className="section-sub" style={{ marginBottom: 8 }}>Parámetros del modelo</div>
                  {[
                    ['Lotes:',        'Exp(E=80 min)'],
                    ['Equipos/lote:', 'Unif(5–14)'],
                    ['Recepción:',    'Normal(2, 0.5)'],
                    ['Diagnóstico:',  'Unif(3–12)'],
                    ['Desarme:',      'Unif(5–55)'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 5, color: 'var(--text-muted)' }}>
                      <span>{k}</span>
                      <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'rgba(91,187,255,0.12)' }}>
                  <Monitor size={14} color="#5bbfff" />
                </div>
                Distribución de Tipos
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: 6, paddingRight: 8 }}>P(x) / F(x)</div>
                  {[
                    { Icon: Server,  color: '#10b981', label: 'Servidor',      val: '0.25 / 0.25' },
                    { Icon: Network, color: '#3b82f6', label: 'Switch/Router', val: '0.45 / 0.70' },
                    { Icon: Laptop,  color: '#8b5cf6', label: 'Hogareño',      val: '0.30 / 1.00' },
                  ].map(({ Icon, color, label, val }) => (
                    <div key={label} className={styles.distRow}>
                      <div className={styles.distIcon} style={{ background: `${color}22`, color }}>
                        <Icon size={13} />
                      </div>
                      <span className={styles.distName}>{label}</span>
                      <span className={styles.distVal}>{val}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: 6 }}>
                    <span>Destino</span><span>F(x)</span>
                  </div>
                  {[
                    { Icon: Recycle, color: '#10b981', label: 'Reutilización', val: '0.10' },
                    { Icon: Wrench,  color: '#f59e0b', label: 'Desarme',       val: '0.85' },
                    { Icon: Trash2,  color: '#ef4444', label: 'Desecho',       val: '1.00' },
                  ].map(({ Icon, color, label, val }) => (
                    <div key={label} className={styles.distRow}>
                      <div className={styles.distIcon} style={{ background: `${color}22`, color }}>
                        <Icon size={13} />
                      </div>
                      <span className={styles.distName}>{label}</span>
                      <span className={styles.distVal} style={{ color }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ Columna central: Generador RNG — fórmula fija ══ */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card-title">
              <div className="card-title-icon" style={{ background: 'rgba(168,85,247,0.12)' }}>
                <Cpu size={14} color="#a855f7" />
              </div>
              Generador RNG
            </div>

            {/* Badge del método fijo */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              <Cpu size={13} color="#a855f7" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a855f7' }}>
                Congruencial Mixto (LCG)
              </span>
            </div>

            {/* Fórmula */}
            <div className={styles.formulaBox}>
              <div className={styles.formulaLabel}>Fórmula del método</div>
              <div className={styles.formulaExpr}>{FORMULA.expr}</div>
              <div className={styles.formulaVars}>
                {FORMULA.vars.map(({ key, desc, constraint }) => (
                  <div key={key} className={styles.formulaVarRow}>
                    <span className={styles.formulaVarKey}>{key}</span>
                    <span className={styles.formulaVarDesc}>
                      {desc}
                      {constraint && (
                        <span className={styles.formulaVarConstraint}> ({constraint})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              {FORMULA.note && (
                <div style={{ fontSize: '0.65rem', color: 'rgba(168,85,247,0.6)', marginTop: 8, fontStyle: 'italic', lineHeight: 1.4 }}>
                  {FORMULA.note}
                </div>
              )}
            </div>
          </div>

          {/* ══ Columna derecha: Semilla + Parámetros fijos (solo lectura) ══ */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card-title">
              <div className="card-title-icon" style={{ background: 'rgba(168,85,247,0.12)' }}>
                <Cpu size={14} color="#a855f7" />
              </div>
              Parámetros y Semilla
            </div>

            <div className="input-group">
              <label className="input-label">Semilla</label>
              <input
                type="text"
                inputMode="decimal"
                value={semilla}
                onChange={e => setSemilla(e.target.value)}
                onKeyDown={blockInvalidKeys}
                placeholder="Vacío = semilla aleatoria (0 ≤ X₀ < 2³¹)"
                style={semillaError ? { borderColor: 'rgba(239,68,68,0.7)', boxShadow: '0 0 0 2px rgba(239,68,68,0.18)' } : undefined}
              />
              {semillaError
                ? <span className={styles.inputError}>{semillaError}</span>
                : <span className="input-hint">Misma semilla → mismos resultados reproducibles</span>
              }
            </div>

            {/* Parámetros fijos — solo lectura */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="section-sub">Parámetros del método</div>
              <div style={{
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.15)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}>
                {PARAMS_FIJOS.map(({ key, label, value }) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#a855f7',
                      background: 'rgba(168,85,247,0.1)',
                      padding: '2px 7px',
                      borderRadius: 4,
                    }}>{value}</span>
                  </div>
                ))}
              </div>
              <span className="input-hint" style={{ fontSize: '0.65rem' }}>
                Parámetros fijos validados (glibc LCG) — período máximo 2³¹
              </span>
            </div>
          </div>

          {/* ══ Fila inferior: Eficacia y Ambiente ══ */}
          <div className={`card ${styles.eficaciaRow}`} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card-title">
              <div className="card-title-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
                <Zap size={14} color="#3b82f6" />
              </div>
              Eficacia y Ambiente
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <div>
                <div className="section-sub">Eficacia del procesamiento</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                  <div className="card-inner" style={{ textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <CheckCircle size={16} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>Correcto</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>99.05%</div>
                  </div>
                  <div className="card-inner" style={{ textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <AlertTriangle size={16} color="#f59e0b" />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>Incidente</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>0.95%</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="section-sub">Agua evitada (por equipo)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
                  {[
                    { Icon: Server,  color: '#10b981', label: 'Servidor',  val: '50.000 L' },
                    { Icon: Network, color: '#3b82f6', label: 'Switch',    val: '15.000 L' },
                    { Icon: Laptop,  color: '#8b5cf6', label: 'Hogareño',  val: '3.000 L'  },
                  ].map(({ Icon, color, label, val }) => (
                    <div key={label} className="card-inner" style={{ textAlign: 'center', padding: '10px 6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                        <Icon size={16} color={color} />
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="section-sub">Umbrales de decisión</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 2, marginTop: 8 }}>
                  <div>TTR &gt; 160 hs → nuevo recepcionista</div>
                  <div>TT &gt; 160 hs → nuevo operario</div>
                  <div>TEP &gt; 800 eq. → 2do turno</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <ParametrosAvanzados />

        {error && <div className="alert-error" style={{ marginTop: 14 }}>{error}</div>}
      </div>

      <div className="page-footer" style={{ flexShrink: 0 }}>
        <button className="btn-secondary" onClick={onReiniciar} disabled={cargando}>
          <RefreshCcw size={14} /> Reiniciar
        </button>
        <button className="btn-primary" onClick={handleEjecutar} disabled={cargando}>
          {cargando
            ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Simulando...</>
            : <><Play size={12} fill="#07111f" color="transparent" /> Ejecutar Simulación</>
          }
        </button>
      </div>
    </div>
  )
}

export default EntradasSimulador
