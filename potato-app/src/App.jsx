import { useState, useRef, useCallback } from 'react'

// ── disease metadata ──────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const CLASS_META = {
  Potato___Early_blight: {
    label: 'Early Blight',
    icon: '🍂',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    bar: 'from-amber-400 to-orange-400',
    ring: 'ring-amber-500/40',
    description:
      'Caused by the fungus Alternaria solani. Appears as dark brown spots with concentric rings on older leaves. Manage with fungicide sprays and crop rotation.',
  },
  Potato___Late_blight: {
    label: 'Late Blight',
    icon: '☠️',
    gradient: 'from-red-500 to-rose-600',
    glow: 'shadow-red-500/30',
    badge: 'bg-red-500/20 text-red-300 border border-red-500/30',
    bar: 'from-red-400 to-rose-500',
    ring: 'ring-red-500/40',
    description:
      'Caused by Phytophthora infestans — the pathogen behind the Irish Famine. Water-soaked lesions that turn brown/black rapidly. Act immediately with fungicides.',
  },
  Potato___healthy: {
    label: 'Healthy',
    icon: '✅',
    gradient: 'from-emerald-400 to-green-500',
    glow: 'shadow-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    bar: 'from-emerald-400 to-green-400',
    ring: 'ring-emerald-500/40',
    description:
      'No disease detected. Your potato plant looks healthy! Continue regular monitoring and good agricultural practices.',
  },
}

function getMeta(raw) {
  return CLASS_META[raw] ?? {
    label: raw,
    icon: '❓',
    gradient: 'from-gray-400 to-gray-500',
    glow: 'shadow-gray-500/20',
    badge: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
    bar: 'from-gray-400 to-gray-500',
    ring: 'ring-gray-500/30',
    description: 'Unknown classification returned by the model.',
  }
}

// ── components ────────────────────────────────────────────────────────────────

function ConfidenceBar({ value, barClass }) {
  const pct = Math.round(value * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-semibold text-white/60 mb-2 uppercase tracking-widest">
        <span>Confidence</span>
        <span className="text-white font-bold text-sm">{pct}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full bg-gradient-to-r ${barClass} transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

function ResultCard({ result }) {
  const meta = getMeta(result.class)
  return (
    <div className={`animate-fadeSlideUp glass rounded-3xl p-6 ring-2 ${meta.ring} shadow-2xl ${meta.glow}`}>
      {/* top row */}
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-0.5">Diagnosis</p>
          <h2 className="text-2xl font-extrabold text-white leading-tight">{meta.label}</h2>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${meta.badge}`}>
          {result.class.replace('Potato___', '').replace(/_/g, ' ')}
        </span>
      </div>

      <ConfidenceBar value={result.confidence} barClass={meta.bar} />

      <p className="mt-5 text-sm text-white/60 leading-relaxed border-t border-white/10 pt-4">
        {meta.description}
      </p>
    </div>
  )
}

function UploadZone({ onFile, isDragging, setIsDragging }) {
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) onFile(file)
  }, [onFile, setIsDragging])

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleChange = (e) => { const f = e.target.files?.[0]; if (f) onFile(f) }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload potato leaf image"
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      className={`cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 py-14 px-8 select-none
        ${isDragging
          ? 'border-emerald-400 bg-emerald-500/10 scale-[1.02] shadow-lg shadow-emerald-500/20'
          : 'border-white/15 glass hover:border-emerald-500/50 hover:bg-emerald-500/5'
        }`}
    >
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30 ${isDragging ? '' : 'animate-float'}`}>
        🥔
      </div>
      <div className="text-center">
        <p className="font-bold text-white text-base">Drop a potato leaf image here</p>
        <p className="text-sm text-white/40 mt-1">
          or <span className="text-emerald-400 underline underline-offset-2 cursor-pointer">click to browse</span>
        </p>
        <p className="text-xs text-white/25 mt-2 tracking-wide">PNG · JPG · WEBP</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} aria-hidden="true" />
    </div>
  )
}

// ── legend item ───────────────────────────────────────────────────────────────

function LegendItem({ meta, name }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-base shadow-md flex-shrink-0`}>
        {meta.icon}
      </div>
      <span className="text-sm font-semibold text-white/80">{meta.label}</span>
      <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>
        {name === 'Potato___healthy' ? 'Healthy' : 'Disease'}
      </span>
    </div>
  )
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [image, setImage]     = useState(null)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file) => {
    setResult(null); setError(null)
    setImage({ file, url: URL.createObjectURL(file) })
  }, [])

  const handlePredict = async () => {
    if (!image) return
    setLoading(true); setError(null); setResult(null)
    try {
      const form = new FormData()
      form.append('file', image.file)
      const res = await fetch(`${API_BASE}/predict`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setResult(await res.json())
    } catch (err) {
      setError(err.message || 'Something went wrong. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setImage(null); setResult(null); setError(null) }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at 20% 0%, #0d2e1a 0%, #0a1a0a 50%, #050d05 100%)' }}>

      {/* ── decorative blobs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-green-400/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-teal-500/8 rounded-full blur-3xl" />
      </div>

      {/* ── header ── */}
      <header className="relative z-10 border-b border-white/8" style={{ background: 'rgba(10,26,10,0.7)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30 flex-shrink-0">
            🥔
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white leading-tight tracking-tight">
              Potato Health Detector
            </h1>
            <p className="text-xs text-emerald-400/70 font-medium tracking-wide">CNN-powered leaf disease detection</p>
          </div>
        </div>
      </header>

      {/* ── hero strip ── */}
      <div className="relative z-10 border-b border-white/5" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.04) 100%)' }}>
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2 text-glow">
            Detect Potato Leaf Disease
          </h2>
          <p className="text-white/45 text-sm max-w-md mx-auto leading-relaxed">
            Upload a photo of a potato leaf and our CNN model will instantly classify it as Early Blight, Late Blight, or Healthy.
          </p>
        </div>
      </div>

      {/* ── main content ── */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* upload card */}
        <div className="glass rounded-3xl p-6 glow-green">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/70 mb-4">
            Step 1 — Upload Image
          </h3>

          {!image ? (
            <UploadZone onFile={handleFile} isDragging={isDragging} setIsDragging={setIsDragging} />
          ) : (
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-xl">
              <img src={image.url} alt="Uploaded potato leaf" className="w-full object-cover max-h-72" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 bg-black/50 hover:bg-red-500/80 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-200 backdrop-blur-sm text-sm"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          )}

          {image && (
            <button
              onClick={handlePredict}
              disabled={loading}
              className="mt-4 w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
              style={{
                background: loading
                  ? 'rgba(16,185,129,0.4)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing leaf…
                </>
              ) : (
                <> 🔍 &nbsp;Analyze Leaf </>
              )}
            </button>
          )}

          {error && (
            <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 flex gap-2 items-start">
              <span className="mt-0.5 flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* result card */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/70 mb-4">
            Step 2 — Diagnosis Result
          </h3>

          {result ? (
            <ResultCard result={result} />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 py-12 flex flex-col items-center justify-center gap-3 text-center">
              <span className="text-5xl opacity-20 select-none">🌿</span>
              <p className="text-white/30 text-sm">
                Upload an image and click <span className="text-white/50 font-semibold">Analyze Leaf</span> to see results
              </p>
            </div>
          )}
        </div>

        {/* legend card */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/70 mb-3">
            Detectable Conditions
          </h3>
          <div className="divide-y divide-white/5">
            {Object.entries(CLASS_META).map(([key, meta]) => (
              <LegendItem key={key} meta={meta} name={key} />
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
