// Anbindung an den Service Worker (vite-plugin-pwa).
// Ein neues Update wird nur gemeldet; installiert wird es erst, wenn die
// Person „Jetzt aktualisieren“ wählt – nie mitten in einer Sitzung.
import { registerSW } from 'virtual:pwa-register';

export const offline = $state({
  /** Die App ist vollständig gespeichert und startet ohne Netz. */
  bereit: false,
  /** Eine neue Version liegt bereit und wartet auf Zustimmung. */
  updateBereit: false,
});

let aktualisieren: ((neuLaden?: boolean) => Promise<void>) | undefined;

export function offlineStarten(): void {
  if (!('serviceWorker' in navigator)) return;
  aktualisieren = registerSW({
    onOfflineReady() {
      offline.bereit = true;
    },
    onNeedRefresh() {
      offline.updateBereit = true;
    },
  });
}

/** Neue Version aktivieren und die Seite neu laden. */
export async function updateInstallieren(): Promise<void> {
  await aktualisieren?.(true);
}

/** Hinweis ausblenden; das Update wird beim nächsten Start erneut angeboten. */
export function updateSpaeter(): void {
  offline.updateBereit = false;
}
