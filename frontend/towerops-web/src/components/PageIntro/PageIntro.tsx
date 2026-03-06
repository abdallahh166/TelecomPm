import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: PageIntroProps) {
  return (
    <section className="page-intro">
      <div className="space-y-3">
        {eyebrow ? <span className="page-intro__eyebrow">{eyebrow}</span> : null}
        <div className="space-y-2">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      {actions ? <div className="page-intro__actions">{actions}</div> : null}
    </section>
  );
}
