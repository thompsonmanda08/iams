import React, { ReactElement } from "react";

function PageHeader({
  title,
  description,
  Icon,
  hideBackButton = false
}: {
  title: string;
  description: string;
  Icon: React.ReactElement;
  hideBackButton?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="from-primary to-primary/80 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg">
        <Icon className="text-primary-foreground h-7 w-7" />
      </div>
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

export default PageHeader;
