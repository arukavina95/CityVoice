import React from 'react';

const Footer: React.FC = () => (
  <footer className="mt-12 border-t border-white/50 bg-white/80 backdrop-blur-lg dark:border-slate-700/70 dark:bg-slate-900/70">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-lg font-semibold text-slate-900 dark:text-white">City Voice</div>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          Platforma za transparentno praćenje i rješavanje komunalnih problema u vašem gradu.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
        <a href="/about" className="transition hover:text-blue-600">
          O aplikaciji
        </a>
        <a href="/contact" className="transition hover:text-blue-600">
          Kontakt
        </a>
        <a
          href="https://github.com/arukavina95/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition hover:text-blue-600"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.262.793-.583 0-.288-.012-1.243-.017-2.252-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.003-.404 1.018.005 2.046.138 3.004.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .323.192.699.8.581C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} City Voice. Sva prava pridržana.
      </div>
    </div>
  </footer>
);

export default Footer; 