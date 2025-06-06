import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ChefHat, ScanEye, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-16 md:py-24 bg-gradient-to-br from-background to-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <ChefHat size={64} className="mx-auto mb-6 text-primary" />
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 text-foreground">
              Snap, Cook, Enjoy!
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Got ingredients but no ideas? Upload a photo of what you have, and let our AI chef whip up delicious recipe suggestions for you.
            </p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Link href="/app/generator">Get Started</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-card">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-headline font-semibold text-center mb-12 text-foreground">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <ScanEye size={48} className="mb-4 text-accent" />
                <h4 className="text-xl font-headline font-semibold mb-2 text-foreground">1. Upload Image</h4>
                <p className="text-muted-foreground">
                  Snap a picture of your ingredients. Clear photos work best!
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <Sparkles size={48} className="mb-4 text-accent" />
                <h4 className="text-xl font-headline font-semibold mb-2 text-foreground">2. AI Analysis</h4>
                <p className="text-muted-foreground">
                  Our smart AI identifies your ingredients and culinary potential.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <Image src="https://placehold.co/200x200.png" alt="Recipe book icon" width={48} height={48} className="mb-4 rounded-full" data-ai-hint="recipe book" />
                <h4 className="text-xl font-headline font-semibold mb-2 text-foreground">3. Get Recipes</h4>
                <p className="text-muted-foreground">
                  Receive a list of tailored recipe suggestions to try out.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
           <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-headline font-semibold mb-6 text-foreground">Ready to Discover Your Next Meal?</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join Recipe Snap today and turn your random ingredients into culinary masterpieces.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
