"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { Locale } from "@/features/i18n/locale";
import type {
  QuizAnswers,
  QuizRoute,
  QuizStage,
} from "@/features/quiz/quiz-contracts";
import {
  notificationContentFor,
  type QuizNotificationBeat,
  type QuizNotificationContent,
} from "@/features/quiz/quiz-notification-config";
import { track } from "@/features/quiz/quiz-runtime";

const notificationSessionKey = "hazquevuelva:quiz-notifications:v1";
const visibleDuration = 4400;

type NotificationTrigger = {
  beat: QuizNotificationBeat;
  delay: number;
};

function triggerFor(stage: QuizStage, questionIndex: number) {
  if (stage === "question" && questionIndex === 1) {
    return { beat: "channel", delay: 950 } satisfies NotificationTrigger;
  }
  if (stage === "question" && questionIndex === 3) {
    return { beat: "impact", delay: 1050 } satisfies NotificationTrigger;
  }
  if (stage === "prediagnosis") {
    return { beat: "signal", delay: 1200 } satisfies NotificationTrigger;
  }
  if (stage === "result") {
    return { beat: "opening", delay: 1700 } satisfies NotificationTrigger;
  }
  return null;
}

function restoredNotificationIds() {
  if (typeof window === "undefined") return new Set<QuizNotificationBeat>();
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(notificationSessionKey) ?? "[]",
    ) as unknown;
    if (!Array.isArray(parsed)) return new Set<QuizNotificationBeat>();
    return new Set(
      parsed.filter(
        (value): value is QuizNotificationBeat =>
          value === "channel" ||
          value === "impact" ||
          value === "signal" ||
          value === "opening",
      ),
    );
  } catch {
    return new Set<QuizNotificationBeat>();
  }
}

function rememberNotification(ids: Set<QuizNotificationBeat>) {
  window.sessionStorage.setItem(notificationSessionKey, JSON.stringify([...ids]));
}

export function useQuizNotifications({
  answers,
  cycle,
  locale,
  onSound,
  questionIndex,
  route,
  stage,
}: {
  answers: QuizAnswers;
  cycle: number;
  locale: Locale;
  onSound: () => void;
  questionIndex: number;
  route: QuizRoute;
  stage: QuizStage;
}) {
  const [active, setActive] = useState<QuizNotificationContent | null>(null);
  const seenRef = useRef<Set<QuizNotificationBeat> | null>(null);

  useEffect(() => {
    seenRef.current = new Set<QuizNotificationBeat>();
    window.sessionStorage.removeItem(notificationSessionKey);
  }, [cycle]);

  useEffect(() => {
    const trigger = triggerFor(stage, questionIndex);
    if (!trigger) return;
    if (!seenRef.current) seenRef.current = restoredNotificationIds();
    if (seenRef.current.has(trigger.beat)) return;

    const content = notificationContentFor({
      answers,
      beat: trigger.beat,
      locale,
      route,
    });
    if (!content) {
      seenRef.current.add(trigger.beat);
      rememberNotification(seenRef.current);
      return;
    }

    const showTimer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      seenRef.current?.add(trigger.beat);
      if (seenRef.current) rememberNotification(seenRef.current);
      setActive(content);
      onSound();
      track("quiz_notification_impression", {
        notification_id: content.id,
        route,
      });
    }, trigger.delay);

    return () => window.clearTimeout(showTimer);
  }, [answers, cycle, locale, onSound, questionIndex, route, stage]);

  useEffect(() => {
    if (!active) return;
    const hideTimer = window.setTimeout(() => setActive(null), visibleDuration);
    return () => window.clearTimeout(hideTimer);
  }, [active]);

  useEffect(() => {
    function dismissWhenHidden() {
      if (document.visibilityState !== "visible") setActive(null);
    }
    document.addEventListener("visibilitychange", dismissWhenHidden);
    return () =>
      document.removeEventListener("visibilitychange", dismissWhenHidden);
  }, []);

  return { active };
}

export function QuizNotificationBanner({
  notification,
}: {
  notification: QuizNotificationContent | null;
}) {
  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="quiz-notification-viewport"
    >
      {notification ? (
        <section className="quiz-notification" role="status">
          <div aria-hidden="true" className="quiz-notification__app-icon">
            <Image
              alt=""
              height={30}
              src="/images/brand/third-party/whatsapp-glyph-white-2026.svg"
              width={30}
            />
          </div>
          <div className="quiz-notification__content">
            <div className="quiz-notification__app-meta">
              <span>WhatsApp</span>
              <span>{notification.timeLabel}</span>
            </div>
            <strong className="quiz-notification__sender">
              {notification.sender}
            </strong>
            <p>{notification.body}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
