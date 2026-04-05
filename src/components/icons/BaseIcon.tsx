import type { SVGProps } from 'react'

export function BaseIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF" />
      <path
        d="M54.921 90.5C74.122 90.5 89.677 74.945 89.677 55.744C89.677 36.543 74.122 20.988 54.921 20.988C36.738 20.988 22.0 35.014 21.197 52.99H67.716V58.499H21.197C22.0 76.475 36.738 90.5 54.921 90.5Z"
        fill="white"
      />
    </svg>
  )
}
