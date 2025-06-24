import { Bell, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="lg:hidden mr-4">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium text-gray-900">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
