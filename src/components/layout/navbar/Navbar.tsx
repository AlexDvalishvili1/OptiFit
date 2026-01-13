"use client";

import {Menu, X} from "lucide-react";
import {useState} from "react";
import Link from "next/link";
import Image from "next/image";

import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
                <div className="container mx-auto px-4">
                    <div className="flex h-[76px] items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-2"
                            onClick={(e) => {
                                // If already on the landing page, smooth-scroll to top
                                if (window.location.pathname === "/") {
                                    e.preventDefault();
                                    setMobileMenuOpen(false);
                                    window.scrollTo({top: 0, behavior: "smooth"});
                                } else {
                                    setMobileMenuOpen(false);
                                }
                            }}
                        >
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
                                    width={170}
                                    height={40}
                                    className="hidden md:block"
                                />
                            </div>
                        </Link>

                        <NavbarDesktop/>

                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6"/>
                            ) : (
                                <Menu className="h-6 w-6"/>
                            )}
                        </button>
                    </div>

                    <NavbarMobile
                        open={mobileMenuOpen}
                        onClose={() => setMobileMenuOpen(false)}
                    />
                </div>
            </nav>
        </>
    );
}