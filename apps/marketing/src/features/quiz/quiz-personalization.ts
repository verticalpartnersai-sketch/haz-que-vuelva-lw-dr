import type {
  DesireCommitment,
  DominantFear,
  ExecutionCommitment,
  ProofPreviewStoryId,
} from "@/features/quiz/quiz-contracts";
import type { Locale } from "@/features/i18n/locale";

const proofOrder: Record<DesireCommitment, readonly ProofPreviewStoryId[]> = {
  desire_missing: ["camila", "valentina", "sofia"],
  desire_control: ["sofia", "camila", "valentina"],
};

export function personalizeProofStories<T extends { id: ProofPreviewStoryId }>(
  stories: readonly T[],
  desire: DesireCommitment | undefined,
): T[] {
  if (!desire) return [...stories];

  const byId = new Map(stories.map((story) => [story.id, story]));
  return proofOrder[desire]
    .map((id) => byId.get(id))
    .filter((story): story is T => Boolean(story));
}

export function desireProofLead(
  desire: DesireCommitment | undefined,
  locale: Locale,
): string {
  const copy: Record<Locale, Record<DesireCommitment | "default", string>> = {
    es: {
      desire_missing:
        "Elegiste hacer que su ausencia vuelva a pesarle. Mira lo que pasó cuando ellas dejaron de perseguir la reacción que más querían.",
      desire_control:
        "Elegiste saber exactamente qué hacer sin perseguirlo. Mira cómo una ruta concreta cambió el momento de escribir, responder o guardar silencio.",
      default:
        "Mira qué cambió cuando dejaron de improvisar y siguieron una ruta durante los momentos más difíciles.",
    },
    pt: {
      desire_missing:
        "Você escolheu fazer sua ausência voltar a pesar para ele. Veja o que aconteceu quando elas pararam de perseguir a reação que mais queriam.",
      desire_control:
        "Você escolheu saber exatamente o que fazer sem persegui-lo. Veja como uma rota concreta mudou a hora de escrever, responder ou ficar em silêncio.",
      default:
        "Veja o que mudou quando elas pararam de improvisar e seguiram uma rota nos momentos mais difíceis.",
    },
    en: {
      desire_missing:
        "You chose to make your absence weigh on him again. See what happened when they stopped chasing the reaction they wanted most.",
      desire_control:
        "You chose to know exactly what to do without chasing him. See how a concrete route changed when they texted, replied, or stayed silent.",
      default:
        "See what changed when they stopped improvising and followed a route through the hardest moments.",
    },
  };

  return copy[locale][desire ?? "default"];
}

export function fearMirror(
  fear: DominantFear | undefined,
  locale: Locale,
): string {
  const copy: Record<Locale, Record<DominantFear | "default", string>> = {
    es: {
      forgotten:
        "Tu mayor miedo es que te olvide. Ese miedo te empuja a actuar antes de saber si el canal permite hacerlo.",
      other_woman:
        "Tu mayor miedo es llegar tarde y verlo elegir a otra. Por eso cualquier señal puede empujarte a competir, vigilar o provocar una reacción.",
      closed_window:
        "Tu mayor miedo es que la última ventana se cierre. Esa urgencia puede hacerte enviar el mensaje que termine de cerrarla.",
      repeat_cycle:
        "Tu mayor miedo es que vuelva una noche y desaparezca otra vez. Tu ruta necesita medir consistencia antes de entregarle otra oportunidad.",
      default:
        "Tu miedo intenta convertir cada señal en una urgencia. La ruta existe para que esa urgencia no vuelva a decidir por ti.",
    },
    pt: {
      forgotten:
        "Seu maior medo é que ele esqueça você. Esse medo empurra você a agir antes de saber se o canal permite isso.",
      other_woman:
        "Seu maior medo é chegar tarde e vê-lo escolher outra. Por isso, qualquer sinal pode empurrar você para competir, vigiar ou provocar uma reação.",
      closed_window:
        "Seu maior medo é que a última janela se feche. Essa urgência pode fazer você enviar a mensagem que termine de fechá-la.",
      repeat_cycle:
        "Seu maior medo é que ele volte uma noite e desapareça outra vez. Sua rota precisa medir consistência antes de entregar outra oportunidade.",
      default:
        "Seu medo tenta transformar cada sinal em urgência. A rota existe para essa urgência não voltar a decidir por você.",
    },
    en: {
      forgotten:
        "Your biggest fear is that he will forget you. That fear pushes you to act before you know whether the channel allows it.",
      other_woman:
        "Your biggest fear is arriving too late and watching him choose someone else. That is why any signal can push you to compete, monitor, or provoke a reaction.",
      closed_window:
        "Your biggest fear is that the last opening will close. That urgency can make you send the message that finishes closing it.",
      repeat_cycle:
        "Your biggest fear is that he returns for one night and disappears again. Your route needs to measure consistency before giving him another chance.",
      default:
        "Your fear tries to turn every signal into an emergency. The route exists so that urgency does not decide for you again.",
    },
  };

  return copy[locale][fear ?? "default"];
}

export function commitmentLoaderTitle(
  commitment: ExecutionCommitment | undefined,
  locale: Locale,
): string | undefined {
  if (!commitment) return undefined;

  const copy: Record<Locale, Record<ExecutionCommitment, string>> = {
    es: {
      commit_route:
        "Cerrando tu ruta de 7 días para que deje de encontrarte siempre disponible…",
      commit_simple:
        "Organizando exactamente qué hacer durante los próximos 7 días…",
    },
    pt: {
      commit_route:
        "Fechando sua rota de 7 dias para ele parar de encontrar você sempre disponível…",
      commit_simple:
        "Organizando exatamente o que fazer durante os próximos 7 dias…",
    },
    en: {
      commit_route:
        "Finalizing your 7-day route so he stops finding you always available…",
      commit_simple:
        "Organizing exactly what to do over the next 7 days…",
    },
  };

  return copy[locale][commitment];
}
