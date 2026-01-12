import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Upload, LogOut, Search, GripVertical, Check, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminDashboard = ({ onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para controlar o modal específico de gerenciamento de imagens
  const [showImageManager, setShowImageManager] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects`);
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject({
      title: '',
      description: '',
      client: '',
      year: new Date().getFullYear().toString(),
      category: '',
      images: [],
      tags: [],
      featured: false
    });
    // Não abrimos o image manager automaticamente para não assustar, 
    // o usuário clica no botão quando quiser por fotos.
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
      }
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProject._id) {
        await axios.put(`${API_URL}/api/projects/${editingProject._id}`, editingProject);
      } else {
        await axios.post(`${API_URL}/api/projects`, editingProject);
      }
      setEditingProject(null);
      setShowImageManager(false); // Garante que fecha o modal de imagens também
      fetchProjects();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      alert('Erro ao salvar projeto');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Adiciona as novas URLs ao array existente
      const newImages = [...(editingProject.images || []), ...response.data.urls];
      setEditingProject({ ...editingProject, images: newImages });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload das imagens');
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = editingProject.images.filter((_, i) => i !== index);
    setEditingProject({ ...editingProject, images: newImages });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(editingProject.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditingProject({ ...editingProject, images: items });
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
        <div className="flex items-center gap-4">
          <img src="/assets/brick_logo_rgb-1.png" alt="Brick Logo" className="h-8" />
          <h1 className="text-xl font-bold border-l border-gray-600 pl-4">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Admin</span>
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <LogOut size={18} />
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
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#E63946]"
            />
        </div>
        <button 
            onClick={handleCreateProject}
            className="flex items-center gap-2 bg-[#E63946] hover:bg-[#c1303b] text-white px-4 py-2 rounded-lg transition-colors w-full md:w-auto justify-center"
        >
            <Plus size={20} />
            Novo Projeto
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
                <div key={project._id} className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden group hover:border-[#E63946] transition-colors">
                    <div className="relative aspect-video">
                        <img 
                            src={project.images?.[0] || '/api/placeholder/400/300'} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button 
                                onClick={() => handleEditProject(project)}
                                className="bg-white text-black p-2 rounded-full hover:bg-gray-200"
                                title="Editar"
                            >
                                <Edit size={20} />
                            </button>
                            <button 
                                onClick={() => handleDeleteProject(project._id)}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                title="Excluir"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                        {project.featured && (
                            <div className="absolute top-2 right-2 bg-[#E63946] text-xs px-2 py-1 rounded text-white font-bold">
                                DESTAQUE
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 truncate">{project.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{project.client}</p>
                        <div className="flex flex-wrap gap-2">
                            {project.tags?.slice(0,3).map((tag, i) => (
                                <span key={i} className="text-xs bg-[#333] px-2 py-1 rounded text-gray-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modal Dedicado de Gerenciamento de Fotos (Z-Index maior que o modal de edição) */}
      {showImageManager && editingProject && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
             <div className="bg-[#1a1a1a] p-6 rounded-xl max-w-5xl w-full border border-[#333] flex flex-col h-[85vh] shadow-2xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#333]">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ImageIcon size={24} className="text-[#E63946]" />
                            Gerenciar Galeria
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Arraste para reordenar. A primeira imagem será a capa do projeto.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowImageManager(false)} 
                        className="text-gray-400 hover:text-white bg-[#333] p-2 rounded-full hover:bg-[#444] transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto min-h-0 bg-[#121212] rounded-lg p-4 border border-[#333]">
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="images" direction="horizontal">
                            {(provided) => (
                                <div 
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                                >
                                    {editingProject.images?.map((img, index) => (
                                        <Draggable key={`${img}-${index}`} draggableId={`${img}-${index}`} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`relative group aspect-square bg-[#222] rounded-lg overflow-hidden border ${snapshot.isDragging ? 'border-[#E63946] shadow-lg scale-105 z-50' : 'border-[#333]'}`}
                                                >
                                                    {/* Drag Handle */}
                                                    <div 
                                                        {...provided.dragHandleProps}
                                                        className="absolute top-2 left-2 bg-black/60 p-1.5 rounded-md cursor-grab active:cursor-grabbing text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <GripVertical size={14} />
                                                    </div>
                                                    
                                                    {/* Tag de Capa */}
                                                    {index === 0 && (
                                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#E63946] text-[10px] font-bold px-2 py-0.5 rounded text-white z-10 shadow-sm">
                                                            CAPA
                                                        </div>
                                                    )}

                                                    <img 
                                                        src={img} 
                                                        alt={`Project ${index}`} 
                                                        className="w-full h-full object-cover pointer-events-none"
                                                    />
                                                    
                                                    {/* Botão Remover */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                        title="Remover imagem"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>

                                                    {/* Overlay de número */}
                                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        #{index + 1}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    
                                    {/* Card de Upload Fixo na Grid */}
                                    <label className="flex flex-col items-center justify-center aspect-square bg-[#222] border-2 border-dashed border-[#444] rounded-lg cursor-pointer hover:border-[#E63946] hover:bg-[#2a2a2a] transition-all group">
                                        <div className="flex flex-col items-center text-gray-500 group-hover:text-[#E63946]">
                                            <div className="bg-[#333] p-3 rounded-full mb-2 group-hover:bg-[#E63946]/10 transition-colors">
                                                <Upload size={24} />
                                            </div>
                                            <span className="text-sm font-medium">Adicionar Foto</span>
                                            <span className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP</span>
                                        </div>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden" 
                                        />
                                    </label>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                <div className="mt-6 pt-4 border-t border-[#333] flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                        Total: {editingProject.images?.length || 0} imagens
                    </div>
                    <button 
                        onClick={() => setShowImageManager(false)}
                        className="bg-[#E63946] hover:bg-[#c1303b] text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-105"
                    >
                        <Check size={20} />
                        Concluir Edição de Fotos
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* Modal de Edição de Projeto Principal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1a1a1a] p-8 rounded-xl max-w-4xl w-full border border-[#333] relative">
            <button 
              onClick={() => {
                setEditingProject(null);
                setShowImageManager(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                {editingProject._id ? 'Editar Projeto' : 'Novo Projeto'}
                {editingProject._id && <span className="text-xs font-normal text-gray-500 bg-[#333] px-2 py-0.5 rounded">ID: {editingProject._id}</span>}
            </h2>
            
            <form onSubmit={handleSaveProject} className="space-y-6">
                
              {/* === NOVA ÁREA DE PREVIEW E BOTÃO DE EDIÇÃO DE FOTOS === */}
              <div className="bg-[#121212] p-6 rounded-xl border border-[#333] relative overflow-hidden group">
                  <div className="flex justify-between items-end mb-4 relative z-10">
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Galeria do Projeto</label>
                          <p className="text-xs text-gray-500">
                              Gerencie as fotos, a capa e a ordem de exibição.
                          </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowImageManager(true)}
                        className="bg-[#E63946] hover:bg-[#c1303b] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
                      >
                          <Edit size={16} />
                          Editar/Adicionar Fotos
                      </button>
                  </div>

                  {/* Preview Visual Strip */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#333] min-h-[100px] relative z-10">
                       {editingProject.images && editingProject.images.length > 0 ? (
                           editingProject.images.map((img, idx) => (
                               <div key={idx} className="relative flex-shrink-0 h-24 aspect-square rounded-lg overflow-hidden border border-[#333]">
                                   <img src={img} className="w-full h-full object-cover" alt="" />
                                   {idx === 0 && <div className="absolute bottom-0 inset-x-0 bg-[#E63946] text-white text-[9px] text-center font-bold py-0.5">CAPA</div>}
                               </div>
                           ))
                       ) : (
                           <div className="w-full h-24 border-2 border-dashed border-[#333] rounded-lg flex items-center justify-center text-gray-600 gap-2 cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => setShowImageManager(true)}>
                               <ImageIcon size={20} />
                               <span className="text-sm">Nenhuma imagem. Clique em editar para adicionar.</span>
                           </div>
                       )}
                  </div>
              </div>
              {/* ======================================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Título do Projeto</label>
                  <input 
                    type="text" 
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#E63946] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cliente</label>
                  <input 
                    type="text" 
                    value={editingProject.client}
                    onChange={(e) => setEditingProject({...editingProject, client: e.target.value})}
                    className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#E63946] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Ano</label>
                  <input 
                    type="text" 
                    value={editingProject.year}
                    onChange={(e) => setEditingProject({...editingProject, year: e.target.value})}
                    className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#E63946] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Categoria</label>
                  <input 
                    type="text" 
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({...editingProject, category: e.target.value})}
                    className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#E63946] focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${editingProject.featured ? 'bg-[#E63946] border-[#E63946]' : 'border-gray-500 group-hover:border-gray-300'}`}>
                            {editingProject.featured && <Check size={14} className="text-white" />}
                        </div>
                        <input 
                            type="checkbox" 
                            checked={editingProject.featured}
                            onChange={(e) => setEditingProject({...editingProject, featured: e.target.checked})}
                            className="hidden"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors">Destaque na Home</span>
                    </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Descrição</label>
                <textarea 
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white h-32 focus:border-[#E63946] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tags (separadas por vírgula)</label>
                <input 
                  type="text" 
                  value={editingProject.tags?.join(', ')}
                  onChange={(e) => setEditingProject({...editingProject, tags: e.target.value.split(',').map(t => t.trim())})}
                  className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#E63946] focus:outline-none"
                  placeholder="Ex: Comercial, Residencial, Interiores"
                />
              </div>

              <div className="flex justify-end pt-6 border-t border-[#333]">
                <button 
                  type="submit"
                  className="bg-[#E63946] hover:bg-[#c1303b] text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-105"
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
