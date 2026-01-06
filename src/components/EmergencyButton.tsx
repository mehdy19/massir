import { useState } from "react";
import { Phone, X, Shield, Users, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const emergencyNumbers = [
  {
    name: "الشرطة",
    number: "17",
    icon: Shield,
    color: "bg-blue-500",
  },
  {
    name: "الدرك الوطني",
    number: "1055",
    icon: Users,
    color: "bg-green-600",
  },
  {
    name: "الحماية المدنية",
    number: "14",
    icon: Flame,
    color: "bg-orange-500",
  },
];

const EmergencyButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 left-4 z-50 h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg animate-pulse"
          aria-label="طوارئ"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-center pb-4">
          <SheetTitle className="text-xl text-destructive flex items-center justify-center gap-2">
            <Phone className="h-5 w-5" />
            أرقام الطوارئ
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-3 pb-6">
          {emergencyNumbers.map(({ name, number, icon: Icon, color }) => (
            <a
              key={number}
              href={`tel:${number}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border-2 border-border hover:border-primary transition-all active:scale-[0.98]"
            >
              <div className={`p-3 rounded-full ${color} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-bold text-lg">{name}</p>
                <p className="text-muted-foreground text-2xl font-bold tracking-wider">
                  {number}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500 text-white">
                <Phone className="h-5 w-5" />
              </div>
            </a>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground pb-4">
          اضغط على الرقم للاتصال مباشرة
        </p>
      </SheetContent>
    </Sheet>
  );
};

export default EmergencyButton;
