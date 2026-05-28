"use client";
import { SplitText } from "@/components/ui";

import { MapPin, Droplet, Trophy, Medal, Shirt, Award, Tag, Gift, Utensils } from "lucide-react";
import Image from "next/image";
import { TenantData } from "@/types";
import { StravaRouteEmbed } from "./StravaRouteEmbed";

interface EventDetailsSectionProps {
  data: TenantData;
}

const iconMap: Record<string, any> = {
  Shirt, Tag, Award, Utensils, Gift, Medal, Trophy, Droplet, MapPin
};

const getStravaRouteId = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  console.log(trimmed);
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/routes\/(\d+)/);
  return match ? match[1] : null;
};

export function EventDetailsSection({ data }: EventDetailsSectionProps) {
    const details = data.eventDetails;
    if (!details) return null;

    const stravaUrl = details.route?.stravaLinks?.[0]?.url;
    const stravaRouteId = getStravaRouteId(stravaUrl);
    console.log("hola");
    return (
        <section className="bg-charcoal relative overflow-hidden text-white">
            {/* Decorative ember scribbles */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-ember">
                    <path d="M10,20 Q30,10 50,20 T90,20" stroke="currentColor" fill="none" strokeWidth="2" />
                    <path d="M15,40 Q35,30 55,40 T95,40" stroke="currentColor" fill="none" strokeWidth="2" />
                </svg>
            </div>

            <div className="container mx-auto px-4 py-20 divide-y divide-white/10">
                
                {/* --- ROUTE SECTION --- */}
                {details.route && (
                  <div id="ruta" className="pb-20">
                      <div className="max-w-6xl mx-auto">
                          <SplitText
                              text={details.route.title || "LA RUTA"}
                              className="text-4xl md:text-6xl font-satoshi font-black mb-8 py-4 text-left italic uppercase tracking-tighter"
                              delay={50}
                              from={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                              to={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                              ease="bounce.out"
                              splitType="chars"
                              tag="h2"
                          />
                          
                          <div className="grid md:grid-cols-2 gap-8 items-start">
                              <div className="space-y-6">
                                  <p className="text-lg leading-relaxed text-left font-satoshi">
                                      {details.route.description}
                                  </p>
                                  <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg rounded-none p-6">
                                      <Droplet className="w-6 h-6 text-ember flex-shrink-0 mt-1" />
                                      <div className="text-left">
                                          <p className="font-satoshi font-black uppercase italic mb-1">Puntos de Hidratación</p>
                                          <p className="text-white/70 text-sm font-satoshi">
                                              Contamos con puntos de hidratación estratégicos durante todo el recorrido.
                                          </p>
                                      </div>
                                  </div>
                                  {details.route.stravaLinks && details.route.stravaLinks.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-6 h-6 text-ember flex-shrink-0 mt-1" />
                                        <div className="text-left">
                                            <p className="font-satoshi font-black uppercase italic mb-1">Mapa Interactivo</p>
                                            <div className="flex flex-col gap-1 text-left">
                                                 {details.route.stravaLinks.map((link, i) => {
                                                     const routeId = getStravaRouteId(link.url);
                                                     const hrefUrl = routeId ? `https://www.strava.com/routes/${routeId}` : link.url;
                                                     return (
                                                         <a 
                                                             key={i}
                                                             href={hrefUrl} 
                                                             className="text-ember hover:text-white underline font-mono text-sm text-left transition-colors"
                                                             target="_blank"
                                                             rel="noopener noreferrer"
                                                         >
                                                             {link.label} →
                                                         </a>
                                                     );
                                                 })}
                                            </div>
                                        </div>
                                    </div>
                                  )}
                              </div>
                              
                              {(stravaRouteId || details.route.image) && (
                                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg rounded-none p-4 w-full">
                                      {stravaRouteId ? (
                                          <StravaRouteEmbed routeId={stravaRouteId} />
                                      ) : (
                                          <Image
                                              src={details.route.image}
                                              alt="Mapa de la ruta"
                                              width={800}
                                              height={600}
                                              className="w-full h-auto rounded-none object-contain"
                                          />
                                      )}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
                )}

                {/* --- CATEGORIES & AWARDS SECTION --- */}
                <div className="py-20">
                    <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto">
                        
                        {/* Categories */}
                        {details.categories && (
                          <div id="categorias" className="flex-1">
                              <SplitText
                                  text="CATEGORÍAS"
                                  className="text-4xl md:text-6xl font-satoshi font-black mb-8 py-4 text-left italic uppercase tracking-tighter"
                                  delay={50}
                                  from={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                                  to={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                                  ease="bounce.out"
                                  splitType="chars"
                                  tag="h2"
                              />
                              <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg rounded-none p-8 h-full flex flex-col">
                                  <p className="text-lg mb-6 text-left font-satoshi">
                                      ¡Hay un lugar para todos! Participa en:
                                  </p>
                                  <ul className="text-xl space-y-4 flex-1 text-left">
                                      {details.categories.map((cat, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <span className="text-ember font-satoshi font-black italic uppercase">{cat.name}</span>
                                            <span className="font-mono text-sm text-white/60">({cat.range})</span>
                                        </li>
                                      ))}
                                  </ul>
                              </div>
                          </div>
                        )}

                        {/* Awards */}
                        {details.awards && (
                          <div id="premiacion" className="flex-1">
                              <SplitText
                                  text="PREMIACIÓN"
                                  className="text-4xl md:text-6xl font-satoshi font-black mb-8 py-4 text-left italic uppercase tracking-tighter"
                                  delay={50}
                                  from={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                                  to={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                                  ease="bounce.out"
                                  splitType="chars"
                                  tag="h2"
                              />
                              <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg rounded-none p-8 h-full flex flex-col">
                                  <div className="flex items-start gap-4">
                                      <Trophy className="w-8 h-8 text-ember flex-shrink-0 mt-1" />
                                      <div className="flex flex-col w-full text-left">
                                          <h3 className="text-2xl font-satoshi font-black italic uppercase mb-4">
                                              ¡Premios en Efectivo! 🏆
                                          </h3>
                                          <div className="space-y-4 flex-1">
                                              {details.awards.absolutes?.map((award, i) => (
                                                <div key={i} className="bg-white/5 rounded-none p-4 border border-white/5">
                                                    <p className="text-ember font-satoshi font-black italic text-xl mb-2 uppercase">
                                                        {award.title}
                                                    </p>
                                                    <p className="text-lg font-mono">
                                                        {award.amount}
                                                    </p>
                                                </div>
                                              ))}
                                              {details.awards.byCategory && (
                                                <div className="bg-white/5 rounded-none p-4 border border-white/5">
                                                    <p className="text-ember font-satoshi font-black italic text-xl mb-3 uppercase">
                                                        Por Categoría
                                                    </p>
                                                    <ul className="space-y-2 font-satoshi">
                                                        {details.awards.byCategory.map((award, i) => (
                                                          <li key={i} className="flex items-center gap-2">
                                                              <Medal className="w-5 h-5 text-ember" />
                                                              <span><strong className="uppercase italic">{award.label}:</strong> {award.amount}</span>
                                                          </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                        )}
                    </div>
                </div>

                {/* --- KIT SECTION --- */}
                {details.kit && (
                  <div id="kit" className="pt-20">
                      <div className="max-w-6xl mx-auto">
                          <SplitText
                              text="NUESTRO KIT"
                              className="text-4xl md:text-6xl font-satoshi font-black mb-12 py-4 text-left italic uppercase tracking-tighter"
                              delay={50}
                              from={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                              to={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                              ease="bounce.out"
                              splitType="chars"
                              tag="h2"
                          />
                          <div className="w-full flex flex-col sm:flex-row bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg mb-4 rounded-none overflow-hidden">
                              <div className="p-8 flex-1 text-left">
                                  <p className="text-lg mb-6 font-satoshi">
                                      Tu kit incluye:
                                  </p>
                                  <ul className="space-y-4">
                                      {details.kit.items.map((item, index) => (
                                          <li key={index} className="flex items-center gap-4 text-lg font-satoshi">
                                              <div className="p-2 bg-ember/10 rounded-none border border-ember/20">
                                                  <Shirt className="w-6 h-6 text-ember" />
                                              </div>
                                              <span className="uppercase font-bold italic">{item}</span>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                              <div className="relative w-full sm:w-1/2 min-h-[400px]">
                                  <Image 
                                      src={details.kit.image} 
                                      alt="Kit" 
                                      fill 
                                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                  />  
                              </div>
                          </div>
                      </div>
                  </div>
                )}
            </div>
        </section>
    );
}

