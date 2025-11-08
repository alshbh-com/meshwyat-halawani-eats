import { useState } from 'react';
import { Product, ProductWeights } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { weightNames } from '@/lib/categories';
import { ShoppingCart, Flame } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState<keyof ProductWeights>(
    Object.keys(product.weights)[0] as keyof ProductWeights
  );

  const handleAddToCart = () => {
    const price = product.weights[selectedWeight];
    if (!price) return;

    addToCart({
      product,
      weight: selectedWeight,
      quantity: 1,
      price
    });

    toast({
      title: "تمت الإضافة للسلة",
      description: `${product.name} - ${weightNames[selectedWeight]}`
    });
  };

  const availableWeights = Object.entries(product.weights).filter(([_, price]) => price);

  return (
    <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden bg-gradient-hero">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Flame className="w-16 h-16 text-primary opacity-20" />
          </div>
        )}
        {!product.is_available && (
          <Badge className="absolute top-2 right-2" variant="destructive">
            غير متوفر
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg text-foreground">{product.name}</h3>
        
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {availableWeights.map(([weight, price]) => (
              <Button
                key={weight}
                size="sm"
                variant={selectedWeight === weight ? "default" : "outline"}
                onClick={() => setSelectedWeight(weight as keyof ProductWeights)}
                className="text-xs"
              >
                {weightNames[weight]} - {price} جنيه
              </Button>
            ))}
          </div>

          <Button
            className="w-full gap-2 bg-gradient-warm"
            onClick={handleAddToCart}
            disabled={!product.is_available}
          >
            <ShoppingCart className="w-4 h-4" />
            إضافة للسلة
          </Button>
        </div>
      </div>
    </Card>
  );
};
