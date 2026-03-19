import { describe, expect, test } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { ChanceGauge } from '../chance-gauge'

describe('ChanceGauge', () => {
  test('renders percent text', () => {
    render(<ChanceGauge percent={75} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  test('rounds percent for display', () => {
    render(<ChanceGauge percent={33.7} />)
    expect(screen.getByText('34%')).toBeInTheDocument()
  })

  test('renders SVG for different percent values', () => {
    const { container } = render(<ChanceGauge percent={0} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.querySelectorAll('path')).toHaveLength(1) // only bg path when 0
  })

  test('renders fill path when percent > 0', () => {
    const { container } = render(<ChanceGauge percent={50} />)
    const paths = container.querySelectorAll('svg path')
    expect(paths.length).toBeGreaterThanOrEqual(2) // bg + fill
  })

  test('renders fill path for 100 percent', () => {
    const { container } = render(<ChanceGauge percent={100} />)
    const paths = container.querySelectorAll('svg path')
    expect(paths.length).toBeGreaterThanOrEqual(2)
  })

  test('accepts custom size', () => {
    const { container } = render(<ChanceGauge percent={25} size={80} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '80')
    expect(svg).toHaveAttribute('height', '80')
  })
})
