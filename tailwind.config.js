/**
 * Tailwind CSS configuration for ThromboGuard.
 *
 * The `content` field tells Tailwind where to look for class names.
 * The `plugins` array includes the typography plugin used for styling markdown.
 */
import typography from '@tailwindcss/typography';

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [typography],
};