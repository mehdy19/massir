import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReportLostItemDialogProps {
  bookingId: string;
  tripId: string;
  driverId: string;
  tripInfo: string;
}

const ReportLostItemDialog = ({
  bookingId,
  tripId,
  driverId,
  tripInfo,
}: ReportLostItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("يرجى وصف الأمتعة المفقودة");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول");
        return;
      }

      const { error } = await supabase.from("lost_items").insert({
        booking_id: bookingId,
        trip_id: tripId,
        user_id: user.id,
        driver_id: driverId,
        item_description: description.trim(),
      });

      if (error) throw error;

      toast.success("تم إرسال البلاغ للسائق");
      setDescription("");
      setOpen(false);
    } catch (error: any) {
      toast.error("حدث خطأ في إرسال البلاغ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full bg-orange-500/10 border-orange-500/30 text-orange-600 hover:bg-orange-500/20"
        >
          <Package className="ml-2 h-4 w-4" />
          الإبلاغ عن أمتعة مفقودة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>الإبلاغ عن أمتعة مفقودة</DialogTitle>
          <DialogDescription>
            {tripInfo}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">وصف الأمتعة المفقودة</Label>
            <Textarea
              id="description"
              placeholder="مثال: حقيبة سوداء صغيرة تحتوي على مستندات..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || !description.trim()}
          >
            {loading ? "جاري الإرسال..." : "إرسال البلاغ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportLostItemDialog;
