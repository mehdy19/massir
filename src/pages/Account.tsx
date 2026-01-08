import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, LogOut, Camera, Loader2, Phone, Save, Pencil, Shield, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(50, "الاسم طويل جداً"),
  phone: z.string().trim().regex(/^[0-9+\s-]*$/, "رقم الهاتف غير صالح").max(20, "رقم الهاتف طويل جداً").optional().or(z.literal("")),
});

const Account = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ full_name?: string; phone?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url, full_name, phone")
      .eq("id", user?.id)
      .single();
    
    if (data) {
      setAvatarUrl(data.avatar_url);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
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

  const handleSaveProfile = async () => {
    if (!user) return;

    setErrors({});
    
    const result = profileSchema.safeParse({ full_name: fullName, phone });
    
    if (!result.success) {
      const fieldErrors: { full_name?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as "full_name" | "phone";
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: result.data.full_name,
          phone: result.data.phone || null
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("تم حفظ المعلومات بنجاح");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("فشل في حفظ المعلومات");
    } finally {
      setSaving(false);
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
            <CardDescription>تفاصيل حسابك في مسار</CardDescription>
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

            {/* Editable Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  الاسم الكامل
                </Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      className={errors.full_name ? "border-destructive" : ""}
                      maxLength={50}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-foreground">{fullName || "لم يتم تحديد الاسم"}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  رقم الهاتف
                </Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="أدخل رقم الهاتف"
                      className={errors.phone ? "border-destructive" : ""}
                      maxLength={20}
                      dir="ltr"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-foreground" dir="ltr">{phone || "لم يتم تحديد رقم الهاتف"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Edit/Save Button */}
            {isEditing ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="ml-2 h-4 w-4" />
                  )}
                  حفظ التغييرات
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                    setErrors({});
                  }}
                  disabled={saving}
                >
                  إلغاء
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                <Pencil className="ml-2 h-4 w-4" />
                تعديل المعلومات
              </Button>
            )}

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

            {/* Legal Links */}
            <div className="space-y-3">
              <button
                onClick={() => navigate("/privacy-policy")}
                className="flex items-center gap-3 p-4 bg-secondary rounded-lg w-full hover:bg-secondary/80 transition-colors text-right"
              >
                <Shield className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold">سياسة الخصوصية</p>
                  <p className="text-sm text-muted-foreground">
                    كيف نحمي بياناتك الشخصية
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/terms-conditions")}
                className="flex items-center gap-3 p-4 bg-secondary rounded-lg w-full hover:bg-secondary/80 transition-colors text-right"
              >
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold">الشروط والأحكام</p>
                  <p className="text-sm text-muted-foreground">
                    {userRole === "driver" ? "شروط تقديم خدمات النقل" : "شروط استخدام الخدمة"}
                  </p>
                </div>
              </button>
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