import { Card, CardContent, Button, AnimatedContent, Badge } from "@/components/ui";
import { Route, Map } from "lucide-react";
import type { EventData, Distance } from "./types";
import { StravaRouteEmbed } from "./StravaRouteEmbed";

interface DistancesSectionProps {
  event?: EventData;
  description?: string;
  distances?: Distance[];
  maleDistances?: Distance[];
  femaleDistances?: Distance[];
  routeMapUrl?: string;
  routeDescription?: string;
  stravaUrl?: string;
  logoUrl?: string;
  organization?: {
    name: string;
    logo_url?: string;
  };
}

export const DistancesSection = ({ 
  event,
  description, 
  distances, 
  maleDistances,
  femaleDistances,
  routeMapUrl, 
  routeDescription,
  stravaUrl, 
  logoUrl,
  organization
}: DistancesSectionProps) => {
  const eventLogo = logoUrl || organization?.logo_url;
  
  // Extract route ID from numeric string or full Strava route URL
  const extractStravaRouteId = (input?: string) => {
    if (!input) return null;
    const trimmed = input.trim();
    if (/^\d+$/.test(trimmed)) {
      return trimmed;
    }
    const match = trimmed.match(/\/routes\/(\d+)/);
    return match ? match[1] : null;
  };

  const stravaRouteId = extractStravaRouteId(stravaUrl);
  const stravaLinkUrl = stravaRouteId 
    ? `https://www.strava.com/routes/${stravaRouteId}` 
    : (stravaUrl && stravaUrl.trim().startsWith('http') ? stravaUrl.trim() : null);

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Event Logo Watermark - Absolute positioned top-left, covering half component area */}
      {eventLogo && (
        <div className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none opacity-[0.04] select-none z-0">
          <img 
            src={eventLogo} 
            alt="" 
            className="w-full h-full object-contain object-left-top filter grayscale"
          />
        </div>
      )}

      {/* Detalles */}
      <section id="detalles" className="relative z-10 py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <AnimatedContent>
            {organization?.name && (
              <div className="mb-6 flex flex-col items-center gap-4">
                {organization.logo_url && (
                  <img 
                    src={organization.logo_url} 
                    alt={organization.name} 
                    className="h-40 w-auto object-contain "
                  />
                )}
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">
                  Organizado por <span className="text-ember">{organization.name}</span>
                </span>
              </div>
            )}
            <h2 className="font-satoshi font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground mb-12 text-center italic uppercase tracking-tighter">
              {event?.name}
            </h2>
          </AnimatedContent>

          <AnimatedContent delay={0.2}>
            {description ? (
              <div 
                className="text-muted-foreground font-satoshi text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-center mb-16 leading-relaxed [&_p]:mb-4 last:[&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-muted-foreground font-satoshi text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-center mb-16 italic">
                Descripción del evento pendiente por configurar.
              </p>
            )}
          </AnimatedContent>

          {/* Contenedor de Columnas de Género */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-16 mb-20">
            {/* Columna Masculina */}
            {maleDistances && maleDistances.length > 0 && (
              <div>
                <h3 className="font-satoshi font-black text-2xl text-ember mb-8 text-center lg:text-left italic uppercase tracking-[0.2em] flex items-center justify-center lg:justify-start gap-4">
                  <span className="w-8 h-px bg-ember/30 hidden lg:block" />
                  Masculino
                </h3>
                <div className="space-y-2">
                  {maleDistances.map((d, idx) => (
                    <AnimatedContent key={d.id} delay={0.1 + idx * 0.05} distance={10}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-border/40 hover:border-ember/40 bg-card/30 backdrop-blur-sm transition-all group relative overflow-hidden h-full">
                        <div className="absolute inset-y-0 left-0 w-1 bg-ember/0 group-hover:bg-ember transition-all" />
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 flex items-center justify-center bg-background border border-border group-hover:border-ember/30 transition-colors">
                            <Route className="w-6 h-6 text-ember/60 group-hover:text-ember transition-all" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-satoshi font-black text-xl text-foreground uppercase italic tracking-tight">{d.name}</h4>
                              <Badge variant="outline" className="text-[10px] py-0 px-2 border-ember/30 text-ember bg-ember/5 rounded-none font-mono font-bold uppercase">
                                MASC
                              </Badge>
                            </div>
                            <p className="text-xs text-ember font-mono uppercase tracking-widest mt-0.5">{d.label}</p>
                          </div>
                        </div>
                        {d.description && (
                          <p className="text-sm text-muted-foreground font-satoshi mt-3 sm:mt-0 sm:max-w-[150px] sm:text-right italic leading-relaxed">
                            {d.description}
                          </p>
                        )}
                      </div>
                    </AnimatedContent>
                  ))}
                </div>
              </div>
            )}

            {/* Columna Femenina */}
            {femaleDistances && femaleDistances.length > 0 && (
              <div className="container">
                <h3 className="font-satoshi font-black text-2xl text-ember mb-8 text-center lg:text-left italic uppercase tracking-[0.2em] flex items-center justify-center lg:justify-start gap-4">
                  <span className="w-8 h-px bg-ember/30 hidden lg:block" />
                  Femenino
                </h3>
                <div className="space-y-2">
                  {femaleDistances.map((d, idx) => (
                    <AnimatedContent key={d.id} delay={0.1 + idx * 0.05} distance={10}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-border/40 hover:border-ember/40 bg-card/30 backdrop-blur-sm transition-all group relative overflow-hidden h-full">
                        <div className="absolute inset-y-0 left-0 w-1 bg-ember/0 group-hover:bg-ember transition-all" />
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 flex items-center justify-center bg-background border border-border group-hover:border-ember/30 transition-colors">
                            <Route className="w-6 h-6 text-ember/60 group-hover:text-ember transition-all" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-satoshi font-black text-xl text-foreground uppercase italic tracking-tight">{d.name}</h4>
                              <Badge variant="outline" className="text-[10px] py-0 px-2 border-ember/30 text-ember bg-ember/5 rounded-none font-mono font-bold uppercase">
                                FEM
                              </Badge>
                            </div>
                            <p className="text-xs text-ember font-mono uppercase tracking-widest mt-0.5">{d.label}</p>
                          </div>
                        </div>
                        {d.description && (
                          <p className="text-sm text-muted-foreground font-satoshi mt-3 sm:mt-0 sm:max-w-[150px] sm:text-right italic leading-relaxed">
                            {d.description}
                          </p>
                        )}
                      </div>
                    </AnimatedContent>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Categorías Generales (Fallback / Mixtas) */}
          {/* {distances && distances.length > 0 && (
            <div className="mb-20 last:mb-0">
              {((femaleDistances && femaleDistances.length > 0) || (maleDistances && maleDistances.length > 0)) && (
                <h3 className="font-satoshi font-black text-2xl text-ember mb-10 text-center italic uppercase tracking-[0.2em]">
                  — General —
                </h3>
              )}
              <div className="max-w-4xl mx-auto space-y-2">
                {distances.map((d, idx) => (
                  <AnimatedContent key={d.id} delay={0.1 + idx * 0.05} distance={10}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-border/40 hover:border-ember/40 bg-card/30 backdrop-blur-sm transition-all group relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-1 bg-ember/0 group-hover:bg-ember transition-all" />
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 flex items-center justify-center bg-background border border-border group-hover:border-ember/30 transition-colors">
                          <Route className="w-6 h-6 text-ember/60 group-hover:text-ember transition-all" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-satoshi font-black text-xl text-foreground uppercase italic tracking-tight">{d.name}</h4>
                            <Badge variant="outline" className="text-[10px] py-0 px-2 border-ember/30 text-ember bg-ember/5 rounded-none font-mono font-bold uppercase">
                              MIX
                            </Badge>
                          </div>
                          <p className="text-xs text-ember font-mono uppercase tracking-widest mt-0.5">{d.label}</p>
                        </div>
                      </div>
                      {d.description && (
                        <p className="text-xs text-muted-foreground font-satoshi mt-3 sm:mt-0 sm:max-w-[250px] sm:text-right italic">
                          {d.description}
                        </p>
                      )}
                    </div>
                  </AnimatedContent>
                ))}
              </div>
            </div>
          )} */}

          {(!femaleDistances || femaleDistances.length === 0) && 
           (!maleDistances || maleDistances.length === 0) && 
           (!distances || distances.length === 0) && (
            <div className="text-center py-12">
              <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-satoshi">
                Las distancias serán configuradas por el organizador.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Ruta */}
      <section id="ruta" className="relative z-10 py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <AnimatedContent>
            <h2 className="font-satoshi font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground mb-12 text-center italic uppercase tracking-tighter">
              La Ruta
            </h2>
          </AnimatedContent>

          {routeDescription && (
            <AnimatedContent delay={0.1} distance={20}>
              <div 
                className="text-muted-foreground font-satoshi text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-center mb-12 leading-relaxed [&_p]:mb-4 last:[&_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: routeDescription }}
              />
            </AnimatedContent>
          )}

          <div className="max-w-4xl mx-auto">
            <AnimatedContent delay={0.2} distance={50}>
              {stravaRouteId ? (
                <StravaRouteEmbed routeId={stravaRouteId} />
              ) : routeMapUrl ? (
                <img src={routeMapUrl} alt="Mapa de la ruta" className="w-full rounded-none border border-border" />
              ) : (
                <div className="aspect-video bg-secondary rounded-none border border-border flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-satoshi">
                      Mapa de la ruta pendiente por cargar.
                    </p>
                  </div>
                </div>
              )}
            </AnimatedContent>

            {stravaLinkUrl && (
              <AnimatedContent delay={0.4} distance={20}>
                <div className="mt-6 text-center">
                  <Button
                    variant="mechanical-outline"
                    asChild
                    className="border-ember text-ember hover:bg-ember hover:text-white transition-all bg-transparent"
                    style={{ boxShadow: '4px 4px 0px 0px hsl(14 78% 57%)' }}
                  >
                    <a href={stravaLinkUrl} target="_blank" rel="noopener noreferrer">
                      Ver en Strava
                    </a>
                  </Button>
                </div>
              </AnimatedContent>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};

