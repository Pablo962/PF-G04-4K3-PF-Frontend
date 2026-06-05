import React from 'react'
import styles from './ResultadosSimulador.module.css'
import { useResultados } from '../../hooks/useResultados'

import {
  Truck, Scale, Droplets,
  Recycle, Wrench, Trash2,
  Server, Network, Laptop,
  CheckCircle, AlertTriangle,
  BarChart3, ListOrdered,
  RefreshCcw, Play, Star,
} from 'lucide-react'

import DonutsDestino      from './DonutsDestino'
import AcumuladoMensual   from './AcumuladoMensual'
import DesgloseDiario     from './DesgloseDiario'
import GrillaEventos      from './GrillaEventos'
import DecisionesDetalle  from './DecisionesDetalle'
import HistogramaGenerador from './HistogramaGenerador'
import GlosarioVariables      from './GlosarioVariables'
import PruebasEstadisticas    from './PruebasEstadisticas'

const ResultadosSimulador = ({ datos, onEjecutar, onReiniciar }) => {
  const {
    tabActivo, setTabActivo, tabs,
    fmt, pctOk, pctIncid,
  } = useResultados(datos)

  if (!datos) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div className="page-header">
          <div className="breadcrumb">
            <span>Inicio</span><span>›</span>
            <span style={{ color: 'var(--text)' }}>Resultados</span>
          </div>
          <h1 className="page-title">Tablero de Análisis de Resultados</h1>
        </div>
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <BarChart3 size={48} color="rgba(255,255,255,0.2)" />
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>No hay resultados disponibles</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Ejecutá la simulación desde la sección Configuración</div>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={onEjecutar}>
              Ir a Configuración
            </button>
          </div>
        </div>
        <div className="page-footer">
          <button className="btn-secondary" onClick={onReiniciar}>
            <RefreshCcw size={14} /> Reiniciar
          </button>
          <button className="btn-primary" onClick={onEjecutar}>
            <Play size={12} fill="#07111f" /> Ejecutar Simulación
          </button>
        </div>
      </div>
    )
  }

  const { dias, resumen, decisiones, methodName, seed, seedWasRandom, grilla, rng, pruebasEstadisticas } = datos

  const renderTab = () => {
    switch (tabActivo) {
      case 'resumen':
        return (
          <div className={styles.tabContent}>
            <div className={styles.kpiBar}>
              {[
                { icon: Truck,    label: 'Total Equipos', val: fmt(resumen.TEP),                     color: 'var(--teal)' },
                { icon: Scale,    label: 'Peso Total',     val: `${(resumen.PT / 1000).toFixed(1)} Ton`, color: '#f59e0b' },
                { icon: Droplets, label: 'Agua Evitada',   val: `${(resumen.TA / 1000).toFixed(0)}K L`,  color: '#3b82f6' },
                { icon: CheckCircle, label: 'Correcto',    val: `${pctOk.toFixed(2)}%`,               color: '#10b981' },
                { icon: AlertTriangle, label: 'Incidentes',val: `${pctIncid.toFixed(2)}%`,             color: '#ef4444' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className={styles.kpiItem}>
                  <Icon size={20} color={color} />
                  <div className={styles.kpiLabel}>{label}</div>
                  <div className={styles.kpiValue} style={{ color }}>{val}</div>
                </div>
              ))}
            </div>

            <div className={styles.destinosRow}>
              {[
                { Icon: Recycle, color: '#10b981', label: 'Funcionales (EF)', v: fmt(resumen.EF) },
                { Icon: Wrench,  color: '#f59e0b', label: 'Desarme (ED)',     v: fmt(resumen.ED) },
                { Icon: Trash2,  color: '#ef4444', label: 'Desecho (EI)',     v: fmt(resumen.EI) },
                { Icon: Server,  color: '#60a5fa', label: 'Servidores (CS)',  v: fmt(resumen.CS) },
                { Icon: Network, color: '#c084fc', label: 'Switch/Router (CR)',v: fmt(resumen.CR) },
                { Icon: Laptop,  color: '#f59e0b', label: 'Hogareños (ER)',   v: fmt(resumen.ER) },
              ].map(({ Icon, color, label, v }) => (
                <div key={label} className="card-inner" style={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
                  <Icon size={16} color={color} style={{ marginBottom: 4 }} />
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontWeight: 700, color, fontSize: '1rem' }}>{v}</div>
                </div>
              ))}
            </div>

            <DonutsDestino datos={datos} />
            <AcumuladoMensual dias={dias} />
          </div>
        )

      case 'desglose':
        return <DesgloseDiario dias={dias} />

      case 'grilla':
        return <GrillaEventos grilla={grilla} rng={rng} />

      case 'decisiones':
        return <DecisionesDetalle resumen={resumen} decisiones={decisiones} />

      case 'generador':
        return <HistogramaGenerador grilla={grilla} rng={rng} />

      case 'pruebas':
        return <PruebasEstadisticas pruebasEstadisticas={pruebasEstadisticas} />

      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      <div className="page-header" style={{ flexShrink: 0 }}>
        <div className="breadcrumb">
          <span>Inicio</span><span>›</span>
          <span style={{ color: 'var(--text)' }}>Resultados</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Tablero de Análisis de Resultados</h1>
          <div className={styles.seedBadge}>
            <span className={styles.seedMethod}>{methodName}</span>
            <span style={{ color: 'var(--text-muted)' }}>
              {seedWasRandom ? 'Semilla aleatoria:' : 'Semilla:'}
            </span>
            <span className={styles.seedVal} style={{ color: seedWasRandom ? '#f59e0b' : 'var(--teal)' }}>
              {seed}
            </span>
          </div>
        </div>
      </div>

      <div className="page-body fade-in">
        <div className={styles.layout}>

          <div className={styles.main}>
            <div className={styles.tabBar}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`${styles.tabBtn} ${tabActivo === t.id ? styles.tabBtnActive : ''}`}
                  onClick={() => setTabActivo(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className={styles.tabPanel}>
              {renderTab()}
            </div>
          </div>

          <div className={styles.sidebar}>
            <GlosarioVariables />
          </div>
        </div>
      </div>

      <div className="page-footer" style={{ flexShrink: 0 }}>
        <button className="btn-secondary" onClick={onReiniciar}>
          <RefreshCcw size={14} /> Reiniciar
        </button>
        <button className="btn-primary" onClick={onEjecutar}>
          <Play size={12} fill="#07111f" color="transparent" /> Ejecutar Simulación
        </button>
      </div>
    </div>
  )
}

export default ResultadosSimulador
