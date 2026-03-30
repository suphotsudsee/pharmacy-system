'use client';

import { useTheme } from './providers/ThemeProvider';

/**
 * 🎨 ThemeToggle Component
 * ปุ่มสำหรับสลับ Dark/Light Mode
 * - มี animation การเปลี่ยน icon
 * - เก็บค่าใน localStorage
 * - รองรับ system preference
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle group"
      title={theme === 'light' ? 'เปลี่ยนเป็น Dark Mode' : 'เปลี่ยนเป็น Light Mode'}
      aria-label={theme === 'light' ? 'เปิด Dark Mode' : 'เปิด Light Mode'}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun Icon - แสดงใน Dark Mode */}
        <svg
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-out ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-75'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Moon Icon - แสดงใน Light Mode */}
        <svg
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-out ${
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-75'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>

      <span className="hidden sm:inline text-sm font-medium transition-colors">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}

/**
 * 🎯 Theme Toggle แบบ Compact
 * ใช้ในที่ที่ต้องการปุ่มเล็ก เช่น mobile menu
 */
export function ThemeToggleCompact() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={theme === 'light' ? 'เปลี่ยนเป็น Dark Mode' : 'เปลี่ยนเป็น Light Mode'}
      aria-label={theme === 'light' ? 'เปิด Dark Mode' : 'เปิด Light Mode'}
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * 🎨 Theme Toggle แบบ Slider
 * แสดงทั้ง Sun และ Moon icons พร้อม slider animation
 */
export function ThemeToggleSlider() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Sun Icon */}
      <svg
        className={`w-4 h-4 transition-colors ${
          theme === 'light' ? 'text-yellow-500' : 'text-gray-400'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Toggle Slider */}
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="relative w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors"
        role="switch"
        aria-checked={theme === 'dark'}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>

      {/* Moon Icon */}
      <svg
        className={`w-4 h-4 transition-colors ${
          theme === 'dark' ? 'text-blue-400' : 'text-gray-400'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </div>
  );
}