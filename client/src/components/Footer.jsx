import { FiGithub } from 'react-icons/fi'
import { Globe, Mail } from 'lucide-react'

const connectLinks = [
  { 
    label: 'GitHub', 
    href: 'https://github.com/Yug1275/ClipHub.git', 
    icon: FiGithub 
  },
  { 
    label: 'LinkedIn', 
    href: 'https://www.linkedin.com', 
    icon: Globe 
  },
  { 
    label: 'Email', 
    href: 'mailto:your.email@example.com', 
    icon: Mail 
  }
]

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 bg-[#0B0F19] border-t border-white/5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-56 w-[55vw] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative px-6 md:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div>
            <h3 className="text-white font-semibold text-xl tracking-tight">ClipHub</h3>
            <p className="text-gray-500 mt-4 max-w-sm leading-relaxed">
              A modern clipboard and file sharing platform for developers.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/clip" className="text-gray-400 hover:text-white transition-colors">Clip</a></li>
              <li><a href="/docs" className="text-gray-400 hover:text-white transition-colors">Docs</a></li>
            </ul>
          </div>

          {/* Documentation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Documentation</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/docs" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-3 text-sm">
              {connectLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-500">
            © 2026 ClipHub. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 text-gray-500 text-xs">
            <a href="/docs" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="/docs" className="hover:text-gray-300 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}