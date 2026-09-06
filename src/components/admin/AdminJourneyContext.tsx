'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Circle } from 'lucide-react';
import { getAdminRoute, subscribeToAdminRoute } from '@/lib/admin-route';
import { getJourneyForWorkspace, getJourneyStage } from '@/lib/admin-journeys';

export function AdminJourneyContext() {
  const [route, setRoute] = useState(() => getAdminRoute());

  useEffect(() => subscribeToAdminRoute(setRoute), []);

  const journey = useMemo(() => getJourneyForWorkspace(route.workspace), [route.workspace]);
  const stage = journey ? getJourneyStage(journey, route.workspace, route.entity) : undefined;
  if (!journey || !stage) return null;

  const stageIndex = journey.stages.findIndex((item) => item.id === stage.id);

  return (
    <section
      aria-label="Contexte de parcours opérationnel"
      className="border-b border-border bg-muted/30 px-4 py-2 sm:px-6"
      data-admin-journey={journey.id}
    >
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 overflow-x-auto whitespace-nowrap">
        <div className="shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Parcours
          </p>
          <p className="text-xs font-semibold text-foreground">{journey.label}</p>
        </div>
        <div className="h-7 w-px shrink-0 bg-border" aria-hidden="true" />
        <ol className="flex min-w-0 items-center gap-1" aria-label="Étapes du parcours">
          {journey.stages.map((item, index) => {
            const current = index === stageIndex;
            const completed = index < stageIndex;
            return (
              <li key={item.id} className="flex items-center gap-1">
                {index > 0 && <span className="mx-1 text-muted-foreground" aria-hidden="true">→</span>}
                <span
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs ${current ? 'bg-background font-semibold text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground'}`}
                  aria-current={current ? 'step' : undefined}
                >
                  {completed ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Circle className="h-3.5 w-3.5" aria-hidden="true" />}
                  {item.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default AdminJourneyContext;
