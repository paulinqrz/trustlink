import React, { useState } from 'react';
import { sampleFeedPosts } from '../../data/mockData';
import { FeedPost } from '../../types';
import { 
  ShieldCheck, 
  Award, 
  Calendar, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  Plus, 
  CheckCircle2,
  FileCheck2,
  Clock
} from 'lucide-react';

export const TrustFeedView: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>(sampleFeedPosts);
  const [newContent, setNewContent] = useState('');
  const [postType, setPostType] = useState<FeedPost['type']>('certification');
  const [titleInput, setTitleInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newPost: FeedPost = {
      id: `pst-${Date.now()}`,
      authorId: 'fl-101',
      authorName: 'Maria Clara Silveira',
      authorRole: 'Cuidadora Geriátrica Sênior & COREN-SP',
      authorCategory: 'Cuidados Geriátricos',
      avatarSeed: 'maria',
      verifiedBadgesCount: 4,
      createdAt: 'Agora mesmo',
      content: newContent,
      type: postType,
      mediaTitle: titleInput || (postType === 'certification' ? 'Novo Certificado Profissional Auditado' : 'Registro de Rotina Humanizada'),
      mediaSubtext: 'Comprovante verificado pelo comitê de integridade TrustLink',
      likesCount: 1,
      endorsementsCount: 0,
      hasVerifiedExEmployerEndorsement: false
    };

    setPosts([newPost, ...posts]);
    setNewContent('');
    setTitleInput('');
    setShowCreateModal(false);
  };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likesCount: p.likesCount + 1 } : p));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header and Creator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Rede de Conquistas e Validações</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Registros Auditados
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Linha do Tempo Profissional & Conquistas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compartilhamento transparente de certificações, rotinas clínicas e validações públicas de contratantes.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Publicar Conquista / Rotina
        </button>
      </div>

      {/* Modal / Form to Publish */}
      {showCreateModal && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Publicar com Selo de Integridade
            </h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Categoria do Registro</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as FeedPost['type'])}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="certification">Novo Certificado / Curso Especializado</option>
                  <option value="daily_routine">Rotina de Trabalho / Metodologia de Cuidado</option>
                  <option value="milestone">Marco Profissional (ex: 500h de plantão)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Título do Documento / Tema</label>
                <input
                  type="text"
                  placeholder="Ex: Certificação em Cuidados Paliativos - USP"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium text-xs mb-1">Texto da Publicação</label>
              <textarea
                rows={3}
                placeholder="Conte sobre o aprendizado, a rotina aplicada ou a melhoria no atendimento aos assistidos..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Publicar no Feed
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed Stream */}
      <div className="space-y-5">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            {/* Post Author Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                  MC
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{post.authorName}</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      <ShieldCheck className="w-3 h-3" /> Auditada
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{post.authorRole} · {post.createdAt}</p>
                </div>
              </div>

              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {post.type === 'certification' ? 'Certificação Formal' : 'Rotina Verificada'}
              </span>
            </div>

            {/* Post Content Body */}
            <p className="text-sm text-slate-700 leading-relaxed">
              {post.content}
            </p>

            {/* Verified Media Box */}
            {post.mediaTitle && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">{post.mediaTitle}</span>
                </div>
                <p className="text-xs text-slate-500 pl-6">{post.mediaSubtext}</p>
              </div>
            )}

            {/* Endorsed by Verified Ex-Employer Badge */}
            {post.hasVerifiedExEmployerEndorsement && post.endorsedByEmployer && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Endosso Validado por Ex-Empregador Contratual
                </div>
                <p className="text-slate-700 italic text-[11px]">
                  {post.endorsedByEmployer}
                </p>
              </div>
            )}

            {/* Interaction Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4 text-slate-400" />
                  <span>{post.likesCount} Reconhecimentos</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Comentários Auditados</span>
                </button>
              </div>

              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Publicação Verificada
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
