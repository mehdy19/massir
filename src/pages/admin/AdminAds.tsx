import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowRight, Search, Image, Pencil, Trash2, Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Ad = {
  id: string;
  title: string;
  destination: string;
  price: number;
  seats: number;
  available_seats: number;
  departure_date: string;
  status: string;
  image_url: string;
  description: string | null;
  phone: string | null;
};

const AdminAds = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const { data: ads, isLoading } = useQuery({
    queryKey: ["admin-ads", statusFilter],
    queryFn: async () => {
      let query = supabase.from("ads").select("*");
      
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as Ad[];
    },
    enabled: isAdmin,
  });

  // Count pending ads for the badge
  const pendingCount = ads?.filter(ad => ad.status === "pending").length || 0;

  const filteredAds = ads?.filter((ad) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      ad.title.toLowerCase().includes(searchLower) ||
      ad.destination.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">نشط</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case "completed":
        return <Badge variant="secondary">مكتمل</Badge>;
      case "cancelled":
        return <Badge variant="destructive">ملغي</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = async (adId: string) => {
    try {
      const { error } = await supabase
        .from("ads")
        .update({ status: "active" })
        .eq("id", adId);

      if (error) throw error;

      toast.success("تمت الموافقة على الإعلان");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    } catch (error) {
      console.error("Error approving ad:", error);
      toast.error("فشل في الموافقة على الإعلان");
    }
  };

  const handleReject = async (adId: string) => {
    try {
      const { error } = await supabase
        .from("ads")
        .update({ status: "rejected" })
        .eq("id", adId);

      if (error) throw error;

      toast.success("تم رفض الإعلان");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    } catch (error) {
      console.error("Error rejecting ad:", error);
      toast.error("فشل في رفض الإعلان");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAd) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("ads")
        .update({
          title: editingAd.title,
          destination: editingAd.destination,
          price: editingAd.price,
          seats: editingAd.seats,
          available_seats: editingAd.available_seats,
          status: editingAd.status,
          description: editingAd.description,
          phone: editingAd.phone,
        })
        .eq("id", editingAd.id);

      if (error) throw error;

      toast.success("تم تحديث الإعلان بنجاح");
      setEditingAd(null);
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    } catch (error) {
      console.error("Error updating ad:", error);
      toast.error("فشل في تحديث الإعلان");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAdId) return;
    
    try {
      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", deletingAdId);

      if (error) throw error;

      toast.success("تم حذف الإعلان بنجاح");
      setDeletingAdId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("فشل في حذف الإعلان");
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-4 pb-24" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">إدارة الإعلانات السياحية</h1>
          {pendingCount > 0 && (
            <Badge className="bg-yellow-500">{pendingCount} بانتظار الموافقة</Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <CardTitle className="text-lg">جميع الإعلانات</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-9 w-48"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
            ) : filteredAds?.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا توجد إعلانات</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الصورة</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الوجهة</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>المقاعد</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAds?.map((ad) => (
                      <TableRow key={ad.id} className={ad.status === "pending" ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}>
                        <TableCell>
                          {ad.image_url ? (
                            <img
                              src={ad.image_url}
                              alt={ad.title}
                              className="w-16 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell>{ad.destination}</TableCell>
                        <TableCell>{ad.price} د.ج</TableCell>
                        <TableCell>
                          {ad.available_seats}/{ad.seats}
                        </TableCell>
                        <TableCell>
                          {new Date(ad.departure_date).toLocaleDateString("ar-DZ")}
                        </TableCell>
                        <TableCell>{getStatusBadge(ad.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {ad.status === "pending" && (
                              <>
                                <Button
                                  variant="default"
                                  size="icon"
                                  className="bg-green-600 hover:bg-green-700 h-8 w-8"
                                  onClick={() => handleApprove(ad.id)}
                                  title="موافقة"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleReject(ad.id)}
                                  title="رفض"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingAd(ad)}
                              title="تعديل"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeletingAdId(ad.id)}
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAd} onOpenChange={(open) => !open && setEditingAd(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الإعلان</DialogTitle>
            <DialogDescription>قم بتعديل بيانات الإعلان</DialogDescription>
          </DialogHeader>
          {editingAd && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  value={editingAd.title}
                  onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الوجهة</Label>
                <Input
                  value={editingAd.destination}
                  onChange={(e) => setEditingAd({ ...editingAd, destination: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>السعر</Label>
                  <Input
                    type="number"
                    value={editingAd.price}
                    onChange={(e) => setEditingAd({ ...editingAd, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المقاعد المتاحة</Label>
                  <Input
                    type="number"
                    value={editingAd.available_seats}
                    onChange={(e) => setEditingAd({ ...editingAd, available_seats: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={editingAd.status}
                  onValueChange={(value) => setEditingAd({ ...editingAd, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={editingAd.phone || ""}
                  onChange={(e) => setEditingAd({ ...editingAd, phone: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingAd(null)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAdId} onOpenChange={(open) => !open && setDeletingAdId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الإعلان؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف الإعلان نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAds;
