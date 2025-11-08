import { useEffect, useState } from 'react';
import { Advertisement } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';

export const AdvertisementSlider = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    const { data } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (data) setAds(data);
  };

  if (ads.length === 0) return null;

  return (
    <div className="w-full mb-6">
      <Carousel
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 4000 })]}
        className="w-full"
      >
        <CarouselContent>
          {ads.map((ad) => (
            <CarouselItem key={ad.id}>
              <Card className="overflow-hidden">
                <a href={ad.link_url || '#'} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={ad.image_url} 
                    alt={ad.title}
                    className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </a>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {ads.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
};
