import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, LogOut, Save, X, Eye, GripVertical, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

// Componente de Formulário de Projeto
function ProjectForm({ project, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    genre: '',
    format: '',
    status: '',
    description: '',
    long_description: '',
    video_label: '',
    bg_image: '',
    monolith_image: '',
    bg_position_x: 50,
    bg_position_y: 50,
    bg_zoom: 0,
    monolith_position_x: 50,
    monolith_position_y: 50,
    monolith_zoom: 0,
    vimeo_id: '',
    vimeo_hash: '',
    pdf_url: '',
    host: '',
    display_order: 0,
    ...project
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingField, setUploadingField] = useState(null);

  const token = localStorage.getItem('adminToken');

  const getImageStyle = (imageUrl, positionX, positionY, zoom) => ({
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: `${positionX}% ${positionY}%`,
    backgroundSize: `calc(100% + ${zoom}%)`
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRangeChange = (name) => (e) => {
    const value = Number(e.target.value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;
    setUploadingField(type);
    setError('');

    try {
      const payload = new FormData();
      payload.append('file', file);

      const response = await fetch(`${API_URL}/api/projects/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      const data = await response.json();
      const updates = {
        bg: { bg_image: data.fileUrl },
        monolith: { monolith_image: data.fileUrl },
        pdf: { pdf_url: data.fileUrl }
      };

      setFormData(prev => ({ ...prev, ...updates[type] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 py-12">
        <div className="bg-black border border-zinc-800 w-full max-w-4xl shadow-2xl">
          {/* Header */}
          <div className="border-b border-zinc-800 p-8 flex justify-between items-center sticky top-0 bg-black z-10">
            <div className="flex flex-col">
              <span className="text-red-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">Criação</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {project ? 'Editar Projeto' : 'Novo Projeto'}
              </h2>
            </div>
            <button onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Real-time Preview Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8 border-b border-zinc-900">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-bold text-[10px] uppercase tracking-[0.3em]">Preview: Imagem de Fundo (Background)</span>
                </div>
                <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  {/* BG Image Preview */}
                  {formData.bg_image && (
                    <div 
                      className="absolute inset-0 bg-no-repeat opacity-30 grayscale transition-all duration-700"
                      style={getImageStyle(formData.bg_image, formData.bg_position_x, formData.bg_position_y, formData.bg_zoom)}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                  
                  {/* Content Preview */}
                  <div className="relative z-10 h-full flex flex-col justify-center p-8">
                    <span className="text-red-600 text-[8px] font-bold uppercase tracking-[0.2em] mb-2">{formData.category || 'CATEGORIA'}</span>
                    <h2 className="text-2xl font-black text-white uppercase leading-tight mb-2 truncate">{formData.title || 'TÍTULO DO PROJETO'}</h2>
                    <p className="text-zinc-500 text-[10px] max-w-[250px] line-clamp-2 mb-4 italic">{formData.description || 'Sua descrição curta aparecerá aqui...'}</p>
                    <div className="w-24 h-8 bg-white/10 border border-white/20 flex items-center justify-center">
                      <span className="text-[8px] font-black uppercase text-white tracking-widest">VER AGORA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monolith Preview */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex justify-center">
                  <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em]">Preview: Monolito (Thumbnail)</span>
                </div>
                <div className="relative aspect-[1/2] w-full max-w-[150px] mx-auto bg-zinc-900 border-2 border-red-600/30 overflow-hidden shadow-2xl shadow-red-600/5">
                  {formData.monolith_image ? (
                    <div 
                      className="absolute inset-0 bg-no-repeat transition-all duration-700"
                      style={getImageStyle(formData.monolith_image, formData.monolith_position_x, formData.monolith_position_y, formData.monolith_zoom)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-800 text-[10px] uppercase tracking-tighter text-center px-4">
                      Sem Imagem Vertical
                    </div>
                  )}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Categoria *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="ex: Documentário, Reality, Factual"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
              </div>

              {/* Gênero */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Gênero *
                </label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="ex: Esportes / Mistério"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
              </div>

              {/* Formato */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Formato *
                </label>
                <input
                  type="text"
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  placeholder="ex: 8 episódios de 26 min"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Status *
                </label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="ex: Em Desenvolvimento"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
              </div>

              {/* Descrição Curta */}
              <div className="md:col-span-2">
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Descrição Curta *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors resize-none"
                  required
                />
              </div>

              {/* Descrição Longa */}
              <div className="md:col-span-2">
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Descrição Longa *
                </label>
                <textarea
                  name="long_description"
                  value={formData.long_description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors resize-none"
                  required
                />
              </div>

              {/* Apresentador */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Apresentador/Host
                </label>
                <input
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              {/* Label do Vídeo */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Label do Botão
                </label>
                <input
                  type="text"
                  name="video_label"
                  value={formData.video_label}
                  onChange={handleChange}
                  placeholder="ex: Ver Teaser"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              {/* Imagem de Fundo */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Imagem de Fundo (URL)
                </label>
                <input
                  type="text"
                  name="bg_image"
                  value={formData.bg_image}
                  onChange={handleChange}
                  placeholder="/assets/imagem.webp"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                />
                <div className="mt-3">
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2 font-bold">
                    Upload de Background
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('bg', e.target.files?.[0])}
                    className="w-full text-zinc-400 text-xs file:bg-zinc-900 file:text-zinc-200 file:border-0 file:px-3 file:py-2 file:uppercase file:tracking-widest file:font-bold file:mr-3"
                  />
                  {uploadingField === 'bg' && (
                    <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Enviando imagem...</p>
                  )}
                </div>
              </div>

              {/* Imagem Monolito */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Imagem Monolito (URL)
                </label>
                <input
                  type="text"
                  name="monolith_image"
                  value={formData.monolith_image}
                  onChange={handleChange}
                  placeholder="/assets/imagem-vertical.webp"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                />
                <div className="mt-3">
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2 font-bold">
                    Upload de Monolito
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('monolith', e.target.files?.[0])}
                    className="w-full text-zinc-400 text-xs file:bg-zinc-900 file:text-zinc-200 file:border-0 file:px-3 file:py-2 file:uppercase file:tracking-widest file:font-bold file:mr-3"
                  />
                  {uploadingField === 'monolith' && (
                    <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Enviando imagem...</p>
                  )}
                </div>
              </div>

              {/* Vimeo ID */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Vimeo ID
                </label>
                <input
                  type="text"
                  name="vimeo_id"
                  value={formData.vimeo_id}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              {/* Vimeo Hash */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Vimeo Hash
                </label>
                <input
                  type="text"
                  name="vimeo_hash"
                  value={formData.vimeo_hash}
                  onChange={handleChange}
                  placeholder="abc123def456"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              {/* PDF URL */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  PDF URL
                </label>
                <input
                  type="text"
                  name="pdf_url"
                  value={formData.pdf_url}
                  onChange={handleChange}
                  placeholder="/projetos/pitch.pdf"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                />
                <div className="mt-3">
                  <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2 font-bold">
                    Upload de PDF
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileUpload('pdf', e.target.files?.[0])}
                    className="w-full text-zinc-400 text-xs file:bg-zinc-900 file:text-zinc-200 file:border-0 file:px-3 file:py-2 file:uppercase file:tracking-widest file:font-bold file:mr-3"
                  />
                  {uploadingField === 'pdf' && (
                    <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Enviando PDF...</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 border border-zinc-900 p-6 bg-zinc-950/60">
                <h3 className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-4">Ajuste de Crop & Zoom</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Background</h4>
                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Posição X</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.bg_position_x}
                        onChange={handleRangeChange('bg_position_x')}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Posição Y</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.bg_position_y}
                        onChange={handleRangeChange('bg_position_y')}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Zoom (±)</label>
                      <input
                        type="range"
                        min="-50"
                        max="100"
                        value={formData.bg_zoom}
                        onChange={handleRangeChange('bg_zoom')}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Monolito</h4>
                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Posição X</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.monolith_position_x}
                        onChange={handleRangeChange('monolith_position_x')}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Posição Y</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.monolith_position_y}
                        onChange={handleRangeChange('monolith_position_y')}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Zoom (±)</label>
                      <input
                        type="range"
                        min="-50"
                        max="100"
                        value={formData.monolith_zoom}
                        onChange={handleRangeChange('monolith_zoom')}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ordem de Exibição */}
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2 font-bold">
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-3 flex items-start gap-3">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

              {/* Actions */}
            <div className="flex gap-4 pt-8 border-t border-zinc-900">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white hover:bg-red-600 hover:text-white disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black text-sm uppercase tracking-[0.2em] py-5 transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
              >
                <Save size={18} />
                {loading ? 'SALVANDO...' : 'SALVAR PROJETO'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-widest py-4 transition-all disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Componente de Gerenciamento de Seleções
function SelectionsManager({ projects }) {
  const [selections, setSelections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    projectIds: []
  });

  const token = localStorage.getItem('adminToken');

  const fetchSelections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/selections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSelections(data);
    } catch (err) {
      console.error('Erro ao buscar seleções:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelections();
  }, []);

  const handleCreateSelection = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/selections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erro ao criar seleção');

      await fetchSelections();
      setShowForm(false);
      setFormData({ name: '', slug: '', description: '', projectIds: [] });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSelection = async (id) => {
    if (!confirm('Deletar esta seleção?')) return;
    try {
      await fetch(`${API_URL}/api/selections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchSelections();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleProject = (id) => {
    setFormData(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(id)
        ? prev.projectIds.filter(pid => pid !== id)
        : [...prev.projectIds, id]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter mb-1">Links de Seleção (Homes Únicas)</h2>
          <p className="text-zinc-500 text-sm">Crie URLs personalizadas com projetos específicos.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black text-sm uppercase tracking-widest"
          >
            <Plus size={18} /> Nova Seleção
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-zinc-950 border border-zinc-800 p-8 animate-in fade-in slide-in-from-top duration-300">
          <form onSubmit={handleCreateSelection} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-2">Nome da Seleção</label>
                <input
                  type="text"
                  placeholder="Ex: Projetos para Netflix"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 focus:border-red-600 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-2">Slug (URL do link)</label>
                <div className="flex items-center gap-2 bg-black border border-zinc-800 px-4">
                  <span className="text-zinc-600 text-sm">/s/</span>
                  <input
                    type="text"
                    placeholder="netflix"
                    className="flex-1 bg-transparent text-white py-3 focus:outline-none"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-4 text-center border-b border-zinc-900 pb-2">Selecione os Projetos para incluir neste link:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div 
                    key={project.id}
                    onClick={() => toggleProject(project.id)}
                    className={`cursor-pointer p-4 border transition-all ${formData.projectIds.includes(project.id) ? 'bg-red-600/10 border-red-600' : 'bg-black border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm font-bold text-white uppercase truncate">{project.title}</span>
                      {formData.projectIds.includes(project.id) && <CheckCircle size={14} className="text-red-600 flex-shrink-0" />}
                    </div>
                    <span className="text-[9px] text-zinc-500 uppercase">{project.category}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-white text-black font-black py-4 uppercase tracking-widest">Gerar Link Único</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-8 bg-zinc-900 text-white font-black py-4 uppercase tracking-widest">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">Histórico de Playlists</h3>
        {loading ? (
          <p className="text-zinc-500">Carregando seleções...</p>
        ) : selections.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-900 p-12 text-center">
             <p className="text-zinc-500 italic text-sm">Nenhuma playlist criada no histórico.</p>
          </div>
        ) : selections.map(s => (
          <div key={s.id} className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-zinc-700 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-black text-white uppercase tracking-tighter text-lg">{s.name}</h3>
                <span className="px-2 py-0.5 bg-zinc-900 text-zinc-500 text-[8px] font-bold uppercase rounded border border-zinc-800">
                  {s.project_count} projetos
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 text-xs font-mono">originais.brick.mov/s/{s.slug}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://originais.brick.mov/s/${s.slug}`);
                      alert('Link copiado!');
                    }}
                    className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white"
                    title="Copiar Link"
                  >
                    <Eye size={14} />
                  </button>
                </div>
                <span className="text-zinc-600 text-[10px] uppercase tracking-tighter">
                  Criado em {new Date(s.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end md:self-center">
               <a 
                 href={`/s/${s.slug}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white border border-zinc-800 px-4 py-2 hover:bg-zinc-900 transition-all"
               >
                 Testar Link
               </a>
               <button 
                onClick={() => handleDeleteSelection(s.id)} 
                className="p-2 text-zinc-700 hover:text-red-600 hover:bg-red-600/10 rounded transition-all"
                title="Deletar Playlist Permanente"
               >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente Principal do Dashboard
export default function AdminDashboard({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' ou 'selections'

  const token = localStorage.getItem('adminToken');

  // Buscar projetos
  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Mostrar notificação
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Salvar projeto (criar ou editar)
  const handleSaveProject = async (projectData) => {
    const isEditing = !!editingProject;
    const url = isEditing 
      ? `${API_URL}/api/projects/${editingProject.id}`
      : `${API_URL}/api/projects`;
    
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao salvar projeto');
    }

    await fetchProjects();
    setShowForm(false);
    setEditingProject(null);
    showNotification(isEditing ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!');
  };

  // Deletar projeto
  const handleDeleteProject = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este projeto?')) return;

    try {
      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao deletar projeto');

      await fetchProjects();
      showNotification('Projeto deletado com sucesso!');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Abrir formulário de edição
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  // Abrir formulário de novo projeto
  const handleNewProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Brick Admin</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">
              Olá, {user?.username || 'Admin'}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-24 right-6 z-50 ${notification.type === 'success' ? 'bg-green-900/90' : 'bg-red-900/90'} border ${notification.type === 'success' ? 'border-green-700' : 'border-red-700'} text-white px-6 py-4 flex items-center gap-3 shadow-2xl animate-in slide-in-from-right`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-8 border-b border-zinc-900 mb-12">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'projects' ? 'text-white border-red-600' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
          >
            Projetos Gerais
          </button>
          <button 
            onClick={() => setActiveTab('selections')}
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'selections' ? 'text-white border-red-600' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
          >
            Links de Seleção
          </button>
        </div>

        {activeTab === 'projects' ? (
          <>
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-1">Todos os Projetos</h2>
            <p className="text-zinc-500 text-sm">{projects.length} projeto(s) cadastrado(s)</p>
          </div>
          <button
            onClick={handleNewProject}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black font-black text-sm uppercase tracking-widest transition-all"
          >
            <Plus size={18} />
            Novo Projeto
          </button>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-zinc-900 bg-zinc-950">
            <p className="text-zinc-500 mb-4">Nenhum projeto cadastrado ainda</p>
            <button
              onClick={handleNewProject}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-widest"
            >
              <Plus size={18} />
              Criar Primeiro Projeto
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-zinc-950 border border-zinc-800 p-6 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-zinc-600 font-mono text-sm">#{project.id}</span>
                      <span className="px-2 py-1 bg-zinc-900 text-zinc-400 text-xs uppercase tracking-wider">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">
                      {project.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                      <span>📊 {project.status}</span>
                      <span>🎬 {project.genre}</span>
                      {project.host && <span>🎤 {project.host}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-3 bg-zinc-900 hover:bg-red-900 text-zinc-400 hover:text-white transition-colors"
                      title="Deletar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        ) : (
          <SelectionsManager projects={projects} />
        )}
      </main>

      {/* Project Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleSaveProject}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}
