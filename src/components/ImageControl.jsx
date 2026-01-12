import React from 'react';

function ImageControl({
  uploadLabel,
  urlLabel,
  zoomLabel,
  cropXLabel = 'Crop Horizontal',
  cropYLabel = 'Crop Vertical',
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
  onFieldChange
}) {
  return (
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
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2">Enviando imagem...</p>
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
            {cropXLabel}
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
            {cropYLabel}
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
  );
}

export default ImageControl;
