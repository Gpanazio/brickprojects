import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Upload, LogOut, Search, GripVertical, Check, Image as ImageIcon, Link as LinkIcon, FileText, Video, List, Layers, ArrowRight, ChevronRight, Copy, AlertCircle, Info } from 'lucide-react';
import axios from 'axios';
import ImageControl from './ImageControl';

const API_URL = import.meta.env.VITE_API_URL || '';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' ou 'selections'
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Configuração Global do Axios para incluir o Token
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      onLogout(); // Se não houver token, desloga por segurança
    }

    // Atalho ESC para fechar modais
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditingProject(null);
        setEditingSelection(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete axios.defaults.headers.common['Authorization'];
    };
  }, [onLogout]);
  const [projects, setProjects] = useState([]);
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [editingSelection, setEditingSelection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Função para parsear a URL do Vimeo e extrair ID e Hash
  const parseVimeoUrl = (url) => {
    if (!url) return { id: '', hash: '' };
    
    // Regex para capturar ID e opcionalmente o Hash
    // Formatos suportados: 
    // https://vimeo.com/123456789
    // https://vimeo.com/123456789/abcdef123
    // vimeo.com/123456789/abcdef123
    const regex = /(?:vimeo\.com\/)(\d+)(?:\/)?([a-z0-9]+)?/;
    const match = url.match(regex);
    
    if (match) {
      return {
        id: match[1] || '',
        hash: match[2] || ''
      };
    }
    
    return { id: url, hash: '' }; // Se não der match, assume que o que foi colado pode ser o ID
  };

  // Função para reconstruir a URL do Vimeo para exibição no input
  const getVimeoDisplayUrl = (project) => {
    if (!project.vimeo_id) return '';
    let url = `https://vimeo.com/${project.vimeo_id}`;
    if (project.vimeo_hash) url += `/${project.vimeo_hash}`;
    return url;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchProjects(), fetchSelections()]);
    setLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects`);
      const data = Array.isArray(response.data) ? response.data : [];
      setProjects(data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  const fetchSelections = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/selections`);
      const data = Array.isArray(response.data) ? response.data : [];
      setSelections(data);
    } catch (error) {
      console.error('Erro ao carregar seleções:', error);
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
      bg_image_zoom: 0,
      bg_image_offset_x: 0,
      bg_image_offset_y: 0,
      monolith_image: '',
      monolith_image_zoom: 0,
      monolith_image_offset_x: 0,
      monolith_image_offset_y: 0,
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
        showNotification('Projeto excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        showNotification('Erro ao excluir projeto', 'error');
      }
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = { ...editingProject };
      
      if (projectData.id) {
        await axios.put(`${API_URL}/api/projects/${projectData.id}`, projectData);
        showNotification('Projeto atualizado!');
      } else {
        await axios.post(`${API_URL}/api/projects`, projectData);
        showNotification('Projeto criado com sucesso!');
      }
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      showNotification(error.response?.data?.error || error.message, 'error');
    }
  };

  const handleFileUpload = async (e, field, folder = 'assets') => {
    const file = e.target.files[0];
    if (!file) return;
    handleImageUpload(file, field, folder);
  };

  const handleImageUpload = async (file, field, folder = 'assets') => {
    const formData = new FormData();
    // IMPORTANTE: Adicionar folder ANTES do file para o Multer processar corretamente
    formData.append('folder', folder);
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/uploads`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setEditingProject(prev => ({ ...prev, [field]: response.data.url }));
      showNotification('Upload concluído!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showNotification('Erro ao fazer upload do arquivo', 'error');
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    // Tenta converter para número se parecer um número de zoom/offset
    const finalValue = (name.includes('zoom') || name.includes('offset')) ? parseInt(value) || 0 : value;
    
    if (editingProject) {
        setEditingProject(prev => ({ ...prev, [name]: finalValue }));
    } else if (editingSelection) {
        setEditingSelection(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleSelectionImageUpload = async (file, field) => {
    const formData = new FormData();
    formData.append('folder', 'assets');
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/uploads`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setEditingSelection(prev => ({ ...prev, [field]: response.data.url }));
      showNotification('Capa enviada!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showNotification('Erro ao enviar imagem de capa', 'error');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSelections = selections.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funções para Seleções (Playlists)
  const handleCreateSelection = () => {
    setEditingSelection({
      name: '',
      slug: '',
      description: '',
      cover_image: '',
      cover_image_zoom: 0,
      cover_image_offset_x: 0,
      cover_image_offset_y: 0,
      projectIds: []
    });
  };

  const handleEditSelection = async (selection) => {
    try {
      const response = await axios.get(`${API_URL}/api/selections/slug/${selection.slug}`);
      const fullSelection = response.data;
      setEditingSelection({
        ...fullSelection,
        projectIds: fullSelection.projects.map(p => p.id)
      });
    } catch (error) {
      console.error('Erro ao carregar detalhes da seleção:', error);
      showNotification('Erro ao carregar detalhes da playlist', 'error');
    }
  };

  const handleDeleteSelection = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta playlist?')) {
      try {
        await axios.delete(`${API_URL}/api/selections/${id}`);
        fetchSelections();
        showNotification('Playlist excluída!');
      } catch (error) {
        console.error('Erro ao excluir playlist:', error);
        showNotification('Erro ao excluir playlist', 'error');
      }
    }
  };

  const handleSaveSelection = async (e) => {
    e.preventDefault();
    try {
      const selectionData = { ...editingSelection };
      if (selectionData.id) {
        await axios.put(`${API_URL}/api/selections/${selectionData.id}`, selectionData);
        showNotification('Playlist atualizada!');
      } else {
        await axios.post(`${API_URL}/api/selections`, selectionData);
        showNotification('Playlist criada!');
      }
      setEditingSelection(null);
      fetchSelections();
    } catch (error) {
      console.error('Erro ao salvar playlist:', error);
      showNotification(error.response?.data?.error || error.message, 'error');
    }
  };

  const toggleProjectInSelection = (projectId) => {
    const currentIds = [...editingSelection.projectIds];
    const index = currentIds.indexOf(projectId);
    
    if (index > -1) {
      currentIds.splice(index, 1);
    } else {
      currentIds.push(projectId);
    }
    
    setEditingSelection({ ...editingSelection, projectIds: currentIds });
  };

  const moveProjectInSelection = (index, direction) => {
    const newIds = [...editingSelection.projectIds];
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < newIds.length) {
      [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
      setEditingSelection({ ...editingSelection, projectIds: newIds });
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl border shadow-2xl animate-in slide-in-from-right-full duration-300 ${
          notification.type === 'error' 
            ? 'bg-red-950/90 border-red-500 text-red-200' 
            : 'bg-zinc-900/90 border-zinc-700 text-white'
        }`}>
          {notification.type === 'error' ? <AlertCircle size={20} className="text-red-500" /> : <Check size={20} className="text-[#E63946]" />}
          <p className="font-bold text-sm tracking-tight">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

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

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-[#1a1a1a] p-1 rounded-xl border border-[#333] w-fit">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'projects' ? 'bg-[#E63946] text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-[#333]'}`}
          >
              <Layers size={18} />
              Projetos
          </button>
          <button 
            onClick={() => setActiveTab('selections')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'selections' ? 'bg-[#E63946] text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-[#333]'}`}
          >
              <List size={18} />
              Playlists
          </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input 
                type="text"
                placeholder={activeTab === 'projects' ? "Buscar projetos..." : "Buscar playlists..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#E63946] transition-colors"
            />
        </div>
        <button 
            onClick={activeTab === 'projects' ? handleCreateProject : handleCreateSelection}
            className="flex items-center gap-2 bg-[#E63946] hover:bg-[#c1303b] text-white px-6 py-2.5 rounded-lg transition-all transform hover:scale-105 font-bold w-full md:w-auto justify-center shadow-lg"
        >
            <Plus size={20} />
            {activeTab === 'projects' ? 'Novo Projeto' : 'Nova Playlist'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
            <p className="text-gray-400 animate-pulse">Carregando dados...</p>
        </div>
      ) : (
        <>
            {activeTab === 'projects' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <div key={project.id} className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden group hover:border-[#E63946] transition-all duration-300 shadow-xl">
                            <div className="relative aspect-video overflow-hidden">
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSelections.map(selection => (
                        <div key={selection.id} className="bg-[#1a1a1a] rounded-xl border border-[#333] p-6 group hover:border-[#E63946] transition-all duration-300 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <List size={80} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl mb-1">{selection.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <LinkIcon size={12} />
                                            <span>/{selection.slug}</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#E63946]/10 text-[#E63946] px-3 py-1 rounded-full text-xs font-bold border border-[#E63946]/20">
                                        {selection.project_count} Projetos
                                    </div>
                                </div>
                                
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10 italic">
                                    {selection.description || 'Sem descrição.'}
                                </p>
                                
                                <div className="flex items-center gap-3 pt-4 border-t border-[#333]">
                                    <button 
                                        onClick={() => handleEditSelection(selection)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-[#333] hover:bg-white hover:text-black text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                                    >
                                        <Edit size={16} />
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteSelection(selection.id)}
                                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all border border-red-500/20"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const url = `${window.location.origin}/selection/${selection.slug}`;
                                            navigator.clipboard.writeText(url);
                                            showNotification('Link copiado para a área de transferência!');
                                        }}
                                        className="bg-[#333] text-gray-400 hover:text-white p-2 rounded-lg transition-all border border-white/5"
                                        title="Copiar Link"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {filteredSelections.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-[#1a1a1a] rounded-xl border border-dashed border-[#333]">
                            <div className="bg-[#333] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                <List size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400">Nenhuma playlist encontrada</h3>
                            <p className="text-gray-500 mt-2">Crie sua primeira seleção personalizada de projetos.</p>
                        </div>
                    )}
                </div>
            )}
        </>
      )}

      {/* Modal de Edição de Playlist (Selection) */}
      {editingSelection && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-[#333] relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setEditingSelection(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#333] p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <div className="bg-[#E63946] p-2 rounded-lg">
                    {editingSelection.id ? <Edit size={20} /> : <Plus size={20} />}
                </div>
                {editingSelection.id ? 'Editar Playlist' : 'Nova Playlist'}
            </h2>
            
            <form onSubmit={handleSaveSelection} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lado Esquerdo: Info */}
                <div className="space-y-6">
                    <ImageControl
                        title="Imagem de Capa (Folder)"
                        uploadLabel="Upload Capa"
                        urlLabel="URL da Capa"
                        zoomLabel="Zoom"
                        urlField="cover_image"
                        zoomField="cover_image_zoom"
                        offsetXField="cover_image_offset_x"
                        offsetYField="cover_image_offset_y"
                        urlValue={editingSelection.cover_image}
                        zoomValue={editingSelection.cover_image_zoom || 0}
                        offsetXValue={editingSelection.cover_image_offset_x || 0}
                        offsetYValue={editingSelection.cover_image_offset_y || 0}
                        placeholder="URL da imagem de capa..."
                        onFileUpload={(file) => handleSelectionImageUpload(file, 'cover_image')}
                        onFieldChange={handleFieldChange}
                        previewClassName="w-full aspect-video rounded-xl"
                    />

                    <div className="space-y-2 pt-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Nome da Playlist</label>
                        <input 
                            type="text" 
                            value={editingSelection.name}
                            onChange={(e) => {
                                const name = e.target.value;
                                setEditingSelection({
                                    ...editingSelection, 
                                    name,
                                    slug: editingSelection.id ? editingSelection.slug : generateSlug(name)
                                });
                            }}
                            placeholder="Ex: Documentários Premiados"
                            className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-[#E63946] focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Slug (URL)</label>
                        <div className="flex items-center gap-2 bg-[#121212] border border-[#333] rounded-xl px-4 py-3">
                            <span className="text-gray-600 text-sm">/selection/</span>
                            <input 
                                type="text" 
                                value={editingSelection.slug}
                                onChange={(e) => setEditingSelection({...editingSelection, slug: generateSlug(e.target.value)})}
                                className="flex-1 bg-transparent text-white focus:outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Descrição (Opcional)</label>
                            <textarea 
                                value={editingSelection.description || ''}
                                onChange={(e) => setEditingSelection({...editingSelection, description: e.target.value})}
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white h-32 focus:border-[#E63946] focus:outline-none resize-none"
                                placeholder="Uma breve descrição sobre esta seleção de projetos..."
                            />
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Seleção de Projetos */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest flex justify-between items-center">
                        <span>Projetos na Playlist ({editingSelection.projectIds.length})</span>
                        <span className="text-[10px] normal-case font-normal text-gray-600">Arraste ou use as setas para ordenar</span>
                    </label>
                    
                    <div className="bg-[#121212] border border-[#333] rounded-2xl overflow-hidden flex flex-col h-[400px]">
                        {/* Lista de Selecionados */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {editingSelection.projectIds.map((id, index) => {
                                const project = projects.find(p => p.id === id);
                                if (!project) return null;
                                return (
                                    <div key={id} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-[#333] group">
                                        <div className="flex flex-col gap-1">
                                            <button 
                                                type="button"
                                                onClick={() => moveProjectInSelection(index, -1)}
                                                className="text-gray-600 hover:text-white transition-colors disabled:opacity-0"
                                                disabled={index === 0}
                                            >
                                                <GripVertical size={14} className="rotate-90" />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => moveProjectInSelection(index, 1)}
                                                className="text-gray-600 hover:text-white transition-colors disabled:opacity-0"
                                                disabled={index === editingSelection.projectIds.length - 1}
                                            >
                                                <GripVertical size={14} className="rotate-90" />
                                            </button>
                                        </div>
                                        <div className="w-12 h-8 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                                            <img src={project.bg_image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <span className="flex-1 text-sm font-medium truncate">{project.title}</span>
                                        <button 
                                            type="button"
                                            onClick={() => toggleProjectInSelection(id)}
                                            className="text-gray-500 hover:text-red-500 p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                            {editingSelection.projectIds.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center p-8">
                                    <Plus size={24} className="mb-2 opacity-20" />
                                    <p className="text-sm">Nenhum projeto selecionado.<br/>Adicione projetos da lista abaixo.</p>
                                </div>
                            )}
                        </div>

                        {/* Busca e Adição */}
                        <div className="p-4 bg-[#1a1a1a] border-t border-[#333]">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-widest">Adicionar Projetos</p>
                            <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                                {projects
                                    .filter(p => !editingSelection.projectIds.includes(p.id))
                                    .map(project => (
                                        <button
                                            key={project.id}
                                            type="button"
                                            onClick={() => toggleProjectInSelection(project.id)}
                                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#333] transition-colors text-left group"
                                        >
                                            <div className="w-8 h-6 rounded bg-gray-900 overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                                                <img src={project.bg_image} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className="flex-1 text-xs truncate">{project.title}</span>
                                            <Plus size={14} className="text-gray-500 group-hover:text-[#E63946]" />
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-[#333] gap-4">
                <button 
                  type="button"
                  onClick={() => setEditingSelection(null)}
                  className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-[#333] transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#E63946] hover:bg-[#c1303b] text-white px-12 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-[#E63946]/20"
                >
                  <Save size={20} />
                  Salvar Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Projeto */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#333] relative shadow-2xl animate-in fade-in zoom-in duration-200">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ImageControl
                    title="Imagem de Fundo (Horizontal)"
                    uploadLabel="Upload Imagem Horizontal"
                    urlLabel="URL da Imagem"
                    zoomLabel="Zoom / Escala"
                    urlField="bg_image"
                    zoomField="bg_image_zoom"
                    offsetXField="bg_image_offset_x"
                    offsetYField="bg_image_offset_y"
                    urlValue={editingProject.bg_image}
                    zoomValue={editingProject.bg_image_zoom || 0}
                    offsetXValue={editingProject.bg_image_offset_x || 0}
                    offsetYValue={editingProject.bg_image_offset_y || 0}
                    placeholder="URL da imagem..."
                    onFileUpload={(file) => handleImageUpload(file, 'bg_image', 'assets')}
                    onFieldChange={handleFieldChange}
                    previewClassName="w-full aspect-video rounded-xl"
                  />

                  <ImageControl
                    title="Imagem Monólito (Vertical)"
                    uploadLabel="Upload Imagem Vertical"
                    urlLabel="URL da Imagem"
                    zoomLabel="Zoom / Escala"
                    urlField="monolith_image"
                    zoomField="monolith_image_zoom"
                    offsetXField="monolith_image_offset_x"
                    offsetYField="monolith_image_offset_y"
                    urlValue={editingProject.monolith_image}
                    zoomValue={editingProject.monolith_image_zoom || 0}
                    offsetXValue={editingProject.monolith_image_offset_x || 0}
                    offsetYValue={editingProject.monolith_image_offset_y || 0}
                    placeholder="URL da imagem..."
                    onFileUpload={(file) => handleImageUpload(file, 'monolith_image', 'assets')}
                    onFieldChange={handleFieldChange}
                    previewClassName="w-full max-w-[240px] mx-auto aspect-[1/2] rounded-xl"
                  />
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
                    <option value="Exibido (History)">Exibido (History)</option>
                    <option value="Piloto Disponível">Piloto Disponível</option>
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
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Link do Vimeo</label>
                        <input 
                            type="text" 
                            value={getVimeoDisplayUrl(editingProject)} 
                            onChange={(e) => {
                                const { id, hash } = parseVimeoUrl(e.target.value);
                                setEditingProject({
                                    ...editingProject, 
                                    vimeo_id: id,
                                    vimeo_hash: hash
                                });
                            }} 
                            placeholder="Cole o link do vídeo (ex: vimeo.com/123456789/hash)"
                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-[#E63946] focus:outline-none" 
                        />
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
