import FeatureTierBadge from "./FeatureTierBadge";
export default function PageHeader({ title, subtitle, tier, actions }) {
  return <div className="page-header-standard"><div><div className="page-title-row"><h2>{title}</h2><FeatureTierBadge tier={tier}/></div>{subtitle ? <p>{subtitle}</p> : null}</div>{actions ? <div className="page-actions">{actions}</div> : null}</div>;
}
