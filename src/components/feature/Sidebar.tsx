import { Home, Briefcase, BookmarkIcon, Settings, MessageSquare } from 'lucide-react'

const menuItems = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: Briefcase, label: 'Jobs', active: false },
  { icon: BookmarkIcon, label: 'Saved', active: false },
  { icon: MessageSquare, label: 'Messages', active: false },
  { icon: Settings, label: 'Settings', active: false },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-sm border-r h-full">
      <nav className="mt-8">
        <div className="px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    item.active
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}