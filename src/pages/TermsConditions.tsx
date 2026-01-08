import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsConditions = () => {
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
              الشروط والأحكام - {isDriver ? "السائقين" : "المستخدمين"}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground space-y-6">
            <p className="text-muted-foreground text-center">
              آخر تحديث: {new Date().toLocaleDateString("ar-DZ")}
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">المادة 1: التعريفات</h2>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>التطبيق:</strong> تطبيق "مسار" للنقل بين المدن</li>
                <li><strong>الخدمة:</strong> خدمات النقل والحجز المقدمة عبر التطبيق</li>
                {isDriver ? (
                  <li><strong>السائق:</strong> كل شخص طبيعي أو معنوي يقدم خدمات النقل عبر التطبيق</li>
                ) : (
                  <li><strong>المستخدم:</strong> كل شخص يستخدم التطبيق لحجز رحلات النقل</li>
                )}
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">المادة 2: قبول الشروط</h2>
              <p>
                باستخدامكم لتطبيق "مسار"، فإنكم توافقون على هذه الشروط والأحكام. إذا لم توافقوا على أي جزء من هذه الشروط، يرجى عدم استخدام التطبيق.
              </p>
            </section>

            {isDriver ? (
              <>
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-primary">المادة 3: شروط التسجيل كسائق</h2>
                  <p>للتسجيل كسائق، يجب عليكم:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>أن تكونوا حاملين لرخصة سياقة سارية المفعول</li>
                    <li>أن تكونوا حاملين لبطاقة نقل المسافرين صادرة عن وزارة النقل الجزائرية</li>
                    <li>أن تكون المركبة مؤمنة ومطابقة لمعايير السلامة</li>
                    <li>أن يكون عمركم 21 سنة على الأقل</li>
                    <li>أن تكونوا حاملين لسجل جنائي نظيف (البطاقة رقم 3)</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-primary">المادة 4: التزامات السائق</h2>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>الالتزام بقوانين المرور والسلامة الجزائرية</li>
                    <li>تقديم خدمة نقل آمنة ومريحة</li>
                    <li>الالتزام بمواعيد الرحلات المعلنة</li>
                    <li>عدم تجاوز العدد المسموح به من الركاب</li>
                    <li>إبلاغ المسافرين بأي تغييرات في الرحلة</li>
                    <li>الحفاظ على نظافة المركبة</li>
                    <li>التصريح الضريبي بالدخل وفقاً للقانون الجزائري</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-primary">المادة 5: الأسعار والدفع</h2>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>السائق مسؤول عن تحديد أسعار الرحلات</li>
                    <li>يجب أن تكون الأسعار معقولة ومتوافقة مع السوق</li>
                    <li>يتم الدفع مباشرة بين الراكب والسائق</li>
                    <li>يجب إصدار وصل للراكب عند الطلب</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-primary">المادة 6: المسؤولية</h2>
                  <p>
                    السائق مسؤول بالكامل عن:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>سلامة الركاب أثناء الرحلة</li>
                    <li>أمتعة الركاب وفقاً لقانون النقل</li>
                    <li>أي حوادث أو أضرار ناتجة عن إهماله</li>
                    <li>التأمين الشامل على المركبة والركاب</li>
                  </ul>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-primary">المادة 3: شروط استخدام الخدمة</h2>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>يجب أن يكون عمركم 18 سنة على الأقل</li>
                    <li>تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
                    <li>عدم استخدام التطبيق لأغراض غير مشروعة</li>
                    <li>الالتزام بتعليمات السائق أثناء الرحلة</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-primary">المادة 4: الحجز والإلغاء</h2>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>يمكنكم حجز مقاعد في الرحلات المتاحة</li>
                    <li>يجب إلغاء الحجز قبل ساعتين على الأقل من موعد الرحلة</li>
                    <li>الإلغاء المتكرر قد يؤدي إلى تعليق الحساب</li>
                    <li>يحق للسائق إلغاء الرحلة لأسباب قاهرة</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-primary">المادة 5: الدفع</h2>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>يتم الدفع مباشرة للسائق بالدينار الجزائري</li>
                    <li>السعر المعروض هو السعر النهائي</li>
                    <li>يحق لكم طلب وصل من السائق</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-primary">المادة 6: التزامات المستخدم</h2>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>الحضور في الموعد المحدد</li>
                    <li>احترام السائق والركاب الآخرين</li>
                    <li>عدم حمل مواد ممنوعة أو خطرة</li>
                    <li>الالتزام بعدد الأمتعة المسموح بها</li>
                  </ul>
                </section>
              </>
            )}

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">المادة 7: حل النزاعات</h2>
              <p>
                في حالة نشوء نزاع، يتم اللجوء أولاً إلى التسوية الودية. في حالة عدم التوصل إلى حل، تختص المحاكم الجزائرية بالفصل في النزاع وفقاً للقانون الجزائري.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">المادة 8: تعديل الشروط</h2>
              <p>
                نحتفظ بحق تعديل هذه الشروط والأحكام في أي وقت. سيتم إخطاركم بأي تعديلات جوهرية عبر التطبيق أو البريد الإلكتروني.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">المادة 9: إنهاء الخدمة</h2>
              <p>
                يحق لنا إنهاء أو تعليق حسابكم في حالة:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>مخالفة هذه الشروط والأحكام</li>
                <li>تقديم معلومات خاطئة</li>
                <li>السلوك غير اللائق</li>
                <li>أي نشاط غير قانوني</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">المادة 10: القانون الواجب التطبيق</h2>
              <p>
                تخضع هذه الشروط والأحكام للقانون الجزائري، بما في ذلك:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>القانون المدني الجزائري</li>
                <li>قانون النقل البري للمسافرين</li>
                <li>قانون حماية المستهلك رقم 09-03</li>
                <li>قانون حماية البيانات الشخصية رقم 18-07</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-primary">التواصل معنا</h2>
              <p>
                للاستفسارات أو الشكاوى، يمكنكم التواصل معنا عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>البريد الإلكتروني: support@masar.dz</li>
                <li>الهاتف: +213 XX XX XX XX</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsConditions;
