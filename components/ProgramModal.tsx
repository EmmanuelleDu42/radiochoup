"use client";

import Image from "next/image";
import { Modal } from "@/components/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProgramModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Programmation musicale de la semaine" titleId="program-title" maxWidthClass="max-w-3xl">
      <Image
        src="/img/programmation.jpg"
        alt="Grille de programmation"
        width={700}
        height={500}
        className="mx-auto h-auto w-full max-w-2xl"
      />
    </Modal>
  );
}
