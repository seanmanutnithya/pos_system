// Page title and description, with the page's main buttons on the right
const PageHeader = ({ title, description, actions }) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="min-w-0">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
    {actions}
  </div>
);

export default PageHeader;
