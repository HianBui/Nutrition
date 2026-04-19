import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { analyzeFood } from '../services/api'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/translations'

function CameraModal({ onCapture, onClose, t }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [flash, setFlash] = useState(false)
  const [camError, setCamError] = useState(null)

  const startCamera = async (mode) => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setReady(true)
      }
      setCamError(null)
    } catch {
      setCamError(t('fa_camera_error'))
    }
  }

  useEffect(() => {
    startCamera(facingMode)
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(tr => tr.stop()) }
  }, [facingMode])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
      onCapture(file, URL.createObjectURL(blob))
    }, 'image/jpeg', 0.92)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {flash && <div style={{ position: 'absolute', inset: 0, background: 'white', opacity: 0.7, zIndex: 10, pointerEvents: 'none' }} />}

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
        <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>{t('fa_camera_header')}</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
        {camError ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#FCA5A5' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠</div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{camError}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: 'var(--radius-lg)', display: 'block', opacity: ready ? 1 : 0, transition: 'opacity 0.3s' }} />
            {!ready && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white' }} />
              </div>
            )}
            {ready && (
              <div style={{ position: 'absolute', inset: 20, pointerEvents: 'none' }}>
                {[{ top:0,left:0,borderTop:'2px solid white',borderLeft:'2px solid white' }, { top:0,right:0,borderTop:'2px solid white',borderRight:'2px solid white' }, { bottom:0,left:0,borderBottom:'2px solid white',borderLeft:'2px solid white' }, { bottom:0,right:0,borderBottom:'2px solid white',borderRight:'2px solid white' }].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 32px 36px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <button onClick={() => { setReady(false); setFacingMode(f => f === 'environment' ? 'user' : 'environment') }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 48, height: 48, borderRadius: '50%', cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⟳</button>
        <button onClick={handleCapture} disabled={!ready || !!camError} style={{ width: 72, height: 72, borderRadius: '50%', background: ready && !camError ? 'white' : 'rgba(255,255,255,0.3)', border: '4px solid rgba(255,255,255,0.4)', cursor: ready && !camError ? 'pointer' : 'not-allowed', transition: 'transform 0.1s', boxShadow: '0 0 0 2px rgba(255,255,255,0.2)' }} onMouseDown={e => e.currentTarget.style.transform='scale(0.92)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'} />
        <div style={{ width: 48 }} />
      </div>
    </div>
  )
}

export default function FoodAnalyzer() {
  const { lang } = useApp()
  const t = useT(lang)

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [inputMode, setInputMode] = useState('upload')

  const setImageFile = (file, previewUrl) => {
    setImage(file)
    setPreview(previewUrl || URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }

  const onDrop = useCallback((files) => {
    const file = files[0]
    if (file) setImageFile(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 })

  const handleAnalyze = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    try {
      const data = await analyzeFood(image)
      setResult(data.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setImage(null); setPreview(null); setResult(null); setError(null) }

  const radarData = result?.macros ? [
    { nutrient: t('fa_protein'), value: result.macros.protein },
    { nutrient: t('fa_carbs'), value: result.macros.carbs },
    { nutrient: t('fa_fat'), value: result.macros.fat },
    { nutrient: t('fa_fiber'), value: result.macros.fiber },
  ] : []

  const MACROS = [
    { key: 'protein', labelKey: 'fa_protein', color: '#3B82F6' },
    { key: 'carbs', labelKey: 'fa_carbs', color: '#F59E0B' },
    { key: 'fat', labelKey: 'fa_fat', color: '#EF4444' },
    { key: 'fiber', labelKey: 'fa_fiber', color: '#10B981' },
  ]

  return (
    <div>
      {showCamera && <CameraModal onCapture={(f, u) => { setImageFile(f, u); setShowCamera(false) }} onClose={() => setShowCamera(false)} t={t} />}

      <div className="page-header">
        <h2 className="section-title">{t('fa_title')}</h2>
        <p className="section-subtitle">{t('fa_subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr 1fr' : 'min(560px, 100%) 1fr', gap: 24 }} className="fa-layout">
        <div>
          {/* Tab toggle */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'var(--stone-100)', borderRadius: 'var(--radius-md)', padding: 4 }}>
            {[{ mode: 'upload', key: 'fa_tab_upload' }, { mode: 'camera', key: 'fa_tab_camera' }].map(({ mode, key }) => (
              <button key={mode} onClick={() => setInputMode(mode)} style={{ flex: 1, padding: '9px 0', borderRadius: 'calc(var(--radius-md) - 2px)', border: 'none', background: inputMode === mode ? 'var(--white)' : 'transparent', color: inputMode === mode ? 'var(--green-800)' : 'var(--stone-500)', fontWeight: inputMode === mode ? 600 : 400, fontSize: '0.88rem', cursor: 'pointer', boxShadow: inputMode === mode ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}>
                {t(key)}
              </button>
            ))}
          </div>

          {inputMode === 'upload' && (
            <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? 'var(--green-600)' : 'var(--stone-300)'}`, borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'var(--green-50)' : 'var(--white)', transition: 'all 0.2s', marginBottom: 16 }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: '2.2rem', marginBottom: 10, color: 'var(--green-600)' }}>◎</div>
              <p style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.95rem' }}>{isDragActive ? t('fa_drop_active') : t('fa_drop_idle')}</p>
              <p style={{ color: 'var(--stone-400)', fontSize: '0.82rem' }}>{t('fa_drop_hint')}</p>
            </div>
          )}

          {inputMode === 'camera' && (
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setShowCamera(true)} style={{ width: '100%', padding: '40px 24px', border: '2px dashed var(--stone-300)', borderRadius: 'var(--radius-lg)', background: 'var(--white)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-600)'; e.currentTarget.style.background = 'var(--green-50)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--stone-300)'; e.currentTarget.style.background = 'var(--white)' }}>
                <div style={{ fontSize: '2.4rem', marginBottom: 10, color: 'var(--green-600)' }}>◉</div>
                <p style={{ fontWeight: 600, color: 'var(--stone-700)', marginBottom: 4, fontSize: '0.95rem' }}>{t('fa_camera_open')}</p>
                <p style={{ color: 'var(--stone-400)', fontSize: '0.82rem' }}>{t('fa_camera_hint')}</p>
              </button>
            </div>
          )}

          {preview && (
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <img src={preview} alt="preview" style={{ width: '100%', borderRadius: 'var(--radius-lg)', maxHeight: 260, objectFit: 'cover', display: 'block', boxShadow: 'var(--shadow-md)' }} />
              <button onClick={handleReset} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: '3px 10px', color: 'white', fontSize: '0.72rem' }}>{image?.name || 'camera-capture.jpg'}</div>
            </div>
          )}

          <button className="btn-primary" onClick={handleAnalyze} disabled={!image || loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? t('fa_btn_analyzing') : t('fa_btn_analyze')}
          </button>

          {error && <div style={{ marginTop: 12, padding: '12px 16px', background: '#FEF2F2', borderRadius: 'var(--radius-sm)', color: '#B91C1C', fontSize: '0.88rem' }}>{error}</div>}
          {loading && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <div className="loading-spinner" />
              <p style={{ color: 'var(--stone-500)', fontSize: '0.88rem', marginTop: 10 }}>{t('fa_ai_reading')}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 4 }}>{result.dish_name}</h3>
                  <p style={{ color: 'var(--stone-500)', fontSize: '0.88rem' }}>{result.serving_size}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--green-800)' }}>{result.calories}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('fa_kcal')}</div>
                </div>
              </div>

              <div className="grid-4" style={{ marginBottom: 16 }}>
                {MACROS.map(m => (
                  <div key={m.key} style={{ textAlign: 'center', padding: '10px', background: 'var(--stone-50)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{result.macros?.[m.key]}g</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--stone-500)', textTransform: 'uppercase' }}>{t(m.labelKey)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {result.health_tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--stone-500)' }}>{t('fa_health_score')}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--stone-100)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${result.health_score}%`, height: '100%', background: 'var(--green-600)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-700)' }}>{result.health_score}/100</span>
              </div>
            </div>

            {radarData.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h4 style={{ fontWeight: 600, marginBottom: 12 }}>{t('fa_macro_dist')}</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="nutrient" tick={{ fontSize: 11 }} />
                    <Radar dataKey="value" fill="var(--green-600)" fillOpacity={0.25} stroke="var(--green-600)" />
                    <Tooltip formatter={(v) => [`${v}g`]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="card">
              <h4 style={{ fontWeight: 600, marginBottom: 10 }}>{t('fa_tips')}</h4>
              {result.tips?.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--stone-700)', lineHeight: 1.5 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
