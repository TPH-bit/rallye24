// apps/admin/src/components/DeleteTeamButton.jsx
import { supabase } from "../lib/supabase";

export function DeleteTeamButton({
  teamId,
  teamName,
  onDeleted = () => {},
}) {
  async function handleClick() {
    if (!confirm(`Supprimer définitivement "${teamName}" ?`)) return;

    // Appelle la RPC delete_team(team_id uuid)
    const { error } = await supabase.rpc("delete_team", { team_id: teamId });

    if (error) {
      alert("Suppression impossible: " + error.message);
      return;
    }
    alert(`Équipe "${teamName}" supprimée.`);
    onDeleted();
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: "#d62828",
        color: "white",
        border: 0,
        padding: "6px 10px",
        borderRadius: 6,
        cursor: "pointer",
      }}
      title="Supprimer l'équipe"
    >
      Supprimer
    </button>
  );
}

