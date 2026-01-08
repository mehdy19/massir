import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const isDriver = userRole === "driver";

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          رجوع
        </Button>

        <Card className="max-w-4xl mx-auto shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              سياسة الخصوصية - {isDriver ? "السائقين" : "المستخدمين"}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground space-y-6">
            <p className="text-muted-foreground text-center">
              آخر تحديث: {new Date().toLocaleDateString("ar-DZ")}
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">مقدمة</h2>
              <p>
                مرحباً بكم في تطبيق "مسار" للنقل بين المدن. نحن ملتزمون بحماية خصوصيتكم وبياناتكم الشخصية وفقاً للقانون الجزائري رقم 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">البيانات التي نجمعها</h2>
              <p>نقوم بجمع البيانات التالية:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الاسم الكامل</li>
                <li>البريد الإلكتروني</li>
                <li>رقم الهاتف</li>
                <li>الصورة الشخصية (اختياري)</li>
                {isDriver && (
                  <>
                    <li>معلومات المركبة</li>
                    <li>رخصة القيادة</li>
                    <li>بطاقة النقل</li>
                    <li>الموقع الجغرافي أثناء الرحلات</li>
                  </>
                )}
                {!isDriver && (
                  <>
                    <li>سجل الحجوزات والرحلات</li>
                    <li>تفضيلات السفر</li>
                  </>
                )}
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">كيف نستخدم بياناتكم</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>تقديم خدمات النقل وإدارة الحجوزات</li>
                <li>التواصل معكم بخصوص الرحلات</li>
                <li>تحسين جودة الخدمات المقدمة</li>
                <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
                {isDriver && (
                  <li>التحقق من صلاحية وثائق القيادة والنقل</li>
                )}
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">حماية البيانات</h2>
              <p>
                نتخذ إجراءات أمنية مناسبة لحماية بياناتكم من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف، وذلك وفقاً للمادة 39 من القانون 18-07.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">حقوقكم</h2>
              <p>وفقاً للقانون الجزائري، لديكم الحق في:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>الاطلاع على بياناتكم الشخصية</li>
                <li>تصحيح البيانات غير الدقيقة</li>
                <li>حذف بياناتكم (مع مراعاة الالتزامات القانونية)</li>
                <li>الاعتراض على معالجة بياناتكم</li>
                <li>سحب الموافقة في أي وقت</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">مشاركة البيانات</h2>
              <p>
                لا نشارك بياناتكم مع أطراف ثالثة إلا في الحالات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>بموافقتكم الصريحة</li>
                <li>للامتثال للمتطلبات القانونية</li>
                <li>لتنفيذ خدمات النقل (مشاركة معلومات الاتصال بين السائق والراكب)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">الاحتفاظ بالبيانات</h2>
              <p>
                نحتفظ ببياناتكم طوال فترة استخدامكم للتطبيق ولمدة 5 سنوات بعد آخر نشاط، وذلك للامتثال للمتطلبات القانونية والمحاسبية.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">التواصل معنا</h2>
              <p>
                للاستفسارات المتعلقة بالخصوصية أو لممارسة حقوقكم، يمكنكم التواصل معنا عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>البريد الإلكتروني: privacy@masar.dz</li>
                <li>الهاتف: +213 XX XX XX XX</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">السلطة المختصة</h2>
              <p>
                يمكنكم تقديم شكوى إلى السلطة الوطنية لحماية المعطيات ذات الطابع الشخصي في حال عدم رضاكم عن كيفية معالجة بياناتكم.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
