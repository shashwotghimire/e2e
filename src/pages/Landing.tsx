import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Video, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };
  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  className="text-primary"
                >
                  <text
                    x="16"
                    y="22"
                    textAnchor="middle"
                    className="fill-current font-bold text-sm"
                  >
                    e2e
                  </text>
                </svg> */}
                <button
                  onClick={() => navigate("/landing")}
                  className="cursor-pointer"
                >
                  <span className="text-xl font-semibold">e2e</span>
                </button>
              </div>

              <nav className="hidden md:flex items-center gap-8">
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </nav>

              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={toggleDarkMode}>
                  {darkMode ? "☀️" : "🌙"}
                </Button>
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Log in
                </Button>
                <Button onClick={() => navigate("/register")}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
              Connect directly with{" "}
              <span className="text-muted-foreground">anyone, anywhere</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Simple, fast, and reliable one-on-one messaging and video calls.
              No complexity, just pure communication.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => navigate("/")}
                size="lg"
                className="text-lg px-8 py-6"
              >
                Start Chatting
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Everything you need for direct communication
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Simple, focused features for seamless one-on-one conversations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 bg-card border-border">
                <MessageCircle className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Direct Messaging</h3>
                <p className="text-muted-foreground">
                  Fast, reliable messaging for seamless conversations.
                </p>
              </Card>

              <Card className="p-8 bg-card border-border">
                <Video className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Video Calls</h3>
                <p className="text-muted-foreground">
                  Clear video calls for face-to-face conversations when text
                  isn't enough.
                </p>
              </Card>

              <Card className="p-8 bg-card border-border">
                <Zap className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-3">Real-time Sync</h3>
                <p className="text-muted-foreground">
                  Instant message delivery and synchronization across all your
                  devices.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-4xl font-bold mb-6">
              Ready to start connecting?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join others who choose simple, direct communication with e2e.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 px-6">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="text-primary"
                >
                  <text
                    x="12"
                    y="16"
                    textAnchor="middle"
                    className="fill-current font-bold text-xs"
                  >
                    e2e
                  </text>
                </svg>
                <span className="font-semibold">e2e</span>
              </div>

              <div className="flex gap-8 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Support
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
              © 2025 e2e. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
