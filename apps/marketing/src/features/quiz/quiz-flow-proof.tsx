import Image from "next/image";

import type { QuizFlowCopy } from "./quiz-flow-contracts";

export function QuizFlowProof({ copy }: { copy: QuizFlowCopy }) {
  const imageAlt = copy.locale === "pt"
    ? "Print de conversa após seguir a rota"
    : "Captura de conversación después de seguir la ruta";

  return (
    <section
      aria-label={copy.locale === "pt" ? "Prints de resultados" : "Capturas de resultados"}
      className="quiz-v2-proof-stack"
    >
      {copy.proofs.map((story) => (
        <figure key={story.id}>
          <Image
            alt={`${story.name}: ${imageAlt}`}
            height={1275}
            loading="eager"
            sizes="(max-width: 640px) calc(100vw - 42px), 430px"
            src={story.src}
            width={900}
          />
        </figure>
      ))}
    </section>
  );
}
