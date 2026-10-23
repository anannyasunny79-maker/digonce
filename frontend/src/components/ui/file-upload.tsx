import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onChange: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  accept = '.pdf',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;
      const arr = Array.from(files);
      setSelectedFile(arr[0]);
      onChange(arr);
    },
    [onChange, disabled]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        width: '100%',
        minHeight: '160px',
        border: `1.5px dashed ${isDragging ? 'rgba(148, 163, 184, 0.7)' : 'rgba(51, 65, 85, 0.8)'}`,
        borderRadius: '4px',
        backgroundColor: isDragging
          ? 'rgba(30, 41, 59, 0.6)'
          : 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        padding: '28px 24px',
        gap: '12px',
        position: 'relative',
        backdropFilter: 'blur(4px)',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {selectedFile ? (
        <>
          <div
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={22} color="#94a3b8" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
              {selectedFile.name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              {(selectedFile.size / 1024).toFixed(1)} KB • PDF Tender Document
            </div>
          </div>
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              borderRadius: '3px',
              padding: '3px 5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={13} color="#94a3b8" />
          </button>
        </>
      ) : (
        <>
          {/* Upload icon with animated ring when dragging */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: `1.5px solid ${isDragging ? 'rgba(148,163,184,0.5)' : 'rgba(51,65,85,0.7)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
            }}
          >
            <Upload size={20} color={isDragging ? '#94a3b8' : '#475569'} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>
              {isDragging ? 'Release to upload tender document' : 'Drop PWD / KWA / KSEB Tender PDF here'}
            </div>
            <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
              or{' '}
              <span style={{ color: '#94a3b8', textDecoration: 'underline' }}>
                click to browse
              </span>
              {' '}· PDF format · max 20MB
            </div>
          </div>

          {/* Supported types hint */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {['PWD Circular', 'KWA Tender', 'KSEB RoW Notice', 'KMC Work Order'].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '10px',
                  color: '#475569',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  padding: '2px 7px',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
