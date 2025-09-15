"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Code2, Server, Database, Wrench } from "lucide-react"

export function Skills() {
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

  const skillCategories = [
    {
      title: "Frontend",
      icon: Code2,
      skills: [
        { name: "React.js", level: 95 },
        { name: "Next.js", level: 90 },
        { name: "JavaScript (ES6+)", level: 95 },
        { name: "TailwindCSS", level: 92 },
      ],
    },
    {
      title: "Backend",
      icon: Server,
      skills: [
        { name: "Node.js", level: 85 },
        { name: "Java", level: 80 },
        { name: "Python", level: 85 },
        { name: "C/C++", level: 75 },
      ],
    },
    {
      title: "Banco de Dados",
      icon: Database,
      skills: [
        { name: "MySQL", level: 88 },
        { name: "PostgreSQL", level: 85 },
        { name: "APIs REST", level: 90 },
        { name: "Integração de Serviços", level: 80 },
      ],
    },
    {
      title: "Ferramentas",
      icon: Wrench,
      skills: [
        { name: "Git & GitHub", level: 95 },
        { name: "Deploy de Aplicações", level: 85 },
        { name: "Scrum/Kanban", level: 80 },
        { name: "Pair Programming", level: 90 },
      ],
    },
  ]

  const technologies = [
    "React.js",
    "Next.js",
    "JavaScript",
    "HTML5",
    "CSS3",
    "TailwindCSS",
    "Node.js",
    "Java",
    "Python",
    "C",
    "C++",
    "MySQL",
    "PostgreSQL",
    "Git",
    "GitHub",
    "APIs REST",
    "UI/UX",
    "Acessibilidade",
    "Deploy",
    "Scrum",
    "Kanban",
  ]

  return (
    <section ref={sectionRef} id="skills" className="py-20">
      <div className="container mx-auto px-4">
        <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Minhas <span className="text-primary">Habilidades</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Tecnologias e ferramentas que domino para criar soluções completas
            </p>
          </div>

          {/* Skill Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {skillCategories.map((category, index) => (
              <Card
                key={category.title}
                className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-muted-foreground font-mono">{skill.level}%</span>
                      </div>
                      <Progress
                        value={isVisible ? skill.level : 0}
                        className="h-2"
                        style={{
                          transition: `all 1s ease-in-out ${index * 0.2}s`,
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Technologies */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-8">Stack Tecnológico</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {technologies.map((tech, index) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105 text-sm py-2 px-4 border border-primary/20 hover:border-primary font-mono"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
