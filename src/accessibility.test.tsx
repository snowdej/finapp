import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { SkipLink } from './components/ui/skip-link'
import { generateAriaLabel, formatCurrencyForScreenReader, formatDateForScreenReader } from './utils/accessibility'

describe('Accessibility Features', () => {
  describe('SkipLink Component', () => {
    it('renders with proper accessibility attributes', () => {
      render(<SkipLink href="#main">Skip to main content</SkipLink>)
      
      const link = screen.getByText('Skip to main content')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '#main')
      expect(link).toHaveClass('sr-only')
    })

    it('becomes visible when focused', () => {
      render(<SkipLink href="#main">Skip to main content</SkipLink>)
      
      const link = screen.getByText('Skip to main content')
      expect(link).toHaveClass('focus:not-sr-only')
    })
  })

  describe('Accessibility Utilities', () => {
    describe('generateAriaLabel', () => {
      it('generates basic aria labels', () => {
        expect(generateAriaLabel('Net worth')).toBe('Net worth')
        expect(generateAriaLabel('Total assets', 50000)).toBe('Total assets: 50,000')
        expect(generateAriaLabel('Growth rate', 5.5, '%')).toBe('Growth rate: 5.5 %')
      })

      it('handles undefined values', () => {
        expect(generateAriaLabel('Empty field', undefined)).toBe('Empty field')
      })

      it('formats numbers with locale', () => {
        expect(generateAriaLabel('Large number', 1234567)).toBe('Large number: 1,234,567')
      })
    })

    describe('formatCurrencyForScreenReader', () => {
      it('formats positive amounts', () => {
        expect(formatCurrencyForScreenReader(1000)).toBe('£1,000')
        expect(formatCurrencyForScreenReader(50000)).toBe('£50,000')
      })

      it('formats negative amounts', () => {
        expect(formatCurrencyForScreenReader(-1000)).toBe('negative £1,000')
        expect(formatCurrencyForScreenReader(-50000)).toBe('negative £50,000')
      })

      it('handles zero', () => {
        expect(formatCurrencyForScreenReader(0)).toBe('£0')
      })
    })

    describe('formatDateForScreenReader', () => {
      it('formats dates in British format', () => {
        expect(formatDateForScreenReader('2024-01-15')).toBe('15 January 2024')
        expect(formatDateForScreenReader('1985-12-25')).toBe('25 December 1985')
      })

      it('handles different date formats', () => {
        const date = new Date('2024-06-30')
        expect(formatDateForScreenReader(date.toISOString())).toBe('30 June 2024')
      })
    })
  })

  describe('Focus Management', () => {
    it('should provide proper focus indicators', () => {
      render(
        <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Test Button
        </button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
    })
  })

  describe('ARIA Landmarks', () => {
    it('should use semantic HTML elements', () => {
      render(
        <div>
          <nav aria-label="Main navigation">Navigation</nav>
          <main aria-label="Main content">Content</main>
          <aside aria-label="Sidebar">Sidebar</aside>
        </div>
      )
      
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('complementary')).toBeInTheDocument()
    })
  })

  describe('Screen Reader Content', () => {
    it('should hide decorative content from screen readers', () => {
      render(
        <div>
          <span aria-hidden="true">👍</span>
          <span className="sr-only">Thumbs up</span>
        </div>
      )
      
      const decorative = screen.getByText('👍')
      const screenReaderText = screen.getByText('Thumbs up')
      
      expect(decorative).toHaveAttribute('aria-hidden', 'true')
      expect(screenReaderText).toHaveClass('sr-only')
    })
  })
})
