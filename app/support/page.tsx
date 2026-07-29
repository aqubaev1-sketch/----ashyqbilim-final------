"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";


function Support() {
 const handleRedirect = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  const form = e.currentTarget;

  const name = (form.elements.namedItem("name") as HTMLInputElement).value;
  const email = (form.elements.namedItem("email") as HTMLInputElement).value;
  const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;

  const { error } = await supabase
    .from("contact_messages")
    .insert([
      {
        name,
        email,
        message,
      },
    ]);

  if (error) {
    alert("Қате: " + error.message);
    return;
  }

  alert("Хабарлама сәтті жіберілді!");
  form.reset();
};

  return (
    <div className="animate-fadeIn">
      <Header/>
    <div className="bg-white min-h-screen">
      
      
      {/* Негізгі секция */}
      <section className="pt-32 pb-20 font-sans">
        <div className="container mx-auto px-6 max-w-[1200px]">
          
          {/* Бас тақырып */}
          <div id="suppott" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Қолдау және кері байланыс</h2>
            <p className="text-lg text-slate-600 mt-4 opacity-70">
              Кураторларға сұрақ қойыңыз, платформаның өзекті жаңартуларымен танысыңыз немесе жиі қойылатын сұрақтарды оқыңыз
            </p>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-8">Жиі қойылатын сұрақтардың жауаптары (FAQ)</h3>

          {/* FAQ және Форма контейнері */}
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Сол жақ: FAQ (Аккордеондар) */}
            <div className="w-full lg:max-w-[692px] space-y-4">
              {[
                { q: "Курс материалдарына қалай қол жеткізуге болады?", a: "Ашық цифрлық білім беру ресурсының (АЦБР / ОЦОР) барлық материалдары ашық қолжетімділікте және оқу үшін тегін. Каталогтан ұнайтын курсты таңдап, «Курсты ашу» түймесін басу жеткілікті." },
                { q: "Қосымша файлдар мен әдістемелік құралдарды қалай жүктеп алуға болады?", a: "Қосымша файлдар, әдістемелік ұсынымдар мен конспектілер әр курс тақырыптарының ішінде «Материалдар» бөлімінде қолжетімді. Оларды PDF, DOCX немесе ZIP форматтарында бір рет басу арқылы жүктеп ала аласыз." },
                
                { q: "Авторларға өздерінің оқу материалдарын платформада жариялауға бола ма?", a: "Әрине! ASHYQ BILIM — ашық платформа. Сіз қолдау формасы арқылы өз зерттеуіңізді, әдістемелік материалыңызды немесе авторлық вебинарыңызды ұсына аласыз немесе ғылыми-әдістемелік кеңеспен байланыса аласыз." }
              ].map((item, idx) => (
                <details key={idx} className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition-all">
                  <summary className="list-none flex justify-between items-center p-6 cursor-pointer font-semibold text-slate-800">
                    {item.q}
                    <span className="w-2 h-2 border-r-2 border-b-2 border-slate-400 rotate-45 group-open:-rotate-[135deg] transition-transform"></span>
                  </summary>
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-2">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>

            {/* Оң жақ: Форма */}
            <div className="w-full lg:max-w-[460px] bg-white border border-slate-200 rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Кері байланыс</h2>
              
              <form className="space-y-5" onSubmit={handleRedirect}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Аты</label>
                  <input
  name="name"
  required
  className="w-full p-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Айсултан"
/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input name="email" type="email" required className="w-full p-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nurbolatov@mail.ru" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Хабарлама</label>
                  <textarea name="message" required className="w-full p-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-28" placeholder="Сіздің сұрағыңыз немесе ұсынысыңыз..."></textarea>
                </div>
                
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-md">
                  Жіберу
                </button>
              </form>

              <hr className="my-8 border-slate-100" />

              <div className="space-y-4 text-sm text-slate-600">
                <h3 className="font-bold text-slate-900">Байланыстар</h3>
                <p className="flex items-center gap-2">📞 <a href="tel:+77272370095" className="hover:text-blue-600">+7 (727) 237-00-95</a></p>
                <p className="flex items-center gap-2">✉️ <a href="mailto:info@qyzpu.edu.kz" className="hover:text-blue-600">info@qyzpu.edu.kz</a></p>
                <p className="flex items-center gap-2">📍 г. Алматы, Айтеке би, 99</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
    <Footer/>
    </div>
  );
}

export default Support;