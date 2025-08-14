"use client";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";

/*
 * Auto-hide header: hides on scroll down, shows on slight scroll up.
 * Adds shadow after passing threshold.
 */
export default function StickyHeaderClient() {
    const lastY = useRef(0);
    const [hidden, setHidden] = useState(false);
    const [elevated, setElevated] = useState(false);

    useEffect(() => {
        function onScroll() {
            const y = window.scrollY;
            const delta = y - lastY.current;
            setElevated(y > 8);
            // show if scrolling up at least 4px or near top
            if (y < 32) {
                setHidden(false);
            } else if (delta > 6) {
                // scrolling down
                setHidden(true);
            } else if (delta < -6) {
                setHidden(false);
            }
            lastY.current = y;
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div
            className={`fixed inset-x-0 top-0 z-40 transition-transform duration-300 will-change-transform ${hidden ? "-translate-y-full" : "translate-y-0"}`}
        >
            <div className={`transition-shadow bg-white ${elevated ? "shadow-md" : "shadow-none"}`}>
                <Header />
            </div>
        </div>
    );
}
