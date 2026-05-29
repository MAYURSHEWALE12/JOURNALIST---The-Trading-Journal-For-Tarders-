export default function LogoIcon({ className, isDark }: { className?: string; isDark: boolean }) {
  return (
    <img
      src={isDark ? '/logo-dark.png' : '/logo-light.png'}
      alt="Journalist logo"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
