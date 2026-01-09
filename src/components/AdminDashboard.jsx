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
    vimeo_id: '',
    vimeo_hash: '',
    pdf_url: '',
    host: '',
    display_order: 0,
    ...project
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

// Componente Principal do Dashboard
export default function AdminDashboard({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [notification, setNotification] = useState(null);

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
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-1">Projetos</h2>
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
