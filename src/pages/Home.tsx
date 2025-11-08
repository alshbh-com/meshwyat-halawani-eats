import { useEffect, useState } from 'react';
import { Product, ProductCategory, Offer } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { AdvertisementSlider } from '@/components/AdvertisementSlider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Sparkles } from 'lucide-react';
import { categoryNames } from '@/lib/categories';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  useEffect(() => {
    loadProducts();
    loadOffers();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('display_order');
    
    if (data) setProducts(data);
  };

  const loadOffers = async () => {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', now)
      .lte('start_date', now);
    
    if (data) setOffers(data);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const categories: Array<ProductCategory | 'all'> = [
    'all',
    'grilled_meat',
    'grilled_chicken',
    'sandwiches',
    'single_meals',
    'family_meals',
    'extras'
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      {/* Header */}
      <header className="bg-gradient-warm text-white p-6 shadow-glow">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 justify-center">
            <Flame className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">مشويات الحلواني</h1>
            <Flame className="w-8 h-8" />
          </div>
          <p className="text-center mt-2 text-sm opacity-90">أشهى المشويات على الفحم</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdvertisementSlider />

        {/* Offers Section */}
        {offers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-bold text-foreground">العروض الخاصة</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map(offer => (
                <Card key={offer.id} className="p-4 bg-gradient-warm text-white">
                  <Badge className="mb-2" variant="secondary">عرض محدود</Badge>
                  <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                  <p className="text-sm mb-3 opacity-90">{offer.description}</p>
                  <div className="text-2xl font-bold">{offer.price} جنيه</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">قائمة الطعام</h2>
          
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="w-full">
            <TabsList className="w-full flex-wrap h-auto justify-start gap-2 bg-muted/50 p-2">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-sm">
                  {cat === 'all' ? 'الكل' : categoryNames[cat]}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد منتجات في هذه الفئة حالياً
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Home;
