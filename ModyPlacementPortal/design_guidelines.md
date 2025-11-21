# Design Guidelines: Mody University Placement Portal

## Design Approach
**System:** Modern SaaS Dashboard Design (inspired by Linear, Notion, and modern admin panels)
**Rationale:** This is a utility-focused, information-dense university portal requiring clarity, efficiency, and professional presentation. The design prioritizes usability over aesthetic flourishes while maintaining a polished, contemporary look.

## Typography
**Font Family:** 
- Primary: Inter or DM Sans (Google Fonts)
- Monospace: JetBrains Mono (for data/IDs if needed)

**Hierarchy:**
- Page Titles: text-2xl to text-3xl, font-semibold
- Section Headers: text-xl, font-semibold
- Card Titles: text-lg, font-medium
- Body Text: text-base, font-normal
- Labels/Metadata: text-sm, font-medium
- Helper Text: text-sm, text-gray-600

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-6 or p-8
- Section margins: mb-8 or mb-12
- Card gaps: gap-6
- Form field spacing: space-y-4

**Container Strategy:**
- Full sidebar layout: Fixed left sidebar (w-64), remaining content area with max-w-7xl
- Main content: px-8 py-6
- Cards and panels: rounded-lg with shadow-sm borders

## Core Components

### Authentication Pages (Login/Signup)
- Centered card layout (max-w-md mx-auto)
- University logo/name at top
- Role selector (Student/Admin) as prominent radio buttons or tabs
- Form fields with clear labels above inputs
- Large primary action button
- Toggle between login/signup at bottom
- No background imagery - clean, focused interface

### Navigation Structure

**Top Navbar:**
- Full height: h-16
- Left: "Mody University of Science and Technology – Placement Portal" (text-lg font-semibold)
- Right: Profile dropdown with avatar/icon
- Border bottom for separation
- Fixed position with backdrop blur

**Left Sidebar:**
- Fixed width: w-64
- Icons + text navigation items
- Active state: subtle background with accent border-left
- Hover state: light background transition
- Icons from Heroicons (outline style)
- Consistent vertical spacing (space-y-2)

### Dashboard Layouts

**Student Home:**
- Three-column grid on desktop (lg:grid-cols-3)
- Center column (col-span-2): Recent Activities feed with card-based timeline
- Right column: Stacked cards for Eligible Opportunities counter and Notifications
- Activity cards include icon, timestamp, description
- Counter displays large number with label below

**Jobs Page:**
- Filter bar at top with dropdown selectors and search
- Job cards in grid (md:grid-cols-2 gap-6)
- Each card: Company name, position, eligibility badges, brief description, Apply button
- Eligibility badges use rounded-full pills
- Disabled state for ineligible jobs with clear visual indicator

**Forums Page:**
- Post composer card at top (Student view)
- Feed of experience posts below
- Each post card: Author info, timestamp, company/role tags, experience content
- Delete button for Admin view (positioned top-right of cards)

**Resume/Profile Page:**
- Form sections in stacked cards
- Clear section headers (Personal Details, Academic Info, Skills, etc.)
- File upload area with drag-drop zone styling
- Save buttons positioned consistently at section bottom

**Admin Jobs Management:**
- Action bar with "Add New Job" button
- Table view with inline edit/delete actions
- Modal/slide-over for Add/Edit forms
- Eligibility criteria as multi-select chips or checkboxes

### Form Elements
- Input fields: Consistent height (h-12), rounded borders, focus ring
- Labels: Above inputs, font-medium, text-sm
- Validation messages: Below inputs, text-sm, error color
- Buttons: Consistent sizing (px-6 py-3), rounded-lg
- Dropdowns: Custom styled selects matching input aesthetic

### Data Display
- Cards: White background, border, rounded-lg, p-6
- Tables: Bordered rows, hover states, alternating row backgrounds optional
- Badges: Small rounded pills for tags, eligibility criteria
- Stats/Counters: Large bold numbers with subtle label below

### Icons
**Library:** Heroicons (outline for navigation, solid for inline actions)
- Navigation: Home, Briefcase, ChatBubble, Document icons
- Actions: Plus, Pencil, Trash, Check icons
- Profile: User, Bell, ChevronDown icons

## Page-Specific Guidelines

**Login/Signup:** Clean, minimal, focused. No distractions.

**Dashboards:** Information hierarchy through card elevation and spacing. Critical info prominent.

**Job Listings:** Scannable cards with clear CTAs. Visual distinction between eligible and ineligible.

**Forums:** Conversational, readable. Easy to scan posts quickly.

**Forms:** Progressive disclosure for complex forms. Clear save states.

## Images
No hero images. This is a functional portal prioritizing efficiency over marketing appeal. Use:
- University logo in navbar (small, subtle)
- Profile avatars (rounded-full, fallback to initials)
- No decorative imagery

## Responsive Behavior
- Desktop: Full sidebar + multi-column content
- Tablet: Collapsible sidebar, two-column content where appropriate
- Mobile: Hidden sidebar (hamburger menu), single-column stack