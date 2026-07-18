// Cola aqui a URL e a chave do TEU projeto Supabase.
// Supabase Dashboard > Project Settings > API Keys > Publishable key.
// Sim, esse arquivo vai pro GitHub com a chave dentro — tudo bem, essa chave
// é feita pra ficar exposta no navegador (a proteção de verdade é o RLS no banco,
// não o segredo da chave). NÃO cole aqui a "secret key" (sb_secret_...), essa é privada.

window.OBSIDIAN_CONFIG = {
  SUPABASE_URL: "COLE_AQUI_A_URL_DO_SEU_PROJETO",
  SUPABASE_ANON_KEY: "COLE_AQUI_A_PUBLISHABLE_KEY",
};
