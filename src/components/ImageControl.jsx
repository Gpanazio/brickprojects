import React, { useState } from 'react';
import { buildImageStyle } from '../utils/styleUtils.js';

function ImagePreview({
  urlValue,
  zoomValue,
  offsetXValue,
  offsetYValue,
  previewClassName
}) {
  return (
    <div className={`relative w-full bg-zinc-900 border border-zinc-800 overflow-hidden ${previewClassName}`}>
      {urlValue ? (
        <div
          className="absolute inset-0 bg-cover transition-all duration-700"
          style={buildImageStyle(urlValue, zoomValue, offsetXValue, offsetYValue)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-700 text-[10px] uppercase tracking-widest">
          Sem imagem definida
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

function ImageEditModal({
  title,
  uploadLabel,
  urlLabel,
  zoomLabel,
  urlField,
  zoomField,
  offsetXField,
  offsetYField,
  urlValue,
  zoomValue,
  offsetXValue,
  offsetYValue,
  placeholder,
  previewClassName,
  uploading,
  onFileUpload,
  onFieldChange,
  onClose
}) {
  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-editor-title"
    >
      <div className="min-h-screen flex items-start justify-center p-4 py-12">
        <div className="bg-black border border-zinc-800 w-full max-w-3xl shadow-2xl">
          <div className="border-b border-zinc-800 p-6 flex justify-between items-center sticky top-0 bg-black z-10">
            <div className="flex flex-col">
              <span className="text-red-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
                Edição
              </span>
              <h3 id="image-editor-title" className="text-2xl font-black text-white uppercase tracking-tighter">
                {title || uploadLabel}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <span className="text-xl" aria-hidden="true">
                ×
              </span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <ImagePreview
              urlValue={urlValue}
              zoomValue={zoomValue}
              offsetXValue={offsetXValue}
              offsetYValue={offsetYValue}
              previewClassName={previewClassName}
            />

            <div className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  {uploadLabel}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileUpload(e.target.files?.[0])}
                  className="w-full bg-black border border-zinc-800 text-zinc-400 px-4 py-3 focus:outline-none focus:border-red-600 transition-colors file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-zinc-900 file:text-zinc-300 file:uppercase file:text-[10px] file:tracking-widest"
                />
                {uploading && (
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2">
                    Enviando imagem...
                  </p>
                )}
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  {urlLabel}
                </label>
                <input
                  type="text"
                  name={urlField}
                  value={urlValue}
                  onChange={onFieldChange}
                  placeholder={placeholder}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">
                    {zoomLabel}
                  </label>
                  <input
                    type="range"
                    name={zoomField}
                    min="-50"
                    max="50"
                    value={zoomValue}
                    onChange={onFieldChange}
                    className="w-full accent-red-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">
                    Recorte Horizontal
                  </label>
                  <input
                    type="range"
                    name={offsetXField}
                    min="-50"
                    max="50"
                    value={offsetXValue}
                    onChange={onFieldChange}
                    className="w-full accent-red-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">
                    Recorte Vertical
                  </label>
                  <input
                    type="range"
                    name={offsetYField}
                    min="-50"
                    max="50"
                    value={offsetYValue}
                    onChange={onFieldChange}
                    className="w-full accent-red-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageControl({
  title,
  uploadLabel,
  urlLabel,
  zoomLabel,
  urlField,
  zoomField,
  offsetXField,
  offsetYField,
  urlValue,
  zoomValue,
  offsetXValue,
  offsetYValue,
  placeholder,
  uploading,
  onFileUpload,
  onFieldChange,
  previewClassName = 'aspect-video'
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-zinc-400 text-xs uppercase tracking-widest font-bold">
          {title || uploadLabel}
        </label>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          Editar imagem
        </button>
      </div>
      <ImagePreview
        urlValue={urlValue}
        zoomValue={zoomValue}
        offsetXValue={offsetXValue}
        offsetYValue={offsetYValue}
        previewClassName={previewClassName}
      />

      {isEditing && (
        <ImageEditModal
          title={title}
          uploadLabel={uploadLabel}
          urlLabel={urlLabel}
          zoomLabel={zoomLabel}
          urlField={urlField}
          zoomField={zoomField}
          offsetXField={offsetXField}
          offsetYField={offsetYField}
          urlValue={urlValue}
          zoomValue={zoomValue}
          offsetXValue={offsetXValue}
          offsetYValue={offsetYValue}
          placeholder={placeholder}
          previewClassName={previewClassName}
          uploading={uploading}
          onFileUpload={onFileUpload}
          onFieldChange={onFieldChange}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

export default ImageControl;
