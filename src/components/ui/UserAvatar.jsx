export default function UserAvatar({ profile, size = "md" }) {
  const name = profile?.full_name || "User";
  if (profile?.avatar_url) return <img className={`user-avatar avatar-${size}`} src={profile.avatar_url} alt={`${name} profile`} />;
  return <div className={`user-avatar avatar-${size} avatar-fallback`} aria-label={`${name} profile`}>{name.slice(0, 1).toUpperCase()}</div>;
}
