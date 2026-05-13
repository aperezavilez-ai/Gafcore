// Shared GafSuite brand tokens for emails.
// Email body MUST be white (#ffffff). Use brand colors for accents only.
export const brand = {
  name: 'GafCore',
  primary: '#3b82f6', // electric blue
  primaryDark: '#1d4ed8',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  surface: '#f8fafc',
}

export const styles = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  brandHeader: {
    fontSize: '20px',
    fontWeight: 700 as const,
    color: brand.primary,
    letterSpacing: '-0.01em',
    margin: '0 0 32px',
  },
  card: {
    border: `1px solid ${brand.border}`,
    borderRadius: '12px',
    padding: '32px 28px',
    backgroundColor: '#ffffff',
  },
  h1: {
    fontSize: '24px',
    fontWeight: 700 as const,
    color: brand.text,
    margin: '0 0 16px',
    letterSpacing: '-0.02em',
  },
  text: {
    fontSize: '15px',
    color: brand.text,
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  link: { color: brand.primary, textDecoration: 'underline' },
  button: {
    backgroundColor: brand.primary,
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600 as const,
    borderRadius: '10px',
    padding: '14px 28px',
    textDecoration: 'none',
    display: 'inline-block',
    margin: '8px 0 24px',
  },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '24px',
    fontWeight: 700 as const,
    color: brand.text,
    backgroundColor: brand.surface,
    border: `1px solid ${brand.border}`,
    borderRadius: '8px',
    padding: '14px 20px',
    letterSpacing: '0.15em',
    display: 'inline-block',
    margin: '8px 0 24px',
  },
  divider: {
    border: 'none',
    borderTop: `1px solid ${brand.border}`,
    margin: '28px 0',
  },
  footer: {
    fontSize: '12px',
    color: brand.muted,
    lineHeight: '1.5',
    margin: '24px 0 0',
    textAlign: 'center' as const,
  },
}
