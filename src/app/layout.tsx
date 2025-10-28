import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Speakify",
  description: "Convert your speech into text effortlessly",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col items-center justify-between bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all duration-300 font-sans">
        <Header />
        <main className="flex-1 w-full flex items-center justify-center p-6">
          <div className="w-full max-w-md flex flex-col items-center space-y-6">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
