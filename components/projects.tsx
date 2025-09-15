"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, Eye } from "lucide-react"

export function Projects() {
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

  const projects = [
    {
      title: "Biblioteca Digital",
      description:
        "Biblioteca digital Para Universidade Óscar Ribas.",
      image: "/libDigital.png",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
      liveUrl: "#",
      githubUrl: "#",
      featured: true,
    },
    {
      title: "App de Gestão de Tarefas",
      description:
        "Aplicação para gerenciamento de tarefas com drag & drop, colaboração em equipe e notificações em tempo real.",
      image: "/task-management-app.png",
      technologies: ["React", "Node.js", "Socket.io", "MongoDB"],
      liveUrl: "#",
      githubUrl: "#",
      featured: true,
    },
    {
      title: "Landing Page SaaS",
      description:
        "Landing page moderna e responsiva para startup de SaaS com animações suaves e otimizada para conversão.",
      image: "/modern-saas-landing-page.jpg",
      technologies: ["Next.js", "Framer Motion", "Tailwind CSS"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false,
    },
    {
      title: "Sistema de Blog",
      description: "CMS personalizado para blog com editor rich text, sistema de comentários e otimização SEO.",
      image: "/blog-cms-interface.jpg",
      technologies: ["Next.js", "MDX", "Tailwind CSS", "Vercel"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false,
    },
    {
      title: "App de Fitness",
      description:
        "Aplicação para acompanhamento de exercícios com gráficos de progresso e planos de treino personalizados.",
      image: "/fitness-tracking-app.png",
      technologies: ["React Native", "TypeScript", "Expo", "Supabase"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false,
    },
    {
      title: "Plataforma de Cursos",
      description: "Plataforma educacional com sistema de vídeo aulas, progresso do aluno e certificados digitais.",
      image: "/online-learning-platform.png",
      technologies: ["Next.js", "Stripe", "Prisma", "AWS S3"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false,
    },
  ]

  return (
    <section ref={sectionRef} id="projects" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Meus <span className="text-primary">Projetos</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Alguns dos projetos que desenvolvi recentemente
            </p>
          </div>

          {/* Featured Projects */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center">Projetos Recente</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {projects
                .filter((project) => project.featured)
                .map((project, index) => (
                  <Card
                    key={project.title}
                    className="group border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                        <Button size="sm" variant="secondary" asChild>
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Demo
                          </a>
                        </Button>
                        <Button size="sm" variant="secondary" asChild>
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            Código
                          </a>
                        </Button>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {project.title}
                        <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 text-pretty">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="project-badge-high-contrast">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

                    <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              Ver Todos os Projetos no GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
