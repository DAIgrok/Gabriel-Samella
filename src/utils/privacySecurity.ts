// Privacy grace window manager so native file pickers and OS permission dialogs
// on Android/desktop do not falsely trigger lock-on-exit while keeping instant
// blackout & auto-lock on every real app/tab exit.

let filePickerGraceUntil = 0;
let systemPromptGraceUntil = 0;

export function markFilePickerOpen(durationMs = 45_000): void {
  filePickerGraceUntil = Math.max(filePickerGraceUntil, Date.now() + durationMs);
}

export function markSystemPromptOpen(durationMs = 15_000): void {
  systemPromptGraceUntil = Math.max(systemPromptGraceUntil, Date.now() + durationMs);
}

export function clearSecurityGrace(): void {
  filePickerGraceUntil = 0;
  systemPromptGraceUntil = 0;
}

export function isFilePickerGraceActive(): boolean {
  return Date.now() < filePickerGraceUntil;
}

export function isSecurityGraceActive(): boolean {
  const now = Date.now();
  return now < filePickerGraceUntil || now < systemPromptGraceUntil;
}
