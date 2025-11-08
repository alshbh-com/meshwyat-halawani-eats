import { Home, ShoppingCart, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

export const BottomNav = () => {
  const { getItemsCount } = useCart();
  const itemsCount = getItemsCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        <NavLink 
          to="/" 
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          activeClassName="text-primary"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">الرئيسية</span>
        </NavLink>

        <NavLink 
          to="/cart" 
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors relative"
          activeClassName="text-primary"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {itemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {itemsCount}
              </Badge>
            )}
          </div>
          <span className="text-xs">السلة</span>
        </NavLink>

        <NavLink 
          to="/settings" 
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          activeClassName="text-primary"
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs">الإعدادات</span>
        </NavLink>
      </div>
    </nav>
  );
};
