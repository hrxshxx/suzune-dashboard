import { Link } from 'react-router-dom';
import {
  ArrowLeft, Hammer, List, ScanLine, ShieldCheck, Sparkles,
  Ticket, TrendingUp, UserPlus, Wrench,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '../components/Logo';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SUPPORT_INVITE } from '../lib/brand';

interface Command { name: string; args?: string; desc: string; }
interface Section {
  id: string; title: string; icon: ReactNode; intro: string;
  prevents?: string; commands: Command[];
}

const SECTIONS: Section[] = [
  {
    id: 'getting-started', title: 'Getting started', icon: <ScanLine className="size-5" />,
    intro:
      'Invite Suzune, then run /scan to get a graded audit of your server and a checklist of exactly what to fix. Open the dashboard from /dashboard or the button on this site to configure everything visually.',
    commands: [
      { name: '/scan', desc: 'Audit the server and return a letter grade with prioritised findings.' },
      { name: '/dashboard', desc: 'Get a link to this web dashboard for the server.' },
      { name: '/tutorial', desc: 'A guided walkthrough of first-time setup.' },
      { name: '/help', args: '[command]', desc: 'Browse every command, or details for one.' },
      { name: '/config', desc: 'View the current configuration at a glance.' },
    ],
  },
  {
    id: 'anti-nuke', title: 'Anti-Nuke', icon: <ShieldCheck className="size-5" />,
    intro:
      'The flagship. Suzune watches destructive actions per executor inside sliding time windows and punishes whoever crosses a limit — then can revert the damage and post to an alert channel. Configure it fully on the Anti-Nuke page of the dashboard.',
    prevents:
      'Mass channel/role deletion, mass bans and kicks, admin-permission grabs, rogue webhooks and bot adds, vanity and server-setting tampering — including by a compromised administrator.',
    commands: [
      { name: '/antinuke', desc: 'Open the Anti-Nuke control panel in Discord.' },
      { name: '/lockserver', args: '[panic]', desc: 'Break-glass: lock the whole server immediately.' },
      { name: '/unlockserver', desc: 'Lift a server-wide lockdown.' },
      { name: '/lockdown', desc: 'Lock the current channel so @everyone cannot post.' },
      { name: '/unlock', desc: 'Unlock the current channel.' },
    ],
  },
  {
    id: 'moderation', title: 'Moderation', icon: <Hammer className="size-5" />,
    intro:
      'A full moderation suite with a searchable case history. Every action becomes a numbered case and can optionally DM the user and post to your mod-log.',
    prevents: 'Rule-breakers slipping through with no paper trail; inconsistent punishments across your staff.',
    commands: [
      { name: '/ban', args: '<user> [reason] [delete_days]', desc: 'Ban a user, optionally clearing recent messages.' },
      { name: '/tempban', args: '<user> <duration> [reason]', desc: 'Ban for a limited time, then auto-unban.' },
      { name: '/softban', args: '<user> [reason]', desc: 'Ban then unban to wipe a user’s recent messages.' },
      { name: '/kick', args: '<user> [reason]', desc: 'Kick a member.' },
      { name: '/timeout', args: '<user> <duration> [reason]', desc: 'Native Discord timeout.' },
      { name: '/mute', args: '<user> [reason]', desc: 'Apply the configured mute role.' },
      { name: '/warn', args: '<user> <reason>', desc: 'Warn a member; adds a case.' },
      { name: '/warnings', args: '<user>', desc: 'List a member’s moderation history.' },
      { name: '/case', args: '<number>', desc: 'View or edit a specific case.' },
      { name: '/purge', args: '<number> [user]', desc: 'Bulk-delete recent messages.' },
      { name: '/slowmode', args: '<duration>', desc: 'Set the channel’s slowmode.' },
      { name: '/nick', args: '<user> [nickname]', desc: 'Change or clear a nickname.' },
    ],
  },
  {
    id: 'automod', title: 'Automod', icon: <Sparkles className="size-5" />,
    intro:
      'Two layers: heat scoring that punishes repeat offenders, and native Discord AutoMod rules that block content at Discord’s own edge. Tune both on the Automod page.',
    prevents: 'Spam, mass mentions, invite links, phishing and scam links, token grabbers, and fake-Nitro scams.',
    commands: [
      { name: '/automod', desc: 'Open the automod panel; manage rules, packs and exemptions.' },
      { name: '/packs', desc: 'Enable curated blocklist packs.' },
    ],
  },
  {
    id: 'logging', title: 'Logging', icon: <List className="size-5" />,
    intro:
      'A durable audit trail mirrored into the channels you choose, per event category. Pick a channel for each on the Logging page.',
    commands: [
      { name: '/logging', desc: 'Configure which events are logged and where.' },
      { name: '/auditlog', desc: 'Configure the server audit-log mirror.' },
      { name: '/logs', desc: 'View recent logged events.' },
    ],
  },
  {
    id: 'welcome', title: 'Welcome & roles', icon: <UserPlus className="size-5" />,
    intro:
      'Greet new members, say goodbye when they leave, and hand out roles automatically. Placeholders like {mention} and {memberCount} are substituted in your message.',
    commands: [
      { name: '/welcome', desc: 'Configure welcome and goodbye messages.' },
      { name: '/autorole', desc: 'Assign a role automatically on join.' },
      { name: '/reactionrole', desc: 'Set up self-assignable roles via reactions.' },
    ],
  },
  {
    id: 'leveling', title: 'Leveling', icon: <TrendingUp className="size-5" />,
    intro: 'Reward activity with XP and milestone role rewards. Configure XP rates on the Leveling page.',
    commands: [
      { name: '/rank', args: '[user]', desc: 'Show a member’s level and XP card.' },
      { name: '/levels', desc: 'Configure XP, announcements and role rewards.' },
      { name: '/leaderboard', desc: 'The server’s XP leaderboard.' },
    ],
  },
  {
    id: 'tickets', title: 'Tickets', icon: <Ticket className="size-5" />,
    intro:
      'Private support threads opened from a panel. Create the panel and categories with /tickets; tune behaviour on the Tickets page.',
    commands: [
      { name: '/tickets', desc: 'Set up the ticket panel, categories and transcripts.' },
    ],
  },
  {
    id: 'utility', title: 'Utility', icon: <Wrench className="size-5" />,
    intro: 'Everyday tools for running the server.',
    commands: [
      { name: '/serverinfo', desc: 'Detailed information about the server.' },
      { name: '/userinfo', args: '[user]', desc: 'Information about a member.' },
      { name: '/avatar', args: '[user]', desc: 'Show a user’s avatar.' },
      { name: '/role', args: '<add|remove> <user> <role>', desc: 'Add or remove a role.' },
      { name: '/watchvc', desc: 'Get alerts on voice-channel activity.' },
      { name: '/invites', args: '[user]', desc: 'Invite counts and tracking.' },
      { name: '/vote', desc: 'Support the bot on the bot lists.' },
      { name: '/ping', desc: 'Check the bot’s latency.' },
    ],
  },
];

