import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Offer, Advertisement, Order, ProductCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Package, Megaphone, Gift, ShoppingCart, Upload } from 'lucide-react';
import { categoryNames, weightNames } from '@/lib/categories';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      navigate('/settings');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    const [productsData, offersData, adsData, ordersData] = await Promise.all([
      supabase.from('products').select('*').order('display_order'),
      supabase.from('offers').select('*').order('created_at', { ascending: false }),
      supabase.from('advertisements').select('*').order('display_order'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50)
    ]);

    if (productsData.data) setProducts(productsData.data as unknown as Product[]);
    if (offersData.data) setOffers(offersData.data as unknown as Offer[]);
    if (adsData.data) setAdvertisements(adsData.data as unknown as Advertisement[]);
    if (ordersData.data) setOrders(ordersData.data as unknown as Order[]);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Products Management
  const ProductForm = () => {
    const [formData, setFormData] = useState<Partial<Product>>(editingProduct || {
      name: '',
      category: 'grilled_meat' as ProductCategory,
      description: '',
      image_url: '',
      weights: {},
      is_available: true,
      display_order: 0
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async () => {
      setUploading(true);
      try {
        let imageUrl = formData.image_url;
        
        if (imageFile) {
          imageUrl = await handleImageUpload(imageFile);
        }

        const productData = {
          ...formData,
          image_url: imageUrl,
        };

        if (editingProduct) {
          const { error } = await supabase
            .from('products')
            .update(productData as any)
            .eq('id', editingProduct.id);
          if (error) throw error;
          toast({ title: 'تم تحديث المنتج بنجاح' });
        } else {
          const { error } = await supabase
            .from('products')
            .insert(productData as any);
          if (error) throw error;
          toast({ title: 'تم إضافة المنتج بنجاح' });
        }

        loadData();
        setIsProductDialogOpen(false);
        setEditingProduct(null);
      } catch (error: any) {
        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
        <div>
          <Label>اسم المنتج</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثال: كباب دانى"
          />
        </div>

        <div>
          <Label>الفئة</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as ProductCategory })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryNames).map(([key, name]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>الوصف</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="وصف المنتج..."
          />
        </div>

        <div>
          <Label>صورة المنتج</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {formData.image_url && !imageFile && (
            <img src={formData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
          )}
        </div>

        <div className="border p-4 rounded">
          <Label className="mb-3 block">الأسعار حسب الوزن (جنيه)</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(weightNames).map(([key, name]) => (
              <div key={key}>
                <Label className="text-sm">{name}</Label>
                <Input
                  type="number"
                  value={(formData.weights as any)?.[key] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    weights: { ...formData.weights, [key]: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_available}
            onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
          />
          <Label>متاح للطلب</Label>
        </div>

        <div>
          <Label>ترتيب العرض</Label>
          <Input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
          {uploading ? 'جاري الرفع...' : editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
        </Button>
      </div>
    );
  };

  // Offers Management
  const OfferForm = () => {
    const [formData, setFormData] = useState<Partial<Offer>>(editingOffer || {
      title: '',
      description: '',
      price: 0,
      items: [],
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      is_active: true
    });

    const handleSubmit = async () => {
      try {
        if (editingOffer) {
          const { error } = await supabase
            .from('offers')
            .update(formData as any)
            .eq('id', editingOffer.id);
          if (error) throw error;
          toast({ title: 'تم تحديث العرض بنجاح' });
        } else {
          const { error } = await supabase
            .from('offers')
            .insert(formData as any);
          if (error) throw error;
          toast({ title: 'تم إضافة العرض بنجاح' });
        }

        loadData();
        setIsOfferDialogOpen(false);
        setEditingOffer(null);
      } catch (error: any) {
        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label>عنوان العرض</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <Label>الوصف</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <Label>السعر (جنيه)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>تاريخ البداية</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label>تاريخ النهاية</Label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>فعال</Label>
        </div>

        <Button onClick={handleSubmit} className="w-full">
          {editingOffer ? 'تحديث العرض' : 'إضافة العرض'}
        </Button>
      </div>
    );
  };

  // Advertisements Management
  const AdForm = () => {
    const [formData, setFormData] = useState<Partial<Advertisement>>(editingAd || {
      title: '',
      image_url: '',
      link_url: '',
      display_order: 0,
      is_active: true
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async () => {
      setUploading(true);
      try {
        let imageUrl = formData.image_url;
        
        if (imageFile) {
          imageUrl = await handleImageUpload(imageFile);
        }

        const adData = {
          ...formData,
          image_url: imageUrl,
        };

        if (editingAd) {
          const { error } = await supabase
            .from('advertisements')
            .update(adData as any)
            .eq('id', editingAd.id);
          if (error) throw error;
          toast({ title: 'تم تحديث الإعلان بنجاح' });
        } else {
          const { error } = await supabase
            .from('advertisements')
            .insert(adData as any);
          if (error) throw error;
          toast({ title: 'تم إضافة الإعلان بنجاح' });
        }

        loadData();
        setIsAdDialogOpen(false);
        setEditingAd(null);
      } catch (error: any) {
        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label>عنوان الإعلان</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="عنوان الإعلان"
          />
        </div>

        <div>
          <Label>صورة الإعلان</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {formData.image_url && !imageFile && (
            <img src={formData.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
          )}
        </div>

        <div>
          <Label>رابط الإعلان (اختياري)</Label>
          <Input
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            placeholder="https://..."
            dir="ltr"
          />
        </div>

        <div>
          <Label>ترتيب العرض</Label>
          <Input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>فعال</Label>
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
          {uploading ? 'جاري الرفع...' : editingAd ? 'تحديث الإعلان' : 'إضافة الإعلان'}
        </Button>
      </div>
    );
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم حذف المنتج بنجاح' });
      loadData();
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
    
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم حذف العرض بنجاح' });
      loadData();
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    
    const { error } = await supabase.from('advertisements').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم حذف الإعلان بنجاح' });
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <header className="bg-gradient-warm text-white p-6 shadow-glow">
        <h1 className="text-2xl font-bold text-center">لوحة التحكم - الإدارة</h1>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">
              <Package className="w-4 h-4 ml-2" />
              المنتجات
            </TabsTrigger>
            <TabsTrigger value="offers">
              <Gift className="w-4 h-4 ml-2" />
              العروض
            </TabsTrigger>
            <TabsTrigger value="ads">
              <Megaphone className="w-4 h-4 ml-2" />
              الإعلانات
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="w-4 h-4 ml-2" />
              الطلبات
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" onClick={() => setEditingProduct(null)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة منتج جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
                </DialogHeader>
                <ProductForm />
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="p-4">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover rounded mb-3" />
                  )}
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <Badge variant={product.is_available ? 'default' : 'secondary'} className="mb-2">
                    {product.is_available ? 'متاح' : 'غير متاح'}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-2">{categoryNames[product.category]}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsProductDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" onClick={() => setEditingOffer(null)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة عرض جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}</DialogTitle>
                </DialogHeader>
                <OfferForm />
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <Card key={offer.id} className="p-4">
                  <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                  <Badge variant={offer.is_active ? 'default' : 'secondary'} className="mb-2">
                    {offer.is_active ? 'فعال' : 'غير فعال'}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-2">{offer.description}</p>
                  <p className="text-xl font-bold text-primary mb-2">{offer.price} جنيه</p>
                  <p className="text-xs text-muted-foreground">
                    من {new Date(offer.start_date).toLocaleDateString('ar-EG')} إلى {new Date(offer.end_date).toLocaleDateString('ar-EG')}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingOffer(offer);
                        setIsOfferDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteOffer(offer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Advertisements Tab */}
          <TabsContent value="ads" className="space-y-4">
            <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" onClick={() => setEditingAd(null)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة إعلان جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}</DialogTitle>
                </DialogHeader>
                <AdForm />
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advertisements.map((ad) => (
                <Card key={ad.id} className="p-4">
                  <img src={ad.image_url} alt={ad.title} className="w-full h-40 object-cover rounded mb-3" />
                  <h3 className="font-bold text-lg mb-2">{ad.title}</h3>
                  <Badge variant={ad.is_active ? 'default' : 'secondary'} className="mb-2">
                    {ad.is_active ? 'فعال' : 'غير فعال'}
                  </Badge>
                  {ad.link_url && (
                    <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block mb-2">
                      {ad.link_url}
                    </a>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingAd(ad);
                        setIsAdDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteAd(ad.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">طلب #{order.order_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <Badge>{order.status}</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <p><strong>الاسم:</strong> {order.customer_name}</p>
                    <p><strong>الهاتف:</strong> {order.customer_phone}</p>
                    {order.customer_address && <p><strong>العنوان:</strong> {order.customer_address}</p>}
                  </div>

                  <div className="border-t pt-3">
                    <p className="font-bold mb-2">الطلبات:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        {item.product.name} - {weightNames[item.weight]} × {item.quantity}
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-3 pt-3 flex justify-between items-center">
                    <span className="font-bold">الإجمالي:</span>
                    <span className="text-xl font-bold text-primary">{order.total_amount} جنيه</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
