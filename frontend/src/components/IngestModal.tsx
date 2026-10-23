import { useState, useEffect } from 'react';
import { UploadCloud, Key, X, ArrowRight } from 'lucide-react';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractionReady: (rawText: string, extraction: any) => void;
  apiBaseUrl: string;
}

export const IngestModal: React.FC<IngestModalProps> = ({
  isOpen,
  onClose,
  onExtractionReady,
  apiBaseUrl
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('samples');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-1');
  
  // Optional custom API keys
  const [customOpenAIKey, setCustomOpenAIKey] = useState<string>('');
  const [customSerpKey, setCustomSerpKey] = useState<string>('');
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rejectedTender, setRejectedTender] = useState<{ category: string; reason: string } | null>(null);

  // Fetch samples on open
  useEffect(() => {
    if (isOpen) {
      fetch(`${apiBaseUrl}/api/samples`)
        .then((res) => res.json())
        .then((data) => setSamples(data))
        .catch((err) => console.error('Failed to load samples:', err));
    }
  }, [isOpen, apiBaseUrl]);

  if (!isOpen) return null;

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a tender PDF document to upload.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (customOpenAIKey) {
      formData.append('custom_openai_key', customOpenAIKey);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/extract/pdf`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to process tender PDF');
      }
      const data = await response.json();
      const classification = data.extraction?.classification;
      if (classification && !classification.is_civil_infrastructure) {
        setRejectedTender({
          category: classification.category,
          reason: classification.rejection_reason || 'Non-civil document excluded from RoW grid.'
        });
      } else {
        setRejectedTender(null);
        onExtractionReady(data.raw_text, data.extraction);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while extracting PDF data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (textToProcess: string) => {
    if (!textToProcess.trim()) {
      setErrorMessage('Tender text cannot be blank.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/extract/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: textToProcess,
          custom_openai_key: customOpenAIKey || null
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to parse tender text');
      }
      const data = await response.json();
      const classification = data.extraction?.classification;
      if (classification && !classification.is_civil_infrastructure) {
        setRejectedTender({
          category: classification.category,
          reason: classification.rejection_reason || 'Non-civil document excluded from RoW grid.'
        });
      } else {
        setRejectedTender(null);
        onExtractionReady(data.raw_text, data.extraction);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error parsing text snippet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessSample = () => {
    const selected = samples.find((s) => s.id === selectedSampleId);
    if (selected) {
      handleTextSubmit(selected.text);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #334155',
          borderRadius: '2px',
          width: '100%',
          maxWidth: '680px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            color: '#ffffff'
          }}
        >
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Ingest Document</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Upload statutory notices, paste circulars, or select municipal sample data.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('samples')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'samples' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'samples' ? '2px solid #0f172a' : '2px solid transparent'
            }}
          >
            Official Samples
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'upload' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'upload' ? '2px solid #0f172a' : '2px solid transparent'
            }}
          >
            Upload PDF
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'paste' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'paste' ? '2px solid #0f172a' : '2px solid transparent'
            }}
          >
            Paste Text Snippet
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '20px' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '10px 14px',
                fontSize: '12px',
                borderRadius: '2px',
                marginBottom: '16px'
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Gatekeeper Rejection Banner */}
          {rejectedTender && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '2px solid #f59e0b',
                borderRadius: '2px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{
                backgroundColor: '#fef3c7',
                borderRadius: '50%',
                padding: '6px',
                flexShrink: 0,
                fontSize: '16px',
                lineHeight: 1
              }}>⚠️</div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#92400e', letterSpacing: '0.05em', marginBottom: '3px' }}>
                  Non-Civil Tender: {rejectedTender.category.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#78350f', marginBottom: '4px' }}>
                  {rejectedTender.reason}
                </div>
                <div style={{ fontSize: '11px', color: '#92400e' }}>
                  Skipped from RoW Spatial Grid. No map entry created.
                </div>
                <button
                  onClick={() => setRejectedTender(null)}
                  style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#92400e',
                    background: 'none',
                    border: '1px solid #f59e0b',
                    borderRadius: '2px',
                    padding: '3px 10px',
                    cursor: 'pointer'
                  }}
                >
                  Dismiss & Try Another Document
                </button>
              </div>
            </div>
          )}

          {activeTab === 'samples' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                Select Municipal Tender Notice:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {samples.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSampleId(s.id)}
                    style={{
                      padding: '12px 14px',
                      border: selectedSampleId === s.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
                      backgroundColor: selectedSampleId === s.id ? '#f8fafc' : '#ffffff',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {s.agency} &bull; {s.corridor} ({s.start} &rarr; {s.end})
                      </div>
                    </div>
                    <span className="badge badge-pipeline">{s.type}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleProcessSample}
                  disabled={isLoading}
                >
                  <ArrowRight size={16} />
                  {isLoading ? 'Extracting Parameters...' : 'Ingest Document'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '2px',
                  padding: '32px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('pdf-file-input')?.click()}
              >
                <UploadCloud size={32} color="#475569" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {selectedFile ? selectedFile.name : 'Click to select municipal tender PDF'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Parsed via backend pdfplumber text stream reader
                </div>
                <input
                  id="pdf-file-input"
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isLoading}
                >
                  <ArrowRight size={16} />
                  {isLoading ? 'Extracting via pdfplumber...' : 'Ingest Document'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                  Raw Tender Text or Official Letter:
                </label>
                <textarea
                  className="input-box"
                  rows={8}
                  placeholder="Paste government letter or procurement circular here..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleTextSubmit(pastedText)}
                  disabled={!pastedText.trim() || isLoading}
                >
                  <ArrowRight size={16} />
                  {isLoading ? 'Extracting Parameters...' : 'Ingest Document'}
                </button>
              </div>
            </div>
          )}

          {/* Optional API Key Configuration Accordion */}
          <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <button
              type="button"
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Key size={14} />
              {showKeyConfig ? 'Hide API Configuration' : 'Optional: Provide Live OpenAI / SERP API Keys'}
            </button>

            {showKeyConfig && (
              <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#f8fafc', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '2px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>
                    OpenAI API Key (gpt-4o-mini credits)
                  </label>
                  <input
                    type="password"
                    className="input-box"
                    placeholder="sk-..."
                    value={customOpenAIKey}
                    onChange={(e) => setCustomOpenAIKey(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>
                    SERP API Key (Google Maps credits fallback)
                  </label>
                  <input
                    type="password"
                    className="input-box"
                    placeholder="serpapi key..."
                    value={customSerpKey}
                    onChange={(e) => setCustomSerpKey(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
