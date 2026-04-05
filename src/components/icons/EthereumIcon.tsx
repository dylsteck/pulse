import type { SVGProps } from 'react'

export function EthereumIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 540 879.4" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path d="m269.9 325.2-269.9 122.7 269.9 159.6 270-159.6z" opacity=".6" fill="#627EEA" />
      <path d="m0.1 447.8 269.9 159.6v-607.4z" opacity=".45" fill="#627EEA" />
      <path d="m270 0v607.4l269.9-159.6z" opacity=".8" fill="#627EEA" />
      <path d="m0 499 269.9 380.4v-220.9z" opacity=".45" fill="#627EEA" />
      <path d="m269.9 658.5v220.9l270.1-380.4z" opacity=".8" fill="#627EEA" />
    </svg>
  )
}
