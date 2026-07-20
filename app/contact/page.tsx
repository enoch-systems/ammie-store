"use client"

import { useState } from "react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { Phone, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24-48 hours.",
      })
      setFormData({ message: "" })
      setIsSubmitting(false)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Get In Touch
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question or need assistance? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-16">
            {/* Contact Form */}
            <div>
              <div className="bg-card rounded-3xl p-8 md:p-10 boty-shadow">
                <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-2">
                  Send us a message
                </h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we'll get back to you shortly.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent boty-transition resize-none"
                      placeholder="Tell us more about your inquiry..."
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 boty-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-10 md:p-14 text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
              We'd love to hear from you
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Whether you have a question about our products, need help with an order, or want to provide feedback, our team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+2341234567890"
                className="inline-flex items-center justify-center gap-2 bg-background text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-background/80 boty-shadow border border-border"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}