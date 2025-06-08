import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { SkipLink } from './components/ui/skip-link'
import { FocusTrap } from './components/ui/focus-trap'
import { useAnnouncer } from './hooks/useAnnouncer'
import { 
  generateAriaLabel, 
  formatCurrencyForScreenReader, 
  formatDateForScreenReader 
} from './utils/accessibility'
import { axe, toHaveNoViolations } from 'jest-axe'
import App from './App'
import { PeopleManager } from './components/people/PeopleManager'
import { AssetManager } from './components/assets/AssetManager'
import { ProjectionTable } from './components/projections/ProjectionTable'

expect.extend(toHaveNoViolations)

// Test component using announcer
function TestAnnouncerComponent() {
  const { announce } = useAnnouncer()
  
  return (
    <div>
      <button onClick={() => announce('Test announcement')}>
        Announce Test
      </button>
      <button onClick={() => announce('Critical message', 'assertive')}>
        Critical Announce
      </button>
    </div>
  )
}

// Test component with focus trap
function TestFocusTrapComponent({ onEscape }: { onEscape?: () => void }) {
  return (
    <FocusTrap onEscape={onEscape}>
      <div>
        <button>First Button</button>
        <input type="text" placeholder="Text input" />
        <button>Last Button</button>
      </div>
    </FocusTrap>
  )
}

