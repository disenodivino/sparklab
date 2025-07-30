import Footer from "@/components/footer";
import Header from "@/components/header";
import Timeline from "@/components/timeline";

export default function TimelinePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24">
        <section id="timeline" className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Event Timeline</h1>
              <p className="text-lg text-foreground/80">
                Follow the 30-hour journey of creation and innovation.
              </p>
            </div>
            <Timeline />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
