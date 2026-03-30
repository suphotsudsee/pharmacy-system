# 🎨 Pharmacy System - iOS Design System

## Design System Documentation

ระบบออกแบบ UI/UX แบบ iOS Style สำหรับระบบคลังยา

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations](#animations)
7. [Dark Mode](#dark-mode)
8. [Theme Toggle Implementation](#theme-toggle-implementation)
9. [Accessibility](#accessibility)
10. [Best Practices](#best-practices)

---

## Theme Toggle Implementation

### Overview
ระบบรองรับ Dark/Light Mode โดยใช้:
- **ThemeProvider** - Context สำหรับจัดการ theme state
- **ThemeToggle** - ปุ่มสำหรับสลับ theme
- **Tailwind CSS** - `darkMode: "class"` สำหรับ dark mode styling

### Files
- `src/components/providers/ThemeProvider.tsx` - Theme context provider
- `src/components/ThemeToggle.tsx` - Theme toggle button components
- `src/app/layout.tsx` - Root layout with ThemeProvider wrapper
- `src/app/settings/page.tsx` - Settings page with theme selection

### Usage

#### 1. ใน Navbar
```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

// ใน Navbar component
<ThemeToggle />
```

#### 2. ใน Settings Page
```tsx
// Settings page มี ThemeSettings component ให้เลือก theme
// สามารถเลือก Light หรือ Dark Mode ได้จากหน้า Settings
```

#### 3. ใช้ Theme Hook
```tsx
import { useTheme } from '@/components/providers/ThemeProvider';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

### CSS Variables
ระบบใช้ CSS variables สำหรับ theme colors:

```css
:root {
  --background: #f2f2f7;
  --foreground: #1c1c1e;
  --primary: #007AFF;
  /* ... more light mode colors */
}

.dark {
  --background: #000000;
  --foreground: #ffffff;
  --primary: #0a84ff;
  /* ... more dark mode colors */
}
```

### Tailwind Dark Mode
ใช้ `dark:` prefix สำหรับ dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-white">
    Content
  </p>
</div>
```

### Theme Persistence
- Theme ถูกเก็บใน `localStorage`
- รองรับ system preference (`prefers-color-scheme`)
- มี script ใน `<head>` สำหรับป้องกัน flash of wrong theme

---

## Overview

ระบบคลังยาใช้ Apple Design Language เป็นหลัก โดยปรับให้เหมาะกับการใช้งานบนเว็บและรองรับภาษาไทย

### Core Principles

1. **Clean & Minimal** - หลีกเลี่ยงความซับซ้อน มุ่งเน้นความเรียบง่าย
2. **Consistency** - ใช้ component เดียวกันทั่วทั้งระบบ
3. **Clarity** - ข้อความชัดเจน อ่านง่าย เข้าใจง่าย
4. **Depth** - ใช้ shadow และ blur สร้างความลึกแบบ subtle
5. **Deference** - UI ไม่แย่งความสนใจจากเนื้อหา

---

## Color System

### iOS System Colors

ระบบใช้ iOS System Colors เป็นหลัก โดยปรับสีให้เหมาะกับ Dark Mode

#### Primary Colors (Light Mode)

```css
--primary: #007AFF;           /* iOS Blue */
--secondary: #34c759;          /* iOS Green */
--tertiary: #ff9500;          /* iOS Orange */
--red: #ff3b30;               /* iOS Red */
--yellow: #ffcc00;            /* iOS Yellow */
--purple: #af52de;            /* iOS Purple */
--pink: #ff2d55;              /* iOS Pink */
--teal: #5ac8fa;              /* iOS Teal */
--indigo: #5856d6;            /* iOS Indigo */
```

#### Primary Colors (Dark Mode)

```css
--primary: #0a84ff;           /* iOS Blue - Dark */
--secondary: #30d158;          /* iOS Green - Dark */
--tertiary: #ff9f0a;          /* iOS Orange - Dark */
--red: #ff453a;               /* iOS Red - Dark */
--yellow: #ffd60a;            /* iOS Yellow - Dark */
--purple: #bf5af2;            /* iOS Purple - Dark */
--pink: #ff375f;              /* iOS Pink - Dark */
--teal: #64d2ff;              /* iOS Teal - Dark */
--indigo: #5e5ce6;            /* iOS Indigo - Dark */
```

#### Background Colors

```css
/* Light Mode */
--background: #f2f2f7;        /* iOS System Background */
--surface: #ffffff;          /* Secondary Background */
--surface-secondary: #f2f2f7; /* Tertiary Background */
--separator: #c6c6c8;        /* Separator */

/* Dark Mode */
--background: #000000;        /* iOS System Background */
--surface: #1c1c1e;          /* Secondary Background */
--surface-secondary: #2c2c2e; /* Tertiary Background */
--separator: #38383a;        /* Separator */
```

#### Text Colors

```css
/* Light Mode */
--text-primary: #1c1c1e;      /* Primary Text */
--text-secondary: #6e6e73;    /* Secondary Text */
--text-tertiary: #8e8e93;     /* Tertiary Text */
--text-quaternary: #aeaeb2;   /* Quaternary Text */

/* Dark Mode */
--text-primary: #ffffff;      /* Primary Text */
--text-secondary: #ababab;    /* Secondary Text */
--text-tertiary: #8e8e93;     /* Tertiary Text */
--text-quaternary: #636366;   /* Quaternary Text */
```

### Semantic Colors

```css
--success: #34c759;           /* Green - Success */
--warning: #ff9500;           /* Orange - Warning */
--error: #ff3b30;             /* Red - Error */
--info: #007AFF;              /* Blue - Info */
```

### Usage Examples

```tsx
// Primary Button
<button className="btn btn-primary">บันทึก</button>

// Success Badge
<span className="badge badge-success">สำเร็จ</span>

// Warning Alert
<div className="alert alert-warning">คำเตือน</div>

// Custom background
<div className="bg-primary text-white">iOS Blue Background</div>
```

---

## Typography

### Font Stack

ใช้ system fonts ของ Apple เป็นหลัก:

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Sarabun', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Font Sizes

```css
/* Headings */
h1, .h1 { font-size: 2rem; font-weight: 700; }      /* 32px */
h2, .h2 { font-size: 1.5rem; font-weight: 600; }    /* 24px */
h3, .h3 { font-size: 1.25rem; font-weight: 600; }   /* 20px */
h4, .h4 { font-size: 1.125rem; font-weight: 600; } /* 18px */
h5, .h5 { font-size: 1rem; font-weight: 600; }      /* 16px */
h6, .h6 { font-size: 0.875rem; font-weight: 600; }  /* 14px */

/* Body Text */
.text-xs { font-size: 0.75rem; }    /* 12px */
.text-sm { font-size: 0.875rem; }   /* 14px */
.text-base { font-size: 1rem; }     /* 16px */
.text-lg { font-size: 1.125rem; }   /* 18px */
.text-xl { font-size: 1.25rem; }    /* 20px */
```

### Letter Spacing

```css
/* Headings have tighter letter spacing */
h1, h2 { letter-spacing: -0.02em; }
h3, h4 { letter-spacing: -0.015em; }
h5, h6 { letter-spacing: -0.01em; }
```

---

## Spacing & Layout

### Border Radius

```css
--radius-xs: 6px;    /* Small elements */
--radius-sm: 8px;    /* Buttons, inputs */
--radius-md: 10px;   /* Cards, containers */
--radius-lg: 12px;   /* Large cards */
--radius-xl: 16px;   /* Modals, sheets */
--radius-2xl: 20px;  /* Extra large containers */
--radius-full: 9999px; /* Pills, avatars */
```

### Shadows

```css
/* Light Mode Shadows */
--shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);

/* Card Shadow */
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.06);

/* Elevated Shadow */
--shadow-elevated: 0 4px 12px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06);
```

### Spacing Scale

```css
/* Based on 4px grid */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
```

### Layout Guidelines

1. **Page Container**: `max-w-7xl mx-auto px-4 py-8`
2. **Card Padding**: `p-4 md:p-6`
3. **Grid Gap**: `gap-4 md:gap-6`
4. **Section Spacing**: `mb-6 md:mb-8`

---

## Components

### Buttons

#### Primary Button
```tsx
<button className="btn btn-primary">
  <span>💾</span>
  <span>บันทึก</span>
</button>
```

#### Secondary Button
```tsx
<button className="btn btn-secondary">ยืนยัน</button>
```

#### Outline Button
```tsx
<button className="btn btn-outline">ยกเลิก</button>
```

#### Ghost Button
```tsx
<button className="btn btn-ghost">แก้ไข</button>
```

#### Danger Button
```tsx
<button className="btn btn-danger">ลบ</button>
```

#### Button Sizes
```tsx
<button className="btn btn-primary btn-sm">เล็ก</button>
<button className="btn btn-primary">ปกติ</button>
<button className="btn btn-primary btn-lg">ใหญ่</button>
```

### Cards

#### Basic Card
```tsx
<div className="card p-6">
  <h3 className="font-semibold mb-2">Card Title</h3>
  <p className="text-secondary">Card content here</p>
</div>
```

#### Stats Card
```tsx
<div className="stats-card stats-card-blue">
  <div className="text-sm text-secondary mb-1">จำนวนยา</div>
  <div className="text-2xl font-bold">1,234</div>
</div>
```

#### Elevated Card
```tsx
<div className="card-elevated p-6">
  <p>Content with more prominent shadow</p>
</div>
```

### Forms

#### Input Field
```tsx
<div className="form-group">
  <label className="form-label">ชื่อยา</label>
  <input type="text" className="form-input" placeholder="กรอกชื่อยา" />
</div>
```

#### Search Input
```tsx
<div className="search-bar">
  <span className="search-bar-icon">
    <SearchIcon />
  </span>
  <input type="text" className="search-bar-input" placeholder="ค้นหา..." />
</div>
```

#### Select
```tsx
<select className="form-input form-select">
  <option value="">เลือกหมวดหมู่</option>
  <option value="1">หมวด 1</option>
</select>
```

#### Switch Toggle
```tsx
<label className="form-switch">
  <input type="checkbox" />
  <span className="form-switch-slider"></span>
</label>
```

### Tables

#### Basic Table
```tsx
<div className="table-container">
  <table>
    <thead>
      <tr>
        <th>รหัส</th>
        <th>ชื่อ</th>
        <th>สถานะ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>001</td>
        <td>Paracetamol</td>
        <td><span className="badge badge-success">ใช้งาน</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges

#### Status Badges
```tsx
<span className="badge badge-success">สำเร็จ</span>
<span className="badge badge-warning">รอดำเนินการ</span>
<span className="badge badge-error">ผิดพลาด</span>
<span className="badge badge-info">ข้อมูล</span>
```

### Alerts

```tsx
<div className="alert alert-info">
  <span>ℹ️</span>
  <div>ข้อความแจ้งเตือน</div>
</div>

<div className="alert alert-success">
  <span>✅</span>
  <div>ดำเนินการสำเร็จ</div>
</div>

<div className="alert alert-warning">
  <span>⚠️</span>
  <div>คำเตือน</div>
</div>

<div className="alert alert-error">
  <span>❌</span>
  <div>เกิดข้อผิดพลาด</div>
</div>
```

### Lists

#### iOS-style List
```tsx
<div className="ios-list">
  <div className="ios-list-item">
    <span className="text-lg mr-3">💊</span>
    <div className="flex-1">Paracetamol</div>
    <span className="text-tertiary">500mg</span>
  </div>
  <div className="ios-list-item">
    <span className="text-lg mr-3">💊</span>
    <div className="flex-1">Amoxicillin</div>
    <span className="text-tertiary">250mg</span>
  </div>
</div>
```

### Empty State

```tsx
<div className="empty-state">
  <div className="empty-state-icon">💊</div>
  <p className="empty-state-title">ไม่พบรายการยา</p>
  <p className="empty-state-description">เริ่มเพิ่มยาใหม่ได้เลย</p>
  <button className="btn btn-primary mt-4">เพิ่มยาใหม่</button>
</div>
```

### Loading Skeleton

```tsx
<div className="skeleton h-4 w-24"></div>
<div className="skeleton h-4 w-32 mt-2"></div>
```

---

## Animations

### Transition Timing

```css
--transition-fast: 150ms;    /* Quick interactions */
--transition-normal: 250ms;  /* Standard transitions */
--transition-slow: 350ms;     /* Complex animations */
--ease-ios: cubic-bezier(0.25, 0.1, 0.25, 1);  /* iOS ease */
```

### Hover Effects

```tsx
// Lift on hover
<div className="hover-lift">Lifts slightly on hover</div>

// Scale on active
<button className="btn btn-primary">Scales down on press</button>
```

### Animation Classes

```tsx
// Fade in
<div className="animate-fade-in">Fades in smoothly</div>

// Slide up
<div className="animate-slide-up">Slides up on entry</div>

// Scale in
<div className="animate-scale-in">Scales in smoothly</div>

// Pulse
<div className="animate-pulse-soft">Subtle pulsing effect</div>
```

---

## Dark Mode

### Implementation

ระบบรองรับ Dark Mode อัตโนมัติ โดยใช้ `class="dark"` บน `<html>` element

### CSS Variables

ทุก component ใช้ CSS variables ที่เปลี่ยนค่าตาม theme:

```css
/* Light mode */
:root {
  --background: #f2f2f7;
  --surface: #ffffff;
  --text-primary: #1c1c1e;
}

/* Dark mode */
.dark {
  --background: #000000;
  --surface: #1c1c1e;
  --text-primary: #ffffff;
}
```

### Toggle Theme

```tsx
import { useTheme } from '@/components/providers/ThemeProvider';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

---

## Accessibility

### Focus Indicators

ทุก interactive element มี focus indicator ที่ชัดเจน:

```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Color Contrast

- Primary text on background: 7.5:1 (AAA)
- Secondary text: 4.5:1 (AA)
- Interactive elements: 3:1 minimum

### Touch Targets

- Minimum touch target: 44px × 44px
- Button padding: `0.625rem 1.25rem` (10px 20px)

### Screen Reader Support

```tsx
// Use semantic HTML
<nav aria-label="เมนูหลัก">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// Add aria labels
<button aria-label="เปิดเมนู">
  <MenuIcon />
</button>
```

---

## Best Practices

### 1. Use CSS Variables

✅ Do:
```css
color: var(--primary);
background-color: var(--surface);
```

❌ Don't:
```css
color: #007AFF;
background-color: #ffffff;
```

### 2. Use Design System Classes

✅ Do:
```tsx
<button className="btn btn-primary">Save</button>
<div className="card p-6">Content</div>
```

❌ Don't:
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
<div className="bg-white shadow rounded-lg p-6">Content</div>
```

### 3. Maintain Consistent Spacing

✅ Do:
```tsx
<div className="p-4 md:p-6">
  <h2 className="mb-4">Title</h2>
  <p className="mb-6">Description</p>
  <button className="btn btn-primary">Action</button>
</div>
```

### 4. Handle Loading States

```tsx
{loading ? (
  <div className="skeleton h-4 w-32"></div>
) : (
  <span>{data}</span>
)}
```

### 5. Handle Empty States

```tsx
{items.length === 0 ? (
  <div className="empty-state">
    <div className="empty-state-icon">📦</div>
    <p className="empty-state-title">ไม่พบรายการ</p>
    <p className="empty-state-description">เริ่มเพิ่มข้อมูลใหม่ได้เลย</p>
  </div>
) : (
  <ItemList items={items} />
)}
```

### 6. Responsive Design

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>
```

---

## File Structure

```
src/
├── app/
│   └── globals.css        # Design system CSS
├── components/
│   ├── Navbar.tsx          # Navigation component
│   ├── ThemeToggle.tsx     # Theme switcher
│   └── providers/
│       └── ThemeProvider.tsx
└── ...
```

---

## Changelog

### Version 1.0.0 (2024-03-30)
- Initial iOS-style design system implementation
- Color palette migration to iOS system colors
- Typography improvements with SF Pro font stack
- Component styling updates (buttons, cards, forms)
- Dark mode support with CSS variables
- Animation and transition improvements
- Accessibility enhancements

---

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [iOS Design Resources](https://developer.apple.com/design/resources/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

*Last updated: March 30, 2026*