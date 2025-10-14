// apps/admin/src/components/DeleteTeamButton.tsx
import React from "react";
import { supabase } from "../lib/supabase";

type Props = {
  teamId: string;
  teamName: string;
  onDeleted?: () => void;
};

export default function DeleteTeamButton({ teamId, teamName, onDeleted }: Props) {
  async function handleClick() {
    const ok = window.confirm(
      `Supprimer définitivement l’équipe « ${teamName} » ? (irréversible)`
    );
    if (!ok) return;

    // Appelle la RPC sécurisée côté DB (vérifie GM à l’intérieur)
    const { error } = await supabase.rpc("delete_team", { team_id: teamId });
    if (error) {
      alert(`Suppression impossible: ${error.message}`);
      return;
    }
    alert(`Équipe « ${teamName} » supprimée`);
    onDeleted?.();
  }

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "6px 10px",
        border: "1px solid #b91c1c",
        color: "#b91c1c",
        borderRadius: 6,
        background: "white",
        cursor: "pointer",
      }}
      title="Supprimer l’équipe"
    >
      Supprimer
    </button>
  );
}
