"use client";
import { useState, useEffect } from "react";
import { Button, AnimatedContent } from "@/components/ui";
import { CalendarDays, MapPin, Clock, ChevronDown } from "lucide-react";
import Link from "next/link";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, isValid, isBefore } from "date-fns";
import type { EventData } from "./types";
import { formatDate, formatEventDate } from "@/lib/utils";

interface HeroSectionProps {
  event?: EventData;
  countdownTarget?: Date;
}

export const EventHero = ({ event, countdownTarget }: HeroSectionProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false
  });

  useEffect(() => {
    if (!countdownTarget || !isValid(countdownTarget)) return;

    const calculateTimeLeft = () => {
      const now = new Date();

      if (isBefore(countdownTarget, now)) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true };
      }

      return {
        days: differenceInDays(countdownTarget, now),
        hours: differenceInHours(countdownTarget, now) % 24,
        minutes: differenceInMinutes(countdownTarget, now) % 60,
        seconds: differenceInSeconds(countdownTarget, now) % 60,
        isFinished: false
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.isFinished) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownTarget]);

  const countdownItems = [
    { label: "Días", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Seg", value: timeLeft.seconds },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-charcoal">
        {event?.bannerUrl && (
          <img
            src={event.bannerUrl}
            alt={event?.name || "Evento"}
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal" />
      </div>

      {/* Corner Logo */}
      {event?.logoUrl && (
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-20 group">
          <div className="absolute -inset-4 bg-ember/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
          <img 
            src={event.logoUrl} 
            alt={`${event.name} Logo`} 
            className="relative h-16 sm:h-24 md:h-32 w-auto object-contain opacity-20 group-hover:opacity-100 transition-all duration-500 drop-shadow-2xl"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <AnimatedContent>
          <h1 className="font-satoshi font-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-white leading-none mb-6 tracking-tight italic uppercase">
            {event?.city && (
              <span className="block text-ember text-sm sm:text-base md:text-xl tracking-[0.3em] mb-2 font-black not-italic">
                {event.city}
              </span>
            )}
            {event?.organization?.name && (
              <span className="block text-white/50 text-[10px] uppercase tracking-[0.4em] mb-4 font-black">
                Organizado por <span className="text-ember">{event.organization.name}</span>
              </span>
            )}
            {event?.name || "Nombre del Evento"}
          </h1>
        </AnimatedContent>

        <AnimatedContent delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/70 font-satoshi text-base sm:text-lg mb-10">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-ember" />
              {event?.date ? formatEventDate(event.date, 'text') : "Fecha por confirmar"}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-ember" />
              {event?.time || "Hora por confirmar"}
            </span>
          </div>
        </AnimatedContent>

        {/* Countdown */}
        {countdownTarget && !timeLeft.isFinished && (
          <div className="flex justify-center flex-wrap gap-4 mb-10">
            {countdownItems.map((item, idx) => (
              <AnimatedContent key={item.label} delay={0.4 + idx * 0.1} distance={50}>
                <div className="flex flex-col items-center min-w-[70px]">
                  <span className="font-satoshi font-black text-3xl sm:text-4xl md:text-5xl text-ember italic">
                    {item.value.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider font-satoshi">
                    {item.label}
                  </span>
                </div>
              </AnimatedContent>
            ))}
          </div>
        )}

        {timeLeft.isFinished && (
          <AnimatedContent delay={0.4}>
            <div className="mb-10">
              <span className="font-satoshi font-black text-2xl sm:text-3xl text-ember uppercase italic">
                ¡El evento ha comenzado!
              </span>
            </div>
          </AnimatedContent>
        )}

        <AnimatedContent delay={0.8}>
          {event?.slug ? (
            <Link href={`/${event.slug}/inscripciones`}>
              <Button
                variant="mechanical"
                size="lg"
                className="bg-ember text-white border-0 hover:scale-105 active:scale-95 transition-transform"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.5)' }}
              >
                Inscríbete Ahora
              </Button>
            </Link>
          ) : (
            <Button
              variant="mechanical"
              size="lg"
              className="bg-ember text-white border-0"
              style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.5)' }}
            >
              Inscríbete Ahora
            </Button>
          )}
        </AnimatedContent>
      </div>

      {/* Scroll indicator */}
      {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/50" />
      </div> */}
    </section>
  );
};


