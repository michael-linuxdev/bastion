// Schriftgröße der App (O19): drei Stufen, gespeichert als Einstellung. Wirkt über die
// Grundgröße an <html>; alle Maße der Oberfläche sind in rem und wachsen mit.
import type { SchriftStufe } from '../../core/policy/einstellung';

const GROESSE: Record<SchriftStufe, string> = {
  normal: '',
  gross: '112.5%',
  'sehr-gross': '125%',
};

export const schrift = $state<{ stufe: SchriftStufe }>({ stufe: 'normal' });

export function schriftAnwenden(stufe: SchriftStufe): void {
  schrift.stufe = stufe;
  document.documentElement.style.fontSize = GROESSE[stufe];
}
