import { useState } from "react";
import ChatPanel from "./ChatPanel";
import CheckinForm from "./CheckinForm";

export default function CoachTab({ plan }) {
  const [draft, setDraft] = useState("");

  return (
    <div className="px-4 py-4 space-y-5">
      <div>
        <div className="text-[11px] text-fg-muted uppercase tracking-wider">
          ai coach
        </div>
        <h1 className="text-xl text-fg mt-1">
          <span className="text-amber">$</span> chat
        </h1>
      </div>

      <ChatPanel plan={plan} onDraftReady={setDraft} />

      <CheckinForm plan={plan} draft={draft} onDrafted={setDraft} />
    </div>
  );
}
