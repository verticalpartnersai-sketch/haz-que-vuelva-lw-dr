"use client";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type { QuizAnswers } from "@/features/quiz/quiz-contracts";
import { resolvedLastAction } from "@/features/quiz/quiz-engine";
import { quizContentFor } from "@/features/quiz/quiz-i18n";

export function QuizBrandSystem({
  answers,
}: {
  answers: QuizAnswers;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const { creation, creed, enemy, lexicon, neuro, rituals } = copy.brand;
  const mirror = {
    en: {
      eyebrow: "YOUR PATTERN, NOT A GENERIC TEST",
      sentence: `You marked: ${copy.summaries.state[answers.current_state ?? "cold_contact"]}. Last move: ${copy.summaries.action[resolvedLastAction(answers)]}. Dominant pain: ${copy.summaries.pain[answers.dominant_pain ?? "silence"]}. That sequence—not one isolated message—is what your route must interrupt.`,
    },
    es: {
      eyebrow: "TU PATRÓN, NO UN TEST GENÉRICO",
      sentence: `Marcaste: ${copy.summaries.state[answers.current_state ?? "cold_contact"]}. Última acción: ${copy.summaries.action[resolvedLastAction(answers)]}. Dolor dominante: ${copy.summaries.pain[answers.dominant_pain ?? "silence"]}. Esa secuencia —no un mensaje aislado— es lo que tu ruta debe interrumpir.`,
    },
    pt: {
      eyebrow: "SEU PADRÃO, NÃO UM TESTE GENÉRICO",
      sentence: `Você marcou: ${copy.summaries.state[answers.current_state ?? "cold_contact"]}. Última ação: ${copy.summaries.action[resolvedLastAction(answers)]}. Dor dominante: ${copy.summaries.pain[answers.dominant_pain ?? "silence"]}. É essa sequência — não uma mensagem isolada — que sua rota precisa interromper.`,
    },
  }[locale];

  return (
    <section className="quiz-primal" aria-label={creation.eyebrow}>
      <article className="quiz-neuro">
        <div aria-hidden="true" className="quiz-neuro__signal">
          <span />
          <Icon name="spark" />
        </div>
        <div>
          <span className="section-kicker">{neuro.eyebrow}</span>
          <h2>{neuro.headline}</h2>
          <p>{neuro.body}</p>
          <aside className="quiz-neuro__mirror">
            <strong>{mirror.eyebrow}</strong>
            <p>{mirror.sentence}</p>
          </aside>
        </div>
      </article>

      <article className="quiz-creed">
        <span className="section-kicker">{creed.eyebrow}</span>
        <ol>
          {creed.lines.map((line, index) => (
            <li key={line}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{line}</strong>
            </li>
          ))}
        </ol>
      </article>

      <div className="quiz-brand-story">
        <article>
          <span className="section-kicker">{creation.eyebrow}</span>
          <h2>{creation.headline}</h2>
          <p>{creation.body}</p>
        </article>
        <article className="quiz-brand-enemy">
          <span className="section-kicker">{enemy.eyebrow}</span>
          <Icon name="arrowDown" />
          <h2>{enemy.headline}</h2>
          <p>{enemy.body}</p>
        </article>
      </div>

      <section className="quiz-rituals">
        <header>
          <span className="section-kicker">{rituals.eyebrow}</span>
          <h2>{rituals.headline}</h2>
        </header>
        <ol>
          {rituals.items.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="quiz-lexicon">
        <header>
          <span className="section-kicker">{lexicon.eyebrow}</span>
          <h2>{lexicon.headline}</h2>
        </header>
        <dl>
          {lexicon.items.map((item) => (
            <div key={item.title}>
              <dt>{item.title}</dt>
              <dd>{item.description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </section>
  );
}
