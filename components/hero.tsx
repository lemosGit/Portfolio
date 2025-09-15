"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Github, Linkedin, Mail, Code } from "lucide-react"
import Image from "next/image"

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [typedText, setTypedText] = useState("")
  const fullText = "Desenvolvedor Full Stack"

  useEffect(() => {
    setIsVisible(true)

    // Typing animation
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

  return (
    <section id="home" className="py-24 min-h-screen flex items-center justify-center relative overflow-hidden tech-grid">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>

      {/* Floating tech elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-16 h-16 border border-primary/20 rounded-lg rotate-45 animate-float"></div>
        <div
          className="absolute top-40 right-20 w-12 h-12 border border-accent/20 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-20 h-20 border border-primary/20 rounded-lg animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-14 h-14 border border-accent/20 rounded-full animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="mb-8">
            <div className="w-40 h-40 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full animate-glow"></div>
              <div className="absolute inset-2 bg-background rounded-full overflow-hidden">
                <Image
                  src="/lemos.png"
                  alt="Foto do desenvolvedor"
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg text-muted-foreground mb-2 font-mono">Olá, eu sou</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                João Lemos Pereira
              </span>
            </h1>
            <div className="text-2xl md:text-3xl font-mono text-primary mb-6 h-12 flex items-center justify-center">
              <Code className="w-6 h-6 mr-2" />
              <span className="typing-effect">{typedText}</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Especializado em <span className="text-primary font-semibold">React, Next.js, Node.js, Java, Python</span> e
            tecnologias modernas. Estudante finalista de Informática e cursando Engenharia de Software na{" "}
            <span className="text-primary font-semibold">Escola 42 Luanda</span>.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8 text-sm">
            {["React", "Next.js", "Node.js", "Java", "Python", "MySQL", "PostgreSQL"].map((tech) => (
              <span
                key={tech}
                className="badge-high-contrast px-3 py-1 rounded-full font-mono transition-all duration-300 hover:scale-105"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300"
              onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver Projetos
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent shadow-lg hover:shadow-primary/25 transition-all duration-300"
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Entre em Contato
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-12">
            <a
              href="#"
              className="p-3 rounded-full bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-card border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
            >
              <Mail className="h-6 w-6" />
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <ArrowDown className="h-6 w-6 mx-auto text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  )
}
