import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // التحقق من كلمة السر
      const { data, error } = await supabase.rpc('verify_admin_password' as any, {
        password_input: password
      });

      if (error) throw error;

      if (data) {
        setIsAuthenticated(true);
        toast({
          title: "تم الدخول بنجاح",
          description: "مرحباً في لوحة التحكم"
        });
        navigate('/admin');
      } else {
        toast({
          title: "كلمة سر خاطئة",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "حدث خطأ",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 flex items-center justify-center">
      <Card className="p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">أدخل كلمة السر للوصول</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password">كلمة السر</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <Button 
            className="w-full bg-gradient-warm" 
            onClick={handleLogin}
          >
            دخول
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
