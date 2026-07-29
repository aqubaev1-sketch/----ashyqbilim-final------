import Link from 'next/link';

const License = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-6 pt-24 pb-10">
      <h1 className="text-3xl font-bold">ASHYQ BILIM лицензиялық келісімі</h1>

      <p>
        Осы Лицензиялық келісім ашық цифрлық білім беру ресурсы{" "}
        <strong>ASHYQ BILIM</strong> платформасын пайдалану тәртібін реттейді.
      </p>

      <section>
        <h2 className="text-xl font-semibold">1. Жалпы ережелер</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            1.1. <strong>ASHYQ BILIM</strong> ресурсы ғылыми қызметті және білім беру
            саласындағы зерттеулерді қолдауға арналған.
          </li>
          <li>
            1.2. Платформада орналастырылған материалдарды пайдалану арқылы
            пайдаланушы осы Келісімнің талаптарын қабылдайды.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          2. Материалдарды пайдалану құқықтары
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            2.1. Платформада орналастырылған барлық материалдар (әдістемелік
            құралдар, мәтіндер, файлдар) тек коммерциялық емес білім беру
            мақсатында пайдалануға арналған.
          </li>
          <li>
            2.2. Пайдаланушыларға материалдарды жүктеп алуға, қарауға және
            дәйексөз ретінде қолдануға рұқсат етіледі, бірақ бастапқы дереккөз
            ретінде <strong>ASHYQ BILIM</strong> ресурсына міндетті түрде сілтеме
            көрсету қажет.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">3. Шектеулер</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            3.1. Құқық иесінің жазбаша келісімінсіз платформа материалдарын
            өзгертуге, қайта сатуға немесе коммерциялық мақсатта пайдалануға
            тыйым салынады..
          </li>
          <li>
            3.2. Пайдаланушылар ұсынылған материалдарды пайдалану кезінде
            авторлық құқық талаптарының сақталуына өздері жауап береді.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">4. Жауапкершілік</h2>
        <p>
          4.1. <strong>ASHYQ BILIM</strong> платформасының әкімшілігі материалдардың
          өзектілігін қамтамасыз етуге ұмтылады, алайда ұсынылған зерттеу
          материалдарындағы ықтимал дәлсіздіктер немесе қателер үшін
          жауапкершілік көтермейді.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">5. Байланыс</h2>
        <p>
          Лицензиялау немесе авторлық құқық мәселелері бойынша бізбен келесі
          байланыс арналары арқылы хабарласа аласыз:
        </p>
        <div className="mt-2">
          <p>
            Email:{" "}
            <a
              href="mailto:info@qyzpu.edu.kz"
              className="text-blue-600 hover:underline"
            >
              info@edu.kz
            </a>
          </p>
          <p>Телефон: +7 (727) 237-00-95</p>
          <p>Мекенжай: Алматы қ., Әйтеке би көшесі, 99</p>
        </div>
         
      </section>
      <div>
       <Link
  href="/"
  className="inline-block mt-8 px-8 py-4 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-2xl shadow-lg shadow-indigo-950/20 text-center transition-all whitespace-nowrap"
>
  Басты бет
</Link>
      </div>
    </div>
  );
};

export default License;