describe('Accessibility Features', () => {
  beforeEach(() => {
    // Clean up any existing announcer elements
    const existingAnnouncer = document.getElementById('screen-reader-announcements')
    if (existingAnnouncer) {
      existingAnnouncer.remove()
    }
  })

  describe('Skip Links', () => {
    it('should render skip link with proper accessibility attributes', () => {
      render(<SkipLink href="#main-content">Skip to main content</SkipLink>)
      
      const skipLink = screen.getByRole('link', { name: /skip to main content/i })
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })

    it('should be visually hidden by default but visible on focus', () => {
      render(<SkipLink href="#navigation">Skip to navigation</SkipLink>)
      
      const skipLink = screen.getByRole('link', { name: /skip to navigation/i })
      expect(skipLink).toHaveClass('sr-only')
      expect(skipLink).toHaveClass('focus:not-sr-only')
    })
  })

  describe('Focus Trap', () => {
    it('should focus first element on mount', () => {
      render(<TestFocusTrapComponent />)
      
      const firstButton = screen.getByRole('button', { name: /first button/i })
      expect(firstButton).toHaveFocus()
    })

    it('should trap focus within container', async () => {
      const user = userEvent.setup()
      render(<TestFocusTrapComponent />)
      
      const firstButton = screen.getByRole('button', { name: /first button/i })
      const textInput = screen.getByRole('textbox')
      const lastButton = screen.getByRole('button', { name: /last button/i })
      
      // Tab through elements
      await user.tab()
      expect(textInput).toHaveFocus()
      
      await user.tab()
      expect(lastButton).toHaveFocus()
      
      // Tab from last element should cycle to first
      await user.tab()
      expect(firstButton).toHaveFocus()
    })

    it('should handle shift+tab to go backwards', async () => {
      const user = userEvent.setup()
      render(<TestFocusTrapComponent />)
      
      const firstButton = screen.getByRole('button', { name: /first button/i })
      const lastButton = screen.getByRole('button', { name: /last button/i })
      
      // Shift+Tab from first element should go to last
      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(lastButton).toHaveFocus()
    })

    it('should call onEscape when escape key is pressed', async () => {
      const user = userEvent.setup()
      const mockEscape = vi.fn()
      
      render(<TestFocusTrapComponent onEscape={mockEscape} />)
      
      await user.keyboard('{Escape}')
      expect(mockEscape).toHaveBeenCalledTimes(1)
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should create announcer element and announce messages', () => {
      render(<TestAnnouncerComponent />)
      
      const announceButton = screen.getByRole('button', { name: /announce test/i })
      fireEvent.click(announceButton)
      
      // Check that announcer element was created
      const announcer = document.getElementById('screen-reader-announcements')
      expect(announcer).toBeInTheDocument()
      expect(announcer).toHaveAttribute('aria-live', 'polite')
      expect(announcer).toHaveAttribute('aria-atomic', 'true')
      expect(announcer).toHaveClass('sr-only')
    })

    it('should support assertive announcements', () => {
      render(<TestAnnouncerComponent />)
      
      const criticalButton = screen.getByRole('button', { name: /critical announce/i })
      fireEvent.click(criticalButton)
      
      const announcer = document.getElementById('screen-reader-announcements')
      expect(announcer).toHaveAttribute('aria-live', 'assertive')
    })

    it('should update announcer text content', async () => {
      render(<TestAnnouncerComponent />)
      
      const announceButton = screen.getByRole('button', { name: /announce test/i })
      fireEvent.click(announceButton)
      
      // Wait for timeout to set message
      await new Promise(resolve => setTimeout(resolve, 20))
      
      const announcer = document.getElementById('screen-reader-announcements')
      expect(announcer).toHaveTextContent('Test announcement')
    })
  })

  describe('Accessibility Utilities', () => {
    describe('generateAriaLabel', () => {
      it('should generate basic aria label', () => {
        expect(generateAriaLabel('Net Worth')).toBe('Net Worth')
      })

      it('should include value in aria label', () => {
        expect(generateAriaLabel('Asset Value', 50000)).toBe('Asset Value: 50,000')
      })

      it('should include units in aria label', () => {
        expect(generateAriaLabel('Growth Rate', 7.5, 'percent')).toBe('Growth Rate: 7.5 percent')
      })

      it('should handle string values', () => {
        expect(generateAriaLabel('Asset Type', 'ISA')).toBe('Asset Type: ISA')
      })
    })

    describe('formatCurrencyForScreenReader', () => {
      it('should format positive amounts', () => {
        expect(formatCurrencyForScreenReader(25000)).toBe('£25,000')
      })

      it('should format negative amounts', () => {
        expect(formatCurrencyForScreenReader(-15000)).toBe('negative £15,000')
      })

      it('should handle zero', () => {
        expect(formatCurrencyForScreenReader(0)).toBe('£0')
      })

      it('should format large amounts', () => {
        expect(formatCurrencyForScreenReader(1500000)).toBe('£1,500,000')
      })
    })

    describe('formatDateForScreenReader', () => {
      it('should format dates in British format', () => {
        expect(formatDateForScreenReader('1990-05-15')).toBe('15 May 1990')
      })

      it('should handle different date formats', () => {
        expect(formatDateForScreenReader('2024-12-25')).toBe('25 December 2024')
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support Enter key activation', async () => {
      const user = userEvent.setup()
      const mockClick = vi.fn()
      
      render(
        <button onClick={mockClick} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            mockClick()
          }
        }}>
          Test Button
        </button>
      )
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('should support Space key activation', async () => {
      const user = userEvent.setup()
      const mockClick = vi.fn()
      
      render(
        <button onClick={mockClick} onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault()
            mockClick()
          }
        }}>
          Test Button
        </button>
      )
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard(' ')
      expect(mockClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('ARIA Attributes', () => {
    it('should use proper roles for interactive elements', () => {
      render(
        <div>
          <button>Button</button>
          <input type="text" aria-label="Text input" />
          <nav aria-label="Main navigation">
            <ul role="list">
              <li role="listitem">Item 1</li>
            </ul>
          </nav>
        </div>
      )
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('should use aria-expanded for collapsible content', () => {
      const CollapsibleComponent = () => {
        const [expanded, setExpanded] = React.useState(false)
        
        return (
          <div>
            <button 
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              Toggle Content
            </button>
            {expanded && <div>Content</div>}
          </div>
        )
      }
      
      render(<CollapsibleComponent />)
      
      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
      
      fireEvent.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Screen Reader Content', () => {
    it('should hide decorative content from screen readers', () => {
      render(
        <div>
          <span aria-hidden="true">🔒</span>
          <span>Secure Content</span>
        </div>
      )
      
      const decorativeElement = document.querySelector('[aria-hidden="true"]')
      expect(decorativeElement).toBeInTheDocument()
      expect(decorativeElement).toHaveAttribute('aria-hidden', 'true')
    })

    it('should provide screen reader only content', () => {
      render(
        <div>
          <span className="sr-only">Screen reader only text</span>
          <span>Visible text</span>
        </div>
      )
      
      const srOnlyElement = document.querySelector('.sr-only')
      expect(srOnlyElement).toBeInTheDocument()
      expect(srOnlyElement).toHaveTextContent('Screen reader only text')
    })
  })
})

describe('Accessibility Tests', () => {
  it('App component has no accessibility violations', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('PeopleManager has no accessibility violations', async () => {
    const { container } = render(
      <PeopleManager 
        people={[]} 
        onUpdatePeople={() => {}} 
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('AssetManager has no accessibility violations', async () => {
    const { container } = render(
      <AssetManager 
        assets={[]} 
        people={[]}
        onUpdateAssets={() => {}} 
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('ProjectionTable has no accessibility violations', async () => {
    const mockProjectionSummary = {
      snapshots: [
        {
          year: 2024,
          netWorth: 100000,
          totalAssets: 120000,
          totalIncome: 60000,
          totalCommitments: -20000,
          cashFlow: 40000,
          assetsByCategory: { ISA: 50000, SIPP: 70000 }
        }
      ],
      categoryTotals: {
        ISA: { 2024: 50000 },
        SIPP: { 2024: 70000 }
      }
    }

    const mockPlan = {
      id: 'test-plan',
      name: 'Test Plan',
      people: [],
      assets: [],
      income: [],
      commitments: [],
      events: []
    }

    const { container } = render(
      <ProjectionTable 
        projectionSummary={mockProjectionSummary}
        plan={mockPlan}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper heading hierarchy', () => {
    render(<App />)
    
    // Should have one h1
    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    expect(h1Elements).toHaveLength(1)
    expect(h1Elements[0]).toHaveTextContent('Financial Projection Tool')
    
    // Should have h2 for main sections
    const h2Elements = screen.getAllByRole('heading', { level: 2 })
    expect(h2Elements.length).toBeGreaterThan(0)
  })

  it('has proper landmark structure', () => {
    render(<App />)
    
    // Check for main landmarks
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('provides skip links for keyboard navigation', () => {
    render(<App />)
    
    const skipLinks = screen.getAllByText(/skip to/i)
    expect(skipLinks.length).toBeGreaterThan(0)
    
    // Skip links should be initially hidden but focusable
    skipLinks.forEach(link => {
      expect(link).toHaveClass('sr-only')
    })
  })

  it('has proper ARIA labels on navigation', () => {
    render(<App />)
    
    const navigation = screen.getByRole('navigation')
    expect(navigation).toHaveAttribute('aria-label', 'Main navigation')
    
    // Navigation items should have proper labels
    const navButtons = screen.getAllByRole('button', { name: /navigate to/i })
    expect(navButtons.length).toBeGreaterThan(0)
  })

  it('theme toggle has proper accessibility attributes', () => {
    render(<App />)
    
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(themeToggle).toHaveAttribute('aria-describedby')
    
    // Should have hidden description
    const description = screen.getByText(/theme toggle button/i)
    expect(description).toHaveClass('sr-only')
  })

  it('forms have proper labels and error handling', () => {
    const people = []
    render(<PeopleManager people={people} onUpdatePeople={() => {}} />)
    
    // Click add person to show form
    const addButton = screen.getByRole('button', { name: /add person/i })
    addButton.click()
    
    // Check for proper form labels
    const nameInput = screen.getByLabelText(/name/i)
    expect(nameInput).toBeInTheDocument()
    
    const dobInput = screen.getByLabelText(/date of birth/i)
    expect(dobInput).toBeInTheDocument()
    expect(dobInput).toHaveAttribute('required')
    
    const sexSelect = screen.getByLabelText(/sex/i)
    expect(sexSelect).toBeInTheDocument()
    expect(sexSelect).toHaveAttribute('required')
  })

  it('supports reduced motion preferences', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(<App />)
    
    // Verify app still renders correctly with reduced motion
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('provides proper focus management', () => {
    render(<App />)
    
    // Main content should be focusable for skip link functionality
    const mainContent = screen.getByRole('main')
    expect(mainContent).toHaveAttribute('id', 'main-content')
  })
})
