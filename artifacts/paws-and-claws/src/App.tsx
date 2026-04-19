import React from "react";
import { Switch, Route, Link } from "wouter";
import { Phone, MapPin, Clock, Star, Heart, CheckCircle2, Scissors, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingPage from "./pages/BookingPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function BoneDecor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="24" stroke="currentColor" strokeWidth="7" />
      <circle cx="90" cy="30" r="24" stroke="currentColor" strokeWidth="7" />
      <circle cx="30" cy="170" r="24" stroke="currentColor" strokeWidth="7" />
      <circle cx="90" cy="170" r="24" stroke="currentColor" strokeWidth="7" />
      <rect x="10" y="48" width="100" height="104" rx="14" stroke="currentColor" strokeWidth="7" />
    </svg>
  );
}

function PawDecor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="62" rx="28" ry="24" stroke="currentColor" strokeWidth="6" />
      <ellipse cx="22" cy="36" rx="11" ry="14" stroke="currentColor" strokeWidth="6" />
      <ellipse cx="44" cy="28" rx="10" ry="13" stroke="currentColor" strokeWidth="6" />
      <ellipse cx="66" cy="28" rx="10" ry="13" stroke="currentColor" strokeWidth="6" />
      <ellipse cx="78" cy="36" rx="11" ry="14" stroke="currentColor" strokeWidth="6" />
    </svg>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary fill-primary/30" />
            </div>
            <div>
              <span className="text-lg font-black leading-none" style={{ fontFamily: "'Nunito', sans-serif" }}>Paws and Claws</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">Grooming & Boarding · Jacksonville</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a href="#services" className="text-foreground/70 hover:text-primary transition-colors">Services</a>
            <a href="#reviews" className="text-foreground/70 hover:text-primary transition-colors">Reviews</a>
            <a href="#about" className="text-foreground/70 hover:text-primary transition-colors">About</a>
            <a href="#contact" className="text-foreground/70 hover:text-primary transition-colors">Contact</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold shadow-sm hidden sm:flex">
              <a href="tel:+19048549000" className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Call Now
              </a>
            </Button>
            <Button asChild size="sm" className="rounded-full font-bold shadow-sm" style={{ background: "hsl(276 60% 63%)", color: "white" }}>
              <Link href="/book">Book Appointment</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-12 md:pt-24 md:pb-16 text-center px-4">
        {/* Decorative shapes */}
        <BoneDecor className="absolute left-4 top-8 w-16 h-24 text-primary/20 hidden md:block" />
        <PawDecor className="absolute right-4 top-16 w-20 h-20 text-secondary/20 hidden md:block" />
        <BoneDecor className="absolute right-24 bottom-0 w-12 h-18 text-primary/15 hidden lg:block rotate-45" />
        <PawDecor className="absolute left-24 bottom-4 w-14 h-14 text-secondary/15 hidden lg:block" />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-5">
            Pet Grooming &amp; Boarding · Jacksonville, FL
          </div>

          <h1
            className="text-5xl md:text-7xl font-black leading-[1.05] text-foreground mb-6"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Jacksonville Grooming<br />
            <span className="text-primary">with Love</span> and<br />
            <span className="text-secondary">Expertise</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            At Paws and Claws, we treat every pet like family. Warm, trustworthy, and personal — your neighborhood grooming and boarding spot on Blanding Blvd.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full text-base px-8 h-12 font-bold shadow-md hover-elevate bg-primary hover:bg-primary/90 text-white">
              <a href="tel:+19048549000" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </Button>
            <Button asChild size="lg" className="rounded-full text-base px-8 h-12 font-bold shadow-md hover-elevate text-white" style={{ background: "hsl(276 60% 63%)" }}>
              <Link href="/book">Schedule Appointment</Link>
            </Button>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-1.5 mt-8 text-muted-foreground text-sm">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="font-semibold text-foreground">4.8 / 5</span>
            <span>·</span>
            <span>Rated on Yelp, DogPack &amp; Yahoo</span>
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-0 overflow-hidden h-56 sm:h-72">
        <div className="overflow-hidden">
          <img src="/hero.png" alt="Pet at Paws and Claws" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="overflow-hidden hidden sm:block">
          <img src="/bath.png" alt="Dog getting a bath" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="overflow-hidden hidden sm:block">
          <img src="/cat.png" alt="Cat getting groomed" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>What We Offer</h2>
            <p className="text-lg text-muted-foreground">From a simple bath to specialized skin care and overnight boarding — we have everything your pet needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Scissors className="w-8 h-8" />,
                color: "bg-primary/10 text-primary",
                title: "Pet Grooming",
                desc: "Full-service grooming for both dogs and cats. We take great care with even the most nervous pets.",
                items: ["Baths & trims", "Coat care & brush-outs"],
              },
              {
                icon: <Bath className="w-8 h-8" />,
                color: "bg-secondary/10 text-secondary",
                title: "Skin & Nail Care",
                desc: "Expert handling of delicate skin issues with specialized treatments for pets needing extra soothing care.",
                items: ["Skin care treatments", "Gentle nail clipping"],
              },
              {
                icon: <Heart className="w-8 h-8" />,
                color: "bg-yellow-100 text-yellow-600",
                title: "Pet Boarding",
                desc: "A safe, comfortable, and loving environment for your pets when you're away. Treated like family.",
                items: ["Safe environment", "Loving attention"],
              },
            ].map((svc) => (
              <div key={svc.title} className="bg-card rounded-3xl p-8 border border-border shadow-sm hover-elevate">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${svc.color}`}>
                  {svc.icon}
                </div>
                <h3 className="text-xl font-black mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>{svc.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{svc.desc}</p>
                <ul className="space-y-2">
                  {svc.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg" className="rounded-full font-bold px-8 bg-primary text-white hover:bg-primary/90 hover-elevate">
              <Link href="/book">Book a Service</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20" style={{ background: "hsl(40 40% 94%)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Loved by Jacksonville Pets</h2>
            <p className="text-lg text-muted-foreground">Here's what local pet parents are saying.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "They're great with your pets and treat everyone like their family. Not cheap. Get what you pay for.",
                name: "Gregg G.",
                source: "Yelp · November 2024",
                initial: "G",
                color: "bg-primary/20 text-primary",
              },
              {
                quote: "They do a great job bathing and cutting my babies.",
                name: "Jessica S.",
                source: "DogPack · December 2024",
                initial: "J",
                color: "bg-secondary/20 text-secondary",
              },
              {
                quote: "Friendly people, great prices, take great care with my spicy kitty for nail trims and occasional brush outs.",
                name: "Verified Reviewer",
                source: "Yahoo Local",
                initial: "Y",
                color: "bg-yellow-100 text-yellow-600",
              },
            ].map((r) => (
              <div key={r.name} className="bg-card rounded-3xl p-8 border border-border shadow-sm">
                <div className="flex gap-0.5 mb-5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-foreground text-base font-semibold italic mb-6 leading-relaxed">"{r.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${r.color}`}>{r.initial}</div>
                  <div>
                    <p className="font-bold text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.source}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="grid grid-cols-2 h-72 md:h-auto">
                <img src="/bath.png" alt="Dog getting a bath" className="w-full h-full object-cover" />
                <img src="/cat.png" alt="Cat getting groomed" className="w-full h-full object-cover" />
              </div>
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>Why Choose Paws and Claws?</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  We aren't a corporate chain or a clinical facility. We're your local, personable pet lovers right here in Jacksonville. We know dropping your pet off can be stressful — which is why we've built a calm, approachable environment.
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Whether your pet needs a quick nail trim, specialized skin care, or a weekend stay, our staff handles every animal with patience and expert care.
                </p>
                <div className="flex gap-3">
                  <Button asChild size="sm" className="rounded-full font-bold bg-primary text-white hover:bg-primary/90 hover-elevate">
                    <a href="tel:+19048549000">Call (904) 854-9000</a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full font-bold hover-elevate">
                    <Link href="/book">Book Online</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20" style={{ background: "hsl(40 40% 94%)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>Visit Us Today</h2>
            <p className="text-muted-foreground text-lg">We'd love to meet your furry family member.</p>
          </div>

          <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
            <div className="grid lg:grid-cols-2">
              <div className="p-10 md:p-14">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>Address</h4>
                      <p className="text-muted-foreground">3846 Blanding Blvd<br />Jacksonville, FL 32210</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>Phone</h4>
                      <a href="tel:+19048549000" className="text-xl font-black text-primary hover:underline">(904) 854-9000</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>Hours</h4>
                      <ul className="text-muted-foreground space-y-1 text-sm">
                        <li className="flex justify-between gap-8"><span>Monday</span><span>Closed</span></li>
                        <li className="flex justify-between gap-8 font-semibold text-foreground"><span>Tue – Fri</span><span>8:00 AM – 3:00 PM</span></li>
                        <li className="flex justify-between gap-8 font-semibold text-foreground"><span>Saturday</span><span>8:00 AM – 3:00 PM</span></li>
                        <li className="flex justify-between gap-8"><span>Sunday</span><span>Closed</span></li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button asChild size="sm" className="rounded-full font-bold bg-primary text-white hover:bg-primary/90 hover-elevate">
                      <Link href="/book">Book Online</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="rounded-full font-bold hover-elevate">
                      <a href="tel:+19048549000">Call Now</a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="h-80 lg:h-auto min-h-[350px] relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.6983057121626!2d-81.74558502360212!3d30.27419137480749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e5b8e906b3a0dd%3A0xcf950ddcc7cde529!2s3846%20Blanding%20Blvd%2C%20Jacksonville%2C%20FL%2032210!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Paws and Claws Location Map"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary/60" />
            <span className="text-xl font-black" style={{ fontFamily: "'Nunito', sans-serif" }}>Paws and Claws</span>
          </div>

          <div className="text-center text-sm text-background/60">
            <p>&copy; {new Date().getFullYear()} Paws and Claws Grooming and Boarding of Jacksonville, INC.</p>
            <p className="mt-1">All rights reserved.</p>
          </div>

          <div className="flex gap-4 items-center">
            <a href="https://www.facebook.com/p/Paws-And-Claws-Grooming-And-Boarding-Of-Jacksonville-INC-100046897466786/" target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-primary transition-colors text-sm font-semibold">
              Facebook
            </a>
            <Link href="/admin" className="text-background/30 hover:text-background/60 transition-colors text-xs">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/book" component={BookingPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin" component={AdminLoginPage} />
      <Route component={LandingPage} />
    </Switch>
  );
}

export default App;
