import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  X,
  ChevronDown,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
  const location = useLocation();

  // Estrutura de navegação organizada em seções
  const navigationSections = [
    {
      title: "Operacional",
      items: [
        {
          title: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
          exact: true
        },
        {
          title: "Produção",
          href: "/production-workflow",
          icon: Kanban
        },
        {
          title: "Relatórios",
          href: "/reports",
          icon: BarChart3
        }
      ]
    },
    {
      title: "Cadastros",
      icon: Settings,
      collapsible: true,
      items: [
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
          title: "Config. Produção",
          href: "/production-config",
          icon: Settings
        }
      ]
    }
  ];

  // Verificar se alguma página de cadastros está ativa
  const cadastroRoutes = ['/clients', '/stylists', '/collections', '/products', '/materials', '/production-config'];
  const isInCadastroSection = cadastroRoutes.some(route => location.pathname.startsWith(route));

  // Persistir estado da seção cadastros e auto-expandir se estiver em uma página de cadastro
  useEffect(() => {
    const stored = localStorage.getItem('cadastros-section-open');
    if (isInCadastroSection) {
      setIsCadastrosOpen(true);
    } else if (stored !== null) {
      setIsCadastrosOpen(JSON.parse(stored));
    } else {
      setIsCadastrosOpen(false);
    }
  }, [isInCadastroSection]);

  // Salvar estado quando mudar
  const handleCadastrosToggle = () => {
    const newState = !isCadastrosOpen;
    setIsCadastrosOpen(newState);
    localStorage.setItem('cadastros-section-open', JSON.stringify(newState));
  };

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
          <nav className="flex-1 p-4 space-y-4">
            {navigationSections.map((section) => (
              <div key={section.title}>
                {section.collapsible ? (
                  <Collapsible open={isCadastrosOpen} onOpenChange={handleCadastrosToggle}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group">
                        <div className="flex items-center space-x-2">
                          <section.icon className="h-4 w-4" />
                          <span>{section.title}</span>
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isCadastrosOpen ? "rotate-180" : "rotate-0"
                        )} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-2">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href, item.exact);
                        
                        return (
                          <NavLink
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center space-x-3 px-4 py-2 ml-4 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50",
                              active 
                                ? "bg-gradient-accent text-white shadow-elegant" 
                                : "text-foreground hover:text-accent-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.title}</span>
                          </NavLink>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <div className="space-y-1">
                    <div className="p-2 text-sm font-semibold text-muted-foreground">
                      {section.title}
                    </div>
                    {section.items.map((item) => {
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
                  </div>
                )}
              </div>
            ))}
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