export function DocsPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1100px] items-center gap-3 px-5 py-4">
          <Link to="/">
            <Button variant="secondary" aria-label="Back to home" className="gap-2">
              <ArrowLeft aria-hidden className="size-4" /> Home
            </Button>
          </Link>
          <div className="flex flex-1 items-center gap-2.5">
            <Logo />
            <span className="text-sm text-muted">Docs</span>
          </div>
          <a href={SUPPORT_INVITE} target="_blank" rel="noreferrer noopener">
            <Button variant="secondary">Support server</Button>
          </a>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1100px] gap-8 px-5 py-8 lg:grid-cols-[200px_1fr]">
        {/* Contents */}
        <nav aria-label="Documentation sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2 rounded-ctrl px-3 py-2 text-sm text-muted hover:bg-hover hover:text-text"
                >
                  <span className="text-primary-text">{s.icon}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
          <p className="mt-2 max-w-prose text-sm text-muted">
            Everything Suzune does, and the commands to drive it. Most of this can also be
            configured visually from the dashboard — the command is noted for each.
          </p>

          <div className="mt-8 space-y-8">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="flex items-center gap-2.5 text-lg font-bold">
                  <span className="text-primary-text">{s.icon}</span>
                  {s.title}
                </h2>
                <p className="mt-2 max-w-prose text-sm text-muted">{s.intro}</p>
                {s.prevents && (
                  <p className="mt-2 max-w-prose rounded-ctrl border border-success/25 bg-success/5 px-3 py-2 text-sm">
                    <span className="font-semibold text-success-text">Prevents: </span>
                    <span className="text-muted">{s.prevents}</span>
                  </p>
                )}
                <Card className="mt-4 divide-y divide-border">
                  {s.commands.map((c) => (
                    <div key={c.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 p-3.5">
                      <code className="font-mono text-sm font-semibold text-primary-text">{c.name}</code>
                      {c.args && <code className="font-mono text-xs text-muted">{c.args}</code>}
                      <span className="w-full text-sm text-muted sm:w-auto sm:flex-1">{c.desc}</span>
                    </div>
                  ))}
                </Card>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
