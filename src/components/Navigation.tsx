import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  FolderOpen, 
  Package, 
  Palette, 
  Kanban, 
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      exact: true
    },
    {
      title: "Clientes",
      href: "/clients", 
      icon: Users
    },
    {
      title: "Modelistas",
      href: "/stylists",
      icon: UserCheck
    },
    {
      title: "Coleções",
      href: "/collections",
      icon: FolderOpen
    },
    {
      title: "Modelos de Produtos",
      href: "/products",
      icon: Package
    },
    {
      title: "Materiais",
      href: "/materials",
      icon: Palette
    },
    {
      title: "Fluxo de Trabalho",
      href: "/workflow",
      icon: Kanban
    },
    {
      title: "Relatórios",
      href: "/reports",
      icon: BarChart3
    }
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-background/95 backdrop-blur-sm border shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Fashion Factory
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestão de Coleções
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50",
                    active 
                      ? "bg-gradient-accent text-white shadow-elegant" 
                      : "text-foreground hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="bg-fashion-elegant-light p-3 rounded-lg">
              <p className="text-sm font-medium text-fashion-elegant">
                Dica Pro
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use arrastar e soltar no quadro de tarefas para atualizar status rapidamente
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;