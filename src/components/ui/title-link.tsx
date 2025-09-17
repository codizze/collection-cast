import { Link } from "react-router-dom";
import { CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TitleLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const TitleLink = ({ to, children, className }: TitleLinkProps) => {
  return (
    <Link to={to} className="block group">
      <CardTitle className={cn(
        "text-lg group-hover:text-primary transition-colors cursor-pointer",
        className
      )}>
        {children}
      </CardTitle>
    </Link>
  );
};