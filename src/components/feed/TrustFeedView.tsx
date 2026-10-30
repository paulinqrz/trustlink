import React, { useState } from 'react';
import { AuthUser, FeedPost } from '../../types';
import { getInitials } from '../../services/trustlinkService';
import { useToast } from '../common/ToastContext';
import {
  ShieldCheck,
  Award,
  ThumbsUp,
  MessageSquare,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface TrustFeedViewProps {
  currentUser: AuthUser;
  posts: FeedPost[];
  onCreatePost: (post: FeedPost) => void;
  onLikePost: (postId: string) => void;
}

export const TrustFeedView: React.FC<TrustFeedViewProps> = ({
  currentUser,
  posts,
  onCreatePost,
  onLikePost,
}) => {
  const { showToast } = useToast();
  const [newContent, setNewContent] = useState('');
  const [postType, setPostType] = useState<FeedPost['type']>('certification');
  const [titleInput, setTitleInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newPost: FeedPost = {
      id: `pst-${crypto.randomUUID().slice(0, 8)}`,
      authorId: currentUser.freelancerProfileId || currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.title,
      authorCategory: currentUser.role === 'freelancer' ? 'Profissional Verificado' : 'Família Auditada',
      avatarSeed: currentUser.name.toLowerCase(),
      verifiedBadgesCount: 4,
      createdAt: 'Agora mesmo',
      content: newContent.trim(),
      type: postType,
      mediaTitle:
        titleInput.trim() ||
        (postType === 'certification'
          ? 'Novo Certificado Profissional Auditado'
          : 'Registro de Rotina Humanizada'),
      mediaSubtext: 'Comprovante verificado pelo comitê de integridade TrustLink',
      likesCount: 1,
      endorsementsCount: 0,
      hasVerifiedExEmployerEndorsement: false,
    };

    onCreatePost(newPost);
    setNewContent('');
    setTitleInput('');
    setShowCreateModal(false);
    showToast('Publicação adicionada ao Feed da Confiança!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span>Rede de Conquistas e Validações</span>
            <span>·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Registros Auditados
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Linha do Tempo Profissional & Conquistas
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Compartilhamento transparente de certificações, rotinas clínicas e validações públicas de contratantes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal((prev) => !prev)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-brand hover:bg-slate-800 dark:hover:bg-brand-hover rounded-lg transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Publicar Conquista / Rotina
        </button>
      </div>

      {showCreateModal && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Publicar como {currentUser.name}
            </h3>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label htmlFor="feed-post-type" className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Categoria do Registro
                </label>
                <select
                  id="feed-post-type"
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as FeedPost['type'])}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="certification">Novo Certificado / Curso Especializado</option>
                  <option value="daily_routine">Rotina de Trabalho / Metodologia de Cuidado</option>
                  <option value="milestone">Marco Profissional (ex: 500h de plantão)</option>
                </select>
              </div>

              <div>
                <label htmlFor="feed-post-title" className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Título do Documento / Tema
                </label>
                <input
                  id="feed-post-title"
                  type="text"
                  placeholder="Ex: Certificação em Cuidados Paliativos - USP"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="feed-post-content" className="block text-slate-700 dark:text-slate-300 font-medium text-xs mb-1">
                Texto da Publicação
              </label>
              <textarea
                id="feed-post-content"
                rows={3}
                required
                placeholder="Conte sobre o aprendizado, a rotina aplicada ou a melhoria no atendimento aos assistidos..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-brand rounded-lg hover:bg-slate-800 dark:hover:bg-brand-hover cursor-pointer"
              >
                Publicar no Feed
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-5">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold flex items-center justify-center text-sm border border-transparent dark:border-slate-700">
                  {getInitials(post.authorName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{post.authorName}</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" /> Auditado(a)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {post.authorRole} · {post.createdAt}
                  </p>
                </div>
              </div>

              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                {post.type === 'certification'
                  ? 'Certificação Formal'
                  : post.type === 'milestone'
                  ? 'Marco Profissional'
                  : 'Rotina Verificada'}
              </span>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{post.content}</p>

            {post.mediaTitle && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{post.mediaTitle}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-6">{post.mediaSubtext}</p>
              </div>
            )}

            {post.hasVerifiedExEmployerEndorsement && post.endorsedByEmployer && (
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Endosso Validado por Ex-Empregador Contratual
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic text-[11px]">{post.endorsedByEmployer}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onLikePost(post.id)}
                  className="flex items-center gap-1.5 hover:text-brand dark:hover:text-sky-400 transition-colors cursor-pointer tabular-nums"
                >
                  <ThumbsUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>{post.likesCount} Reconhecimentos</span>
                </button>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Comentários Auditados</span>
                </span>
              </div>

              <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Publicação Verificada
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
