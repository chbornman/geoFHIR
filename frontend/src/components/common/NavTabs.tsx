import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  MapIcon, 
  DocumentArrowUpIcon, 
  CommandLineIcon, 
  HomeIcon 
} from '@heroicons/react/24/outline'

// Navigation tabs for main pages
const tabs = [
  { name: 'Dashboard', href: '/', icon: <HomeIcon className="h-4 w-4 mr-1" /> },
  { name: 'Map Viewer', href: '/map-viewer', icon: <MapIcon className="h-4 w-4 mr-1" /> },
  { name: 'File Upload', href: '/file-upload', icon: <DocumentArrowUpIcon className="h-4 w-4 mr-1" /> },
  { name: 'Debug Env', href: '/debug-env', icon: <CommandLineIcon className="h-4 w-4 mr-1" /> },
]

const NavTabs: React.FC = () => {
  const router = useRouter()
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = router.pathname === tab.href
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default NavTabs