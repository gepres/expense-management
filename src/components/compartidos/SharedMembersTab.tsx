/**
 * Tab de Miembros del grupo
 */

import { useState } from 'react';
import { SharedService } from '@services/shared';
import type { SharedExpenseGroup, GroupStats } from '@app-types/shared';
import { Crown, UserMinus, TrendingUp, TrendingDown, UserPlus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import InviteMemberModal from './InviteMemberModal';
import Modal, { ModalFooterActions } from '@components/common/Modal';

interface Props {
  group: SharedExpenseGroup;
  stats: GroupStats | null;
  isCreator: boolean;
  onMemberRemoved: () => void;
  currencySymbol: string;
}

export default function SharedMembersTab({
  group,
  stats,
  isCreator,
  onMemberRemoved,
  currencySymbol,
}: Props) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{id: string, name: string} | null>(null);

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await SharedService.removeMember(group.id, memberToRemove.id);
      toast.success(`${memberToRemove.name} ha sido eliminado del grupo`);
      setMemberToRemove(null);
      onMemberRemoved();
    } catch (error) {
      toast.error('Error al eliminar miembro');
    }
  };

  // Get member stats
  const getMemberStats = (odId: string) => {
    return stats?.memberStats?.find(m => m.odId === odId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Miembros</h3>
          <p className="text-sm text-muted-foreground">
            {group.members.length} {group.members.length === 1 ? 'persona' : 'personas'}
          </p>
        </div>
        {isCreator && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Invitar
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {group.members.map((memberItem, index) => {
          // Handle both string IDs and full member objects
          const member = typeof memberItem === 'string'
            ? { odId: memberItem, name: '', email: '', role: 'member' as const, joinedAt: new Date() }
            : memberItem;

          const memberStats = getMemberStats(member.odId);
          const isCreatorMember = member.role === 'creator' || member.odId === group.createdBy;

          // Get display name from member stats if not in member object
          const displayName = member.name || memberStats?.name || 'Usuario';

          return (
            <div
              key={member.odId || index}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
            >
              {/* Avatar */}
              {member.photoURL || memberStats?.photoURL ? (
                <img
                  src={member.photoURL || memberStats?.photoURL}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{displayName}</p>
                  {isCreatorMember && (
                    <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>

                {/* Stats */}
                {memberStats && (
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      {currencySymbol} {memberStats.contributed.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="h-3 w-3" />
                      {currencySymbol} {memberStats.spent.toLocaleString()}
                    </span>
                    {memberStats.balance !== 0 && (
                      <span className={`font-medium ${
                        memberStats.balance > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {memberStats.balance > 0 ? 'Recibe' : 'Debe'}: {currencySymbol} {Math.abs(memberStats.balance).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Remove Button (only for creator, can't remove self) */}
              {isCreator && !isCreatorMember && (
                <button
                  onClick={() => setMemberToRemove({id: member.odId, name: displayName})}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Eliminar del grupo"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Settlement Summary */}
      {stats?.memberStats?.some(m => m.balance !== 0) && (
        <div className="mt-6 p-4 bg-muted/50 rounded-xl">
          <h4 className="font-medium text-sm mb-3">Resumen de deudas</h4>
          <div className="space-y-2 text-sm">
            {stats.memberStats
              .filter(m => m.balance < 0)
              .map((debtor) => {
                const creditor = stats.memberStats.find(m => m.balance > 0);
                if (!creditor) return null;

                return (
                  <div key={debtor.odId} className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {debtor.name} → {creditor.name}
                    </span>
                    <span className="font-medium">
                      {currencySymbol} {Math.abs(debtor.balance).toLocaleString()}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={group.id}
        invitationLink={group.invitationLink}
      />

      {/* Modal de confirmación para eliminar miembro */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title="¿Eliminar miembro?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setMemberToRemove(null)}
            onConfirm={handleRemoveMember}
            cancelText="Cancelar"
            confirmText="Eliminar"
            confirmVariant="destructive"
          />
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de eliminar a <strong>{memberToRemove?.name}</strong> del grupo?
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
