"use client";

import Link from "next/link";

import { useLocale } from "@/features/i18n/locale";
import { QuizLogo } from "@/features/quiz/quiz-intro-question";

type LegalPageKind = "privacy" | "terms";

export function LegalPublicPage({ kind }: { kind: LegalPageKind }) {
  const { l } = useLocale();
  const legalRegistration =
    process.env.NEXT_PUBLIC_VERTICAL_PARTNERS_CNPJ?.trim();

  const privacySections = [
    {
      heading: l("Qué datos tratamos", "Quais dados tratamos", "Data we process"),
      body: l(
        "Podemos tratar los datos que proporcionas en el quiz, datos técnicos de navegación y la información necesaria para entregar el acceso adquirido. Los pagos son procesados por PerfectPay; Haz Que Vuelva no almacena los datos completos de tu tarjeta.",
        "Podemos tratar os dados fornecidos no quiz, dados técnicos de navegação e as informações necessárias para entregar o acesso adquirido. Os pagamentos são processados pela PerfectPay; o Haz Que Vuelva não armazena os dados completos do seu cartão.",
        "We may process quiz answers, technical browsing data, and the information required to deliver purchased access. Payments are processed by PerfectPay; Haz Que Vuelva does not store your complete card details.",
      ),
    },
    {
      heading: l("Para qué los usamos", "Para que usamos", "How we use it"),
      body: l(
        "Usamos esos datos para operar el quiz, entregar el producto, gestionar tu acceso, prestar soporte, prevenir abusos y entender el funcionamiento de la experiencia.",
        "Usamos esses dados para operar o quiz, entregar o produto, gerenciar seu acesso, prestar suporte, prevenir abusos e entender o funcionamento da experiência.",
        "We use this data to run the quiz, deliver the product, manage access, provide support, prevent abuse, and understand how the experience performs.",
      ),
    },
    {
      heading: l("Tus derechos", "Seus direitos", "Your rights"),
      body: l(
        "Puedes solicitar información, corrección o eliminación de tus datos personales cuando corresponda. Escríbenos desde el correo utilizado en la compra para que podamos validar tu identidad.",
        "Você pode solicitar informações, correção ou exclusão dos seus dados pessoais quando aplicável. Escreva pelo e-mail usado na compra para que possamos validar sua identidade.",
        "You may request access, correction, or deletion of your personal data where applicable. Contact us from the email used for purchase so we can verify your identity.",
      ),
    },
  ];

  const termsSections = [
    {
      heading: l("Naturaleza del producto", "Natureza do produto", "Product nature"),
      body: l(
        "Haz Que Vuelva es un producto digital educativo. Ofrece orientación y herramientas prácticas, pero no sustituye atención psicológica, médica o jurídica y no garantiza que una relación sea retomada.",
        "Haz Que Vuelva é um produto digital educacional. Ele oferece orientação e ferramentas práticas, mas não substitui atendimento psicológico, médico ou jurídico e não garante que um relacionamento seja retomado.",
        "Haz Que Vuelva is a digital educational product. It provides guidance and practical tools, but it does not replace psychological, medical, or legal care and does not guarantee that a relationship will resume.",
      ),
    },
    {
      heading: l("Acceso y uso", "Acesso e uso", "Access and use"),
      body: l(
        "El acceso es personal y no puede ser compartido, revendido ni utilizado para acosar, vigilar o vulnerar límites expresados por otra persona. Debes respetar siempre la privacidad, el consentimiento y la ley aplicable.",
        "O acesso é pessoal e não pode ser compartilhado, revendido ou usado para assediar, vigiar ou violar limites expressos por outra pessoa. Você deve sempre respeitar a privacidade, o consentimento e a legislação aplicável.",
        "Access is personal and may not be shared, resold, or used to harass, monitor, or violate another person's expressed boundaries. You must always respect privacy, consent, and applicable law.",
      ),
    },
    {
      heading: l("Pago y garantía", "Pagamento e garantia", "Payment and guarantee"),
      body: l(
        "El pago se procesa en PerfectPay. La oferta incluye una garantía de satisfacción de 7 días, sujeta a la solicitud dentro del plazo y a las reglas informadas en el checkout.",
        "O pagamento é processado pela PerfectPay. A oferta inclui garantia de satisfação de 7 dias, condicionada à solicitação dentro do prazo e às regras informadas no checkout.",
        "Payment is processed by PerfectPay. The offer includes a 7-day satisfaction guarantee, subject to a request within the stated period and the rules shown at checkout.",
      ),
    },
  ];

  const isPrivacy = kind === "privacy";
  const sections = isPrivacy ? privacySections : termsSections;

  return (
    <main className="legal-public">
      <QuizLogo compact />
      <article>
        <span>HAZ QUE VUELVA</span>
        <h1>
          {isPrivacy
            ? l("Política de privacidad", "Política de privacidade", "Privacy policy")
            : l("Términos de uso", "Termos de uso", "Terms of use")}
        </h1>
        <p className="legal-public__lead">
          {l(
            "Información clara sobre el uso de esta experiencia digital.",
            "Informações claras sobre o uso desta experiência digital.",
            "Clear information about the use of this digital experience.",
          )}
        </p>

        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}

        <section>
          <h2>{l("Contacto", "Contato", "Contact")}</h2>
          <p>
            {l(
              "Para consultas sobre privacidad, acceso o soporte:",
              "Para dúvidas sobre privacidade, acesso ou suporte:",
              "For privacy, access, or support questions:",
            )}{" "}
            <a href="mailto:soporte@hazquevuelva.site">
              soporte@hazquevuelva.site
            </a>
          </p>
        </section>

        <footer>
          <p>
            Vertical Partners
            {legalRegistration ? ` · CNPJ ${legalRegistration}` : ""}
          </p>
          <Link href="/quiz">
            {l("Volver al quiz", "Voltar ao quiz", "Return to the quiz")}
          </Link>
        </footer>
      </article>
    </main>
  );
}
