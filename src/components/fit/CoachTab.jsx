import { useState } from "react";
import ChatPanel from "./ChatPanel";
import CheckinForm from "./CheckinForm";

export default function CoachTab({ plan }) {
  const [draft, setDraft] = useState("");

  return (
    <div className="max-w-lg mx-auto px-5 py-5 space-y-5">
      <ChatPanel plan={plan} onDraftReady={setDraft} />
      <CheckinForm plan={plan} draft={draft} onDrafted={setDraft} />
    </div>
  );
}
