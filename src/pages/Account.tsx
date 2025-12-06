import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, LogOut, Camera, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Account = () => {
  const { user, userRole, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user?.id)
      .single();
    
    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار صورة");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 2 ميجابايت");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl + "?t=" + Date.now());
      toast.success("تم تحديث الصورة الشخصية");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("فشل في رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">حسابي</h1>
          <p className="text-muted-foreground">معلومات حسابك الشخصي</p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-medium">
          <CardHeader>
            <CardTitle>معلومات الحساب</CardTitle>
            <CardDescription>تفاصيل حسابك في مسير</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl || ""} alt="صورة المستخدم" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">اضغط على الكاميرا لتغيير الصورة</p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">البريد الإلكتروني</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">نوع الحساب</p>
                <p className="text-sm text-muted-foreground">
                  {userRole === "driver" ? "سائق" : "مسافر"}
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={signOut}
            >
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
