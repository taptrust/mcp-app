import Link from 'next/link';
import { Github } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">MCP-APP</h1>
        </div>
        <nav>
          <ul className="flex items-center space-x-6">
            <li>
              <Link 
                href="https://github.com/taptrust/mcp-app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                <Github className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">GitHub</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
