import { PropsWithChildren } from 'react';
import './Panel.css';

type Props = PropsWithChildren<{
  title: string;
  actions?: React.ReactNode;
  subtitle?: string;
}>;

export function Panel({ title, actions, children, subtitle }: Props) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="panel-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}
