/**
 * Pre-hydration script that resolves the theme (`dark` default) from
 * localStorage and applies it to `<html>` before React mounts. Eliminates
 * the dreaded "flash of wrong theme" on first paint.
 */

const THEME_INIT_SCRIPT = `(function(){try{var k="keyra_admin_prefs";var t="dark";var r=localStorage.getItem(k);if(r){var prefs=JSON.parse(r);if(prefs&&prefs.theme==="light")t="light";}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme="dark";document.documentElement.style.colorScheme="dark";}})();`;

export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
