import React, { useState } from 'react';
import { AuthUser, JobAnnouncement } from '../../types';
import { Modal } from '../common/Modal';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onCreate: (announcement: JobAnnouncement) => void;
}

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreate,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Jardins, São Paulo');
  const [newDistanceKm, setNewDistanceKm] = useState('1.8');
  const [newSchedule, setNewSchedule] = useState('Segunda a Sexta · 08h às 17h');
  const [newContractType, setNewContractType] = useState<JobAnnouncement['contractType']>('diario');
  const [newRate, setNewRate] = useState('350');
  const [newDescription, setNewDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedDistance = Math.max(0.5, Number(newDistanceKm) || 2.0);
    const parsedRate = Math.max(50, Number(newRate) || 350);

    const created: JobAnnouncement = {
      id: `ann-${crypto.randomUUID().slice(0, 8)}`,
      title: newTitle.trim(),
      employerId: currentUser.id,
      employerName: `${currentUser.name} (Família Verilar)`,
      employerType: 'Família Cadastrada · Verilar',
      location: `${newLocation.trim()} · ${parsedDistance.toFixed(1)} km de você`,
      distanceKm: parsedDistance,
      workSchedule: newSchedule.trim(),
      contractType: newContractType,
      rateDescription:
        newContractType === 'mensal_fixo'
          ? `R$ ${parsedRate.toLocaleString('pt-BR')} / mês`
          : `R$ ${parsedRate.toLocaleString('pt-BR')} / diária`,
      rateAmount: parsedRate,
      postedAt: 'Agora mesmo',
      status: 'active',
      urgency: isUrgent,
      description:
        newDescription.trim() ||
        'Oportunidade para profissional verificada na Verilar.',
      responsibilities: [
        'Atendimento pontual conforme rotina combinada no chat',
        'Cuidado e zelo no ambiente residencial da família',
      ],
      requiredBadges: [
        'Documento Oficial + Selfie (Camada 1)',
        'Certidão Polícia Federal válida 90 dias (Camada 2)',
      ],
      benefits: [
        'Pagamento via Plataforma Verilar ou Pix (0% comissão)',
        'Avaliação pública de 1 a 5 estrelas após o serviço',
      ],
      applicants: [],
    };

    onCreate(created);
    setNewTitle('');
    setNewDescription('');
    setIsUrgent(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Vaga para Residência"
      maxWidthClass="max-w-lg"
      headerBadge={
        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
          PUBLICAR NOVO ANÚNCIO DE VAGA
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
        <div>
          <label htmlFor="ann-title" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Título da Vaga / Anúncio:
          </label>
          <input
            id="ann-title"
            type="text"
            required
            placeholder="Ex: Cuidadora Diurna Especialista em Parkinson"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-brand"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ann-contract-type" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Tipo de Contrato:
            </label>
            <select
              id="ann-contract-type"
              value={newContractType}
              onChange={(e) => setNewContractType(e.target.value as JobAnnouncement['contractType'])}
              className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-brand bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="diario">Plantão Diário</option>
              <option value="mensal_fixo">Vaga Mensal CLT</option>
              <option value="plantao_urgencia">Plantão de Urgência</option>
            </select>
          </div>

          <div>
            <label htmlFor="ann-rate" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Remuneração (R$):
            </label>
            <input
              id="ann-rate"
              type="number"
              min={50}
              required
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-brand tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="ann-location" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Localidade / Bairro:
            </label>
            <input
              id="ann-location"
              type="text"
              required
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="ann-distance" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Distância (km):
            </label>
            <input
              id="ann-distance"
              type="number"
              step={0.1}
              min={0.5}
              max={30}
              value={newDistanceKm}
              onChange={(e) => setNewDistanceKm(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-brand tabular-nums"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ann-schedule" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Escala de Trabalho:
          </label>
          <input
            id="ann-schedule"
            type="text"
            required
            value={newSchedule}
            onChange={(e) => setNewSchedule(e.target.value)}
            className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-brand"
          />
        </div>

        <div>
          <label htmlFor="ann-description" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Descrição detalhada das necessidades:
          </label>
          <textarea
            id="ann-description"
            rows={3}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Descreva as condições da residência, rotina do assistido e requisitos esperados..."
            className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
          <input
            type="checkbox"
            id="urgentCheck"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
            className="rounded text-brand focus:ring-brand"
          />
          <label htmlFor="urgentCheck" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
            Marcar como Plantão de Urgência Prioritário (Notificação no Radar)
          </label>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs cursor-pointer"
          >
            Publicar Anúncio & Criar Aba
          </button>
        </div>
      </form>
    </Modal>
  );
};
