import { Package, BarChart3, Upload, History, Search, Eye, User } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const { user } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/" },
    { id: "upload", label: "Novo Upload", icon: Upload, href: "/upload" },
    { id: "history", label: "Histórico", icon: History, href: "/history" },
    { id: "search", label: "Busca Manual", icon: Search, href: "/search" },
    { id: "review", label: "Revisão", icon: Eye, href: "/review", badge: 3 },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg fixed left-0 top-0 h-full z-40">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
            <Package className="text-white h-6 w-6" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-medium text-gray-900">CATMAT</h1>
            <p className="text-sm text-gray-500">Matcher</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "text-primary-700 bg-primary-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span className={isActive ? "font-medium" : ""}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="ml-auto bg-warning text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName || user?.email || "Usuário"}
            </p>
            <p className="text-xs text-gray-500">Plano FREE</p>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => window.location.href = '/api/logout'}
            title="Fazer logout"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
