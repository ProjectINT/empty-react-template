/**
 * Minimal, dependency-free toast bus.
 *
 * A module-level pub/sub so any layer (the Palistor notifier, row actions) can
 * surface a message without prop drilling. The <Toaster /> component subscribes
 * and renders the queue.
 */

export type ToastVariant = "error" | "success" | "info";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

type Listener = (items: ToastItem[]) => void;

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l(items);
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(items);
  return () => {
    listeners.delete(listener);
  };
}

export function pushToast(message: string, variant: ToastVariant = "info"): number {
  const id = ++seq;
  items = [...items, { id, message, variant }];
  emit();
  setTimeout(() => dismissToast(id), 5000);
  return id;
}

export function dismissToast(id: number): void {
  items = items.filter((i) => i.id !== id);
  emit();
}
