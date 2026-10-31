'use client';

import React, { useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowRight, BadgeCheck, Loader2, Sparkles } from 'lucide-react';
import type { EnterpriseChallenge } from '@/types';
import { CHALLENGE_PRESETS } from '@/data/challengePresets';
import { getMember } from '@/data/aseanCountries';
import { checkForDuplicateChallenge, saveChallenge } from '@/lib/store';
import {
  CHALLENGE_COUNTRIES,
  DATA_SENSITIVITIES,
  DURATION_OPTIONS,
  EMPTY_CHALLENGE_FORM,
  INDUSTRIES,
  challengeFormSchema,
  presetToFormValues,
  toEnterpriseChallenge,
  type ChallengeFormValues,
} from '@/lib/schemas/challenge';
import { CountryFlag } from '@/components/CountryFlag';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ChallengeFormProps {
  onSubmit: (challenge: EnterpriseChallenge) => void;
  onCancel: () => void;
}

export function ChallengeForm({ onSubmit, onCancel }: ChallengeFormProps) {
  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeFormSchema) as Resolver<ChallengeFormValues>,
    defaultValues: EMPTY_CHALLENGE_FORM,
    mode: 'onTouched',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<EnterpriseChallenge | null>(null);
  const [pendingValues, setPendingValues] = useState<ChallengeFormValues | null>(null);
  const country = useWatch({ control: form.control, name: 'country' });

  const processSubmission = (values: ChallengeFormValues) => {
    setIsSubmitting(true);
    const challenge = toEnterpriseChallenge(values);
    // Save challenge to storage for persistence and deal tracking
    saveChallenge(challenge);
    setTimeout(() => {
      onSubmit(challenge);
      setIsSubmitting(false);
    }, 350);
  };

  const handleValid = (values: ChallengeFormValues) => {
    if (!duplicateWarning) {
      const dupCheck = checkForDuplicateChallenge({ enterpriseName: values.enterpriseName, title: values.title });
      if (dupCheck.isDuplicate && dupCheck.existingChallenge) {
        setDuplicateWarning(dupCheck.existingChallenge);
        setPendingValues(values);
        return;
      }
    }
    processSubmission(values);
  };

  return (
    <div className="form-card">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-6">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-foreground">Tell us about your business problem</h1>
          <p className="mt-1 text-sm text-text-secondary">Describe what you want to solve so we can match you with the right tech startup.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* One-click demo scenarios */}
      <section aria-labelledby="presets-title" className="mb-8 rounded-2xl border border-border bg-background/40 p-4">
        <h2 id="presets-title" className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-blue">
          <Sparkles className="size-3.5" aria-hidden /> Try a real-world challenge
        </h2>
        <div className="flex flex-wrap gap-2">
          {CHALLENGE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                form.reset(presetToFormValues(p.data));
                setDuplicateWarning(null);
                setPendingValues(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors duration-200 ease-out hover:border-primary"
            >
              {p.isRealWorld && <BadgeCheck className="size-3.5 shrink-0 text-accent-blue" aria-label="Real-world challenge" />}
              <CountryFlag code={p.data.country} showLabel={false} />
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Duplicate submission warning */}
      {duplicateWarning && (
        <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-asean-yellow/40 bg-asean-yellow/10 p-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-accent-amber">
              <AlertTriangle className="size-4" aria-hidden /> A project with this name already exists
            </p>
            <p className="mt-1 text-[0.825rem] text-text-secondary">
              A project for <strong>{duplicateWarning.enterpriseName}</strong> called <em>&ldquo;{duplicateWarning.title}&rdquo;</em> is already saved.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDuplicateWarning(null)}>
              Edit form
            </Button>
            <Button type="button" size="sm" onClick={() => pendingValues && processSubmission(pendingValues)}>
              Proceed anyway <ArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleValid)} noValidate>
          <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Project title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Real-time fraud detection & alert assistant" {...field} />
                  </FormControl>
                  <FormDescription>A short name for what you want to achieve.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enterpriseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your company name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Maybank Digital Banking" autoComplete="organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your industry *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i} value={i}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country where this will run *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CHALLENGE_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          <CountryFlag code={c} showLabel={false} />
                          {getMember(c)?.name ?? c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedDurationWeeks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How long should the pilot run? *</FormLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl>
                      <SelectTrigger onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={String(d.value)}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="problemDescription"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>What problem are you trying to solve? *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what is slow, manual, or hard to do today, and why your current tools cannot handle it…" {...field} />
                  </FormControl>
                  <FormDescription>Explain what is slow, manual, or difficult today.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desiredOutcome"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>What does success look like? *</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-20" placeholder="e.g. Cut alert review time by 40%, catch fraud within 15 minutes…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technicalRequirementsText"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Key technical features needed</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Transaction monitoring, fraud screening, explainable AI" {...field} />
                  </FormControl>
                  <FormDescription>Separate features with commas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataSensitivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How confidential is your data?</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger onBlur={field.onBlur}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DATA_SENSITIVITIES.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budgetRangeUSD"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated project budget (USD)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="integrationConstraints"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Systems to connect & rules</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Read-only access to our database; data cannot leave our network" {...field} />
                  </FormControl>
                  <FormDescription>For example SAP, cloud storage, or on-premises servers.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiresLocalDataResidency"
              render={({ field }) => (
                <FormItem className="flex-row items-center justify-between gap-4 rounded-2xl border border-border p-4 md:col-span-2">
                  <div className="flex flex-col gap-1">
                    <FormLabel>Keep all data in-country</FormLabel>
                    <FormDescription>
                      All test data and processing must stay inside {getMember(country)?.name ?? country}.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-10 flex flex-wrap justify-end gap-3 border-t border-border pt-6">
            <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden /> Finding the best startups…
                </>
              ) : (
                <>
                  Find matching startups <ArrowRight aria-hidden />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
