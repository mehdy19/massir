import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import masarLogo from "@/assets/masar-logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("تم إرسال رابط استعادة كلمة المرور!");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={masarLogo} alt="مسار" className="h-14" />
          </div>
          {emailSent ? (
            <>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">تحقق من بريدك الإلكتروني</CardTitle>
              <CardDescription className="text-base">
                أرسلنا رابط استعادة كلمة المرور إلى <strong className="text-foreground">{email}</strong>
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">نسيت كلمة المرور؟</CardTitle>
              <CardDescription className="text-base">
                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة كلمة المرور
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                لم تستلم الرسالة؟ تحقق من مجلد البريد المزعج أو
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEmailSent(false)}
              >
                أعد المحاولة
              </Button>
              <div className="text-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-right"
                  placeholder="example@email.com"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
              </Button>

              <div className="text-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
