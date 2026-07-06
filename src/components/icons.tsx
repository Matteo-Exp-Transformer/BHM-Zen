import type { SVGProps } from 'react'

/**
 * Icone di sistema — tracciati dal mockup 06 (verità visiva).
 * Regola §13: icone disegnate stroke/currentColor, MAI emoji nella UI.
 */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function OggiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </Icon>
  )
}

export function RepartiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </Icon>
  )
}

export function ScorteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 8l9-4 9 4-9 4-9-4Z" />
      <path d="M3 8v8l9 4 9-4V8" />
      <path d="M12 12v8" />
    </Icon>
  )
}

export function RegiaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 5h14" />
      <path d="M4 5l3 4h10l3-4" />
      <path d="M6 9v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </Icon>
  )
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Icon>
  )
}

export function StampIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 20h12" />
      <path d="M9 8a3 3 0 1 1 6 0c0 1.5-1 2-1 3.5V13H10v-1.5C10 10 9 9.5 9 8Z" />
      <path d="M7 17h10v-1a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1Z" />
    </Icon>
  )
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  )
}
