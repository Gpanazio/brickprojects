import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Upload, LogOut, Search, GripVertical, Check, Image as ImageIcon, Link as LinkIcon, FileText, Video } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const AdminDashboard = ({ onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects`);
      // O PostgreSQL retorna os dados em um array diretamente ou em response.data
      const data = Array.isArray(response.data) ? response.data : [];
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject({
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
      display_order: 0
    });
  };

  const handleEditProject = (project) => {
    setEditingProject({ ...project });
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await axios.delete(`${API_URL}/api/projects/${id}`);
        fetchProjects();
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        alert('Erro ao excluir projeto');
      }
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      // Remover campos que não devem ser enviados na criação/atualização se necessário
      const projectData = { ...editingProject };
      
      if (projectData.id) {
        await axios.put(`${API_URL}/api/projects/${projectData.id}`, projectData);
      } else {
        await axios.post(`${API_URL}/api/projects`, projectData);
      }
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      alert('Erro ao salvar projeto: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleFileUpload = async (e, field, folder = 'assets') => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await axios.post(`${API_URL}/api/uploads`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setEditingProject({ ...editingProject, [field]: response.data.url });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do arquivo');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
        <div className="flex items-center gap-4">
          <img src="/assets/brick_logo_rgb-1.png" alt="Brick Logo" className="h-8" />
          <h1 className="text-xl font-bold border-l border-gray-600 pl-4">Dashboard Admin</h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Logado como Admin</span>
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-[#333] px-3 py-1.5 rounded-lg"
            >
                <LogOut size={16} />
                Sair
            </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input 
                type="text"
                placeholder="Buscar por título ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#E63946] transition-colors"
            />
        </div>
        <button 
            onClick={handleCreateProject}
            className="flex items-center gap-2 bg-[#E63946] hover:bg-[#c1303b] text-white px-6 py-2.5 rounded-lg transition-all transform hover:scale-105 font-bold w-full md:w-auto justify-center shadow-lg"
        >
            <Plus size={20} />
            Novo Projeto
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
            <p className="text-gray-400 animate-pulse">Carregando projetos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
                <div key={project.id} className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden group hover:border-[#E63946] transition-all duration-300 shadow-xl">
                    <div className="relative aspect-video">
                        <img 
                            src={project.bg_image || '/api/placeholder/400/300'} 
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                            <button 
                                onClick={() => handleEditProject(project)}
                                className="bg-white text-black p-3 rounded-full hover:bg-[#E63946] hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                title="Editar"
                            >
                                <Edit size={20} />
                            </button>
                            <button 
                                onClick={() => handleDeleteProject(project.id)}
                                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
                                title="Excluir"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-[10px] px-2 py-1 rounded text-white font-bold border border-white/10">
                            ORDEM: {project.display_order}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg truncate flex-1">{project.title}</h3>
                            <span className="text-[10px] bg-[#E63946]/10 text-[#E63946] px-2 py-0.5 rounded border border-[#E63946]/20 uppercase font-bold">
                                {project.status}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[11px] bg-[#333] px-2.5 py-1 rounded-full text-gray-300 border border-white/5">
                                {project.category}
                            </span>
                            <span className="text-[11px] bg-[#333] px-2.5 py-1 rounded-full text-gray-300 border border-white/5">
                                {project.genre}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            
            {filteredProjects.length === 0 && (
                <div className="col-span-full py-20 text-center bg-[#1a1a1a] rounded-xl border border-dashed border-[#333]">
                    <div className="bg-[#333] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">Nenhum projeto encontrado</h3>
                    <p className="text-gray-500 mt-2">Tente ajustar sua busca ou crie um novo projeto.</p>
                </div>
            )}
        </div>
      )}

      {/* Modal de Edição de Projeto */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-4xl w-full border border-[#333] relative my-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setEditingProject(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#333] p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <div className="bg-[#E63946] p-2 rounded-lg">
                    {editingProject.id ? <Edit size={20} /> : <Plus size={20} />}
                </div>
                {editingProject.id ? 'Editar Projeto' : 'Novo Projeto'}
                {editingProject.id && <span className="text-xs font-normal text-gray-500 bg-[#121212] px-3 py-1 rounded-full border border-[#333]">ID: {editingProject.id}</span>}
            </h2>
            
            <form onSubmit={handleSaveProject} className="space-y-8">
                
              {/* Seção de Imagens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#E63946]" />
                        Imagem de Fundo (Horizontal)
                      </label>
                      <div className="relative group aspect-video bg-[#121212] rounded-xl overflow-hidden border-2 border-dashed border-[#333] hover:border-[#E63946] transition-all">
                          {editingProject.bg_image ? (
                              <>
                                  <img src={editingProject.bg_image} className="w-full h-full object-cover" alt="Preview" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform">
                                          Trocar Imagem
                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bg_image', 'assets')} />
                                      </label>
                                  </div>
                              </>
                          ) : (
                              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                                  <Upload size={32} className="text-gray-600 mb-2" />
                                  <span className="text-sm text-gray-500">Upload Imagem Horizontal</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'bg_image', 'assets')} />
                              </label>
                          )}
                      </div>
                      <input 
                        type="text" 
                        value={editingProject.bg_image} 
                        onChange={(e) => setEditingProject({...editingProject, bg_image: e.target.value})}
                        placeholder="URL da imagem..."
                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-xs text-gray-400"
                      />
                  </div>

                  <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#E63946]" />
                        Imagem Monólito (Vertical)
                      </label>
                      <div className="relative group aspect-[3/4] max-h-[180px] mx-auto bg-[#121212] rounded-xl overflow-hidden border-2 border-dashed border-[#333] hover:border-[#E63946] transition-all">
                          {editingProject.monolith_image ? (
                              <>
                                  <img src={editingProject.monolith_image} className="w-full h-full object-cover" alt="Preview" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform">
                                          Trocar
                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'monolith_image', 'assets')} />
                                      </label>
                                  </div>
                              </>
                          ) : (
                              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                                  <Upload size={32} className="text-gray-600 mb-2" />
                                  <span className="text-sm text-gray-500">Upload Imagem Vertical</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'monolith_image', 'assets')} />
                              </label>
                          )}
                      </div>
                      <input 
                        type="text" 
                        value={editingProject.monolith_image} 
                        onChange={(e) => setEditingProject({...editingProject, monolith_image: e.target.value})}
                        placeholder="URL da imagem..."
                        className="w-full bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-xs text-gray-400"
                      />
                  </div>
              </div>

              {/* Campos de Texto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Título do Projeto</label>
                  <input 
                    type="text" 
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#E63946] focus:outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Categoria</label>
                  <input 
                    type="text" 
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({...editingProject, category: e.target.value})}
                    placeholder="Ex: Documentário, Reality, Factual"
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#E63946] focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Gênero</label>
                  <input 
                    type="text" 
                    value={editingProject.genre}
                    onChange={(e) => setEditingProject({...editingProject, genre: e.target.value})}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#E63946] focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Formato</label>
                  <input 
                    type="text" 
                    value={editingProject.format}
                    onChange={(e) => setEditingProject({...editingProject, format: e.target.value})}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#E63946] focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select 
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({...editingProject, status: e.target.value})}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#E63946] focus:outline-none"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                    <option value="Em Captação">Em Captação</option>
                    <option value="Em Produção">Em Produção</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Exibido">Exibido</option>
                    <option value="Formato Pronto">Formato Pronto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Descrição Curta (Home)</label>
                  <textarea 
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white h-24 focus:border-[#E63946] focus:outline-none resize-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Descrição Longa (Interna)</label>
                  <textarea 
                    value={editingProject.long_description}
                    onChange={(e) => setEditingProject({...editingProject, long_description: e.target.value})}
                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white h-24 focus:border-[#E63946] focus:outline-none resize-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#121212] rounded-2xl border border-[#333]">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-[#E63946]">
                        <Video size={16} /> Vídeo e Mídia
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Vimeo ID</label>
                            <input type="text" value={editingProject.vimeo_id || ''} onChange={(e) => setEditingProject({...editingProject, vimeo_id: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-[#E63946] focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Vimeo Hash</label>
                            <input type="text" value={editingProject.vimeo_hash || ''} onChange={(e) => setEditingProject({...editingProject, vimeo_hash: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-[#E63946] focus:outline-none" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Label do Botão Vídeo</label>
                        <input type="text" value={editingProject.video_label || ''} onChange={(e) => setEditingProject({...editingProject, video_label: e.target.value})} placeholder="Ex: Ver Promo, Ver Teaser" className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-[#E63946] focus:outline-none" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-[#E63946]">
                        <FileText size={16} /> Arquivos e Info
                    </h3>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">URL do Pitch Deck (PDF)</label>
                        <div className="flex gap-2">
                            <input type="text" value={editingProject.pdf_url || ''} onChange={(e) => setEditingProject({...editingProject, pdf_url: e.target.value})} className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-[#E63946] focus:outline-none" />
                            <label className="cursor-pointer bg-[#333] hover:bg-[#444] p-2 rounded-lg transition-colors" title="Upload PDF">
                                <Upload size={18} />
                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'pdf_url', 'projetos')} />
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Apresentador/Host</label>
                            <input type="text" value={editingProject.host || ''} onChange={(e) => setEditingProject({...editingProject, host: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-[#E63946] focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Ordem de Exibição</label>
                            <input type="number" value={editingProject.display_order || 0} onChange={(e) => setEditingProject({...editingProject, display_order: parseInt(e.target.value)})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-[#E63946] focus:outline-none" />
                        </div>
                    </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-[#333] gap-4">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-[#333] transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#E63946] hover:bg-[#c1303b] text-white px-12 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-[#E63946]/20"
                >
                  <Save size={20} />
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
