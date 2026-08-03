import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { api, qk } from '../api/client';
import type { FeatureConfig, FeatureField, FeatureResponse } from '../api/types';
import { useChannels, useRoles } from '../hooks/useGuildQueries';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Select } from '../components/ui/Select';
import { Stepper } from '../components/ui/Stepper';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { SaveBar } from '../components/SaveBar';
import { cn } from '../lib/cn';

/** Removable chips + an add-select, for the channels/roles multi types. */
function MultiSelect({
  value, onChange, options, label,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  const byId = new Map(options.map((o) => [o.value, o.label]));
  const remaining = options.filter((o) => !value.includes(o.value));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {value.length === 0 && <span className="text-sm text-muted">None</span>}
        {value.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-elevated py-1 pl-3 pr-1.5 font-mono text-xs"
          >
            {byId.get(id) ?? id}
            <button
              type="button"
              aria-label={`Remove ${byId.get(id) ?? id}`}
              onClick={() => onChange(value.filter((v) => v !== id))}
              className="grid size-5 place-items-center rounded-pill text-muted hover:text-critical-text"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          </span>
        ))}
      </div>
      {remaining.length > 0 && (
        <Select
          label={`Add to ${label}`}
          showLabel={false}
          value=""
          placeholder="Add…"
          onChange={(v) => v && onChange([...value, v])}
          options={remaining}
          className="max-w-xs"
        />
      )}
    </div>
  );
}

function Field({
  field, value, onChange, channelOptions, roleOptions,
}: {
  field: FeatureField;
  value: unknown;
  onChange: (next: unknown) => void;
  channelOptions: { value: string; label: string }[];
  roleOptions: { value: string; label: string }[];
}) {
  const meta = (
    <div className="min-w-[12rem] flex-1">
      <p className="text-sm font-semibold">{field.label}</p>
      {field.description && <p className="mt-0.5 text-sm text-muted">{field.description}</p>}
    </div>
  );

  if (field.type === 'toggle') {
    return (
      <div className="flex items-center gap-4 border-t border-border py-3.5 first:border-t-0">
        {meta}
        <Toggle label={field.label} checked={Boolean(value)} onChange={onChange} />
      </div>
    );
  }
  if (field.type === 'number') {
    return (
      <div className="flex flex-wrap items-center gap-4 border-t border-border py-3.5 first:border-t-0">
        {meta}
        <Stepper
          label={field.label} unit={field.unit}
          value={Number(value ?? field.min ?? 0)}
          min={field.min ?? 0} max={field.max ?? 1000} step={field.step ?? 1}
          onChange={onChange}
        />
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div className="flex flex-wrap items-center gap-4 border-t border-border py-3.5 first:border-t-0">
        {meta}
        <Select
          label={field.label} showLabel={false}
          value={String(value ?? '')} onChange={onChange}
          options={field.options ?? []} className="max-w-xs"
        />
      </div>
    );
  }
  if (field.type === 'channel' || field.type === 'role') {
    return (
      <div className="flex flex-wrap items-center gap-4 border-t border-border py-3.5 first:border-t-0">
        {meta}
        <Select
          label={field.label} showLabel={false}
          value={String(value ?? '')} placeholder="None"
          onChange={(v) => onChange(v || null)}
          options={field.type === 'channel' ? channelOptions : roleOptions}
          className="max-w-xs"
        />
      </div>
    );
  }
  if (field.type === 'channels' || field.type === 'roles') {
    return (
      <div className="border-t border-border py-3.5 first:border-t-0">
        <p className="text-sm font-semibold">{field.label}</p>
        {field.description && <p className="mt-0.5 text-sm text-muted">{field.description}</p>}
        <div className="mt-2.5">
          <MultiSelect
            label={field.label}
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={onChange}
            options={field.type === 'channels' ? channelOptions : roleOptions}
          />
        </div>
      </div>
    );
  }
  // text / textarea
  return (
    <div className="border-t border-border py-3.5 first:border-t-0">
      <label className="text-sm font-semibold" htmlFor={`f-${field.key}`}>{field.label}</label>
      {field.description && <p className="mt-0.5 text-sm text-muted">{field.description}</p>}
      <textarea
        id={`f-${field.key}`}
        value={String(value ?? '')}
        maxLength={field.maxLength}
        rows={field.type === 'textarea' ? 3 : 1}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'mt-2 w-full rounded-ctrl border border-border-strong bg-elevated px-3 py-2 text-sm',
          field.type === 'textarea' ? 'min-h-[84px] resize-y' : '',
        )}
      />
    </div>
  );
}

export function FeaturePage({ feature }: { feature: string }) {
  const { guildId = '' } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.feature(guildId, feature),
    queryFn: () => api.getFeature(guildId, feature),
  });
  const { data: channels } = useChannels(guildId);
  const { data: roles } = useRoles(guildId);

  const [draft, setDraft] = useState<FeatureConfig | null>(null);
  useEffect(() => { if (query.data) setDraft(query.data.config); }, [query.data]);

  const dirty = useMemo(
    () => Boolean(draft && query.data && JSON.stringify(draft) !== JSON.stringify(query.data.config)),
    [draft, query.data],
  );

  const save = useMutation({
    mutationFn: (patch: FeatureConfig) => api.patchFeature(guildId, feature, patch),
    onSuccess: (res: FeatureResponse) => {
      qc.setQueryData(qk.feature(guildId, feature), res);
      setDraft(res.config);
      toast({ tone: 'success', title: 'Saved', description: `${res.schema.title} is up to date.` });
    },
    onError: (e: Error) =>
      toast({
        tone: 'error', title: 'Could not save', description: e.message,
        action: { label: 'Retry', onClick: () => draft && save.mutate(draft) },
      }),
  });

  const channelOptions = (channels ?? [])
    .filter((c) => c.type === 'text')
    .map((c) => ({ value: c.id, label: `#${c.name}` }));
  const roleOptions = (roles ?? []).map((r) => ({ value: r.id, label: r.name }));

  if (query.isError) {
    return (
      <Card tone="critical" className="p-5">
        <p className="font-semibold text-critical-text">Could not load this section</p>
        <p className="mt-1 text-sm text-muted">{(query.error as Error).message}</p>
        <Button variant="secondary" className="mt-3" onClick={() => void query.refetch()}>Try again</Button>
      </Card>
    );
  }
  if (query.isPending || !draft || !query.data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-52 w-full rounded-card" />)}
      </div>
    );
  }

  const { schema } = query.data;
  const set = (key: string, val: unknown) => setDraft((d) => (d ? { ...d, [key]: val } : d));

  return (
    <div className="space-y-5 pb-28">
      <header>
        <h1 className="text-xl font-bold tracking-tight">{schema.title}</h1>
        <p className="mt-1 max-w-prose text-sm text-muted">{schema.description}</p>
      </header>

      {schema.sections.map((section) => (
        <Card as="section" key={section.title} className="p-5">
          <h2 className="text-base font-bold">{section.title}</h2>
          {section.description && <p className="mt-1 max-w-prose text-sm text-muted">{section.description}</p>}
          <div className="mt-3">
            {section.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={draft[field.key]}
                onChange={(val) => set(field.key, val)}
                channelOptions={channelOptions}
                roleOptions={roleOptions}
              />
            ))}
          </div>
        </Card>
      ))}

      {dirty && (
        <SaveBar
          saving={save.isPending}
          onDiscard={() => setDraft(query.data!.config)}
          onSave={() => save.mutate(draft)}
        />
      )}
    </div>
  );
}
