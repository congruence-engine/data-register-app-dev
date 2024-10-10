'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import "./globals.scss";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Header/>
                <main>{children}</main>
                <Footer/>
            </body>
        </html>
    );
}
