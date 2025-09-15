"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Smile, MessageCircleMore} from "lucide-react"

export function Contact() 
{
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
  })

  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => 
	{
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

  // button form : send email  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const				phoneNumber = "244930661441"
  const				text = `ola meu nome é ${formData.name}. Assunto: ${formData.subject}. Mensagem: ${formData.message}`;
  const				whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

  window.open(whatsappURL, "_blank");
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section ref={sectionRef} id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Entre em <span className="text-primary">Contato</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Vamos conversar sobre seu próximo projeto? Estou sempre aberto a novas oportunidades
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
			{/* Contact Info */}
			<div className="space-y-8">
				<div>
					<h3 className="text-2xl font-bold mb-6">Vamos trabalhar juntos!</h3>
					<p className="text-muted-foreground mb-8 text-pretty">
					Estou disponível para projetos freelance, oportunidades de trabalho em tempo integral ou apenas para
					uma conversa sobre tecnologia. Entre em contato!
					</p>
				</div>

				<div className="space-y-6">
					<div className="flex items-center space-x-4">
					<div className="p-3 bg-primary/10 rounded-full">
						<Mail className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h4 className="font-semibold">Email</h4>
						<p className="text-muted-foreground">lemos.trabalho.7@gmail.com</p>
					</div>
					</div>

					<div className="flex items-center space-x-4">
					<div className="p-3 bg-primary/10 rounded-full">
						<Phone className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h4 className="font-semibold">Telefone</h4>
						<p className="text-muted-foreground"> <span className ="text-primary">Unitel: </span>+244 930 661 441</p>
						<p className="text-muted-foreground"> <span className ="text-primary">Africel: </span>+244 955 097 637</p>
					</div>
					</div>

					<div className="flex items-center space-x-4">
					<div className="p-3 bg-primary/10 rounded-full">
						<MapPin className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h4 className="font-semibold">Localização</h4>
						<p className="text-muted-foreground">Talatona, Luanda</p>
					</div>
					</div>
				</div>

				{/* Availability */}
				<Card className="border-accent/20 bg-accent/5">
					<CardContent className="p-6">
					<div className="flex items-center space-x-3 mb-3">
						<div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
						<h4 className="font-semibold text-accent">Disponível para novos projetos / ONLINE</h4>
					</div>
					<p className="text-sm text-muted-foreground">
						Atualmente aceitando projetos Desafiador . Tempo de resposta: 24h
					</p>
					</CardContent>
				</Card>
			</div>

			{/* Contact Form */}
			<Card className="border-primary/20">
				<CardHeader>
					<CardTitle>Envie uma mensagem</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<div>
							<label htmlFor="name" className="block text-sm font-medium mb-2">
							Nome *
							</label>
							<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Seu nome"
							required
							className="border-primary/20 focus:border-primary"
							/>
						</div>
					</div>

					<div>
						<label htmlFor="subject" className="block text-sm font-medium mb-2">
							Assunto *
						</label>
						<Input
							id="subject"
							name="subject"
							value={formData.subject}
							onChange={handleChange}
							placeholder="Assunto da mensagem"
							required
							className="border-primary/20 focus:border-primary"
						/>
					</div>

					<div>
						<label htmlFor="message" className="block text-sm font-medium mb-2">
							Mensagem *
						</label>
						<Textarea
							id="message"
							name="message"
							value={formData.message}
							onChange={handleChange}
							placeholder="Conte-me sobre seu projeto..."
							rows={5}
							required
							className="border-primary/20 focus:border-primary resize-none"
						/>
					</div>

					<Button type="submit"  className="w-full bg-primary hover:bg-primary/90 cursor-pointer">
						<MessageCircleMore className ="h-5 w-5 mr-2"/>
						Entrar em contacto (Watsapp)
					</Button>
					</form>
				</CardContent>
			</Card>
			</div>
		</div>
	</div>
	</section>
)
}
