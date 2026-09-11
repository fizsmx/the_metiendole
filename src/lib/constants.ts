// Único Administrador y Creador Oficial del Podcast Metele Nomás
export const SUPER_ADMIN_EMAILS: string[] = [
  'fisbertdarck@gmail.com',
  'fisbert.smx@gmail.com',
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return (
    SUPER_ADMIN_EMAILS.includes(normalized) ||
    (process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase().trim() === normalized : false)
  );
}
