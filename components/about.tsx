"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, GraduationCap, Users } from "lucide-react"

export function About() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Sobre <span className="text-primary">Mim</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Conheça um pouco mais sobre minha jornada e paixão pelo desenvolvimento
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative z-10 code-block p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground ml-2 font-mono">about-me.js</span>
                </div>
                <div className="font-mono text-sm space-y-2">
                  <div>
                    <span className="text-blue-500">const</span> <span className="text-yellow-500">developer</span> ={" "}
                    {`{`}
                  </div>
                  <div className="ml-4">
                    <span className="text-green-500">name</span>:{" "}
                    <span className="text-orange-500">"João Lemos Pereira"</span>,
                  </div>
                  <div className="ml-4">
                    <span className="text-green-500">Localização</span>:{" "}
                    <span className="text-orange-500">"Luanda, Angola"</span>,
                  </div>
                  <div className="ml-4">
                    <span className="text-green-500">Formação</span>:{" "}
                    <span className="text-orange-500">"Finalista em Eng Informática | Universidade Óscar Ribas"</span>,
                  </div>
                  <div className="ml-4">
                    <span className="text-green-500">Educação</span>:{" "}
                    <span className="text-orange-500">"42Luanda | Engenharia de Softwar"</span>,
                  </div>
                  <div className="ml-4">
                    <span className="text-green-500">paixão</span>:{" "}
                    <span className="text-orange-500">"Criar soluções inovadoras"</span>
                  </div>
                  <div>{`}`}</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-primary/10 rounded-lg -z-10"></div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">Desenvolvedor Full Stack Apaixonado</h3>
                <p className="text-muted-foreground mb-4 text-pretty">
                  <span className="text-primary font-semibold">João Lemos Pereira</span> programador especializado em{" "}
                  <span className="text-primary font-semibold">React, Next.js e TailwindCSS</span>, com experiência
                  sólida em desenvolvimento backend utilizando{" "}
                  <span className="text-primary font-semibold">Node.js, Java, Python, C e C++</span>, além de integração
                  com <span className="text-primary font-semibold">MySQL e PostgreSQL</span>.
                </p>
                <p className="text-muted-foreground mb-6 text-pretty">
                  Tenho domínio no ciclo completo de desenvolvimento, desde a construção de interfaces modernas e
                  responsivas até a modelagem e manutenção de bases de dados e APIs robustas. Além das habilidades
                  técnicas, possuo experiência em trabalho em equipe e desenvolvimento em comunidade.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Formação</p>
                      <p className="text-sm text-muted-foreground">Informática</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Localização</p>
                      <p className="text-sm text-muted-foreground">Luanda, Angola</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Escola</p>
                      <p className="text-sm text-muted-foreground">42 Luanda</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Comunidade</p>
                      <p className="text-sm text-muted-foreground">Open Source</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Áreas de Interesse</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Algoritmos",
                    "Sistemas",
                    "APIs REST",
                    "Escalabilidade",
                    "Qualidade de Código",
                    "Metodologias Ágeis",
                  ].map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
