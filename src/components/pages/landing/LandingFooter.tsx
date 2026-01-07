import Link from "next/link";
import Image from "next/image";

export default function LandingFooter() {
    return (
        <footer className="py-12 border-t border-border">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-lg">
                            <Image
                                src="/logo_small.svg"
                                alt="Logo Small"
                                width={40}
                                height={40}
                                className="block md:hidden"
                            />
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={150}
                                height={40}
                                className="hidden md:block"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                        <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                    </div>

                    <p className="text-sm text-muted-foreground">© 2025 OptiFit. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}