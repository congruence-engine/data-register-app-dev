'use client';

import "./globals.scss";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <header>
                    <div className="container">
                        <p>Header goes here</p>
                    </div>
                </header>
                <main>
                    <div className="container">
                        {children}
                    </div>
                </main>
                <footer>
                    <div className="container">
                        <p>Footer goes here</p>
                    </div>
                </footer>
            </body>
        </html>
    );
}
