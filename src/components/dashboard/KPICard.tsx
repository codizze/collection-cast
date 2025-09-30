import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  to: string;
  colorScheme: "blue" | "purple" | "orange" | "gray" | "yellow" | "green";
}

const colorSchemes = {
  blue: {
    bg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconBg: "bg-blue-400/20",
    hover: "hover:shadow-lg hover:shadow-blue-500/20"
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-500 to-purple-600",
    iconBg: "bg-purple-400/20",
    hover: "hover:shadow-lg hover:shadow-purple-500/20"
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-500 to-orange-600",
    iconBg: "bg-orange-400/20",
    hover: "hover:shadow-lg hover:shadow-orange-500/20"
  },
  gray: {
    bg: "bg-gradient-to-br from-gray-500 to-gray-600",
    iconBg: "bg-gray-400/20",
    hover: "hover:shadow-lg hover:shadow-gray-500/20"
  },
  yellow: {
    bg: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    iconBg: "bg-yellow-400/20",
    hover: "hover:shadow-lg hover:shadow-yellow-500/20"
  },
  green: {
    bg: "bg-gradient-to-br from-green-500 to-green-600",
    iconBg: "bg-green-400/20",
    hover: "hover:shadow-lg hover:shadow-green-500/20"
  }
};

export const KPICard = ({ title, value, icon: Icon, to, colorScheme }: KPICardProps) => {
  const colors = colorSchemes[colorScheme];
  
  return (
    <Link to={to}>
      <Card className={cn(
        "overflow-hidden border-0 transition-all duration-300 cursor-pointer",
        colors.bg,
        colors.hover,
        "transform hover:scale-105"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/90">{title}</h3>
            <div className={cn("p-2 rounded-lg", colors.iconBg)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white">
            {value.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
