# 🌍 Nave Tierra — Simulador de Reciclaje de Basura Electrónica

> **Proyecto Final — Simulación** | Grupo 04 · 4K3

Simulación de eventos discretos de una planta de recuperación de equipos electrónicos en desuso, construida con **React + Vite** (frontend) y **Express + Node.js** (backend). Implementa el método de **Montecarlo** con el **Generador Congruencial Mixto** para modelar los procesos estocásticos del sistema.

---

## Índice

1. [Caso de Estudio](#1-caso-de-estudio)
2. [Arquitectura del proyecto](#2-arquitectura-del-proyecto)
3. [Generación de números pseudoaleatorios](#3-generación-de-números-pseudoaleatorios)
4. [Distribuciones de probabilidad aplicadas](#4-distribuciones-de-probabilidad-aplicadas)
5. [Variables del modelo](#5-variables-del-modelo)
6. [Gráficos del tablero de resultados](#6-gráficos-del-tablero-de-resultados)
7. [Tablas del simulador](#7-tablas-del-simulador)
8. [Umbrales de decisión](#8-umbrales-de-decisión)
9. [Instalación y ejecución local](#9-instalación-y-ejecución-local)

---

## 1. Caso de Estudio

### ¿Qué simula Nave Tierra?

Nave Tierra es una **empresa de gestión de residuos electrónicos** (e-waste). Recibe diariamente lotes de equipos en desuso —servidores, switches, routers y dispositivos hogareños— y los procesa en una planta durante **30 días laborables** de 8 horas (480 minutos) cada uno.

### Objetivo de la simulación

Evaluar durante un mes completo de operación:

- Cuántos equipos se procesan en total (TEP).
- El destino de cada equipo: reutilización, desarme o disposición final.
- El tiempo que insumen los operarios en cada etapa.
- El impacto ambiental positivo: litros de agua que no se contaminan gracias al procesamiento correcto.
- Si la planta necesita incorporar personal adicional o habilitar un segundo turno.

### Flujo de cada equipo

```
Arribo del lote (Exponencial 80 min)
        │
        ▼
Recepción del equipo (Normal μ=2, σ=0.5 min)
        │
        ▼
Clasificación de tipo (Tabla de probabilidad)
   ├─ Tipo 1: Servidor (25%)
   ├─ Tipo 2: Switch/Router (45%)
   └─ Tipo 3: Hogareño (30%)
        │
        ▼
Pesaje (Uniforme 0.5–20 kg)
        │
        ▼
Diagnóstico (Uniforme 3–15 min)
        │
        ▼
Destino (Tabla de probabilidad)
   ├─ EF: Funcional → reutilización (10%)
   ├─ ED: Desarme → Uniforme(5–60 min) (75%)
   └─ EI: Irrecuperable → disposición final (15%)
        │
        ▼
Control de eficacia
   ├─ OK (99.05%) → contabiliza litros de agua evitados
   └─ INCIDENTE (0.95%) → posible contaminación
```

---

## 2. Arquitectura del proyecto

### Frontend (`PF-G04-4K3-PF-Frontend`)

```
src/
├── App.jsx                   # Orquestador de vistas (Bienvenida / Modelo / Config / Resultados)
├── index.css                 # Sistema de diseño global (variables CSS, tokens)
│
├── components/
│   ├── Bienvenida/           # Pantalla de inicio con descripción del proyecto
│   ├── EntradasSimulador/    # Formulario de configuración: método RNG, semilla, parámetros
│   ├── Modelo/               # Explicación del modelo matemático
│   └── ResultadosSimulador/  # Tablero de análisis con todas las vistas
│       ├── DonutsDestino.jsx         → Gráficos de torta (tipo y destino)
│       ├── AcumuladoMensual.jsx      → Líneas acumuladas (TEP + agua)
│       ├── DesgloseDiario.jsx        → Tabla diaria de indicadores
│       ├── GrillaEventos.jsx         → Auditoría equipo por equipo
│       ├── DecisionesDetalle.jsx     → Semáforos de umbrales
│       ├── HistogramaGenerador.jsx   → Histograma de los u generados
│       └── GlosarioVariables.jsx     → Glosario lateral de variables
│
└── hooks/
    ├── useSimulacion.js          # Estado global: llama al backend, maneja la vista activa
    ├── useEntradasSimulador.js   # Lógica del formulario: validación, semilla, payload
    ├── useResultados.js          # Tabs del tablero, métricas calculadas
    ├── useDonutsDestino.js       # Datos para gráficos de torta
    ├── useAcumuladoMensual.js    # Datos para gráfico de líneas acumulado
    ├── useDesgloseDiario.js      # Totales de la tabla diaria
    ├── useHistogramaGenerador.js # Estadísticas y bins del histograma RNG
    ├── useGrillaEventos.js       # Paginación y ordenamiento de la grilla
    └── useGlosario.js            # Definiciones de todas las variables
```

### Backend (`PF-G04-4K3-PF-Backend`)

```
src/
├── generators/
│   ├── index.js                # Factory: createGenerator() devuelve el generador activo
│   └── mixedCongruential.js    # Implementación del Congruencial Mixto con mulmod
│
├── simulation/
│   ├── distribution.js         # Funciones de distribución + tablas de probabilidad
│   └── naveTierra.js           # Motor de simulación: loop principal de 30 días
│
└── routes/
    ├── simulation.js           # POST /api/simulate/naveTierra
    └── distributions.js        # Utilidades de distribución (uso interno)
```

---

## 3. Generación de números pseudoaleatorios

### ¿Por qué es necesario un generador?

La simulación de Montecarlo se basa en reproducir la aleatoriedad del mundo real mediante computadora. Sin embargo, las computadoras son determinísticas: no pueden generar números verdaderamente aleatorios. En su lugar, se usan **generadores de números pseudoaleatorios (PRNG)** que producen secuencias de números que *parecen* aleatorios y tienen propiedades estadísticas similares a la distribución uniforme.

Todos los eventos estocásticos del simulador (llegada de lotes, tipo de equipo, destino, tiempos de proceso) se modelan mediante números **u ∈ [0, 1)** generados por el PRNG, que luego se transforman en valores concretos usando las distribuciones de probabilidad correspondientes.

### Método implementado: Congruencial Mixto (LCG)

El **Generador Congruencial Mixto** (Linear Congruential Generator) es el algoritmo más utilizado en simulaciones industriales y es el que implementa el presente simulador.

#### Fórmula

```
Xₙ₊₁ = (a · Xₙ + c) mod m
```

Donde el número aleatorio generado en cada paso es:

```
uₙ = Xₙ / m         (uₙ ∈ [0, 1))
```

#### Variables y sus roles

| Variable | Nombre | Descripción |
|----------|--------|-------------|
| **X₀** | **Semilla** | Valor inicial de la secuencia. Determinista: la misma semilla siempre produce los mismos números (reproducibilidad). |
| **a** | **Multiplicador** | Factor de amplificación. Define cuánto "salta" el generador en cada paso. |
| **c** | **Incremento** | Desplazamiento constante. Garantiza que el generador no quede atascado en 0. |
| **m** | **Módulo** | Espacio de estados. Define el máximo valor posible de Xₙ y por ende el período. |
| **Xₙ** | **Estado actual** | Valor interno del generador en el paso n. |
| **uₙ** | **Número aleatorio** | Resultado normalizado ∈ [0, 1) que se entrega a las distribuciones. |

#### ¿Qué provoca la semilla?

La semilla (X₀) es el **punto de arranque de toda la secuencia**. Dado que el algoritmo es determinístico, si se usa la misma semilla con los mismos parámetros `(a, c, m)`, la simulación producirá exactamente los mismos resultados en cada ejecución.

- **Semilla manual**: permite **reproducibilidad**. Útil para comparar el efecto de cambiar parámetros del modelo manteniendo el mismo flujo de aleatoriedad, o para depurar resultados.
- **Semilla aleatoria**: el sistema genera automáticamente un número aleatorio en `[0, m)` usando `Math.random()` de JavaScript. Cada corrida produce resultados distintos, simulando condiciones reales variables.

#### Restricciones de la semilla

La semilla **debe satisfacer** `0 ≤ X₀ < m`. Si X₀ ≥ m, la operación módulo la reduciría a un valor menor al primer paso, lo que hace redundante el valor ingresado y puede provocar colisiones con otros estados de la secuencia.

#### Condiciones para período máximo (m pasos antes de repetirse)

Para que el LCG genere todos los valores en [0, m) antes de ciclar, deben cumplirse el **Teorema de Hull-Dobell**:

1. `mcd(c, m) = 1` — c y m deben ser coprimos.
2. `(a - 1)` debe ser divisible por todos los factores primos de m.
3. Si `4 | m`, entonces `4 | (a - 1)`.

#### Ejemplo con parámetros clásicos

```
a = 1.664.525
c = 1.013.904.223
m = 4.294.967.296 (= 2³²)
X₀ = cualquier entero en [0, 2³²)
```

Estos son los parámetros de la función `rand()` de Borland C++, con período máximo de 2³² ≈ 4.294 millones de pasos.

#### Implementación: `mulmod` para evitar desbordamiento

La multiplicación `a · Xₙ` puede superar `Number.MAX_SAFE_INTEGER` (≈ 9×10¹⁵) cuando `a` y `m` son grandes. Para resolverlo sin recurrir a BigInt (que el transpilador Babel legacy no soporta), se implementó el algoritmo **binary double-and-add**:

```javascript
// Calcula (a * b) mod m exactamente para cualquier a, b, m ≤ 2⁵³
function mulmod(a, b, m) {
  let result = 0
  while (b > 0) {
    if (b % 2 === 1) result = (result + a) % m
    a = (a * 2) % m
    b = Math.floor(b / 2)
  }
  return result
}
```

---

## 4. Distribuciones de probabilidad aplicadas

Cada número `u ∈ [0, 1)` generado por el LCG se transforma en un valor concreto del modelo mediante una distribución de probabilidad. A continuación, todas las distribuciones utilizadas:

### 4.1 Distribución Exponencial — Tiempo entre arribos

```
T = -media · ln(u)         u ∈ (0, 1)
```

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Media | 80 minutos | Tiempo promedio entre llegadas de lotes |

**Uso**: determina cuántos lotes de equipos llegan en un día de 480 minutos. El proceso de arribo sigue una distribución de Poisson, lo que implica que los tiempos entre llegadas son Exponenciales.

**Comportamiento**: la mayoría de los lotes llegan aproximadamente cada 80 minutos, pero algunos pueden llegar en 5 minutos y otros en 200 minutos. Esta variabilidad es la que la simulación intenta capturar.

---

### 4.2 Distribución Uniforme Discreta (Entera) — Equipos por lote

```
CE = floor(a + (b - a) · u)
```

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| a (mínimo) | 5 equipos | Cantidad mínima por lote |
| b (máximo) | 15 equipos | Cantidad máxima por lote |

**Uso**: cada lote que llega trae entre 5 y 15 equipos. Cualquier cantidad entera en ese rango tiene igual probabilidad de ocurrir.

---

### 4.3 Distribución Normal (Gaussiana) — Tiempo de recepción

```
Z = √(-2 · ln(u₁)) · cos(2π · u₂)     [Método de Box-Muller]
TR = μ + σ · Z
```

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| μ (media) | 2 minutos | Tiempo promedio de recepción |
| σ (desvío estándar) | 0.5 minutos | Variabilidad del proceso |

**Uso**: modela el tiempo que un recepcionista tarda en registrar y pesar cada equipo. La mayoría de los equipos se reciben en aproximadamente 2 minutos, con variaciones entre ~1 y ~3 minutos.

**Nota técnica**: el método de Box-Muller requiere **dos** números `u₁` y `u₂` del generador para producir un único valor Normal. Por eso cada equipo consume 2 números aleatorios en esta etapa.

---

### 4.4 Distribución Uniforme Continua — Peso del equipo

```
P = 0.5 + (20 - 0.5) · u
```

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| a (mínimo) | 0.5 kg | Peso mínimo (dispositivo pequeño) |
| b (máximo) | 20 kg | Peso máximo (servidor rack) |

**Uso**: estima el peso bruto del equipo para calcular el peso total procesado en el período (PT).

---

### 4.5 Distribución Uniforme Continua — Tiempo de diagnóstico

```
TD = 3 + (15 - 3) · u
```

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| a (mínimo) | 3 minutos | Diagnóstico más rápido |
| b (máximo) | 15 minutos | Diagnóstico más lento |

**Uso**: tiempo que tarda el técnico en evaluar el estado del equipo y determinar su destino.

---

### 4.6 Distribución Uniforme Continua — Tiempo de desarme

```
TDD = 5 + (60 - 5) · u
```

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| a (mínimo) | 5 minutos | Desarme simple |
| b (máximo) | 60 minutos | Desarme complejo |

**Uso**: se aplica **únicamente** a los equipos que van a desarme (ED). Modela el tiempo que tarda un operario en desmontar el equipo para recuperar sus componentes.

---

### 4.7 Distribución Binomial Empírica (Tabla) — Tipo de equipo

Implementada como **función de distribución acumulada inversa** sobre una tabla discreta:

| u ∈ rango | Tipo | Probabilidad |
|-----------|------|-------------|
| u ≤ 0.25 | Servidor (Tipo 1) | 25% |
| u ≤ 0.70 | Switch/Router (Tipo 2) | 45% |
| u ≤ 1.00 | Hogareño (Tipo 3) | 30% |

**Uso**: clasifica cada equipo recibido en uno de los tres tipos. El litros de agua evitada depende del tipo.

---

### 4.8 Distribución Binomial Empírica (Tabla) — Destino del equipo

| u ∈ rango | Destino | Probabilidad |
|-----------|---------|-------------|
| u ≤ 0.10 | EF: Funcional (reutilización) | 10% |
| u ≤ 0.85 | ED: Desarme | 75% |
| u ≤ 1.00 | EI: Disposición final | 15% |

**Uso**: determina qué ocurre con cada equipo tras el diagnóstico. Solo los equipos ED consumen tiempo adicional de desarme.

---

### 4.9 Distribución Binomial Empírica (Tabla) — Eficacia del procesamiento

| u ∈ rango | Resultado | Probabilidad |
|-----------|-----------|-------------|
| u ≤ 0.9905 | OK (correcto) | 99.05% |
| u ≤ 1.0000 | INCIDENTE | 0.95% |

**Uso**: evalúa si el equipo fue procesado sin incidentes de contaminación (ej: ruptura de batería de litio, derrame de fluido refrigerante). Solo los equipos procesados correctamente contabilizan litros de agua evitados.

---

## 5. Variables del modelo

### Control de la simulación

| Variable | Descripción |
|----------|-------------|
| `d` | Día simulado (1 a 30) |
| `u` | Número aleatorio uniforme generado por el LCG |
| `L` | Cantidad de lotes que llegan en el día |
| `CE` | Cantidad de equipos por lote |

### Tipos de equipo procesados

| Variable | Descripción |
|----------|-------------|
| `CS` | Cantidad de servidores procesados |
| `CR` | Cantidad de switches/routers procesados |
| `ER` | Cantidad de equipos hogareños procesados |
| `TEP` | Total de equipos procesados en el período (CS + CR + ER) |

### Pesos

| Variable | Descripción |
|----------|-------------|
| `P` | Peso individual del equipo (kg) |
| `PT` | Peso total procesado en el período (kg) |

### Tiempos (minutos)

| Variable | Descripción |
|----------|-------------|
| `TR` | Tiempo de recepción de un equipo |
| `TD` | Tiempo de diagnóstico del equipo |
| `TDD` | Tiempo de desarme (solo equipos ED) |
| `TTR` | Tiempo total de recepción acumulado del período |
| `TTD` | Tiempo total de diagnóstico acumulado |
| `TTDD` | Tiempo total de desarme acumulado |
| `TT` | Tiempo total operativo (TTD + TTDD) |
| `TTR_hs` | TTR convertido a horas |
| `TT_hs` | TT convertido a horas |

### Destino

| Variable | Descripción |
|----------|-------------|
| `EF` | Equipos funcionales → reutilización directa |
| `ED` | Equipos para desarme (recuperación de partes) |
| `EI` | Equipos irrecuperables → disposición final |

### Calidad e impacto ambiental

| Variable | Descripción |
|----------|-------------|
| `PE` | Incidentes de contaminación |
| `TA` | Litros de agua no contaminada (impacto evitado) |

**Litros de agua evitados por tipo de equipo (procesado correctamente)**:

| Tipo | Litros evitados |
|------|----------------|
| Servidor (Tipo 1) | 50.000 L |
| Switch/Router (Tipo 2) | 15.000 L |
| Hogareño (Tipo 3) | 3.000 L |

---

## 6. Gráficos del tablero de resultados

El tablero de resultados se organiza en **5 pestañas**. A continuación, se explica cada gráfico en detalle.

---

### Pestaña "Resumen"

#### 6.1 KPIs superiores

Cinco indicadores en tarjetas destacadas al tope de la pantalla:

| KPI | Qué muestra |
|-----|-------------|
| **Total Equipos** | TEP total del mes |
| **Peso Total** | PT en toneladas |
| **Agua Evitada** | TA en miles de litros |
| **Correcto** | % de equipos procesados sin incidente |
| **Incidentes** | % de equipos con incidente de contaminación |

#### 6.2 Gráfico de Donas — Distribución por tipo de equipo

**Tipo**: Doughnut chart (Chart.js)

**Qué muestra**: la proporción real de servidores, switches/routers y equipos hogareños que procesó la planta durante todo el mes.

**Por qué es útil**: permite verificar visualmente la **Ley de los Grandes Números**. Con suficientes equipos, la proporción simulada debe converger a los valores del modelo (25% / 45% / 30%). Si el modelo fuera correcto y el generador RNG fuera uniforme, la dona debería mostrar esas proporciones.

**Cómo interpretarlo**:
- Secciones cercanas a los porcentajes del modelo → el generador produce buena uniformidad.
- Desviaciones grandes → posible falla del generador (período corto, mala semilla) o muestra pequeña.

#### 6.3 Gráfico de Donas — Distribución por destino

**Tipo**: Doughnut chart (Chart.js)

**Qué muestra**: la proporción real de equipos que terminaron en cada destino (EF, ED, EI) durante el mes.

**Por qué es útil**: igual que el anterior, valida que la distribución empírica del modelo (10% / 75% / 15%) se aproxima en la simulación.

#### 6.4 Gráfico de Líneas Acumulado Mensual

**Tipo**: Line chart con dos ejes Y (Chart.js)

**Qué muestra**:
- **Línea verde** (eje izquierdo): TEP acumulado día a día (equipos totales procesados desde el día 1 hasta el día actual).
- **Línea cyan** (eje derecho): Litros de agua no contaminada acumulados.

**Cómo interpretarlo**:
- **Pendiente constante**: la planta trabaja de manera estable, sin días extremadamente ocupados ni vacíos.
- **Pendiente más pronunciada** en ciertos días: llegaron más lotes o los lotes tenían más equipos (variabilidad natural de la distribución exponencial de arribos).
- **Achatamiento**: día con pocos lotes. No necesariamente es un problema operativo, sino la variabilidad propia del proceso de Poisson.

---

### Pestaña "Desglose Diario"

#### 6.5 Tabla de indicadores por día

**Tipo**: Tabla paginada con fila de totales.

**Qué muestra**: para cada uno de los 30 días, una fila con los indicadores clave:

| Columna | Descripción |
|---------|-------------|
| Día | Número de día (1–30) |
| Lotes | Cantidad de lotes que llegaron ese día |
| Equipos | Total de equipos procesados ese día |
| CS / CR / ER | Equipos por tipo |
| EF / ED / EI | Equipos por destino |
| PE | Incidentes ese día |
| TA (L) | Litros de agua evitados ese día |
| TTR (min) | Tiempo de recepción ese día |
| TT (min) | Tiempo operativo total ese día |

**Cómo interpretarlo**:
- Días con `Lotes = 0`: la distribución exponencial arrojó tiempos de arribo tan largos que ningún lote entró en las 480 minutos del turno.
- Días con `PE > 0`: ocurrieron incidentes de contaminación.
- Fila de **TOTALES** al pie: suma de todo el mes, equivalente al Resumen global.

---

### Pestaña "Grilla de Eventos"

#### 6.6 Grilla de auditoría (equipo por equipo)

**Tipo**: Tabla paginada, con todos los registros de la simulación.

**Qué muestra**: cada fila representa un único equipo procesado, con todos los números aleatorios que se consumieron para tomar las decisiones sobre ese equipo:

| Columna | Descripción |
|---------|-------------|
| `#` | Índice global del equipo |
| `Día / Lote` | Cuándo llegó |
| `uTipo` | Número aleatorio usado para determinar el tipo |
| `Tipo` | Tipo resultante (Servidor, Switch, Hogareño) |
| `uPeso` | Número aleatorio para el peso |
| `Peso (kg)` | Peso resultante |
| `uTR1 / uTR2` | Los dos números aleatorios para Box-Muller (tiempo de recepción) |
| `TR (min)` | Tiempo de recepción resultante |
| `uTD` | Número aleatorio para diagnóstico |
| `TD (min)` | Tiempo de diagnóstico resultante |
| `uDestino` | Número aleatorio para el destino |
| `Destino` | Destino resultante (EF / ED / EI) |
| `uTDD` | Número aleatorio para desarme (solo si ED) |
| `TDD (min)` | Tiempo de desarme resultante |
| `uEficacia` | Número aleatorio para eficacia |
| `OK` | Si fue procesado sin incidente |
| `Agua (L)` | Litros evitados |

**Por qué es útil**: permite **auditar cualquier decisión del simulador**. Si un resultado parece anómalo, se puede rastrear exactamente qué número aleatorio `u` lo provocó y verificar que la distribución se aplicó correctamente.

---

### Pestaña "Decisiones"

#### 6.7 Panel de decisiones gerenciales

**Tipo**: Tarjetas con semáforos de colores.

**Qué muestra**: tres indicadores que evalúan si el resultado del mes activa umbrales que requieren acción gerencial. Cada uno muestra en verde si el umbral no se supera, o en rojo con recomendación si sí.

Ver sección [8. Umbrales de decisión](#8-umbrales-de-decisión) para el detalle de cada uno.

---

### Pestaña "Generador RNG"

#### 6.8 Histograma de uniformidad del generador

**Tipo**: Gráfico de barras con línea de referencia (Chart.js mixed chart)

**Qué muestra**: todos los números `u ∈ [0, 1)` que el generador LCG produjo durante la simulación (potencialmente decenas de miles), agrupados en **10 deciles** (canastos de ancho 0.1 cada uno):

```
Decil 0.0–0.1: cuántos u cayeron entre 0.0 y 0.1
Decil 0.1–0.2: cuántos u cayeron entre 0.1 y 0.2
...
Decil 0.9–1.0: cuántos u cayeron entre 0.9 y 1.0
```

La **línea punteada amarilla** marca la frecuencia esperada si el generador fuera perfectamente uniforme (`n / 10` por decil).

**Cómo interpretarlo**:

| Patrón en el histograma | Significado |
|------------------------|-------------|
| Barras todas iguales y pegadas a la línea | ✅ Generador con excelente uniformidad |
| Barras con pequeñas variaciones | ✅ Normal, es muestreo estadístico |
| 1–3 deciles muy diferentes al resto | ⚠️ Generador con sesgos. Revisar `(a, c, m)` |
| Varios deciles en 0 (barras vacías) | ❌ Período muy corto. El generador cicló. Cambiar parámetros |

**Panel estadístico adicional** (a la derecha del histograma):

| Estadístico | Significado |
|------------|-------------|
| Cantidad (n) | Total de u consumidos en la simulación |
| Media muestral | Promedio de todos los u. Si el generador es uniforme, debe aproximarse a 0.5 |
| Media esperada | Siempre 0.5000 para U(0,1) |
| Mínimo / Máximo | Extremos de la muestra |
| Frec. esperada / decil | n/10 — frecuencia teórica por canasto |
| Desvío máx. vs esperado | El canasto más alejado de la frecuencia esperada |

---

## 7. Tablas del simulador

### 7.1 Tabla de distribución de tipos de equipo

Definida en `src/simulation/distribution.js`:

```javascript
const TABLA_TIPO_DISPOSITIVO = [
  { value: 1, label: 'Servidor (Rack/Blade)',      cumulative: 0.25 },
  { value: 2, label: 'Switch / Router Industrial', cumulative: 0.70 },
  { value: 3, label: 'Equipo de Red Hogareño',     cumulative: 1.00 },
]
```

Funciona por **inversión de la FDA**: si u ≤ 0.25 → Servidor; si 0.25 < u ≤ 0.70 → Switch; si u > 0.70 → Hogareño.

### 7.2 Tabla de destino del equipo

```javascript
const TABLA_DESTINO = [
  { value: 'EF', label: 'Reutilización (Funcional)',  cumulative: 0.10 },
  { value: 'ED', label: 'Desarme',                    cumulative: 0.85 },
  { value: 'EI', label: 'Disposición Final',          cumulative: 1.00 },
]
```

### 7.3 Tabla de eficacia del procesamiento

```javascript
const TABLA_EFICACIA = [
  { value: 'OK',        label: 'Procesado Correctamente',    cumulative: 0.9905 },
  { value: 'INCIDENTE', label: 'Incidente de Contaminación', cumulative: 1.0000 },
]
```

### 7.4 Tabla de agua evitada por tipo

```javascript
const AGUA_POR_TIPO = {
  1: 50000,  // Servidor: 50.000 litros
  2: 15000,  // Switch/Router: 15.000 litros
  3: 3000,   // Hogareño: 3.000 litros
}
```

Solo se contabilizan si `eficacia === 'OK'`.

---

## 8. Umbrales de decisión

La simulación evalúa tres umbrales al finalizar los 30 días:

| Condición | Umbral | Acción recomendada |
|-----------|--------|-------------------|
| `TTR_hs > 160` | Tiempo total de recepción > 160 hs/mes | Incorporar nuevo recepcionista |
| `TT_hs > 160` | Tiempo total operativo (diagnóstico + desarme) > 160 hs/mes | Incorporar nuevo operario |
| `TEP > 800` | Más de 800 equipos procesados en el mes | Habilitar segundo turno o convenio externo |

Estos umbrales representan aproximadamente la capacidad de un empleado de tiempo completo (160 horas mensuales = 8 hs/día × 20 días hábiles).

---

## 9. Instalación y ejecución local

### Backend

```bash
cd PF-G04-4K3-PF-Backend
npm install
npm run dev          # Inicia en http://localhost:3001
```

### Frontend

```bash
cd PF-G04-4K3-PF-Frontend
npm install
npm run dev          # Inicia en http://localhost:5173
```


## Stack tecnológico

### Frontend
- **React 19** + **Vite 8**
- **Chart.js** (gráficos de líneas, barras e histograma)
- **Recharts** (gráficos de eficacia operativa)
- **Lucide React** (iconografía)
- **CSS Modules** + variables CSS globales

### Backend
- **Express 5**
- **Babel** (transpilación ES Modules)
- **Nodemon** (desarrollo)
- **CORS** abierto (API pública sin datos sensibles)

---

*Proyecto Final — Simulación · Grupo 04 · 4K3*
