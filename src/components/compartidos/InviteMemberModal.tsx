/**
 * Modal reutilizable para invitar miembros a un grupo
 */

import Modal from '@components/common/Modal';
import InviteLinkButton from './InviteLinkButton';
import { Share2 } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  invitationLink?: string;
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  groupId,
  invitationLink,
}: InviteMemberModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invitar miembros"
      subtitle="Comparte el enlace con las personas que quieres invitar"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Share2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <InviteLinkButton groupId={groupId} invitationLink={invitationLink} />
      </div>
    </Modal>
  );
}
