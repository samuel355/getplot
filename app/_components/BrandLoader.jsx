import { LogoMain } from "./Logo";

export default function BrandLoader({ label = "Loading your experience..." }) {
  return (
    <div className="brand-loader" role="status" aria-label={label}>
      <div className="brand-loader-orbit" aria-hidden="true">
        <span />
      </div>
      <div className="brand-loader-logo">
        <LogoMain variant="light" height={92} />
      </div>
      <p className="brand-loader-label">{label}</p>
      <div className="brand-loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
