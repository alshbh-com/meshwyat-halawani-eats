import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { weightNames } from '@/lib/categories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleSubmitOrder = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "برجاء إكمال البيانات",
        description: "الاسم والهاتف مطلوبان",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // إنشاء الطلب في قاعدة البيانات
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          delivery_notes: formData.notes,
          items: cart,
          total_amount: getTotalPrice()
        })
        .select()
        .single();

      if (error) throw error;

      // إنشاء رسالة الواتساب
      const orderText = cart.map(item => 
        `${item.product.name} - ${weightNames[item.weight]} × ${item.quantity} = ${item.price * item.quantity} جنيه`
      ).join('\n');

      const message = `
🔥 *طلب جديد من مشويات الحلواني* 🔥

📋 *رقم الطلب:* ${order.order_number}

👤 *الاسم:* ${formData.name}
📱 *الهاتف:* ${formData.phone}
📍 *العنوان:* ${formData.address || 'غير محدد'}

🍖 *الطلبات:*
${orderText}

💰 *الإجمالي:* ${getTotalPrice()} جنيه

${formData.notes ? `📝 *ملاحظات:* ${formData.notes}` : ''}
      `.trim();

      // فتح واتساب
      const whatsappUrl = `https://wa.me/201226654541?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // مسح السلة
      clearCart();
      
      toast({
        title: "تم إرسال الطلب",
        description: `رقم طلبك: ${order.order_number}`,
      });

      navigate('/');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "حدث خطأ",
        description: "حاول مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-hero pb-20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-4">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">السلة فارغة</h2>
          <p className="text-muted-foreground mb-4">أضف منتجات لتبدأ طلبك</p>
          <Button onClick={() => navigate('/')} className="bg-gradient-warm">
            تصفح المنتجات
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <header className="bg-gradient-warm text-white p-6 shadow-glow">
        <h1 className="text-2xl font-bold text-center">سلة التسوق</h1>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Cart Items */}
        <div className="space-y-3">
          {cart.map((item, index) => (
            <Card key={`${item.product.id}-${item.weight}`} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {weightNames[item.weight]} - {item.price} جنيه
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.weight, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.weight, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removeFromCart(item.product.id, item.weight)}
                      className="mr-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-lg">
                    {item.price * item.quantity} جنيه
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Customer Info Form */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">بيانات التوصيل</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="أدخل عنوانك"
              />
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات خاصة بطلبك"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Total and Checkout */}
        <Card className="p-6 bg-gradient-warm text-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">الإجمالي</span>
            <span className="text-2xl font-bold">{getTotalPrice()} جنيه</span>
          </div>
          
          <Button 
            className="w-full bg-white text-primary hover:bg-white/90" 
            size="lg"
            onClick={handleSubmitOrder}
            disabled={loading}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب عبر واتساب'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Cart;
